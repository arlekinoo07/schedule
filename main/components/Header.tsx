import { BookOpen } from "lucide-react";
import { User } from "../types";

type HeaderProps = {
  currentUser: User | null;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoutClick: () => void;
};

export function Header({ currentUser, onLoginClick, onRegisterClick, onLogoutClick }: HeaderProps) {
  return (
    <div className="border-b border-[#d7e3f1] bg-[#2f3b67] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <BookOpen className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <p className="display-font text-lg font-bold">Schedule</p>
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
              onClick={onLogoutClick}
              className="interactive-scale rounded-full border border-white/20 px-4 py-2 text-sm"
            >
              Выйти
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onLoginClick}
              className="interactive-scale rounded-full bg-white/10 px-4 py-2 text-sm"
            >
              Вход
            </button>
            <button
              type="button"
              onClick={onRegisterClick}
              className="interactive-scale rounded-full border border-white/20 px-4 py-2 text-sm"
            >
              Регистрация
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
