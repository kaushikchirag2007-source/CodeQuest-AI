import { characters, spokenLanguages, programmingLanguages, lessons, wordBank, syntaxMap } from './data/lessons.js'
import { isAiEnabled, generateAiLesson } from './services/aiService.js'
import { auth, db, googleProvider } from './services/firebase.js'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// --- Audio ---
const audio = {
  correct: new Audio('https://www.soundjay.com/buttons/sounds/button-37a.mp3'),
  wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3')
};

// --- State ---
// --- State ---
let state = {
  xp: 0,
  streak: 0,
  gems: 0,
  level: 'Beginner',
  track: null,
  language: null,
  difficulty: 'beginner',
  currentLessonIndex: 0,
  activeChar: 'byte',
  selectedOption: null,
  isGenerating: false,
  answeredQuestions: new Set(),
  id: null,
  sessionProgress: 0,
  sessionTotal: 10,
  sessionPool: [],
  sessionInitialized: false,
  currentLesson: null,
  avatar: {
    base: '🤖',
    hair: '',
    eyes: '',
    mouth: '',
    outfit: '',
    accessory: ''
  },
  inventory: [],
  currentMode: 'learn',
  user: null,
  theme: 'light'
};

// Unified Persistence
function saveState() {
  const dataToSave = {
    xp: state.xp,
    streak: state.streak,
    gems: state.gems,
    track: state.track,
    language: state.language,
    avatar: state.avatar,
    inventory: state.inventory,
    displayName: state.displayName,
    theme: state.theme
  };

  // Local Storage (Always save as fallback)
  localStorage.setItem('cq_profile_v2', JSON.stringify(dataToSave));

  // Firebase Cloud Sync
  if (state.user) {
    setDoc(doc(db, 'users', state.user.uid), dataToSave, { merge: true })
      .catch(err => console.error("Cloud Sync Failed:", err));
  }
}

const avatarLayers = {
    base: document.getElementById('avatar-base'),
    hair: document.getElementById('avatar-hair'),
    eyes: document.getElementById('avatar-eyes'),
    mouth: document.getElementById('avatar-mouth'),
    outfit: document.getElementById('avatar-outfit'),
    accessory: document.getElementById('avatar-accessory')
};

// --- DOM ---
const screenContainer = document.getElementById('screen-container');
const charDialogue = document.getElementById('char-dialogue');
const feedbackLayer = document.getElementById('feedback-layer');
const xpDisplay = document.getElementById('xp-count');
const streakDisplay = document.getElementById('streak-count');

let isFirstAuthFire = true;

function init() {
  console.log("App Initializing...");
  
  setupGlobalListeners();

  // 1. Try to recover from LocalStorage first (for instant UI feel)
  const localData = localStorage.getItem('cq_profile_v2');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      Object.assign(state, parsed);
      
      // Apply theme
      document.documentElement.dataset.theme = state.theme || 'light';
      themeSwitch.checked = (state.theme === 'dark');
      
      updateStats();
      updateLayeredAvatar();
      console.log("Local profile recovered.");
    } catch(e) { console.warn("Failed to parse local profile"); }
  }

  setupProfileModal();
  setupNavigation();
  
  onAuthStateChanged(auth, async (user) => {
    console.log("Auth State Changed. User:", user ? user.email : "Logged Out");
    
    if (user) {
      state.user = user;
      updateCharacter('byte', "Connecting to CodeQuest Cloud... 🚀");
      if (document.querySelector('.login-screen')) {
         renderLoadingScreen("Syncing with Cloud...");
      }
      await loadUserProfile(user.uid);
    } else {
      state.user = null;
      // ALWAYS show the path selection screen with the 'Continue' button if data exists
      renderOnboardingStep1();
    }
  });
}

function setupGlobalListeners() {
  // Back button setup
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.onclick = (e) => {
        e.preventDefault();
        console.log("Back button clicked");
        
        // Context-aware back navigation
        if (state.track && !state.language) {
            state.track = null;
            renderOnboardingStep1();
        } else if (state.track && state.language) {
            state.language = null;
            state.sessionInitialized = false;
            renderOnboardingStep2();
        } else {
            state.track = null;
            state.language = null;
            renderOnboardingStep1();
        }
        saveState();
    };
  }

  // Theme switch setup
  const themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) {
    themeSwitch.onchange = (e) => {
        state.theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.dataset.theme = state.theme;
        saveState();
    };
  }
}
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.onclick = () => {
             const mode = item.id.replace('nav-', '');
             if (state.currentMode === mode) return;

             navItems.forEach(i => i.classList.remove('active'));
             item.classList.add('active');
             
             switchMode(mode);
        };
    });
}

