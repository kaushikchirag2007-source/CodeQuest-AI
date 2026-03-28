export const courseCatalog = [
  {
    id: 'python-foundations',
    title: 'Python Foundations',
    subtitle: 'Automation, APIs, and clean problem solving.',
    type: 'coding',
    language: 'Python',
    access: 'free',
    priceLabel: 'Free',
    track: 'Beginner to Advanced',
    duration: '8 weeks',
    lessons: 26,
    quizzes: 9,
    rating: 4.9,
    members: '18.2k learners',
    heroMetric: '92% average lesson completion',
    outcomes: [
      'Write reusable functions and automation scripts.',
      'Read API responses and transform data safely.',
      'Debug loops, conditionals, and common syntax errors.'
    ],
    modules: [
      {
        stage: 'Beginner',
        title: 'Python Core',
        description: 'Variables, conditions, loops, and readable syntax.',
        lessons: ['Hello Python', 'Control flow', 'Collections', 'Functions'],
        quiz: 'Syntax sprint'
      },
      {
        stage: 'Intermediate',
        title: 'Data Workflows',
        description: 'File handling, APIs, and data cleanup patterns.',
        lessons: ['CSV pipelines', 'JSON basics', 'Requests and retries'],
        quiz: 'Automation lab'
      },
      {
        stage: 'Advanced',
        title: 'Production Thinking',
        description: 'Testing, packaging, and debugging habits.',
        lessons: ['Unit tests', 'Error handling', 'Project structure'],
        quiz: 'Ship-ready challenge'
      }
    ],
    codingStudio: {
      runner: 'python-heuristic',
      title: 'Normalize learner names',
      prompt: 'Write a function `normalize_name(name)` that trims whitespace and returns the value in title case.',
      hint: 'Use `strip()` before `title()`.',
      starterCode:
        'def normalize_name(name):\n' +
        '    # Clean the learner name before saving it\n' +
        '    return ""\n',
      tests: [
        {
          label: 'Defines the expected function signature',
          pattern: 'def\\s+normalize_name\\(name\\)\\s*:',
          message: 'Start by defining `normalize_name(name)`.'
        },
        {
          label: 'Trims whitespace',
          pattern: '\\.strip\\(',
          message: 'Use `strip()` so leading and trailing spaces are removed.'
        },
        {
          label: 'Applies title case',
          pattern: '\\.title\\(',
          message: 'Use `title()` so the final answer is properly cased.'
        },
        {
          label: 'Returns the cleaned value',
          pattern: 'return\\s+.+',
          message: 'Return the normalized value from the function.'
        }
      ],
      explanation: 'This browser build uses structure-aware grading for Python challenges so learners still get instant feedback without a separate interpreter.'
    }
  },
  {
    id: 'javascript-web-apps',
    title: 'JavaScript Web Apps',
    subtitle: 'Modern browser logic, arrays, and UI problem solving.',
    type: 'coding',
    language: 'JavaScript',
    access: 'free',
    priceLabel: 'Free',
    track: 'Beginner to Advanced',
    duration: '10 weeks',
    lessons: 31,
    quizzes: 11,
    rating: 4.9,
    members: '24.4k learners',
    heroMetric: '4.8/5 learner satisfaction',
    outcomes: [
      'Build interactive frontends with arrays, objects, and async flows.',
      'Ship reusable UI logic and safer state updates.',
      'Practice interview-style coding challenges in the browser.'
    ],
    modules: [
      {
        stage: 'Beginner',
        title: 'Language Fundamentals',
        description: 'Variables, conditionals, loops, and arrays.',
        lessons: ['Values and types', 'Branching logic', 'Loop patterns', 'Array basics'],
        quiz: 'Core syntax checkpoint'
      },
      {
        stage: 'Intermediate',
        title: 'Interactive Interfaces',
        description: 'DOM updates, events, and state-driven UI.',
        lessons: ['Event handling', 'Array transforms', 'Fetch workflows'],
        quiz: 'Browser lab'
      },
      {
        stage: 'Advanced',
        title: 'Application Thinking',
        description: 'Testing, architecture, and performance tradeoffs.',
        lessons: ['State models', 'Debugging flows', 'System design basics'],
        quiz: 'Feature shipping challenge'
      }
    ],
    codingStudio: {
      runner: 'javascript',
      title: 'Sum completed XP',
      prompt: 'Implement `sumCompletedXP(lessons)` so it returns the total `xp` for every lesson whose `completed` field is `true`.',
      hint: 'Filter for completed lessons, then total their xp values.',
      starterCode:
        'function sumCompletedXP(lessons) {\n' +
        '  // Return the total xp for completed lessons only\n' +
        '  return 0;\n' +
        '}\n\n' +
        'const sampleLessons = [\n' +
        '  { title: "Loops", xp: 20, completed: true },\n' +
        '  { title: "Arrays", xp: 15, completed: false },\n' +
        '  { title: "Objects", xp: 25, completed: true }\n' +
        '];\n',
      runExpression: 'sumCompletedXP(sampleLessons)',
      tests: [
        {
          label: 'Sample lessons',
          expression: 'sumCompletedXP(sampleLessons)',
          expected: 45
        },
        {
          label: 'Empty list',
          expression: 'sumCompletedXP([])',
          expected: 0
        },
        {
          label: 'Mixed completion values',
          expression:
            'sumCompletedXP([{ xp: 5, completed: true }, { xp: 7, completed: true }, { xp: 8, completed: false }])',
          expected: 12
        }
      ],
      explanation: 'A clean solution usually combines iteration with a completion guard. The grader runs your function against multiple datasets.'
    }
  },
  {
    id: 'algorithms-interviews',
    title: 'Algorithms Interview Lab',
    subtitle: 'Patterns, complexity, and whiteboard-to-production thinking.',
    type: 'coding',
    language: 'JavaScript',
    access: 'pro',
    priceLabel: 'Included in Pro',
    track: 'Intermediate to Advanced',
    duration: '6 weeks',
    lessons: 18,
    quizzes: 6,
    rating: 4.8,
    members: '8.1k learners',
    heroMetric: 'Used by 140+ interview prep cohorts',
    outcomes: [
      'Practice arrays, strings, hash maps, and windowing patterns.',
      'Explain tradeoffs clearly during peer reviews.',
      'Build confidence under timed challenge conditions.'
    ],
    modules: [
      {
        stage: 'Intermediate',
        title: 'Pattern Recognition',
        description: 'Sliding windows, hash maps, and two pointers.',
        lessons: ['Frequency maps', 'Window resizing', 'Pointer scans'],
        quiz: 'Pattern drill'
      },
      {
        stage: 'Advanced',
        title: 'Interview Delivery',
        description: 'Complexity explanations and refactoring pressure.',
        lessons: ['Communicating tradeoffs', 'Test-first thinking', 'Optimization passes'],
        quiz: 'Mock interview'
      }
    ],
    codingStudio: {
      runner: 'javascript',
      title: 'Find the first unique character',
      prompt: 'Return the index of the first unique character in a string. Return `-1` if every character repeats.',
      hint: 'Count first, then scan again in order.',
      starterCode:
        'function firstUniqueChar(text) {\n' +
        '  return -1;\n' +
        '}\n',
      runExpression: 'firstUniqueChar("aabbcddef")',
      tests: [
        {
          label: 'Unique character exists',
          expression: 'firstUniqueChar("aabbcddef")',
          expected: 4
        },
        {
          label: 'All characters repeat',
          expression: 'firstUniqueChar("aabbcc")',
          expected: -1
        }
      ],
      explanation: 'This lab rewards clarity first, then performance discussion.'
    }
  },
  {
    id: 'spanish-conversation',
    title: 'Spanish Conversation Sprint',
    subtitle: 'Vocabulary, speaking confidence, and everyday conversation.',
    type: 'language',
    language: 'Spanish',
    access: 'free',
    priceLabel: 'Free',
    track: 'Beginner to Intermediate',
    duration: '7 weeks',
    lessons: 22,
    quizzes: 8,
    rating: 4.9,
    members: '19.1k learners',
    heroMetric: 'Used by 3,200 weekly streak learners',
    outcomes: [
      'Handle greetings, travel, and food situations with confidence.',
      'Improve reading, writing, and speaking consistency.',
      'Retain high-frequency vocabulary through spaced repetition.'
    ],
    modules: [
      {
        stage: 'Beginner',
        title: 'Core Survival Phrases',
        description: 'Greetings, introductions, and polite requests.',
        lessons: ['Hello and goodbye', 'Introduce yourself', 'Ask for help'],
        quiz: 'Speaking starter'
      },
      {
        stage: 'Intermediate',
        title: 'Real Conversation',
        description: 'Directions, dining, and everyday rhythm.',
        lessons: ['Ordering food', 'Travel questions', 'Daily routines'],
        quiz: 'Conversation checkpoint'
      }
    ],
    languageStudio: {
      voice: 'es-ES',
      flashcards: [
        {
          id: 'es-hola',
          front: 'Hola',
          back: 'Hello',
          pronunciation: 'oh-lah'
        },
        {
          id: 'es-gracias',
          front: 'Gracias',
          back: 'Thank you',
          pronunciation: 'grah-see-ahs'
        },
        {
          id: 'es-aeropuerto',
          front: 'Aeropuerto',
          back: 'Airport',
          pronunciation: 'ah-eh-ro-pwehr-toh'
        }
      ],
      fillBlank: {
        sentence: 'Yo ___ lista para aprender hoy.',
        answer: 'estoy',
        options: ['soy', 'estoy', 'tengo'],
        hint: 'Use `estoy` for a temporary state.'
      },
      translation: {
        prompt: 'Translate: "Nice to meet you"',
        acceptedAnswers: ['Mucho gusto', 'Encantado'],
        explanation: '`Mucho gusto` is a very common real-world answer.'
      }
    }
  },
  {
    id: 'french-fluency',
    title: 'French Fluency Path',
    subtitle: 'Reading, listening, and speaking habits for daily French.',
    type: 'language',
    language: 'French',
    access: 'pro',
    priceLabel: 'Included in Pro',
    track: 'Beginner to Advanced',
    duration: '9 weeks',
    lessons: 28,
    quizzes: 10,
    rating: 4.8,
    members: '11.7k learners',
    heroMetric: '88% weekly goal completion',
    outcomes: [
      'Build stronger pronunciation and phrase recall.',
      'Practice listening and fill-in-the-blank grammar drills.',
      'Track reading, writing, and speaking as separate skills.'
    ],
    modules: [
      {
        stage: 'Beginner',
        title: 'Foundation Phrases',
        description: 'Greetings, directions, and introductions.',
        lessons: ['Bonjour basics', 'Ask simple questions', 'Numbers and time'],
        quiz: 'Core fluency check'
      },
      {
        stage: 'Advanced',
        title: 'Confident Conversation',
        description: 'Opinions, routines, and role-play scenarios.',
        lessons: ['Expressing preferences', 'Workplace French', 'Travel confidence'],
        quiz: 'Speaking confidence review'
      }
    ],
    languageStudio: {
      voice: 'fr-FR',
      flashcards: [
        {
          id: 'fr-bonjour',
          front: 'Bonjour',
          back: 'Hello / Good day',
          pronunciation: 'bon-zhoor'
        },
        {
          id: 'fr-merci',
          front: 'Merci',
          back: 'Thank you',
          pronunciation: 'mehr-see'
        },
        {
          id: 'fr-gare',
          front: 'Gare',
          back: 'Train station',
          pronunciation: 'gahr'
        }
      ],
      fillBlank: {
        sentence: 'Je ___ pret pour la lecon.',
        answer: 'suis',
        options: ['suis', 'ai', 'vais'],
        hint: 'Use `etre` for identity or current state here.'
      },
      translation: {
        prompt: 'Translate: "Where is the station?"',
        acceptedAnswers: ['Ou est la gare', 'Ou se trouve la gare'],
        explanation: '`Ou est la gare ?` is the fastest everyday version.'
      }
    }
  },
  {
    id: 'japanese-travel',
    title: 'Japanese Travel Essentials',
    subtitle: 'Travel-ready phrases, signs, and speaking confidence.',
    type: 'language',
    language: 'Japanese',
    access: 'purchase',
    priceLabel: '$79 one-time',
    track: 'Beginner',
    duration: '4 weeks',
    lessons: 12,
    quizzes: 4,
    rating: 4.8,
    members: '6.3k learners',
    heroMetric: 'Fastest path to travel confidence',
    outcomes: [
      'Navigate stations, restaurants, and introductions.',
      'Memorize key survival phrases with review cards.',
      'Unlock a printable completion certificate after purchase.'
    ],
    modules: [
      {
        stage: 'Beginner',
        title: 'Travel Survival',
        description: 'Basic signs, greetings, and transport language.',
        lessons: ['Greetings', 'Thank you and sorry', 'Station vocabulary'],
        quiz: 'Trip starter'
      }
    ],
    languageStudio: {
      voice: 'ja-JP',
      flashcards: [
        {
          id: 'jp-konnichiwa',
          front: 'Konnichiwa',
          back: 'Hello',
          pronunciation: 'kon-nee-chee-wah'
        },
        {
          id: 'jp-arigatou',
          front: 'Arigatou',
          back: 'Thank you',
          pronunciation: 'ah-ree-gah-toh'
        }
      ],
      fillBlank: {
        sentence: '___ gozaimasu.',
        answer: 'Arigatou',
        options: ['Arigatou', 'Sayonara', 'Kudasai'],
        hint: 'This phrase means "thank you very much."'
      },
      translation: {
        prompt: 'Translate: "Excuse me"',
        acceptedAnswers: ['Sumimasen'],
        explanation: '`Sumimasen` works for getting attention and saying excuse me.'
      }
    }
  }
];

