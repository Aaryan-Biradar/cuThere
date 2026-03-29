import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

// Initialize the AI with your API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define your master list of allowed tags
const masterTags = [
    "Academic", 
    "Social", 
    "Career & Networking", 
    "Tech & Software", 
    "Free Food", 
    "Arts & Culture",
    "Sports"
];

// Quick filter: asks Gemini if a post is actually an event or not
export async function isEvent(imageUrl, caption) {
    const imageResponse = await fetch(imageUrl); //
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            `Instructions: Look at this image and caption. Is this promoting a specific event (with a date, time, or location)? Respond with ONLY "yes" or "no", nothing else.`,
            `Caption: ${caption}`,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
    });

    const answer = response.text.trim().toLowerCase();
    return answer === 'yes';
}

export async function analyzeFlyer(imageUrl, caption) {
    // 1. We tell the AI exactly what we want in the prompt
    const prompt = `
        Look at this event flyer and the provided caption. Extract the event details and return ONLY a valid JSON object.
        
        CRITICAL RULE FOR TAGS:
        For the "tags" array, you MUST ONLY select applicable tags from this exact list: 
        ${JSON.stringify(masterTags)}
        
        Do not invent new tags. If none apply, return an empty array [].

        Expected JSON format:
        {
            "eventName": "...",
            "hostOrgName": "...",
            "description": "...",
            "date": "...",
            "time": "...",
            "location": "...",
            "hasFreeFood": true/false,
            "tags": ["Tech & Software", "Free Food"]
        }
    `;

    // 2. Fetch the image and convert it to base64 inline data for Gemini
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");



    // 3. We send the prompt, the caption, and the image part to Gemini
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            `Instructions: ${prompt}`,
            `Event Caption: ${caption}`,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
    });

    // 4. Boom! You have your structured data.
    console.log("🤖 Gemini raw response:", response.text);

    // Gemini often wraps JSON in markdown blocks, so we strip them before parsing
    const cleanText = response.text.replace(/```(json)?\n?/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText);
}