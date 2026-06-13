# 🚨 Samaritan AI

> Designed and shipped by an AI Product Manager. Built with Gemini 2.0 Flash.

[![Live Demo](https://img.shields.io/badge/Live-Demo-red?style=for-the-badge)](https://samaritan-ai.vercel.app)
[![Built with Gemini](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-blue?style=for-the-badge)]()
[![Made in India](https://img.shields.io/badge/Made%20in-India-orange?style=for-the-badge)]()

---

## Product Overview

**Samaritan AI** is a Progressive Web App that guides Indian bystanders through road accident response in the first 10 critical minutes — using real-time AI voice, multilingual support, and legally protective UX.

This project was conceived, scoped, and shipped end-to-end by an AI PM directing development through Claude and Google AI Studio. No co-founder. No engineering team. Just structured product thinking + AI execution.

---

## The Problem Space

India records **150,000+ road deaths per year.** The leading cause of preventable death is not lack of ambulances — it is bystander inaction in the first 10 minutes.

Witnesses freeze for two reasons:

1. **Panic** — no training, no guidance, no protocol
2. **Legal fear** — bystanders believe helping will get them arrested or sued

The Good Samaritan Law 2016 already protects helpers completely. Almost nobody knows it exists.

**The gap isn't medical. It's behavioral and informational.** That's a product problem — and the reason this app exists.

---

## Product Decisions Worth Reading

### Why a PWA, not a native app?
An app store adds 3–5 days of friction before someone can install it. In India, accidents happen before anyone thinks to download an app. A PWA installs from a browser in one tap, works offline, and runs on any Android phone — including ₹6,000 devices.

### Why shake-to-activate?
A bystander at an accident scene has one hand on their phone and is already moving toward the victim. Making them unlock, find the app, and tap it costs 15–30 seconds. Shake-to-activate removes every step between pocket and guidance.

### Why multilingual by default, not as a setting?
Hindi and Marathi speakers in Maharashtra don't switch language settings under stress. The app detects language from the first message and Gemini responds entirely in that language — no toggle, no menu, no cognitive load.

### Why a legal protection screen?
User research shows hesitation spikes at the moment of physical contact with the victim. The legal screen is not informational — it is a behavioral intervention. It appears exactly when the user is most likely to stop helping.

### Why an AI-generated witness report PDF?
The fear of police questioning does not end when the ambulance arrives. A timestamped, GPS-tagged, AI-generated document showing exactly what the bystander did — and citing their legal immunity — is something they can hand to police on the spot. It converts the app from an emergency tool into a legal shield.

---

## Features

| Feature | PM Rationale |
|---|---|
| 🎙️ **AI Voice Guide** | Removes reading load under panic. Voice is the right modality for emergencies. |
| 📞 **Dispatch Helper** | Structures the 112 call — most people forget location and vehicle numbers when panicking. |
| 📸 **Evidence Capture** | Guided prompts prevent users from taking useless photos. Serves insurance + legal use cases. |
| 📄 **Witness Report PDF** | Converts session data into a legal document. Removes post-incident anxiety. |
| ⚖️ **Legal Protection Screen** | Behavioral intervention at the highest drop-off moment. |
| 🌐 **Hindi / Marathi / English** | Language is not a setting — it is automatic. Reduces friction to zero. |
| 📳 **Shake to Activate** | Fastest possible activation. Designed for one-handed, moving use. |
| 📲 **WhatsApp SOS** | Sends GPS link to a saved contact. Uses the app already on every Indian phone. |
| 📡 **Offline Fallback** | Rule-based engine activates when Gemini is unreachable. The app never goes silent. |
| 📱 **PWA Install** | No app store. One tap from any browser. Works on ₹6,000 Android devices. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| Backend | Node.js + Express |
| AI | Google Gemini 2.0 Flash |
| PDF Generation | jsPDF |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Run Locally

```bash
git clone https://github.com/Zerovion/samaritan-ai.git
cd samaritan-ai
npm install
```

Add your Gemini API key to `.env`:

```env
GEMINI_API_KEY=your_key_here
```

```bash
npm run dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:3000
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com)

---

## Roadmap

- [x] AI voice guidance — Gemini 2.0 Flash
- [x] Trilingual — Hindi, Marathi, English
- [x] Shake-to-activate
- [x] WhatsApp SOS with live GPS
- [x] Offline fallback rule engine
- [x] AI-generated witness report PDF
- [x] PWA — installable, no app store
- [ ] Golden hour countdown timer
- [ ] Real nearest hospital — Google Places API
- [ ] Bystander confidence score — post-session debrief card
- [ ] Offline map — Leaflet.js cached tiles
- [ ] Gemini Live bidirectional voice — no typing needed
- [ ] Hardware v2 — ESP32 crash detector wristband (auto-triggers app on impact)

---

## About

**Aman Pathan** — AI Product Manager  
Engineering student, RIT Sangli | GitHub: [@Zerovion](https://github.com/Zerovion)

Background: AI PM · IoT · Electrical Engineering

This project exists because the most important AI problems are not in San Francisco. They are in places where panic, language barriers, and legal fear cost lives every day — and where a well-designed product on a cheap Android phone can close that gap.

> *"The first person at the scene is the most important person. Not the doctor. Not the ambulance. The bystander."*

---

*Open to collaborations, pilot partnerships, and CSR grant conversations — Maruti, Honda, TVS, NHAI.*
