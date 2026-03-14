import { characters, spokenLanguages, programmingLanguages, lessons, wordBank, syntaxMap } from './data/lessons.js'
import { isAiEnabled, generateAiLesson } from './services/aiService.js'
import { auth, db, googleProvider, githubProvider } from './services/firebase.js'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// --- Audio ---
const audio = {
  correct: new Audio('https://www.soundjay.com/buttons/sounds/button-37a.mp3'),
  wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

// --- State ---
let state = {
  xp: parseInt(localStorage.getItem('cq_xp')) || 0,
  streak: parseInt(localStorage.getItem('cq_streak')) || 0,
  gems: parseInt(localStorage.getItem('cq_gems')) || 0,
  level: 'Beginner',
  track: null,
  language: null,
  difficulty: 'beginner',
  currentLessonIndex: 0,
  activeChar: 'byte',
  selectedOption: null,
  isGenerating: false,
  answeredQuestions: new Set(), // Track unique question IDs
  id: null,
  sessionProgress: 0,
  sessionTotal: 10, // Number of items per session
  sessionPool: [], // Pool for the current session
  sessionInitialized: false, // True once pool has been built for this session
  currentLesson: null 
};

// --- DOM ---
const screenContainer = document.getElementById('screen-container');
const charDialogue = document.getElementById('char-dialogue');
const charImage = document.getElementById('char-image');
const feedbackLayer = document.getElementById('feedback-layer');
const xpDisplay = document.getElementById('xp-count');
const streakDisplay = document.getElementById('streak-count');

function init() {
  updateStats();
  setupSettings();
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      state.user = user;
      await loadUserProfile(user.uid);
    } else {
      state.user = null;
      renderLoginScreen();
    }
  });
}

async function loadUserProfile(uid) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    state.xp = data.xp || 0;
    state.gems = data.gems || 0;
    state.streak = data.streak || 0;
    state.displayName = data.displayName || 'Hero';
    state.avatar = data.avatar || '🤖';
    
    updateStats();
    renderOnboardingStep1(); // Or dashboard if already onboarded
  } else {
    renderFirstTimeOnboarding();
  }
}

function renderLoginScreen() {
  updateCharacter('byte', "Welcome back, Pioneer! Log in to sync your progress across the multiverse.");
  screenContainer.innerHTML = `
    <div class="login-screen">
      <h1 class="screen-title">Quest Begins Here</h1>
      <div class="auth-methods">
        <button id="google-login-btn" class="primary-btn google-btn">
          <span class="btn-icon">🌐</span> Sign in with Google
        </button>
        <button id="github-login-btn" class="primary-btn github-btn">
          <span class="btn-icon">🐙</span> Sign in with GitHub
        </button>
      </div>
      <p class="guest-note">Or <a href="#" id="guest-login-btn">Continue as Guest</a></p>
    </div>
  `;
  
  document.getElementById('google-login-btn').onclick = () => signInWithPopup(auth, googleProvider);
  document.getElementById('github-login-btn').onclick = () => signInWithPopup(auth, githubProvider);
  document.getElementById('guest-login-btn').onclick = (e) => {
    e.preventDefault();
    renderOnboardingStep1();
  };
}

