import { LanguageCode } from "../types";

export interface Translations {
  appName: string;
  appSubtitle: string;
  demoDataBadge: string;
  // Nav
  navHome: string;
  navFindCare: string;
  navMedicine: string;
  navHealthRecord: string;
  navEmergency: string;
  // Location
  usingCurrentLocation: string;
  locationUnavailable: string;
  chooseLocationManually: string;
  tirunelveliDemoLocation: string;
  gpsActive: string;
  gpsOffline: string;
  // Quick Actions
  findCareTitle: string;
  doctorsTitle: string;
  diagnosticsTitle: string;
  medicinesTitle: string;
  emergencyTitle: string;
  // Services
  xray: string;
  ecg: string;
  bloodTest: string;
  ultrasound: string;
  generalConsult: string;
  pediatrics: string;
  maternity: string;
  pharmacy: string;
  emergency: string;
  // Availability
  available: string;
  limited: string;
  unavailable: string;
  onDuty: string;
  offDuty: string;
  onLeave: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  // Freshness
  verifiedRecent: string;
  needsConfirmation: string;
  outdatedCallFirst: string;
  cachedMayBeOutdated: string;
  updatedAgo: string;
  // Recommendation & Facility Cards
  recommendedBadge: string;
  distance: string;
  callFacility: string;
  offlineNavigation: string;
  mapView: string;
  canvasRadarView: string;
  referralNotice: string;
  // Offline & Sync
  offlineMode: string;
  dataAsOf: string;
  syncing: string;
  synced: string;
  pendingSync: string;
  lastSyncedAgo: string;
  syncNow: string;
  // Search
  searchPlaceholder: string;
  naturalLanguageHint: string;
  extractingRequirement: string;
  // Health records
  newRecord: string;
  visitDate: string;
  facility: string;
  notes: string;
  followUp: string;
  saveRecord: string;
  noRecords: string;
  // Roles
  rolePatient: string;
  roleStaff: string;
  roleAdmin: string;
  staffPortal: string;
  adminPortal: string;
}

const en: Translations = {
  appName: "SmartCare-TN",
  appSubtitle: "Rural Healthcare Access & Referral PWA",
  demoDataBadge: "DEMO DATA",
  navHome: "Home",
  navFindCare: "Find Care",
  navMedicine: "Medicine",
  navHealthRecord: "Health Record",
  navEmergency: "Emergency",
  usingCurrentLocation: "Using Current Location",
  locationUnavailable: "Location unavailable",
  chooseLocationManually: "Choose location manually",
  tirunelveliDemoLocation: "Cheranmahadevi (Demo)",
  gpsActive: "GPS Active",
  gpsOffline: "GPS Fallback",
  findCareTitle: "Find Care",
  doctorsTitle: "Doctors",
  diagnosticsTitle: "Diagnostics",
  medicinesTitle: "Medicines",
  emergencyTitle: "Emergency",
  xray: "X-Ray",
  ecg: "ECG",
  bloodTest: "Blood Test",
  ultrasound: "Ultrasound",
  generalConsult: "General Consultation",
  pediatrics: "Pediatrics",
  maternity: "Maternity",
  pharmacy: "Pharmacy",
  emergency: "Emergency",
  available: "Available",
  limited: "Limited",
  unavailable: "Unavailable",
  onDuty: "On Duty",
  offDuty: "Off Duty",
  onLeave: "On Leave",
  inStock: "In Stock",
  lowStock: "Low Stock",
  outOfStock: "Out of Stock",
  verifiedRecent: "Verified Recent (< 6 hrs)",
  needsConfirmation: "Needs Confirmation (6-24 hrs)",
  outdatedCallFirst: "Outdated — Please call before traveling",
  cachedMayBeOutdated: "Cached — may be outdated",
  updatedAgo: "Updated",
  recommendedBadge: "Recommended Facility",
  distance: "Distance",
  callFacility: "Call Facility",
  offlineNavigation: "Zero-Tile Radar",
  mapView: "Live Map",
  canvasRadarView: "Offline Compass / Radar",
  referralNotice: "Referral pathway: The closest facility may not have your needed service. Travel directly to the recommended facility to avoid delays.",
  offlineMode: "OFFLINE MODE",
  dataAsOf: "Data as of:",
  syncing: "Syncing...",
  synced: "Synced",
  pendingSync: "Pending Sync",
  lastSyncedAgo: "Last synced",
  syncNow: "Sync Now",
  searchPlaceholder: "Search facility or type need (e.g. My child needs a blood test)...",
  naturalLanguageHint: "Try typing: 'Child has fracture needs X-Ray' or 'Mother delivery care'",
  extractingRequirement: "Analyzing healthcare requirement...",
  newRecord: "Add Visit Record",
  visitDate: "Visit Date",
  facility: "Public Facility",
  notes: "Clinical / Treatment Notes",
  followUp: "Follow-up Date",
  saveRecord: "Save to Local Record",
  noRecords: "No patient visits recorded yet. Tap '+ Add Visit Record' to save offline.",
  rolePatient: "Patient View",
  roleStaff: "Staff Portal",
  roleAdmin: "District Admin",
  staffPortal: "Facility Staff Availability Dashboard",
  adminPortal: "District Health Administration Console"
};