function switchMode(mode) {
    state.currentMode = mode;
    console.log("Switching to mode:", mode);
    document.querySelector('.bottom-nav').classList.remove('hidden');
    
    switch(mode) {
        case 'learn':
            renderOnboardingStep1();
            break;
        case 'games':
            renderGamesScreen();
            break;
        case 'shop':
            renderShopScreen();
            break;
    }
}

function renderGamesScreen() {
    updateCharacter('nova', "Ready for a challenge? Pick a game to sharpen your skills!");
    screenContainer.innerHTML = `
        <div class="games-grid">
            <div class="card game-card" onclick="alert('Bug Wars coming soon!')">
                <span class="card-icon">🐛</span>
                <h3>Bug Wars</h3>
                <p>Speed debugging challenge</p>
            </div>
            <div class="card game-card" onclick="alert('Code Clash coming soon!')">
                <span class="card-icon">⚔️</span>
                <h3>Code Clash</h3>
                <p>Battle other coders</p>
            </div>
        </div>
    `;
}

function renderShopScreen() {
    updateCharacter('byte', "Spend your 💎 Diamonds to look awesome! New items every day.");
    screenContainer.innerHTML = `
        <div class="shop-screen">
            <div class="shop-tabs">
                <button class="shop-tab active">Hair</button>
                <button class="shop-tab">Outfits</button>
                <button class="shop-tab">Extras</button>
            </div>
            <div id="shop-items-grid" class="selection-grid">
                <!-- Shop items will be rendered here -->
                <p style="padding: 20px; color: var(--color-text-light)">Shop inventory loading...</p>
            </div>
        </div>
    `;
    renderShopItems();
}

const shopItems = [
    { id: 'hair_punk', category: 'hair', name: 'Punk Hair', icon: '🤘', price: 100 },
    { id: 'hair_afro', category: 'hair', name: 'Afro Style', icon: '🥦', price: 120 },
    { id: 'outfit_cape', category: 'outfit', name: 'Hero Cape', icon: '🦸', price: 250 },
    { id: 'outfit_suit', category: 'outfit', name: 'James Bond', icon: '🤵', price: 300 },
    { id: 'accessory_glasses', category: 'accessory', name: 'Cool Glasses', icon: '🕶️', price: 50 },
    { id: 'accessory_crown', category: 'accessory', name: 'Royal Crown', icon: '👑', price: 500 }
];

function renderShopItems() {
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = shopItems.map(item => `
        <div class="card shop-item" onclick="purchaseItem('${item.id}')">
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <h4>${item.name}</h4>
                <div class="item-price">💎 ${item.price}</div>
            </div>
        </div>
    `).join('');
}

window.purchaseItem = async (itemId) => {
    const item = shopItems.find(i => i.id === itemId);
    
    // Confirmation Dialog
    const confirmed = confirm(`Do you want to purchase ${item.name} for 💎 ${item.price}?`);
    if (!confirmed) return;

    if (state.gems < item.price) {
        alert("Not enough diamonds! Keep learning to earn more.");
        return;
    }

    state.gems -= item.price;
    state.inventory.push(itemId);
    state.avatar[item.category] = item.icon;
    
    updateStats();
    updateLayeredAvatar();
    saveState(); // Correctly save to BOTH LocalStorage and Cloud
    
    alert(`Purchased ${item.name}! Check your new look!`);
};

function updateLayeredAvatar() {
    const layers = {
        base: document.getElementById('avatar-base'),
        hair: document.getElementById('avatar-hair'),
        eyes: document.getElementById('avatar-eyes'),
        mouth: document.getElementById('avatar-mouth'),
        outfit: document.getElementById('avatar-outfit'),
        accessory: document.getElementById('avatar-accessory')
    };
    
    Object.keys(state.avatar).forEach(layer => {
        if (layers[layer]) {
            layers[layer].textContent = state.avatar[layer];
        }
    });
}

