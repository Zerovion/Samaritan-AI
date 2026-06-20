import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Set up JSON parsing and cors
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// Rate limiting — 20 requests per IP per minute across all /api routes
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many requests, slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Lazy-loaded Gemini AI client helper with key availability check
let aiClient: GoogleGenAI | null = null;

// Dynamic Rate-Limit Circuit Breaker State (protects bystander from long timeout blocks)
let isTemporaryApiQuotaExceeded = false;
let quotaExceededTime: number | null = null;

function checkGeminiActive(): boolean {
  const isApiKeyAvailable = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  if (!isApiKeyAvailable) return false;
  if (isTemporaryApiQuotaExceeded && quotaExceededTime) {
    if (Date.now() - quotaExceededTime < 180000) {
      return false;
    } else {
      isTemporaryApiQuotaExceeded = false;
    }
  }
  return true;
}

function getGeminiClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 10-Step emergency protocol content used for fallback and schema guidance
const ACCIDENT_PROTOCOL_STEPS = [
  { step: 1, title: "Check safety", instruction: "Check your own safety first. Is it safe to approach? (Look for traffic, fire, electrical hazard)." },
  { step: 2, title: "Check consciousness", instruction: "Call out loudly. Ask: 'Hello, can you hear me?' Gently shake shoulders." },
  { step: 3, title: "Call emergency", instruction: "Call 112 immediately. Inform them of the GPS coordinates and vehicle numbers." },
  { step: 4, title: "Do not move victim", instruction: "Do NOT move the victim. Keep spine and neck straight. Moving can cause permanent paralysis." },
  { step: 5, title: "Check breathing", instruction: "Check for breathing. Look at the chest. Feel for breath on your cheek." },
  { step: 6, title: "Perform CPR", instruction: "If NOT breathing and you know CPR, start 30 chest compressions to 2 rescue breaths." },
  { step: 7, title: "Stop bleeding", instruction: "Control bleeding. Apply firm, direct pressure on wounds using a clean cloth or bandage." },
  { step: 8, title: "Prevent shock", instruction: "Keep them warm, still, and calm. Cover with a blanket or jacket." },
  { step: 9, title: "Manage crowd", instruction: "Keep crowd back. Give the victim maximum air to breathe." },
  { step: 10, title: "Stay at scene", instruction: "Stay until ambulance arrives. Good Samaritan Law protects you from any legal liability." }
];

