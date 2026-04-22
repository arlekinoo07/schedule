import { WeekItem } from "./types";

export function formatWeekLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function getWeeks(): WeekItem[] {
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
