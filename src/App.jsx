import React, { useEffect, useMemo, useRef, useState } from 'react';

const user = {
  name: 'Maya Hart',
  username: '@maya.lingua',
  email: 'maya@linguacode.app',
  phone: '+1 (415) 555-0198',
  memberSince: 'June 2024',
  avatar: 'MH',
  xp: '24,860',
  streak: 27,
  lessonsDone: 182,
  testsPassed: 46,
  rank: '#08'
};

const navItems = [
  { id: 'home', label: 'Home', symbol: '⌂' },
  { id: 'spoken', label: 'Spoken', symbol: '◌' },
  { id: 'coding', label: 'Coding', symbol: '</>' },
  { id: 'tests', label: 'Tests', symbol: '✓' },
  { id: 'bookmarks', label: 'Bookmarks', symbol: '★' }
];

const overviewStats = [
  { label: 'Streak', value: '27 days', tone: 'amber' },
  { label: 'Weekly XP', value: '+1,280', tone: 'teal' },
  { label: 'Focus score', value: '86%', tone: 'neutral' }
];

const tracks = [
  {
    id: 'spoken',
    eyebrow: 'Warm up your voice',
    title: 'Spoken Languages',
    description: 'Bite-size conversations, listening loops, and confidence drills for real-world fluency.',
    symbol: '◌',
    tone: 'amber',
    progress: 74,
    highlights: ['18 live drills', '6 saved paths', '2 speaking rooms']
  },
  {
    id: 'coding',
    eyebrow: 'Think like a builder',
    title: 'Coding Languages',
    description: 'Projects, debugging reps, and mock interviews designed to make syntax stick under pressure.',
    symbol: '</>',
    tone: 'teal',
    progress: 81,
    highlights: ['24 active lessons', '11 challenge sets', '3 mock interviews']
  }
];

const weeklyBars = [
  { day: 'Mon', value: 44 },
  { day: 'Tue', value: 72 },
  { day: 'Wed', value: 58 },
  { day: 'Thu', value: 83 },
  { day: 'Fri', value: 64 },
  { day: 'Sat', value: 91 },
  { day: 'Sun', value: 76 }
];

const spokenModules = [
  { title: 'Travel Dialogues', level: 'Intermediate', progress: 78, detail: 'Handle airports, cafes, and check-ins without freezing.' },
  { title: 'Pronunciation Lab', level: 'Guided', progress: 64, detail: 'Short mouth-shape drills and phrase mirroring.' },
  { title: 'Listening Sprint', level: 'Daily', progress: 88, detail: 'Fast comprehension rounds with accent variety.' }
];

const codingModules = [
  { title: 'JavaScript Systems', level: 'Advanced', progress: 82, detail: 'Closures, async flows, and interview-style reasoning.' },
  { title: 'TypeScript Builder', level: 'Intermediate', progress: 59, detail: 'Types, utility patterns, and safer component design.' },
  { title: 'DSA Warmups', level: 'Timed', progress: 71, detail: 'Practice under time pressure with hints on demand.' }
];

const testsData = [
  { title: 'Frontend Mock', type: 'Coding', questions: 24, score: '92%', status: 'Ready to retake' },
  { title: 'French Listening Check', type: 'Spoken', questions: 18, score: '89%', status: 'New audio added' },
  { title: 'Interview Pressure Round', type: 'Coding', questions: 14, score: 'Pending', status: 'Starts in 20 min' }
];

const bookmarks = [
  { title: 'Closures under pressure', tag: 'Code', note: 'Pinned from JavaScript interview studio.' },
  { title: 'Paris cafe essentials', tag: 'Spoken', note: 'Quick review set for travel fluency.' },
  { title: 'Async patterns checkpoint', tag: 'Test', note: '18 questions remaining before submit.' },
  { title: 'State management patterns', tag: 'Code', note: 'Saved for this weekend sprint.' }
];