export const leaderboard = [
  { name: 'Maya R.', xp: 2640, streak: 22, focus: 'JavaScript Web Apps' },
  { name: 'Leo T.', xp: 2415, streak: 19, focus: 'Spanish Conversation Sprint' },
  { name: 'Aisha K.', xp: 2290, streak: 17, focus: 'Python Foundations' },
  { name: 'Jon P.', xp: 2145, streak: 14, focus: 'French Fluency Path' },
  { name: 'You', xp: 1840, streak: 9, focus: 'Code + conversation' }
];

export const forumThreads = [
  {
    id: 'thread-js-1',
    courseId: 'javascript-web-apps',
    title: 'Best way to explain map vs filter to beginners?',
    category: 'Lesson discussion',
    replies: 18,
    activity: '2 hours ago',
    author: 'Priya S.'
  },
  {
    id: 'thread-py-1',
    courseId: 'python-foundations',
    title: 'Share your cleanest function refactor from this week',
    category: 'Project feedback',
    replies: 11,
    activity: '5 hours ago',
    author: 'Marcus D.'
  },
  {
    id: 'thread-es-1',
    courseId: 'spanish-conversation',
    title: 'How are you practicing speaking outside the app?',
    category: 'Speaking practice',
    replies: 24,
    activity: '1 day ago',
    author: 'Elena V.'
  },
  {
    id: 'thread-fr-1',
    courseId: 'french-fluency',
    title: 'French pronunciation resources that pair well with this path',
    category: 'Resources',
    replies: 7,
    activity: '1 day ago',
    author: 'Noah P.'
  }
];

