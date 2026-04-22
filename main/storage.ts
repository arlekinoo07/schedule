import { STORAGE_KEYS, getDefaultLessonsForWeek } from "./constants";
import { Lesson, User, WeekSchedule } from "./types";

export function readUsers(): User[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEYS.users);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export function writeUsers(users: User[]) {
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

export function readSchedulesMap(): Record<string, WeekSchedule> {
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

export function writeSchedulesMap(value: Record<string, WeekSchedule>) {
  window.localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(value));
}

export function getUserSchedule(scheduleMap: Record<string, WeekSchedule>, userId: string) {
  return scheduleMap[userId] ?? { "2026-04-20": getDefaultLessonsForWeek("2026-04-20") };
}
