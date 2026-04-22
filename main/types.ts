export type Lesson = {
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

export type WeekSchedule = Record<string, Lesson[]>;

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  group: string;
};

export type RegisterForm = {
  name: string;
  email: string;
  password: string;
  group: string;
};

export type LoginForm = {
  email: string;
  password: string;
};

export type LessonForm = {
  subject: string;
  teacher: string;
  day: string;
  time: string;
  room: string;
  type: string;
};

export type WeekItem = {
  key: string;
  start: Date;
  end: Date;
  label: string;
};
