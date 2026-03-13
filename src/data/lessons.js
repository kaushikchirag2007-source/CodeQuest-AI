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
    { id: 'japanese', name: 'Japanese', icon: '🇯🇵' }
];

export const programmingLanguages = [
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '🌐' },
    { id: 'cpp', name: 'C++', icon: '⚙️' }
];

// --- GENERATOR DATA ---
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
    japanese: {
        greetings: [
            { word: 'Konnichiwa', translation: 'Hello', guide: 'kon-nee-chee-wa' },
            { word: 'Ohayou', translation: 'Good morning', guide: 'oh-hah-yoh' },
            { word: 'Konbanwa', translation: 'Good evening', guide: 'kon-ban-wa' }
        ],
        basics: [
            { word: 'Arigatou', translation: 'Thank you', guide: 'ah-ree-gah-toh' },
            { word: 'Sumimasen', translation: 'Excuse me', guide: 'soo-mee-mah-sen' },
            { word: 'Hai', translation: 'Yes', guide: 'high' },
            { word: 'Iie', translation: 'No', guide: 'ee-eh' }
        ],
        phrases: [
            { word: 'Arigatou gozaimasu', translation: 'Thank you very much', guide: 'ah-ree-gah-toh go-zy-mass', chips: ['Arigatou', 'gozaimasu'] },
            { word: 'Ogenki desu ka', translation: 'How are you?', guide: 'oh-gen-kee dess kah', chips: ['Ogenki', 'desu', 'ka'] }
        ]
    },
    hindi: {
        greetings: [
            { word: 'Namaste', translation: 'Hello', guide: 'na-mas-tay' },
            { word: 'Suprabhat', translation: 'Good morning', guide: 'su-pra-bhaat' },
            { word: 'Shubh ratri', translation: 'Good night', guide: 'shubh raa-tree' },
            { word: 'Shubh sandhya', translation: 'Good evening', guide: 'shubh saan-dhya' },
            { word: 'Alvida', translation: 'Goodbye', guide: 'al-vi-daa' },
            { word: 'Phir milenge', translation: 'See you later', guide: 'phir mi-len-ge' }
        ],
        basics: [
            { word: 'Dhanyavad', translation: 'Thank you', guide: 'dhan-ya-vaad' },
            { word: 'Kripya', translation: 'Please', guide: 'krip-ya' },
            { word: 'Haan', translation: 'Yes', guide: 'haan' },
            { word: 'Nahi', translation: 'No', guide: 'na-hee' },
            { word: 'Theek hai', translation: 'Okay / Fine', guide: 'theek hay' },
            { word: 'Maafi', translation: 'Sorry', guide: 'maa-fee' },
            { word: 'Bilkul', translation: 'Absolutely', guide: 'bil-kul' },
            { word: 'Bahut', translation: 'Very much', guide: 'ba-hut' },
            { word: 'Achcha', translation: 'Good', guide: 'ach-chaa' },
            { word: 'Sundar', translation: 'Beautiful', guide: 'sun-dar' }
        ],
        phrases: [
            { word: 'Aap kaise hain', translation: 'How are you?', guide: 'aap kay-say hain', chips: ['Aap', 'kaise', 'hain'] },
            { word: 'Mujhe maaf kijiye', translation: 'Please forgive me', guide: 'mu-jay maaf kee-jee-ay', chips: ['Mujhe', 'maaf', 'kijiye'] },
            { word: 'Mera naam Rahul hai', translation: 'My name is Rahul', guide: 'ma-raa naam Rahul hay', chips: ['Mera', 'naam', 'Rahul', 'hai'] },
            { word: 'Aap kahan se hain', translation: 'Where are you from?', guide: 'aap ka-haan se hain', chips: ['Aap', 'kahan', 'se', 'hain'] },
            { word: 'Mujhe Hindi aati hai', translation: 'I know Hindi', guide: 'mu-jay Hindi aa-tee hay', chips: ['Mujhe', 'Hindi', 'aati', 'hai'] }
        ],
        numbers: [
            { word: 'Ek', translation: 'One', guide: 'ek' },
            { word: 'Do', translation: 'Two', guide: 'doh' },
            { word: 'Teen', translation: 'Three', guide: 'teen' },
            { word: 'Chaar', translation: 'Four', guide: 'chaar' },
            { word: 'Paanch', translation: 'Five', guide: 'paanch' }
        ]
    },
    spanish: {
        greetings: [
            { word: 'Hola', translation: 'Hello', guide: 'oh-la' },
            { word: 'Buenos días', translation: 'Good morning', guide: 'bway-nos dee-as' },
            { word: 'Buenas noches', translation: 'Good night', guide: 'bway-nas no-ches' },
            { word: 'Buenas tardes', translation: 'Good afternoon', guide: 'bway-nas tar-des' },
            { word: 'Adiós', translation: 'Goodbye', guide: 'ah-dee-os' },
            { word: 'Hasta luego', translation: 'See you later', guide: 'as-ta lway-go' },
            { word: 'Bienvenido', translation: 'Welcome', guide: 'bee-en-ve-nee-do' }
        ],
        basics: [
            { word: 'Gracias', translation: 'Thank you', guide: 'gra-see-as' },
            { word: 'Por favor', translation: 'Please', guide: 'por fa-vor' },
            { word: 'Sí', translation: 'Yes', guide: 'see' },
            { word: 'No', translation: 'No', guide: 'no' },
            { word: 'De nada', translation: "You're welcome", guide: 'de na-da' },
            { word: 'Perdón', translation: 'Sorry / Excuse me', guide: 'per-don' },
            { word: 'Claro', translation: 'Of course', guide: 'klah-ro' },
            { word: 'Quizás', translation: 'Maybe', guide: 'kee-saas' },
            { word: 'Bonito', translation: 'Beautiful', guide: 'bo-nee-to' },
            { word: 'Bien', translation: 'Good / Fine', guide: 'bee-en' }
        ],
        phrases: [
            { word: 'Cómo estás', translation: 'How are you?', guide: 'koh-moh ess-tass', chips: ['Cómo', 'estás'] },
            { word: 'Mucho gusto', translation: 'Nice to meet you', guide: 'moo-cho goos-toh', chips: ['Mucho', 'gusto'] },
            { word: 'Me llamo Ana', translation: 'My name is Ana', guide: 'me ya-mo Ana', chips: ['Me', 'llamo', 'Ana'] },
            { word: 'Hablas inglés', translation: 'Do you speak English?', guide: 'ah-blaas ing-gles', chips: ['Hablas', 'inglés'] }
        ],
        numbers: [
            { word: 'Uno', translation: 'One', guide: 'oo-no' },
            { word: 'Dos', translation: 'Two', guide: 'dos' },
            { word: 'Tres', translation: 'Three', guide: 'tres' },
            { word: 'Cuatro', translation: 'Four', guide: 'kwah-tro' },
            { word: 'Cinco', translation: 'Five', guide: 'seen-ko' }
        ]
    },
    japanese: {
        greetings: [
            { word: 'Konnichiwa', translation: 'Hello', guide: 'kon-nee-chee-wa' },
            { word: 'Ohayou', translation: 'Good morning', guide: 'oh-hah-yoh' },
            { word: 'Konbanwa', translation: 'Good evening', guide: 'kon-ban-wa' },
            { word: 'Oyasumi', translation: 'Good night', guide: 'oh-ya-soo-mee' },
            { word: 'Sayonara', translation: 'Goodbye', guide: 'sa-yoh-na-ra' }
        ],
        basics: [
            { word: 'Arigatou', translation: 'Thank you', guide: 'ah-ree-gah-toh' },
            { word: 'Sumimasen', translation: 'Excuse me', guide: 'soo-mee-mah-sen' },
            { word: 'Hai', translation: 'Yes', guide: 'high' },
            { word: 'Iie', translation: 'No', guide: 'ee-eh' },
            { word: 'Wakarimasu', translation: 'I understand', guide: 'wa-ka-ree-mass' },
            { word: 'Wakarimasen', translation: "I don't understand", guide: 'wa-ka-ree-ma-sen' },
            { word: 'Kawaii', translation: 'Cute', guide: 'ka-wai-ee' },
            { word: 'Sugoi', translation: 'Amazing / Wow', guide: 'soo-goh-ee' },
            { word: 'Itadakimasu', translation: 'Let\'s eat (gratitude)', guide: 'ee-ta-da-kee-mass' }
        ],
        phrases: [
            { word: 'Arigatou gozaimasu', translation: 'Thank you very much', guide: 'ah-ree-gah-toh go-zy-mass', chips: ['Arigatou', 'gozaimasu'] },
            { word: 'Ogenki desu ka', translation: 'How are you?', guide: 'oh-gen-kee dess kah', chips: ['Ogenki', 'desu', 'ka'] },
            { word: 'Watashi wa Tanaka desu', translation: 'I am Tanaka', guide: 'wa-ta-shee wa Ta-na-ka dess', chips: ['Watashi', 'wa', 'Tanaka', 'desu'] }
        ],
        numbers: [
            { word: 'Ichi', translation: 'One', guide: 'ee-chee' },
            { word: 'Ni', translation: 'Two', guide: 'nee' },
            { word: 'San', translation: 'Three', guide: 'san' },
            { word: 'Shi', translation: 'Four', guide: 'shee' },
            { word: 'Go', translation: 'Five', guide: 'go' }
        ]
    },
    french: {
        greetings: [
            { word: 'Bonjour', translation: 'Hello / Good day', guide: 'bon-zhoor' },
            { word: 'Bonsoir', translation: 'Good evening', guide: 'bon-swaar' },
            { word: 'Bonne nuit', translation: 'Good night', guide: 'bon nwee' },
            { word: 'Au revoir', translation: 'Goodbye', guide: 'oh ruh-vwaar' },
            { word: 'Salut', translation: 'Hi (informal)', guide: 'sah-loo' }
        ],
        basics: [
            { word: 'Merci', translation: 'Thank you', guide: 'mer-see' },
            { word: "S'il vous plaît", translation: 'Please', guide: 'see voo play' },
            { word: 'Oui', translation: 'Yes', guide: 'wee' },
            { word: 'Non', translation: 'No', guide: 'noh' },
            { word: 'Pardon', translation: 'Sorry / Excuse me', guide: 'par-don' },
            { word: 'Bien sûr', translation: 'Of course', guide: 'bee-en soor' },
            { word: 'Peut-être', translation: 'Maybe', guide: 'puh-tet-ruh' },
            { word: 'Magnifique', translation: 'Magnificent', guide: 'man-yee-feek' }
        ],
        phrases: [
            { word: 'Comment ça va', translation: 'How are you?', guide: 'kom-mon sah va', chips: ['Comment', 'ça', 'va'] },
            { word: 'Enchanté de vous rencontrer', translation: 'Nice to meet you', guide: 'on-shan-tay', chips: ['Enchanté', 'de', 'vous', 'rencontrer'] }
        ],
        numbers: [
            { word: 'Un', translation: 'One', guide: 'uh' },
            { word: 'Deux', translation: 'Two', guide: 'duh' },
            { word: 'Trois', translation: 'Three', guide: 'twah' },
            { word: 'Quatre', translation: 'Four', guide: 'ka-truh' },
            { word: 'Cinq', translation: 'Five', guide: 'sank' }
        ]
    }
};