const ta: Translations = {
  appName: "ஸ்மார்ட்கேர்-TN",
  appSubtitle: "கிராமப்புற சுகாதார அணுகல் மற்றும் பரிந்துரை PWA",
  demoDataBadge: "மாதிரி தரவு (DEMO)",
  navHome: "முகப்பு",
  navFindCare: "சிகிச்சை தேடல்",
  navMedicine: "மருந்து இருப்பு",
  navHealthRecord: "மருத்துவ ஏடு",
  navEmergency: "அவசர உதவி",
  usingCurrentLocation: "தற்போதைய இருப்பிடம்",
  locationUnavailable: "இருப்பிடம் கிடைக்கவில்லை",
  chooseLocationManually: "இருப்பிடத்தை தேர்ந்தெடுக்கவும்",
  tirunelveliDemoLocation: "சேரன்மகாதேவி (மாதிரி)",
  gpsActive: "GPS செயல்படுகிறது",
  gpsOffline: "GPS மாற்று வழி",
  findCareTitle: "சிகிச்சை தேடுக",
  doctorsTitle: "மருத்துவர்கள்",
  diagnosticsTitle: "பரிசோதனைகள்",
  medicinesTitle: "மருந்துகள்",
  emergencyTitle: "அவசர உதவி",
  xray: "எக்ஸ்-ரே (X-Ray)",
  ecg: "ஈசிஜி (ECG)",
  bloodTest: "இரத்தப் பரிசோதனை",
  ultrasound: "அல்ட்ராசவுண்ட் ஸ்கேன்",
  generalConsult: "பொது மருத்துவம்",
  pediatrics: "குழந்தைகள் நல மருத்துவம்",
  maternity: "மகப்பேறு மருத்துவம்",
  pharmacy: "மருந்தகம்",
  emergency: "அவசர சிகிச்சை",
  available: "கிடைக்கிறது",
  limited: "வரம்பிற்குட்பட்டது",
  unavailable: "தற்போது இல்லை",
  onDuty: "பணியில் உள்ளார்",
  offDuty: "பணியில் இல்லை",
  onLeave: "விடுப்பில்",
  inStock: "இருப்பு உள்ளது",
  lowStock: "குறைந்த இருப்பு",
  outOfStock: "இருப்பு இல்லை",
  verifiedRecent: "சமீபத்தில் சரிபார்க்கப்பட்டது (< 6 மணி)",
  needsConfirmation: "உறுதிப்படுத்தல் தேவை (6-24 மணி)",
  outdatedCallFirst: "பழைய தகவல் — புறப்படும் முன் அழைக்கவும்",
  cachedMayBeOutdated: "சேமிக்கப்பட்ட தகவல்",
  updatedAgo: "புதுப்பிக்கப்பட்டது",
  recommendedBadge: "பரிந்துரைக்கப்பட்ட மருத்துவமனை",
  distance: "தொலைவு",
  callFacility: "அழைக்கவும்",
  offlineNavigation: "இணையமில்லா திசைக்காட்டி",
  mapView: "வரைபடம்",
  canvasRadarView: "ஆஃப்லைன் வழிகாட்டி",
  referralNotice: "பரிந்துரை குறிப்பு: அருகிலுள்ள மையத்தில் தேவையான வசதி இல்லாதிருக்கலாம். அலைச்சலைத் தவிர்க்க பரிந்துரைக்கப்பட்ட மருத்துவமனைக்குச் செல்லவும்.",
  offlineMode: "ஆஃப்லைன் முறை",
  dataAsOf: "தரவு நேரம்:",
  syncing: "ஒத்திசைக்கிறது...",
  synced: "ஒத்திசைக்கப்பட்டது",
  pendingSync: "காத்திருப்பு ஒத்திசைவு",
  lastSyncedAgo: "கடைசி ஒத்திசைவு",
  syncNow: "இப்போது ஒத்திசை",
  searchPlaceholder: "தேவையை உள்ளிடவும் (எ.கா: குழந்தைக்கு இரத்த பரிசோதனை)...",
  naturalLanguageHint: "எடுத்துக்காட்டு: 'குழந்தைக்கு எலும்பு முறிவு எக்ஸ்-ரே தேவை'",
  extractingRequirement: "மருத்துவத் தேவையை பகுப்பாய்வு செய்கிறது...",
  newRecord: "புதிய வருகை பதிவு செய்",
  visitDate: "பார்வையிட்ட தேதி",
  facility: "மருத்துவமனை பெயர்",
  notes: "மருத்துவக் குறிப்புகள்",
  followUp: "அடுத்த சந்திப்பு தேதி",
  saveRecord: "பதிவை சேமிக்கவும்",
  noRecords: "மருத்துவப் பதிவுகள் ஏதும் இல்லை. புதிய பதிவைச் சேர்க்கவும்.",
  rolePatient: "பொதுமக்கள் பார்வை",
  roleStaff: "ஊழியர் தளம்",
  roleAdmin: "மாவட்ட நிர்வாகம்",
  staffPortal: "சுகாதார ஊழியர் வசதிகள் பதிவு மையம்",
  adminPortal: "மாவட்ட சுகாதார கண்காணிப்பு நிர்வாகம்"
};

