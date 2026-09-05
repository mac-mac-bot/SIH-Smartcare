import { LanguageCode } from "../types";

export interface MobileTranslations {
  appName: string;
  appSubtitle: string;
  demoDataNotice: string;
  // Tabs
  tabHome: string;
  tabFindCare: string;
  tabMedicine: string;
  tabHealthRecord: string;
  tabEmergency: string;
  tabSettings: string;
  // Location
  usingCurrentGps: string;
  gpsActive: string;
  usingDemoLocation: string;
  demoLocationDesc: string;
  requestGpsBtn: string;
  resetDemoBtn: string;
  locationPermissionDenied: string;
  // Home Quick Actions
  findCareTitle: string;
  findCareSubtitle: string;
  emergencySosTitle: string;
  emergencySosSubtitle: string;
  nearbyFacilities: string;
  viewAll: string;
  recentHealthTip: string;
  // Find Care Screen
  searchPlaceholder: string;
  searchBtn: string;
  quickServices: string;
  resultsTitle: string;
  topRecommendation: string;
  nearestVsRecommended: string;
  whyRecommended: string;
  noMatchingFacilities: string;
  // Facility Card & Details
  distanceKm: string;
  tier: string;
  servicesOffered: string;
  diagnosticsTitle: string;
  doctorsOnDuty: string;
  medicinesStockTitle: string;
  callHospital: string;
  navigateHospital: string;
  verifiedRecent: string;
  needsConfirmation: string;
  outdatedCallFirst: string;
  lastVerified: string;
  updatedAgo: string;
  // Service status labels
  available: string;
  limited: string;
  unavailable: string;
  onDuty: string;
  offDuty: string;
  inStock: string;
  lowStock: string;
  outOfStock: string;
  // Medicine Screen
  medicineSearchPlaceholder: string;
  allCategories: string;
  availableAtFacilities: string;
  alternativesTitle: string;
  stockUnits: string;
  // Health Record Screen
  myHealthRecordTitle: string;
  healthRecordSubtitle: string;
  addRecordBtn: string;
  syncedBadge: string;
  pendingSyncBadge: string;
  patientProfile: string;
  allergies: string;
  chronicConditions: string;
  bloodGroup: string;
  visitHistory: string;
  noRecordsYet: string;
  serviceReceived: string;
  prescribedMeds: string;
  clinicalNotes: string;
  followUp: string;
  saveRecord: string;
  cancel: string;
  // Emergency Screen
  emergencyBanner: string;
  callImmediately: string;
  sendGpsSms: string;
  smsPreviewTitle: string;
  copyGps: string;
  // Sync
  syncStatusOnline: string;
  syncStatusOffline: string;
  syncingNow: string;
  lastSynced: string;
  syncNowBtn: string;
  microDeltaBytes: string;
  // Settings
  selectLanguage: string;
  apiConfigTitle: string;
  apiEndpointDesc: string;
  aboutSmartCare: string;
  aboutDesc: string;
}