export const practicePartners = [
  {
    id: 'partner-1',
    name: 'Camila',
    focus: 'Spanish speaking drills',
    timezone: 'UTC-5',
    availability: 'Weeknights',
    match: 95,
    note: 'Loves role-play practice for travel and introductions.'
  },
  {
    id: 'partner-2',
    name: 'Olivier',
    focus: 'French conversation exchange',
    timezone: 'UTC+1',
    availability: 'Early mornings',
    match: 90,
    note: 'Happy to alternate between English and French corrections.'
  },
  {
    id: 'partner-3',
    name: 'Rhea',
    focus: 'Python accountability partner',
    timezone: 'UTC+5:30',
    availability: 'Daily sprint blocks',
    match: 88,
    note: 'Pairs nicely with coding streak goals and peer reviews.'
  }
];

export const codeReviewRequests = [
  {
    id: 'review-1',
    project: 'Habit tracker dashboard',
    author: 'Ankit',
    language: 'JavaScript',
    needs: 'State shape review and cleaner event handling',
    due: 'Today'
  },
  {
    id: 'review-2',
    project: 'CSV cleanup utility',
    author: 'Sara',
    language: 'Python',
    needs: 'Function decomposition and naming feedback',
    due: 'Tomorrow'
  },
  {
    id: 'review-3',
    project: 'Flashcard review flow',
    author: 'Mina',
    language: 'JavaScript',
    needs: 'Accessibility checks and test-case suggestions',
    due: 'This week'
  }
];

