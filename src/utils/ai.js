import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
let genAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export const autoCategorizeNote = async (title, body) => {
  if (!genAI) {
    console.warn("No Gemini API Key found. Falling back to default.");
    return { category: "Personal", tags: ["note"] };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
    You are an intelligent note categorizer.
    Categorize the following note into EXACTLY ONE of these categories: "Study", "Work", "Personal", or "Reminder".
    Also, generate 3 relevant, short tags for this note.
    
    Format your response AS A VALID JSON OBJECT exactly like this, nothing else:
    {
      "category": "category_name",
      "tags": ["tag1", "tag2", "tag3"]
    }

    Note Title: ${title}
    Note Body: ${body}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON correctly
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);
    
    // Validate category
    const validCategories = ["Study", "Work", "Personal", "Reminder"];
    const finalCategory = validCategories.includes(data.category) ? data.category : "Personal";

    return {
      category: finalCategory,
      tags: data.tags || []
    };
  } catch (error) {
    console.error("Error auto-categorizing note with AI:", error);
    return { category: "Personal", tags: ["note"] };
  }
};

export const askAIAboutNotes = async (query, notesList) => {
  if (!genAI) {
    return "Please configure your Gemini API Key in the .env file to use the AI chat feature.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Compile all notes into a context block
    const notesContext = notesList.map(n => 
      `Title: ${n.title}\nFolder: ${n.folder}\nContent: ${n.body}`
    ).join("\n\n---\n\n");

    const prompt = `
    You are an intelligent AI assistant living inside the user's "CloudNotes" application.
    Your job is to answer the user's question based strictly on their saved notes provided below.
    If the answer is not contained in the notes, politely mention that you cannot find it in their notes.
    Answer in clean Markdown format with bullet points if helpful, but keep it concise and conversational.
    
    User's Question: ${query}
    
    === USER'S ENTIRE NOTES DATABASE ===
    ${notesContext.length > 0 ? notesContext : "The user currently has no notes saved."}
    ====================================
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error chatting with AI:", error);
    return "I'm sorry, I ran into an issue connecting to my brain! Please try again later.";
  }
};
