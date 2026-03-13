import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => localStorage.getItem('gemini_api_key');

export const isAiEnabled = () => !!getApiKey();

const genAI = () => {
    const key = getApiKey();
    if (!key) throw new Error("Gemini API Key missing! Please add it in Settings.");
    return new GoogleGenerativeAI(key);
};

export async function generateAiLesson(track, language, difficulty, seenIds = []) {
    try {
        const model = genAI().getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
            You are an expert ${track === 'programming' ? 'Coding' : 'Language'} tutor like Duolingo.
            Generate a single unique lesson item for a ${difficulty} student learning ${language}.
            
            The output MUST be a strict JSON object.
            
            Option 1: A "teaching" slide (explanation + analogy).
            Option 2: A "quiz" (multiple choice).
            Option 3: A "sentence" builder (for spoken languages only).
            
            Context:
            - Track: ${track}
            - Language: ${language}
            - Difficulty: ${difficulty}
            - Avoid these specific topics/IDs: ${Array.from(seenIds).join(', ')}
            
            Rules:
            1. If track is 'programming', focus on syntax, idioms, and concepts.
            2. If track is 'spoken', focus on vocabulary and grammar.
            3. Make it fun, encouraging, and clear.
            4. Use emojis.
            
            Expected JSON format:
            {
                "id": "unique_string_id",
                "type": "teaching" | "quiz" | "sentence",
                "character": "byte" | "lingo" | "nova",
                "title": "Lesson Title",
                "explanation": "Detailed explanation for teaching/quiz",
                "analogy": "A clever analogy for teaching",
                "instruction": "What to do next",
                "code": "Code snippet for programming quiz (optional)",
                "challenge": "The question text for quiz",
                "options": ["Option A", "Option B", ...],
                "answer": "Correct Option",
                "translation": "English translation for sentence builder",
                "answerChips": ["Part", "of", "sentence"],
                "chips": ["Distractor", "Part", "Part"]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Cleanup JSON if needed (sometimes LLMs wrap in ```json)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Invalid AI response format");
        
        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
}
