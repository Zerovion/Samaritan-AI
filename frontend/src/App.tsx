import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Shield, 
  MapPin, 
  Phone, 
  Camera, 
  FileText, 
  RefreshCw, 
  Send, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Languages, 
  ArrowRight, 
  Scale, 
  Check, 
  FileSignature,
  Volume2,
  VolumeX,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Home,
  Video,
  Sliders,
  Map,
  Download,
  WifiOff,
  Database,
  Activity,
  Heart,
  Sun,
  Zap,
  Skull,
  Bike,
  Car,
  Share2,
  MessageSquare
} from "lucide-react";
import { Message, LocationTelemetry, SamaritanReport, EmergencyStep } from "./types";
import { generateWitnessPDF } from "./utils/generatePDF";
import { OfflineIllustrations } from "./components/OfflineIllustrations";
import { ShakeConfirmOverlay } from "./components/ShakeConfirmOverlay";
import { useShakeDetector } from "./hooks/useShakeDetector";
import { SNAKE_BITE_STEPS, HEAT_STROKE_STEPS, ELECTRICAL_SHOCK_STEPS, BIKE_ACCIDENT_STEPS, CAR_ACCIDENT_STEPS } from "./protocols";

const EMERGENCY_STEPS: EmergencyStep[] = [
  {
    step: 1,
    title: "Check Safety First",
    alertLvl: "severe",
    instruction: "Stop and look around. Do not become a second victim. Check for speeding traffic, fires, or leaking fuel.",
    criticalDo: "Wait for oncoming trucks to halt before stepping onto the roadway.",
    criticalDont: "Never rush onto a live expressway or bend without a visible warning setup.",
    legalImmunityRef: "Good Samaritan protection applies instantly once you confirm self-safety.",
    titleHindi: "सुरक्षा सर्वोपरि",
    instructionHindi: "रुकिए और चारों तरफ देखिए। दूसरा शिकार मत बनिए। तेज रफ्तार ट्रैफिक, आग या लीक होते ईंधन की जांच करें।",
    titleMarathi: "सुरक्षितता सर्वोपरि",
    instructionMarathi: "थांबा आणि आजूबाजूला पहा. आपण स्वतः अपघातग्रस्त होऊ नका. वेगवान वाहतूक, आग किंवा गळती होणारे इंधन तपासा।"
  },
  {
    step: 2,
    title: "Call Out For Response",
    alertLvl: "warning",
    instruction: "Approach the victim safely. Call out loudly: 'Suno! Can you hear me?' Gently shake their shoulder if conscious.",
    criticalDo: "Establish if the passenger is awake and responsive to your voice immediately.",
    criticalDont: "Do not shake vigorously if they have a head injury or are unyielding.",
    legalImmunityRef: "Sec 134 Motor Vehicles Act: Duty to assist without liability.",
    titleHindi: "जवाब के लिए पुकारें",
    instructionHindi: "सुरक्षित रूप से पास जाएं। जोर से आवाज लगाएं: 'सुनो! क्या आप मुझे सुन सकते हैं?' यदि वे होश में हैं तो उनके कंधे को धीरे से थपथपाएं।",
    titleMarathi: "प्रतिसाद मिळवा",
    instructionMarathi: "बाधिताजवळ सुरक्षितपणे जा. जोरात आवाज द्या: 'ऐका! तुम्ही मला ऐकू शकता का?' शुद्धीवर असल्यास खांदे हळूच हलवा।"
  },
  {
    step: 3,
    title: "Call 112 Dispatch",
    alertLvl: "severe",
    instruction: "Dial 112 immediately. Inform them of the exact GPS coordinate, vehicle number, and casualty count.",
    criticalDo: "State your exact location from the telemetry tracker. Keep transmission brief.",
    criticalDont: "Do not hang up first. Let dispatcher ask all standard triage metrics.",
    legalImmunityRef: "Hospitals cannot demand payments or details for registering emergency victims.",
    titleHindi: "112 पर कॉल करें",
    instructionHindi: "तुरंत 112 डायल करें। उन्हें अपने सटीक जीपीएस स्थान, वाहन संख्या और घायलों की संख्या बताएं।",
    titleMarathi: "112 ला कॉल करा",
    instructionMarathi: "त्वरित 112 डायल करा. त्यांना अचूक जीपीएस स्थान, वाहन क्रमांक आणि जखमींची संख्या सांगा।"
  },
  {
    step: 4,
    title: "Do NOT Move Victim",
    alertLvl: "severe",
    instruction: "Unless there is active fire or explosive threat, NEVER pull, drag, or twist the victim. Possible spine fracture.",
    criticalDo: "Support their head manually with your palms to immobilize the cervical spine.",
    criticalDont: "Do NOT lift them by the shoulders or attempt to sit them upright.",
    legalImmunityRef: "You cannot be sued for accidental injury complications when acting in good faith.",
    titleHindi: "पीड़ित को मत हिलाएं",
    instructionHindi: "जब तक आग या विस्फोट का खतरा न हो, पीड़ित को कभी भी खींचे या घुमाएं नहीं। रीढ़ की हड्डी टूटने का जटिल खतरा हो सकता है।",
    titleMarathi: "बाधिताला हलवू नका",
    instructionMarathi: "जोपर्यंत आग किंवा स्फोटाचा थेट धोका नसेल, तोपर्यंत बाधिताला कधीही ओढू नका किंवा फिरवू नका. पाठीच्या कण्याला गंभीर इजा असण्याची दाट शक्यता असते।"
  },
  {
    step: 5,
    title: "Check Breathing",
    alertLvl: "warning",
    instruction: "Bending close, look if the chest rises and falls. Listen for breath sounds on your cheek for 10 seconds.",
    criticalDo: "Gently tilt the chin up to keep the airway clear if unconscious.",
    criticalDont: "Do not attempt water feeding if the victim is unresponsive.",
    legalImmunityRef: "Supreme Court Directive: Helpers enjoy full civil and criminal immunity.",
    titleHindi: "सांस की जांच करें",
    instructionHindi: "पास झुककर देखें कि क्या पीड़ित की छाती ऊपर-नीचे हो रही है। अपने गाल पर 10 सेकंड तक सांस महसूस करें।",
    titleMarathi: "श्वासोच्छ्वास तपासा",
    instructionMarathi: "जवळ वाकून पहा की बाधिताची छाती वर-खाली होत आहे का. तुमच्या गालावर 10 सेकंद श्वासाची जाणीव घ्या।"
  },
  {
    step: 6,
    title: "CPR Compression Guidance",
    alertLvl: "severe",
    instruction: "If they are NOT breathing, begin chest compressions immediately if CPR trained. Press center of chest deep.",
    criticalDo: "Compress at a rate of 100-120 compressions per minute (use the pulsing locator beacon below).",
    criticalDont: "Do not press on the lower ribs; push strictly in the center chest bone.",
    legalImmunityRef: "Act with clean intent — emergency CPR is legal and life-saving.",
    titleHindi: "सी.पी.आर. कंप्रेशन",
    instructionHindi: "यदि वे सांस नहीं ले रहे हैं, तो तुरंत सीपीआर शुरू करें। छाती के ठीक बीच में तेजी से और गहराई से दबाएं।",
    titleMarathi: "सीपीआर कम्प्रेशन",
    instructionMarathi: "जर ते श्वास घेत नसतील, तर त्वरित सीपीआर सुरू करा. छातीच्या अगदी मधोमध जोरात आणि खोलवर दाबा।"
  },
  {
    step: 7,
    title: "Control Heavy Bleeding",
    alertLvl: "warning",
    instruction: "Press firmly with a clean cloth, bandage, or jacket directly on bleeding wounds. Maintain pressure.",
    criticalDo: "Tie a tourniquet higher up on the limb only if blood is spurting vigorously.",
    criticalDont: "Do not release pressure to 'check' if bleeding stopped; keep pressed.",
    legalImmunityRef: "No doctor can refuse emergency treatment on medico-legal collision grounds.",
    titleHindi: "रक्तस्राव नियंत्रित करें",
    instructionHindi: "साफ कपड़े, पट्टी या जैकेट से बहते हुए खून के घाव पर सीधे और मजबूती से दबाएं। दबाव लगातार बनाए रखें।",
    titleMarathi: "रक्तस्त्राव थांबवा",
    instructionMarathi: "स्वच्छ कापड, पट्टी किंवा जॅकेटने रक्तस्त्राव होणाऱ्या जखमेवर थेट आणि जोराने दाबून ठेवा. दाब कायम ठेवा।"
  },
  {
    step: 8,
    title: "Prevent Clinical Shock",
    alertLvl: "info",
    instruction: "Keep the victim warm, dry, and calm. Cover them with a sheet or jacket. Elevate feet if spine is safe.",
    criticalDo: "Shield their face from India's harsh sun or intense cold monsoon rains.",
    criticalDont: "Do not offer cigarettes, tea, or water; this can cause choking or aspirating.",
    legalImmunityRef: "Your actions are certified protected bystander duties.",
    titleHindi: "शॉक से बचाएं",
    instructionHindi: "पीड़ित को गर्म, सूखा और शांत रखें। उन्हें चादर या जैकेट से ढक दें। यदि रीढ़ सुरक्षित है तो पैरों को थोड़ा ऊपर उठाएं।",
    titleMarathi: "धक्का प्रतिबंध करा",
    instructionMarathi: "बाधिताला उबदार, कोरडे आणि शांत ठेवा. त्यांना चादर किंवा जॅकेटने झाकून ठेवा. पाठीचा कणा सुरक्षित असल्यास पाय किंचित वर करा।"
  },
  {
    step: 9,
    title: "Manage & Disperse Crowd",
    alertLvl: "info",
    instruction: "Stop onlookers from crowding. Tell them: 'Give the victims fresh air. Please step behind 10 meters.'",
    criticalDo: "Assign clear tasks to specific crowd members: 'You, block traffic. You, guide the ambulance.'",
    criticalDont: "Do not engage in arguing or altercations; maintain absolute medical priority.",
    legalImmunityRef: "Crowd control prevents panic and secures rapid rescue vehicle passage.",
    titleHindi: "भीड़ नियंत्रित करें",
    instructionHindi: "आसपास के लोगों की भीड़ इकट्ठा न होने दें। उनसे कहें: 'पीड़ितों को ताजी हवा मिलने दें। कृपया 10 मीटर पीछे हटें।'",
    titleMarathi: "गर्दी पांगवा",
    instructionMarathi: "गर्दी करू नका असे आजूबाजूच्या लोकांना सांगा. त्यांना म्हणा: 'बाधितांना मोकळी हवा मिळू द्या. कृपया 10 मीटर मागे व्हा।'"
  },
  {
    step: 10,
    title: "Stay Till Help Arrives",
    alertLvl: "success",
    instruction: "Wait beside the victim until the 112 team arrives. Brief the medical personnel about the events.",
    criticalDo: "Give them the generated Witness Report. You are legally allowed to depart immediately.",
    criticalDont: "Do not give police your address or name unless you choose to act as a formal witness.",
    legalImmunityRef: "Absolute immunity: Police cannot require your active presence at the police station.",
    titleHindi: "मदद आने तक रुकें",
    instructionHindi: "112 आपातकालीन टीम के आने तक पीड़ित के पास ही रुकें। डॉक्टरों और पैरामेडिक्स को घटना की पूरी जानकारी दें।",
    titleMarathi: "मदत येईपर्यंत थांबा",
    instructionMarathi: "112 आपत्कालीन पथक येईपर्यंत बाधिताजवळच थांबा. डॉक्टर आणि पॅरामेडिक्सना अपघाताची संपूर्ण माहिती द्या।"
  }
];

const PRESET_LOCATIONS = [
  { label: "Pune Highway, NH48 (KM 42)", lat: 18.5204, lng: 73.8567, address: "NH48 Hinjewadi Bypass, Pune, India" },
  { label: "Mumbai-Pune Expressway (KM 72)", lat: 18.7561, lng: 73.4358, address: "Madap Tunnel Sector, Khalapur, MH, India" },
  { label: "Delhi Ring Road (AIIMS Crossing)", lat: 28.5684, lng: 77.2104, address: "MG Road, AIIMS Flyover Junction, New Delhi, India" },
  { label: "Bengaluru Expressway (Hosur Rd)", lat: 12.9221, lng: 77.6254, address: "Silk Board Elevated Corridor, Bengaluru, India" }
];

interface MapNode {
  id: string;
  label: string;
  type: "hospital" | "police" | "crash" | "escape";
  x: number;
  y: number;
  phone?: string;
  details: string;
}

interface OfflineSector {
  name: string;
  highwayCode: string;
  size: string;
  roadDescription: string;
  nodes: MapNode[];
  svgPath: string;
}

const OFFLINE_MAPS_SECTORS: Record<string, OfflineSector> = {
  "Pune Highway, NH48 (KM 42)": {
    name: "Hinjewadi Bypass NH48 Sector",
    highwayCode: "NH-48 Sector-4",
    size: "185 KB",
    roadDescription: "Dual 3-lane rigid concrete carriage with service lane access points and Hinjewadi flyover ramps.",
    nodes: [
      { id: "crash", label: "Crash Spot (KM 42.1)", type: "crash", x: 150, y: 120, details: "Current reported road collision site" },
      { id: "hosp1", label: "Dr. DY Patil Trauma Hospital", type: "hospital", x: 280, y: 60, phone: "+912027405000", details: "Level-1 Trauma Facility with 24/7 neurosurgery team. 1.8km distance." },
      { id: "patrol1", label: "NH48 Highway Patrol Post 4", type: "police", x: 50, y: 180, phone: "+912027408888", details: "Rapid Response Patrol vehicle equipped with hydraulic cutters and basic stretchers. ETA: 4 mins." },
      { id: "escape1", label: "Safe Evacuation Bay (Service Lane B)", type: "escape", x: 220, y: 140, details: "Broad paved shoulder. Ideal parking sector for incoming emergency rescue vehicles." }
    ],
    svgPath: "M 20 150 Q 150 120 280 150 Q 320 155 380 140"
  },
  "Mumbai-Pune Expressway (KM 72)": {
    name: "Madap Tunnel Khalapur Sector",
    highwayCode: "MPE-EXP KM-72",
    size: "244 KB",
    roadDescription: "Access-controlled 6-lane high speed asphalt corridor approaching Madap Tunnel exit.",
    nodes: [
      { id: "crash", label: "Crash Spot (KM 72.4)", type: "crash", x: 180, y: 110, details: "Current reported high-impact expressway crash" },
      { id: "hosp2", label: "MGM Hospital Kamothe", type: "hospital", x: 310, y: 70, phone: "+912227437900", details: "Emergency burn care units and blood bank access. Express transport route active." },
      { id: "patrol2", label: "IRB Emergency Operations Base", type: "police", x: 60, y: 160, phone: "+912227438100", details: "Heavy-duty towing cranes and emergency oxygen resuscitators." },
      { id: "escape2", label: "Emergency Emergency Runaway Ramp", type: "escape", x: 250, y: 120, details: "Arrestor bed of sand and gravel for brake failure or emergency parking." }
    ],
    svgPath: "M 10 180 Q 150 110 300 90 T 390 50"
  },
  "Delhi Ring Road (AIIMS Crossing)": {
    name: "AIIMS Flyover Junction Ring Road",
    highwayCode: "DEL-DRR AIIMS",
    size: "198 KB",
    roadDescription: "Complex multi-level arterial urban expressway with heavy flyover crossings and underpass loops.",
    nodes: [
      { id: "crash", label: "Crash Spot (AIIMS Interchange)", type: "crash", x: 170, y: 130, details: "Arterial road collision scene beneath flyover structural column" },
      { id: "hosp3", label: "AIIMS Jai Prakash Trauma Centre", type: "hospital", x: 270, y: 50, phone: "+911126593112", details: "Premier national apex level-1 trauma care centre. Advanced life support ready." },
      { id: "patrol3", label: "Delhi Traffic Police Outpost AIIMS", type: "police", x: 80, y: 170, phone: "+911125844444", details: "Intersection control patrol unit. Securing lane bypasses for heavy rescue passage." },
      { id: "escape3", label: "AIIMS Metro Gate 2 Clear Lane", type: "escape", x: 220, y: 155, details: "Wide passenger dispersal plaza safe from oncoming traffic." }
    ],
    svgPath: "M 30 160 C 130 160, 150 100, 250 100 S 350 160, 380 160"
  },
  "Bengaluru Expressway (Hosur Rd)": {
    name: "Silk Board Elevated Sector",
    highwayCode: "BLR-HSR SilkBoard",
    size: "210 KB",
    roadDescription: "Elevated structure overlying Hosur Road with tight toll plaza merges and service slip roadways.",
    nodes: [
      { id: "crash", label: "Crash Spot (Elevated Merge)", type: "crash", x: 190, y: 100, details: "Narrow elevated viaduct collision blocking rapid exit lanes" },
      { id: "hosp4", label: "St. John's Medical College Hospital", type: "hospital", x: 300, y: 150, phone: "+918022065000", details: "St. Johns Emergency & Critical Care. Hospital has immediate orthopedic trauma readiness." },
      { id: "patrol4", label: "Electronics City Expressway Toll Patrol", type: "police", x: 70, y: 80, phone: "+918025588888", details: "Quick ambulance dispatch riders with active speed response units." },
      { id: "escape4", label: "Viaduct Maintenance Parking Pocket", type: "escape", x: 140, y: 120, details: "Protected structural bay behind concrete crash barriers." }
    ],
    svgPath: "M 20 50 Q 150 110, 200 110 T 380 170"
  }
};

