import React, { useMemo, useState } from 'react';

const navItems = [
  { id: 'home', label: 'Home', shortLabel: 'HM' },
  { id: 'courses', label: 'Courses', shortLabel: 'CR' },
  { id: 'tests', label: 'Tests', shortLabel: 'TS' },
  { id: 'bookmarks', label: 'Bookmarks', shortLabel: 'BM' },
  { id: 'scoreboard', label: 'Scoreboard', shortLabel: 'SB' },
  { id: 'settings', label: 'Settings', shortLabel: 'ST' },
  { id: 'profile', label: 'Profile', shortLabel: 'MH' }
];

const user = {
  name: 'Maya Hart',
  username: '@maya.lingua',
  email: 'maya@linguacode.app',
  password: '••••••••••••',
  phone: '+1 (415) 555-0198',
  memberSince: 'June 2024',
  avatar: 'MH',
  xp: '24,860',
  streak: 27,
  lessonsDone: 182,
  testsPassed: 46,
  rank: '#08'
};

const activeCourses = [
  { title: 'JavaScript Interview Studio', track: 'Coding', progress: 84 },
  { title: 'French Speaking Sprint', track: 'Spoken', progress: 67 },
  { title: 'TypeScript Systems Lab', track: 'Coding', progress: 49 }
];

const courseCards = [
  {
    id: 'spoken',
    eyebrow: 'Warm-up your voice',
    title: 'Spoken Languages',
    description: 'Build confidence with pronunciation drills, listening prompts, and real-world conversation scenes.',
    stats: ['18 live drills', '6 saved paths']
  },
  {
    id: 'coding',
    eyebrow: 'Think like a builder',
    title: 'Coding Languages',
    description: 'Level up from syntax to systems with guided lessons, code labs, and timed challenge sets.',
    stats: ['24 active lessons', '11 challenge sets']
  }
];

const quickActions = [
  { label: 'Tests', count: '12 ready', icon: TestIcon },
  { label: 'Saved Lessons', count: '28 saved', icon: CourseIcon },
  { label: 'Saved Questions', count: '54 pinned', icon: BookmarkIcon }
];

const scoreboard = [
  { name: 'Lena Brooks', score: 11540, trend: '+164' },
  { name: 'Diego Rossi', score: 11090, trend: '+121' },
  { name: 'You', score: 10880, trend: '+187', highlight: true },
  { name: 'Nia Carter', score: 10620, trend: '+98' },
  { name: 'Jae Kim', score: 10240, trend: '+84' }
];

