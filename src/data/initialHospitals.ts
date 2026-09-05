import { Facility } from "../types";

export const INITIAL_HOSPITALS: Facility[] = [
  {
    id: "hosp-1",
    name: "Tirunelveli Medical College Hospital (TVMCH)",
    tamilName: "திருநெல்வேலி மருத்துவக் கல்லூரி மருத்துவமனை",
    type: "District / Tertiary Medical College",
    tier: "Tertiary",
    district: "Tirunelveli",
    taluk: "Palayamkottai",
    address: "High Ground, Palayamkottai, Tirunelveli - 627011",
    latitude: 8.7139,
    longitude: 77.7567,
    phone: "0462-2572733",
    emergencyPhone: "0462-2572734",
    isDemo: true,
    last_updated: "2026-09-05T10:20:00Z",
    updated_by: "Dr. S. Ramanathan, CMO",
    services: {
      "General Consultation": "AVAILABLE",
      Pediatrics: "AVAILABLE",
      Maternity: "AVAILABLE",
      "X-Ray": "AVAILABLE",
      ECG: "AVAILABLE",
      "Blood Test": "AVAILABLE",
      Ultrasound: "AVAILABLE",
      Pharmacy: "AVAILABLE",
      Emergency: "AVAILABLE"
    },
    doctors: [
      { id: "doc-101", name: "Dr. Sundaram M.D. (Medicine)", specialty: "General Medicine", status: "ON_DUTY", room: "Room 102", timing: "08:00 - 16:00" },
      { id: "doc-102", name: "Dr. V. Meenakshi M.S. (OBG)", specialty: "Maternity", status: "ON_DUTY", room: "Labour Ward 3", timing: "24 Hours Shift" },
      { id: "doc-103", name: "Dr. R. Karthik M.D. (Radiology)", specialty: "Radiology", status: "ON_DUTY", room: "X-Ray Dept, Block B", timing: "08:00 - 20:00" },
      { id: "doc-104", name: "Dr. N. Selvi D.C.H.", specialty: "Pediatrics", status: "ON_DUTY", room: "Pediatric Ward 1", timing: "09:00 - 17:00" }
    ],
    diagnostics: {
      "X-Ray": { status: "AVAILABLE", timing: "24x7 Emergency / 08:00-17:00 Routine", notes: "Digital X-Ray Unit 1 & 2 fully operational" },
      ECG: { status: "AVAILABLE", timing: "24 Hours", notes: "12-lead ECG available in triage and OPD" },
      "Blood Test": { status: "AVAILABLE", timing: "24 Hours", notes: "Automated Hematology analyzer functional" },
      Ultrasound: { status: "AVAILABLE", timing: "09:00 - 16:00", notes: "Obstetric & abdominal USG available" }
    },
    medicines: [
      { id: "med-1", name: "Paracetamol 500mg", generic: "Paracetamol", status: "IN_STOCK", stock: 4200, category: "Analgesic" },
      { id: "med-2", name: "Amoxicillin 500mg", generic: "Amoxicillin", status: "IN_STOCK", stock: 1850, category: "Antibiotic" },
      { id: "med-3", name: "Insulin Regular 40IU", generic: "Human Regular Insulin", status: "IN_STOCK", stock: 420, category: "Antidiabetic" },
      { id: "med-4", name: "ORS Powder", generic: "Oral Rehydration Salts", status: "IN_STOCK", stock: 2100, category: "Hydration" },
      { id: "med-5", name: "Cetirizine 10mg", generic: "Cetirizine", status: "IN_STOCK", stock: 1300, category: "Antihistamine" },
      { id: "med-6", name: "Metformin 500mg", generic: "Metformin", status: "IN_STOCK", stock: 3100, category: "Antidiabetic" },
      { id: "med-7", name: "Amlodipine 5mg", generic: "Amlodipine", status: "IN_STOCK", stock: 2400, category: "Cardiovascular" }
    ]
  },
  {
    id: "hosp-2",
    name: "Primary Health Centre, Cheranmahadevi",
    tamilName: "ஆரம்ப சுகாதார நிலையம், சேரன்மகாதேவி",
    type: "Primary Health Centre (PHC)",
    tier: "Primary",
    district: "Tirunelveli",
    taluk: "Cheranmahadevi",
    address: "Hospital Road, Cheranmahadevi - 627414",
    latitude: 8.6811,
    longitude: 77.5606,
    phone: "04634-260222",
    emergencyPhone: "04634-260222",
    isDemo: true,
    last_updated: "2026-09-05T08:55:00Z",
    updated_by: "Staff Nurse Priya V.",
    services: {
      "General Consultation": "AVAILABLE",
      Pediatrics: "AVAILABLE",
      Maternity: "LIMITED",
      "X-Ray": "UNAVAILABLE",
      ECG: "AVAILABLE",
      "Blood Test": "AVAILABLE",
      Ultrasound: "UNAVAILABLE",
      Pharmacy: "AVAILABLE",
      Emergency: "LIMITED"
    },
    doctors: [
      { id: "doc-201", name: "Dr. K. Murugan M.B.B.S.", specialty: "General Practitioner", status: "ON_DUTY", room: "OPD 1", timing: "09:00 - 14:00" },
      { id: "doc-202", name: "Dr. Kavitha S. (Visiting)", specialty: "Pediatrics", status: "OFF_DUTY", room: "OPD 2", timing: "Visiting Tues/Thurs" }
    ],
    diagnostics: {
      "X-Ray": { status: "UNAVAILABLE", timing: "Machine Offline", notes: "Sensor tube replacement awaited from DME service. Refer to TVMCH or Ambasamudram." },
      ECG: { status: "AVAILABLE", timing: "09:00 - 16:00", notes: "Single machine functional" },
      "Blood Test": { status: "AVAILABLE", timing: "08:30 - 12:00", notes: "Basic blood glucose, Hb, CBC available" },
      Ultrasound: { status: "UNAVAILABLE", timing: "Not provided", notes: "No USG facility installed" }
    },
    medicines: [
      { id: "med-1", name: "Paracetamol 500mg", generic: "Paracetamol", status: "IN_STOCK", stock: 450, category: "Analgesic" },
      { id: "med-2", name: "Amoxicillin 500mg", generic: "Amoxicillin", status: "LOW_STOCK", stock: 35, category: "Antibiotic" },
      { id: "med-3", name: "Insulin Regular 40IU", generic: "Human Regular Insulin", status: "OUT_OF_STOCK", stock: 0, category: "Antidiabetic" },
      { id: "med-4", name: "ORS Powder", generic: "Oral Rehydration Salts", status: "IN_STOCK", stock: 250, category: "Hydration" },
      { id: "med-5", name: "Cetirizine 10mg", generic: "Cetirizine", status: "LOW_STOCK", stock: 20, category: "Antihistamine" }
    ]
  },
  {
    id: "hosp-3",
    name: "Government Taluk Hospital, Ambasamudram",
    tamilName: "அரசு தாலுகா தலைமை மருத்துவமனை, அம்பாசமுத்திரம்",
    type: "Taluk Hospital",
    tier: "Secondary",
    district: "Tirunelveli",
    taluk: "Ambasamudram",
    address: "Tenkasi Main Road, Ambasamudram - 627401",
    latitude: 8.7056,
    longitude: 77.4589,
    phone: "04634-250311",
    emergencyPhone: "04634-250312",
    isDemo: true,
    last_updated: "2026-09-05T05:55:00Z",
    updated_by: "Pharmacist Venkatesh G.",
    services: {
      "General Consultation": "AVAILABLE",
      Pediatrics: "AVAILABLE",
      Maternity: "AVAILABLE",
      "X-Ray": "AVAILABLE",
      ECG: "AVAILABLE",
      "Blood Test": "AVAILABLE",
      Ultrasound: "LIMITED",
      Pharmacy: "AVAILABLE",
      Emergency: "AVAILABLE"
    },
    doctors: [
      { id: "doc-301", name: "Dr. B. Mariappan M.S. (Ortho)", specialty: "Orthopedics & Casualty", status: "ON_DUTY", room: "Casualty", timing: "08:00 - 16:00" },
      { id: "doc-302", name: "Dr. T. Jayanthi M.D. (OG)", specialty: "Maternity", status: "ON_DUTY", room: "MCH Ward", timing: "09:00 - 15:00" }
    ],
    diagnostics: {
      "X-Ray": { status: "AVAILABLE", timing: "08:30 - 16:00", notes: "General radiography operational" },
      ECG: { status: "AVAILABLE", timing: "24 Hours", notes: "Emergency ECG room" },
      "Blood Test": { status: "AVAILABLE", timing: "08:00 - 14:00", notes: "Full bio-chemistry panel" },
      Ultrasound: { status: "LIMITED", timing: "10:00 - 13:00 Only", notes: "Radiologist available on designated hours only" }
    },
    medicines: [
      { id: "med-1", name: "Paracetamol 500mg", generic: "Paracetamol", status: "IN_STOCK", stock: 1200, category: "Analgesic" },
      { id: "med-2", name: "Amoxicillin 500mg", generic: "Amoxicillin", status: "IN_STOCK", stock: 600, category: "Antibiotic" },
      { id: "med-3", name: "Insulin Regular 40IU", generic: "Human Regular Insulin", status: "LOW_STOCK", stock: 15, category: "Antidiabetic" },
      { id: "med-4", name: "ORS Powder", generic: "Oral Rehydration Salts", status: "IN_STOCK", stock: 800, category: "Hydration" },
      { id: "med-6", name: "Metformin 500mg", generic: "Metformin", status: "IN_STOCK", stock: 900, category: "Antidiabetic" }
    ]
  },
  {
    id: "hosp-4",
    name: "Primary Health Centre, Nanguneri",
    tamilName: "ஆரம்ப சுகாதார நிலையம், நாங்குநேரி",
    type: "Primary Health Centre (PHC)",
    tier: "Primary",
    district: "Tirunelveli",
    taluk: "Nanguneri",
    address: "Bazaar Street, Nanguneri - 627108",
    latitude: 8.4892,
    longitude: 77.6583,
    phone: "04635-250100",
    emergencyPhone: "04635-250100",
    isDemo: true,
    last_updated: "2026-09-04T20:55:00Z",
    updated_by: "Dr. Anitha R.",
    services: {
      "General Consultation": "AVAILABLE",
      Pediatrics: "LIMITED",
      Maternity: "AVAILABLE",
      "X-Ray": "UNAVAILABLE",
      ECG: "UNAVAILABLE",
      "Blood Test": "AVAILABLE",
      Ultrasound: "UNAVAILABLE",
      Pharmacy: "AVAILABLE",
      Emergency: "LIMITED"
    },
    doctors: [
      { id: "doc-401", name: "Dr. Anitha R. M.B.B.S.", specialty: "General Practitioner", status: "LEAVE", room: "OPD 1", timing: "Medical Leave" }
    ],
    diagnostics: {
      "X-Ray": { status: "UNAVAILABLE", timing: "Not installed", notes: "No X-Ray facility" },
      ECG: { status: "UNAVAILABLE", timing: "Under Repair", notes: "Dispatched for circuit repair" },
      "Blood Test": { status: "AVAILABLE", timing: "09:00 - 12:00", notes: "Routine testing only" }
    },
    medicines: [
      { id: "med-1", name: "Paracetamol 500mg", generic: "Paracetamol", status: "IN_STOCK", stock: 350, category: "Analgesic" },
      { id: "med-4", name: "ORS Powder", generic: "Oral Rehydration Salts", status: "IN_STOCK", stock: 120, category: "Hydration" },
      { id: "med-2", name: "Amoxicillin 500mg", generic: "Amoxicillin", status: "OUT_OF_STOCK", stock: 0, category: "Antibiotic" }
    ]
  },
  {
    id: "hosp-5",
    name: "Urban Primary Health Centre, Palayamkottai",
    tamilName: "நகர்ப்புற ஆரம்ப சுகாதார நிலையம், பாளையங்கோட்டை",
    type: "Urban Primary Health Centre (UPHC)",
    tier: "Primary",
    district: "Tirunelveli",
    taluk: "Palayamkottai",
    address: "Near Market, Palayamkottai - 627002",
    latitude: 8.718,
    longitude: 77.732,
    phone: "0462-2580123",
    emergencyPhone: "0462-2580123",
    isDemo: true,
    last_updated: "2026-09-05T07:45:00Z",
    updated_by: "Nurse Revathi M.",
    services: {
      "General Consultation": "AVAILABLE",
      Pediatrics: "AVAILABLE",
      Maternity: "LIMITED",
      "X-Ray": "UNAVAILABLE",
      ECG: "AVAILABLE",
      "Blood Test": "AVAILABLE",
      Ultrasound: "UNAVAILABLE",
      Pharmacy: "AVAILABLE",
      Emergency: "LIMITED"
    },
    doctors: [
      { id: "doc-501", name: "Dr. G. Sivakumar M.B.B.S.", specialty: "Family Physician", status: "ON_DUTY", room: "OPD Cabin", timing: "08:30 - 14:30" }
    ],
    diagnostics: {
      "X-Ray": { status: "UNAVAILABLE", timing: "No setup", notes: "Patient advised to visit TVMCH 3km away" },
      ECG: { status: "AVAILABLE", timing: "09:00 - 13:00", notes: "Available" },
      "Blood Test": { status: "AVAILABLE", timing: "08:30 - 11:30", notes: "NCD Screening available" }
    },
    medicines: [
      { id: "med-1", name: "Paracetamol 500mg", generic: "Paracetamol", status: "IN_STOCK", stock: 800, category: "Analgesic" },
      { id: "med-5", name: "Cetirizine 10mg", generic: "Cetirizine", status: "IN_STOCK", stock: 500, category: "Antihistamine" },
      { id: "med-6", name: "Metformin 500mg", generic: "Metformin", status: "IN_STOCK", stock: 1100, category: "Antidiabetic" }
    ]
  },
  {
    id: "hosp-6",
    name: "Government District Head Quarters Hospital, Tenkasi",
    tamilName: "அரசு மாவட்ட தலைமை மருத்துவமனை, தென்காசி",
    type: "District Head Quarters Hospital",
    tier: "Secondary",
    district: "Tenkasi",
    taluk: "Tenkasi",
    address: "Railway Feeder Road, Tenkasi - 627811",
    latitude: 8.9594,
    longitude: 77.315,
    phone: "04633-222345",
    emergencyPhone: "04633-222346",
    isDemo: true,
    last_updated: "2026-09-04T06:55:00Z",
    updated_by: "Admin Desk Tenkasi",
    services: {
      "General Consultation": "AVAILABLE",
      Pediatrics: "AVAILABLE",
      Maternity: "AVAILABLE",
      "X-Ray": "AVAILABLE",
      ECG: "AVAILABLE",
      "Blood Test": "AVAILABLE",
      Ultrasound: "AVAILABLE",
      Pharmacy: "AVAILABLE",
      Emergency: "AVAILABLE"
    },
    doctors: [
      { id: "doc-601", name: "Dr. P. Krishnan M.S.", specialty: "General Surgery", status: "ON_DUTY", room: "OPD 4", timing: "09:00 - 16:00" }
    ],
    diagnostics: {
      "X-Ray": { status: "AVAILABLE", timing: "24 Hours", notes: "Emergency X-Ray unit" },
      ECG: { status: "AVAILABLE", timing: "24 Hours", notes: "ICU ECG" },
      "Blood Test": { status: "AVAILABLE", timing: "24 Hours", notes: "Central Lab" },
      Ultrasound: { status: "AVAILABLE", timing: "09:00 - 15:00", notes: "Sonography wing" }
    },
    medicines: [
      { id: "med-1", name: "Paracetamol 500mg", generic: "Paracetamol", status: "IN_STOCK", stock: 2500, category: "Analgesic" },
      { id: "med-2", name: "Amoxicillin 500mg", generic: "Amoxicillin", status: "IN_STOCK", stock: 1200, category: "Antibiotic" },
      { id: "med-3", name: "Insulin Regular 40IU", generic: "Human Regular Insulin", status: "IN_STOCK", stock: 180, category: "Antidiabetic" }
    ]
  }
];