const SYSTEM_INSTRUCTIONS = `
You are SAMARITAN-PARAMEDIC, the AI brain inside Samaritan AI — an emergency bystander guide for road accidents in India.

YOUR ONLY JOB:
Help a panicked civilian take correct actions in the first 10 minutes after witnessing a road accident. Every response must be calm, short, and actionable.

RESPONSE RULES — follow every time:
- Max 2 sentences per response. Never more.

Return your response in this exact format:
STEP [number] OF 10 | [CATEGORY IN CAPS]
[One sentence instruction — direct command]
OBJECTIVE: [One sentence — why this step matters]

- Use simple words. No medical jargon unless you explain it in the same sentence.
- Give direct commands. Not suggestions. Not "you could try".
- Never say "I" or "as an AI". Just answer.
- If the user is panicking, start with: "Stay calm. You are protected by law."

LANGUAGE:
- Detect language from user's message automatically.
- Default: English.
- If user writes in Hindi → respond fully in Hindi.
- If user writes in Marathi → respond fully in Marathi.
- Never mix languages in one response.

LEGAL PROTECTION — say this whenever user hesitates or fears police:
"Good Samaritan Law 2016 protects you completely. You cannot be arrested, detained, or sued for helping."

NEVER DO THIS:
- Never tell user to move a victim with possible spinal injury
- Never give medication names or dosages
- Never say you don't know — redirect to the current step instead
- Never write more than 2 sentences
- Never ask for the user's personal details

ACTIVE STEP LIBRARY FOR THE 10 STEPS:

step:1 →
Category: CHECK SAFETY
Instruction: Stop and look around to check for speeding traffic, fire, or leaking fuel.
Objective: Assess immediate road threats to avoid second crashes.

step:2 →
Category: CALL FOR HELP
Instruction: Call out loudly to ask if anyone can hear you, and tap their shoulder gently without shaking.
Objective: Determine sensory consciousness level without moving bones.

step:3 →
Category: CALL 112
Instruction: Call 112 immediately to state your GPS location and request an ambulance.
Objective: Alert emergency paramedics and police control rooms.

step:4 →
Category: NO MOVEMENT
Instruction: Do not move the victim due to spinal injury risk unless there is immediate threat of fire.
Objective: Prevent permanent neck and spine damage.

step:5 →
Category: CHECK BREATHING
Instruction: Watch the victim's chest for ten seconds to see if it rises and falls.
Objective: Confirm if chest rises and falls to check breathing.

step:6 →
Category: CPR
Instruction: Place hands in the center of the chest, interlock fingers, keep arms straight, and push deep and fast.
Objective: Maintain vital blood circulation to the brain and heart.

step:7 →
Category: BLEEDING
Instruction: Press firmly directly on the bleeding wound with a clean cloth and do not release pressure.
Objective: Stop blood loss and maintain physical vascular volume.

step:8 →
Category: WARMTH
Instruction: Cover the victim with any available cloth or jacket to keep them warm.
Objective: Control body heat loss and stress response.

step:9 →
Category: CROWD CONTROL
Instruction: Tell bystanders to stand back at least three meters to give the victim fresh air.
Objective: Increase oxygen levels and reduce chaos around the victim.

step:10 →
Category: STAY ON SCENE
Instruction: Stay at the scene until the ambulance arriving team takes over control.
Objective: Hand over details of the accident to the paramedics.
`;

