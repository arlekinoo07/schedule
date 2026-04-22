import { User, WeekItem } from "../types";

type ProfileCardProps = {
  currentUser: User;
  currentWeek: WeekItem;
};

export function ProfileCard({ currentUser, currentWeek }: ProfileCardProps) {
  return (
    <div className="rounded-[26px] border border-[var(--card-border)] bg-white p-5 sm:p-6">
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
          <p className="mt-1 font-medium text-[#26334d]">{currentWeek.label}</p>
        </div>
      </div>
    </div>
  );
}