function renderFirstTimeOnboarding() {
  updateCharacter('nova', "Greetings, Recruit! Let's set up your profile for the journey ahead.");
  screenContainer.innerHTML = `
    <div class="onboarding-flow">
      <h2>Step 1: Choose Your Avatar</h2>
      <div class="avatar-grid">
        ${['🤖', '🦊', '👾', '🦜', '🌟', '🧙', '🐱', '🐶', '🦄', '🐲'].map(icon => `
          <div class="avatar-option" data-icon="${icon}">${icon}</div>
        `).join('')}
      </div>
      <div class="input-group">
        <label>Display Name</label>
        <input type="text" id="display-name-input" placeholder="Enter your hero name">
      </div>
      <button id="save-profile-btn" class="primary-btn" disabled>Initialize Profile</button>
    </div>
  `;
  
  let selectedAvatar = null;
  const nameInput = document.getElementById('display-name-input');
  const saveBtn = document.getElementById('save-profile-btn');
  
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.onclick = () => {
      document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
      opt.classList.add('selected');
      selectedAvatar = opt.dataset.icon;
      checkValidity();
    };
  });
  
  nameInput.oninput = () => checkValidity();
  
  function checkValidity() {
    saveBtn.disabled = !(selectedAvatar && nameInput.value.trim().length > 2);
  }
  
  saveBtn.onclick = async () => {
    const profile = {
      uid: auth.currentUser.uid,
      displayName: nameInput.value.trim(),
      avatar: selectedAvatar,
      xp: 0,
      gems: 0,
      streak: 0,
      joinedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', auth.currentUser.uid), profile);
    state.displayName = profile.displayName;
    state.avatar = profile.avatar;
    renderOnboardingStep1();
  };
}