function renderLoadingScreen(msg = "Loading...") {
  screenContainer.innerHTML = `
    <div class="loading-screen">
      <div class="loader-spinner"></div>
      <p>${msg}</p>
    </div>
  `;
}

async function loadUserProfile(uid) {
  console.log("Cloud sync for:", uid);
  const docRef = doc(db, 'users', uid);
  
  try {
    const docSnap = await getDoc(docRef);
    
    document.querySelector('.header').style.display = 'flex';
    document.querySelector('.bottom-nav').classList.remove('hidden');
    screenContainer.innerHTML = '';

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Merge cloud data into state
      state.xp = data.xp ?? state.xp;
      state.gems = data.gems ?? state.gems;
      state.streak = data.streak ?? state.streak;
      state.displayName = data.displayName || state.displayName;
      state.avatar = data.avatar || state.avatar;
      state.inventory = data.inventory || state.inventory;
      state.track = data.track || state.track;
      state.language = data.language || state.language;
      
      saveState(); // Update local storage with cloud data
      updateStats();
      updateLayeredAvatar();
      
      // Don't auto-start, let them see the 'Continue' button on the path screen
      renderOnboardingStep1();
    } else {
      // First time cloud user, but might have guest progress
      saveState(); // Ensure cloud gets whatever we have
      renderOnboardingStep1();
    }
  } catch (err) {
    console.warn("Cloud sync failed, continuing with local state:", err);
    document.querySelector('.header').style.display = 'flex';
    document.querySelector('.bottom-nav').classList.remove('hidden');
    renderOnboardingStep1();
  }
}

function renderLoginScreen() {
  // Hide UI for login
  document.querySelector('.header').style.display = 'none';
  document.querySelector('.bottom-nav').style.display = 'none';

  updateCharacter('byte', "Welcome back, Pioneer! Log in to sync your progress across the multiverse.");
  screenContainer.innerHTML = `
    <div class="login-screen">
      <h1 class="screen-title">Quest Begins Here</h1>
      <div class="auth-methods">
        <button id="google-login-btn" class="primary-btn google-btn">
          <span class="btn-icon">🌐</span> Sign in with Google
        </button>
      </div>
      <p class="guest-note">Or <a href="#" id="guest-login-btn">Continue as Guest</a></p>
    </div>
  `;
  
  document.getElementById('google-login-btn').onclick = () => {
    signInWithPopup(auth, googleProvider)
      .then(() => console.log("Sign-in successful"))
      .catch((error) => {
        console.error("Auth Error (Google):", error.code, error.message);
        alert(`Sign-in failed: ${error.message}`);
      });
  };
  
  document.getElementById('guest-login-btn').onclick = (e) => {
    e.preventDefault();
    // Keep UI hidden during guest avatar creation
    renderFirstTimeOnboarding();
  };
}

