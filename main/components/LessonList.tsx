import { Lesson } from "../types";

type LessonListProps = {
  currentUserExists: boolean;
  selectedDay: string;
  selectedLessons: Lesson[];
  onRemoveLesson: (id: number) => void;
  onUpdateLesson: (id: number, patch: Partial<Lesson>) => void;
};

export function LessonList({
  currentUserExists,
  selectedDay,
  selectedLessons,
  onRemoveLesson,
  onUpdateLesson,
}: LessonListProps) {
  if (!currentUserExists) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--card-border)] bg-[#fafbfe] px-6 py-12 text-center">
        <p className="display-font text-2xl font-bold text-[#26334d]">
          Авторизуйтесь для просмотра расписания
        </p>
      </div>
    );
  }

  if (selectedLessons.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[var(--card-border)] bg-[#fafbfe] px-6 py-10 text-center">
        <p className="display-font text-2xl font-bold text-[#26334d]">
          На {selectedDay.toLowerCase()} занятий нет
        </p>
        <p className="mt-3 text-[15px] text-[var(--muted)]">
          Эта неделя независима от других. Можно добавить сюда свои пары отдельно.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedLessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="interactive-scale grid gap-5 rounded-[26px] border border-[var(--card-border)] bg-white px-5 py-5 sm:px-6 sm:py-6"
        >
          <div className="grid gap-5 md:grid-cols-[190px_1fr_auto]">
            <div className="rounded-[22px] bg-[#f6f8fc] px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-sm text-[var(--muted)]">{index + 1} занятие</p>
              <p className="mt-2 text-xl font-semibold text-[#26334d]">{lesson.time}</p>
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
                onClick={() => onRemoveLesson(lesson.id)}
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
                onChange={(event) => onUpdateLesson(lesson.id, { grade: event.target.value })}
                className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                placeholder="Например, 5"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Домашнее задание</label>
              <input
                value={lesson.homework}
                onChange={(event) => onUpdateLesson(lesson.id, { homework: event.target.value })}
                className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                placeholder="Например, выучить тему и решить 3 задачи"
              />
            </div>
            <label className="flex items-center gap-3 rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 text-sm font-medium text-[#26334d]">
              <input
                type="checkbox"
                checked={lesson.completed}
                onChange={(event) => onUpdateLesson(lesson.id, { completed: event.target.checked })}
                className="h-4 w-4"
              />
              Отметить как выполнено
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