export default function App() {
  // Navigation & Multi-Screen State
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [goldenHourStart, setGoldenHourStart] = useState<number | null>(null);
  const [goldenHourElapsed, setGoldenHourElapsed] = useState<number>(0); // seconds elapsed

  // Nearest Hospital state
  const [nearestHospital, setNearestHospital] = useState<{
    name: string;
    address: string;
    phone: string;
    distance: string | null;
    fallback: boolean;
    loading: boolean;
  }>({ name: "", address: "", phone: "112", distance: null, fallback: false, loading: false });

  // ── Shake-to-activate state ──────────────────────────────────────────────
  const [shakeConfirmVisible, setShakeConfirmVisible] = useState(false);
  const [shakeCountdown, setShakeCountdown] = useState(3);
  const shakeCountdownRef = useRef<NodeJS.Timeout | null>(null);
    const [currentScreen, setCurrentScreen] = useState<"voice" | "dispatch" | "evidence" | "report" | "legal">("voice");
  
  // App settings & protocol states
  const [activeStep, setActiveStep] = useState<number>(1);
  const [victimType, setVictimType] = useState<"adult" | "pregnant" | "child" | "infant">("adult");
  const [emergencyType, setEmergencyType] = useState<"cardiac" | "bite" | "heat" | "electrical" | "bike" | "car" | "custom">("cardiac");
  const [customEmergencyText, setCustomEmergencyText] = useState<string>("");
  const [showVictimSelector, setShowVictimSelector] = useState<boolean>(false);
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I am with you. You are protected by law. Let's help together.\n\nIs the scene safe for you to approach (Step 1)? Verify traffic.",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(false);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  
  // Geolocation & Preset State
  const [telemetry, setTelemetry] = useState<LocationTelemetry>({
    latitude: 18.5204,
    longitude: 73.8567,
    address: "NH48 Hinjewadi Bypass, Pune, India",
    accuracy: 15,
    mode: "mock"
  });
  const [showLocationSettings, setShowLocationSettings] = useState<boolean>(false);

  // Metronome state for CPR (105 BPM)
  const [cprActive, setCprActive] = useState<boolean>(false);
  const [cprFlash, setCprFlash] = useState<boolean>(false);
  const cprIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Voice Narration Guide state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceLanguage, setVoiceLanguage] = useState<"en" | "hi" | "mr">("en");
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState<boolean>(false);
  const [activeVoiceName, setActiveVoiceName] = useState<string>("Detecting voice engine...");
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const updateActiveVoice = () => {
      if (voiceLanguage === "mr") {
        setActiveVoiceName("Google Cloud TTS (mr-IN - Active Mode)");
        return;
      }
      if (voiceLanguage === "hi") {
        setActiveVoiceName("Google Cloud TTS (hi-IN - Active Mode)");
        return;
      }

      if (!('speechSynthesis' in window)) {
        setActiveVoiceName("Google Cloud TTS (en-IN - Active Mode)");
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      const normalize = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace('_', '-');
      const matchedVoice = voices.find(v => normalize(v) === "en-in") ||
                           voices.find(v => normalize(v).startsWith("en") && v.name.includes("Google")) || 
                           voices.find(v => normalize(v).startsWith("en")) || null;

      if (matchedVoice) {
        setActiveVoiceName(`${matchedVoice.name} (${matchedVoice.lang})`);
      } else {
        setActiveVoiceName("Google Cloud TTS (en-IN)");
      }
    };

    updateActiveVoice();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', updateActiveVoice);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', updateActiveVoice);
      }
    };
  }, [voiceLanguage]);

  const [audioWaves, setAudioWaves] = useState<number[]>([10, 20, 15, 30, 25, 40, 20, 10, 15, 25, 12, 6]);

  // Photo uploads / Guided Prompts
  const [photos, setPhotos] = useState<{ id: string; type: string; base64: string; label: string; timestamp: string }[]>([]);
  const [selectedPhotoType, setSelectedPhotoType] = useState<string>("Wide Scene");

  // Report Form details / Anonymity states
  const [reportForm, setReportForm] = useState({
    witness_name: "Prasad Sawant",
    witness_phone: "+91 99203 76211",
    witness_summary: "Bystander initiated first responder Samaritan support at crash site. Controlled surroundings, coordinated 112 alert dispatch.",
    location: "NH48 Hinjewadi Bypass, Pune, India",
    vehicles_involved: "Involved courier truck and passenger car",
    injuries_observed: "Lacerations/trauma suspect; spinal stability maintained",
  });
  const [redactAnonymously, setRedactAnonymously] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<SamaritanReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Dispatch Panel active script state
  const [injuryCountSim, setInjuryCountSim] = useState<number>(2);
  const [dialCallTriggered, setDialCallTriggered] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // Instant SOS Broadcast states
  const [sosRecipient, setSosRecipient] = useState<string>(() => {
    return localStorage.getItem("samaritan_sos_recipient") || "108";
  });
  const [sosAlertCopied, setSosAlertCopied] = useState<boolean>(false);
  const [broadcastLogs, setBroadcastLogs] = useState<{ timestamp: string; recipient: string; channel: "WhatsApp" | "SMS" | "Manual" }[]>(() => {
    try {
      const saved = localStorage.getItem("samaritan_sos_broadcast_logs");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const handleSaveSosRecipient = (num: string) => {
    setSosRecipient(num);
    localStorage.setItem("samaritan_sos_recipient", num);
  };

  const handleLogBroadcast = (channel: "WhatsApp" | "SMS" | "Manual") => {
    const newLog = {
      timestamp: new Date().toLocaleTimeString(),
      recipient: sosRecipient,
      channel
    };
    setBroadcastLogs(prev => {
      const next = [newLog, ...prev].slice(0, 5);
      localStorage.setItem("samaritan_sos_broadcast_logs", JSON.stringify(next));
      return next;
    });
  };

  // CPR Voice Guide Alignment states
  const [cprVideoTab, setCprVideoTab] = useState<"hand-interlock" | "shoulder-angle" | "chest-target" | "youtube-tutorial">("hand-interlock");
  const [ytProvider, setYtProvider] = useState<"aha" | "bhf" | "sja">("aha");
  const [bystanderAngulation, setBystanderAngulation] = useState<number>(75);
  const [showVideoGuidelines, setShowVideoGuidelines] = useState<boolean>(true);

  // Offline map caching states & constants
  const [downloadedMaps, setDownloadedMaps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("samaritan_downloaded_maps");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });
  const [downloadingMapId, setDownloadingMapId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [offlineMapMode, setOfflineMapMode] = useState<boolean>(false);
  const [selectedMapNode, setSelectedMapNode] = useState<MapNode | null>(null);
  const downloadTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDownloadMap = (mapPresetLabel: string) => {
    if (downloadedMaps.includes(mapPresetLabel)) return;
    setDownloadingMapId(mapPresetLabel);
    setDownloadProgress(0);
    
    let currentProgress = 0;
    if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    
    downloadTimerRef.current = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(downloadTimerRef.current!);
        downloadTimerRef.current = null;
        
        setDownloadedMaps(prev => {
          const next = [...prev, mapPresetLabel];
          localStorage.setItem("samaritan_downloaded_maps", JSON.stringify(next));
          return next;
        });
        setDownloadingMapId(null);
      }
      setDownloadProgress(currentProgress);
    }, 100);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (downloadTimerRef.current) clearInterval(downloadTimerRef.current);
    };
  }, []);

  // Golden Hour Timer — tick every second while emergency is active
  useEffect(() => {
    if (!emergencyActive || goldenHourStart === null) return;
    const interval = setInterval(() => {
      setGoldenHourElapsed(Math.floor((Date.now() - goldenHourStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [emergencyActive, goldenHourStart]);

  // Golden Hour Timer — helpers
  const formatGoldenTime = (elapsed: number) => {
    const totalSeconds = Math.max(0, 3600 - elapsed);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getGoldenHourColor = (elapsed: number) => {
    const minutes = elapsed / 60;
    if (minutes >= 50) return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", glow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]" };
    if (minutes >= 30) return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", glow: "shadow-[0_0_8px_rgba(245,158,11,0.3)]" };
    return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "" };
  };

  // Load state from local storage to endure emergencies
  useEffect(() => {
    const cachedState = localStorage.getItem("samaritan_active_session");
    if (cachedState) {
      try {
        const parsed = JSON.parse(cachedState);
        if (parsed.activeStep) setActiveStep(parsed.activeStep);
        if (parsed.victimType) setVictimType(parsed.victimType);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.photos) setPhotos(parsed.photos);
        if (parsed.telemetry) setTelemetry(parsed.telemetry);
        if (parsed.emergencyActive !== undefined) setEmergencyActive(parsed.emergencyActive);
        if (parsed.currentScreen) setCurrentScreen(parsed.currentScreen);
        if (parsed.reportForm) setReportForm(parsed.reportForm);
        if (parsed.redactAnonymously !== undefined) setRedactAnonymously(parsed.redactAnonymously);
        if (parsed.isMuted !== undefined) setIsMuted(parsed.isMuted);
        if (parsed.voiceLanguage !== undefined) setVoiceLanguage(parsed.voiceLanguage);
      } catch (e) {
        console.error("Failed to restore previous emergency session", e);
      }
    }

    // Verify backend configurations
    fetch("/api/config-status")
      .then(res => res.json())
      .then(data => {
        setIsAiConfigured(data.configured);
      })
      .catch(() => setIsAiConfigured(false));
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(
      "samaritan_active_session",
      JSON.stringify({ 
        activeStep, 
        victimType,
        messages, 
        photos, 
        telemetry, 
        emergencyActive, 
        currentScreen, 
        reportForm, 
        redactAnonymously,
        isMuted,
        voiceLanguage
      })
    );
  }, [activeStep, victimType, messages, photos, telemetry, emergencyActive, currentScreen, reportForm, redactAnonymously, isMuted, voiceLanguage]);

  // Speech helper
  const runLocalSpeechSynthesis = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82;
      utterance.pitch = 1.05;
      
      const voices = window.speechSynthesis.getVoices();
      let idealVoice: SpeechSynthesisVoice | null = null;
      const normalize = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace('_', '-');
      
      if (voiceLanguage === "hi") {
        utterance.lang = "hi-IN";
        idealVoice = voices.find(v => normalize(v) === "hi-in" && v.name.includes("Google")) ||
                     voices.find(v => normalize(v).startsWith("hi") && v.name.includes("Google")) ||
                     voices.find(v => normalize(v) === "hi-in") ||
                     voices.find(v => normalize(v).startsWith("hi")) || null;
      } else if (voiceLanguage === "mr") {
        utterance.lang = "mr-IN";
        idealVoice = voices.find(v => normalize(v) === "mr-in" && v.name.includes("Google")) ||
                     voices.find(v => normalize(v).startsWith("mr") && v.name.includes("Google")) ||
                     voices.find(v => normalize(v) === "mr-in") ||
                     voices.find(v => normalize(v).startsWith("mr")) || null;
      } else {
        utterance.lang = "en-IN";
        idealVoice = voices.find(v => normalize(v) === "en-in") ||
                     voices.find(v => normalize(v).startsWith("en") && v.name.includes("Google")) || 
                     voices.find(v => normalize(v).startsWith("en")) || null;
      }

      if (idealVoice) {
        utterance.voice = idealVoice;
      }

      utterance.onstart = () => setSpeechSynthesisActive(true);
      utterance.onend = () => setSpeechSynthesisActive(false);
      utterance.onerror = () => setSpeechSynthesisActive(false);

      window.speechSynthesis.speak(utterance);
    } catch (localErr) {
      console.warn("Local speech synthesis failed entirely", localErr);
    }
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    
    // Stop any existing SpeechSynthesis or Audio fallback
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.currentTime = 0;
      }
      setSpeechSynthesisActive(false);
    } catch (e) {
      console.warn("Error cancelling previous audio", e);
    }

    const ttsLang = voiceLanguage === "mr" ? "mr" : voiceLanguage === "hi" ? "hi" : "en-IN";

    try {
      // Clean up punctuation and special symbols to sound smooth in Google Translate TTS voice
      const cleanedText = text
        .replace(/🚨|●|🎤/g, "")
        .replace(/MH-\d+-\w+-\d+/gi, "vehicle")
        .slice(0, 200); // safety cap limit for basic API streams

      const googleTtsUrl = `/api/tts?lang=${ttsLang}&text=${encodeURIComponent(cleanedText)}`;
      
      const audio = new Audio(googleTtsUrl);
      ttsAudioRef.current = audio;
      
      audio.onplay = () => {
        setSpeechSynthesisActive(true);
      };
      
      audio.onended = () => {
        setSpeechSynthesisActive(false);
      };
      
      audio.onerror = (err) => {
        console.warn("Google Translate TTS fallback failed, trying client local SpeechSynthesis...", err);
        runLocalSpeechSynthesis(text);
      };

      audio.play().catch(playErr => {
        if (playErr && (playErr.name === "AbortError" || playErr.message?.includes("interrupted"))) {
          // Playback was aborted or paused intentionally by a subsequent step or screen change. Quietly ignore.
          return;
        }
        console.info("Audio autoplay policy check or playback failure: running native local TTS fallback...", playErr);
        runLocalSpeechSynthesis(text);
      });
    } catch (e) {
      console.warn("HTML5 audio playback error, running native local SpeechSynthesis fallback...", e);
      runLocalSpeechSynthesis(text);
    }
  };

  // Trigger speech on step changes or mute / language toggle
  useEffect(() => {
    if (emergencyActive && currentScreen === "voice" && !isMuted) {
      const stepDetails = getModifiedStepDetails(activeStep - 1);
      if (stepDetails) {
        if (voiceLanguage === "hi" && stepDetails.instructionHindi && stepDetails.titleHindi) {
          speakText(`कदम ${stepDetails.step}: ${stepDetails.titleHindi}। निर्देश: ${stepDetails.instructionHindi}`);
        } else if (voiceLanguage === "mr" && stepDetails.instructionMarathi && stepDetails.titleMarathi) {
          speakText(`पायरी ${stepDetails.step}: ${stepDetails.titleMarathi}। सूचना: ${stepDetails.instructionMarathi}`);
        } else {
          speakText(`Step ${stepDetails.step}: ${stepDetails.title}. Instruction: ${stepDetails.instruction}`);
        }
      }
    } else {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (ttsAudioRef.current) {
          ttsAudioRef.current.pause();
          ttsAudioRef.current.currentTime = 0;
        }
        setSpeechSynthesisActive(false);
      } catch (_) {}
    }
  }, [activeStep, currentScreen, emergencyActive, isMuted, voiceLanguage, victimType]);

  // Soundwave visualizer rhythm generator
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (speechSynthesisActive && !isMuted) {
      interval = setInterval(() => {
        setAudioWaves(Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 8));
      }, 100);
    } else {
      setAudioWaves(Array.from({ length: 12 }, () => 4));
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [speechSynthesisActive, isMuted]);

  const getVictimBpm = () => {
    if (victimType === "infant") return 120;
    if (victimType === "child") return 115;
    return 110; // adult and pregnant
  };

  const getModifiedStepDetails = (stepIndex: number) => {
    let originalList = EMERGENCY_STEPS;
    if (emergencyType === "bite") originalList = SNAKE_BITE_STEPS;
    else if (emergencyType === "heat") originalList = HEAT_STROKE_STEPS;
    else if (emergencyType === "electrical") originalList = ELECTRICAL_SHOCK_STEPS;
    else if (emergencyType === "bike") originalList = BIKE_ACCIDENT_STEPS;
    else if (emergencyType === "car") originalList = CAR_ACCIDENT_STEPS;
    else if (emergencyType === "custom") {
      const desc = customEmergencyText.trim() || "Custom Emergency";
      originalList = EMERGENCY_STEPS.map(step => {
        if (step.step === 1) {
          return {
            ...step,
            title: `Safety: ${desc.substring(0, 30)}...`,
            instruction: `Ensure absolute personal safety from any immediate threats related to: ${desc}. Make sure the space around the patient is completely safe to approach.`,
            instructionHindi: `सुरक्षा सुनिश्चित करें: ${desc}। सबसे पहले अपनी सुरक्षा की जाँच करें।`,
            instructionMarathi: `सुरक्षितता तपासा: ${desc}। आधी स्वतःची जागा सुरक्षित करा.`
          };
        }
        if (step.step === 3) {
          return {
            ...step,
            title: `Call 112 for ${desc.substring(0, 20)}...`,
            instruction: `Dial 112 immediately. State clearly: 'Emergency! I am witnessing a critical situation involving ${desc}.' Share current GPS coordinates.`,
            instructionHindi: `तुरंत 112 डायल करें। स्पष्ट कहें: 'आपातकालीन! मैं ${desc} की स्थिति देख रहा हूँ।'`,
            instructionMarathi: `त्वरित 112 डायल करा आणि ${desc} बद्दल माहिती द्या.`
          };
        }
        return step;
      });
    }

    const original = originalList[stepIndex];
    if (!original) return original;
    
    // Create a shadow copy
    const modified = { ...original };
    
    if (emergencyType === "cardiac") {
      if (original.step === 5) {
        if (victimType === "infant") {
          modified.instruction = "Check breathing. Look for chest expansion (infant breathing can be quick and shallow). Listen closely for 10 seconds.";
          modified.instructionHindi = "सांस की जांच करें। छाती के विस्तार को देखें (शिशु की सांसें बहुत तेज़ और हल्की हो सकती हैं)।";
          modified.instructionMarathi = "श्वासोच्छ्वास तपासा. छातीच्या हालचालींवर बारीक लक्ष द्या (शिशूचा श्वास खूप हलका आणि जलद असू शकतो).";
        }
      }
      
      if (original.step === 6) {
        if (victimType === "adult") {
          modified.instruction = "If they are NOT breathing, begin chest compressions immediately. Push in center chest bone deep (5-6 cm) and fast.";
          modified.criticalDo = "Compress center of chest with both hands interlocked deep (5-6 cm) at 110 BPM (use metronome below).";
          modified.criticalDont = "Do not bend arms or lean sideways; direct downward force 5-6 cm deep.";

          modified.instructionHindi = "यदि वे सांस नहीं ले रहे हैं, तो तुरंत सीपीआर शुरू करें। छाती के ठीक बीच में 5-6 सेमी गहराई में तेजी से दबाएं।";
          modified.instructionMarathi = "जर ते श्वास घेत नसतील, तर त्वरित सीपीआर सुरू करा. छातीच्या अगदी मधोमध 5 ते 6 सेमी खोल आणि जोरात दाबा।";
        } else if (victimType === "pregnant") {
          modified.instruction = "If she is NOT breathing, begin chest compressions. Place a jacket under her right hip to tilt her slightly left (15°).";
          modified.criticalDo = "Compress center chest slightly higher on sternum, 5-6 cm deep at 110 BPM. Tilt hip left to relieve major vein pressure.";
          modified.criticalDont = "Never lie her completely flat; left tilt prevents womb from compressing the vena cava.";

          modified.instructionHindi = "यदि वह सांस नहीं ले रही हैं, तो तुरंत सीपीआर शुरू करें। रीढ़ के दबाव से बचने के लिए दाहिने कूल्हे के नीचे एक जैकेट रखकर थोड़ा बाईं ओर (15°) झुकाएं।";
          modified.instructionMarathi = "जर त्या श्वास घेत नसतील तर सीपीआर आणि कम्प्रेशन सुरू करा. गर्भाशयावरील रक्तवाहिन्यांचा दाब कमी करण्यासाठी उजव्या बाजूखाली जॅकेट ठेवून डाव्या बाजूला 15 अंश कलते करा।";
        } else if (victimType === "child") {
          modified.instruction = "If not breathing, begin pediatric CPR. Compress center chest lighter (4-5 cm) and fast.";
          modified.criticalDo = "Compress center chest with only ONE hand (or lighter two hands) keeping the depth strictly to 4-5 cm (115 BPM metronome).";
          modified.criticalDont = "Do NOT use full adult force; pushing beyond 5 cm can fracture child's ribs.";

          modified.instructionHindi = "यदि बच्चा सांस नहीं ले रहा है, तो तुरंत सीपीआर शुरू करें। छाती के बीच में केवल एक हाथ से 4-5 सेमी गहराई में हल्के से दबाएं।";
          modified.instructionMarathi = "जर बालक श्वास घेत नसेल तर बाल सीपीआर कम्प्रेशन सुरू करा. एका हाताने छातीच्या मध्यावर 4 ते 5 सेमी हलका दाब द्या (115 बीपीएम गती)।";
        } else if (victimType === "infant") {
          modified.instruction = "If infant is not breathing, start infant CPR. Gently compress center chest (4 cm deep) using TWO FINGERS ONLY.";
          modified.criticalDo = "Compress center chest (just below nipple line) using ONLY 2 fingers (index and middle) to a depth of 4 cm (120 BPM metronome).";
          modified.criticalDont = "NEVER use your whole palm or body weight; this can cause lethal internal trauma to babies.";

          modified.instructionHindi = "यदि शिशु सांस नहीं ले रहा, तो नवजात सीपीआर शुरू करें। केवल दो उंगलियों (तर्जनी और मध्यमा) से छाती के ठीक बीच 4 सेमी दबाएं।";
          modified.instructionMarathi = "जर नवजात बाळ श्वास घेत नसेल तर फक्त 2 बोटांचा वापर करून छातीवर 4 सेमी इतपत हलका दाब द्या (120 बीपीएम गतीसह)।";
        }
      }
    }
    return modified;
  };

  // CPR pulse effect
  useEffect(() => {
    if (cprActive) {
      const bpm = getVictimBpm();
      const intervalMs = Math.round(60000 / bpm);
      cprIntervalRef.current = setInterval(() => {
        setCprFlash(prev => {
          const next = !prev;
          if (next && typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
              navigator.vibrate(60); // 60ms vibration pulse on each thrust
            } catch (_) {}
          }
          return next;
        });
        // Play subtle low click if supported
        try {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const audioCtx = audioCtxRef.current;
          if (audioCtx.state === "suspended") {
            audioCtx.resume();
          }
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          const pitchHz = victimType === "infant" ? 200 : victimType === "child" ? 150 : 110;
          osc.frequency.setValueAtTime(pitchHz, audioCtx.currentTime); 
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
        } catch (_) {}
      }, intervalMs / 2); // toggle off and on each beat
    } else {
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
      setCprFlash(false);
    }

    return () => {
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
    };
  }, [cprActive, victimType]);

  // Trigger Emergency Mode
  const startEmergency = () => {
    setShowVictimSelector(true);
  };

  // ── Shake-to-activate logic ──────────────────────────────────────────────
  const handleShake = useCallback(() => {
    // Don't trigger if emergency already active or overlay already showing
    if (emergencyActive || shakeConfirmVisible) return;

    setShakeCountdown(3);
    setShakeConfirmVisible(true);

    let count = 3;
    shakeCountdownRef.current = setInterval(() => {
      count -= 1;
      setShakeCountdown(count);
      if (count <= 0) {
        clearInterval(shakeCountdownRef.current!);
        setShakeConfirmVisible(false);
        startEmergency(); // auto-confirm after 3 seconds
      }
    }, 1000);
  }, [emergencyActive, shakeConfirmVisible]);

  const cancelShake = () => {
    if (shakeCountdownRef.current) clearInterval(shakeCountdownRef.current);
    setShakeConfirmVisible(false);
    setShakeCountdown(3);
  };

  const confirmShake = () => {
    if (shakeCountdownRef.current) clearInterval(shakeCountdownRef.current);
    setShakeConfirmVisible(false);
    startEmergency();
  };

  // Attach shake detector — only when emergency is NOT already active
  useShakeDetector(handleShake, {
    enabled: !emergencyActive,
    threshold: 15,
    shakesRequired: 4,
    timeWindow: 800,
    cooldown: 5000,
  });

  const startEmergencyWithVictim = (
    type: "adult" | "pregnant" | "child" | "infant",
    selectedEmergencyType: "cardiac" | "bite" | "heat" | "electrical" | "bike" | "car" | "custom" = "cardiac"
  ) => {
    setVictimType(type);
    setEmergencyType(selectedEmergencyType);
    setEmergencyActive(true);
    setShowVictimSelector(false);
    setCurrentScreen("voice");
    setActiveStep(1);
    setGoldenHourStart(Date.now());
    setGoldenHourElapsed(0);

    // Fetch nearest hospital via GPS
    if (telemetry.latitude && telemetry.longitude) {
      setNearestHospital(prev => ({ ...prev, loading: true }));
      fetch(`/api/nearest-hospital?lat=${telemetry.latitude}&lng=${telemetry.longitude}`)
        .then(r => r.json())
        .then(data => setNearestHospital({ ...data, loading: false }))
        .catch(() => setNearestHospital({ name: "Hospital lookup failed", address: "Call 112 for dispatch", phone: "112", distance: null, fallback: true, loading: false }));
    }

    const scenarioNames = {
      cardiac: "Cardiac Arrest & Standard CPR",
      bite: "Snake & Venomous Bite Trauma",
      heat: "Extreme Heat Stroke Mitigation",
      electrical: "High-Voltage Electrical Accident Isolation",
      bike: "Motorcycle Road Crash Protocol",
      car: "Car Collision Safety Rescue",
      custom: customEmergencyText.trim() || "Custom Trauma Emergency"
    };

    const scenarioNamesHi = {
      cardiac: "कार्डियक अरेस्ट और सीपीआर",
      bite: "सांप काटने का इलाज",
      heat: "हीट स्ट्रोक और लू का आपातकाल",
      electrical: "बिजली का झटका दुर्घटना",
      bike: "मोटर साइकिल सड़क दुर्घटना",
      car: "कार दुर्घटना बचाव प्रक्रिया",
      custom: customEmergencyText.trim() || "कस्टम आपातकालीन दुर्घटना"
    };

    const scenarioNamesMr = {
      cardiac: "कार्डियाक अरेस्ट आणि सीपीआर",
      bite: "सर्पदंशाची तात्काळ मदत",
      heat: "तीव्र उष्माघाताची मदत",
      electrical: "विद्युत धक्क्याची मदत",
      bike: "मोटारसायकल रस्ता अपघात मदत",
      car: "कार अपघात आणि बचाव मदत",
      custom: customEmergencyText.trim() || "सानुकूल आपत्कालीन मदत"
    };

    // Play warm welcome/safety speech instantly
    setTimeout(() => {
      const pName = voiceLanguage === "hi" ? scenarioNamesHi[selectedEmergencyType] : voiceLanguage === "mr" ? scenarioNamesMr[selectedEmergencyType] : scenarioNames[selectedEmergencyType];
      if (voiceLanguage === "hi") {
        speakText(`आपातकालीन सिस्टम शुरू हो गया है। हमने ${pName} संरेखित किया है। पहले सुनिश्चित करें कि आप सुरक्षित हैं।`);
      } else if (voiceLanguage === "mr") {
        speakText(`आपत्कालीन सिस्टीम सुरू झाली आहे. आम्ही ${pName} संरेखित करत आहोत. आधी खात्री करा की तुम्ही सुरक्षित आहात.`);
      } else {
        speakText(`Emergency system initiated. We are aligning help for ${pName}. Check your surroundings and make sure you are safe first.`);
      }
    }, 400);

    setMessages([
      {
        role: "assistant",
        content: `🚨 Emergency Mode Switched (${selectedEmergencyType.toUpperCase()} Protocol - ${type.toUpperCase()}). Legal bystander defense protocols are fully armed.\n\nVerify Step 1: Ensure you aren't in danger! Is the location secure to approach?`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Exit Emergency cleanly
  const resetEmergencySession = () => {
    if (window.confirm("Are you sure you want to stop this rescue workflow? All captured proof logs will be stored in your current state.")) {
      setEmergencyActive(false);
      setCprActive(false);
      setGoldenHourStart(null);
      setGoldenHourElapsed(0);
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (_) {}
      setSpeechSynthesisActive(false);
    }
  };

  // Handle GPS Auto detection
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS tracking is not supported on this device/frame. Switched to high precision simulation.");
      const preset = PRESET_LOCATIONS[0];
      setTelemetry({
        latitude: preset.lat,
        longitude: preset.lng,
        address: `${preset.address} (Simulated GPS)`,
        accuracy: 10,
        mode: "mock"
      });
      setReportForm(prev => ({
        ...prev,
        location: preset.address
      }));
      return;
    }
    
    setTelemetry(prev => ({ ...prev, mode: "gps" }));
    setGpsStatus("Locating rescue coordinate satellites...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTelemetry({
          latitude: Number(pos.coords.latitude.toFixed(5)),
          longitude: Number(pos.coords.longitude.toFixed(5)),
          address: `GPS: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`,
          accuracy: Math.round(pos.coords.accuracy),
          mode: "gps"
        });
        setReportForm(prev => ({
          ...prev,
          location: `GPS Locked: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`
        }));
        setGpsStatus("Satellite GPS Lock Successful.");
      },
      (err) => {
        console.log("GPS dynamic detection fell back to high precision simulation safely.", err);
        setGpsStatus("GPS Signal unavailable. Switched to high precision simulation preset.");
        const preset = PRESET_LOCATIONS[0];
        setTelemetry({
          latitude: preset.lat,
          longitude: preset.lng,
          address: `${preset.address} (Simulated GPS)`,
          accuracy: 10,
          mode: "mock"
        });
        setReportForm(prev => ({
          ...prev,
          location: preset.address
        }));
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setTelemetry({
      latitude: preset.lat,
      longitude: preset.lng,
      address: preset.address,
      accuracy: 10,
      mode: "mock"
    });
    setReportForm(prev => ({
      ...prev,
      location: preset.address
    }));
    setShowLocationSettings(false);
  };

  // Automated step response helper
  const updateActiveStepFromInput = (input: string) => {
    const text = input.toLowerCase();
    
    if (text.includes("yes") || text.includes("safe") || text.includes("secure")) {
      if (activeStep === 1) setActiveStep(2);
    }
    if (text.includes("respond") || text.includes("heard") || text.includes("shook") || text.includes("conscious") || text.includes("unconscious")) {
      if (activeStep === 2) setActiveStep(3);
    }
    if (text.includes("112") || text.includes("called") || text.includes("dispatch") || text.includes("police")) {
      if (activeStep === 3) setActiveStep(4);
    }
    if (text.includes("move") || text.includes("stabilized") || text.includes("neck") || text.includes("spine")) {
      if (activeStep === 4) setActiveStep(5);
    }
    if (text.includes("breath") || text.includes("airway") || text.includes("lungs")) {
      if (activeStep === 5) setActiveStep(6);
    }
    if (text.includes("cpr") || text.includes("compression") || text.includes("compress")) {
      if (activeStep === 6) setActiveStep(7);
    }
    if (text.includes("bleed") || text.includes("blood") || text.includes("cloth") || text.includes("band")) {
      if (activeStep === 7) setActiveStep(8);
    }
  };

  // Submit Chat
  const handleChatSubmit = async (customMessage?: string, attachedImage?: string, attachedImageType?: string) => {
    const textToSend = customMessage || userInput;
    if (!textToSend.trim() && !attachedImage) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend || `[Sent photographic proof: ${attachedImageType || "Scene Indicator"}]`,
      timestamp: new Date().toLocaleTimeString(),
      image: attachedImage,
      imageType: attachedImageType
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setUserInput("");
    setIsLoadingChat(true);

    if (textToSend) {
      updateActiveStepFromInput(textToSend);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs,
          location: `${telemetry.address} (${telemetry.latitude}, ${telemetry.longitude})`,
          victimType: victimType,
          language: language
        })
      });

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.text,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err) {
      console.error("Chat failure:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I am right beside you. Focus on Step ${activeStep}: ${getModifiedStepDetails(activeStep - 1)?.title || 'Rescue'}. Make sure they are warm and stable.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Dynamic quick action helper
  const executeSpecificActionText = (actionType: string) => {
    let prompt = "";
    if (actionType === "safe") {
      prompt = "Yes, I have confirmed my safety. Moving to the next step.";
      setActiveStep(2);
    } else if (actionType === "unconscious") {
      prompt = "I assessed the shoulder shake. Victim is unconscious.";
      setActiveStep(3);
    } else if (actionType === "called112") {
      prompt = `Direct 112 emergency alert dispatched. Location reported: ${telemetry.address}.`;
      setDialCallTriggered(true);
      setActiveStep(4);
    } else if (actionType === "bleeding_checked") {
      prompt = "Pressure applied tightly over bleeding puncture wound.";
      setActiveStep(8);
    }
    handleChatSubmit(prompt);
  };

  // Capture simulations
  const simulatePhotoCapture = (mockType: string) => {
    let mockUrl = "";
    let mockLabel = "";
    let svgRaw = "";
    
    switch (mockType) {
      case "Wide Scene":
        svgRaw = "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' fill='%23222530'/><circle cx='60' cy='60' r='30' fill='%23ef4444' opacity='0.3'/><rect x='10' y='50' width='100' height='20' fill='white' opacity='0.15'/><text x='50%' y='55%' font-family='sans-serif' font-weight='bold' font-size='8' fill='%23ef4444' dominant-baseline='middle' text-anchor='middle'>SCENE_WIDE_VERIFIED</text><text x='50%' y='75%' font-family='monospace' font-size='6' fill='grey' dominant-baseline='middle' text-anchor='middle'>SECURED SEC.134</text></svg>";
        mockLabel = "Wide Crash Scene Captured";
        break;
      case "License Plate":
        svgRaw = "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' fill='%23fbbf24'/><rect x='10' y='40' width='100' height='40' rx='5' fill='white' stroke='black' stroke-width='2'/><text x='50%' y='62%' font-family='monospace' font-weight='bold' font-size='11' fill='black' dominant-baseline='middle' text-anchor='middle'>MH-12-JN-8831</text></svg>";
        mockLabel = "Registration Plates MH-12";
        break;
      case "Road Condition":
        svgRaw = "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' fill='%23475569'/><path d='M30,80 Q60,20 90,80' fill='none' stroke='white' stroke-width='4'/><text x='50%' y='85%' font-family='sans-serif' font-weight='bold' font-size='8' fill='%23e2e8f0' dominant-baseline='middle' text-anchor='middle'>HIGHWAY DEFECT</text></svg>";
        mockLabel = "Pothole & Hazard Snap";
        break;
      default:
        svgRaw = "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' fill='grey'/><text x='50%' y='50%'>PHOTO</text></svg>";
        mockLabel = "Active Emergency Log";
    }

    // Safely Base64 encode the simulated SVG XML string so the backend decodes it perfectly
    const base64Data = window.btoa(unescape(encodeURIComponent(svgRaw)));
    mockUrl = `data:image/svg+xml;base64,${base64Data}`;

    const newPhoto = {
      id: Math.random().toString(),
      type: mockType,
      base64: mockUrl,
      label: mockLabel,
      timestamp: new Date().toLocaleTimeString()
    };

    setPhotos(prev => [...prev, newPhoto]);
    
    // Auto-launch Chat submission with visual image loaded directly in user message turn
    handleChatSubmit(`[System evidence capture logged: ${mockLabel} of category "${mockType}"]`, mockUrl, mockType);
  };

  // Real Upload
  const handleRealPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const newPhoto = {
        id: Math.random().toString(),
        type: selectedPhotoType,
        base64: result,
        label: `${selectedPhotoType}: ${file.name}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setPhotos(prev => [...prev, newPhoto]);
      
      // Auto-launch Chat submission with visual image loaded directly in user message turn
      handleChatSubmit(`[Smartphone picture file uploaded: ${file.name} as category "${selectedPhotoType}"]`, result, selectedPhotoType);
    };
    reader.readAsDataURL(file);
  };

  // Generate Report
  const generateFinalReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages,
          location: reportForm.location,
          victimType: victimType,
          timestamp: new Date().toLocaleString(),
          language: language
        })
      });

      const data = await response.json();
      if (data.report) {
        setGeneratedReport(data.report);
      } else {
        throw new Error("Formatting alert");
      }
    } catch (err) {
      console.error("Report generator error, engaging offline engine:", err);
      // Construct perfect paramedic report
      setGeneratedReport({
        incident_time: new Date().toLocaleString(),
        location: reportForm.location,
        witness_summary: reportForm.witness_summary,
        actions_taken: [
          `Secured self-safety status (Step 1)`,
          `Monitored respiration & responsive states`,
          `Sought ambulance dispatch via 112`,
          ...photos.map(p => `Captured legal proof photo: ${p.label}`)
        ],
        vehicles_involved: reportForm.vehicles_involved,
        injuries_observed: reportForm.injuries_observed,
        emergency_services_called: dialCallTriggered || true,
        legal_note: "Witness acted in good faith with active immunity under Good Samaritan Law 2016"
      });
    } finally {
      setIsGeneratingReport(false);
      setShowReportModal(true);
    }
  };

  const activeStepDetails = getModifiedStepDetails(activeStep - 1) || getModifiedStepDetails(0);

  // Copy script clipboard mechanism
  const triggerCopyScript = () => {
    const scriptText = `Road accident at ${telemetry.address}. Approximately ${injuryCountSim} person(s) injured. I need an ambulance immediately. I am a bystander witness, not involved in collision.`;
    navigator.clipboard.writeText(scriptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#09090D] text-white font-sans flex flex-col relative overflow-hidden border-[1px] border-white/5 selection:bg-red-500/30 selection:text-white">

      {/* Shake-to-activate confirmation overlay */}
      <ShakeConfirmOverlay
        visible={shakeConfirmVisible}
        countdown={shakeCountdown}
        onConfirm={confirmShake}
        onCancel={cancelShake}
      />
      {/* Decorative background visualizers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#FF3B30] opacity-[0.06] blur-[150px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] bg-[#4DABFF] opacity-[0.05] blur-[130px] rounded-full" />
      </div>

      {/* 1. HOME SCREEN (When active emergency is false) */}
      {!emergencyActive ? (
        showVictimSelector ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10 max-w-4xl w-full mx-auto my-auto min-h-[85vh] animate-fadeIn">
            <div className="w-full bg-[#111116] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(225,29,72,0.15)] relative overflow-hidden backdrop-blur-md">
              
              <button 
                onClick={() => setShowVictimSelector(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-[#FF3B30] animate-pulse">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-display tracking-tight text-white">
                    Configure Emergency Triage
                  </h2>
                  <p className="text-zinc-400 font-mono text-[10.5px] uppercase tracking-wider">
                    Select the rescue type and patient category to initialize defensive aid parameters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Section 1: Emergency / Trauma Type */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">01 //</span>
                      <span className="text-sm font-bold text-zinc-300 uppercase">Emergency Scenario</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase animate-pulse-slow">
                      Scroll for more ↕
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-2">
                    {/* Cardiac Route */}
                    <button
                      type="button"
                      onClick={() => setEmergencyType("cardiac")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        emergencyType === "cardiac"
                          ? "bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${emergencyType === "cardiac" ? "bg-red-500/20 text-red-400" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                        <Heart className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Cardiac arrest / CPR</span>
                          {emergencyType === "cardiac" && <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                          Bystander CPR guidance, live metronome, airway check and compression guides.
                        </p>
                      </div>
                    </button>

                    {/* Snake Bite Route */}
                    <button
                      type="button"
                      onClick={() => setEmergencyType("bite")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        emergencyType === "bite"
                          ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${emergencyType === "bite" ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                        <Skull className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Snake / Venomous Bite</span>
                          {emergencyType === "bite" && <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                          Immobilization tactics, pressure banding technique, and ASV stocks handover.
                        </p>
                      </div>
                    </button>

                    {/* Heat Stroke Route */}
                    <button
                      type="button"
                      onClick={() => setEmergencyType("heat")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        emergencyType === "heat"
                          ? "bg-orange-500/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${emergencyType === "heat" ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                        <Sun className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Extreme Heat Stroke</span>
                          {emergencyType === "heat" && <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                          Sun protection, wetting cooling speeds, core anatomical cooling points fanning.
                        </p>
                      </div>
                    </button>

                    {/* Electrical Shock Route */}
                    <button
                      type="button"
                      onClick={() => setEmergencyType("electrical")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        emergencyType === "electrical"
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${emergencyType === "electrical" ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                        <Zap className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Electrical Shock Trauma</span>
                          {emergencyType === "electrical" && <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                          Mains current isolation safe tactics, stunning CPR bridge, and electrical burns.
                        </p>
                      </div>
                    </button>

                    {/* Bike Accident Route */}
                    <button
                      type="button"
                      id="emergency-route-bike"
                      onClick={() => setEmergencyType("bike")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        emergencyType === "bike"
                          ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${emergencyType === "bike" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                        <Bike className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Bike Accident</span>
                          {emergencyType === "bike" && <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                          Helmet removal guidelines, spine stabilization, roadway hazards, and friction scrapes.
                        </p>
                      </div>
                    </button>

                    {/* Car Accident Route */}
                    <button
                      type="button"
                      id="emergency-route-car"
                      onClick={() => setEmergencyType("car")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        emergencyType === "car"
                          ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${emergencyType === "car" ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                        <Car className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Car Accident</span>
                          {emergencyType === "car" && <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                          Collision zone protection, gasoline/spark hazard checks, dashboard extraction warn risk, and arterial bleed compression.
                        </p>
                      </div>
                    </button>

                    {/* Custom Emergency Route */}
                    <button
                      type="button"
                      id="emergency-route-custom"
                      onClick={() => setEmergencyType("custom")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        emergencyType === "custom"
                          ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/15 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${emergencyType === "custom" ? "bg-purple-500/20 text-purple-400" : "bg-white/5 text-zinc-400 group-hover:text-white"}`}>
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-tight">Custom Scenario</span>
                          {emergencyType === "custom" && <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                          Define and customize your own emergency incident description dynamically.
                        </p>
                      </div>
                    </button>

                    {/* Custom Input Box */}
                    {emergencyType === "custom" && (
                      <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-2 animate-fadeIn" id="custom-emergency-input-container">
                        <label htmlFor="custom-emergency-input" className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
                          Describe the Emergency Scenario:
                        </label>
                        <textarea
                          id="custom-emergency-input"
                          value={customEmergencyText}
                          onChange={(e) => setCustomEmergencyText(e.target.value)}
                          placeholder="e.g. Staircase fall with shin fracture, severe hand cut, kitchen grease fire burn, choking child..."
                          rows={3}
                          className="w-full text-xs bg-black/40 border border-purple-500/40 rounded-lg p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-sans"
                        />
                        <p className="text-[9.5px] text-zinc-400 leading-normal">
                          Your custom description will dynamically calibrate the safety guidelines, 112 reporting scripts, and automated bystander legal defense parameters.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Patient Category */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider">02 //</span>
                      <span className="text-sm font-bold text-zinc-300 uppercase">Patient Category</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">
                      Select Tone
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-[380px] overflow-y-auto pr-2">
                    {/* Adult Option */}
                    <button
                      type="button"
                      onClick={() => setVictimType("adult")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        victimType === "adult"
                          ? "bg-[#FF3B30]/10 border-[#FF3B30]/50 shadow-[0_0_15px_rgba(255,59,48,0.15)]"
                          : "bg-white/[0.01] border-white/5 hover:border-[#FF3B30]/30 hover:bg-[#FF3B30]/[0.02]"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-white uppercase font-display">Adult (8+ yrs)</span>
                          <span className="text-[9px] font-mono text-zinc-500 font-bold">CPR standard</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 leading-normal">
                          For average adults. Compressions 5-6 cm deep with both hands interlocked.
                        </p>
                      </div>
                    </button>

                    {/* Pregnant Option */}
                    <button
                      type="button"
                      onClick={() => setVictimType("pregnant")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        victimType === "pregnant"
                          ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                          : "bg-white/[0.01] border-white/5 hover:border-purple-500/30 hover:bg-purple-500/[0.02]"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-white uppercase font-display">Pregnant Woman</span>
                          <span className="text-[9px] font-mono text-purple-400 font-bold animate-pulse">Tilt Left 15°</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 leading-normal">
                          Support right hip with a jacket. Heavy vena cava pressure mitigation.
                        </p>
                      </div>
                    </button>

                    {/* Child Option */}
                    <button
                      type="button"
                      onClick={() => setVictimType("child")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        victimType === "child"
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                          : "bg-white/[0.01] border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/[0.02]"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-white uppercase font-display">Child (1-8 yrs)</span>
                          <span className="text-[9px] font-mono text-cyan-400 font-bold">1 Hand (4-5 cm)</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 leading-normal">
                          For smaller children. Gently compress chest 4-5 cm deep using ONE hand.
                        </p>
                      </div>
                    </button>

                    {/* Infant Option */}
                    <button
                      type="button"
                      onClick={() => setVictimType("infant")}
                      className={`group flex items-start text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        victimType === "infant"
                          ? "bg-pink-500/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                          : "bg-white/[0.01] border-white/5 hover:border-pink-500/30 hover:bg-pink-500/[0.02]"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-extrabold text-white uppercase font-display">Infant (&lt;1 yr)</span>
                          <span className="text-[9px] font-mono text-pink-400 font-bold">2 Fingers (4 cm)</span>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 leading-normal">
                          For babies under 1 year. Gently compress center chest 4 cm using 2 fingers only.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Start CTA */}
              <button
                type="button"
                onClick={() => startEmergencyWithVictim(victimType, emergencyType)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF3B30] to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold uppercase font-display tracking-wider cursor-pointer shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:shadow-[0_0_40px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2 mb-6"
              >
                <Shield className="w-5 h-5 animate-pulse" />
                Activate Samaritan Shield Guidance
              </button>

              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2 max-w-sm mx-auto justify-center text-center">
                <Shield className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-[9.5px] font-mono uppercase text-zinc-500">
                  This 3-second choice secures life. All guidelines are legally protected.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10 my-auto min-h-[85vh]">
            <div className="max-w-md w-full flex flex-col items-center">
              
              {/* Glowing Logo Circle */}
              <div className="relative mb-8 group">
                <div className="absolute inset-0 rounded-full bg-[#FF3B30] opacity-15 blur-xl group-hover:opacity-25 transition-all animate-pulse duration-1000" />
                <div className="w-24 h-24 rounded-full border-2 border-red-500/50 bg-[#14141F] flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <Shield className="w-12 h-12 text-[#FF3B30] animate-pulse" />
                </div>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight mb-2 uppercase font-display bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                SAMARITAN <span className="text-[#FF3B30]">AI</span>
              </h1>
              <p className="text-zinc-400 font-mono text-[11px] uppercase tracking-[0.25em] mb-4">
                Bystander Shield & Paramedic Guide
              </p>

              {/* Real Gemini AI Brain System Status */}
              <div className="mb-10 flex items-center justify-center">
                {isAiConfigured ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Gemini Brain Activated
                  </div>
                ) : (
                  <div className="inline-flex flex-col items-center gap-1.5 max-w-xs">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Local Backup Active
                    </div>
                    <span className="text-[9.5px] text-zinc-500 font-mono leading-normal">
                      Activate the Gemini Brain via the <span className="text-zinc-300 font-bold">Settings &gt; Secrets</span> menu (GEMINI_API_KEY)
                    </span>
                  </div>
                )}
              </div>

              {/* Giant Action Button */}
              <button
                onClick={startEmergency}
                className="group relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#E11D48] hover:bg-red-600 text-white font-display font-black text-xl sm:text-2xl tracking-[0.08em] flex flex-col items-center justify-center border-4 border-red-400/50 shadow-[0_0_50px_rgba(225,29,72,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                id="emergency-trigger-hero"
              >
                <div className="absolute inset-0 rounded-full animate-ping bg-[#E11D48] opacity-10" />
                <span className="block text-center uppercase leading-tight select-none">
                  I SEE AN <br /> ACCIDENT
                </span>
                <span className="block text-[9.5px] tracking-normal font-mono text-white/50 opacity-0 group-hover:opacity-100 transition-opacity mt-2.5">
                  TAP TO GENERATE AID
                </span>
              </button>

              <p className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider text-center mt-10 max-w-xs leading-relaxed">
                Nothing else. No distractions.<br />
                Tap to start.
              </p>

              {/* Supreme Court Mandate badge */}
              <div className="mt-12 py-2 px-4 rounded-xl bg-white/[0.02] border border-white/5 text-zinc-400 text-[10px] flex items-center gap-2 max-w-sm">
                <Scale className="w-3.5 h-3.5 text-[#4DABFF]" />
                <span className="font-sans">
                  Fully protected by standard Good Samaritan guidelines (MVA Sec 134)
                </span>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Emergency Workflow layout activated */
        <>
          {/* Header */}
          <header className="h-20 sm:h-16 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 z-10 bg-black/40 backdrop-blur-md gap-3 py-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shadow-[0_0_8px_#ff0000]" />
              <button 
                onClick={() => setEmergencyActive(false)}
                className="text-white hover:text-red-400 font-display font-black tracking-widest text-sm uppercase flex items-center gap-1 bg-transparent border-none outline-none"
              >
                SAMARITAN <span className="text-red-500">AI</span>
              </button>
              <span className="text-[10px] font-mono text-white/30 px-1 border border-white/10 rounded">SHIELD LIVE</span>
              {isAiConfigured ? (
                <span className="text-[9px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  GEMINI ACTIVE
                </span>
              ) : (
                <span className="text-[9px] font-mono font-medium text-amber-400 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  LOCAL BACKUP
                </span>
              )}
            </div>

            {/* Real-time Location Indicator */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">

              {/* Golden Hour Timer */}
              {goldenHourStart !== null && (() => {
                const gc = getGoldenHourColor(goldenHourElapsed);
                const isExpired = goldenHourElapsed >= 3600;
                return (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-[11px] uppercase tracking-wider transition-all ${gc.bg} ${gc.border} ${gc.text} ${gc.glow}`}>
                    <Clock className="w-3 h-3" />
                    <span>{isExpired ? "GOLDEN HR ELAPSED" : formatGoldenTime(goldenHourElapsed)}</span>
                  </div>
                );
              })()}
              <button 
                onClick={() => setShowLocationSettings(!showLocationSettings)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
                id="header-gps-trigger"
              >
                <MapPin className="w-3.5 h-3.5 text-[#4DABFF]" />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">GPS: {telemetry.address}</span>
                <span className="text-[9px] bg-[#4DABFF]/20 text-[#4DABFF] px-1 rounded-sm uppercase">Edit</span>
              </button>

              <button
                onClick={resetEmergencySession}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-lg text-[10.5px] uppercase font-bold tracking-wide transition-colors"
              >
                Exit Session
              </button>
            </div>
          </header>

          {/* Preset Location Modal */}
          {showLocationSettings && (
            <div className="absolute top-20 right-4 sm:right-6 w-80 bg-[#12121A] border border-white/10 rounded-xl p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">Emergency Position SIM</span>
                <button onClick={() => setShowLocationSettings(false)}>
                  <X className="w-4 h-4 text-zinc-500 hover:text-white" />
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                Alter simulated roads to update paramedic routing and regional hospital dispatcher scripts.
              </p>
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                <button
                  onClick={handleGPSDetect}
                  className="w-full text-left p-2 rounded-lg bg-[#4DABFF]/10 hover:bg-[#4DABFF]/20 border border-[#4DABFF]/30 text-xs text-white transition-all font-mono"
                >
                  📡 Detect Device Latitude & Longitude
                </button>
                {gpsStatus && (
                  <div className="p-2 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-400 font-mono leading-tight">
                    ℹ️ {gpsStatus}
                  </div>
                )}
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block pt-1.5">Highway Sector Presets:</span>
                {PRESET_LOCATIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 text-xs text-white/80 transition-all truncate font-mono"
                  >
                    🛣️ {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6 Core Screen Navigation Tabs */}
          <nav className="bg-black/30 border-b border-white/10 px-4 py-2 relative z-15 overflow-x-auto scrollbar-none flex gap-2">
            <button
              onClick={() => setCurrentScreen("voice")}
              className={`px-4 py-2 rounded-xl text-xs font-medium uppercase font-sans tracking-wide transition-all shrink-0 flex items-center gap-1.5 border ${
                currentScreen === "voice" 
                  ? "bg-[#FF3B30]/10 border-[#FF3B30]/40 text-[#FF4D4D] font-bold" 
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Guide</span>
            </button>

            <button
              onClick={() => setCurrentScreen("dispatch")}
              className={`px-4 py-2 rounded-xl text-xs font-medium uppercase font-sans tracking-wide transition-all shrink-0 flex items-center gap-1.5 border ${
                currentScreen === "dispatch" 
                  ? "bg-[#4DABFF]/10 border-[#4DABFF]/40 text-[#4DABFF] font-bold" 
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dispatch Helper</span>
            </button>

            <button
              onClick={() => setCurrentScreen("evidence")}
              className={`px-4 py-2 rounded-xl text-xs font-medium uppercase font-sans tracking-wide transition-all shrink-0 flex items-center gap-1.5 border ${
                currentScreen === "evidence" 
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold" 
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Evidence Capture</span>
            </button>

            <button
              onClick={() => setCurrentScreen("report")}
              className={`px-4 py-2 rounded-xl text-xs font-medium uppercase font-sans tracking-wide transition-all shrink-0 flex items-center gap-1.5 border ${
                currentScreen === "report" 
                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300 font-bold" 
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>Witness Report</span>
            </button>

            <button
              onClick={() => setCurrentScreen("legal")}
              className={`px-4 py-2 rounded-xl text-xs font-medium uppercase font-sans tracking-wide transition-all shrink-0 flex items-center gap-1.5 border ${
                currentScreen === "legal" 
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold" 
                  : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Legal Protection</span>
            </button>
          </nav>

          {/* Main workspace layout */}
          <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 z-10 overflow-x-hidden">
            
            {/* Screen Content Window */}
            <div className="flex-1 flex flex-col gap-6">
              
              {/* SCREEN 2: VOICE GUIDE */}
              {currentScreen === "voice" && (
                <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 sm:p-10 flex flex-col items-center text-center justify-between min-h-[460px] relative shadow-lg">
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#FF4D4D] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-2.5 py-1 rounded">
                      Protocol Step {activeStep} of 10
                    </span>
                    {activeStep !== 6 && (
                      <button 
                        onClick={() => setActiveStep(6)}
                        className="text-[9px] uppercase font-mono tracking-wider text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 rounded transition-all cursor-pointer"
                        title="Jump directly to CPR Compression Guidance & Video Alignment Demonstrator"
                      >
                        ⚡ CPR Video Guide
                      </button>
                    )}
                  </div>

                  {/* Absolute positioning segment voice language switcher */}
                  <div className="absolute top-4 right-4 flex bg-black/50 border border-white/5 rounded-xl p-1 font-mono text-[9.5px] items-center gap-1 shadow-lg backdrop-blur-md">
                    <span className="text-[8px] text-zinc-500 uppercase px-1.5 font-black tracking-wider hidden sm:inline">Voice Language:</span>
                    <button
                      onClick={() => setVoiceLanguage("en")}
                      className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all text-[9px] cursor-pointer ${
                        voiceLanguage === "en"
                          ? "bg-white/10 text-white border border-white/10"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      ENG
                    </button>
                    <button
                      onClick={() => setVoiceLanguage("hi")}
                      className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all text-[9px] cursor-pointer ${
                        voiceLanguage === "hi"
                          ? "bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/20"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => setVoiceLanguage("mr")}
                      className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all text-[9px] cursor-pointer ${
                        voiceLanguage === "mr"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      मराठी
                    </button>
                  </div>

                  {/* Volume Speech Feedback Waveform */}
                  <div className="my-8 flex flex-col items-center">
                    <div className="h-16 flex items-center justify-center gap-1.5 mb-2">
                      {audioWaves.map((height, index) => (
                        <div
                          key={index}
                          style={{ height: `${height}px` }}
                          className={`w-1 rounded-full transition-all duration-100 ${
                            speechSynthesisActive ? "bg-[#FF3B30] shadow-[0_0_8px_#ff0000]" : "bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-widest">
                        {speechSynthesisActive ? "Speaking Instruction..." : "Voice Idle"}
                      </span>
                      <span className="text-[9.5px] font-mono text-zinc-600 uppercase tracking-wide">
                        🎤 Engine: <span className="text-zinc-500 font-bold">{activeVoiceName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Large visual text */}
                  <div className="max-w-2xl w-full">
                    <span className="text-xs uppercase font-mono font-bold text-zinc-400 block mb-1">
                      {voiceLanguage === "hi" && activeStepDetails.titleHindi ? activeStepDetails.titleHindi : (voiceLanguage === "mr" && activeStepDetails.titleMarathi ? activeStepDetails.titleMarathi : activeStepDetails.title)}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                      {voiceLanguage === "hi" && activeStepDetails.instructionHindi ? activeStepDetails.instructionHindi : (voiceLanguage === "mr" && activeStepDetails.instructionMarathi ? activeStepDetails.instructionMarathi : activeStepDetails.instruction)}
                    </h2>

                    {/* Quick highlight checklist do's */}
                    <div className="inline-flex gap-2.5 items-start text-left bg-black/40 border border-white/5 p-4 rounded-xl leading-relaxed text-sm max-w-lg mx-auto w-full">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shrink-0 mt-1.5" />
                      <p className="text-zinc-300">
                        <strong className="text-white text-xs block uppercase tracking-wider mb-0.5">Critical Samaritan Objective:</strong>
                        {activeStepDetails.criticalDo}
                      </p>
                    </div>

                    {/* Integrated Air-Gapped High-Contrast Schematic Diagram */}
                    <div className="mt-6">
                      <OfflineIllustrations step={activeStep} victimType={victimType} emergencyType={emergencyType} />
                    </div>

                    {/* CPR HAND PLACEMENT & ALIGNMENT VIDEO MODULE (Requested for Visual Alignment) */}
                    {activeStep === 6 && (
                      <div className="w-full max-w-xl mt-6 mx-auto p-5 bg-zinc-950/80 border border-white/10 rounded-2xl text-left shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B30]/5 rounded-full blur-3xl" />
                        
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="p-1 px-1.5 bg-red-500/10 border border-red-500/30 rounded text-[#FF3B30] animate-pulse">
                              <Video className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">CPR Visual Alignment Console</h4>
                              <p className="text-[10px] text-zinc-400 font-mono">Simulate alignment vectors & hand locking</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowVideoGuidelines(!showVideoGuidelines)}
                            className={`px-2 py-1 rounded text-[9px] font-mono border transition-all ${
                              showVideoGuidelines 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                : "bg-white/5 border-white/10 text-zinc-400"
                            }`}
                          >
                            {showVideoGuidelines ? "● OVERLAY LINES ON" : "○ OVERLAY LINES OFF"}
                          </button>
                        </div>

                        {/* Video tab buttons */}
                        <div className="grid grid-cols-4 gap-1 mb-4 relative z-10">
                          <button
                            onClick={() => setCprVideoTab("hand-interlock")}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-mono uppercase tracking-wide border transition-all text-center ${
                              cprVideoTab === "hand-interlock"
                                ? "bg-white/10 border-white/20 text-white font-bold"
                                : "bg-black/20 border-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            1. Palms
                          </button>
                          <button
                            onClick={() => setCprVideoTab("shoulder-angle")}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-mono uppercase tracking-wide border transition-all text-center ${
                              cprVideoTab === "shoulder-angle"
                                ? "bg-white/10 border-white/20 text-white font-bold"
                                : "bg-black/20 border-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            2. 90° Force
                          </button>
                          <button
                            onClick={() => setCprVideoTab("chest-target")}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-mono uppercase tracking-wide border transition-all text-center ${
                              cprVideoTab === "chest-target"
                                ? "bg-white/10 border-white/20 text-white font-bold"
                                : "bg-black/20 border-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            3. Sternum
                          </button>
                          <button
                            onClick={() => setCprVideoTab("youtube-tutorial")}
                            className={`py-1.5 px-1 rounded-lg text-[10px] font-mono uppercase tracking-wide border transition-all text-center ${
                              cprVideoTab === "youtube-tutorial"
                                ? "bg-white/15 border-red-500/30 text-red-400 font-bold"
                                : "bg-red-500/5 border-red-500/10 text-red-300 hover:bg-red-500/10 hover:text-white"
                            }`}
                          >
                            📺 Tutorial
                          </button>
                        </div>

                        {/* Display Area for the Video and HUD Alignment Gauges */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex flex-col items-center justify-center">
                          
                          {/* YouTube Tutorial Embedded Video */}
                          {cprVideoTab === "youtube-tutorial" && (
                            <div className="absolute inset-0 w-full h-full bg-black flex flex-col justify-between">
                              {/* Top providers bar overlay */}
                              <div className="absolute top-2 left-2 z-20 flex gap-1 bg-black/85 p-1 rounded-lg border border-white/10 shadow-lg">
                                <button
                                  onClick={() => setYtProvider("aha")}
                                  className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider transition-all cursor-pointer ${
                                    ytProvider === "aha"
                                      ? "bg-red-600 text-white font-bold"
                                      : "bg-zinc-800 text-zinc-300 hover:text-white"
                                  }`}
                                >
                                  AHA (US)
                                </button>
                                <button
                                  onClick={() => setYtProvider("bhf")}
                                  className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider transition-all cursor-pointer ${
                                    ytProvider === "bhf"
                                      ? "bg-red-600 text-white font-bold"
                                      : "bg-zinc-800 text-zinc-300 hover:text-white"
                                  }`}
                                >
                                  BHF (UK)
                                </button>
                                <button
                                  onClick={() => setYtProvider("sja")}
                                  className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider transition-all cursor-pointer ${
                                    ytProvider === "sja"
                                      ? "bg-red-600 text-white font-bold"
                                      : "bg-zinc-800 text-zinc-300 hover:text-white"
                                  }`}
                                >
                                  St John
                                </button>
                              </div>

                              <iframe
                                className="w-full h-full border-0 pb-11"
                                src={
                                  ytProvider === "aha"
                                    ? "https://www.youtube.com/embed/M4ACYp75mjU?autoplay=1&mute=1&rel=0&modestbranding=1"
                                    : ytProvider === "bhf"
                                    ? "https://www.youtube.com/embed/Fmc_gO78i8I?autoplay=1&mute=1&rel=0&modestbranding=1"
                                    : "https://www.youtube.com/embed/cosS802Tz0Q?autoplay=1&mute=1&rel=0&modestbranding=1"
                                }
                                title="CPR Video Tutorial (Real Person)"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              ></iframe>

                              {/* Footer description & Out-of-iframe option in case of loading errors */}
                              <div className="absolute bottom-0 inset-x-0 bg-black/95 p-1.5 px-2 border-t border-white/10 z-10 font-mono flex items-center justify-between text-[8px]">
                                <div className="text-left text-zinc-400">
                                  <span className="text-[#FF4D4D] font-bold block uppercase">
                                    {ytProvider === "aha"
                                      ? "★ American Heart Association Tutorial"
                                      : ytProvider === "bhf"
                                      ? "★ British Heart Foundation Tutorial"
                                      : "★ St John Ambulance Real-Life Demonstration"}
                                  </span>
                                  <span>Demonstrates exact real-person compression rhythms & arm locks.</span>
                                </div>
                                <a
                                  href={
                                    ytProvider === "aha"
                                      ? "https://www.youtube.com/watch?v=M4ACYp75mjU"
                                      : ytProvider === "bhf"
                                      ? "https://www.youtube.com/watch?v=Fmc_gO78i8I"
                                      : "https://www.youtube.com/watch?v=cosS802Tz0Q"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 bg-red-600/25 hover:bg-red-600 text-white font-bold px-2 py-1 rounded border border-red-500/40 hover:border-red-500 transition-all uppercase"
                                >
                                  ↗ Open external
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Placeholder video element 1: Hand Interlocking */}
                          {cprVideoTab === "hand-interlock" && (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                              <video 
                                src="https://assets.mixkit.co/videos/preview/mixkit-hand-placement-and-cpr-compressions-preview.mp4"
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover opacity-60 pointer-events-none"
                                onError={(e) => {
                                  (e.target as HTMLVideoElement).style.display = 'none';
                                }}
                              />
                              {/* Stylized high-accuracy vector fallback / enhancement underneath */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/40 to-transparent flex flex-col justify-end p-4 font-mono">
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 225">
                                  {/* Calibration Grid overlay */}
                                  {showVideoGuidelines && (
                                    <>
                                      <defs>
                                        <pattern id="grid-pattern-1" width="20" height="20" patternUnits="userSpaceOnUse">
                                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                                        </pattern>
                                      </defs>
                                      <rect width="100%" height="100%" fill="url(#grid-pattern-1)" />
                                      {/* Medical target lines */}
                                      <circle cx="200" cy="112" r="35" className="stroke-red-500/40 fill-none" strokeWidth="1.5" strokeDasharray="4 2" />
                                      <line x1="200" y1="0" x2="200" y2="225" className="stroke-red-500/20" strokeWidth="1" strokeDasharray="2 4" />
                                      <line x1="0" y1="112" x2="400" y2="112" className="stroke-red-500/20" strokeWidth="1" strokeDasharray="2 4" />
                                      {/* Hand sketch indicators */}
                                      <path d="M170,120 Q200,90 230,120" className="stroke-emerald-400 fill-none animate-pulse" strokeWidth="2" />
                                      <path d="M180,130 Q200,105 220,130" className="stroke-emerald-400/70 fill-none animate-pulse" strokeWidth="1.5" />
                                      <text x="50%" y="30" fill="#a1a1aa" fontSize="10" fontWeight="bold" textAnchor="middle" className="uppercase tracking-[0.2em]">1. SECURE INTERLOCK FINGERS</text>
                                      <text x="50%" y="195" fill="#34d399" fontSize="9" textAnchor="middle">ALIGNMENT STATUS: PERFECTLY SECURED</text>
                                    </>
                                  )}
                                </svg>
                                <div className="bg-black/80 px-2.5 py-1.5 rounded-lg border border-white/5 max-w-sm mt-auto relative z-10">
                                  <span className="text-[10px] text-white font-bold block mb-0.5">Technique Note:</span>
                                  <p className="text-[9px] text-[#A1A1AA] leading-normal">Place the heel of one hand in the center of the chest. Interlock the fingers of your second hand on top, pulling them clear of the ribcage.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Placeholder video element 2: Shoulder Angulation Simulator */}
                          {cprVideoTab === "shoulder-angle" && (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                              <video 
                                src="https://www.w3schools.com/html/mov_bbb.mp4" 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover opacity-25 pointer-events-none"
                                onError={(e) => {
                                  (e.target as HTMLVideoElement).style.display = 'none';
                                }}
                              />
                              
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/40 to-transparent flex flex-col justify-between p-4 font-mono">
                                
                                {/* Overlay Dynamic HUD Angulator */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 225">
                                  {showVideoGuidelines && (
                                    <>
                                      <rect width="100%" height="100%" fill="url(#grid-pattern-1)" />
                                      
                                      {/* Draw the shoulder alignment vector line based on state slider */}
                                      {(() => {
                                        const rad = (bystanderAngulation * Math.PI) / 180;
                                        const len = 100;
                                        const targetX = 200 - len * Math.cos(rad);
                                        const targetY = 160 - len * Math.sin(rad);
                                        const isAligned = bystanderAngulation === 90;
                                        
                                        return (
                                          <>
                                            {/* Standard Bedline */}
                                            <line x1="50" y1="160" x2="350" y2="160" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                                            <circle cx="200" cy="160" r="6" fill="#ef4444" />
                                            
                                            {/* Desired 90 degree reference guideline */}
                                            <line x1="200" y1="60" x2="200" y2="160" stroke="rgba(52, 211, 153, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
                                            
                                            {/* User's dynamic vector line representing arm */}
                                            <line 
                                              x1="200" 
                                              y1="160" 
                                              x2={targetX} 
                                              y2={targetY} 
                                              stroke={isAligned ? "#34d399" : "#fbbf24"} 
                                              strokeWidth="3.5" 
                                            />
                                            
                                            {/* Hand joints at the end */}
                                            <circle cx={targetX} cy={targetY} r="5" fill={isAligned ? "#10b981" : "#fbbf24"} className="animate-ping" />
                                            <circle cx={targetX} cy={targetY} r="4" fill={isAligned ? "#10b981" : "#fbbf24"} />
                                            
                                            <text x="50%" y="25" fill="#a1a1aa" fontSize="10" fontWeight="bold" textAnchor="middle" className="uppercase tracking-[0.2em]">2. MAINTAIN STRICT 90° VERTICAL ALIGNMENT</text>
                                            
                                            <text x="50%" y="50" fill={isAligned ? "#34d399" : "#e4e4e7"} fontSize="11" textAnchor="middle" className="font-extrabold uppercase bg-black/60 px-1 rounded">
                                              {isAligned ? "✓ 90° PERFECTLY VERTICAL (MAX POWER)" : `⚠️ ${bystanderAngulation}° LEANING (INSUFFICIENT DEPTH)`}
                                            </text>
                                          </>
                                        );
                                      })()}
                                    </>
                                  )}
                                </svg>

                                {/* Invisible spacer so the HUD does not block */}
                                <div />

                                {/* Angulation tuner */}
                                <div className="bg-black/90 p-2 text-left rounded-lg border border-white/10 z-10 w-full max-w-sm mt-auto relative">
                                  <div className="flex justify-between items-center mb-1 text-[10px]">
                                    <span className="text-white font-bold">Simulator Arm Angle:</span>
                                    <span className={`font-mono font-bold ${bystanderAngulation === 90 ? "text-emerald-400" : "text-amber-400"}`}>
                                      {bystanderAngulation}° {bystanderAngulation === 90 && "(OPTIMAL)"}
                                    </span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="45" 
                                    max="90" 
                                    step="5" 
                                    value={bystanderAngulation}
                                    onChange={(e) => setBystanderAngulation(Number(e.target.value))}
                                    className="w-full accent-emerald-400 h-1 bg-white/10 rounded-lg cursor-pointer"
                                  />
                                  <span className="text-[8px] text-zinc-400 block mt-1 leading-normal">
                                    Drag to 90° to simulate locking elbows and pushing straight down from the shoulders for highest force conversion.
                                  </span>
                                </div>

                              </div>
                            </div>
                          )}

                          {/* Placeholder video element 3: Chest target point locate */}
                          {cprVideoTab === "chest-target" && (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                              <video 
                                src="https://www.w3schools.com/html/mov_bbb.mp4" 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover opacity-20 pointer-events-none"
                                onError={(e) => {
                                  (e.target as HTMLVideoElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950/40 to-transparent flex flex-col justify-end p-4 font-mono">
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 225">
                                  {showVideoGuidelines && (
                                    <>
                                      <rect width="100%" height="100%" fill="url(#grid-pattern-1)" />
                                      
                                      {/* Torso abstraction */}
                                      <rect x="120" y="50" width="160" height="130" rx="30" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                                      
                                      {/* Nipple line */}
                                      <line x1="100" y1="100" x2="300" y2="100" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1.5" strokeDasharray="4 2" />
                                      {/* Target point crosshair */}
                                      <circle cx="200" cy="115" r="16" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" />
                                      <line x1="200" y1="90" x2="200" y2="140" stroke="#ef4444" strokeWidth="1.5" />
                                      <line x1="175" y1="115" x2="225" y2="115" stroke="#ef4444" strokeWidth="1.5" />
                                      
                                      {/* Ripple compression waves */}
                                      <circle cx="200" cy="115" r="30" className="stroke-[#FF3B30]/30 fill-none animate-ping" strokeWidth="1" />
                                      
                                      <text x="200" y="32" fill="#a1a1aa" fontSize="10" fontWeight="bold" textAnchor="middle" className="uppercase tracking-[0.2em]">3. STALKING THE CENTER STERNUM</text>
                                      <text x="200" y="165" fill="#38bdf8" fontSize="9" textAnchor="middle">TARGET: IN BETWEEN NIPPLE LINE, LOWER STERNUM MIDDLE</text>
                                    </>
                                  )}
                                </svg>
                                <div className="bg-black/95 p-2.5 rounded-lg border border-white/5 max-w-sm mt-auto relative z-10">
                                  <span className="text-[10px] text-white font-bold block mb-0.5">Physical Guideline:</span>
                                  <p className="text-[9px] text-[#A1A1AA] leading-normal">Locate the breastbone space. Position the primary heel of your hand directly in the center of the nipple intersection line. Do not touch ribs.</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Top-right Video tag badge indicating real play status */}
                          <div className="absolute top-3 right-3 bg-red-600 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-500/20 z-10">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            {cprVideoTab === "youtube-tutorial" ? "CPR GUIDE VIDEO" : "Live Alignment Stream"}
                          </div>
                        </div>
                        
                        {/* Depth metric check */}
                        <div className="mt-3.5 bg-black/40 border border-white/5 rounded-xl p-3 flex items-center gap-3 font-mono text-xs relative z-10 w-full">
                          <div className="w-1.5 h-10 bg-gradient-to-t from-red-500 via-emerald-400 to-red-500 rounded-full relative overflow-hidden flex items-center justify-center shrink-0">
                            <span className="absolute h-1 w-full bg-white animate-[bounce_0.57s_infinite_alternate]" />
                          </div>
                          <div className="leading-relaxed text-left">
                            <span className="text-[9px] text-zinc-500 block uppercase font-bold">REQUIRED PENETRATION DEPTH</span>
                            <p className="text-[10.5px] text-zinc-300">Target depth is strictly <strong className="text-white">2.0 - 2.4 inches (5.0 - 6.0 cm)</strong>. Fully recoil chest after each push to maximize brain perfusion.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Emergency controls requested: Mute, Next Step, Emergency Call buttons only */}
                  <div className="w-full max-w-lg grid grid-cols-3 gap-3.5 mt-8">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`py-4 rounded-xl font-bold font-sans text-xs uppercase tracking-wide flex flex-col items-center justify-center gap-1.5 transition-colors border ${
                        isMuted 
                          ? "bg-red-500/10 border-red-500/30 text-red-400" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                      }`}
                      id="mute-control-guide"
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="w-5 h-5 text-red-500" />
                          <span>Unmute Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-5 h-5 text-emerald-400" />
                          <span>Mute Guide</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveStep(prev => Math.min(10, prev + 1))}
                      disabled={activeStep === 10}
                      className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 py-4 rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-colors text-white border border-white/10"
                    >
                      <ChevronRight className="w-5 h-5 text-[#4DABFF]" />
                      <span>Next Step</span>
                    </button>

                    <a
                      href="tel:112"
                      onClick={() => {
                        setDialCallTriggered(true);
                        setMessages(prev => [
                          ...prev,
                          {
                            role: "user",
                            content: "Dialed 112 from the Quick Guide screen launcher.",
                            timestamp: new Date().toLocaleTimeString()
                          }
                        ]);
                      }}
                      className="bg-[#E11D48] hover:bg-red-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all shadow-md shadow-red-500/10 text-white"
                      id="guide-phone-dial"
                    >
                      <Phone className="w-5 h-5 animate-pulse" />
                      <span>Call 112</span>
                    </a>
                  </div>

                  {/* WhatsApp SOS — one tap alert to trusted contact */}
                  <div className="w-full max-w-lg mt-3">
                    <button
                      onClick={() => {
                        const mapsLink = `https://maps.google.com/?q=${telemetry.latitude},${telemetry.longitude}`;
                        const contactNum = (sosRecipient && sosRecipient !== "108" && sosRecipient !== "112")
                          ? sosRecipient.replace(/[\s\-()]/g, "")
                          : "";

                        const msg = language === "hi"
                          ? `🚨 मैं एक सड़क दुर्घटना में मदद कर रहा हूँ। स्थान: ${telemetry.address}। नक्शा: ${mapsLink}। मैं सुरक्षित हूँ — Samaritan AI मेरी मदद कर रहा है। कृपया मेरी प्रतीक्षा करें।`
                          : language === "mr"
                          ? `🚨 मी एका रस्ते अपघातात मदत करत आहे। ठिकाण: ${telemetry.address}। नकाशा: ${mapsLink}। मी सुरक्षित आहे — Samaritan AI माझे मार्गदर्शन करत आहे।`
                          : `🚨 I've stopped to help at a road accident.\n\n📍 Location: ${telemetry.address}\n🗺️ Map: ${mapsLink}\n\n✅ I am safe. Samaritan AI is guiding me through the response protocol.\n\nPlease be aware of my location. — sent via Samaritan AI`;

                        const url = contactNum
                          ? `https://wa.me/${contactNum}?text=${encodeURIComponent(msg)}`
                          : `https://wa.me/?text=${encodeURIComponent(msg)}`;

                        window.open(url, "_blank");

                        // Log to sidebar
                        setMessages(prev => [...prev, {
                          role: "user",
                          content: "WhatsApp SOS alert sent with GPS location to trusted contact.",
                          timestamp: new Date().toLocaleTimeString()
                        }]);
                      }}
                      className="w-full py-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366]/60 text-[#25D366] font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all"
                    >
                      {/* WhatsApp icon */}
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span>
                        {(sosRecipient && sosRecipient !== "108" && sosRecipient !== "112")
                          ? `SOS Alert → ${sosRecipient}`
                          : "WhatsApp SOS — set contact in Dispatch tab"}
                      </span>
                    </button>
                    {!(sosRecipient && sosRecipient !== "108" && sosRecipient !== "112") && (
                      <p className="text-center text-[10px] font-mono text-zinc-600 mt-1.5">
                        Set your trusted contact number in the Dispatch Helper tab
                      </p>
                    )}
                  </div>

                  {/* Micro Back step navigator */}
                  {activeStep > 1 && (
                    <button
                      onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                      className="mt-4 text-[10.5px] font-mono text-zinc-500 hover:text-white flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous step guide
                    </button>
                  )}
                </div>
              )}

              {/* SCREEN 3: DISPATCH HELPER */}
              {currentScreen === "dispatch" && (
                <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-7 flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-extrabold flex items-center gap-2">
                      <Phone className="w-5 h-5 text-[#4DABFF]" />
                      <span>Automated Rescue dispatch script with GPS Coordinates</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Read this script verbatim to the 112 emergency phone desk. It automatically aggregates regional highway points.
                    </p>
                  </div>

                  {/* GPS Telemetry Display Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center gap-3 font-mono text-xs">
                      <MapPin className="w-7 h-7 text-[#4DABFF] shrink-0" />
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">LOCKED SECTOR ADDRESS</span>
                        <span className="text-white text-xs">{telemetry.address}</span>
                      </div>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex items-center gap-3 font-mono text-xs">
                      <Clock className="w-7 h-7 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">DISPATCH TIMELINE</span>
                        <span className="text-white text-xs">{new Date().toLocaleTimeString()} (Active Golden Hour)</span>
                      </div>
                    </div>
                  </div>

                  {/* Script Container */}
                  <div className="bg-[#161621] border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                    <div className="absolute top-2 right-2 flex gap-1 bg-black/60 rounded px-1 text-[9px] text-[#4DABFF] font-mono select-none">
                      FREE COOLDOWN SHIELD ACTIVE
                    </div>
                    
                    <span className="text-[9.5px] uppercase font-mono font-bold text-zinc-500 block mb-3">READ DIRECTLY TO AMBULANCE DISPATCHER</span>
                    <p className="font-mono text-base italic text-emerald-300 leading-relaxed max-w-2xl">
                      &quot;Road accident at <span className="underline not-italic text-white underline-offset-2 font-bold">{telemetry.address}</span>. Around <span className="underline not-italic text-[#FF4D4D] font-bold">{injuryCountSim} persons</span> are injured. I need an ambulance immediately. I am acting as a Samaritan bystander, not involved in any collapse.&quot;
                    </p>

                    {/* Adjust injury counts */}
                    <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Casualties Count:</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={injuryCountSim}
                          onChange={(e) => setInjuryCountSim(Number(e.target.value))}
                          className="bg-zinc-800 text-white border border-white/20 rounded-lg w-16 px-2 text-center text-xs py-1 outline-none font-bold"
                          id="injury-count-setter"
                        />
                      </div>
                      
                      {/* COPY BUTTON */}
                      <button
                        onClick={triggerCopyScript}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold font-mono tracking-wide uppercase transition-all flex items-center gap-1.5 ${
                          isCopied 
                            ? "bg-emerald-500 text-slate-950" 
                            : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                        }`}
                        id="copy-script-to-clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>COPIED SUCCESSFULLY</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY SCRIPT TO CLIPBOARD</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-zinc-500 font-sans italic">
                      Calls to 112 are free and won&apos;t log witness liabilities.
                    </span>
                    <a
                      href="tel:112"
                      onClick={() => setDialCallTriggered(true)}
                      className="bg-[#FF3B30] hover:bg-red-600 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center gap-2 text-white shadow-lg shadow-red-500/10"
                      id="launch-call-helper"
                    >
                      <Phone className="w-4 h-4 animate-bounce" />
                      <span>DIAL 112 TELEPHONE DIRECTLY</span>
                    </a>
                  </div>

                  {/* ONE-TAP SOS DISPATCH & WHATSAPP BROADCAST MODULE */}
                  <div className="bg-[#14141d] border border-[#FF3B30]/30 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-[0_0_30px_rgba(255,59,48,0.05)] mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-lg text-[#FF3B30]">
                          <Share2 className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-xs text-zinc-500 font-mono uppercase block tracking-wider font-bold">ONE-TAP RESCUE CHANNEL</span>
                          <h4 className="text-base font-extrabold text-white uppercase font-display">
                            Instant Location & Triage Broadcast
                          </h4>
                        </div>
                      </div>
                      
                      {/* Presets and Quick Selectors */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold mr-1">Presets:</span>
                        <button
                          onClick={() => handleSaveSosRecipient("108")}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${
                            sosRecipient === "108"
                              ? "bg-red-500/20 border border-red-500/50 text-red-100"
                              : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                          }`}
                        >
                          🚑 108 (EMS)
                        </button>
                        <button
                          onClick={() => handleSaveSosRecipient("112")}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${
                            sosRecipient === "112"
                              ? "bg-[#4DABFF]/20 border border-[#4DABFF]/50 text-[#4DABFF]"
                              : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                          }`}
                        >
                          👮 112 (Rescue)
                        </button>
                        <button
                          onClick={() => {
                            const savedCustom = localStorage.getItem("samaritan_custom_contact") || "+91 99999 88888";
                            handleSaveSosRecipient(savedCustom);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${
                            sosRecipient !== "108" && sosRecipient !== "112"
                              ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                              : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white"
                          }`}
                        >
                          🏠 Family Contact
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* Recipient Form and Controls (5 Columns) */}
                      <div className="md:col-span-5 flex flex-col gap-3.5 justify-between">
                        <div className="space-y-3">
                          <label className="block">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1 font-bold">Target Broadcast Number</span>
                            <div className="relative">
                              <input
                                type="text"
                                value={sosRecipient}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleSaveSosRecipient(val);
                                  if (val !== "108" && val !== "112") {
                                    localStorage.setItem("samaritan_custom_contact", val);
                                  }
                                }}
                                className="w-full bg-[#0d0d12] text-white border border-white/10 rounded-xl py-2.5 pl-3 pr-16 text-sm font-mono focus:border-[#FF3B30]/50 focus:outline-none"
                                placeholder="+91 xxxxx xxxxx"
                                id="sos-recipient-input"
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9.5px] font-mono font-bold text-zinc-400 uppercase select-none">
                                ACTIVE
                              </span>
                            </div>
                          </label>

                          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 leading-normal flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-zinc-300 font-bold uppercase text-[9.5px]">
                              <Shield className="w-3 h-3 text-red-500" />
                              <span>Panic Shield Protocols</span>
                            </div>
                            <span>One-tap will automatically open native WhatsApp or your SMS messenger client with the formatted payload. No dialing or manual coordinate typing required!</span>
                          </div>
                        </div>

                        {/* Recent transmission records */}
                        {broadcastLogs.length > 0 && (
                          <div className="bg-black/30 border border-white/5 rounded-xl p-3 font-mono">
                            <div className="text-[9px] uppercase font-bold text-zinc-500 mb-1.5 flex items-center justify-between">
                              <span>Transmission History</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="space-y-1 max-h-[75px] overflow-y-auto pr-1">
                              {broadcastLogs.map((log, index) => (
                                <div key={index} className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-white/[0.02] last:border-0 pb-1 last:pb-0">
                                  <span className="truncate max-w-[90px]">{log.recipient}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-1 py-[1px] bg-white/5 rounded uppercase text-[8px] text-[#4DABFF] font-black">{log.channel}</span>
                                    <span>{log.timestamp}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SOS Live Payload Formatted (7 Columns) */}
                      <div className="md:col-span-7 flex flex-col gap-3">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Live Generated Payload Preview</span>
                        
                        {/* Payload Screen Container */}
                        <div className="bg-[#09090d] border border-white/10 rounded-xl p-4 font-mono text-xs text-zinc-300 flex-1 flex flex-col justify-between overflow-hidden relative min-h-[160px]">
                          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-1.5 py-0.5 bg-red-950/40 border border-red-500/20 rounded text-[8px] text-red-400 font-bold uppercase select-none animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-red-500" />
                            READY TO SHIP OR COPY
                          </div>
                          
                          <div className="space-y-1 text-[11px] leading-relaxed select-all">
                            <div><span className="text-[#FF3B30] font-bold">🚨 SAMARITAN EMERGENCY SOS</span></div>
                            <div>📍 <span className="text-zinc-500">Location:</span> <span className="text-white font-medium">{telemetry.address}</span></div>
                            <div>🗺️ <span className="text-zinc-500">GPS Coordinates:</span> <span className="text-cyan-400 font-medium">{telemetry.latitude}, {telemetry.longitude}</span></div>
                            <div>🚗 <span className="text-zinc-500">Map Nav Route:</span> <span className="text-blue-400 underline break-all font-mono">https://www.google.com/maps/search/?api=1&query={telemetry.latitude},{telemetry.longitude}</span></div>
                            <div>👤 <span className="text-zinc-500">Patient:</span> <span className="text-amber-400 font-medium font-bold uppercase">{victimType.toUpperCase()}</span></div>
                            <div>🏥 <span className="text-zinc-500">Current Triage Step:</span> <span className="text-white font-medium">Step {activeStep} - {activeStepDetails?.title || 'Emergency Treatment'}</span></div>
                            <div>💥 <span className="text-zinc-500">Casualties count:</span> <span className="text-red-400 font-mono font-bold">{injuryCountSim}</span></div>
                            <div className="text-zinc-500 mt-1 italic text-[10px]">⚠️ Bystander is legal. Secure ambulance dispatch immediately.</div>
                          </div>
                          
                          {/* Copied visual notification overlay */}
                          {sosAlertCopied && (
                            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 text-center p-4">
                              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                              <span className="text-xs font-bold text-white uppercase tracking-wider">Payload Copied to Clipboard!</span>
                              <span className="text-[10px] text-zinc-500 font-mono">You can now paste this anywhere to dispatch help.</span>
                            </div>
                          )}
                        </div>

                        {/* Broadcast action trigger buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            onClick={() => {
                              const dynamicMsg = `🚨 SAMARITAN EMERGENCY SOS 🚨\nMedical Emergency Alert!\n📍 Location: ${telemetry.address}\n🗺️ GPS Coordinates: ${telemetry.latitude}, ${telemetry.longitude}\n🚗 Google Maps: https://www.google.com/maps/search/?api=1&query=${telemetry.latitude},${telemetry.longitude}\n👤 Patient Status: ${victimType.toUpperCase()} protocol\n🏥 Triage Stage: Step ${activeStep} of 10 - ${activeStepDetails?.title || 'Emergency Aid'}\n💥 Casualties count: ${injuryCountSim}\n⚠️ Samaritan bystander protection armed. Please dispatch ambulance immediately!`;
                              const whatsappUrl = `https://api.whatsapp.com/send?phone=${sosRecipient.replace(/[\s-()]/g, "")}&text=${encodeURIComponent(dynamicMsg)}`;
                              window.open(whatsappUrl, "_blank");
                              handleLogBroadcast("WhatsApp");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20 border border-emerald-500/20 cursor-pointer text-center"
                            id="broadcast-whatsapp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => {
                              const dynamicMsg = `🚨 SAMARITAN EMERGENCY SOS 🚨\n📍 Location: ${telemetry.address}\n🗺️ GPS: ${telemetry.latitude}, ${telemetry.longitude}\n🚗 Maps: https://www.google.com/maps/search/?api=1&query=${telemetry.latitude},${telemetry.longitude}\n👤 Patient: ${victimType.toUpperCase()}\n🏥 Step ${activeStep} of 10\n💥 Injury: ${injuryCountSim}`;
                              const smsUrl = `sms:${sosRecipient.replace(/[\s-()]/g, "")}?body=${encodeURIComponent(dynamicMsg)}`;
                              window.open(smsUrl, "_blank");
                              handleLogBroadcast("SMS");
                            }}
                            className="bg-[#4DABFF] hover:bg-blue-400 active:scale-95 text-slate-950 py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 border border-blue-300/30 cursor-pointer text-center"
                            id="broadcast-sms"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send SMS</span>
                          </button>

                          <button
                            onClick={() => {
                              const dynamicMsg = `🚨 SAMARITAN EMERGENCY SOS 🚨\nMedical Emergency Alert!\n📍 Location: ${telemetry.address}\n🗺️ GPS Coordinates: ${telemetry.latitude}, ${telemetry.longitude}\n🚗 Google Maps: https://www.google.com/maps/search/?api=1&query=${telemetry.latitude},${telemetry.longitude}\n👤 Patient Status: ${victimType.toUpperCase()} protocol\n🏥 Triage Stage: Step ${activeStep} of 10 - ${activeStepDetails?.title || 'Emergency Aid'}\n💥 Casualties count: ${injuryCountSim}\n⚠️ Samaritan bystander protection armed. Please dispatch ambulance immediately!`;
                              navigator.clipboard.writeText(dynamicMsg);
                              setSosAlertCopied(true);
                              handleLogBroadcast("Manual");
                              setTimeout(() => setSosAlertCopied(false), 2000);
                            }}
                            className="bg-white/5 hover:bg-white/10 active:scale-95 text-white border border-white/10 py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                            id="broadcast-copy"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy SOS</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nearest Hospital Card — live GPS lookup */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2 font-mono">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-center text-xs shrink-0 font-bold border border-emerald-500/20">
                      ✚ NEAREST HOSPITAL
                    </div>
                    {nearestHospital.loading ? (
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>Locating nearest trauma centre via GPS...</span>
                        </div>
                      </div>
                    ) : nearestHospital.name ? (
                      <>
                        <div className="flex-1">
                          <span className="text-xs font-bold text-white block">
                            {nearestHospital.name}
                            {nearestHospital.fallback && <span className="ml-2 text-[10px] text-amber-400 font-normal">(estimated)</span>}
                          </span>
                          <p className="text-xs text-zinc-400 mt-0.5 font-sans leading-relaxed">
                            {nearestHospital.address}
                            {nearestHospital.distance && <span className="text-emerald-400 font-mono ml-1">— {nearestHospital.distance}</span>}
                          </p>
                        </div>
                        <a
                          href={`tel:${nearestHospital.phone}`}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-[#4DABFF] hover:text-white transition-colors shrink-0"
                        >
                          Call Hospital
                        </a>
                      </>
                    ) : (
                      <div className="flex-1">
                        <span className="text-xs font-bold text-white block">Enable GPS for hospital lookup</span>
                        <p className="text-xs text-zinc-400 mt-0.5 font-sans">Allow location access to find the nearest trauma centre.</p>
                      </div>
                    )}
                  </div>

                  {/* Offline Maps Caching and Vector Navigation System */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col gap-5 mt-2 font-mono">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                          <Map className="w-4 h-4 text-[#4DABFF]" />
                          <span>Offline Sector Vector Maps Cache</span>
                        </h4>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          Pre-cache high-resolution highway geometry for low-connectivity zones.
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setOfflineMapMode(!offlineMapMode)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 border ${
                            offlineMapMode 
                              ? "bg-red-500/10 border-red-500/30 text-red-400 font-bold" 
                              : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          <WifiOff className="w-3.5 h-3.5" />
                          <span>{offlineMapMode ? "Exit Offline Simulation" : "Simulate Offline Mode"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Find active map sector data */}
                    {(() => {
                      const matchedKey = Object.keys(OFFLINE_MAPS_SECTORS).find(key => 
                        telemetry.address.includes(key) || key.includes(telemetry.address) ||
                        (telemetry.address.toLowerCase().includes("pune") && key.toLowerCase().includes("pune")) ||
                        (telemetry.address.toLowerCase().includes("delhi") && key.toLowerCase().includes("delhi")) ||
                        (telemetry.address.toLowerCase().includes("bengaluru") && key.toLowerCase().includes("bengaluru"))
                      ) || "Pune Highway, NH48 (KM 42)";
                      
                      const sector = OFFLINE_MAPS_SECTORS[matchedKey];
                      const isCached = downloadedMaps.includes(matchedKey);
                      const isDownloading = downloadingMapId === matchedKey;

                      // Simulated custom progress descriptions during download
                      let progressText = "Preparing fetch...";
                      if (downloadProgress < 20) progressText = "Initializing local database...";
                      else if (downloadProgress < 45) progressText = "Forming high-res vector lanes...";
                      else if (downloadProgress < 70) progressText = "Optimizing hospital nodes...";
                      else if (downloadProgress < 90) progressText = "Compressing emergency contacts...";
                      else progressText = "Securing cache signatures...";

                      return (
                        <div className="flex flex-col lg:flex-row gap-5">
                          {/* Map Control Info bar */}
                          <div className="flex-1 flex flex-col gap-4">
                            <div className="bg-black/35 rounded-xl p-3 border border-white/5 flex flex-col gap-1 text-[11px]">
                              <div className="flex items-center justify-between text-zinc-400">
                                <span>SECTOR IDENTIFIER:</span>
                                <span className="text-white font-bold">{sector.highwayCode}</span>
                              </div>
                              <div className="flex items-center justify-between text-zinc-400 mt-1">
                                <span>CACHED SIZE:</span>
                                <span className="text-white font-bold">{sector.size}</span>
                              </div>
                              <div className="text-zinc-500 mt-2 text-[10px] leading-relaxed border-t border-white/5 pt-1.5 font-sans">
                                {sector.roadDescription}
                              </div>
                            </div>

                            {/* Caching status trigger */}
                            <div className="bg-[#121217] rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider flex items-center gap-1.5">
                                  <Database className="w-3.5 h-3.5 text-[#4DABFF]" />
                                  Cache Registry
                                </span>
                                {isCached ? (
                                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                                    ✓ Cached Offline
                                  </span>
                                ) : isDownloading ? (
                                  <span className="text-[9px] bg-amber-500/15 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase animate-pulse">
                                    Downloading {downloadProgress}%
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-white/5 text-zinc-400 font-bold px-2 py-0.5 rounded border border-white/10 uppercase">
                                    Not Cached Yet
                                  </span>
                                )}
                              </div>

                              {/* Progress bar info */}
                              {isDownloading && (
                                <div className="space-y-1.5">
                                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-red-500 to-amber-500 h-1.5 rounded-full transition-all duration-100"
                                      style={{ width: `${downloadProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-amber-300 block italic leading-none">
                                    🚀 {progressText}
                                  </span>
                                </div>
                              )}

                              <div className="flex gap-2">
                                {!isCached ? (
                                  <button
                                    onClick={() => handleDownloadMap(matchedKey)}
                                    disabled={isDownloading}
                                    className="w-full bg-[#FF3B30] hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-2 px-3 rounded-lg text-[10.5px] uppercase transition-all flex items-center justify-center gap-1.5 border border-red-500/30 disabled:border-transparent cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{isDownloading ? `Securing map nodes (${downloadProgress}%)` : `Pre-Cache ${sector.size} Map`}</span>
                                  </button>
                                ) : (
                                  <div className="w-full space-y-2">
                                    <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] flex items-start gap-1.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                                      <span className="font-sans leading-normal">Local flash sector database validated. Navigation engine ready for fully disconnected operation.</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setDownloadedMaps(prev => {
                                          const next = prev.filter(k => k !== matchedKey);
                                          localStorage.setItem("samaritan_downloaded_maps", JSON.stringify(next));
                                          return next;
                                        });
                                        if (selectedMapNode) setSelectedMapNode(null);
                                      }}
                                      className="text-[9.5px] text-zinc-500 hover:text-red-400 underline block cursor-pointer bg-transparent border-none outline-none text-left"
                                    >
                                      Delete downloaded sector cache memory bundle
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Map Visual interactive Canvas Box */}
                          <div className="flex-1 bg-black/60 border border-white/5 rounded-2xl overflow-hidden min-h-[240px] relative flex flex-col justify-between">
                            {/* Visual grid blur helper when not downloaded & simulated offline */}
                            {(!isCached && offlineMapMode) ? (
                              <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-5 text-center">
                                <WifiOff className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
                                <span className="text-xs font-bold text-white uppercase block">Disconnected — No Cache Present</span>
                                <p className="text-[10px] text-zinc-400 max-w-sm mt-1 leading-normal font-sans">
                                  You are in simulated offline mode with poor cellular network. Download this sector's high-res map pack first to render regional assets.
                                </p>
                                <button
                                  onClick={() => setOfflineMapMode(false)}
                                  className="mt-3 bg-white/10 hover:bg-white/25 px-3 py-1 rounded text-[9px] uppercase border border-white/10 transition-colors cursor-pointer"
                                >
                                  Temporarily Disable Offline Simulation
                                </button>
                              </div>
                            ) : null}

                            {/* Top Map Indicators bar */}
                            <div className="p-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-[9px] z-20">
                              <span className="text-[#4DABFF] font-black flex items-center gap-1 uppercase tracking-wider">
                                <Activity className="w-3 h-3 text-red-500 animate-pulse" />
                                {sector.name}
                              </span>
                              <span className="text-zinc-500 uppercase">
                                {isCached ? "✓ VECT_SYS L2 OK" : "📶 LIVE STREAMING MAP"}
                              </span>
                            </div>

                            {/* Center SVG Vector Highway map */}
                            <div className="flex-1 w-full h-[160px] relative mt-1 bg-[#09090D] overflow-hidden select-none">
                              {/* Background coordinates text pattern mock */}
                              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-[0.03] text-[7px] p-1 select-none pointer-events-none">
                                {Array.from({ length: 24 }).map((_, i) => (
                                  <span key={i}>+ {(18.52 + (i * 0.01)).toFixed(3)}N</span>
                                ))}
                              </div>

                              {/* Highway Road Line SVG */}
                              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 200" preserveAspectRatio="none">
                                {/* Service Road Line */}
                                <path 
                                  d={sector.svgPath} 
                                  fill="none" 
                                  stroke="#1C1917" 
                                  strokeWidth="16" 
                                  className="opacity-70"
                                />
                                {/* Main Highway Road */}
                                <path 
                                  d={sector.svgPath} 
                                  fill="none" 
                                  stroke="#27272A" 
                                  strokeWidth="10" 
                                />
                                {/* Highway Lane Strips */}
                                <path 
                                  d={sector.svgPath} 
                                  fill="none" 
                                  stroke="#EAB308" 
                                  strokeWidth="1.2" 
                                  strokeDasharray="4 6" 
                                  className="opacity-90"
                                />
                              </svg>

                              {/* Render Interactive Nodes */}
                              {((isCached || !offlineMapMode) ? sector.nodes : []).map((node) => {
                                const isSpotlighted = selectedMapNode?.id === node.id;
                                return (
                                  <button
                                    key={node.id}
                                    onClick={() => setSelectedMapNode(node)}
                                    className="absolute p-2 transition-all z-20 focus:outline-none -translate-x-1/2 -translate-y-1/2 cursor-pointer group bg-transparent border-none outline-none"
                                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                                    title={node.label}
                                  >
                                    <div className="relative">
                                      {/* Outer Rhythmic Radar pulse */}
                                      {node.type === "crash" ? (
                                        <div className="absolute inset-0 -m-1.5 rounded-full bg-red-500/20 border border-red-500/40 animate-ping" />
                                      ) : node.type === "hospital" ? (
                                        <div className="absolute inset-0 -m-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-pulse" />
                                      ) : null}

                                      {/* Node Dot visually */}
                                      <div className={`w-4 h-4 rounded-full border shadow-lg flex items-center justify-center text-[8px] font-black text-white ${
                                        node.type === "crash" 
                                          ? "bg-red-600 border-red-400 text-white" 
                                          : node.type === "hospital"
                                          ? "bg-emerald-600 border-emerald-400"
                                          : node.type === "police"
                                          ? "bg-blue-600 border-blue-400"
                                          : "bg-zinc-600 border-zinc-400"
                                      } ${isSpotlighted ? "ring-2 ring-white scale-125" : "scale-100 group-hover:scale-110"}`}>
                                        {node.type === "crash" ? "!" : node.type === "hospital" ? "H" : node.type === "police" ? "P" : "E"}
                                      </div>

                                      {/* Tiny tooltip indicator */}
                                      <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-black/90 text-white border border-white/10 text-[7px] p-0.5 rounded px-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase whitespace-nowrap">
                                        {node.label}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Bottom Inspect Node Info Drawer */}
                            <div className="p-3 bg-black/80 border-t border-white/5 z-25 min-h-[66px] flex flex-col justify-center text-[10.5px] leading-relaxed">
                              {selectedMapNode ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-white uppercase flex items-center gap-1">
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        selectedMapNode.type === "crash" ? "bg-red-500 animate-pulse" :
                                        selectedMapNode.type === "hospital" ? "bg-emerald-500" :
                                        selectedMapNode.type === "police" ? "bg-blue-500" : "bg-zinc-500"
                                      }`} />
                                      {selectedMapNode.label}
                                    </span>
                                    {selectedMapNode.phone && (
                                      <a
                                        href={`tel:${selectedMapNode.phone}`}
                                        className="bg-[#4DABFF]/10 text-[#4DABFF] uppercase px-2 py-0.5 rounded border border-[#4DABFF]/25 font-bold hover:bg-[#4DABFF] hover:text-slate-950 transition-all text-[8.5px] cursor-pointer shrink-0"
                                      >
                                        Call Emergency Contact
                                      </a>
                                    )}
                                  </div>
                                  <p className="text-zinc-400 font-sans leading-tight">{selectedMapNode.details}</p>
                                </div>
                              ) : (
                                <p className="text-zinc-500 italic text-center font-sans">
                                  {isCached || !offlineMapMode 
                                    ? "Select on-screen map nodes (!, H, P, E) to inspect safe zones & hospital phone contacts."
                                    : "Pre-cache map pack to inspect sector coordinates and phone grids."}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* SCREEN 4: EVIDENCE CAPTURE */}
              {currentScreen === "evidence" && (
                <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-7 flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-extrabold flex items-center gap-2">
                      <Camera className="w-5 h-5 text-amber-400" />
                      <span>Guided Photo Capture Proof Registry</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Photograph crash scenes, license plates, and road damage factors safely. Evidence stores directly to report to shield your goodwill.
                    </p>
                  </div>

                  {/* 3 Prompts checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Prompt 1: Wide Shot */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                      photos.some(p => p.type === "Wide Scene") 
                        ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400" 
                        : "bg-white/[0.02] border-white/10 text-zinc-400"
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Capture 1: WIDE SHOT</span>
                          {photos.some(p => p.type === "Wide Scene") && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-400">
                          Secure broad perspective, vehicle positions, road boundaries, potholes, and weather markers.
                        </p>
                      </div>
                      <button
                        onClick={() => simulatePhotoCapture("Wide Scene")}
                        className="mt-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 text-center text-xs font-mono text-white"
                      >
                        📸 Simulate Wide Snap
                      </button>
                    </div>

                    {/* Prompt 2: Vehicle Plates */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                      photos.some(p => p.type === "License Plate") 
                        ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400" 
                        : "bg-white/[0.02] border-white/10 text-zinc-400"
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Capture 2: VEHICLE PLATES</span>
                          {photos.some(p => p.type === "License Plate") && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-400">
                          Scan and store colliding registration plate markings to defend from false blame or hit-and-runs.
                        </p>
                      </div>
                      <button
                        onClick={() => simulatePhotoCapture("License Plate")}
                        className="mt-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 text-center text-xs font-mono text-white"
                      >
                        📸 Simulate Plate Snap
                      </button>
                    </div>

                    {/* Prompt 3: Hazards / Injuries */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                      photos.some(p => p.type === "Road Condition") 
                        ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400" 
                        : "bg-white/[0.02] border-white/10 text-zinc-400"
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Capture 3: LAND HAZARDS</span>
                          {photos.some(p => p.type === "Road Condition") && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-400">
                          Photograph potholes, missing warnings, barricades, or hazards that triggered the collision.
                        </p>
                      </div>
                      <button
                        onClick={() => simulatePhotoCapture("Road Condition")}
                        className="mt-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 text-center text-xs font-mono text-white"
                      >
                        📸 Simulate Hazard Snap
                      </button>
                    </div>

                  </div>

                  {/* Manual File Input area */}
                  <div className="border border-dashed border-white/10 hover:border-white/30 rounded-2xl p-6 text-center relative cursor-pointer hover:bg-white/[0.01] transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRealPhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      id="real-smartphone-upload-input"
                    />
                    <div className="flex flex-col items-center justify-center">
                      <Camera className="w-8 h-8 text-[#4DABFF] mb-2" />
                      <span className="text-xs font-bold text-white uppercase block">Upload Mobile Camera File</span>
                      <span className="text-[10px] text-zinc-400 block mt-1 leading-normal max-w-sm">
                        Select current category in dropdown below, then click to browse or drop. Files are automatically watermarked.
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 max-w-xs mx-auto text-xs">
                      <span className="text-zinc-400 font-sans">Active Target Label:</span>
                      <select
                        value={selectedPhotoType}
                        onChange={(e) => setSelectedPhotoType(e.target.value)}
                        className="bg-zinc-800 text-white rounded border border-white/20 text-xs px-2 py-1 outline-none font-mono"
                        onClick={(e) => e.stopPropagation()} // prevent input trigger
                      >
                        <option value="Wide Scene">Wide Crash Scene</option>
                        <option value="License Plate">Vehicle License plate</option>
                        <option value="Road Condition">Pothole / Road condition</option>
                        <option value="Safety Hazard">Hazards / Downed electric line</option>
                      </select>
                    </div>
                  </div>

                  {/* Timestamped Photo Carousel Gallery */}
                  {photos.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <span className="text-[10.5px] uppercase tracking-wider text-zinc-500 font-mono block">Timestamped Evidence logs:</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {photos.map((ph) => (
                          <div key={ph.id} className="group relative rounded-xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
                            <img src={ph.base64} alt={ph.type} className="object-cover w-full h-full" />
                            
                            {/* Timestamp overlay banner */}
                            <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-mono text-[#4DABFF]">
                              🕒 {ph.timestamp}
                            </div>

                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2 text-center transition-opacity">
                              <span className="font-mono text-emerald-400 text-[10px] font-bold block">{ph.type}</span>
                              <span className="text-[8px] text-zinc-400 mt-0.5 line-clamp-1">{ph.label}</span>
                              <button
                                onClick={() => setPhotos(prev => prev.filter(p => p.id !== ph.id))}
                                className="mt-2 text-red-400 font-bold hover:text-red-500 text-[10px] underline"
                              >
                                Delete File
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SCREEN 5: WITNESS REPORT */}
              {currentScreen === "report" && (
                <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-7 flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-extrabold flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-indigo-400" />
                      <span>Standardized Samaritan Witness Report Form</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Present this completed form as a proof of immune bystander status under Indian Highway Laws. Edit the summary manually before exporting.
                    </p>
                  </div>

                  {/* Redact Personal details Toggle */}
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      {redactAnonymously ? (
                        <EyeOff className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#4DABFF] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-white block uppercase tracking-wider">
                          {redactAnonymously ? "ANONYMOUS WITNESS PROTOCOL ARMED" : "IDENTITY REDACTION CONTROLS"}
                        </span>
                        <p className="text-[11px] text-zinc-400 leading-normal max-w-sm">
                          Under India Good Samaritan Guidelines, the bystander has the absolute right to withhold personal details from police or hospital admissions.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRedactAnonymously(!redactAnonymously)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wide uppercase transition-colors shrink-0 ${
                        redactAnonymously 
                          ? "bg-orange-500 text-slate-950 shadow-md shadow-orange-500/10" 
                          : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                      }`}
                    >
                      {redactAnonymously ? "✓ Hide My Personal Info" : "🔒 Make Anonymous"}
                    </button>
                  </div>

                  {/* Editable Form */}
                  <div className="space-y-4 font-sans text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Full Name */}
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block mb-1">
                          Witness Name (Ref MV Act)
                        </label>
                        <input
                          type="text"
                          disabled={redactAnonymously}
                          value={redactAnonymously ? "REDACTED SEC.134 STANDARD SHIELD" : reportForm.witness_name}
                          onChange={(e) => setReportForm({ ...reportForm, witness_name: e.target.value })}
                          className={`w-full bg-zinc-900 border text-white rounded-lg px-3 py-2 text-xs font-sans outline-none focus:border-[#4DABFF]/50 ${
                            redactAnonymously ? "border-white/5 text-zinc-500 italic bg-white/5" : "border-white/10 bg-zinc-900"
                          }`}
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block mb-1">
                          Witness Contact Mobile
                        </label>
                        <input
                          type="text"
                          disabled={redactAnonymously}
                          value={redactAnonymously ? "WITHHELD FOR GOOD SAMARITAN DEFENSE" : reportForm.witness_phone}
                          onChange={(e) => setReportForm({ ...reportForm, witness_phone: e.target.value })}
                          className={`w-full bg-zinc-900 border text-white rounded-lg px-3 py-2 text-xs font-sans outline-none focus:border-[#4DABFF]/50 ${
                            redactAnonymously ? "border-white/5 text-zinc-500 italic bg-white/5" : "border-white/10 bg-zinc-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Location coordinate */}
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block mb-1">
                          Incident Location / Highway Sector
                        </label>
                        <input
                          type="text"
                          value={reportForm.location}
                          onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-[#4DABFF]/50 font-mono"
                        />
                      </div>

                      {/* Vehicles involved */}
                      <div>
                        <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block mb-1">
                          Involved Vehicles (Identified)
                        </label>
                        <input
                          type="text"
                          value={reportForm.vehicles_involved}
                          onChange={(e) => setReportForm({ ...reportForm, vehicles_involved: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-[#4DABFF]/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block mb-1">
                        Observed Casualties & Airway Status
                      </label>
                      <input
                        type="text"
                        value={reportForm.injuries_observed}
                        onChange={(e) => setReportForm({ ...reportForm, injuries_observed: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-[#4DABFF]/50"
                      />
                    </div>

                    {/* Witness observations description */}
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block mb-1">
                        Witness Observations / Summary of Care
                      </label>
                      <textarea
                        rows={4}
                        value={reportForm.witness_summary}
                        onChange={(e) => setReportForm({ ...reportForm, witness_summary: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs outline-none focus:border-[#4DABFF]/50 font-sans leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Generate Actions */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs text-zinc-500 font-sans leading-relaxed max-w-sm">
                      Our secure offline engine automatically appends the watermarked photo proofs to the report document.
                    </span>
                    <button
                      onClick={generateFinalReport}
                      disabled={isGeneratingReport}
                      className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingReport ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>BUNDLING DATA...</span>
                        </>
                      ) : (
                        <>
                          <FileSignature className="w-4 h-4" />
                          <span>Generate Verified PDF Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 6: LEGAL PROTECTION */}
              {currentScreen === "legal" && (
                <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 sm:p-10 flex flex-col gap-6">
                  
                  {/* Supreme Court Stamp */}
                  <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Scale className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] tracking-widest font-mono text-emerald-400 font-bold uppercase block">
                        SUPREME COURT OF INDIA DECREE
                      </span>
                      <h3 className="text-xl font-extrabold tracking-tight text-white font-display">
                        Good Samaritan Law Statutes & Codes (2016)
                      </h3>
                    </div>
                  </div>

                  {/* GIGANTIC PROTEST TYPOGRAPHY */}
                  <div className="bg-emerald-500/[0.03] border border-emerald-500/20 p-6 rounded-2xl text-center my-2 select-none">
                    <p className="text-zinc-400 text-xs uppercase font-mono tracking-widest mb-1.5">CONSTITUTIONAL DECLARATION</p>
                    <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-emerald-400 bg-emerald-500/10 py-3 rounded-lg max-w-xl mx-auto">
                      &quot;YOU CANNOT BE ARRESTED FOR HELPING.&quot;
                    </h1>
                  </div>

                  {/* 3 Explicit Bullet explaining Law Card items */}
                  <div className="space-y-4">
                    
                    {/* Bullet 1 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <strong className="text-xs uppercase font-mono tracking-wider font-bold text-white block mb-1">
                          Complete Civil & Criminal Liability Immunity
                        </strong>
                        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                          Even if a victim suffers internal injuries, chest stress, bone break during emergency life-saving CPR, or accidental demise under your care, the bystander enjoys absolute statutory immunity. You are free from court cases.
                        </p>
                      </div>
                    </div>

                    {/* Bullet 2 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-[#4DABFF]/10 border border-[#4DABFF]/30 text-[#4DABFF] flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <strong className="text-xs uppercase font-mono tracking-wider font-bold text-white block mb-1">
                          Absolute Anonymity Right (Defense Plan)
                        </strong>
                        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                          Neither the highway police patrolling nor standard hospital registrars can force you to submit your name, phone number, address, or payment cards. Providing statements is entirely voluntary.
                        </p>
                      </div>
                    </div>

                    {/* Bullet 3 */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                        3
                      </div>
                      <div>
                        <strong className="text-xs uppercase font-mono tracking-wider font-bold text-white block mb-1">
                          Right-Of-Admission Treatment Mandate
                        </strong>
                        <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                          Any doctor, medical clinic, public or private trauma room that refuses immediate critical first-aid treatment based on collision reporting faces swift licensing cancellation or criminal neglect discipline.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Motor Vehicle Act Sec 134 citation */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>COUNCIL PROTECTION SEC 134 CLAUSE A</span>
                    <span>INDIA GAZETTE CERTIFIED</span>
                  </div>
                </div>
              )}

            </div>

            {/* ASIDE COLUMN: CPR METRONOME & CHAT COMPANION */}
            <aside className="w-full lg:w-96 flex flex-col gap-6 shrink-0 relative">
              
              {/* Paramedic Chat helper with active emergency */}
              <div className="bg-[#111116] border border-white/10 rounded-2xl flex flex-col h-[350px] lg:h-[400px] overflow-hidden relative">
                
                {/* Chat Panel Header */}
                <div className="bg-black/40 px-4 py-3 border-b border-white/10 flex items-center justify-between select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-zinc-300">PARAMEDIC COMMAND LINE</span>
                  </div>

                  {/* Languages toggle trigger */}
                  <div className="flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-[#4DABFF]" />
                    <select
                      value={language}
                      onChange={(e) => {
                        const selectedLang = e.target.value as "en" | "hi" | "mr";
                        setLanguage(selectedLang);
                        setVoiceLanguage(selectedLang); // ← FIX: sync voice guide language too
                        
                        let autoTranslation = "";
                        if (selectedLang === "hi") {
                          autoTranslation = "नमस्ते। मैं आपके साथ हूँ। सरकार और कानून आपकी रक्षा करते हैं। चलिए पीड़ित की सांसें और सुरक्षा की जाँच करते हैं।";
                        } else if (selectedLang === "mr") {
                          autoTranslation = "नमस्कार. काळजी करू नका, न्यायालयाचे पूर्ण संरक्षण आहे. पहिल्यांदा तुमची सुरक्षितता तपासा.";
                        } else {
                          autoTranslation = "I am with you. You are fully protected by law. Let's help together.";
                        }
                        
                        setMessages(prev => [
                          ...prev,
                          {
                            role: "assistant",
                            content: autoTranslation,
                            timestamp: new Date().toLocaleTimeString()
                          }
                        ]);
                      }}
                      className="bg-zinc-800 text-white rounded border border-white/10 text-[10px] outline-none"
                    >
                      <option value="en">EN</option>
                      <option value="hi">हिन्दी</option>
                      <option value="mr">मराठी</option>
                    </select>
                  </div>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-sans text-xs">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col max-w-[85%] ${m.role === 'user' ? "self-end items-end" : "self-start items-start"}`}>
                      <span className="text-[8px] text-zinc-500 mb-0.5 font-mono">
                        {m.role === 'user' ? "BYSTANDER" : "COMMAND"} — {m.timestamp}
                      </span>
                      <div className={`p-2.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user' 
                          ? "bg-[#4DABFF]/20 border border-[#4DABFF]/40 text-white rounded-tr-none" 
                          : "bg-white/10 border border-white/5 text-zinc-200 rounded-tl-none font-sans"
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {isLoadingChat && (
                    <div className="self-start flex flex-col items-start gap-1">
                      <span className="text-[8px] text-zinc-500 font-mono">AI THINKING</span>
                      <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-zinc-400 flex items-center gap-1">
                        <RefreshCw className="w-3 animate-spin" /> Verifying safety codes...
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick actions row */}
                <div className="px-3 py-1.5 bg-black/40 border-t border-white/10 flex flex-wrap gap-1 select-none">
                  <button
                    onClick={() => executeSpecificActionText("safe")}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-[9.5px] px-2 py-0.5 rounded-full text-zinc-300"
                  >
                    ✔️ Safe Scene
                  </button>
                  <button
                    onClick={() => executeSpecificActionText("unconscious")}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-[9.5px] px-2 py-0.5 rounded-full text-zinc-300"
                  >
                    🗣️ Victim Unresponsive
                  </button>
                  <button
                    onClick={() => executeSpecificActionText("called112")}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-[9.5px] px-2 py-0.5 rounded-full text-zinc-300"
                  >
                    📞 Called 112
                  </button>
                  <button
                    onClick={() => executeSpecificActionText("bleeding_checked")}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[9.5px] px-2 py-0.5 rounded-full text-[#FF4D4D]"
                  >
                    🩸 Pressed bleeding
                  </button>
                </div>

                {/* Chat Footer input */}
                <div className="p-3 bg-black/60 border-t border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Describe injury signs or ask legal shield queries..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                    className="flex-1 bg-white/5 text-white placeholder-white/30 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4DABFF]/50"
                  />
                  <button
                    onClick={() => handleChatSubmit()}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold uppercase transition"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Pacemaker Rhythm */}
              <div className="p-4 rounded-2xl border border-white/10 bg-[#111116] select-none">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1 px-1.5">
                    <span className={`w-2 h-2 rounded-full bg-[#FF3B30] ${cprActive ? "animate-[ping_0.57s_infinite]" : ""}`} />
                    Pacemaker Heart Beat CPR (105 BPM)
                  </span>
                  <button
                    onClick={() => setCprActive(!cprActive)}
                    className={`text-[9px] uppercase font-bold font-mono px-2 py-1 rounded transition-colors ${
                      cprActive ? "bg-red-600 text-white" : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300"
                    }`}
                  >
                    {cprActive ? "STOP CPR BEAT" : "START CPR BEATER"}
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400 mb-3 font-sans">
                  Hands centered over victim chest, lock elbows, compress deep in sync with the blinking pulse signal below:
                </p>
                <div 
                  className={`py-3.5 rounded-xl border font-bold font-mono text-center text-xs tracking-wider transition-all duration-75 ${
                    cprFlash 
                      ? "bg-red-500 text-white border-red-500 shadow-[0_0_15px_#ef4444]" 
                      : "bg-white/5 border-white/5 text-zinc-600"
                  }`}
                >
                  {cprFlash ? "🔴 PRESS HARD & FAST" : "RECOIL CHEST"}
                </div>
              </div>

            </aside>
          </main>
        </>
      )}

      {/* FOOTER BAR */}
      <footer className="h-14 sm:h-12 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 bg-black/40 text-[9px] text-zinc-500 tracking-wider uppercase py-2 gap-2 font-mono mt-auto relative z-10 select-none">
        <div className="flex gap-4 sm:gap-6">
          <span>AI Engine: Samaritan-Paramedic v4.1 (Circuit Guard active)</span>
          <span>Immunity: Indian-MVA-2016</span>
        </div>
        <div>Active emergency life support portal — India</div>
      </footer>

      {/* PRINT SUBMISSION AND PDF EXPORT MODAL */}
      {showReportModal && generatedReport && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-[#09090D] border border-[#4DABFF]/40 rounded-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
              id="close-report"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <div className="bg-[#4DABFF]/10 text-[#4DABFF] p-2.5 rounded-xl border border-[#4DABFF]/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white font-display">
                  Good Samaritan Verified Legal Witness Report
                </h3>
                <p className="text-[10px] text-[#4DABFF] font-mono uppercase tracking-wider">
                  STATUTORY IMMUNITY DECLARATION - SEC 134 CLAUSE B
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 mb-4 leading-relaxed font-sans">
              Present this formal document to any clinical staff, emergency ambulance dispatcher, or highway police officer. It establishes your absolute legal protection under supreme court declarations.
            </p>

            {/* Faux printable document details */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs space-y-4 shadow-inner text-zinc-200">
              <div className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-2 text-[9px] text-zinc-500 leading-normal gap-1">
                <span>TIMESTAMP: {generatedReport.incident_time}</span>
                <span>VERIFIED ID: #{Math.floor(100000 + Math.random() * 9000000)}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[9.5px] uppercase text-[#4DABFF] font-bold block mb-0.5">WITNESS NAME</span>
                  <p className="text-white">
                    {redactAnonymously ? "WITNESS IDENTITY WITHHELD (SEC 134 RIGHT)" : reportForm.witness_name}
                  </p>
                </div>
                <div>
                  <span className="text-[9.5px] uppercase text-[#4DABFF] font-bold block mb-0.5">WITNESS CONTACTS</span>
                  <p className="text-white">
                    {redactAnonymously ? "REDACTED UNDER GOOD SAMARITAN DEFENSE" : reportForm.witness_phone}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[9.5px] uppercase text-[#4DABFF] font-bold block mb-0.5">COLLISION GEOLOCATION LOCKED</span>
                <p className="text-white">{generatedReport.location}</p>
              </div>

              <div>
                <span className="text-[9.5px] uppercase text-[#4DABFF] font-bold block mb-0.5">Crash observations summary</span>
                <p className="text-white whitespace-pre-wrap">{generatedReport.witness_summary}</p>
              </div>

              <div>
                <span className="text-[9.5px] uppercase text-[#4DABFF] font-bold block mb-0.5">Actions Performed by Samaritan</span>
                <ul className="list-disc pl-4 space-y-0.5 mt-1 text-white">
                  {generatedReport.actions_taken.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-white/5 pt-2 font-mono">
                <div>
                  <span className="text-[9.5px] uppercase text-zinc-500 block">Identified colliding vehicles:</span>
                  <span className="text-white">{generatedReport.vehicles_involved}</span>
                </div>
                <div>
                  <span className="text-[9.5px] uppercase text-zinc-500 block">Casualty injuries observed:</span>
                  <span className="text-white">{generatedReport.injuries_observed}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>📞 FREE EMERGENCY ALERT DISPATCH ACTIVE:</span>
                <span>{generatedReport.emergency_services_called ? "YES (Dial 112 Logged)" : "YES (Direct Bystander)"}</span>
              </div>

              {/* Core Legal reminder */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] font-sans leading-relaxed text-zinc-300">
                🛡️ <strong className="text-white text-xs">OFFICIAL IMMUNITY ENFORCEMENT CITATION:</strong> {generatedReport.legal_note}
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10.5px] text-zinc-500 italic font-sans">
                Keep a screenshot or digital copy of this statutory export saved.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    generateWitnessPDF({
                      report: generatedReport,
                      witnessName: reportForm.witness_name,
                      witnessPhone: reportForm.witness_phone,
                      vehiclesInvolved: reportForm.vehicles_involved,
                      injuriesObserved: reportForm.injuries_observed,
                      redacted: redactAnonymously,
                      photoCount: photos.length,
                      goldenHourStart: goldenHourStart ? new Date(goldenHourStart).toLocaleTimeString() : undefined,
                    });
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#4DABFF] hover:bg-[#328ae0] text-slate-950 font-mono text-xs font-bold uppercase tracking-wide rounded-lg transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wide rounded-lg transition-colors"
                >
                  Print Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
