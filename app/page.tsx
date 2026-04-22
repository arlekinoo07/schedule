"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Lesson = {
  id: number;
  subject: string;
  teacher: string;
  day: string;
  time: string;
  room: string;
  type: string;
  grade: string;
  homework: string;
  completed: boolean;
};

type WeekSchedule = Record<string, Lesson[]>;

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  group: string;
};

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  group: string;
};

type LoginForm = {
  email: string;
  password: string;
};

type LessonForm = {
  subject: string;
  teacher: string;
  day: string;
  time: string;
  room: string;
  type: string;
};

const STORAGE_KEYS = {
  users: "studyflow-users",
  session: "studyflow-session",
  lessons: "studyflow-lessons",
};

const days = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

const dayShort: Record<string, string> = {
  Понедельник: "Пн",
  Вторник: "Вт",
  Среда: "Ср",
  Четверг: "Чт",
  Пятница: "Пт",
  Суббота: "Сб",
};

const emptyLessonForm: LessonForm = {
  subject: "",
  teacher: "",
  day: "Понедельник",
  time: "",
  room: "",
  type: "Лекция",
};

const emptyRegisterForm: RegisterForm = {
  name: "",
  email: "",
  password: "",
  group: "",
};

const emptyLoginForm: LoginForm = {
  email: "",
  password: "",
};

function createLesson(
  id: number,
  subject: string,
  teacher: string,
  day: string,
  time: string,
  room: string,
  type: string,
): Lesson {
  return {
    id,
    subject,
    teacher,
    day,
    time,
    room,
    type,
    grade: "",
    homework: "",
    completed: false,
  };
}

function getDefaultLessonsForWeek(weekKey: string): Lesson[] {
  if (weekKey === "2026-04-20") {
    return [
      createLesson(1, "Высшая математика", "Иванова Т.В.", "Понедельник", "08:30 - 10:00", "Ауд. 312", "Лекция"),
      createLesson(2, "Программирование", "Смирнов А.А.", "Понедельник", "10:15 - 11:45", "Ауд. 210", "Практика"),
      createLesson(3, "Английский язык", "Волкова Е.Н.", "Вторник", "09:00 - 10:30", "Ауд. 118", "Семинар"),
      createLesson(4, "Базы данных", "Егорова Н.С.", "Среда", "11:55 - 13:25", "Лаб. 105", "Лабораторная"),
      createLesson(5, "Компьютерные сети", "Петров И.И.", "Четверг", "13:40 - 15:10", "Ауд. 118", "Лекция"),
    ];
  }

  if (weekKey === "2026-04-27") {
    return [
      createLesson(6, "Теория алгоритмов", "Зимина Л.А.", "Понедельник", "09:00 - 10:30", "Ауд. 204", "Лекция"),
      createLesson(7, "Web-разработка", "Соколов Д.М.", "Среда", "10:45 - 12:15", "Лаб. 220", "Практика"),
      createLesson(8, "Физика", "Лебедев И.П.", "Пятница", "12:30 - 14:00", "Ауд. 117", "Лекция"),
    ];
  }

  return [];
}

function formatWeekLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getWeeks() {
  const base = new Date("2026-04-20T00:00:00");

  return Array.from({ length: 8 }, (_, index) => {
    const start = addDays(base, index * 7);
    const end = addDays(start, 7);

    return {
      key: toDateKey(start),
      start,
      end,
      label: formatWeekLabel(start, end),
    };
  });
}

function readUsers(): User[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEYS.users);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]) {
  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function normalizeLesson(raw: Lesson): Lesson {
  return {
    ...raw,
    grade: raw.grade ?? "",
    homework: raw.homework ?? "",
    completed: raw.completed ?? false,
  };
}

function readSchedulesMap(): Record<string, WeekSchedule> {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(STORAGE_KEYS.lessons);

  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, Lesson[] | WeekSchedule>;

    return Object.fromEntries(
      Object.entries(parsed).map(([userId, value]) => {
        if (Array.isArray(value)) {
          return [userId, { "2026-04-20": value.map(normalizeLesson) }];
        }

        const normalizedWeeks = Object.fromEntries(
          Object.entries(value).map(([weekKey, lessons]) => [
            weekKey,
            (lessons as Lesson[]).map(normalizeLesson),
          ]),
        );

        return [userId, normalizedWeeks];
      }),
    );
  } catch {
    return {};
  }
}

function writeSchedulesMap(value: Record<string, WeekSchedule>) {
  window.localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(value));
}

