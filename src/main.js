import './style.css'
import { characters, spokenLanguages, programmingLanguages, lessons, wordBank, syntaxMap } from './data/lessons.js'

// --- State ---
let state = {
  xp: 0,
  streak: 0,
  level: 'Beginner',
  track: null,
  language: null,
  difficulty: null,
  currentMode: 'onboarding',
  currentLessonIndex: 0,
  activeChar: 'byte',
  selectedOption: null
};

const screenContainer = document.getElementById('screen-container');
const charDialogue = document.getElementById('char-dialogue');
const charImage = document.getElementById('char-image');
const feedbackLayer = document.getElementById('feedback-layer');
const xpDisplay = document.getElementById('xp-count');
const streakDisplay = document.getElementById('streak-count');
const rankText = document.getElementById('rank-text');

function init() {
  renderOnboardingStep1();
}

function updateCharacter(charId, message) {
  const char = characters[charId];
  state.activeChar = charId;
  charImage.textContent = char.icon;
  charDialogue.textContent = message;
  document.body.className = char.theme;
}

// --- ONBOARDING ---
function renderOnboardingStep1() {
  updateCharacter('byte', "👋 Hey! I'm Byte. Ready to master a new skill? Pick your path below!");
  screenContainer.innerHTML = `
    <h1 class="screen-title">Choose your path</h1>
    <div class="selection-grid">
      <div class="card" data-track="spoken">
        <span class="card-icon">🌍</span><span class="card-label">Spoken Language</span>
      </div>
      <div class="card" data-track="programming">
        <span class="card-icon">💻</span><span class="card-label">Programming</span>
      </div>
    </div>
  `;
  document.querySelectorAll('.card').forEach(card => card.onclick = () => {
    state.track = card.dataset.track; renderOnboardingStep2();
  });
}

function renderOnboardingStep2() {
  const langs = state.track === 'spoken' ? spokenLanguages : programmingLanguages;
  const char = state.track === 'spoken' ? 'lingo' : 'byte';
  updateCharacter(char, "Awesome! Which specific language should we conquer?");
  screenContainer.innerHTML = `
    <h1 class="screen-title">Select Language</h1>
    <div class="selection-grid">
      ${langs.map(l => `<div class="card" data-lang="${l.id}"><span class="card-icon">${l.icon}</span><span class="card-label">${l.name}</span></div>`).join('')}
    </div>
  `;
  document.querySelectorAll('.card').forEach(card => card.onclick = () => {
    state.language = card.dataset.lang; renderOnboardingStep3();
  });
}

function renderOnboardingStep3() {
  updateCharacter('nova', "You're doing great! Set your challenge level to begin.");
  screenContainer.innerHTML = `
    <h1 class="screen-title">Set Difficulty</h1>
    <div class="selection-grid">
      <div class="card" data-diff="beginner"><span class="card-icon">🐣</span><span class="card-label">Beginner</span></div>
      <div class="card" data-diff="intermediate"><span class="card-icon">🏗️</span><span class="card-label">Intermediate</span></div>
      <div class="card" data-diff="advanced"><span class="card-icon">🚀</span><span class="card-label">Advanced</span></div>
    </div>
  `;
  document.querySelectorAll('.card').forEach(card => card.onclick = () => {
    state.difficulty = card.dataset.diff; startLesson();
  });
}

// --- ENGINE ---
function startLesson() {
  state.currentMode = 'lesson';
  let lesson = null;

  // Try to find manual lesson
  const trackLessons = lessons[state.track] && lessons[state.track][state.language];
  const difficultyLessons = trackLessons && trackLessons[state.difficulty];

  if (difficultyLessons && difficultyLessons[state.currentLessonIndex]) {
    lesson = difficultyLessons[state.currentLessonIndex];
  } else {
    // BUG FIX & UNLIMITED: Trigger Generator if no manual lesson exists
    lesson = generateLesson();
  }

  renderLesson(lesson);
}

function generateLesson() {
  if (state.track === 'spoken') {
    return generateSpokenLesson();
  } else {
    return generateProgrammingLesson();
  }
}