export const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    summary: 'Start learning with core paths, practice labs, and weekly goals.',
    features: [
      'Access to free coding and spoken-language tracks',
      'Basic progress dashboard and streak tracking',
      'Daily challenges and community browsing'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19 / month',
    highlight: true,
    summary: 'Unlock advanced tracks, certificates, premium analytics, and mentor tools.',
    features: [
      'All Pro courses and advanced learning paths',
      'Completion certificates and premium leaderboards',
      'Priority code reviews and practice partner matching'
    ]
  },
  {
    id: 'team',
    name: 'Teams',
    price: '$79 / month',
    summary: 'Cohort management, shared analytics, and team-based accountability.',
    features: [
      'Manager dashboards for learning cohorts',
      'Private leaderboards and review circles',
      'Admin controls for course bundles and certificates'
    ]
  }
];

export const achievementCatalog = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Enroll in your first learning path.'
  },
  {
    id: 'streak-7',
    name: 'Consistency 7',
    description: 'Maintain a seven-day streak.'
  },
  {
    id: 'code-runner',
    name: 'Code Runner',
    description: 'Pass coding lab checks multiple times.'
  },
  {
    id: 'review-master',
    name: 'Review Master',
    description: 'Complete five spaced repetition reviews.'
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Study two or more spoken languages.'
  },
  {
    id: 'pro-member',
    name: 'Pro Member',
    description: 'Unlock the Pro plan.'
  },
  {
    id: 'course-finisher',
    name: 'Course Finisher',
    description: 'Complete at least one course path.'
  }
];