export default function Home() {
  const weeks = useMemo(() => getWeeks(), []);
  const [isReady, setIsReady] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [scheduleByWeek, setScheduleByWeek] = useState<WeekSchedule>({});
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
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
        const userSchedule = savedSchedules[sessionUser.id] ?? {};
        setScheduleByWeek(userSchedule);
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
        items: lessons
          .filter((lesson) => lesson.day === day)
          .sort((a, b) => a.time.localeCompare(b.time)),
      })),
    [lessons],
  );

  const selectedLessons =
    groupedLessons.find((group) => group.day === selectedDay)?.items ?? [];

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

    if (
      !registerForm.name.trim() ||
      !registerForm.email.trim() ||
      !registerForm.password.trim() ||
      !registerForm.group.trim()
    ) {
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
      (item) =>
        item.email === loginForm.email.trim().toLowerCase() &&
        item.password === loginForm.password.trim(),
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

    if (
      !lessonForm.subject.trim() ||
      !lessonForm.teacher.trim() ||
      !lessonForm.time.trim()
    ) {
      return;
    }

    updateCurrentWeekLessons((current) => [
      ...current,
      {
        id: Date.now(),
        subject: lessonForm.subject.trim(),
        teacher: lessonForm.teacher.trim(),
        day: lessonForm.day,
        time: lessonForm.time.trim(),
        room: lessonForm.room.trim() || "Аудитория не указана",
        type: lessonForm.type,
        grade: "",
        homework: "",
        completed: false,
      },
    ]);

    setSelectedDay(lessonForm.day);
    setLessonForm({
      ...emptyLessonForm,
      day: lessonForm.day,
    });
  }

  function removeLesson(id: number) {
    updateCurrentWeekLessons((current) => current.filter((lesson) => lesson.id !== id));
  }

  function updateLesson(id: number, patch: Partial<Lesson>) {
    updateCurrentWeekLessons((current) =>
      current.map((lesson) => (lesson.id === id ? { ...lesson, ...patch } : lesson)),
    );
  }

  if (!isReady) {
    return <main className="min-h-screen bg-[var(--background)]" />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[#d7e3f1] bg-[#2f3b67] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <div className="display-font text-3xl font-bold">М</div>
            <div>
              <p className="display-font text-lg font-bold">StudyFlow</p>
              <p className="text-sm text-white/70">Расписание занятий</p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm">
                {currentUser.name} • {currentUser.group}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="interactive-scale rounded-full border border-white/20 px-4 py-2 text-sm"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => openAuthPanel("login")}
                className="interactive-scale rounded-full bg-white/10 px-4 py-2 text-sm"
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => openAuthPanel("register")}
                className="interactive-scale rounded-full border border-white/20 px-4 py-2 text-sm"
              >
                Регистрация
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
        <div className="mb-6 rounded-[26px] border border-[var(--card-border)] bg-white">
          <div className="flex flex-col gap-4 border-b border-[var(--card-border)] px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">Учебный календарь</p>
              <h1 className="display-font mt-1 text-2xl font-bold text-[#26334d]">
                Расписание по неделям
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => currentWeekIndex > 0 && setSelectedWeekKey(weeks[currentWeekIndex - 1].key)}
                className="interactive-scale rounded-full border border-[var(--card-border)] px-4 py-2 text-sm text-[#55627a]"
              >
                Назад
              </button>
              <select
                value={selectedWeekKey}
                onChange={(event) => setSelectedWeekKey(event.target.value)}
                className="rounded-full border border-[var(--card-border)] bg-[#f7f9fc] px-4 py-2 text-sm text-[#26334d]"
              >
                {weeks.map((week) => (
                  <option key={week.key} value={week.key}>
                    {week.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  currentWeekIndex < weeks.length - 1 &&
                  setSelectedWeekKey(weeks[currentWeekIndex + 1].key)
                }
                className="interactive-scale rounded-full border border-[var(--card-border)] px-4 py-2 text-sm text-[#55627a]"
              >
                Вперед
              </button>
            </div>
          </div>

          <div className="border-b border-[var(--card-border)] px-4 py-4 sm:px-6">
            <div className="mb-3 rounded-full bg-[#f4f7ff] px-4 py-3 text-sm font-medium text-[#50639e]">
              {currentWeek?.label}
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-6 md:overflow-visible md:px-0 md:pb-0">
              {days.map((day) => {
                const count =
                  groupedLessons.find((group) => group.day === day)?.items.length ?? 0;
                const active = selectedDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`interactive-scale min-w-[145px] flex-none rounded-2xl border px-5 py-5 text-left transition-colors md:min-w-0 ${
                      active
                        ? "border-[#9eadff] bg-[#f3f5ff] text-[#3e4b87]"
                        : "border-transparent bg-[#f7f8fc] text-[#5e6b80]"
                    }`}
                  >
                    <p className="display-font text-xl font-bold">{dayShort[day]}</p>
                    <p className="mt-1 text-sm font-medium">{day}</p>
                    <p className="mt-3 text-sm">{count} занятий</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6">
            {!currentUser ? (
              <div className="rounded-[24px] border border-dashed border-[var(--card-border)] bg-[#fafbfe] px-6 py-12 text-center">
                <p className="display-font text-2xl font-bold text-[#26334d]">
                  Авторизуйтесь для просмотра расписания
                </p>
              </div>
            ) : selectedLessons.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[var(--card-border)] bg-[#fafbfe] px-6 py-10 text-center">
                <p className="display-font text-2xl font-bold text-[#26334d]">
                  На {selectedDay.toLowerCase()} занятий нет
                </p>
                <p className="mt-3 text-[15px] text-[var(--muted)]">
                  Эта неделя независима от других. Можно добавить сюда свои пары отдельно.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="interactive-scale grid gap-5 rounded-[26px] border border-[var(--card-border)] bg-white px-5 py-5 sm:px-6 sm:py-6"
                  >
                    <div className="grid gap-5 md:grid-cols-[190px_1fr_auto]">
                      <div className="rounded-[22px] bg-[#f6f8fc] px-4 py-4 sm:px-5 sm:py-5">
                        <p className="text-sm text-[var(--muted)]">{index + 1} занятие</p>
                        <p className="mt-2 text-xl font-semibold text-[#26334d]">
                          {lesson.time}
                        </p>
                        <p className="mt-2 text-sm text-[var(--muted)]">{lesson.room}</p>
                      </div>

                      <div className="py-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-semibold text-[#5166a4]">
                            {lesson.type}
                          </span>
                          {lesson.grade ? (
                            <span className="rounded-full bg-[#f9f2d9] px-3 py-1 text-xs font-semibold text-[#7b651f]">
                              Оценка: {lesson.grade}
                            </span>
                          ) : null}
                          {lesson.completed ? (
                            <span className="rounded-full bg-[#e8f8ee] px-3 py-1 text-xs font-semibold text-[#2f7a4f]">
                              Выполнено
                            </span>
                          ) : null}
                        </div>
                        <h2 className="text-2xl font-semibold text-[#283452] sm:text-[30px] sm:leading-[1.2]">
                          {lesson.subject}
                        </h2>
                        <p className="mt-3 text-[15px] text-[var(--muted)]">
                          Преподаватель: {lesson.teacher}
                        </p>
                      </div>

                      <div className="flex items-start md:justify-end">
                        <button
                          type="button"
                          onClick={() => removeLesson(lesson.id)}
                          className="interactive-scale rounded-full border border-[#e3c4cb] bg-[#fff7f8] px-4 py-2 text-sm font-medium text-[#a85163]"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[160px_1fr_180px]">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Оценка</label>
                        <input
                          value={lesson.grade}
                          onChange={(event) => updateLesson(lesson.id, { grade: event.target.value })}
                          className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                          placeholder="Например, 5"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Домашнее задание</label>
                        <input
                          value={lesson.homework}
                          onChange={(event) =>
                            updateLesson(lesson.id, { homework: event.target.value })
                          }
                          className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                          placeholder="Например, выучить тему и решить 3 задачи"
                        />
                      </div>
                      <label className="flex items-center gap-3 rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 text-sm font-medium text-[#26334d]">
                        <input
                          type="checkbox"
                          checked={lesson.completed}
                          onChange={(event) =>
                            updateLesson(lesson.id, { completed: event.target.checked })
                          }
                          className="h-4 w-4"
                        />
                        Отметить как выполнено
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div
            id="auth-panel"
            className="rounded-[26px] border border-[var(--card-border)] bg-white p-5 sm:p-6"
          >
            {currentUser ? (
              <>
                <div className="mb-5">
                  <p className="text-sm text-[var(--muted)]">Профиль</p>
                  <h2 className="display-font mt-1 text-2xl font-bold text-[#26334d]">
                    {currentUser.name}
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[20px] bg-[#f7f9fc] px-4 py-4">
                    <p className="text-sm text-[var(--muted)]">Почта</p>
                    <p className="mt-1 font-medium text-[#26334d]">{currentUser.email}</p>
                  </div>
                  <div className="rounded-[20px] bg-[#f7f9fc] px-4 py-4">
                    <p className="text-sm text-[var(--muted)]">Группа</p>
                    <p className="mt-1 font-medium text-[#26334d]">{currentUser.group}</p>
                  </div>
                  <div className="rounded-[20px] bg-[#f7f9fc] px-4 py-4">
                    <p className="text-sm text-[var(--muted)]">Выбранная неделя</p>
                    <p className="mt-1 font-medium text-[#26334d]">{currentWeek?.label}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => openAuthPanel("login")}
                    className={`interactive-scale rounded-full px-4 py-2 text-sm font-medium ${
                      authMode === "login"
                        ? "bg-[#5568f1] text-white"
                        : "bg-[#f4f6fb] text-[#55627a]"
                    }`}
                  >
                    Вход
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthPanel("register")}
                    className={`interactive-scale rounded-full px-4 py-2 text-sm font-medium ${
                      authMode === "register"
                        ? "bg-[#5568f1] text-white"
                        : "bg-[#f4f6fb] text-[#55627a]"
                    }`}
                  >
                    Регистрация
                  </button>
                </div>

                {authMessage ? (
                  <div className="mb-4 rounded-[18px] bg-[#f5f8ff] px-4 py-3 text-sm text-[#4961a1]">
                    {authMessage}
                  </div>
                ) : null}

                {authMode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Почта</label>
                      <input
                        value={loginForm.email}
                        onChange={(event) =>
                          setLoginForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                        placeholder="student@mail.ru"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Пароль</label>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(event) =>
                          setLoginForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                        placeholder="Введите пароль"
                      />
                    </div>
                    <button
                      type="submit"
                      className="interactive-scale w-full rounded-[18px] bg-[#5568f1] px-5 py-3 font-medium text-white"
                    >
                      Войти
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Имя</label>
                      <input
                        value={registerForm.name}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                        placeholder="Иван Петров"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Почта</label>
                      <input
                        value={registerForm.email}
                        onChange={(event) =>
                          setRegisterForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                        placeholder="student@mail.ru"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Пароль</label>
                        <input
                          type="password"
                          value={registerForm.password}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                          placeholder="Пароль"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Группа</label>
                        <input
                          value={registerForm.group}
                          onChange={(event) =>
                            setRegisterForm((current) => ({
                              ...current,
                              group: event.target.value,
                            }))
                          }
                          className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                          placeholder="ИВТ-21"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="interactive-scale w-full rounded-[18px] bg-[#5568f1] px-5 py-3 font-medium text-white"
                    >
                      Зарегистрироваться
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <div className="rounded-[26px] border border-[var(--card-border)] bg-white p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-sm text-[var(--muted)]">Редактор расписания</p>
              <h2 className="display-font mt-1 text-2xl font-bold text-[#26334d]">
                Добавить занятие на выбранную неделю
              </h2>
            </div>

            {currentUser ? (
              <form onSubmit={handleLessonSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Название дисциплины
                  </label>
                  <input
                    value={lessonForm.subject}
                    onChange={(event) =>
                      setLessonForm((current) => ({
                        ...current,
                        subject: event.target.value,
                      }))
                    }
                    className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                    placeholder="Например, Физика"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Преподаватель</label>
                  <input
                    value={lessonForm.teacher}
                    onChange={(event) =>
                      setLessonForm((current) => ({
                        ...current,
                        teacher: event.target.value,
                      }))
                    }
                    className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                    placeholder="Например, Кузнецов А.И."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">День</label>
                    <select
                      value={lessonForm.day}
                      onChange={(event) =>
                        setLessonForm((current) => ({
                          ...current,
                          day: event.target.value,
                        }))
                      }
                      className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                    >
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Время</label>
                    <input
                      value={lessonForm.time}
                      onChange={(event) =>
                        setLessonForm((current) => ({
                          ...current,
                          time: event.target.value,
                        }))
                      }
                      className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                      placeholder="09:00 - 10:30"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Аудитория</label>
                    <input
                      value={lessonForm.room}
                      onChange={(event) =>
                        setLessonForm((current) => ({
                          ...current,
                          room: event.target.value,
                        }))
                      }
                      className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                      placeholder="Ауд. 205"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Тип</label>
                    <select
                      value={lessonForm.type}
                      onChange={(event) =>
                        setLessonForm((current) => ({
                          ...current,
                          type: event.target.value,
                        }))
                      }
                      className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                    >
                      <option value="Лекция">Лекция</option>
                      <option value="Практика">Практика</option>
                      <option value="Лабораторная">Лабораторная</option>
                      <option value="Семинар">Семинар</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="interactive-scale w-full rounded-[18px] bg-[#5568f1] px-5 py-3 font-medium text-white"
                >
                  Добавить занятие
                </button>
              </form>
            ) : (
              <div className="rounded-[20px] bg-[#f7f9fc] px-5 py-10 text-center text-[15px] leading-7 text-[var(--muted)]">
                Форма добавления станет доступна после входа в аккаунт.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