const notifications = [
  { title: 'Weekly digest is ready', detail: 'Your coding accuracy improved by 6% this week.', unread: true },
  { title: 'French sprint updated', detail: 'Two new conversation drills were added today.', unread: true },
  { title: 'Bookmarks synced', detail: 'Saved items are up to date across your devices.', unread: false }
];

const activeCourses = [
  { title: 'JavaScript Interview Studio', track: 'Coding', progress: 84 },
  { title: 'French Speaking Sprint', track: 'Spoken', progress: 67 },
  { title: 'TypeScript Systems Lab', track: 'Coding', progress: 49 }
];

const appearanceOptions = ['Comfortable', 'Compact', 'Large'];
const privacyModes = ['Friends only', 'Private', 'Public'];
const languageOptions = ['English (US)', 'English (UK)', 'French'];

function App() {
  const [theme, setTheme] = useState('dark');
  const [activePage, setActivePage] = useState('home');
  const [openDrawer, setOpenDrawer] = useState(null);
  const [fontSize, setFontSize] = useState('Comfortable');
  const [privacy, setPrivacy] = useState('Friends only');
  const [language, setLanguage] = useState('English (US)');
  const [dailyReminders, setDailyReminders] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const drawerRef = useRef(null);

  const isLight = theme === 'light';
  const notificationCount = useMemo(
    () => notifications.filter((item) => item.unread).length,
    []
  );

  useEffect(() => {
    function handlePointerDown(event) {
      if (openDrawer && drawerRef.current && !drawerRef.current.contains(event.target)) {
        setOpenDrawer(null);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setOpenDrawer(null);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openDrawer]);

  function navigate(page) {
    setActivePage(page);
    setOpenDrawer(null);
  }

  return (
    <div className={isLight ? 'light-theme' : 'dark-theme'}>
      <div className="app-shell">
        <div className="ambient-grid" aria-hidden="true" />

        <div className="app-frame">
          <TopBar
            activePage={activePage}
            navigate={navigate}
            theme={theme}
            setTheme={setTheme}
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
            notificationCount={notificationCount}
          />

          <main className="page-shell">
            {activePage === 'home' ? <HomePage navigate={navigate} /> : null}
            {activePage === 'spoken' ? <TrackPage title="Spoken languages" intro="Train listening, speaking, and rhythm with practical scenes that feel human, not textbook." modules={spokenModules} tone="amber" symbol="◌" /> : null}
            {activePage === 'coding' ? <TrackPage title="Coding languages" intro="Build technical fluency with projects, debugging reps, and interview-style pressure practice." modules={codingModules} tone="teal" symbol="</>" /> : null}
            {activePage === 'tests' ? <TestsPage /> : null}
            {activePage === 'bookmarks' ? <BookmarksPage /> : null}
          </main>
        </div>

        <DrawerLayer open={Boolean(openDrawer)}>
          <aside ref={drawerRef} className={`side-drawer ${openDrawer ? 'open' : ''}`}>
            {openDrawer === 'profile' ? <ProfileDrawer navigate={navigate} /> : null}
            {openDrawer === 'settings' ? (
              <SettingsDrawer
                theme={theme}
                setTheme={setTheme}
                fontSize={fontSize}
                setFontSize={setFontSize}
                privacy={privacy}
                setPrivacy={setPrivacy}
                language={language}
                setLanguage={setLanguage}
                dailyReminders={dailyReminders}
                setDailyReminders={setDailyReminders}
                achievements={achievements}
                setAchievements={setAchievements}
                weeklyDigest={weeklyDigest}
                setWeeklyDigest={setWeeklyDigest}
              />
            ) : null}
            {openDrawer === 'notifications' ? <NotificationsDrawer notificationCount={notificationCount} /> : null}
          </aside>
        </DrawerLayer>
      </div>
    </div>
  );
}

function TopBar({ activePage, navigate, theme, setTheme, openDrawer, setOpenDrawer, notificationCount }) {
  const isLight = theme === 'light';

  return (
    <header className="top-bar glass-card">
      <div className="brand-block">
        <button type="button" className="brand-mark" onClick={() => navigate('home')} aria-label="Go to homepage">
          ✦
        </button>
        <div>
          <p className="brand-title">LinguaCode</p>
          <p className="brand-subtitle">A polished study space with a playful pulse.</p>
        </div>
      </div>

      <nav className="nav-strip" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-pill ${activePage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            <span className="nav-symbol" aria-hidden="true">{item.symbol}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="toolbar">
        <button
          type="button"
          className="tool-button"
          onClick={() => setTheme(isLight ? 'dark' : 'light')}
          aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
          title={isLight ? 'Dark mode' : 'Light mode'}
        >
          <span className="tool-symbol" aria-hidden="true">{isLight ? '☾' : '☀'}</span>
        </button>
        <button
          type="button"
          className={`tool-button ${openDrawer === 'notifications' ? 'active' : ''}`}
          onClick={() => setOpenDrawer((value) => (value === 'notifications' ? null : 'notifications'))}
          aria-label="Open notifications"
        >
          <span className="tool-symbol" aria-hidden="true">✉</span>
          {notificationCount ? <span className="tool-count">{notificationCount}</span> : null}
        </button>
        <button
          type="button"
          className={`tool-button ${openDrawer === 'settings' ? 'active' : ''}`}
          onClick={() => setOpenDrawer((value) => (value === 'settings' ? null : 'settings'))}
          aria-label="Open settings"
        >
          <span className="tool-symbol" aria-hidden="true">⚙</span>
        </button>
        <button
          type="button"
          className={`avatar-button ${openDrawer === 'profile' ? 'active' : ''}`}
          onClick={() => setOpenDrawer((value) => (value === 'profile' ? null : 'profile'))}
          aria-label="Open profile"
        >
          {user.avatar}
        </button>
      </div>
    </header>
  );
}

function HomePage({ navigate }) {
  return (
    <div className="page-stack">
      <section className="hero-panel glass-card">
        <div className="hero-copy">
          <p className="eyebrow">Daily dashboard</p>
          <h1>Study spoken and coding languages in one fun, friendly workspace.</h1>
          <p className="hero-text">
            Clean alignment, clearer actions, and just enough personality to keep the dashboard lively while your next step stays obvious.
          </p>

          <div className="hero-actions">
            <button type="button" className="cta-button primary" onClick={() => navigate('spoken')}>
              Open spoken track
            </button>
            <button type="button" className="cta-button secondary" onClick={() => navigate('coding')}>
              Open coding track
            </button>
          </div>
        </div>

        <div className="hero-aside">
          <div className="stat-row">
            {overviewStats.map((item) => (
              <article key={item.label} className={`mini-stat ${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="focus-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Focus pulse</p>
                <h2>Weekly rhythm</h2>
              </div>
              <span className="section-chip">86% on track</span>
            </div>

            <div className="bars">
              {weeklyBars.map((bar) => (
                <div key={bar.day} className="bar-column">
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${bar.value}%` }} />
                  </div>
                  <span>{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            className={`track-card glass-card ${track.tone}`}
            onClick={() => navigate(track.id)}
          >
            <div className="track-top">
              <p className="eyebrow">{track.eyebrow}</p>
              <span className="track-symbol" aria-hidden="true">{track.symbol}</span>
            </div>

            <h2>{track.title}</h2>
            <p className="track-copy">{track.description}</p>

            <div className="track-meter">
              <div className="track-meter-fill" style={{ width: `${track.progress}%` }} />
            </div>

            <div className="chip-row">
              {track.highlights.map((item) => (
                <span key={item} className="soft-chip">{item}</span>
              ))}
            </div>
          </button>
        ))}
      </section>

      <section className="content-grid">
        <section className="glass-card panel-block">
          <div className="section-head">
            <div>
              <p className="eyebrow">Jump back in</p>
              <h2>Useful shortcuts</h2>
            </div>
          </div>

          <div className="shortcut-grid">
            <ShortcutCard label="Tests" symbol="✓" detail="Run a mock or skill check" onClick={() => navigate('tests')} />
            <ShortcutCard label="Bookmarks" symbol="★" detail="Review saved questions and notes" onClick={() => navigate('bookmarks')} />
            <ShortcutCard label="Spoken" symbol="◌" detail="Continue conversation practice" onClick={() => navigate('spoken')} />
            <ShortcutCard label="Coding" symbol="</>" detail="Resume labs and interviews" onClick={() => navigate('coding')} />
          </div>
        </section>

        <section className="glass-card panel-block">
          <div className="section-head">
            <div>
              <p className="eyebrow">Active courses</p>
              <h2>Momentum board</h2>
            </div>
          </div>

          <div className="course-list">
            {activeCourses.map((course) => (
              <article key={course.title} className="course-item">
                <div className="course-line">
                  <div>
                    <h3>{course.title}</h3>
                    <span>{course.track}</span>
                  </div>
                  <strong>{course.progress}%</strong>
                </div>
                <div className="course-meter">
                  <div className="course-meter-fill" style={{ width: `${course.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function TrackPage({ title, intro, modules, tone, symbol }) {
  return (
    <div className="page-stack">
      <section className={`page-hero glass-card ${tone}`}>
        <div>
          <p className="eyebrow">Track space</p>
          <h1>{title}</h1>
          <p className="hero-text">{intro}</p>
        </div>
        <div className="page-hero-badge" aria-hidden="true">{symbol}</div>
      </section>

      <section className="module-grid">
        {modules.map((module) => (
          <article key={module.title} className="glass-card module-card">
            <div className="module-head">
              <div>
                <h2>{module.title}</h2>
                <span>{module.level}</span>
              </div>
              <strong>{module.progress}%</strong>
            </div>
            <p>{module.detail}</p>
            <div className="course-meter">
              <div className="course-meter-fill" style={{ width: `${module.progress}%` }} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function TestsPage() {
  return (
    <div className="page-stack">
      <section className="page-hero glass-card teal">
        <div>
          <p className="eyebrow">Skill checks</p>
          <h1>Tests and mock sessions</h1>
          <p className="hero-text">Practice with calm structure and enough feedback to make retakes feel useful, not stressful.</p>
        </div>
        <div className="page-hero-badge" aria-hidden="true">✓</div>
      </section>

      <section className="stack-list">
        {testsData.map((test) => (
          <article key={test.title} className="glass-card list-card">
            <div className="list-card-row">
              <div>
                <h2>{test.title}</h2>
                <span>{test.type} · {test.questions} questions</span>
              </div>
              <strong>{test.score}</strong>
            </div>
            <p>{test.status}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function BookmarksPage() {
  return (
    <div className="page-stack">
      <section className="page-hero glass-card amber">
        <div>
          <p className="eyebrow">Saved for later</p>
          <h1>Bookmarks and quick returns</h1>
          <p className="hero-text">Keep tricky ideas nearby so your review sessions start fast and feel less scattered.</p>
        </div>
        <div className="page-hero-badge" aria-hidden="true">★</div>
      </section>

      <section className="module-grid">
        {bookmarks.map((item) => (
          <article key={item.title} className="glass-card bookmark-card">
            <span className={`tag ${item.tag.toLowerCase()}`}>{item.tag}</span>
            <h2>{item.title}</h2>
            <p>{item.note}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function ShortcutCard({ label, symbol, detail, onClick }) {
  return (
    <button type="button" className="shortcut-card" onClick={onClick}>
      <span className="shortcut-symbol" aria-hidden="true">{symbol}</span>
      <div>
        <p>{label}</p>
        <span>{detail}</span>
      </div>
    </button>
  );
}

function DrawerLayer({ open, children }) {
  return (
    <div className={`drawer-layer ${open ? 'visible' : ''}`}>
      {children}
    </div>
  );
}

function ProfileDrawer({ navigate }) {
  return (
    <div className="drawer-content">
      <section className="profile-banner">
        <div className="profile-avatar">{user.avatar}</div>
        <div>
          <p className="eyebrow">Profile</p>
          <h2>{user.name}</h2>
          <span>{user.username}</span>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard label="XP" value={user.xp} />
        <MetricCard label="Streak" value={`${user.streak} days`} />
        <MetricCard label="Lessons" value={String(user.lessonsDone)} />
        <MetricCard label="Tests" value={String(user.testsPassed)} />
      </section>

      <section className="detail-stack">
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Phone" value={user.phone} />
        <DetailRow label="Member since" value={user.memberSince} />
        <DetailRow label="Rank" value={user.rank} />
      </section>

      <button type="button" className="cta-button primary full-width" onClick={() => navigate('bookmarks')}>
        Open bookmarks
      </button>
    </div>
  );
}

function SettingsDrawer({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  privacy,
  setPrivacy,
  language,
  setLanguage,
  dailyReminders,
  setDailyReminders,
  achievements,
  setAchievements,
  weeklyDigest,
  setWeeklyDigest
}) {
  return (
    <div className="drawer-content">
      <section>
        <p className="eyebrow">Settings</p>
        <h2>Appearance and preferences</h2>
      </section>

      <section className="detail-stack">
        <SettingToggle
          label="Theme"
          detail={theme === 'light' ? 'Bright mode is active' : 'Dark mode is active'}
          checked={theme === 'light'}
          onChange={() => setTheme((value) => (value === 'light' ? 'dark' : 'light'))}
          checkedLabel="☀"
          uncheckedLabel="☾"
        />
        <SettingToggle
          label="Daily reminders"
          detail={dailyReminders ? 'Enabled' : 'Disabled'}
          checked={dailyReminders}
          onChange={() => setDailyReminders((value) => !value)}
        />
        <SettingToggle
          label="Achievements"
          detail={achievements ? 'Enabled' : 'Disabled'}
          checked={achievements}
          onChange={() => setAchievements((value) => !value)}
        />
        <SettingToggle
          label="Weekly digest"
          detail={weeklyDigest ? 'Enabled' : 'Disabled'}
          checked={weeklyDigest}
          onChange={() => setWeeklyDigest((value) => !value)}
        />
      </section>

      <ChoiceGroup label="Font size" selected={fontSize} options={appearanceOptions} onSelect={setFontSize} />
      <ChoiceGroup label="Privacy" selected={privacy} options={privacyModes} onSelect={setPrivacy} />
      <ChoiceGroup label="Language" selected={language} options={languageOptions} onSelect={setLanguage} />
    </div>
  );
}

function NotificationsDrawer({ notificationCount }) {
  return (
    <div className="drawer-content">
      <section className="section-head">
        <div>
          <p className="eyebrow">Notifications</p>
          <h2>Inbox</h2>
        </div>
        <span className="section-chip">{notificationCount} unread</span>
      </section>

      <section className="stack-list">
        {notifications.map((item) => (
          <article key={item.title} className={`list-card notification-card ${item.unread ? 'unread' : ''}`}>
            <div className="list-card-row">
              <h3>{item.title}</h3>
              {item.unread ? <span className="unread-dot" aria-hidden="true" /> : null}
            </div>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DetailRow({ label, value }) {
  return (
    <article className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function SettingToggle({ label, detail, checked, onChange, checkedLabel = 'On', uncheckedLabel = 'Off' }) {
  return (
    <article className="detail-row">
      <div>
        <p>{label}</p>
        <span>{detail}</span>
      </div>
      <button type="button" className={`toggle ${checked ? 'checked' : ''}`} onClick={onChange} aria-pressed={checked}>
        <span>{checked ? checkedLabel : uncheckedLabel}</span>
      </button>
    </article>
  );
}

function ChoiceGroup({ label, selected, options, onSelect }) {
  return (
    <section className="choice-block">
      <div className="choice-head">
        <p>{label}</p>
        <span>{selected}</span>
      </div>
      <div className="choice-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`choice-chip ${selected === option ? 'active' : ''}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

export default App;