export const dailyChallenges = [
  {
    id: 'daily-js',
    title: 'Daily coding challenge',
    prompt: 'What should `sumCompletedXP([{ xp: 10, completed: true }, { xp: 7, completed: false }])` return?',
    acceptedAnswers: ['10'],
    rewardXp: 35,
    explanation: 'Only the completed lesson contributes xp.'
  },
  {
    id: 'daily-language',
    title: 'Daily language challenge',
    prompt: 'Translate "Good morning" into Spanish.',
    acceptedAnswers: ['Buenos dias', 'Buenos d\u00edas'],
    rewardXp: 35,
    explanation: '`Buenos dias` is the standard morning greeting.'
  }
];

export const defaultProfile = {
  name: 'Guest Learner',
  email: '',
  authProvider: 'guest',
  headline: 'Building code confidence and spoken-language fluency in one place.',
  streak: 9,
  xp: 1840,
  weeklyGoal: 240,
  weeklyMinutes: 165,
  totalMinutes: 1240,
  leaderboardRank: 5,
  subscription: 'free',
  purchasedCourses: [],
  preferences: {
    onboardingComplete: false,
    primaryCourseId: '',
    preferredTrack: 'language'
  },
  learningGoals: [
    'Ship a polished JavaScript portfolio project',
    'Hold a five-minute Spanish conversation without prompts',
    'Earn one completion certificate this quarter'
  ],
  badges: ['starter', 'streak-7', 'review-master'],
  stats: {
    codeRuns: 4,
    reviewsCompleted: 6,
    languageExercises: 11,
    dailyChallengesCompleted: 3
  },
  lastActiveDate: '2026-03-23',
  dailyChallengeHistory: {},
  courseProgress: {
    'python-foundations': {
      enrolled: true,
      completion: 42,
      quizAverage: 88,
      timeSpent: 230,
      xp: 420,
      currentLesson: 'Functions and control flow',
      nextLesson: 'Collections and loops',
      pathStage: 'Intermediate',
      skills: {
        Syntax: 76,
        Debugging: 61,
        'Problem solving': 67
      }
    },
    'javascript-web-apps': {
      enrolled: true,
      completion: 68,
      quizAverage: 91,
      timeSpent: 310,
      xp: 610,
      currentLesson: 'Array transforms in UI state',
      nextLesson: 'Async data flows',
      pathStage: 'Advanced',
      skills: {
        Syntax: 84,
        Debugging: 72,
        'Problem solving': 79
      }
    },
    'spanish-conversation': {
      enrolled: true,
      completion: 57,
      quizAverage: 86,
      timeSpent: 205,
      xp: 360,
      currentLesson: 'Ordering food with confidence',
      nextLesson: 'Travel questions',
      pathStage: 'Intermediate',
      skills: {
        Reading: 78,
        Writing: 66,
        Speaking: 54
      }
    },
    'french-fluency': {
      enrolled: false,
      completion: 12,
      quizAverage: 81,
      timeSpent: 62,
      xp: 110,
      currentLesson: 'Greetings and introductions',
      nextLesson: 'Ask simple directions',
      pathStage: 'Beginner',
      skills: {
        Reading: 52,
        Writing: 42,
        Speaking: 34
      }
    },
    'japanese-travel': {
      enrolled: false,
      completion: 0,
      quizAverage: 0,
      timeSpent: 0,
      xp: 0,
      currentLesson: 'Getting started',
      nextLesson: 'Travel survival phrases',
      pathStage: 'Beginner',
      skills: {
        Reading: 0,
        Writing: 0,
        Speaking: 0
      }
    }
  },
  reviewQueue: {
    'es-hola': {
      id: 'es-hola',
      prompt: 'Hola',
      answer: 'Hello',
      pronunciation: 'oh-lah',
      courseId: 'spanish-conversation',
      dueOn: '2026-03-24',
      interval: 1,
      ease: 2.4
    },
    'es-gracias': {
      id: 'es-gracias',
      prompt: 'Gracias',
      answer: 'Thank you',
      pronunciation: 'grah-see-ahs',
      courseId: 'spanish-conversation',
      dueOn: '2026-03-24',
      interval: 2,
      ease: 2.5
    },
    'fr-bonjour': {
      id: 'fr-bonjour',
      prompt: 'Bonjour',
      answer: 'Hello / Good day',
      pronunciation: 'bon-zhoor',
      courseId: 'french-fluency',
      dueOn: '2026-03-25',
      interval: 3,
      ease: 2.5
    }
  }
};
