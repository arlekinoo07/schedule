import { Lesson, LessonForm, LoginForm, RegisterForm } from "./types";

export const STORAGE_KEYS = {
  users: "studyflow-users",
  session: "studyflow-session",
  lessons: "studyflow-lessons",
};

export const days = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export const dayShort: Record<string, string> = {
  Понедельник: "Пн",
  Вторник: "Вт",
  Среда: "Ср",
  Четверг: "Чт",
  Пятница: "Пт",
  Суббота: "Сб",
};

export const emptyLessonForm: LessonForm = {
  subject: "",
  teacher: "",
  day: "Понедельник",
  time: "",
  room: "",
  type: "Лекция",
};

export const emptyRegisterForm: RegisterForm = {
  name: "",
  email: "",
  password: "",
  group: "",
};

export const emptyLoginForm: LoginForm = {
  email: "",
  password: "",
};

export function createLesson(
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

export function getDefaultLessonsForWeek(weekKey: string): Lesson[] {
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
