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
            `Instructions: Look at this image and caption. Is this promoting a specific event (with a date, time, and location)? at least 2/3 of these must be present. Respond with ONLY "yes" or "no", nothing else.`,
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

        CRITICAL RULE FOR DATES:
        The "date" should just be the month and the day (e.g., "March 20" or "April 5"). Do not include the year or the day of the week (like "Tuesday, ").

        CRITICAL RULE FOR TIMES:
        The "time" should be in the format like "1:00PM" or "11:00AM - 2:00PM" if it's a range.

        CRITICAL RULE FOR LOCATIONS:
        The "location" should be the full name of the building. Use the following key to map Carleton building codes to their full names:
        AA: Architecture Building
        AC: Athletics Building
        AP: Azrieli Pavilion
        AT: Azrieli Theatre
        CB: Canal Building
        DT: Dunton Tower
        FH: Field House
        HC: Human Computer Interaction Building
        HP: Herzberg Laboratories
        HS: Health Sciences Building
        LA: Loeb Building
        MC: Minto Centre 
        ME: Mackenzie Building
        ML: MacOdrum Library
        NB: Nesbitt Biology Building
        NI: Nicol Building
        NN: Nideyinàn 
        PA: Paterson Hall
        PK: Pigiarvik (formerly Robertson Hall)
        RB: Richcraft Hall
        SA: Southam Hall
        SC: Steacie Building
        SP: St. Patrick's Building
        TB: Tory Building
        TC: Teraanga Commons
        TT: Carleton Technology and Training Center
        VS: Visualization & Simulation Building (VSM)
        
        For example, if you see "ME 3380", your location should be "Mackenzie Building 3380".

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