export const characters = {
    byte: { name: 'Byte', icon: '🤖', theme: 'default', personality: 'Friendly & Nerdy' },
    loop: { name: 'Loop', icon: '🦊', theme: 'theme-loop', personality: 'Energetic & Playful' },
    glitch: { name: 'Glitch', icon: '👾', theme: 'theme-glitch', personality: 'Dramatic Villain' },
    lingo: { name: 'Lingo', icon: '🦜', theme: 'theme-lingo', personality: 'Adventurous Guide' },
    nova: { name: 'Nova', icon: '🌟', theme: 'default', personality: 'Endlessly Encouraging' },
    sage: { name: 'Sage', icon: '🧙', theme: 'default', personality: 'Wise & Precise' }
};

export const spokenLanguages = [
    { id: 'spanish', name: 'Spanish', icon: '🇪🇸' },
    { id: 'french', name: 'French', icon: '🇫🇷' },
    { id: 'hindi', name: 'Hindi', icon: '🇮🇳' },
    { id: 'japanese', name: 'Japanese', icon: '🇯🇵' },
    { id: 'german', name: 'German', icon: '🇩🇪' },
    { id: 'korean', name: 'Korean', icon: '🇰🇷' }
];

export const programmingLanguages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '🌐' },
    { id: 'rust', name: 'Rust', icon: '🦀' },
    { id: 'cpp', name: 'C++', icon: '⚙️' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'go', name: 'Go', icon: '🚀' }
];

// --- UNIVERSAL WORD BANK (For Generator) ---
export const wordBank = {
    spanish: {
        greetings: [
            { word: 'Hola', translation: 'Hello', guide: 'oh-la' },
            { word: 'Buenos días', translation: 'Good morning', guide: 'bway-nos dee-as' },
            { word: 'Buenas noches', translation: 'Good night', guide: 'bway-nas no-ches' }
        ],
        basics: [
            { word: 'Gracias', translation: 'Thank you', guide: 'gra-see-as' },
            { word: 'Por favor', translation: 'Please', guide: 'por fa-vor' },
            { word: 'Sí', translation: 'Yes', guide: 'see' },
            { word: 'No', translation: 'No', guide: 'no' }
        ]
    },
    french: {
        greetings: [
            { word: 'Bonjour', translation: 'Hello', guide: 'bon-zhure' },
            { word: 'Salut', translation: 'Hi', guide: 'sa-lu' }
        ],
        basics: [
            { word: 'Merci', translation: 'Thank you', guide: 'mer-see' },
            { word: 'S\'il vous plaît', translation: 'Please', guide: 'seel voo play' }
        ]
    },
    hindi: {
        greetings: [
            { word: 'Namaste', translation: 'Hello', guide: 'na-ma-stay' }
        ],
        basics: [
            { word: 'Dhanyavad', translation: 'Thank you', guide: 'dhan-ya-vaad' },
            { word: 'Kripaya', translation: 'Please', guide: 'kri-pa-ya' }
        ]
    }
};

// --- SYNTAX MAP (For Generator) ---
export const syntaxMap = {
    python: {
        print: 'print("___")',
        variable: 'name = "___"',
        comment: '# ___',
        loop: 'for i in range(5):'
    },
    javascript: {
        print: 'console.log("___")',
        variable: 'const name = "___"',
        comment: '// ___',
        loop: 'for (let i = 0; i < 5; i++) {'
    },
    cpp: {
        print: 'std::cout << "___" << std::endl;',
        variable: 'std::string name = "___";',
        comment: '// ___'
    }
};

export const lessons = {
    programming: {
        python: {
            beginner: [
                {
                    id: 'py_b1',
                    character: 'byte',
                    title: 'Lesson 1: The Magic Box',
                    concept: 'Variables are like boxes where we store things.',
                    analogy: 'Imagine having a box labeled "Toys". Inside you put a "Ball". Anytime you want the ball, you just look in the "Toys" box!',
                    code: 'toys = "Ball"\nprint(toys)',
                    challenge: 'What is the "box" name in the code above?',
                    options: ['"Ball"', 'toys', 'print', 'Magic Box'],
                    answer: 'toys',
                    hint: 'It\'s the name on the left side of the equals sign!'
                }
            ]
        }
    },
    spoken: {
        spanish: {
            beginner: [
                {
                    id: 'es_b1',
                    character: 'lingo',
                    title: 'Lesson 1: Hola!',
                    greeting: '¡Hola! Ready to explore Spanish?',
                    vocab: [
                        { word: 'Hola', translation: 'Hello', guide: 'oh-la' },
                        { word: 'Gracias', translation: 'Thank you', guide: 'gra-see-as' },
                        { word: 'Por favor', translation: 'Please', guide: 'por fa-vor' }
                    ],
                    culture: 'In many Spanish-speaking countries, people greet each other with a kiss on the cheek!',
                    challenge: 'How do you say "Thank you" in Spanish?',
                    options: ['Hola', 'Gracias', 'Por favor', 'Adios'],
                    answer: 'Gracias'
                }
            ]
        }
    }
};
