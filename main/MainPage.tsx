"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEYS,
  days,
  emptyLessonForm,
  emptyLoginForm,
  emptyRegisterForm,
  getDefaultLessonsForWeek,
} from "./constants";
import { AuthPanel } from "./components/AuthPanel";
import { Header } from "./components/Header";
import { LessonEditor } from "./components/LessonEditor";
import { LessonList } from "./components/LessonList";
import { ProfileCard } from "./components/ProfileCard";
import { WeekSelector } from "./components/WeekSelector";
import { readSchedulesMap, readUsers, writeSchedulesMap, writeUsers } from "./storage";
import { getWeeks } from "./utils";
import { Lesson, LessonForm, LoginForm, RegisterForm, User, WeekSchedule } from "./types";

function normalizeTimeValue(value: string) {
  const trimmed = value.trim();
  const rangeMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);

  if (rangeMatch) {
    const [, startHour, startMinute, endHour, endMinute] = rangeMatch;
    return `${startHour.padStart(2, "0")}:${startMinute} - ${endHour.padStart(2, "0")}:${endMinute}`;
  }

  const singleMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);

  if (singleMatch) {
    const [, hour, minute] = singleMatch;
    return `${hour.padStart(2, "0")}:${minute}`;
  }

  return trimmed;
}

export function MainPage() {
  const weeks = useMemo(() => getWeeks(), []);
  const [isReady, setIsReady] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [scheduleByWeek, setScheduleByWeek] = useState<WeekSchedule>({});
  const [registerForm, setRegisterForm] = useState<RegisterForm>(emptyRegisterForm);
  const [loginForm, setLoginForm] = useState<LoginForm>(emptyLoginForm);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authMessage, setAuthMessage] = useState("");
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedWeekKey, setSelectedWeekKey] = useState(weeks[0]?.key ?? "2026-04-20");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedUsers = readUsers();
      const savedSchedules = readSchedulesMap();
      const sessionId = window.localStorage.getItem(STORAGE_KEYS.session);
      const sessionUser = savedUsers.find((user) => user.id === sessionId) ?? null;

      setUsers(savedUsers);
      setCurrentUser(sessionUser);

      if (sessionUser) {
        setScheduleByWeek(savedSchedules[sessionUser.id] ?? {});
      }

      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!isReady || !currentUser) return;

    const schedules = readSchedulesMap();
    schedules[currentUser.id] = scheduleByWeek;
    writeSchedulesMap(schedules);
  }, [scheduleByWeek, currentUser, isReady]);

  const lessons = scheduleByWeek[selectedWeekKey] ?? getDefaultLessonsForWeek(selectedWeekKey);

  const groupedLessons = useMemo(
    () =>
      days.map((day) => ({
        day,
        items: lessons.filter((lesson) => lesson.day === day).sort((a, b) => a.time.localeCompare(b.time)),
      })),
    [lessons],
  );

  const selectedLessons = groupedLessons.find((group) => group.day === selectedDay)?.items ?? [];
  const currentWeek = weeks.find((week) => week.key === selectedWeekKey) ?? weeks[0];
  const currentWeekIndex = weeks.findIndex((week) => week.key === selectedWeekKey);

  function updateCurrentWeekLessons(updater: (items: Lesson[]) => Lesson[]) {
    setScheduleByWeek((current) => {
      const currentLessons = current[selectedWeekKey] ?? getDefaultLessonsForWeek(selectedWeekKey);

      return {
        ...current,
        [selectedWeekKey]: updater(currentLessons),
      };
    });
  }

  function openAuthPanel(mode: "login" | "register") {
    setAuthMode(mode);

    window.requestAnimationFrame(() => {
      const element = document.getElementById("auth-panel");
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password.trim() || !registerForm.group.trim()) {
      setAuthMessage("Заполните все поля регистрации.");
      return;
    }

    if (users.some((user) => user.email === registerForm.email.trim().toLowerCase())) {
      setAuthMessage("Пользователь с такой почтой уже зарегистрирован.");
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: registerForm.name.trim(),
      email: registerForm.email.trim().toLowerCase(),
      password: registerForm.password.trim(),
      group: registerForm.group.trim(),
    };

    const nextUsers = [...users, newUser];
    const nextSchedule = {
      [weeks[0].key]: getDefaultLessonsForWeek(weeks[0].key),
      [weeks[1].key]: getDefaultLessonsForWeek(weeks[1].key),
    };
    const schedules = readSchedulesMap();
    schedules[newUser.id] = nextSchedule;

    setUsers(nextUsers);
    setCurrentUser(newUser);
    setScheduleByWeek(nextSchedule);
    setRegisterForm(emptyRegisterForm);
    setSelectedWeekKey(weeks[0].key);
    setSelectedDay(days[0]);
    setAuthMessage("Профиль создан.");

    writeUsers(nextUsers);
    writeSchedulesMap(schedules);
    window.localStorage.setItem(STORAGE_KEYS.session, newUser.id);
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = users.find(
      (item) => item.email === loginForm.email.trim().toLowerCase() && item.password === loginForm.password.trim(),
    );

    if (!user) {
      setAuthMessage("Неверная почта или пароль.");
      return;
    }

    const schedules = readSchedulesMap();

    setCurrentUser(user);
    setScheduleByWeek(schedules[user.id] ?? {});
    setLoginForm(emptyLoginForm);
    setSelectedWeekKey(weeks[0].key);
    setSelectedDay(days[0]);
    setAuthMessage(`Вы вошли как ${user.name}.`);
    window.localStorage.setItem(STORAGE_KEYS.session, user.id);
  }

  function handleLogout() {
    setCurrentUser(null);
    setScheduleByWeek({});
    setAuthMessage("Вы вышли из аккаунта.");
    window.localStorage.removeItem(STORAGE_KEYS.session);
  }

  function handleLessonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) return;
    if (!lessonForm.subject.trim() || !lessonForm.teacher.trim() || !lessonForm.time.trim()) return;

    updateCurrentWeekLessons((current) => [
      ...current,
      {
        id: Date.now(),
        subject: lessonForm.subject.trim(),
        teacher: lessonForm.teacher.trim(),
        day: lessonForm.day,
        time: normalizeTimeValue(lessonForm.time),
        room: lessonForm.room.trim() || "Аудитория не указана",
        type: lessonForm.type,
        grade: "",
        homework: "",
        completed: false,
      },
    ]);

    setSelectedDay(lessonForm.day);
    setLessonForm({ ...emptyLessonForm, day: lessonForm.day });
  }

  function removeLesson(id: number) {
    updateCurrentWeekLessons((current) => current.filter((lesson) => lesson.id !== id));
  }

  function updateLesson(id: number, patch: Partial<Lesson>) {
    updateCurrentWeekLessons((current) => current.map((lesson) => (lesson.id === id ? { ...lesson, ...patch } : lesson)));
  }

  function handleLoginChange(field: keyof LoginForm, value: string) {
    setLoginForm((current) => ({ ...current, [field]: value }));
  }

  function handleRegisterChange(field: keyof RegisterForm, value: string) {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  }

  function handleLessonFormChange(field: keyof LessonForm, value: string) {
    setLessonForm((current) => ({ ...current, [field]: value }));
  }

  if (!isReady) {
    return <main className="min-h-screen bg-[var(--background)]" />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Header
        currentUser={currentUser}
        onLoginClick={() => openAuthPanel("login")}
        onRegisterClick={() => openAuthPanel("register")}
        onLogoutClick={handleLogout}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
        <div className="mb-6 rounded-[26px] border border-[var(--card-border)] bg-white">
          <WeekSelector
            weeks={weeks}
            currentWeek={currentWeek}
            currentWeekIndex={currentWeekIndex}
            groupedLessons={groupedLessons}
            selectedDay={selectedDay}
            selectedWeekKey={selectedWeekKey}
            onWeekChange={setSelectedWeekKey}
            onDaySelect={setSelectedDay}
          />

          <div className="px-4 py-5 sm:px-6">
            <LessonList
              currentUserExists={Boolean(currentUser)}
              selectedDay={selectedDay}
              selectedLessons={selectedLessons}
              onRemoveLesson={removeLesson}
              onUpdateLesson={updateLesson}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {currentUser ? (
            <ProfileCard currentUser={currentUser} currentWeek={currentWeek} />
          ) : (
            <AuthPanel
              authMode={authMode}
              authMessage={authMessage}
              loginForm={loginForm}
              registerForm={registerForm}
              onModeChange={openAuthPanel}
              onLoginChange={handleLoginChange}
              onRegisterChange={handleRegisterChange}
              onLoginSubmit={handleLogin}
              onRegisterSubmit={handleRegister}
            />
          )}

          <LessonEditor
            currentUserExists={Boolean(currentUser)}
            lessonForm={lessonForm}
            onChange={handleLessonFormChange}
            onSubmit={handleLessonSubmit}
          />
        </div>
      </div>
    </main>
  );
}