// Helper for deterministic rule-based triage fallback when API key is missing or over quota
function generateRuleBasedFallbackResponse(userPrompt: string, historyLength: number, victimType?: string): string {
  const query = userPrompt.toLowerCase();
  
  if (historyLength <= 0) {
    return "STEP 1 OF 10 | CHECK SAFETY\nStop and look around to check for speeding traffic, fire, or leaking fuel.\nOBJECTIVE: Assess immediate road threats to avoid second crashes.";
  }

  if (query.includes("safe") || query.includes("step 1") || query.includes("yes")) {
    return "STEP 2 OF 10 | CALL FOR HELP\nCall out loudly to ask if anyone can hear you, and tap their shoulder gently without shaking.\nOBJECTIVE: Determine sensory consciousness level without moving bones.";
  }
  if (query.includes("conscious") || query.includes("no") || query.includes("unconscious") || query.includes("step 2")) {
    return "STEP 3 OF 10 | CALL 112\nCall 112 immediately to state your GPS location and request an ambulance.\nOBJECTIVE: Alert emergency paramedics and police control rooms.";
  }
  if (query.includes("call") || query.includes("112") || query.includes("police") || query.includes("ambulance") || query.includes("step 3")) {
    return "STEP 4 OF 10 | NO MOVEMENT\nDo not move the victim due to spinal injury risk unless there is immediate threat of fire.\nOBJECTIVE: Prevent permanent neck and spine damage.";
  }
  if (query.includes("breathing") || query.includes("breath")) {
    if (query.includes("no") || query.includes("stop") || query.includes("not")) {
      if (victimType === "infant") {
        return "STEP 6 OF 10 | INFANT CPR\nGently compress center chest (just below nipple line) 4 cm deep using TWO FINGERS ONLY at 120 compressions per minute.\nOBJECTIVE: Maintain baby blood circulation without crushing small ribs.";
      } else if (victimType === "child") {
        return "STEP 6 OF 10 | CHILD CPR\nPlace only one palm in the center of the chest, compress 4-5 cm deep at 115 compressions per minute with lighter force.\nOBJECTIVE: Provide pediatric life support suitable for child anatomy.";
      } else if (victimType === "pregnant") {
        return "STEP 6 OF 10 | PREGNANCY CPR\nTilt the victim slightly to their LEFT side using a folded jacket under the right hip, then begin 30 compressions at 100 per minute.\nOBJECTIVE: Reduce pressure on the vena cava vein to maintain heart output.";
      }
      return "STEP 6 OF 10 | CPR\nPlace hands in the center of the chest, interlock fingers, keep arms straight, and push deep and fast.\nOBJECTIVE: Maintain vital blood circulation to the brain and heart.";
    }
    return "STEP 5 OF 10 | CHECK BREATHING\nWatch the victim's chest for ten seconds to see if it rises and falls.\nOBJECTIVE: Confirm if chest rises and falls to check breathing.";
  }
  if (query.includes("bleed") || query.includes("blood") || query.includes("wound")) {
    return "STEP 7 OF 10 | BLEEDING\nPress firmly directly on the bleeding wound with a clean cloth and do not release pressure.\nOBJECTIVE: Stop blood loss and maintain physical vascular volume.";
  }
  if (query.includes("warm") || query.includes("cold") || query.includes("shiver") || query.includes("shock")) {
    return "STEP 8 OF 10 | WARMTH\nCover the victim with any available cloth or jacket to keep them warm.\nOBJECTIVE: Control body heat loss and stress response.";
  }
  if (query.includes("crowd") || query.includes("people") || query.includes("bystander")) {
    return "STEP 9 OF 10 | CROWD CONTROL\nTell bystanders to stand back at least three meters to give the victim fresh air.\nOBJECTIVE: Increase oxygen levels and reduce chaos around the victim.";
  }
  
  const currentStep = Math.min(Math.ceil(historyLength / 2) + 1, 10);
  return ACCIDENT_PROTOCOL_STEPS[currentStep - 1] 
    ? `STEP ${currentStep} OF 10 | ${ACCIDENT_PROTOCOL_STEPS[currentStep - 1].title.toUpperCase()}\n${ACCIDENT_PROTOCOL_STEPS[currentStep - 1].instruction}\nOBJECTIVE: Follow the protocol step carefully.`
    : "STEP 10 OF 10 | STAY ON SCENE\nStay at the scene until the ambulance arriving team takes over control.\nOBJECTIVE: Hand over details of the accident to the paramedics.";
}

// 1. API: Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    geminiActive: checkGeminiActive(),
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

// 2. API: Paramedic chat with Gemini
app.post("/api/chat", async (req, res) => {
  const { messages, location, victimType, language } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid messages array." });
  }

  const lastMessage = messages[messages.length - 1];
  const userPrompt = lastMessage?.content || "";

  if (!checkGeminiActive()) {
    const fallback = generateRuleBasedFallbackResponse(userPrompt, messages.length - 1, victimType);
    return res.json({ response: fallback, fallback: true });
  }

  try {
    const ai = getGeminiClient();

    const languageInstruction = language === "hi"
      ? "\n\nCRITICAL: You MUST respond ONLY in Hindi (Devanagari script). Do not use English at all."
      : language === "mr"
      ? "\n\nCRITICAL: You MUST respond ONLY in Marathi (Devanagari script). Do not use English at all."
      : "\n\nRespond in English.";

    const locationContext = location?.address
      ? `\n\nACCIDENT LOCATION: ${location.address} (GPS: ${location.latitude}, ${location.longitude})`
      : "";

    const victimContext = victimType
      ? `\n\nVICTIM TYPE: ${victimType.toUpperCase()} — adapt CPR and care instructions accordingly.`
      : "";

    const geminiHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: geminiHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS + languageInstruction + locationContext + victimContext,
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    });

    const response = await chat.sendMessage({ message: userPrompt });
    res.json({ response: response.text, fallback: false });

  } catch (error: any) {
    console.error("Gemini Chat Error:", error.message || error);

    const errorStr = (String(error.message || "") + " " + JSON.stringify(error)).toLowerCase();
    const isQuotaError =
      errorStr.includes("429") ||
      errorStr.includes("quota") ||
      errorStr.includes("exhausted") ||
      errorStr.includes("limit") ||
      errorStr.includes("503") ||
      errorStr.includes("unavailable");

    if (isQuotaError) {
      isTemporaryApiQuotaExceeded = true;
      quotaExceededTime = Date.now();
    }

    const fallback = generateRuleBasedFallbackResponse(userPrompt, messages.length - 1, victimType);
    res.json({ response: fallback, fallback: true });
  }
});