function renderFirstTimeOnboarding(isEdit = false) {
  updateCharacter('nova', isEdit ? "Ready for a new look? Tweak your hero!" : "Welcome, Recruit! Let's design your hero. Choose your features!");
  
  // Temporary state for the editor
  const previewAvatar = { ...state.avatar };
  
  const categories = {
    base: ['🤖', '🦊', '👾', '🦜', '🌟', '🧙', '🐱', '🐶', '🦄', '🐲'],
    hair: ['', '🤘', '🥦', '👱', '👩‍🦰', '💇'],
    outfit: ['', '🦸', '🤵', '👗', '🧥'],
    accessory: ['', '🕶️', '👑', '🎓', '🎧']
  };

  screenContainer.innerHTML = `
    <div class="avatar-creator">
      <div class="creator-preview">
        <div class="selection-grid" id="creator-options">
          <!-- Options injected here -->
        </div>
      </div>
      <div class="creator-tabs">
          <button class="creator-tab active" data-cat="base">Body</button>
          <button class="creator-tab" data-cat="hair">Hair</button>
          <button class="creator-tab" data-cat="outfit">Outfit</button>
          <button class="creator-tab" data-cat="accessory">Extras</button>
      </div>
      <div class="input-group" style="margin-top: 20px; ${isEdit ? 'display:none' : ''}">
        <input type="text" id="hero-name" placeholder="Name your Hero..." value="${state.displayName || ''}" style="width: 100%; padding: 12px; border-radius: 12px; border: 2px solid #e5e5e5;">
      </div>
      <button id="finish-creator-btn" class="primary-btn" style="margin-top: 20px; width: 100%;">${isEdit ? 'Save Changes' : 'Complete Profile'}</button>
    </div>
  `;

  const optionsGrid = document.getElementById('creator-options');
  const nameInput = document.getElementById('hero-name');
  const finishBtn = document.getElementById('finish-creator-btn');

  function renderCategory(cat) {
    optionsGrid.innerHTML = categories[cat].map(icon => `
      <div class="card avatar-opt ${previewAvatar[cat] === icon ? 'selected' : ''}" data-icon="${icon}">
        ${icon || '❌'}
      </div>
    `).join('');

    document.querySelectorAll('.avatar-opt').forEach(opt => {
      opt.onclick = () => {
        previewAvatar[cat] = opt.dataset.icon;
        updatePreview();
        renderCategory(cat);
      };
    });
  }

  function updatePreview() {
    // Update the real-time preview (the avatar in the character container)
    Object.keys(previewAvatar).forEach(layer => {
        const el = document.getElementById(`avatar-${layer}`);
        if (el) el.textContent = previewAvatar[layer];
    });
  }

  document.querySelectorAll('.creator-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.creator-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCategory(tab.dataset.cat);
    };
  });

  renderCategory('base');

  finishBtn.onclick = async () => {
    const heroName = nameInput.value.trim();
    if (!isEdit && heroName.length < 2) {
      alert("Please give your hero a name!");
      return;
    }

    if (!isEdit) {
      state.displayName = heroName;
      state.xp = 0;
      state.gems = 0;
      state.streak = 0;
    }
    
    state.avatar = { ...previewAvatar };
    saveState();

    // Restore UI for the main app
    document.querySelector('.header').style.display = 'flex';
    document.querySelector('.bottom-nav').style.display = 'flex';
    document.querySelector('.bottom-nav').classList.remove('hidden');

    updateStats();
    updateLayeredAvatar();
    
    // Always return home after edit/create for consistency and focus
    renderOnboardingStep1();
  };
}

function setupProfileModal() {
    const modal = document.getElementById('profile-modal');
    const btn = document.getElementById('profile-btn');
    const closeBtn = document.getElementById('close-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const editBtn = document.getElementById('edit-char-btn');

    if (!modal || !btn) return;

    btn.addEventListener('click', () => {
        const isGuest = !state.user;
        document.getElementById('modal-user-name').textContent = `👤 ${state.displayName || 'Learner'} ${isGuest ? '(Guest)' : ''}`;
        document.getElementById('modal-user-email').textContent = isGuest ? 'Guest Session' : state.user.email;
        document.getElementById('modal-user-avatar').textContent = state.avatar.base || '🤖';
        document.getElementById('modal-xp').textContent = state.xp;
        document.getElementById('modal-streak').textContent = state.streak;
        document.getElementById('modal-gems').textContent = state.gems;
        
        modal.style.display = 'flex';
    });

    if (editBtn) {
        editBtn.onclick = () => {
            modal.style.display = 'none';
            // Hide standard UI for full-screen editor
            document.querySelector('.header').style.display = 'none';
            document.querySelector('.bottom-nav').style.display = 'none';
            renderFirstTimeOnboarding(true); 
        };
    }

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            modal.style.display = 'none';
            location.reload(); // Refresh to clear state
        });
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

function updateCharacter(charId, message) {
  const char = characters[charId];
  state.activeChar = charId;
  
  // Update the base layer of the avatar with the character's icon
  const baseLayer = document.getElementById('avatar-base');
  if (baseLayer) {
    baseLayer.textContent = char.icon;
  }
  
  charDialogue.textContent = message;
  document.body.className = char.theme;
}