const hi: Translations = {
  appName: "स्मार्टकेयर-TN",
  appSubtitle: "ग्रामीण स्वास्थ्य सेवा पहुंच और रेफरल PWA",
  demoDataBadge: "डेमो डेटा (DEMO)",
  navHome: "होम",
  navFindCare: "उपचार खोजें",
  navMedicine: "दवाएं",
  navHealthRecord: "स्वास्थ्य रिकॉर्ड",
  navEmergency: "आपातकाल",
  usingCurrentLocation: "वर्तमान स्थान उपयोग में",
  locationUnavailable: "स्थान उपलब्ध नहीं है",
  chooseLocationManually: "स्थान मैन्युअल रूप से चुनें",
  tirunelveliDemoLocation: "चेरनमहादेवी (डेमो)",
  gpsActive: "GPS सक्रिय",
  gpsOffline: "GPS वैकल्पिक",
  findCareTitle: "सेवा खोजें",
  doctorsTitle: "डॉक्टर",
  diagnosticsTitle: "जांच / टेस्ट",
  medicinesTitle: "दवाएं",
  emergencyTitle: "आपातकालीन",
  xray: "एक्स-रे (X-Ray)",
  ecg: "ईसीजी (ECG)",
  bloodTest: "रक्त परीक्षण",
  ultrasound: "अल्ट्रासाउंड",
  generalConsult: "सामान्य परामर्श",
  pediatrics: "बाल चिकित्सा",
  maternity: "मातृत्व / प्रसव",
  pharmacy: "दवाखाना",
  emergency: "आपातकालीन सेवा",
  available: "उपलब्ध",
  limited: "सीमित",
  unavailable: "अनुपलब्ध",
  onDuty: "ड्यूटी पर",
  offDuty: "ड्यूटी पर नहीं",
  onLeave: "छुट्टी पर",
  inStock: "उपलब्ध है",
  lowStock: "कम स्टॉक",
  outOfStock: "स्टॉक समाप्त",
  verifiedRecent: "हाल ही में सत्यापित (< 6 घंटे)",
  needsConfirmation: "पुष्टि आवश्यक (6-24 घंटे)",
  outdatedCallFirst: "पुरानी जानकारी — यात्रा से पहले कॉल करें",
  cachedMayBeOutdated: "कैश्ड जानकारी",
  updatedAgo: "अपडेट किया गया",
  recommendedBadge: "अनुशंसित अस्पताल",
  distance: "दूरी",
  callFacility: "कॉल करें",
  offlineNavigation: "ऑफलाइन राडार / दिशा",
  mapView: "लाइव मैप",
  canvasRadarView: "ऑफलाइन कंपास / राडार",
  referralNotice: "रेफरल सलाह: निकटतम केंद्र में आपकी आवश्यक सुविधा उपलब्ध नहीं हो सकती। सीधे अनुशंसित अस्पताल जाएं।",
  offlineMode: "ऑफलाइन मोड",
  dataAsOf: "डेटा समय:",
  syncing: "सिंक हो रहा है...",
  synced: "सिंक पूरा",
  pendingSync: "सिंक लंबित",
  lastSyncedAgo: "अंतिम सिंक",
  syncNow: "अभी सिंक करें",
  searchPlaceholder: "आवश्यकता लिखें (उदा: बच्चे के लिए ब्लड टेस्ट)...",
  naturalLanguageHint: "लिखें: 'फ्रैक्चर के लिए एक्स-रे की आवश्यकता है'",
  extractingRequirement: "आवश्यकता का विश्लेषण...",
  newRecord: "नया रिकॉर्ड जोड़ें",
  visitDate: "भ्रमण तिथि",
  facility: "अस्पताल का नाम",
  notes: "उपचार विवरण",
  followUp: "अनुवर्ती तिथि",
  saveRecord: "रिकॉर्ड सहेजें",
  noRecords: "कोई स्वास्थ्य रिकॉर्ड नहीं मिला।",
  rolePatient: "मरीज दृश्य",
  roleStaff: "कर्मचारी पोर्टल",
  roleAdmin: "जिला प्रशासन",
  staffPortal: "अस्पताल कर्मचारी उपलब्धता पोर्टल",
  adminPortal: "जिला स्वास्थ्य प्रशासनिक कंसोल"
};

const dictionaries: Record<LanguageCode, Translations> = { en, ta, hi };

export function getTranslations(lang: LanguageCode = "en"): Translations {
  return dictionaries[lang] || dictionaries.en;
}

export const getTranslation = getTranslations;

export function getStoredLanguage(): LanguageCode {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("smartcare_lang");
    if (saved === "ta" || saved === "hi" || saved === "en") {
      return saved;
    }
  }
  return "en";
}

export function setStoredLanguage(lang: LanguageCode): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("smartcare_lang", lang);
  }
}