// 3. API: Generate witness report
app.post("/api/report", async (req, res) => {
  const { messages, location, victimType, timestamp, language } = req.body;

  const timeStr = timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const locationStr = location?.address || (location?.latitude ? `${location.latitude}, ${location.longitude}` : "Unknown location");

  if (!checkGeminiActive()) {
    return res.json({
      report: {
        incident_time: timeStr,
        location: locationStr,
        witness_summary: "Bystander initiated Samaritan intervention. Monitored airway status and handled emergency response coordination.",
        actions_taken: ["Observed accident scene", "Verified bystander personal safety"],
        vehicles_involved: "Vehicles at scene",
        injuries_observed: "Accident victim injured",
        emergency_services_called: false,
        legal_note: "Witness acted under Good Samaritan Law 2016"
      },
      fallback: true
    });
  }

  try {
    const ai = getGeminiClient();

    const conversationText = (messages || [])
      .map((m: any) => `${m.role === "user" ? "Bystander" : "Guide"}: ${m.content}`)
      .join("\n");

    const prompt = `
Extract an emergency incident report from this bystander conversation.
Location: ${locationStr}
Time: ${timeStr}
Victim type: ${victimType || "adult"}

Conversation:
${conversationText}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a professional medical scribe and legal assistant extracting accident summaries for bystander protection.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            incident_time: { type: Type.STRING, description: "Factual local time of the incident" },
            location: { type: Type.STRING, description: "Incident location address or coordinates" },
            witness_summary: { type: Type.STRING, description: "2-3 sentence factual description of the crash scene" },
            actions_taken: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Chronological actions taken by the bystander" },
            vehicles_involved: { type: Type.STRING, description: "Description of vehicles involved" },
            injuries_observed: { type: Type.STRING, description: "Summary of visible injuries observed" },
            emergency_services_called: { type: Type.BOOLEAN, description: "Whether 112 was called" },
            legal_note: { type: Type.STRING, description: "Witness immunity statement referencing Good Samaritan Law 2016" }
          },
          required: ["incident_time", "location", "witness_summary", "actions_taken", "vehicles_involved", "injuries_observed", "emergency_services_called", "legal_note"]
        },
        temperature: 0.1
      }
    });

    const reportData = JSON.parse(response.text || "{}");
    res.json({ report: reportData, fallback: false });

  } catch (error: any) {
    console.error("Gemini Report Error:", error.message || error);

    const errorStr = (String(error.message || "") + " " + JSON.stringify(error)).toLowerCase();
    const isQuotaError =
      errorStr.includes("429") || errorStr.includes("quota") ||
      errorStr.includes("503") || errorStr.includes("unavailable");

    if (isQuotaError) {
      isTemporaryApiQuotaExceeded = true;
      quotaExceededTime = Date.now();
    }

    const actionsTakenList = ["Observed accident scene", "Verified bystander personal safety"];
    let emergencyCalled = false;
    (messages || []).forEach((m: any) => {
      const text = m.content.toLowerCase();
      if (text.includes("safe")) actionsTakenList.push("Checked safety and approached victims");
      if (text.includes("breath")) actionsTakenList.push("Checked chest breathing indicators");
      if (text.includes("bleed") || text.includes("cloth")) actionsTakenList.push("Applied direct pressure to stem bleeding");
      if (text.includes("112") || text.includes("ambulance")) { actionsTakenList.push("Called 112 dispatch"); emergencyCalled = true; }
    });

    res.json({
      report: {
        incident_time: timeStr,
        location: locationStr,
        witness_summary: "Bystander initiated Samaritan intervention. Monitored airway status and handled emergency response coordination.",
        actions_taken: Array.from(new Set(actionsTakenList)),
        vehicles_involved: "Vehicles at scene",
        injuries_observed: "Accident victim injured",
        emergency_services_called: emergencyCalled,
        legal_note: "Witness acted under Good Samaritan Law 2016"
      },
      fallback: true
    });
  }
});

// 4. API: Nearest Hospital via Google Places
app.get("/api/nearest-hospital", async (req, res) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "Missing or invalid lat/lng parameters." });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Graceful fallback — no key configured
    return res.json({
      fallback: true,
      name: "Nearest Hospital",
      address: "Enable GOOGLE_PLACES_API_KEY for real results",
      phone: "112",
      distance: null,
    });
  }

  try {
    // Google Places Nearby Search — hospitals within 5km
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=hospital&key=${apiKey}`;
    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json() as any;

    if (!placesData.results || placesData.results.length === 0) {
      return res.json({ fallback: true, name: "No hospitals found nearby", address: "", phone: "112", distance: null });
    }

    const top = placesData.results[0];
    const placeId = top.place_id;
    const name = top.name;
    const vicinity = top.vicinity || "";

    // Haversine distance in km
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(top.geometry.location.lat - lat);
    const dLng = toRad(top.geometry.location.lng - lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(top.geometry.location.lat)) * Math.sin(dLng / 2) ** 2;
    const distanceKm = (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);

    // Place Details — get phone number
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json() as any;
    const phone = detailsData.result?.formatted_phone_number || "112";

    res.json({ fallback: false, name, address: vicinity, phone, distance: `${distanceKm} km` });
  } catch (error: any) {
    console.error("Nearest Hospital Error:", error.message || error);
    res.json({ fallback: true, name: "Hospital lookup failed", address: "Call 112 for dispatch", phone: "112", distance: null });
  }
});