// --- ONBOARDING ---
function renderOnboardingStep1() {
  document.querySelector('.bottom-nav').classList.remove('hidden');
  document.getElementById('back-btn').classList.add('hidden');
  
  // Header should be visible if user has ANY progress (XP or Gems) or is returning
  if (state.track || state.xp > 0 || state.gems > 0) {
    document.querySelector('.header').style.display = 'flex';
  } else {
    document.querySelector('.header').style.display = 'none';
  }

  if (!state.track && !state.user && !localStorage.getItem('cq_profile_v2')) {
      renderLoginScreen();
      return;
  }

  const hasHistory = state.track && state.language;
  const continueBtn = hasHistory ? `
    <div class="card continue-card" id="continue-journey-btn" style="grid-column: span 2; border-color: var(--color-primary); background: #f0fff0;">
        <span class="card-icon">🚀</span>
        <h3>Continue your journey</h3>
        <p>Resume ${state.language} lessons</p>
    </div>
  ` : '';

  updateCharacter('byte', hasHistory ? `Welcome back! Ready to continue your ${state.language} quest?` : "👋 I'm your AI tutor! I'll build 100% unique lessons for you in real-time. Pick a path!");
  
  screenContainer.innerHTML = `
    <h1 class="screen-title">Choose your path</h1>
    <div class="selection-grid">
      ${continueBtn}
      <div class="card" data-track="spoken">🌍 Language</div>
      <div class="card" data-track="programming">💻 Coding</div>
    </div>
  `;

  if (hasHistory) {
      document.getElementById('continue-journey-btn').onclick = () => startLesson();
  }

  document.querySelectorAll('.card[data-track]').forEach(card => card.onclick = () => {
    state.track = card.dataset.track; renderOnboardingStep2();
  });
}

function renderOnboardingStep2() {
  document.getElementById('back-btn').classList.remove('hidden');
  const langs = state.track === 'spoken' ? spokenLanguages : programmingLanguages;
  updateCharacter('nova', "Great! Which specific language should I generate lessons for?");
  screenContainer.innerHTML = `
    <h1 class="screen-title">Select ${state.track === 'spoken' ? 'Language' : 'Coding'}</h1>
    <div class="selection-grid">
      ${langs.map(l => `<div class="card" data-lang="${l.id}">${l.icon} ${l.name}</div>`).join('')}
    </div>
  `;
    document.querySelectorAll('.card').forEach(card => card.onclick = async () => {
    state.language = card.dataset.lang;
    state.sessionInitialized = false; 
    state.sessionProgress = 0;
    state.sessionPool = [];
    
    // Save track/lang to Firestore for persistence
    if (state.user) {
        await setDoc(doc(db, 'users', state.user.uid), {
            track: state.track,
            language: state.language
        }, { merge: true });
    }
    
    await startLesson();
  });
}