function setupSettings() {
    const modal = document.getElementById('settings-modal');
    const btn = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const saveBtn = document.getElementById('save-key-btn');
    const input = document.getElementById('api-key-input');

    if (!modal || !btn) return;

    btn.addEventListener('click', () => {
        input.value = localStorage.getItem('gemini_api_key') || '';
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    saveBtn.addEventListener('click', () => {
        const newKey = input.value.trim();
        localStorage.setItem('gemini_api_key', newKey);
        modal.style.display = 'none';
        updateStats(); // Update badge immediately
        console.log("Gemini API Key saved:", newKey ? "PRESENT" : "EMPTY");
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
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
  updateCharacter('byte', "👋 I'm your AI tutor! I'll build 100% unique lessons for you in real-time. Pick a path!");
  screenContainer.innerHTML = `
    <h1 class="screen-title">Choose your path</h1>
    <div class="selection-grid">
      <div class="card" data-track="spoken">🌍 Language</div>
      <div class="card" data-track="programming">💻 Coding</div>
    </div>
  `;
  document.querySelectorAll('.card').forEach(card => card.onclick = () => {
    state.track = card.dataset.track; renderOnboardingStep2();
  });
}

function renderOnboardingStep2() {
  const langs = state.track === 'spoken' ? spokenLanguages : programmingLanguages;
  updateCharacter('nova', "Great! Which specific language should I generate lessons for?");
  screenContainer.innerHTML = `
    <div class="selection-grid">
      ${langs.map(l => `<div class="card" data-lang="${l.id}">${l.icon} ${l.name}</div>`).join('')}
    </div>
  `;
  document.querySelectorAll('.card').forEach(card => card.onclick = async () => {
    state.language = card.dataset.lang;
    state.sessionInitialized = false; // Force new pool for new language/session
    state.sessionProgress = 0;
    state.sessionPool = [];
    await startLesson();
  });
}

// --- REAL-TIME GENERATOR ---
async function startLesson() {
  state.isGenerating = true;
  updateCharacter('byte', "Loading next challenge... 🧠");

  // Only initialize ONCE per session
  if (!state.sessionInitialized) {
    await initializeSessionPool();
    state.sessionInitialized = true;
  }

  setTimeout(() => {
    // Check if session is complete
    if (state.sessionProgress >= state.sessionTotal) {
        completeSession();
        return;
    }

    // If pool is empty before session is complete, just end session
    if (state.sessionPool.length === 0) {
        completeSession();
        return;
    }

    const lesson = state.sessionPool.pop();
    state.currentLesson = lesson;
    state.currentQuestionId = lesson.id || `gen_${Math.random()}`;

    updateProgressBar();

    if (lesson.type === 'teaching') {
      renderTeachingSlide(lesson);  // <-- dedicated function
    } else if (lesson.type === 'sentence') {
      renderSentenceBuilder(lesson);
    } else {
      renderQuizScreen(lesson);
    }
    
    state.isGenerating = false;
  }, 400);
}

// Teaching slide ALWAYS increments sessionProgress when dismissed
function renderTeachingSlide(lesson) {
  updateCharacter(lesson.character || 'byte', lesson.instruction || "Let's learn something new!");
  screenContainer.innerHTML = `
    <div class="progress-header">
       <div class="progress-bar-container"><div id="progress-bar-fill" style="width: ${(state.sessionProgress / state.sessionTotal) * 100}%"></div></div>
    </div>
    <div class="lesson-card teaching-card">
      <div class="teaching-header">
        <span class="teaching-badge">📖 Lesson</span>
        <h2>${lesson.title}</h2>
      </div>
      <div class="analogy-box">
        <p>${lesson.explanation || ''}</p>
        ${lesson.analogy ? `<p class="analogy">💡 <em>${lesson.analogy}</em></p>` : ''}
      </div>
      <p class="instruction-box">${lesson.instruction || ''}</p>
      <button id="understand-btn" class="primary-btn">I Understand! ✅</button>
    </div>
  `;
  // CRITICAL: Teaching slides count toward session progress
  document.getElementById('understand-btn').onclick = async () => {
    state.sessionProgress++; // Count teaching slide as 1 session item
    await startLesson();
  };
}

async function initializeSessionPool() {
    state.sessionPool = [];
    state.sessionProgress = 0;

    const trackLessons = lessons[state.track]?.[state.language]?.[state.difficulty] || [];
    const seenIds = new Set(state.answeredQuestions); // IDs seen this session + before

    // --- Step 1: Add handcrafted lessons (filter already seen) ---
    const freshHandcrafted = trackLessons.filter(l => !seenIds.has(l.id));
    for (const l of freshHandcrafted) seenIds.add(l.id);

    // --- Step 2: Generate a large candidate pool locally (always available) ---
    const CANDIDATE_COUNT = 30; // Generate many, filter dupes
    const candidates = [];
    let attempts = 0;
    while (candidates.length < CANDIDATE_COUNT && attempts < 60) {
        attempts++;
        const c = generateRealTimeChallenge();
        if (!seenIds.has(c.id)) {
            candidates.push(c);
            seenIds.add(c.id);
        }
    }

    // Shuffle candidates for variety
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // --- Step 3: Replace local with AI-generated if enabled ---
    if (isAiEnabled()) {
        updateCharacter('byte', "Calling Gemini for truly unique challenges... 🧠");
        const aiPool = [];
        const aiTargetCount = state.sessionTotal - freshHandcrafted.length;

        for (let i = 0; i < aiTargetCount; i++) {
            try {
                const aiLesson = await generateAiLesson(
                    state.track, state.language, state.difficulty,
                    new Set([...state.answeredQuestions, ...aiPool.map(x => x.id)])
                );
                if (aiLesson && aiLesson.id && !seenIds.has(aiLesson.id)) {
                    aiPool.push(aiLesson);
                    seenIds.add(aiLesson.id);
                }
            } catch (e) {
                console.warn(`AI lesson ${i + 1} failed, will use local fallback`);
            }
        }

        // Merge: handcrafted + AI + local fallback for missing slots
        const localFallback = candidates.slice(0, Math.max(0, state.sessionTotal - freshHandcrafted.length - aiPool.length));
        state.sessionPool = [...[...freshHandcrafted, ...aiPool, ...localFallback]].reverse();
    } else {
        // Local only: handcrafted + shuffled local candidates
        const localItems = candidates.slice(0, state.sessionTotal - freshHandcrafted.length);
        state.sessionPool = [...freshHandcrafted, ...localItems].reverse();
    }

    // Ensure we always have exactly sessionTotal unique items
    state.sessionPool = state.sessionPool.slice(-state.sessionTotal);
    console.log(`Session pool ready: ${state.sessionPool.length} unique items`);
}

function updateProgressBar() {
    const progress = (state.sessionProgress / state.sessionTotal) * 100;
    const bar = document.getElementById('progress-bar-fill');
    if (bar) bar.style.width = `${progress}%`;
}


function generateRealTimeChallenge() {
  if (state.track === 'programming') {
    const syntax = syntaxMap[state.language] || syntaxMap['python'];
    const types = Object.keys(syntax);
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Variety parameters
    const varNames = {
        python: ['user_list', 'data_stream', 'magic_num', 'result_set', 'config_dict'],
        javascript: ['elements', 'dataResponse', 'magicValue', 'results', 'appConfig'],
        cpp: ['myArray', 'inputVal', 'dataObject', 'result_ptr', 'setting']
    };
    const langVars = varNames[state.language] || varNames['python'];
    const varName = langVars[Math.floor(Math.random() * langVars.length)];
    const val = Math.floor(Math.random() * 500);
    
    let code = syntax[type].replace('name', varName).replace('x', val);
    if (state.language === 'python') {
        code = code.replace('Hello', 'Pythonic World').replace('items', varName);
    } else if (state.language === 'javascript') {
        code = code.replace('Hello', 'JS Scripting').replace('list', varName);
    } else if (state.language === 'cpp') {
        code = code.replace('Hello', 'System C++').replace('v', varName);
    }

    const decoys = ['Loop', 'Variable', 'Function', 'Print', 'Array', 'Vector', 'Pointer', 'Class', 'Semicolon', 'Import'].filter(d => d.toLowerCase() !== type);
    
    const challenges = [
      `Analyze this **${state.language.toUpperCase()}** snippet:`,
      `What is the purpose of this **${state.language}** code?`,
      `Identify the feature being used here:`,
      `How does **${state.language}** treat this line?`
    ];

    const qId = `prog_${state.language}_${code}`;

    const langExplanations = {
        python: `Python is known for its readability. This snippet uses **${type}** to keep things clean and efficient!`,
        javascript: `In Modern JavaScript, **${type}** helps us build interactive web apps with concise syntax.`,
        cpp: `C++ is a powerful system language. Here, **${type}** allows for precise control over memory and logic.`
    };
    
    return {
      id: qId,
      type: 'quiz',
      character: 'byte',
      title: `AI ${state.language.charAt(0).toUpperCase() + state.language.slice(1)} Lab`,
      code: code,
      challenge: challenges[Math.floor(Math.random() * challenges.length)],
      options: [type.charAt(0).toUpperCase() + type.slice(1), ...decoys.sort(() => 0.5 - Math.random()).slice(0, 3)].sort(() => 0.5 - Math.random()),
      answer: type.charAt(0).toUpperCase() + type.slice(1),
      explanation: langExplanations[state.language] || `In coding, \`${code}\` is a standard way to perform a **${type}** operation.`
    };
  } else {
    const bank = wordBank[state.language] || wordBank['spanish'];
    const categories = Object.keys(bank);
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const item = bank[cat][Math.floor(Math.random() * bank[cat].length)];
    
    if (cat === 'phrases' && item.chips) {
        return {
            id: `phrase_${state.language}_${item.word}`,
            type: 'sentence',
            character: 'lingo',
            title: 'Sentence Builder',
            translation: item.translation,
            answerChips: item.chips,
            guide: item.guide,
            options: [...item.chips, ...['se', 'la', 'un', 'el'].slice(0, 2)].sort(() => 0.5 - Math.random()),
            explanation: `Great job! "${item.word}" means "${item.translation}".`
        };
    }

    const allWords = Object.values(bank).flat().map(i => i.word);
    const decoys = allWords.filter(w => w !== item.word);

    const qId = `spoken_${state.language}_${item.word}`;

    const challengeTemplates = [
      `Choose the correct word for "${item.translation}":`,
      `How do you say "${item.translation}"?`,
      `Translate "${item.translation}" to ${state.language}:`,
      `Pick the "${item.translation}" equivalent:`
    ];

    return {
      id: qId,
      type: 'quiz',
      character: 'lingo',
      title: 'AI Language Lab',
      concept: `Translation Mastery: "${item.translation}"`,
      challenge: challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)],
      options: [item.word, ...decoys.sort(() => 0.5 - Math.random()).slice(0, 3)].sort(() => 0.5 - Math.random()),
      answer: item.word,
      explanation: `🚀 **Fun Fact:** "${item.word}" means "${item.translation}". It sounds like "*${item.guide}*". Keep practicing this to sound like a local!`
    };
  }
}

// Wrapper to ensure uniqueness
function generateUniqueChallenge() {
  let challenge;
  let attempts = 0;
  const maxAttempts = 20;

  do {
    challenge = generateRealTimeChallenge();
    attempts++;
  } while (state.answeredQuestions.has(challenge.id) && attempts < maxAttempts);

  // If we've exhausted options, clear some history to allow variety again
  if (attempts >= maxAttempts) {
    const historyArray = Array.from(state.answeredQuestions);
    state.answeredQuestions = new Set(historyArray.slice(Math.floor(historyArray.length / 2)));
  }

  state.currentQuestionId = challenge.id;
  return challenge;
}

// --- UI ---
function renderSentenceBuilder(lesson) {
  updateCharacter(lesson.character, "Build the sentence! Match the chips to the translation.");
  let buildArea = [];
  
  const updateUI = () => {
    screenContainer.innerHTML = `
      <div class="lesson-card">
        <div class="progress-header">
           <div class="progress-bar-container"><div id="progress-bar-fill" style="width: ${(state.sessionProgress / state.sessionTotal) * 100}%"></div></div>
        </div>
        <h2>${lesson.title}</h2>
        <p class="translation-text">"${lesson.translation}"</p>
        
        <div class="build-area" id="build-area">
          ${buildArea.map((word, i) => `<button class="chip build-chip" data-idx="${i}">${word}</button>`).join('')}
          ${buildArea.length === 0 ? '<div class="build-placeholder">Tap words to build</div>' : ''}
        </div>
      </div>
      
      <div class="options-container">
        <div class="chips-grid">
          ${lesson.options.map((opt, i) => {
            const isUsed = buildArea.includes(opt); // Simple check for now
            return `<button class="chip option-chip ${isUsed ? 'used' : ''}" data-word="${opt}">${opt}</button>`;
          }).join('')}
        </div>
      </div>
      
      <div class="action-footer">
        <button id="check-sentence-btn" class="primary-btn" ${buildArea.length === 0 ? 'disabled' : ''}>Check Answer</button>
      </div>
    `;

    document.querySelectorAll('.option-chip:not(.used)').forEach(chip => {
      chip.onclick = () => { buildArea.push(chip.dataset.word); updateUI(); };
    });

    document.querySelectorAll('.build-chip').forEach(chip => {
      chip.onclick = () => { buildArea.splice(chip.dataset.idx, 1); updateUI(); };
    });

    document.getElementById('check-sentence-btn').onclick = () => {
      const isCorrect = buildArea.join(' ') === lesson.answerChips.join(' ');
      state.selectedOption = buildArea.join(' ');
      checkAnswer({ ...lesson, answer: lesson.answerChips.join(' ') });
    };
  };

  updateUI();
}

function renderQuizScreen(lesson) {
  updateCharacter(lesson.character, "Your AI Challenge is ready! Analyze it carefully.");
  screenContainer.innerHTML = `
    <div class="progress-header">
       <div class="progress-bar-container"><div id="progress-bar-fill" style="width: ${(state.sessionProgress / state.sessionTotal) * 100}%"></div></div>
    </div>
    <div class="lesson-card">
      <h2>${lesson.title}</h2>
      ${lesson.code ? `<pre class="code-block">${lesson.code}</pre>` : ''}
      ${lesson.concept ? `<p>${lesson.concept}</p>` : ''}
    </div>
    <div class="lesson-card">
      <p><strong>Quest:</strong> ${lesson.challenge}</p>
      <div class="options-list">
        ${lesson.options.map(opt => `<button class="option-btn">${opt}</button>`).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.option-btn').forEach(btn => btn.onclick = () => {
    state.selectedOption = btn.textContent;
    checkAnswer(lesson);
  });
}

function checkAnswer(lesson) {
  const isCorrect = state.selectedOption === lesson.answer;
  if (isCorrect) {
    audio.correct.play().catch(() => { }); // Play success sound
    state.xp += 15; state.streak += 1; state.gems += 5;
    saveProgress();
    state.answeredQuestions.add(state.currentQuestionId); // Mark as used
    showFeedback(true, "AI confirmed: Perfect! Move to next world.");

    // Auto-next for correct answer after a short joy delay
    setTimeout(async () => {
      feedbackLayer.classList.remove('show');
      state.sessionProgress++; // IMPORTANT: Increment progress here!
      await startLesson();
    }, 1200);

  } else {
    audio.wrong.play().catch(() => { }); // Play error sound
    state.streak = 0;
    showFeedback(false, lesson.explanation);
  }
  updateStats();
}

function showFeedback(isCorrect, explanation) {
  feedbackLayer.classList.remove('error');
  if (!isCorrect) feedbackLayer.classList.add('error');

  feedbackLayer.classList.add('show');

  const icon = document.getElementById('feedback-icon');
  const title = document.getElementById('feedback-title');
  const msg = document.getElementById('feedback-msg');

  if (isCorrect) {
    icon.textContent = '🎉';
    title.textContent = 'CORRECT!';
    msg.textContent = 'Analyzing your success... Path verified!';
    document.getElementById('fb-continue-btn').style.display = 'none'; // Auto-progress handles it
  } else {
    icon.innerHTML = '<span class="big-red-cross">❌</span>';
    title.textContent = 'INCORRECT';
    msg.innerHTML = `<div class="ai-explanation">🤖 **Tutoring Session:** ${explanation}</div>`;
    document.getElementById('fb-continue-btn').style.display = 'block';
    document.getElementById('fb-continue-btn').textContent = 'Try Next One';
  }
}

document.getElementById('fb-continue-btn').onclick = async () => {
  feedbackLayer.classList.remove('show');
  state.sessionProgress++; // Move forward after a quiz too
  await startLesson();
};

function updateStats() {
  xpDisplay.textContent = state.xp;
  streakDisplay.textContent = state.streak;
  const gemsDisplay = document.getElementById('gems-count');
  if (gemsDisplay) gemsDisplay.textContent = state.gems;

  const aiBadge = document.getElementById('ai-status');
  if (aiBadge) {
    const enabled = isAiEnabled();
    aiBadge.textContent = enabled ? 'Gemini AI' : 'Local AI';
    aiBadge.classList.toggle('active', enabled);
  }
}

function saveProgress() {
    localStorage.setItem('cq_xp', state.xp);
    localStorage.setItem('cq_streak', state.streak);
    localStorage.setItem('cq_gems', state.gems);
}

function completeSession() {
  updateCharacter('nova', "Amazing! You completed the lesson!");
  screenContainer.innerHTML = `
    <div class="lesson-card finish-card">
       <span class="finish-icon">🏆</span>
       <h2>Session Complete!</h2>
       <p>You earned +50 XP and 25 Diamonds!</p>
       <div class="finish-stats">
          <div class="stat-item"><span>Streak</span> <strong>${state.streak}</strong></div>
          <div class="stat-item"><span>Accuracy</span> <strong>100%</strong></div>
       </div>
       <button id="finish-btn" class="primary-btn">Continue</button>
    </div>
  `;
  state.xp += 50;
  state.gems += 25;
  saveProgress();
  updateStats();
  
  document.getElementById('finish-btn').onclick = () => {
    state.sessionProgress = 0;
    state.sessionPool = [];
    state.sessionInitialized = false; // Allow re-init for next session
    state.answeredQuestions = new Set(); // New session = fresh start
    renderOnboardingStep1();
  };
}

init();