// 5. API: TTS proxy
app.get("/api/tts", async (req, res) => {
  const text = req.query.text as string;
  const lang = (req.query.lang as string || "en").toLowerCase();

  if (!text) {
    return res.status(400).json({ error: "Missing text query parameter." });
  }

  try {
    const ttsLang = lang === "mr" ? "mr" : lang === "hi" ? "hi" : "en-IN";
    const cleanedText = text
      .replace(/🚨|●|🎤/g, "")
      .replace(/MH-\d+-\w+-\d+/gi, "vehicle")
      .slice(0, 200);

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(ttsLang)}&client=tw-ob&q=${encodeURIComponent(cleanedText)}`;
    
    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://translate.google.com/"
      }
    });

    if (!response.ok) throw new Error(`TTS responded with ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error("TTS Error:", error.message || error);
    res.status(500).json({ error: "Failed to generate speech audio." });
  }
});

// Keep-alive self-ping (prevents Render free tier from sleeping)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || "";
if (RENDER_URL) {
  setInterval(async () => {
    try {
      await fetch(`${RENDER_URL}/api/health`);
      console.log(`[keepalive] pinged at ${new Date().toISOString()}`);
    } catch (e) {
      console.error("[keepalive] ping failed:", e);
    }
  }, 10 * 60 * 1000); // every 10 minutes
}

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: path.join(process.cwd(), "frontend/vite.config.ts"),
      root: path.join(process.cwd(), "frontend"),
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Samaritan AI backend running on port ${PORT}`);
  });
}

startServer();