const bookmarks = [
  { title: 'Closures under pressure', tag: 'CODE', note: 'Pinned from JavaScript interview studio' },
  { title: 'Paris cafe essentials', tag: 'SPOKEN', note: 'Quick review set for travel fluency' },
  { title: 'Async patterns checkpoint', tag: 'TEST', note: '18 questions remaining before submit' },
  { title: 'State management patterns', tag: 'CODE', note: 'Saved for this weekend sprint' }
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

const fontSizes = ['Compact', 'Comfortable', 'Large'];
const accentColors = ['Amber / Teal', 'Amber', 'Teal'];
const privacyModes = ['Friends only', 'Private', 'Public'];
const languageOptions = ['English (US)', 'English (UK)', 'French'];

function App() {
  const [activeRail, setActiveRail] = useState('home');
  const [sidebarTab, setSidebarTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [fontSize, setFontSize] = useState('Comfortable');
  const [accentColor, setAccentColor] = useState('Amber / Teal');
  const [privacy, setPrivacy] = useState('Friends only');
  const [language, setLanguage] = useState('English (US)');

  const activePanel = activeRail === 'settings' ? 'settings' : activeRail === 'profile' ? 'profile' : sidebarTab;

  const notificationCount = useMemo(
    () => [dailyReminders, achievements, weeklyDigest].filter(Boolean).length + 2,
    [dailyReminders, achievements, weeklyDigest]
  );

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="app-shell">
        <div className="app-noise" aria-hidden="true" />

        <div className="dashboard-layout">
          <IconRail
            activeRail={activeRail}
            onSelect={(id) => {
              setActiveRail(id);
              if (id === 'profile' || id === 'settings') {
                setSidebarTab(id);
              }
            }}
          />

          <main className="content-column">
            <TopBar
              name={user.name}
              streak={user.streak}
              notificationCount={notificationCount}
            />

            <section className="dashboard-grid">
              <div className="dashboard-main-column">
                <section className="hero-grid">
                  {courseCards.map((card, index) => (
                    <CourseCard key={card.id} card={card} index={index} />
                  ))}
                </section>

                <section className="quick-actions">
                  {quickActions.map((action) => (
                    <QuickActionCard key={action.label} action={action} />
                  ))}
                </section>

                <ProgressPanel />
              </div>

              <div className="dashboard-side-column">
                <ScoreboardPanel />
                <BookmarksPanel />
              </div>
            </section>
          </main>

          <SidebarPanel
            activePanel={activePanel}
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            dailyReminders={dailyReminders}
            setDailyReminders={setDailyReminders}
            achievements={achievements}
            setAchievements={setAchievements}
            weeklyDigest={weeklyDigest}
            setWeeklyDigest={setWeeklyDigest}
            fontSize={fontSize}
            setFontSize={setFontSize}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            privacy={privacy}
            setPrivacy={setPrivacy}
            language={language}
            setLanguage={setLanguage}
          />
        </div>
      </div>
    </div>
  );
}

function IconRail({ activeRail, onSelect }) {
  return (
    <aside className="icon-rail panel-surface">
      <div className="rail-brand">
        <div className="brand-mark">
          <CompassIcon />
        </div>
        <div>
          <p className="rail-title">LinguaCode</p>
          <p className="rail-subtitle">Fluency for minds in motion</p>
        </div>
      </div>

      <nav className="rail-nav" aria-label="Primary">
        {navItems.map((item) => {
          const isActive = activeRail === item.id;
          const isProfile = item.id === 'profile';

          return (
            <button
              key={item.id}
              type="button"
              className={`rail-button ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
              aria-pressed={isActive}
            >
              <span className={`rail-icon ${isProfile ? 'avatar-pill' : ''}`}>{item.shortLabel}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function TopBar({ name, streak, notificationCount }) {
  return (
    <header className="topbar panel-surface">
      <div>
        <p className="eyebrow">Today&apos;s briefing</p>
        <h1>Welcome back, {name.split(' ')[0]}.</h1>
      </div>

      <div className="topbar-actions">
        <div className="streak-badge">
          <FireIcon />
          <span>{streak}-day streak</span>
        </div>
        <button type="button" className="icon-chip" aria-label="Notifications">
          <BellIcon />
          <strong>{notificationCount}</strong>
        </button>
      </div>
    </header>
  );
}

function CourseCard({ card, index }) {
  return (
    <article className={`course-card panel-surface course-${card.id}`}>
      <p className="eyebrow">{card.eyebrow}</p>
      <h2>{card.title}</h2>
      <p className="muted-copy">{card.description}</p>

      <div className="course-stats">
        {card.stats.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <button type="button" className="primary-link">
        Explore track {index === 0 ? '01' : '02'}
        <ArrowIcon />
      </button>
    </article>
  );
}

function QuickActionCard({ action }) {
  const Icon = action.icon;

  return (
    <button type="button" className="quick-card panel-surface">
      <span className="quick-icon">
        <Icon />
      </span>
      <div>
        <p>{action.label}</p>
        <span>{action.count}</span>
      </div>
    </button>
  );
}

function ScoreboardPanel() {
  return (
    <section className="scoreboard panel-surface">
      <div className="section-head">
        <div>
          <p className="eyebrow">Competitive pulse</p>
          <h3>Weekly scoreboard</h3>
        </div>
        <span className="section-chip">Top 20%</span>
      </div>

      <div className="score-list">
        {scoreboard.map((entry, index) => (
          <div key={entry.name} className={`score-row ${entry.highlight ? 'is-you' : ''}`}>
            <div className="score-meta">
              <span className="score-rank">0{index + 1}</span>
              <div>
                <p>{entry.name}</p>
                <span>{entry.trend} this week</span>
              </div>
            </div>
            <strong>{entry.score.toLocaleString()}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function BookmarksPanel() {
  return (
    <section className="bookmarks panel-surface">
      <div className="section-head">
        <div>
          <p className="eyebrow">Keep close</p>
          <h3>Bookmarks</h3>
        </div>
        <span className="section-chip">12 total</span>
      </div>

      <div className="bookmark-list">
        {bookmarks.map((item) => (
          <article key={item.title} className="bookmark-item">
            <span className={`tag tag-${item.tag.toLowerCase()}`}>{item.tag}</span>
            <h4>{item.title}</h4>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProgressPanel() {
  return (
    <section className="progress panel-surface">
      <div className="section-head">
        <div>
          <p className="eyebrow">Progress report</p>
          <h3>Weekly learning rhythm</h3>
        </div>
        <span className="section-chip">Updated today</span>
      </div>

      <div className="stat-grid">
        <StatCard label="Study hours" value="16.4" tone="amber" />
        <StatCard label="Accuracy" value="92%" tone="teal" />
        <StatCard label="XP gained" value="+1,280" tone="neutral" />
      </div>

      <div className="chart-card">
        <div className="chart-bars">
          {weeklyBars.map((bar, index) => (
            <div key={bar.day} className="chart-column">
              <div
                className="chart-bar"
                style={{
                  height: `${bar.value}%`,
                  animationDelay: `${index * 90}ms`
                }}
              />
              <span>{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SidebarPanel({
  activePanel,
  sidebarTab,
  setSidebarTab,
  darkMode,
  setDarkMode,
  dailyReminders,
  setDailyReminders,
  achievements,
  setAchievements,
  weeklyDigest,
  setWeeklyDigest,
  fontSize,
  setFontSize,
  accentColor,
  setAccentColor,
  privacy,
  setPrivacy,
  language,
  setLanguage
}) {
  return (
    <aside className="sidebar panel-surface">
      <div className="sidebar-tabs">
        <button
          type="button"
          className={sidebarTab === 'profile' ? 'active' : ''}
          onClick={() => setSidebarTab('profile')}
        >
          Profile
        </button>
        <button
          type="button"
          className={sidebarTab === 'settings' ? 'active' : ''}
          onClick={() => setSidebarTab('settings')}
        >
          Settings
        </button>
      </div>

      {activePanel === 'settings' ? (
        <SettingsPanel
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          dailyReminders={dailyReminders}
          setDailyReminders={setDailyReminders}
          achievements={achievements}
          setAchievements={setAchievements}
          weeklyDigest={weeklyDigest}
          setWeeklyDigest={setWeeklyDigest}
          fontSize={fontSize}
          setFontSize={setFontSize}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          privacy={privacy}
          setPrivacy={setPrivacy}
          language={language}
          setLanguage={setLanguage}
        />
      ) : (
        <ProfilePanel />
      )}
    </aside>
  );
}

function ProfilePanel() {
  return (
    <div className="sidebar-scroll">
      <section className="profile-hero">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{user.avatar}</div>
          <button type="button" className="avatar-edit" aria-label="Edit profile picture">
            <EditIcon />
          </button>
        </div>
        <div>
          <p className="eyebrow">Profile tab</p>
          <h2>{user.name}</h2>
        </div>
      </section>

      <section className="detail-list">
        <DetailRow label="Username" value={user.username} />
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Password" value={user.password} />
        <DetailRow label="Phone" value={user.phone} />
        <DetailRow label="Member since" value={user.memberSince} />
      </section>

      <section className="metric-grid">
        <MetricCard label="XP" value={user.xp} />
        <MetricCard label="Streak" value={`${user.streak} days`} />
        <MetricCard label="Lessons done" value={String(user.lessonsDone)} />
        <MetricCard label="Tests passed" value={String(user.testsPassed)} />
        <MetricCard label="Rank" value={user.rank} />
      </section>

      <section className="course-progress-block">
        <div className="section-head compact">
          <div>
            <p className="eyebrow">In motion</p>
            <h3>Active courses</h3>
          </div>
        </div>

        <div className="course-progress-list">
          {activeCourses.map((course, index) => (
            <div key={course.title} className="course-progress-card">
              <div className="course-progress-head">
                <div>
                  <h4>{course.title}</h4>
                  <span>{course.track}</span>
                </div>
                <strong>{course.progress}%</strong>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${course.progress}%`,
                    animationDelay: `${index * 120}ms`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsPanel({
  darkMode,
  setDarkMode,
  dailyReminders,
  setDailyReminders,
  achievements,
  setAchievements,
  weeklyDigest,
  setWeeklyDigest,
  fontSize,
  setFontSize,
  accentColor,
  setAccentColor,
  privacy,
  setPrivacy,
  language,
  setLanguage
}) {
  return (
    <div className="sidebar-scroll">
      <section>
        <p className="eyebrow">Settings tab</p>
        <h2 className="sidebar-title">Refine your workspace</h2>
      </section>

      <section className="settings-group">
        <SettingRow
          label="Dark mode"
          value={darkMode ? 'On' : 'Off'}
          control={<Toggle checked={darkMode} onChange={setDarkMode} />}
        />
        <SettingChoiceRow
          label="Font size"
          value={fontSize}
          options={fontSizes}
          selected={fontSize}
          onSelect={setFontSize}
        />
        <SettingChoiceRow
          label="Accent color"
          value={accentColor}
          options={accentColors}
          selected={accentColor}
          onSelect={setAccentColor}
        />
      </section>

      <section className="settings-group">
        <h3>Notifications</h3>
        <SettingRow
          label="Daily reminders"
          value={dailyReminders ? 'Enabled' : 'Disabled'}
          control={<Toggle checked={dailyReminders} onChange={setDailyReminders} />}
        />
        <SettingRow
          label="Achievements"
          value={achievements ? 'Enabled' : 'Disabled'}
          control={<Toggle checked={achievements} onChange={setAchievements} />}
        />
        <SettingRow
          label="Weekly digest"
          value={weeklyDigest ? 'Enabled' : 'Disabled'}
          control={<Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />}
        />
      </section>

      <section className="settings-group">
        <h3>Preferences</h3>
        <SettingChoiceRow
          label="Privacy"
          value={privacy}
          options={privacyModes}
          selected={privacy}
          onSelect={setPrivacy}
        />
        <SettingChoiceRow
          label="Language"
          value={language}
          options={languageOptions}
          selected={language}
          onSelect={setLanguage}
        />
      </section>

      <section className="settings-links">
        {['Help Centre', 'FAQs', 'Send Feedback', 'Sign Out'].map((label) => (
          <button key={label} type="button" className="settings-link">
            <span>{label}</span>
            <ArrowIcon />
          </button>
        ))}
      </section>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SettingRow({ label, value, control }) {
  return (
    <div className="setting-row">
      <div>
        <p>{label}</p>
        <span>{value}</span>
      </div>
      {control ?? <button type="button" className="ghost-chip">{value}</button>}
    </div>
  );
}

function SettingChoiceRow({ label, value, options, selected, onSelect }) {
  return (
    <div className="setting-choice-card">
      <div className="setting-choice-head">
        <div>
          <p>{label}</p>
          <span>{value}</span>
        </div>
      </div>
      <div className="choice-group" role="group" aria-label={label}>
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
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'checked' : ''}`}
      onClick={() => onChange((value) => !value)}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.9 9.1 9.7 11.2 7.6 16.4l5.2-2.1 2.1-5.2ZM12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z" />
    </svg>
  );
}

function CourseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14.5A1.5 1.5 0 0 1 18.5 20H7a3 3 0 0 1 0-6h11V6H6.5A.5.5 0 0 0 6 6.5V16H4V6.5Z" />
    </svg>
  );
}

function TestIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h10v3h2v3a5 5 0 0 1-3.5 4.8l-1.2.4V21h-4v-6.8l-1.2-.4A5 5 0 0 1 5 9V6h2V3Zm2 2v2h6V5H9Zm-2 4a3 3 0 0 0 2.1 2.9l2.9 1V19h.1v-6.1l2.9-1A3 3 0 0 0 17 9V8H7v1Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 4h12v16l-6-3.6L6 20V4Zm2 2v10.4l4-2.4 4 2.4V6H8Z" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 2.5c.6 2.8-.5 4.6-2 6.2-1.4 1.5-2.9 3-2.9 5.2a3.4 3.4 0 0 0 6.8.4c0-1.5-.6-2.5-1.7-3.7 2.3.3 4.8 2.6 4.8 6a6.5 6.5 0 1 1-13 0c0-4.5 3.1-7.3 5.5-9.6 1.1-1 2.1-2.1 2.5-4.5Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a5 5 0 0 0-5 5v2.1c0 .8-.3 1.6-.8 2.2L4.6 14v1h14.8v-1l-1.6-1.7c-.5-.6-.8-1.4-.8-2.2V8a5 5 0 0 0-5-5Zm0 18a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 21Z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.7 3.3a2.3 2.3 0 0 1 3.3 3.3l-9.7 9.7-4.3 1 1-4.3 9.7-9.7Zm-8.8 11.4-.4 1.6 1.6-.4 8.9-8.9-1.2-1.2-8.9 8.9Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h12.2l-4.1 4.1 1.4 1.4L21 11l-6.5-6.5-1.4 1.4 4.1 4.1H5v2Z" />
    </svg>
  );
}

export default App;
