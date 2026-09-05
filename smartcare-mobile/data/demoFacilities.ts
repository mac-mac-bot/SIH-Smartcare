import { Facility } from "../types";

export const DEMO_LAT = 8.6800; // Cheranmahadevi baseline
export const DEMO_LON = 77.5550;

export const INITIAL_DEMO_FACILITIES: Facility[] = [
  {
    id: "hosp-1",
    name: "Tirunelveli Medical College Hospital (TVMCH)",
    tamilName: "திருநெல்வேலி மருத்துவக் கல்லூரி மருத்துவமனை",
    hindiName: "तिरुनेलवेली मेडिकल कॉलेज अस्पताल",
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
      "Pediatrics": "AVAILABLE",
      "Maternity": "AVAILABLE",
      "X-Ray": "AVAILABLE",
      "ECG": "AVAILABLE",
      "Blood Test": "AVAILABLE",
      "Ultrasound": "AVAILABLE",
      "Pharmacy": "AVAILABLE",
      "Emergency": "AVAILABLE"
    },
    doctors: [
      {
        id: "doc-101",
        name: "Dr. Sundaram M.D. (Medicine)",
        specialty: "General Medicine",
        status: "ON_DUTY",
        room: "Room 102",
        timing: "08:00 - 16:00"
      },
      {
        id: "doc-102",
        name: "Dr. V. Meenakshi M.S. (OBG)",
        specialty: "Maternity",
        status: "ON_DUTY",
        room: "Labour Ward 3",
        timing: "24 Hours Shift"
      },
      {
        id: "doc-103",
        name: "Dr. R. Karthik M.D. (Radiology)",
        specialty: "Radiology",
        status: "ON_DUTY",
        room: "X-Ray Dept, Block B",
        timing: "08:00 - 20:00"
      },
      {
        id: "doc-104",
        name: "Dr. N. Selvi D.C.H.",
        specialty: "Pediatrics",
        status: "ON_DUTY",
        room: "Pediatric Ward 1",
        timing: "09:00 - 17:00"
      }
    ],
    diagnostics: {
      "X-Ray": {
        status: "AVAILABLE",
        timing: "24 Hours Open",
        notes: "Digital 500mA unit operational"
      },
      "ECG": {
        status: "AVAILABLE",
        timing: "24 Hours Emergency",
        notes: "12-lead machine functional"
      },
      "Blood Test": {
        status: "AVAILABLE",
        timing: "07:00 - 18:00",
        notes: "Full hematology, biochemistry, CBC available"
      },
      "Ultrasound": {
        status: "AVAILABLE",
        timing: "09:00 - 16:00",
        notes: "Obstetric & abdominal scans open"
      }
    },
    medicines: [
      {
        id: "med-1",
        name: "Paracetamol 500mg",
        generic: "Paracetamol",
        status: "IN_STOCK",
        stock: 4500,
        category: "Analgesic / Antipyretic"
      },
      {
        id: "med-2",
        name: "Amoxicillin 500mg",
        generic: "Amoxicillin",
        status: "IN_STOCK",
        stock: 2200,
        category: "Antibiotic"
      },
      {
        id: "med-3",
        name: "Metformin 500mg",
        generic: "Metformin Hydrochloride",
        status: "IN_STOCK",
        stock: 3100,
        category: "Antidiabetic"
      },
      {
        id: "med-4",
        name: "ORS Sachets (WHO formula)",
        generic: "Oral Rehydration Salts",
        status: "IN_STOCK",
        stock: 1800,
        category: "Electrolyte"
      },
      {
        id: "med-5",
        name: "Insulin Regular (100 IU/ml)",
        generic: "Human Regular Insulin",
        status: "IN_STOCK",
        stock: 350,
        category: "Antidiabetic"
      },
      {
        id: "med-6",
        name: "Cetirizine 10mg",
        generic: "Cetirizine Hydrochloride",
        status: "IN_STOCK",
        stock: 1200,
        category: "Antihistamine"
      }
    ]
  },
  {
    id: "hosp-2",
    name: "Primary Health Centre, Cheranmahadevi",
    tamilName: "ஆரம்ப சுகாதார நிலையம், சேரன்மகாதேவி",
    hindiName: "प्राथमिक स्वास्थ्य केंद्र, चेरनमहादेवी",
    type: "Primary Health Centre (PHC)",
    tier: "Primary",
    district: "Tirunelveli",
    taluk: "Cheranmahadevi",
    address: "Hospital Road, Cheranmahadevi, Tirunelveli - 627414",
    latitude: 8.6812,
    longitude: 77.5605,
    phone: "04634-260222",
    emergencyPhone: "04634-260222",
    isDemo: true,
    last_updated: "2026-09-05T08:55:00Z",
    updated_by: "Staff Nurse Priya V.",
    services: {
      "General Consultation": "AVAILABLE",
      "Pediatrics": "AVAILABLE",
      "Maternity": "AVAILABLE",
      "X-Ray": "UNAVAILABLE",
      "ECG": "LIMITED",
      "Blood Test": "AVAILABLE",
      "Ultrasound": "UNAVAILABLE",
      "Pharmacy": "AVAILABLE",
      "Emergency": "LIMITED"
    },
    doctors: [
      {
        id: "doc-201",
        name: "Dr. K. Anitha M.B.B.S.",
        specialty: "Medical Officer",
        status: "ON_DUTY",
        room: "OPD 1",
        timing: "08:00 - 15:00"
      },
      {
        id: "doc-202",
        name: "Dr. M. Senthil M.B.B.S.",
        specialty: "Assistant Medical Officer",
        status: "OFF_DUTY",
        room: "OPD 2",
        timing: "14:00 - 20:00"
      }
    ],
    diagnostics: {
      "X-Ray": {
        status: "UNAVAILABLE",
        timing: "Not Installed",
        notes: "No radiographer posted. Nearest X-Ray at Ambasamudram Taluk Hospital (11 km) or TVMCH (22 km)."
      },
      "ECG": {
        status: "LIMITED",
        timing: "09:00 - 13:00",
        notes: "Portable single-channel ECG, paper roll limited"
      },
      "Blood Test": {
        status: "AVAILABLE",
        timing: "08:00 - 14:00",
        notes: "Hemoglobin, blood sugar strips, pregnancy test kits available"
      },
      "Ultrasound": {
        status: "UNAVAILABLE",
        timing: "N/A",
        notes: "No USG unit at PHC level"
      }
    },
    medicines: [
      {
        id: "med-1",
        name: "Paracetamol 500mg",
        generic: "Paracetamol",
        status: "IN_STOCK",
        stock: 800,
        category: "Analgesic / Antipyretic"
      },
      {
        id: "med-2",
        name: "Amoxicillin 500mg",
        generic: "Amoxicillin",
        status: "LOW_STOCK",
        stock: 35,
        category: "Antibiotic"
      },
      {
        id: "med-3",
        name: "Metformin 500mg",
        generic: "Metformin Hydrochloride",
        status: "IN_STOCK",
        stock: 600,
        category: "Antidiabetic"
      },
      {
        id: "med-4",
        name: "ORS Sachets (WHO formula)",
        generic: "Oral Rehydration Salts",
        status: "IN_STOCK",
        stock: 450,
        category: "Electrolyte"
      },
      {
        id: "med-5",
        name: "Insulin Regular (100 IU/ml)",
        generic: "Human Regular Insulin",
        status: "OUT_OF_STOCK",
        stock: 0,
        category: "Antidiabetic"
      }
    ]
  },
  {
    id: "hosp-3",
    name: "Government Taluk Hospital, Ambasamudram",
    tamilName: "அரசு தாலுகா தலைமை மருத்துவமனை, அம்பாசமுத்திரம்",
    hindiName: "सरकारी तालुक अस्पताल, अंबासमुद्रम",
    type: "Taluk Hospital (Sub-District)",
    tier: "Secondary",
    district: "Tirunelveli",
    taluk: "Ambasamudram",
    address: "Tenkasi Main Road, Ambasamudram, Tirunelveli - 627401",
    latitude: 8.7078,
    longitude: 77.4589,
    phone: "04634-250320",
    emergencyPhone: "04634-250320",
    isDemo: true,
    last_updated: "2026-09-05T09:40:00Z",
    updated_by: "Medical Superintendent Dr. Paulraj",
    services: {
      "General Consultation": "AVAILABLE",
      "Pediatrics": "AVAILABLE",
      "Maternity": "AVAILABLE",
      "X-Ray": "AVAILABLE",
      "ECG": "AVAILABLE",
      "Blood Test": "AVAILABLE",
      "Ultrasound": "LIMITED",
      "Pharmacy": "AVAILABLE",
      "Emergency": "AVAILABLE"
    },
    doctors: [
      {
        id: "doc-301",
        name: "Dr. T. Paulraj M.S. (General Surgery)",
        specialty: "Surgery",
        status: "ON_DUTY",
        room: "OPD 1",
        timing: "08:00 - 16:00"
      },
      {
        id: "doc-302",
        name: "Dr. K. Geetha D.G.O.",
        specialty: "Maternity",
        status: "ON_DUTY",
        room: "OG Ward",
        timing: "24 Hours On-Call"
      },
      {
        id: "doc-303",
        name: "Dr. J. Mohan M.B.B.S.",
        specialty: "Casualty Medical Officer",
        status: "ON_DUTY",
        room: "Emergency",
        timing: "24 Hours Shift"
      }
    ],
    diagnostics: {
      "X-Ray": {
        status: "AVAILABLE",
        timing: "08:00 - 17:00",
        notes: "Digital X-Ray operational. Radiographer on duty."
      },
      "ECG": {
        status: "AVAILABLE",
        timing: "24 Hours",
        notes: "ECG machine verified functional"
      },
      "Blood Test": {
        status: "AVAILABLE",
        timing: "08:00 - 16:00",
        notes: "Primary lab operational"
      },
      "Ultrasound": {
        status: "LIMITED",
        timing: "Tue & Thu only",
        notes: "Visiting radiologist available on scheduled clinic days"
      }
    },
    medicines: [
      {
        id: "med-1",
        name: "Paracetamol 500mg",
        generic: "Paracetamol",
        status: "IN_STOCK",
        stock: 2500,
        category: "Analgesic / Antipyretic"
      },
      {
        id: "med-2",
        name: "Amoxicillin 500mg",
        generic: "Amoxicillin",
        status: "IN_STOCK",
        stock: 900,
        category: "Antibiotic"
      },
      {
        id: "med-3",
        name: "Metformin 500mg",
        generic: "Metformin Hydrochloride",
        status: "IN_STOCK",
        stock: 1400,
        category: "Antidiabetic"
      },
      {
        id: "med-4",
        name: "ORS Sachets (WHO formula)",
        generic: "Oral Rehydration Salts",
        status: "IN_STOCK",
        stock: 750,
        category: "Electrolyte"
      },
      {
        id: "med-5",
        name: "Insulin Regular (100 IU/ml)",
        generic: "Human Regular Insulin",
        status: "IN_STOCK",
        stock: 120,
        category: "Antidiabetic"
      }
    ]
  },
  {
    id: "hosp-4",
    name: "Government District Head Quarters Hospital, Tenkasi",
    tamilName: "அரசு மாவட்ட தலைமை மருத்துவமனை, தென்காசி",
    hindiName: "सरकारी जिला मुख्यालय अस्पताल, तेनकाशी",
    type: "District Headquarters Hospital",
    tier: "Secondary",
    district: "Tenkasi",
    taluk: "Tenkasi",
    address: "Kollam - Tirumangalam Road, Tenkasi - 627811",
    latitude: 8.9592,
    longitude: 77.3156,
    phone: "04633-222234",
    emergencyPhone: "04633-222234",
    isDemo: true,
    last_updated: "2026-09-04T16:00:00Z",
    updated_by: "Dr. B. Subhashini, Superintendent",
    services: {
      "General Consultation": "AVAILABLE",
      "Pediatrics": "AVAILABLE",
      "Maternity": "AVAILABLE",
      "X-Ray": "AVAILABLE",
      "ECG": "AVAILABLE",
      "Blood Test": "AVAILABLE",
      "Ultrasound": "AVAILABLE",
      "Pharmacy": "AVAILABLE",
      "Emergency": "AVAILABLE"
    },
    doctors: [
      {
        id: "doc-401",
        name: "Dr. M. Murugan M.D.",
        specialty: "General Medicine",
        status: "ON_DUTY",
        room: "Room 4",
        timing: "08:00 - 16:00"
      },
      {
        id: "doc-402",
        name: "Dr. R. Kavitha M.S.",
        specialty: "Obstetrics & Gynaecology",
        status: "ON_DUTY",
        room: "OG OT",
        timing: "24 Hours Shift"
      }
    ],
    diagnostics: {
      "X-Ray": {
        status: "AVAILABLE",
        timing: "24 Hours Emergency",
        notes: "Operational digital X-Ray"
      },
      "ECG": {
        status: "AVAILABLE",
        timing: "24 Hours",
        notes: "Operational"
      },
      "Blood Test": {
        status: "AVAILABLE",
        timing: "07:30 - 18:00",
        notes: "Full clinical lab"
      },
      "Ultrasound": {
        status: "AVAILABLE",
        timing: "09:00 - 15:00",
        notes: "Scan machine operational"
      }
    },
    medicines: [
      {
        id: "med-1",
        name: "Paracetamol 500mg",
        generic: "Paracetamol",
        status: "IN_STOCK",
        stock: 3200,
        category: "Analgesic / Antipyretic"
      },
      {
        id: "med-5",
        name: "Insulin Regular (100 IU/ml)",
        generic: "Human Regular Insulin",
        status: "IN_STOCK",
        stock: 210,
        category: "Antidiabetic"
      }
    ]
  },
  {
    id: "hosp-5",
    name: "Urban Primary Health Centre, Palayamkottai",
    tamilName: "நகர்ப்புற ஆரம்ப சுகாதார நிலையம், பாளையங்கோட்டை",
    hindiName: "शहरी प्राथमिक स्वास्थ्य केंद्र, पालयमकोट्टई",
    type: "Urban Primary Health Centre (UPHC)",
    tier: "Primary",
    district: "Tirunelveli",
    taluk: "Palayamkottai",
    address: "Market Road, Palayamkottai, Tirunelveli - 627002",
    latitude: 8.7185,
    longitude: 77.7345,
    phone: "0462-2500119",
    emergencyPhone: "0462-2500119",
    isDemo: true,
    last_updated: "2026-09-05T07:15:00Z",
    updated_by: "Medical Officer Dr. V. Deepa",
    services: {
      "General Consultation": "AVAILABLE",
      "Pediatrics": "AVAILABLE",
      "Maternity": "LIMITED",
      "X-Ray": "UNAVAILABLE",
      "ECG": "UNAVAILABLE",
      "Blood Test": "AVAILABLE",
      "Ultrasound": "UNAVAILABLE",
      "Pharmacy": "AVAILABLE",
      "Emergency": "UNAVAILABLE"
    },
    doctors: [
      {
        id: "doc-501",
        name: "Dr. V. Deepa M.B.B.S.",
        specialty: "Medical Officer",
        status: "ON_DUTY",
        room: "Consultation 1",
        timing: "08:00 - 14:00"
      }
    ],
    diagnostics: {
      "X-Ray": {
        status: "UNAVAILABLE",
        timing: "N/A",
        notes: "No radiology facilities at UPHC"
      },
      "ECG": {
        status: "UNAVAILABLE",
        timing: "N/A",
        notes: "Under repair"
      },
      "Blood Test": {
        status: "AVAILABLE",
        timing: "08:00 - 13:00",
        notes: "Basic blood sugar & Hb testing"
      },
      "Ultrasound": {
        status: "UNAVAILABLE",
        timing: "N/A",
        notes: "N/A"
      }
    },
    medicines: [
      {
        id: "med-1",
        name: "Paracetamol 500mg",
        generic: "Paracetamol",
        status: "IN_STOCK",
        stock: 1100,
        category: "Analgesic / Antipyretic"
      },
      {
        id: "med-3",
        name: "Metformin 500mg",
        generic: "Metformin Hydrochloride",
        status: "IN_STOCK",
        stock: 500,
        category: "Antidiabetic"
      }
    ]
  },
  {
    id: "hosp-6",
    name: "Primary Health Centre, Alangulam",
    tamilName: "ஆரம்ப சுகாதார நிலையம், ஆலங்குளம்",
    hindiName: "प्राथमिक स्वास्थ्य केंद्र, अलंगुलम",
    type: "Primary Health Centre (PHC)",
    tier: "Primary",
    district: "Tenkasi",
    taluk: "Alangulam",
    address: "Bus Stand Road, Alangulam, Tenkasi - 627851",
    latitude: 8.8712,
    longitude: 77.5023,
    phone: "04633-270220",
    emergencyPhone: "04633-270220",
    isDemo: true,
    last_updated: "2026-09-02T11:00:00Z", // Stale test case (>24 hrs)
    updated_by: "Medical Officer",
    services: {
      "General Consultation": "AVAILABLE",
      "Pediatrics": "LIMITED",
      "Maternity": "AVAILABLE",
      "X-Ray": "UNAVAILABLE",
      "ECG": "LIMITED",
      "Blood Test": "AVAILABLE",
      "Ultrasound": "UNAVAILABLE",
      "Pharmacy": "AVAILABLE",
      "Emergency": "UNAVAILABLE"
    },
    doctors: [
      {
        id: "doc-601",
        name: "Dr. K. Rajan M.B.B.S.",
        specialty: "Medical Officer",
        status: "ON_DUTY",
        room: "OPD",
        timing: "08:00 - 14:00"
      }
    ],
    diagnostics: {
      "X-Ray": {
        status: "UNAVAILABLE",
        timing: "N/A",
        notes: "No X-Ray facility"
      },
      "ECG": {
        status: "LIMITED",
        timing: "09:00 - 12:00",
        notes: "Staff limited"
      },
      "Blood Test": {
        status: "AVAILABLE",
        timing: "08:00 - 12:00",
        notes: "Basic clinic testing"
      },
      "Ultrasound": {
        status: "UNAVAILABLE",
        timing: "N/A",
        notes: "N/A"
      }
    },
    medicines: [
      {
        id: "med-1",
        name: "Paracetamol 500mg",
        generic: "Paracetamol",
        status: "IN_STOCK",
        stock: 650,
        category: "Analgesic / Antipyretic"
      }
    ]
  }
];
