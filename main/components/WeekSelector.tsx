import { dayShort, days } from "../constants";
import { WeekItem } from "../types";

type GroupedItem = { day: string; items: unknown[] };

type WeekSelectorProps = {
  weeks: WeekItem[];
  currentWeek: WeekItem;
  currentWeekIndex: number;
  groupedLessons: GroupedItem[];
  selectedDay: string;
  selectedWeekKey: string;
  onWeekChange: (value: string) => void;
  onDaySelect: (day: string) => void;
};

export function WeekSelector({
  weeks,
  currentWeek,
  currentWeekIndex,
  groupedLessons,
  selectedDay,
  selectedWeekKey,
  onWeekChange,
  onDaySelect,
}: WeekSelectorProps) {
  return (
    <>
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
            onClick={() => currentWeekIndex > 0 && onWeekChange(weeks[currentWeekIndex - 1].key)}
            className="interactive-scale rounded-full border border-[var(--card-border)] px-4 py-2 text-sm text-[#55627a]"
          >
            Назад
          </button>
          <select
            value={selectedWeekKey}
            onChange={(event) => onWeekChange(event.target.value)}
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
            onClick={() => currentWeekIndex < weeks.length - 1 && onWeekChange(weeks[currentWeekIndex + 1].key)}
            className="interactive-scale rounded-full border border-[var(--card-border)] px-4 py-2 text-sm text-[#55627a]"
          >
            Вперед
          </button>
        </div>
      </div>

      <div className="border-b border-[var(--card-border)] px-4 py-4 sm:px-6">
        <div className="mb-3 rounded-full bg-[#f4f7ff] px-4 py-3 text-sm font-medium text-[#50639e]">
          {currentWeek.label}
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-6 md:overflow-visible md:px-0 md:pb-0">
          {days.map((day) => {
            const count = groupedLessons.find((group) => group.day === day)?.items.length ?? 0;
            const active = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => onDaySelect(day)}
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
    </>
  );
}
