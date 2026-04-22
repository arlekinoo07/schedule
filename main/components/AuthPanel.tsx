import { LoginForm, RegisterForm } from "../types";

type AuthPanelProps = {
  authMode: "login" | "register";
  authMessage: string;
  loginForm: LoginForm;
  registerForm: RegisterForm;
  onModeChange: (mode: "login" | "register") => void;
  onLoginChange: (field: keyof LoginForm, value: string) => void;
  onRegisterChange: (field: keyof RegisterForm, value: string) => void;
  onLoginSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onRegisterSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AuthPanel({
  authMode,
  authMessage,
  loginForm,
  registerForm,
  onModeChange,
  onLoginChange,
  onRegisterChange,
  onLoginSubmit,
  onRegisterSubmit,
}: AuthPanelProps) {
  return (
    <div id="auth-panel" className="rounded-[26px] border border-[var(--card-border)] bg-white p-5 sm:p-6">
      <div className="mb-5 flex gap-3">
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className={`interactive-scale rounded-full px-4 py-2 text-sm font-medium ${
            authMode === "login" ? "bg-[#5568f1] text-white" : "bg-[#f4f6fb] text-[#55627a]"
          }`}
        >
          Вход
        </button>
        <button
          type="button"
          onClick={() => onModeChange("register")}
          className={`interactive-scale rounded-full px-4 py-2 text-sm font-medium ${
            authMode === "register" ? "bg-[#5568f1] text-white" : "bg-[#f4f6fb] text-[#55627a]"
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
        <form onSubmit={onLoginSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Почта</label>
            <input
              value={loginForm.email}
              onChange={(event) => onLoginChange("email", event.target.value)}
              className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
              placeholder="student@mail.ru"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Пароль</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => onLoginChange("password", event.target.value)}
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
        <form onSubmit={onRegisterSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Имя</label>
            <input
              value={registerForm.name}
              onChange={(event) => onRegisterChange("name", event.target.value)}
              className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
              placeholder="Иван Петров"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Почта</label>
            <input
              value={registerForm.email}
              onChange={(event) => onRegisterChange("email", event.target.value)}
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
                onChange={(event) => onRegisterChange("password", event.target.value)}
                className="w-full rounded-[18px] border border-[var(--card-border)] bg-[#f8faff] px-4 py-3 outline-none"
                placeholder="Пароль"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Группа</label>
              <input
                value={registerForm.group}
                onChange={(event) => onRegisterChange("group", event.target.value)}
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
    </div>
  );
}
