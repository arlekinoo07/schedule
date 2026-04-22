import { days } from "../constants";
import { LessonForm } from "../types";

type LessonEditorProps = {
  currentUserExists: boolean;
  lessonForm: LessonForm;
  onChange: (field: keyof LessonForm, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function LessonEditor({ currentUserExists, lessonForm, onChange, onSubmit }: LessonEditorProps) {
  return (
    <div className="rounded-[26px] border border-[var(--card-border)] bg-white p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-sm text-[var(--muted)]">Редактор расписания</p>
        <h2 className="display-font mt-1 text-2xl font-bold text-[#26334d]">
          Добавить занятие на выбранную неделю
        </h2>
      </div>

      {currentUserExists ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Название дисциплины</label>
            <input
              value={lessonForm.subject}
              onChange={(event) => onChange("subject", event.target.value)}
              className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
              placeholder="Например, Физика"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Преподаватель</label>
            <input
              value={lessonForm.teacher}
              onChange={(event) => onChange("teacher", event.target.value)}
              className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
              placeholder="Например, Кузнецов А.И."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">День</label>
              <select
                value={lessonForm.day}
                onChange={(event) => onChange("day", event.target.value)}
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
                onChange={(event) => onChange("time", event.target.value)}
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
                onChange={(event) => onChange("room", event.target.value)}
                className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                placeholder="Ауд. 205"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Тип</label>
              <select
                value={lessonForm.type}
                onChange={(event) => onChange("type", event.target.value)}
                className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
              >
                <option value="Лекция">Лекция</option>
                <option value="Практика">Практика</option>
                <option value="Лабораторная">Лабораторная</option>
                <option value="Семинар">Семинар</option>
                <option value="Доп. занятие">Доп. занятие</option>
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
  );
}
