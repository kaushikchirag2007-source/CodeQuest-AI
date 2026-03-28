import React, { useEffect, useState } from 'react';

const profile = {
  name: 'Avery Chen',
  level: 'Level 12',
  xp: '2,480 XP',
  avatar: 'AC'
};

const lessonsInProgress = [
  { title: 'Spanish Conversation', progress: 72 },
  { title: 'JavaScript Basics', progress: 48 },
  { title: 'French Pronunciation', progress: 21 }
];

const completedLessons = [
  'Python Syntax Foundations',
  'English Phrasal Verbs',
  'HTML Essentials'
];

const learningPaths = [
  {
    id: 'spoken',
    title: 'Spoken Languages',
    description: 'Practice real-world vocabulary, listening, and fluency.',
    icon: GlobeIcon,
    accent: 'from-sky-500/18 via-sky-500/8 to-transparent',
    border: 'border-sky-200/80 dark:border-sky-400/20',
    iconWrap: 'bg-sky-500 text-white shadow-[0_12px_24px_rgba(14,165,233,0.28)]'
  },
  {
    id: 'coding',
    title: 'Coding Languages',
    description: 'Build syntax confidence with guided projects and practice.',
    icon: TerminalIcon,
    accent: 'from-emerald-500/18 via-emerald-500/8 to-transparent',
    border: 'border-emerald-200/80 dark:border-emerald-400/20',
    iconWrap: 'bg-emerald-500 text-white shadow-[0_12px_24px_rgba(16,185,129,0.28)]'
  }
];