// --- REAL-TIME GENERATOR ---
async function startLesson() {
  state.isGenerating = true;
  document.querySelector('.bottom-nav').classList.add('hidden');
  document.getElementById('back-btn').classList.remove('hidden');

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
        updateCharacter('byte', "Calling Gemini for unique challenges... 🧠");
        const aiTargetCount = state.sessionTotal - freshHandcrafted.length;
        
        // Concurrent AI Generation
        const aiPromises = Array.from({ length: aiTargetCount }).map(() => 
            generateAiLesson(
                state.track, state.language, state.difficulty,
                new Set([...state.answeredQuestions]) // Simplified set for parallel
            )
        );

        const results = await Promise.allSettled(aiPromises);
        const aiPool = results
            .filter(r => r.status === 'fulfilled' && r.value && r.value.id)
            .map(r => r.value)
            .filter(lesson => !seenIds.has(lesson.id));

        aiPool.forEach(l => seenIds.add(l.id));

        // Merge: handcrafted + AI + local fallback for missing slots
        const localFallback = candidates.slice(0, Math.max(0, state.sessionTotal - freshHandcrafted.length - aiPool.length));
        state.sessionPool = [...freshHandcrafted, ...aiPool, ...localFallback].reverse();
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
  if (!state.language) {
      console.warn("Language missing in state, defaulting to javascript/spanish");
  }

  if (state.track === 'programming') {
    const lang = state.language || 'javascript';
    const syntax = syntaxMap[lang] || syntaxMap['python'];
    const types = Object.keys(syntax);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const varNames = {
        python: ['user_list', 'data_stream', 'magic_num', 'result_set', 'config_dict'],
        javascript: ['elements', 'dataResponse', 'magicValue', 'results', 'appConfig'],
        cpp: ['myArray', 'inputVal', 'dataObject', 'result_ptr', 'setting']
    };
    const langVars = varNames[lang] || varNames['python'];
    const varName = langVars[Math.floor(Math.random() * langVars.length)];
    const val = Math.floor(Math.random() * 500);
    
    let code = syntax[type].replace('name', varName).replace('x', val);
    if (lang === 'python') {
        code = code.replace('Hello', 'Pythonic World').replace('items', varName);
    } else if (lang === 'javascript') {
        code = code.replace('Hello', 'JS Scripting').replace('list', varName);
    } else if (lang === 'cpp') {
        code = code.replace('Hello', 'System C++').replace('v', varName);
    }

    const decoys = ['Loop', 'Variable', 'Function', 'Print', 'Array', 'Vector', 'Pointer', 'Class', 'Semicolon', 'Import'].filter(d => d.toLowerCase() !== type);
    
    const challenges = [
      `Analyze this **${lang.toUpperCase()}** snippet:`,
      `What is the purpose of this **${lang}** code?`,
      `Identify the feature being used here:`,
      `How does **${lang}** treat this line?`
    ];

    const qId = `prog_${lang}_${code}`;

    const langExplanations = {
        python: `Python is known for its readability. This snippet uses **${type}** to keep things clean and efficient!`,
        javascript: `In Modern JavaScript, **${type}** helps us build interactive web apps with concise syntax.`,
        cpp: `C++ is a powerful system language. Here, **${type}** allows for precise control over memory and logic.`
    };
    
    return {
      id: qId,
      type: 'quiz',
      character: 'byte',
      title: `AI ${lang.charAt(0).toUpperCase() + lang.slice(1)} Lab`,
      code: code,
      challenge: challenges[Math.floor(Math.random() * challenges.length)],
      options: [type.charAt(0).toUpperCase() + type.slice(1), ...decoys.sort(() => 0.5 - Math.random()).slice(0, 3)].sort(() => 0.5 - Math.random()),
      answer: type.charAt(0).toUpperCase() + type.slice(1),
      explanation: langExplanations[lang] || `In coding, \`${code}\` is a standard way to perform a **${type}** operation.`
    };
  } else {
    const lang = state.language || 'spanish';
    const bank = wordBank[lang] || wordBank['spanish'];
    const categories = Object.keys(bank);
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const item = bank[cat][Math.floor(Math.random() * bank[cat].length)];
    
    if (cat === 'phrases' && item.chips) {
        return {
            id: `phrase_${lang}_${item.word}`,
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

    const qId = `spoken_${lang}_${item.word}`;

    const challengeTemplates = [
      `Choose the correct word for "${item.translation}":`,
      `How do you say "${item.translation}"?`,
      `Translate "${item.translation}" to ${lang}:`,
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
    audio.correct.play().catch(() => { });
    state.xp += 15; 
    state.streak += 1; 
    state.gems += 5;
    
    saveState();
    state.answeredQuestions.add(state.currentQuestionId);
    showFeedback(true, "AI confirmed: Perfect! Move to next world.");

    setTimeout(async () => {
      feedbackLayer.classList.remove('show');
      state.sessionProgress++;
      // Don't await startLesson here to make UI feel snappier
      startLesson();
    }, 600); // Reduced delay for faster flow

  } else {
    audio.wrong.play().catch(() => { });
    state.streak = 0;
    saveState();
    
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
    aiBadge.style.display = 'none'; // Hidden from users as requested
  }
}

function saveProgress() {
    saveState();
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
  
  if (state.user) {
      setDoc(doc(db, 'users', state.user.uid), {
          xp: state.xp,
          gems: state.gems,
          streak: state.streak
      }, { merge: true }).catch(err => console.error("Firestore sync failed:", err));
  }
  
  updateStats();
  
  document.getElementById('finish-btn').onclick = () => {
    state.sessionProgress = 0;
    state.sessionPool = [];
    state.sessionInitialized = false; 
    state.answeredQuestions = new Set(); 
    renderOnboardingStep1();
  };
}

init();