export const TRANSLATIONS: Record<LanguageCode, MobileTranslations> = {
  en: {
    appName: "SmartCare-TN",
    appSubtitle: "Rural Healthcare Access & Navigation",
    demoDataNotice: "Official Public Facility Demo Data (Tirunelveli & Tenkasi)",
    tabHome: "Home",
    tabFindCare: "Find Care",
    tabMedicine: "Medicine",
    tabHealthRecord: "Health Record",
    tabEmergency: "Emergency",
    tabSettings: "Settings",
    usingCurrentGps: "Using Device GPS",
    gpsActive: "GPS Active",
    usingDemoLocation: "Cheranmahadevi (Demo)",
    demoLocationDesc: "Near Cheranmahadevi PHC (8.6800° N, 77.5550° E)",
    requestGpsBtn: "Get Live GPS",
    resetDemoBtn: "Reset Demo Location",
    locationPermissionDenied: "Location permission denied. Using demo coordinates.",
    findCareTitle: "Find Healthcare Now",
    findCareSubtitle: "Enter symptom, scan, or service to find ready facilities",
    emergencySosTitle: "Emergency SOS",
    emergencySosSubtitle: "108 Ambulance, Police & Quick SMS SOS",
    nearbyFacilities: "Nearby Healthcare Facilities",
    viewAll: "View All",
    recentHealthTip: "Monsoon Health Advisory: Dengue and fever testing clinics active across all PHCs and Taluk hospitals.",
    searchPlaceholder: "e.g., I need an X-Ray, child fever, blood test...",
    searchBtn: "Search",
    quickServices: "Common Services",
    resultsTitle: "Recommended Public Facilities",
    topRecommendation: "TOP RECOMMENDED FACILITY",
    nearestVsRecommended: "The nearest hospital is not always the right hospital.",
    whyRecommended: "Why recommended:",
    noMatchingFacilities: "No facilities found matching your requirement.",
    distanceKm: "km away",
    tier: "Tier",
    servicesOffered: "Public Healthcare Services",
    diagnosticsTitle: "Diagnostic Machines & Scans",
    doctorsOnDuty: "Doctors on Duty",
    medicinesStockTitle: "Essential Medicines Stock",
    callHospital: "Call Facility",
    navigateHospital: "Navigate (Maps)",
    verifiedRecent: "Verified Recent",
    needsConfirmation: "Needs Confirmation",
    outdatedCallFirst: "Outdated — Call First",
    lastVerified: "Last verified",
    updatedAgo: "ago",
    available: "AVAILABLE",
    limited: "LIMITED",
    unavailable: "UNAVAILABLE",
    onDuty: "ON DUTY",
    offDuty: "OFF DUTY",
    inStock: "IN STOCK",
    lowStock: "LOW STOCK",
    outOfStock: "OUT OF STOCK",
    medicineSearchPlaceholder: "Search medicine name or generic (e.g. Paracetamol, Insulin)...",
    allCategories: "All Medicines",
    availableAtFacilities: "Available at Government Facilities",
    alternativesTitle: "Alternative Facilities with Stock",
    stockUnits: "units in stock",
    myHealthRecordTitle: "My Health Record (Offline)",
    healthRecordSubtitle: "Safe, on-device health notebook. Synchronizes when connected.",
    addRecordBtn: "+ Add Visit Record",
    syncedBadge: "Synced",
    pendingSyncBadge: "Saved Offline",
    patientProfile: "Patient Information",
    allergies: "Known Allergies",
    chronicConditions: "Existing Conditions",
    bloodGroup: "Blood Group",
    visitHistory: "Consultation & Visit History",
    noRecordsYet: "No visit records saved yet. Tap '+ Add Visit Record' to log a consultation.",
    serviceReceived: "Service / Treatment",
    prescribedMeds: "Medicines Prescribed",
    clinicalNotes: "Doctor's Advice & Clinical Notes",
    followUp: "Follow-up Date",
    saveRecord: "Save Record",
    cancel: "Cancel",
    emergencyBanner: "Immediate Government Emergency Services",
    callImmediately: "Tap to Call Instantly",
    sendGpsSms: "Send Emergency SMS with Coordinates",
    smsPreviewTitle: "Pre-filled Emergency SOS Message",
    copyGps: "Copy GPS Info",
    syncStatusOnline: "Online & Synced",
    syncStatusOffline: "Offline Mode Active",
    syncingNow: "Synchronizing Micro-Delta...",
    lastSynced: "Last synced",
    syncNowBtn: "Sync Now",
    microDeltaBytes: "Micro-delta sync transfers only updated patches (~1-3 KB).",
    selectLanguage: "Language / மொழி / भाषा",
    apiConfigTitle: "Backend API Endpoint",
    apiEndpointDesc: "Configure LAN IP for physical phone testing in Expo Go",
    aboutSmartCare: "About SmartCare Tamil Nadu",
    aboutDesc: "Designed for rural citizens in Tamil Nadu to eliminate wasted travel and find operational public healthcare services immediately.",
  },
  ta: {
    appName: "ஸ்மார்ட்கேர் - தமிழ்நாடு",
    appSubtitle: "கிராமப்புற சுகாதார அணுகல் மற்றும் வழிகாட்டல்",
    demoDataNotice: "அரசு மருத்துவமனை மாதிரி தகவல் (திருநெல்வேலி & தென்காசி)",
    tabHome: "முகப்பு",
    tabFindCare: "சிகிச்சை தேடு",
    tabMedicine: "மருந்துகள்",
    tabHealthRecord: "மருத்துவ ஏடு",
    tabEmergency: "அவசரம்",
    tabSettings: "அமைப்புகள்",
    usingCurrentGps: "நேரலை GPS இருப்பிடம்",
    gpsActive: "GPS செயல்படுகிறது",
    usingDemoLocation: "சேரன்மகாதேவி (மாதிரி)",
    demoLocationDesc: "சேரன்மகாதேவி ஆரம்ப சுகாதார நிலையம் அருகில் (8.6800° N, 77.5550° E)",
    requestGpsBtn: "நேரலை GPS பெறுக",
    resetDemoBtn: "மாதிரி இருப்பிடத்திற்கு திரும்பு",
    locationPermissionDenied: "இருப்பிட அனுமதி கிடைக்கவில்லை. மாதிரி இருப்பிடம் பயன்படுத்தப்படுகிறது.",
    findCareTitle: "சுகாதார சேவையைத் தேடு",
    findCareSubtitle: "அறிகுறி அல்லது தேவைப்படும் சோதனையை உள்ளிடவும்",
    emergencySosTitle: "அவசர உதவி (SOS)",
    emergencySosSubtitle: "108 ஆம்புலன்ஸ், காவல் மற்றும் SMS SOS",
    nearbyFacilities: "அருகிலுள்ள அரசு மருத்துவமனைகள்",
    viewAll: "அனைத்தும் காண்க",
    recentHealthTip: "மழைக்கால முன்னெச்சரிக்கை: அனைத்து ஆரம்ப சுகாதார நிலையங்களிலும் காய்ச்சல் பரிசோதனை முகாம்கள் செயல்படுகின்றன.",
    searchPlaceholder: "எ.கா: எனக்கு எக்ஸ்-ரே வேண்டும், குழந்தை காய்ச்சல்...",
    searchBtn: "தேடு",
    quickServices: "முக்கிய சேவைகள்",
    resultsTitle: "பரிந்துரைக்கப்பட்ட அரசு மருத்துவமனைகள்",
    topRecommendation: "முதன்மைப் பரிந்துரை",
    nearestVsRecommended: "அருகிலுள்ள மருத்துவமனை எப்போதும் சரியான மருத்துவமனை அல்ல.",
    whyRecommended: "பரிந்துரைக்கான காரணம்:",
    noMatchingFacilities: "உங்கள் தேவைக்கேற்ற மருத்துவமனை தகவல்கள் கிடைக்கவில்லை.",
    distanceKm: "கி.மீ தூரத்தில்",
    tier: "நிலை",
    servicesOffered: "வழங்கப்படும் மருத்துவ சேவைகள்",
    diagnosticsTitle: "பரிசோதனை கருவிகள் மற்றும் ஸ்கேன்",
    doctorsOnDuty: "பணியில் உள்ள மருத்துவர்கள்",
    medicinesStockTitle: "அத்தியாவசிய மருந்துகள் இருப்பு",
    callHospital: "மருத்துவமனையை அழைக்கவும்",
    navigateHospital: "வழிசெலுத்து (வரைபடம்)",
    verifiedRecent: "சமீபத்தில் சரிபார்க்கப்பட்டது",
    needsConfirmation: "உறுதிப்படுத்த வேண்டும்",
    outdatedCallFirst: "பழைய தகவல் — கிளம்பும் முன் அழைக்கவும்",
    lastVerified: "கடைசியாக புதுப்பிக்கப்பட்டது",
    updatedAgo: "முன்பு",
    available: "கிடைக்கிறது",
    limited: "வரம்பிற்குட்பட்டது",
    unavailable: "இல்லை",
    onDuty: "பணியில் உள்ளார்",
    offDuty: "பணியில் இல்லை",
    inStock: "இருப்பில் உள்ளது",
    lowStock: "குறைந்த இருப்பு",
    outOfStock: "இருப்பு இல்லை",
    medicineSearchPlaceholder: "மருந்தின் பெயர் அல்லது வகையைத் தேடவும் (எ.கா. பாராசிட்டமால்)...",
    allCategories: "அனைத்து மருந்துகள்",
    availableAtFacilities: "மருந்துகள் கிடைக்கும் அரசு மையங்கள்",
    alternativesTitle: "மருந்து இருப்புள்ள மாற்று மருத்துவமனைகள்",
    stockUnits: "அளவுகள் இருப்பில் உள்ளன",
    myHealthRecordTitle: "எனது மருத்துவ ஏடு (ஆஃப்லைன்)",
    healthRecordSubtitle: "இணையம் இல்லாதபோதும் பயன்படுத்தக்கூடிய பாதுகாப்பான சுகாதார பதிவு.",
    addRecordBtn: "+ மருத்துவ பதிவைச் சேர்",
    syncedBadge: "ஒத்திசைக்கப்பட்டது",
    pendingSyncBadge: "ஆஃப்லைனில் சேமிக்கப்பட்டது",
    patientProfile: "நோயாளி விவரம்",
    allergies: "ஒவ்வாமைகள் (Allergies)",
    chronicConditions: "நாள்பட்ட நோய்கள்",
    bloodGroup: "இரத்த வகை",
    visitHistory: "முந்தைய சிகிச்சை விவரங்கள்",
    noRecordsYet: "மருத்துவ பதிவுகள் எதுவும் இல்லை. புதிய பதிவைச் சேர்க்க '+ மருத்துவ பதிவைச் சேர்' அழுத்தவும்.",
    serviceReceived: "பெற்ற சிகிச்சை / சேவை",
    prescribedMeds: "பரிந்துரைக்கப்பட்ட மருந்துகள்",
    clinicalNotes: "மருத்துவர் ஆலோசனைக் குறிப்பு",
    followUp: "அடுத்த பரிசோதனை நாள்",
    saveRecord: "பதிவை சேமிக்க",
    cancel: "ரத்து செய்",
    emergencyBanner: "உடனடி அரசு அவசர சேவைகள்",
    callImmediately: "உடனே அழைக்க தொடவும்",
    sendGpsSms: "இருப்பிடத்துடன் கூடிய அவசர SMS அனுப்பவும்",
    smsPreviewTitle: "தயாரான அவசர செய்தி",
    copyGps: "GPS தகவலை நகலெடு",
    syncStatusOnline: "இணைப்பில் உள்ளது",
    syncStatusOffline: "ஆஃப்லைன் முறை செயலில் உள்ளது",
    syncingNow: "மைக்ரோ-டெல்டா ஒத்திசைவு நடக்கிறது...",
    lastSynced: "கடைசியாக ஒத்திசைக்கப்பட்டது",
    syncNowBtn: "இப்போது ஒத்திசை",
    microDeltaBytes: "மைக்ரோ-டெல்டா முறையில் மாற்றங்கள் மட்டுமே பதிவிறக்கப்படுகின்றன (~1-3 KB).",
    selectLanguage: "மொழி / Language / भाषा",
    apiConfigTitle: "பின்புல API முகவரி",
    apiEndpointDesc: "Expo Go மூலம் கைபேசியில் சோதிக்க கணினியின் LAN IP முகவரியை அமைக்கவும்",
    aboutSmartCare: "ஸ்மார்ட்கேர் பற்றி",
    aboutDesc: "கிராமப்புற மக்கள் வீண் அலைச்சலைத் தவிர்த்து, தங்களுக்குத் தேவையான மருத்துவ சேவை கிடைக்கும் இடத்தை உடனடியாகக் கண்டறிய உதவும் செயலி.",
  },
  hi: {
    appName: "स्मार्टकेयर - तमिलनाडु",
    appSubtitle: "ग्रामीण स्वास्थ्य सेवा पहुँच और नेविगेशन",
    demoDataNotice: "सरकारी अस्पताल डेमो डेटा (तिरुनेलवेली और तेनकाशी)",
    tabHome: "होम",
    tabFindCare: "सेवा खोजें",
    tabMedicine: "दवाइयाँ",
    tabHealthRecord: "स्वास्थ्य रिकॉर्ड",
    tabEmergency: "आपातकालीन",
    tabSettings: "सेटिंग्स",
    usingCurrentGps: "लाइव जीपीएस स्थान",
    gpsActive: "जीपीएस सक्रिय",
    usingDemoLocation: "चेरनमहादेवी (डेमो)",
    demoLocationDesc: "चेरनमहादेवी प्राथमिक स्वास्थ्य केंद्र के पास",
    requestGpsBtn: "लाइव जीपीएस प्राप्त करें",
    resetDemoBtn: "डेमो स्थान पर रीसेट करें",
    locationPermissionDenied: "स्थान अनुमति अस्वीकृत। डेमो स्थान प्रयुक्त।",
    findCareTitle: "स्वास्थ्य सेवा खोजें",
    findCareSubtitle: "लक्षण, स्कैन या सेवा दर्ज करें और तैयार अस्पताल पाएं",
    emergencySosTitle: "आपातकालीन एसओएस",
    emergencySosSubtitle: "108 एम्बुलेंस, पुलिस और त्वरित एसएमएस",
    nearbyFacilities: "निकटवर्ती सरकारी स्वास्थ्य केंद्र",
    viewAll: "सभी देखें",
    recentHealthTip: "स्वास्थ्य सूचना: बुखार और डेंगू जांच सभी प्राथमिक स्वास्थ्य केंद्रों पर उपलब्ध है।",
    searchPlaceholder: "उदा: मुझे एक्स-रे की आवश्यकता है, बच्चे को बुखार...",
    searchBtn: "खोजें",
    quickServices: "प्रमुख सेवाएँ",
    resultsTitle: "अनुशंसित सरकारी अस्पताल",
    topRecommendation: "शीर्ष अनुशंसित अस्पताल",
    nearestVsRecommended: "निकटतम अस्पताल हमेशा सही अस्पताल नहीं होता है।",
    whyRecommended: "अनुशंसा का कारण:",
    noMatchingFacilities: "आपकी आवश्यकता के अनुसार कोई अस्पताल नहीं मिला।",
    distanceKm: "किमी दूर",
    tier: "श्रेणी",
    servicesOffered: "उपलब्ध स्वास्थ्य सेवाएं",
    diagnosticsTitle: "जांच मशीनें और स्कैन",
    doctorsOnDuty: "ड्यूटी पर डॉक्टर",
    medicinesStockTitle: "आवश्यक दवाइयों का स्टॉक",
    callHospital: "अस्पताल को कॉल करें",
    navigateHospital: "नेविगेट करें (मानचित्र)",
    verifiedRecent: "हाल ही में सत्यापित",
    needsConfirmation: "पुष्टि आवश्यक",
    outdatedCallFirst: "पुरानी जानकारी — जाने से पहले कॉल करें",
    lastVerified: "अंतिम सत्यापन",
    updatedAgo: "पहले",
    available: "उपलब्ध",
    limited: "सीमित",
    unavailable: "अनुपलब्ध",
    onDuty: "ड्यूटी पर",
    offDuty: "ड्यूटी समाप्त",
    inStock: "स्टॉक में है",
    lowStock: "कम स्टॉक",
    outOfStock: "स्टॉक समाप्त",
    medicineSearchPlaceholder: "दवा का नाम खोजें (उदा. पैरासिटामोल, इंसुलिन)...",
    allCategories: "सभी दवाइयाँ",
    availableAtFacilities: "सरकारी अस्पतालों में उपलब्धता",
    alternativesTitle: "स्टॉक वाले वैकल्पिक अस्पताल",
    stockUnits: "यूनिट स्टॉक में",
    myHealthRecordTitle: "मेरा स्वास्थ्य रिकॉर्ड (ऑफलाइन)",
    healthRecordSubtitle: "सुरक्षित ऑफलाइन स्वास्थ्य पुस्तिका। इंटरनेट मिलने पर सिंक होती है।",
    addRecordBtn: "+ नया रिकॉर्ड जोड़ें",
    syncedBadge: "सिंक किया गया",
    pendingSyncBadge: "ऑफलाइन सहेजा गया",
    patientProfile: "रोगी विवरण",
    allergies: "एलर्जी",
    chronicConditions: "मौजूदा बीमारियां",
    bloodGroup: "रक्त समूह",
    visitHistory: "परामर्श इतिहास",
    noRecordsYet: "कोई रिकॉर्ड नहीं मिला। नया रिकॉर्ड जोड़ने के लिए ऊपर टैप करें।",
    serviceReceived: "प्राप्त सेवा / उपचार",
    prescribedMeds: "दी गई दवाइयाँ",
    clinicalNotes: "डॉक्टर की सलाह",
    followUp: "अगली तारीख",
    saveRecord: "रिकॉर्ड सहेजें",
    cancel: "रद्द करें",
    emergencyBanner: "सरकारी आपातकालीन सेवाएँ",
    callImmediately: "तुरंत कॉल करने के लिए टैप करें",
    sendGpsSms: "जीपीएस निर्देशांक के साथ आपातकालीन एसएमएस भेजें",
    smsPreviewTitle: "आपातकालीन संदेश",
    copyGps: "जीपीएस कॉपी करें",
    syncStatusOnline: "ऑनलाइन और सिंक",
    syncStatusOffline: "ऑफलाइन मोड सक्रिय",
    syncingNow: "माइक्रो-डेल्टा सिंक हो रहा है...",
    lastSynced: "अंतिम सिंक",
    syncNowBtn: "अभी सिंक करें",
    microDeltaBytes: "माइक्रो-डेल्टा सिंक केवल अपडेट किए गए रिकॉर्ड ट्रांसफर करता है (~1-3 KB)।",
    selectLanguage: "भाषा / Language / மொழி",
    apiConfigTitle: "बैकएंड एपीआई",
    apiEndpointDesc: "Expo Go में परीक्षण के लिए अपने कंप्यूटर का LAN IP दर्ज करें",
    aboutSmartCare: "स्मार्टकेयर के बारे में",
    aboutDesc: "ग्रामीण नागरिकों के लिए समय और यात्रा बचाने वाला स्मार्ट स्वास्थ्य नेविगेशन ऐप।",
  },
};