function App() {
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          isDark={isDark}
          onClose={() => setIsSidebarOpen(false)}
          onToggleTheme={() => setIsDark((value) => !value)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            profile={profile}
            isDark={isDark}
            onMenuClick={() => setIsSidebarOpen(true)}
            onToggleTheme={() => setIsDark((value) => !value)}
            onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
          />

          <main className="flex flex-1 items-center justify-center px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-10">
            <section className="w-full max-w-5xl">
              <div className="glass-panel soft-shadow overflow-hidden rounded-[2rem]">
                <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
                  <div className="flex flex-col justify-center">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-brand-700 uppercase dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-100">
                      Learn Better
                    </span>
                    <h1 className="mt-5 max-w-xl text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl dark:text-white">
                      What do you want to learn today?
                    </h1>
                    <p className="mt-4 max-w-lg text-base leading-7 text-ink-500 dark:text-slate-300">
                      Pick a path and jump straight into a focused, distraction-free learning session.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      {learningPaths.map((path) => (
                        <LearningCard key={path.id} path={path} />
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-x-10 top-0 h-28 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-400/10" />
                    <div className="glass-panel soft-shadow relative rounded-[1.75rem] p-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold tracking-[0.2em] text-ink-400 uppercase dark:text-slate-400">
                            Profile
                          </p>
                          <h2 className="mt-2 text-lg font-bold text-ink-900 dark:text-white">
                            Daily momentum
                          </h2>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-sm font-bold text-white dark:bg-white dark:text-ink-900">
                          {profile.avatar}
                        </div>
                      </div>

                      <div className="mt-5 rounded-3xl bg-ink-900 px-5 py-4 text-white dark:bg-white dark:text-ink-900">
                        <p className="text-sm text-white/70 dark:text-ink-500">{profile.name}</p>
                        <div className="mt-2 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-2xl font-extrabold">{profile.level}</p>
                            <p className="text-sm text-white/70 dark:text-ink-500">{profile.xp}</p>
                          </div>
                          <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold dark:bg-ink-900/8">
                            5 day streak
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <section>
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
                              Lessons In Progress
                            </h3>
                            <span className="text-xs text-ink-400 dark:text-slate-400">03</span>
                          </div>
                          <div className="space-y-3">
                            {lessonsInProgress.map((lesson) => (
                              <div key={lesson.title} className="rounded-2xl border border-ink-200/80 bg-ink-50 p-3 dark:border-white/8 dark:bg-white/5">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <span className="text-sm font-medium text-ink-700 dark:text-slate-200">
                                    {lesson.title}
                                  </span>
                                  <span className="text-xs text-ink-400 dark:text-slate-400">
                                    {lesson.progress}%
                                  </span>
                                </div>
                                <div className="h-2 rounded-full bg-ink-200 dark:bg-white/10">
                                  <div
                                    className="h-2 rounded-full bg-brand-500 transition-all duration-500"
                                    style={{ width: `${lesson.progress}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section>
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-ink-900 dark:text-white">
                              Completed Lessons
                            </h3>
                            <span className="text-xs text-ink-400 dark:text-slate-400">03</span>
                          </div>
                          <div className="space-y-2">
                            {completedLessons.map((lesson) => (
                              <div
                                key={lesson}
                                className="flex items-center gap-3 rounded-2xl border border-ink-200/80 bg-white px-3 py-3 dark:border-white/8 dark:bg-white/5"
                              >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300">
                                  <CheckIcon />
                                </span>
                                <span className="text-sm text-ink-700 dark:text-slate-200">{lesson}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function Header({ profile, isDark, onMenuClick, onToggleTheme, onToggleSidebar }) {
  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
      <div className="glass-panel soft-shadow flex items-center justify-between rounded-[1.5rem] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 lg:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            aria-label="Collapse sidebar"
          >
            <PanelIcon />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-white dark:bg-white dark:text-ink-900">
              <SparkIcon />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-ink-900 dark:text-white">
                LinguaCode
              </p>
              <p className="text-sm text-ink-400 dark:text-slate-400">
                Spoken + coding fluency
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            aria-label="Settings"
          >
            <SettingsIcon />
          </button>
          <button
            type="button"
            className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-3 py-2 transition hover:-translate-y-0.5 hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
            aria-label="User profile"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500 text-sm font-bold text-white">
              {profile.avatar}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-ink-900 dark:text-white">{profile.name}</p>
              <p className="text-xs text-ink-400 dark:text-slate-400">{profile.level}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ isOpen, isCollapsed, isDark, onClose, onToggleTheme }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-ink-900/45 backdrop-blur-sm transition lg:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`glass-panel soft-shadow fixed inset-y-4 left-4 z-40 flex w-[86vw] max-w-[320px] flex-col rounded-[2rem] px-4 py-5 transition duration-300 lg:sticky lg:inset-auto lg:m-4 lg:h-[calc(100vh-2rem)] lg:w-auto lg:max-w-none ${
          isOpen ? 'translate-x-0' : '-translate-x-[115%] lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[112px]' : 'lg:w-[320px]'}`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-white dark:bg-white dark:text-ink-900">
              <SparkIcon />
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-base font-extrabold text-ink-900 dark:text-white">LinguaCode</p>
                <p className="text-sm text-ink-400 dark:text-slate-400">Your learning home</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-700 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={`mt-6 rounded-[1.75rem] bg-ink-900 px-4 py-4 text-white dark:bg-white dark:text-ink-900 ${isCollapsed ? 'lg:px-3' : ''}`}>
          <div className={`flex ${isCollapsed ? 'lg:flex-col lg:items-center' : 'items-center'} gap-3`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-sm font-bold dark:bg-ink-900/8">
              {profile.avatar}
            </div>
            {!isCollapsed && (
              <div>
                <p className="font-semibold">{profile.name}</p>
                <p className="text-sm text-white/65 dark:text-ink-500">{profile.level}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <p className="mt-4 rounded-2xl bg-white/10 px-3 py-2 text-sm dark:bg-ink-900/6">
              {profile.xp}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-5 overflow-y-auto pr-1">
          <SidebarSection title="Lessons In Progress" collapsed={isCollapsed}>
            {lessonsInProgress.map((lesson) => (
              <div key={lesson.title} className="rounded-2xl border border-ink-200/80 bg-white p-3 dark:border-white/8 dark:bg-white/5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink-700 dark:text-slate-200">
                    {lesson.title}
                  </span>
                  <span className="text-xs text-ink-400 dark:text-slate-400">{lesson.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-ink-200 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-brand-500" style={{ width: `${lesson.progress}%` }} />
                </div>
              </div>
            ))}
          </SidebarSection>

          <SidebarSection title="Completed Lessons" collapsed={isCollapsed}>
            <div className="space-y-2">
              {completedLessons.map((lesson) => (
                <div key={lesson} className="flex items-center gap-3 rounded-2xl border border-ink-200/80 bg-white px-3 py-3 dark:border-white/8 dark:bg-white/5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300">
                    <CheckIcon />
                  </span>
                  <span className="text-sm text-ink-700 dark:text-slate-200">{lesson}</span>
                </div>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="Preferences" collapsed={isCollapsed}>
            <div className="space-y-2">
              <SidebarAction icon={<SettingsIcon />} label="Settings" collapsed={isCollapsed} />
              <SidebarAction
                icon={isDark ? <SunIcon /> : <MoonIcon />}
                label="Theme switcher"
                collapsed={isCollapsed}
                onClick={onToggleTheme}
              />
            </div>
          </SidebarSection>
        </div>
      </aside>
    </>
  );
}

function SidebarSection({ title, collapsed, children }) {
  return (
    <section>
      {!collapsed && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.18em] text-ink-400 uppercase dark:text-slate-400">
            {title}
          </h2>
        </div>
      )}
      {collapsed ? (
        <div className="flex justify-center">
          <div className="h-2 w-2 rounded-full bg-brand-500" />
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function SidebarAction({ icon, label, collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-ink-200/80 bg-white px-3 py-3 text-left text-sm font-medium text-ink-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-white/8 dark:bg-white/5 dark:text-slate-200"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-slate-100">
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

function LearningCard({ path }) {
  const Icon = path.icon;

  return (
    <button
      type="button"
      className={`group relative overflow-hidden rounded-[1.75rem] border ${path.border} bg-white p-5 text-left transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_rgba(15,23,42,0.12)] dark:bg-white/5 dark:hover:shadow-[0_24px_50px_rgba(2,8,23,0.42)]`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${path.accent} opacity-90`} />
      <div className="relative">
        <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${path.iconWrap}`}>
          <Icon />
        </div>
        <h3 className="text-xl font-bold text-ink-900 dark:text-white">{path.title}</h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-ink-500 dark:text-slate-300">
          {path.description}
        </p>
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-ink-700 transition group-hover:translate-x-1 dark:text-slate-200">
          Start learning
          <ArrowIcon />
        </div>
      </div>
    </button>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M12 2 9.6 8.6 3 11l6.6 2.4L12 20l2.4-6.6L21 11l-6.6-2.4z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function PanelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" d="M5 5h14v14H5zM10 5v14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.36 6.36-2.12-2.12M7.76 7.76 5.64 5.64m12.72 0-2.12 2.12M7.76 16.24l-2.12 2.12" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5m15.72-6.78-1.56 1.56M7.34 16.66l-1.56 1.56m12.44 0-1.56-1.56M7.34 7.34 5.78 5.78" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M20.2 14.1A8.5 8.5 0 0 1 9.9 3.8a8.9 8.9 0 1 0 10.3 10.3Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3.6 9h16.8M3.6 15h16.8M12 3c2.4 2.5 3.8 5.7 3.8 9s-1.4 6.5-3.8 9m0-18c-2.4 2.5-3.8 5.7-3.8 9s1.4 6.5 3.8 9" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 10 3 2-3 2m5 1h3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

export default App;