function generateSpokenLesson() {
  const langData = wordBank[state.language] || wordBank['spanish']; // Fallback for demo
  const catergory = Math.random() > 0.5 ? 'greetings' : 'basics';
  const item = langData[catergory][Math.floor(Math.random() * langData[catergory].length)];

  // Create decoy answers
  const decoys = ['Gracias', 'Bonjour', 'Hola', 'Adios'].filter(d => d !== item.word).slice(0, 3);
  const options = [item.word, ...decoys].sort(() => Math.random() - 0.5);

  return {
    character: 'lingo',
    title: `Practice: ${item.translation}`,
    concept: `Let's learn how to say "${item.translation}"!`,
    vocab: [item],
    challenge: `Choose the correct translation for "${item.translation}":`,
    options: options,
    answer: item.word,
    hint: `It sounds like "${item.guide}"!`
  };
}

function generateProgrammingLesson() {
  const syntax = syntaxMap[state.language] || syntaxMap['python'];
  const types = Object.keys(syntax);
  const selectedType = types[Math.floor(Math.random() * types.length)];
  const codeSnippet = syntax[selectedType];

  const decoys = ['print', 'loop', 'var', 'const'].filter(d => d !== selectedType).slice(0, 3);
  const options = [selectedType, ...decoys].sort(() => Math.random() - 0.5);

  return {
    character: 'byte',
    title: `Mastering ${selectedType}`,
    concept: `In ${state.language}, this is how we handle ${selectedType}.`,
    code: codeSnippet,
    challenge: `Which coding concept is shown in the snippet?`,
    options: options,
    answer: selectedType,
    hint: `Look closely at the syntax used!`
  };
}

function renderLesson(lesson) {
  const char = characters[lesson.character] || characters['byte'];
  updateCharacter(lesson.character || 'byte', lesson.greeting || `Ready for another challenge?`);

  screenContainer.innerHTML = `
    <div class="lesson-card">
      <h2>${lesson.title}</h2>
      <p>${lesson.concept || ''}</p>
      ${lesson.analogy ? `<p class="analogy">💡 ${lesson.analogy}</p>` : ''}
      ${lesson.code ? `<pre class="code-block">${lesson.code}</pre>` : ''}
      ${lesson.vocab ? lesson.vocab.map(v => `<p>🗣️ <strong>${v.word}</strong> (${v.guide}) = ${v.translation}</p>`).join('') : ''}
    </div>
    <div class="lesson-card">
      <p><strong>Challenge:</strong> ${lesson.challenge}</p>
      <div class="options-list">
        ${lesson.options.map(opt => `<button class="option-btn">${opt}</button>`).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.option-btn').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.selectedOption = btn.textContent;
    checkAnswer(lesson);
  });
}

function checkAnswer(lesson) {
  const isCorrect = state.selectedOption === lesson.answer;
  if (isCorrect) {
    state.xp += 10; state.streak += 1;
    showFeedback(true, "Perfect! +10 XP — You're amazing!");
  } else {
    state.streak = 0;
    showFeedback(false, `Oops! Hint: ${lesson.hint || 'Try again!'}`);
  }
  updateStats();
}

function showFeedback(isCorrect, message) {
  feedbackLayer.classList.add('show');
  document.getElementById('feedback-title').textContent = isCorrect ? 'Great Job!' : 'Not Quite';
  document.getElementById('feedback-msg').textContent = message;
  document.getElementById('feedback-icon').textContent = isCorrect ? '🎉' : '💡';
}

document.getElementById('fb-continue-btn').onclick = () => {
  feedbackLayer.classList.remove('show');
  state.currentLessonIndex++;
  startLesson(); // Unlimited loop!
};

function updateStats() {
  xpDisplay.textContent = state.xp;
  streakDisplay.textContent = state.streak;
  if (state.xp > 100) rankText.textContent = 'Explorer';
  if (state.xp > 300) rankText.textContent = 'Learner';
  if (state.xp > 600) rankText.textContent = 'Master';
}

init();