export const syntaxMap = {
    python: {
        print: 'print("Welcome to Python!")',
        variable: 'score = 10',
        list: 'items = ["apple", "banana"]',
        loop: 'for i in range(5):',
        function: 'def greet(name):',
        comment: '# Simple Python Comment',
        fstring: 'print(f"User: {name}")'
    },
    javascript: {
        print: 'console.log("Hello, World!");',
        variable: 'const price = 50;',
        array: 'const list = [1, 2, 3];',
        arrow: 'const add = (a, b) => a + b;',
        template: '`Total: ${amount}`',
        comment: '// Standard JS Comment',
        dom: 'document.getElementById("btn")'
    },
    cpp: {
        print: 'std::cout << "Hello C++" << std::endl;',
        variable: 'int age = 21;',
        vector: 'std::vector<int> v = {1, 2};',
        loop: 'for(int i=0; i<5; i++) {',
        function: 'int main() { ... }',
        comment: '// C++ Style Comment',
        include: '#include <iostream>'
    }
};

// --- HANDCRAFTED LESSONS (The Foundation) ---
export const lessons = {
    programming: {
        python: {
            beginner: [
                {
                    id: 'py_0',
                    character: 'byte',
                    title: 'Your First Line of Code',
                    type: 'teaching',
                    explanation: "In Python, we use the `print()` function to talk to the computer. It's like a megaphone!",
                    analogy: "Imagine you're the director of a play, and the computer is your actor. When you say `print('Hello')`, you're telling the actor: 'Say Hello!'",
                    instruction: "Code is just a way to give specific orders to your machine."
                },
                {
                    id: 'py_1',
                    character: 'byte',
                    title: 'Challenge: Megaphone',
                    type: 'quiz',
                    concept: "Let's try using that megaphone!",
                    code: 'print("Hello, Python!")',
                    challenge: 'What will the computer show on its screen when you run this code?',
                    options: ['print', 'Hello, Python!', 'nothing', 'error'],
                    answer: 'Hello, Python!',
                    hint: "Whatever is inside the quotation marks `\" \"` is what gets shouted!"
                },
                {
                    id: 'py_2',
                    character: 'byte',
                    title: 'The Magic Box (Variables)',
                    type: 'teaching',
                    explanation: "In coding, we have **Variables**. They are like boxes where we store things to use later.",
                    analogy: "Think of a lunchbox. You put a 'Sandwich' inside today. Tomorrow, you open the box and find that 'Sandwich'. The box is the **variable**, and the sandwich is the **data**.",
                    instruction: "We can name these boxes anything we want!"
                },
                {
                    id: 'py_3',
                    character: 'byte',
                    title: 'Challenge: The Lunchbox',
                    type: 'quiz',
                    concept: "Look at this box we've created:",
                    code: 'lunchbox = "Pizza"\nprint(lunchbox)',
                    challenge: 'What is inside the variable named `lunchbox`?',
                    options: ['lunchbox', 'Pizza', 'Sandwich', 'Hungry'],
                    answer: 'Pizza',
                    hint: "The value is on the right side of the `=` sign!"
                },
                {
                    id: 'py_4',
                    character: 'byte',
                    title: 'Changing the Box',
                    type: 'teaching',
                    explanation: "You can change what's inside a box at any time! That's why they are called **variables** (because they can *vary*).",
                    analogy: "If you take the pizza out of your lunchbox and put in an apple, the same box now holds something different.",
                    instruction: "The computer always remembers the **last** thing you put in the box."
                }
            ]
        }
    },
    spoken: {
        spanish: {
            beginner: [
                {
                    id: 'es_0',
                    character: 'lingo',
                    title: 'Welcome to Spain!',
                    type: 'teaching',
                    explanation: "Spanish is a vibrant language! The most important word to know is 'Hola', which means 'Hello'.",
                    analogy: "Think of 'Hola' as your key to meeting 500 million people!",
                    instruction: "Let's start your journey by learning how to greet people!"
                },
                {
                    id: 'es_1',
                    character: 'lingo',
                    title: 'The Art of Thanking',
                    type: 'teaching',
                    explanation: "Politeness is huge in Spanish culture. 'Gracias' means 'Thank you'.",
                    analogy: "It's the 'Magic Word' that opens doors and hearts alike!",
                    instruction: "Use it whenever someone helps you out!"
                }
            ]
        },
        hindi: {
            beginner: [
                {
                    id: 'hi_0',
                    character: 'lingo',
                    title: 'Namaste World!',
                    type: 'teaching',
                    explanation: "Hindi is the most popular language in India. 'Namaste' is used for both 'Hello' and 'Goodbye'.",
                    analogy: "It literally means 'I bow to the divine in you.'",
                    instruction: "Fold your hands together when you say it for extra respect!"
                }
            ]
        },
        japanese: {
            beginner: [
                {
                    id: 'jp_0',
                    character: 'lingo',
                    title: 'Japan: The Rising Sun',
                    type: 'teaching',
                    explanation: "Japanese uses different levels of politeness. 'Arigatou' is a friendly 'Thank you'.",
                    analogy: "Think of it like a friendly high-five in word form!",
                    instruction: "Bowing slightly makes it sound even more authentic."
                }
            ]
        }
    }
};
