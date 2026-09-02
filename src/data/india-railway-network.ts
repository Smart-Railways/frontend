export interface RailwayStation {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  x: number;
  y: number;
  platforms: number;
  isHub?: boolean;
  isCapital?: boolean;
}

export interface RailwayTrack {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  electrified: boolean;
  tracks: "Double" | "Triple" | "Quadruple" | "Single";
  maxSpeedKmph: number;
}

// Projected mathematically onto official India SVG map canvas (viewBox 0 0 612 696)
export const STATIONS: RailwayStation[] = [
  {
    "id": "ndls",
    "code": "NDLS",
    "name": "DELHI",
    "city": "New Delhi",
    "state": "Delhi",
    "zone": "NR",
    "x": 188.4,
    "y": 205.1,
    "platforms": 16,
    "isHub": true,
    "isCapital": true
  },
  {
    "id": "jat",
    "code": "JAT",
    "name": "JAMMU TAWI",
    "city": "Jammu",
    "state": "J&K",
    "zone": "NR",
    "x": 135.3,
    "y": 113.4,
    "platforms": 5,
    "isHub": true
  },
  {
    "id": "asr",
    "code": "ASR",
    "name": "AMRITSAR",
    "city": "Amritsar",
    "state": "Punjab",
    "zone": "NR",
    "x": 135.1,
    "y": 137.4,
    "platforms": 7
  },
  {
    "id": "juc",
    "code": "JUC",
    "name": "JALANDHAR",
    "city": "Jalandhar",
    "state": "Punjab",
    "zone": "NR",
    "x": 151.2,
    "y": 144.3,
    "platforms": 5
  },
  {
    "id": "ldh",
    "code": "LDH",
    "name": "LUDHIANA",
    "city": "Ludhiana",
    "state": "Punjab",
    "zone": "NR",
    "x": 157.6,
    "y": 153.9,
    "platforms": 6
  },
  {
    "id": "umb",
    "code": "UMB",
    "name": "AMBALA",
    "city": "Ambala",
    "state": "Haryana",
    "zone": "NR",
    "x": 178.7,
    "y": 165.6,
    "platforms": 8,
    "isHub": true
  },
  {
    "id": "mb",
    "code": "MB",
    "name": "MORADABAD",
    "city": "Moradabad",
    "state": "UP",
    "zone": "NR",
    "x": 224.1,
    "y": 200.1,
    "platforms": 5
  },
  {
    "id": "re",
    "code": "RE",
    "name": "REWARI",
    "city": "Rewari",
    "state": "Haryana",
    "zone": "NR",
    "x": 175.1,
    "y": 214.5,
    "platforms": 6
  },
  {
    "id": "jp",
    "code": "JP",
    "name": "JAIPUR",
    "city": "Jaipur",
    "state": "Rajasthan",
    "zone": "NWR",
    "x": 156,
    "y": 243.2,
    "platforms": 8,
    "isHub": true
  },
  {
    "id": "mj",
    "code": "MJ",
    "name": "MARWAR",
    "city": "Marwar",
    "state": "Rajasthan",
    "zone": "NWR",
    "x": 106.1,
    "y": 269.7,
    "platforms": 4
  },
  {
    "id": "abr",
    "code": "ABR",
    "name": "ABU ROAD",
    "city": "Abu Road",
    "state": "Rajasthan",
    "zone": "NWR",
    "x": 87.5,
    "y": 297.7,
    "platforms": 3
  },
  {
    "id": "gim",
    "code": "GIMB",
    "name": "GANDHIDHAM",
    "city": "Gandhidham",
    "state": "Gujarat",
    "zone": "WR",
    "x": 27.1,
    "y": 329.2,
    "platforms": 4
  },
  {
    "id": "adi",
    "code": "ADI",
    "name": "AHMEDABAD",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "zone": "WR",
    "x": 82.7,
    "y": 330.4,
    "platforms": 12,
    "isHub": true
  },
  {
    "id": "annd",
    "code": "ANND",
    "name": "ANAND",
    "city": "Anand",
    "state": "Gujarat",
    "zone": "WR",
    "x": 90.8,
    "y": 340.7,
    "platforms": 5
  },
  {
    "id": "brc",
    "code": "BRC",
    "name": "VADODARA",
    "city": "Vadodara",
    "state": "Gujarat",
    "zone": "WR",
    "x": 96.6,
    "y": 346.4,
    "platforms": 7,
    "isHub": true
  },
  {
    "id": "st",
    "code": "ST",
    "name": "SURAT",
    "city": "Surat",
    "state": "Gujarat",
    "zone": "WR",
    "x": 88.6,
    "y": 371.9,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "jl",
    "code": "JL",
    "name": "JALGAON",
    "city": "Jalgaon",
    "state": "Maharashtra",
    "zone": "CR",
    "x": 150.9,
    "y": 375.5,
    "platforms": 5
  },
  {
    "id": "mmr",
    "code": "MMR",
    "name": "MANMAD",
    "city": "Manmad",
    "state": "Maharashtra",
    "zone": "CR",
    "x": 125.2,
    "y": 392.5,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "mmct",
    "code": "MMCT",
    "name": "MUMBAI",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zone": "WR",
    "x": 88.3,
    "y": 421.2,
    "platforms": 18,
    "isHub": true
  },
  {
    "id": "pune",
    "code": "PUNE",
    "name": "PUNE",
    "city": "Pune",
    "state": "Maharashtra",
    "zone": "CR",
    "x": 112,
    "y": 431.3,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "rn",
    "code": "RN",
    "name": "RATNAGIRI",
    "city": "Ratnagiri",
    "state": "Maharashtra",
    "zone": "KR",
    "x": 99.6,
    "y": 465.6,
    "platforms": 3
  },
  {
    "id": "mao",
    "code": "MAO",
    "name": "MADGAON",
    "city": "Goa",
    "state": "Goa",
    "zone": "KR",
    "x": 114.9,
    "y": 503.8,
    "platforms": 4,
    "isHub": true
  },
  {
    "id": "kawr",
    "code": "KAWR",
    "name": "KARWAR",
    "city": "Karwar",
    "state": "Karnataka",
    "zone": "KR",
    "x": 118.2,
    "y": 514.3,
    "platforms": 3
  },
  {
    "id": "maq",
    "code": "MAQ",
    "name": "MANGALORE",
    "city": "Mangalore",
    "state": "Karnataka",
    "zone": "SR",
    "x": 134.5,
    "y": 557.9,
    "platforms": 5,
    "isHub": true
  },
  {
    "id": "mtj",
    "code": "MTJ",
    "name": "MATHURA",
    "city": "Mathura",
    "state": "UP",
    "zone": "NCR",
    "x": 199,
    "y": 230.2,
    "platforms": 8
  },
  {
    "id": "agc",
    "code": "AGC",
    "name": "AGRA",
    "city": "Agra",
    "state": "UP",
    "zone": "NCR",
    "x": 206.6,
    "y": 237.3,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "gwl",
    "code": "GWL",
    "name": "GWALIOR",
    "city": "Gwalior",
    "state": "MP",
    "zone": "NCR",
    "x": 210.6,
    "y": 258.8,
    "platforms": 5
  },
  {
    "id": "jhs",
    "code": "VGLJ",
    "name": "JHANSI",
    "city": "Jhansi",
    "state": "UP",
    "zone": "NCR",
    "x": 219.4,
    "y": 276,
    "platforms": 8,
    "isHub": true
  },
  {
    "id": "bina",
    "code": "BINA",
    "name": "BINA",
    "city": "Bina",
    "state": "MP",
    "zone": "WCR",
    "x": 210.7,
    "y": 304.6,
    "platforms": 5
  },
  {
    "id": "bpl",
    "code": "BPL",
    "name": "BHOPAL",
    "city": "Bhopal",
    "state": "MP",
    "zone": "WCR",
    "x": 193,
    "y": 325.1,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "rtm",
    "code": "RTM",
    "name": "RATLAM",
    "city": "Ratlam",
    "state": "MP",
    "zone": "WR",
    "x": 138.9,
    "y": 323.5,
    "platforms": 7,
    "isHub": true
  },
  {
    "id": "et",
    "code": "ET",
    "name": "ITARSI",
    "city": "Itarsi",
    "state": "MP",
    "zone": "WCR",
    "x": 200.7,
    "y": 355.2,
    "platforms": 7,
    "isHub": true
  },
  {
    "id": "ngp",
    "code": "NGP",
    "name": "NAGPUR",
    "city": "Nagpur",
    "state": "Maharashtra",
    "zone": "CR",
    "x": 231.2,
    "y": 372.4,
    "platforms": 8,
    "isHub": true
  },
  {
    "id": "wr",
    "code": "WR",
    "name": "WARDHA",
    "city": "Wardha",
    "state": "Maharashtra",
    "zone": "CR",
    "x": 220.2,
    "y": 381.4,
    "platforms": 4
  },
  {
    "id": "jbp",
    "code": "JBP",
    "name": "JABALPUR",
    "city": "Jabalpur",
    "state": "MP",
    "zone": "WCR",
    "x": 251.7,
    "y": 326.8,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "kte",
    "code": "KTE",
    "name": "KATNI",
    "city": "Katni",
    "state": "MP",
    "zone": "WCR",
    "x": 261,
    "y": 312.2,
    "platforms": 6
  },
  {
    "id": "bsp",
    "code": "BSP",
    "name": "BILASPUR",
    "city": "Bilaspur",
    "state": "Chhattisgarh",
    "zone": "SECR",
    "x": 300.8,
    "y": 351.5,
    "platforms": 8,
    "isHub": true
  },
  {
    "id": "r",
    "code": "R",
    "name": "RAIPUR",
    "city": "Raipur",
    "state": "Chhattisgarh",
    "zone": "SECR",
    "x": 289.2,
    "y": 370.1,
    "platforms": 7,
    "isHub": true
  },
  {
    "id": "durg",
    "code": "DURG",
    "name": "DURG",
    "city": "Durg",
    "state": "Chhattisgarh",
    "zone": "SECR",
    "x": 281.3,
    "y": 371.4,
    "platforms": 5
  },
  {
    "id": "cnb",
    "code": "CNB",
    "name": "KANPUR",
    "city": "Kanpur",
    "state": "UP",
    "zone": "NCR",
    "x": 259.6,
    "y": 253.6,
    "platforms": 10,
    "isHub": true
  },
  {
    "id": "lko",
    "code": "LKO",
    "name": "LUCKNOW",
    "city": "Lucknow",
    "state": "UP",
    "zone": "NR",
    "x": 273.6,
    "y": 244.7,
    "platforms": 9,
    "isHub": true
  },
  {
    "id": "ald",
    "code": "PRYJ",
    "name": "ALLAHABAD",
    "city": "Prayagraj",
    "state": "UP",
    "zone": "NCR",
    "x": 294.1,
    "y": 276.3,
    "platforms": 10,
    "isHub": true
  },
  {
    "id": "bsb",
    "code": "BSB",
    "name": "VARANASI",
    "city": "Varanasi",
    "state": "UP",
    "zone": "NR",
    "x": 319.8,
    "y": 279,
    "platforms": 9,
    "isHub": true
  },
  {
    "id": "ddu",
    "code": "DDU",
    "name": "MUGHALSARAI",
    "city": "Pt. Deen Dayal",
    "state": "UP",
    "zone": "ECR",
    "x": 323.2,
    "y": 279.8,
    "platforms": 8,
    "isHub": true
  },
  {
    "id": "gaya",
    "code": "GAYA",
    "name": "GAYA",
    "city": "Gaya",
    "state": "Bihar",
    "zone": "ECR",
    "x": 366,
    "y": 290.8,
    "platforms": 7
  },
  {
    "id": "pnbe",
    "code": "PNBE",
    "name": "PATNA",
    "city": "Patna",
    "state": "Bihar",
    "zone": "ECR",
    "x": 369.1,
    "y": 272.8,
    "platforms": 10,
    "isHub": true
  },
  {
    "id": "bju",
    "code": "BJU",
    "name": "BARAUNI",
    "city": "Barauni",
    "state": "Bihar",
    "zone": "ECR",
    "x": 388.1,
    "y": 275.5,
    "platforms": 7
  },
  {
    "id": "kir",
    "code": "KIR",
    "name": "KATIHAR",
    "city": "Katihar",
    "state": "Bihar",
    "zone": "NFR",
    "x": 424.6,
    "y": 274,
    "platforms": 6
  },
  {
    "id": "mldt",
    "code": "MLDT",
    "name": "MALDA",
    "city": "Malda",
    "state": "West Bengal",
    "zone": "ER",
    "x": 437.6,
    "y": 285.8,
    "platforms": 6
  },
  {
    "id": "njp",
    "code": "NJP",
    "name": "NEW JALPAIGURI",
    "city": "Siliguri",
    "state": "WB",
    "zone": "NFR",
    "x": 444.5,
    "y": 248.4,
    "platforms": 5,
    "isHub": true
  },
  {
    "id": "apdj",
    "code": "APDJ",
    "name": "ALIPURDUAR",
    "city": "Alipurduar",
    "state": "WB",
    "zone": "NFR",
    "x": 469.2,
    "y": 252.7,
    "platforms": 4
  },
  {
    "id": "rny",
    "code": "RNY",
    "name": "RANGIYA",
    "city": "Rangiya",
    "state": "Assam",
    "zone": "NFR",
    "x": 517.1,
    "y": 253.9,
    "platforms": 4
  },
  {
    "id": "ghy",
    "code": "GHY",
    "name": "GUWAHATI",
    "city": "Guwahati",
    "state": "Assam",
    "zone": "NFR",
    "x": 519.9,
    "y": 259.6,
    "platforms": 7,
    "isHub": true
  },
  {
    "id": "lmg",
    "code": "LMG",
    "name": "LUMDING",
    "city": "Lumding",
    "state": "Assam",
    "zone": "NFR",
    "x": 552.2,
    "y": 269.3,
    "platforms": 5
  },
  {
    "id": "dmv",
    "code": "DMV",
    "name": "DIMAPUR",
    "city": "Dimapur",
    "state": "Nagaland",
    "zone": "NFR",
    "x": 564.9,
    "y": 265.8,
    "platforms": 3
  },
  {
    "id": "dbrt",
    "code": "DBRT",
    "name": "DIBRUGARH",
    "city": "Dibrugarh",
    "state": "Assam",
    "zone": "NFR",
    "x": 591.9,
    "y": 230.7,
    "platforms": 4,
    "isHub": true
  },
  {
    "id": "asn",
    "code": "ASN",
    "name": "ASANSOL",
    "city": "Asansol",
    "state": "WB",
    "zone": "ER",
    "x": 410.8,
    "y": 315.5,
    "platforms": 7,
    "isHub": true
  },
  {
    "id": "dgr",
    "code": "DGR",
    "name": "DURGAPUR",
    "city": "Durgapur",
    "state": "WB",
    "zone": "ER",
    "x": 418.7,
    "y": 319.2,
    "platforms": 5
  },
  {
    "id": "rnc",
    "code": "RNC",
    "name": "RANCHI",
    "city": "Ranchi",
    "state": "Jharkhand",
    "zone": "SER",
    "x": 373.1,
    "y": 323.2,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "kgp",
    "code": "KGP",
    "name": "KHARAGPUR",
    "city": "Kharagpur",
    "state": "WB",
    "zone": "SER",
    "x": 419,
    "y": 345.7,
    "platforms": 12,
    "isHub": true
  },
  {
    "id": "hwh",
    "code": "HWH",
    "name": "KOLKATA",
    "city": "Kolkata",
    "state": "WB",
    "zone": "ER",
    "x": 442.2,
    "y": 340.2,
    "platforms": 23,
    "isHub": true
  },
  {
    "id": "ctc",
    "code": "CTC",
    "name": "CUTTACK",
    "city": "Cuttack",
    "state": "Odisha",
    "zone": "ECoR",
    "x": 386.1,
    "y": 387.8,
    "platforms": 5
  },
  {
    "id": "bbs",
    "code": "BBS",
    "name": "BHUBANESHWAR",
    "city": "Bhubaneswar",
    "state": "Odisha",
    "zone": "ECoR",
    "x": 384.8,
    "y": 391.5,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "vzm",
    "code": "VZM",
    "name": "VIZIANAGARAM",
    "city": "Vizianagaram",
    "state": "AP",
    "zone": "ECoR",
    "x": 329.4,
    "y": 440.5,
    "platforms": 5
  },
  {
    "id": "vskp",
    "code": "VSKP",
    "name": "VISAKHAPATNAM",
    "city": "Visakhapatnam",
    "state": "AP",
    "zone": "ECoR",
    "x": 325.4,
    "y": 450,
    "platforms": 8,
    "isHub": true
  },
  {
    "id": "rjy",
    "code": "RJY",
    "name": "RAJAHMUNDRY",
    "city": "Rajahmundry",
    "state": "AP",
    "zone": "SCR",
    "x": 293.1,
    "y": 465.3,
    "platforms": 4
  },
  {
    "id": "bza",
    "code": "BZA",
    "name": "VIJAYAWADA",
    "city": "Vijayawada",
    "state": "AP",
    "zone": "SCR",
    "x": 266.8,
    "y": 476.4,
    "platforms": 10,
    "isHub": true
  },
  {
    "id": "gnt",
    "code": "GNT",
    "name": "GUNTUR",
    "city": "Guntur",
    "state": "AP",
    "zone": "SCR",
    "x": 262,
    "y": 480.9,
    "platforms": 7
  },
  {
    "id": "wl",
    "code": "WL",
    "name": "WARANGAL",
    "city": "Warangal",
    "state": "Telangana",
    "zone": "SCR",
    "x": 242.8,
    "y": 443.6,
    "platforms": 4
  },
  {
    "id": "kzj",
    "code": "KZJ",
    "name": "KAZIPET",
    "city": "Kazipet",
    "state": "Telangana",
    "zone": "SCR",
    "x": 240.8,
    "y": 443.4,
    "platforms": 5
  },
  {
    "id": "sc",
    "code": "SC",
    "name": "SECUNDERABAD",
    "city": "Hyderabad",
    "state": "Telangana",
    "zone": "SCR",
    "x": 217.8,
    "y": 455.5,
    "platforms": 10,
    "isHub": true
  },
  {
    "id": "sur",
    "code": "SUR",
    "name": "SOLAPUR",
    "city": "Solapur",
    "state": "Maharashtra",
    "zone": "CR",
    "x": 158.7,
    "y": 450.6,
    "platforms": 5
  },
  {
    "id": "wadi",
    "code": "WADI",
    "name": "WADI",
    "city": "Wadi",
    "state": "Karnataka",
    "zone": "CR",
    "x": 183.3,
    "y": 464.2,
    "platforms": 4,
    "isHub": true
  },
  {
    "id": "gtl",
    "code": "GTL",
    "name": "GUNTAKAL",
    "city": "Guntakal",
    "state": "AP",
    "zone": "SCR",
    "x": 192,
    "y": 506.4,
    "platforms": 7,
    "isHub": true
  },
  {
    "id": "hx",
    "code": "HX",
    "name": "CUDDAPAH",
    "city": "Kadapa",
    "state": "AP",
    "zone": "SCR",
    "x": 225.2,
    "y": 522.1,
    "platforms": 4
  },
  {
    "id": "ru",
    "code": "RU",
    "name": "RENIGUNTA",
    "city": "Tirupati",
    "state": "AP",
    "zone": "SCR",
    "x": 241,
    "y": 540.8,
    "platforms": 6
  },
  {
    "id": "mas",
    "code": "MAS",
    "name": "CHENNAI",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "zone": "SR",
    "x": 258.2,
    "y": 553.1,
    "platforms": 17,
    "isHub": true
  },
  {
    "id": "vm",
    "code": "VM",
    "name": "VILLUPURAM",
    "city": "Villupuram",
    "state": "Tamil Nadu",
    "zone": "SR",
    "x": 240.3,
    "y": 578.7,
    "platforms": 6
  },
  {
    "id": "sa",
    "code": "SA",
    "name": "SALEM",
    "city": "Salem",
    "state": "Tamil Nadu",
    "zone": "SR",
    "x": 209.8,
    "y": 584.9,
    "platforms": 6
  },
  {
    "id": "sbc",
    "code": "SBC",
    "name": "BANGALORE",
    "city": "Bengaluru",
    "state": "Karnataka",
    "zone": "SWR",
    "x": 197.2,
    "y": 555.6,
    "platforms": 10,
    "isHub": true
  },
  {
    "id": "cbe",
    "code": "CBE",
    "name": "COIMBATORE",
    "city": "Coimbatore",
    "state": "Tamil Nadu",
    "zone": "SR",
    "x": 182.6,
    "y": 599.4,
    "platforms": 6
  },
  {
    "id": "pgt",
    "code": "PGT",
    "name": "PALAKKAD",
    "city": "Palakkad",
    "state": "Kerala",
    "zone": "SR",
    "x": 175.8,
    "y": 604.6,
    "platforms": 5
  },
  {
    "id": "tcr",
    "code": "TCR",
    "name": "THRISSUR",
    "city": "Thrissur",
    "state": "Kerala",
    "zone": "SR",
    "x": 165.7,
    "y": 610.4,
    "platforms": 4
  },
  {
    "id": "ers",
    "code": "ERS",
    "name": "ERNAKULAM",
    "city": "Kochi",
    "state": "Kerala",
    "zone": "SR",
    "x": 167.7,
    "y": 622.6,
    "platforms": 6,
    "isHub": true
  },
  {
    "id": "allp",
    "code": "ALLP",
    "name": "ALAPPUZHA",
    "city": "Alappuzha",
    "state": "Kerala",
    "zone": "SR",
    "x": 168.6,
    "y": 633.4,
    "platforms": 3
  },
  {
    "id": "qln",
    "code": "QLN",
    "name": "KOLLAM",
    "city": "Kollam",
    "state": "Kerala",
    "zone": "SR",
    "x": 174.8,
    "y": 647,
    "platforms": 6
  },
  {
    "id": "tvc",
    "code": "TVC",
    "name": "THIRUVANANTHAPURAM",
    "city": "Trivandrum",
    "state": "Kerala",
    "zone": "SR",
    "x": 182.2,
    "y": 655.3,
    "platforms": 5,
    "isHub": true
  },
  {
    "id": "ncj",
    "code": "NCJ",
    "name": "NAGERCOIL",
    "city": "Nagercoil",
    "state": "Tamil Nadu",
    "zone": "SR",
    "x": 193,
    "y": 662.9,
    "platforms": 4
  }
];

export const TRACKS: RailwayTrack[] = [
  // Northern Network
  { id: "t-jat-asr", from: "jat", to: "asr", distanceKm: 206, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-asr-juc", from: "asr", to: "juc", distanceKm: 79, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-juc-ldh", from: "juc", to: "ldh", distanceKm: 61, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-ldh-umb", from: "ldh", to: "umb", distanceKm: 114, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-umb-ndls", from: "umb", to: "ndls", distanceKm: 198, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-ndls-mb", from: "ndls", to: "mb", distanceKm: 161, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-ndls-re", from: "ndls", to: "re", distanceKm: 83, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-re-jp", from: "re", to: "jp", distanceKm: 225, electrified: true, tracks: "Double", maxSpeedKmph: 120 },

  // Western Corridor: Delhi - Jaipur - Ahmedabad - Mumbai
  { id: "t-jp-mj", from: "jp", to: "mj", distanceKm: 284, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-mj-abr", from: "mj", to: "abr", distanceKm: 145, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-abr-adi", from: "abr", to: "adi", distanceKm: 190, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-mj-gim", from: "mj", to: "gim", distanceKm: 340, electrified: true, tracks: "Single", maxSpeedKmph: 110 },
  { id: "t-gim-adi", from: "gim", to: "adi", distanceKm: 300, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-adi-annd", from: "adi", to: "annd", distanceKm: 65, electrified: true, tracks: "Quadruple", maxSpeedKmph: 130 },
  { id: "t-annd-brc", from: "annd", to: "brc", distanceKm: 35, electrified: true, tracks: "Quadruple", maxSpeedKmph: 130 },
  { id: "t-brc-st", from: "brc", to: "st", distanceKm: 129, electrified: true, tracks: "Quadruple", maxSpeedKmph: 130 },
  { id: "t-st-mmct", from: "st", to: "mmct", distanceKm: 263, electrified: true, tracks: "Quadruple", maxSpeedKmph: 130 },

  // Delhi - Mathura - Agra - Gwalior - Jhansi - Bhopal - Itarsi
  { id: "t-ndls-mtj", from: "ndls", to: "mtj", distanceKm: 141, electrified: true, tracks: "Triple", maxSpeedKmph: 160 },
  { id: "t-mtj-agc", from: "mtj", to: "agc", distanceKm: 54, electrified: true, tracks: "Triple", maxSpeedKmph: 160 },
  { id: "t-agc-gwl", from: "agc", to: "gwl", distanceKm: 118, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-gwl-jhs", from: "gwl", to: "jhs", distanceKm: 98, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-jhs-bina", from: "jhs", to: "bina", distanceKm: 153, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-bina-bpl", from: "bina", to: "bpl", distanceKm: 139, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-bpl-rtm", from: "bpl", to: "rtm", distanceKm: 240, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-rtm-brc", from: "rtm", to: "brc", distanceKm: 260, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-bpl-et", from: "bpl", to: "et", distanceKm: 92, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-et-ngp", from: "et", to: "ngp", distanceKm: 298, electrified: true, tracks: "Double", maxSpeedKmph: 130 },

  // Central Hub: Nagpur - Wardha - Kazipet - Secunderabad
  { id: "t-ngp-wr", from: "ngp", to: "wr", distanceKm: 79, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-wr-kzj", from: "wr", to: "kzj", distanceKm: 365, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-kzj-sc", from: "kzj", to: "sc", distanceKm: 132, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-kzj-wl", from: "kzj", to: "wl", distanceKm: 10, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-wl-bza", from: "wl", to: "bza", distanceKm: 207, electrified: true, tracks: "Double", maxSpeedKmph: 130 },

  // Eastern Central / Chhattisgarh
  { id: "t-et-jbp", from: "et", to: "jbp", distanceKm: 244, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-jbp-kte", from: "jbp", to: "kte", distanceKm: 91, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-kte-bsp", from: "kte", to: "bsp", distanceKm: 318, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-bsp-r", from: "bsp", to: "r", distanceKm: 111, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-r-durg", from: "r", to: "durg", distanceKm: 37, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-durg-ngp", from: "durg", to: "ngp", distanceKm: 265, electrified: true, tracks: "Double", maxSpeedKmph: 120 },

  // Maharashtra Links: Jalgaon, Manmad, Pune
  { id: "t-st-jl", from: "st", to: "jl", distanceKm: 243, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-jl-mmr", from: "jl", to: "mmr", distanceKm: 160, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-mmr-mmct", from: "mmr", to: "mmct", distanceKm: 250, electrified: true, tracks: "Triple", maxSpeedKmph: 120 },
  { id: "t-mmct-pune", from: "mmct", to: "pune", distanceKm: 192, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-pune-sur", from: "pune", to: "sur", distanceKm: 264, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-sur-wadi", from: "sur", to: "wadi", distanceKm: 150, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-wadi-sc", from: "wadi", to: "sc", distanceKm: 185, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-wadi-gtl", from: "wadi", to: "gtl", distanceKm: 228, electrified: true, tracks: "Double", maxSpeedKmph: 120 },

  // Konkan Railway (Mumbai - Ratnagiri - Madgaon - Karwar - Mangalore)
  { id: "t-mmct-rn", from: "mmct", to: "rn", distanceKm: 350, electrified: true, tracks: "Single", maxSpeedKmph: 120 },
  { id: "t-rn-mao", from: "rn", to: "mao", distanceKm: 230, electrified: true, tracks: "Single", maxSpeedKmph: 120 },
  { id: "t-mao-kawr", from: "mao", to: "kawr", distanceKm: 60, electrified: true, tracks: "Single", maxSpeedKmph: 110 },
  { id: "t-kawr-maq", from: "kawr", to: "maq", distanceKm: 240, electrified: true, tracks: "Single", maxSpeedKmph: 110 },
  { id: "t-maq-pgt", from: "maq", to: "pgt", distanceKm: 340, electrified: true, tracks: "Double", maxSpeedKmph: 110 },

  // Gangetic Main Line: Delhi -> Kanpur -> Lucknow / Allahabad -> Varanasi -> Patna -> Howrah
  { id: "t-ndls-cnb", from: "ndls", to: "cnb", distanceKm: 440, electrified: true, tracks: "Triple", maxSpeedKmph: 130 },
  { id: "t-mb-lko", from: "mb", to: "lko", distanceKm: 326, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-cnb-lko", from: "cnb", to: "lko", distanceKm: 72, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-cnb-ald", from: "cnb", to: "ald", distanceKm: 194, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-ald-bsb", from: "ald", to: "bsb", distanceKm: 124, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-bsb-ddu", from: "bsb", to: "ddu", distanceKm: 18, electrified: true, tracks: "Quadruple", maxSpeedKmph: 120 },
  { id: "t-ddu-gaya", from: "ddu", to: "gaya", distanceKm: 205, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-ddu-pnbe", from: "ddu", to: "pnbe", distanceKm: 211, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-pnbe-bju", from: "pnbe", to: "bju", distanceKm: 110, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-bju-kir", from: "bju", to: "kir", distanceKm: 180, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-kir-mldt", from: "kir", to: "mldt", distanceKm: 90, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-kir-njp", from: "kir", to: "njp", distanceKm: 195, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-njp-apdj", from: "njp", to: "apdj", distanceKm: 168, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-apdj-rny", from: "apdj", to: "rny", distanceKm: 210, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-rny-ghy", from: "rny", to: "ghy", distanceKm: 42, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-ghy-lmg", from: "ghy", to: "lmg", distanceKm: 181, electrified: true, tracks: "Single", maxSpeedKmph: 100 },
  { id: "t-lmg-dmv", from: "lmg", to: "dmv", distanceKm: 70, electrified: true, tracks: "Single", maxSpeedKmph: 100 },
  { id: "t-dmv-dbrt", from: "dmv", to: "dbrt", distanceKm: 310, electrified: true, tracks: "Single", maxSpeedKmph: 100 },

  // Eastern Chord to Kolkata
  { id: "t-gaya-asn", from: "gaya", to: "asn", distanceKm: 260, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-gaya-rnc", from: "gaya", to: "rnc", distanceKm: 220, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-rnc-kgp", from: "rnc", to: "kgp", distanceKm: 270, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-asn-dgr", from: "asn", to: "dgr", distanceKm: 43, electrified: true, tracks: "Quadruple", maxSpeedKmph: 130 },
  { id: "t-dgr-hwh", from: "dgr", to: "hwh", distanceKm: 157, electrified: true, tracks: "Quadruple", maxSpeedKmph: 130 },
  { id: "t-hwh-kgp", from: "hwh", to: "kgp", distanceKm: 115, electrified: true, tracks: "Triple", maxSpeedKmph: 130 },

  // East Coast Trunk: Howrah -> Cuttack -> Bhubaneswar -> Vizag -> Vijayawada -> Chennai
  { id: "t-kgp-ctc", from: "kgp", to: "ctc", distanceKm: 310, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-ctc-bbs", from: "ctc", to: "bbs", distanceKm: 28, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-bbs-vzm", from: "bbs", to: "vzm", distanceKm: 382, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-vzm-vskp", from: "vzm", to: "vskp", distanceKm: 61, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-vskp-rjy", from: "vskp", to: "rjy", distanceKm: 201, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-rjy-bza", from: "rjy", to: "bza", distanceKm: 149, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-bza-gnt", from: "bza", to: "gnt", distanceKm: 32, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-bza-mas", from: "bza", to: "mas", distanceKm: 431, electrified: true, tracks: "Double", maxSpeedKmph: 130 },

  // South Peninsula Connections (Chennai - Bangalore - Kerala)
  { id: "t-gtl-hx", from: "gtl", to: "hx", distanceKm: 185, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-hx-ru", from: "hx", to: "ru", distanceKm: 125, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-ru-mas", from: "ru", to: "mas", distanceKm: 137, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-mas-sbc", from: "mas", to: "sbc", distanceKm: 358, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-mas-vm", from: "mas", to: "vm", distanceKm: 159, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-vm-sa", from: "vm", to: "sa", distanceKm: 177, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-sbc-sa", from: "sbc", to: "sa", distanceKm: 200, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-sa-cbe", from: "sa", to: "cbe", distanceKm: 160, electrified: true, tracks: "Double", maxSpeedKmph: 120 },
  { id: "t-cbe-pgt", from: "cbe", to: "pgt", distanceKm: 55, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-pgt-tcr", from: "pgt", to: "tcr", distanceKm: 75, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-tcr-ers", from: "tcr", to: "ers", distanceKm: 74, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-ers-allp", from: "ers", to: "allp", distanceKm: 57, electrified: true, tracks: "Double", maxSpeedKmph: 100 },
  { id: "t-allp-qln", from: "allp", to: "qln", distanceKm: 85, electrified: true, tracks: "Double", maxSpeedKmph: 100 },
  { id: "t-qln-tvc", from: "qln", to: "tvc", distanceKm: 65, electrified: true, tracks: "Double", maxSpeedKmph: 110 },
  { id: "t-tvc-ncj", from: "tvc", to: "ncj", distanceKm: 66, electrified: true, tracks: "Double", maxSpeedKmph: 100 },
];

export function getStationById(id: string): RailwayStation | undefined {
  return STATIONS.find((s) => s.id === id);
}

// Graph-based shortest path route resolver
export function findRailwayRoute(sourceId: string, targetId: string): {
  stationIds: string[];
  totalDistanceKm: number;
  estDurationMinutes: number;
  popularTrains: string[];
  status: "Clear" | "High Traffic" | "Maintenance Alert" | "Speed Restricted";
} | null {
  if (sourceId === targetId) {
    return {
      stationIds: [sourceId],
      totalDistanceKm: 0,
      estDurationMinutes: 0,
      popularTrains: ["Local Shuttle"],
      status: "Clear",
    };
  }

  const adj = new Map<string, Array<{ to: string; distance: number }>>();
  for (const s of STATIONS) {
    adj.set(s.id, []);
  }

  for (const t of TRACKS) {
    adj.get(t.from)?.push({ to: t.to, distance: t.distanceKm });
    adj.get(t.to)?.push({ to: t.from, distance: t.distanceKm });
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const queue = new Set<string>();

  for (const s of STATIONS) {
    distances.set(s.id, Infinity);
    previous.set(s.id, null);
    queue.add(s.id);
  }

  distances.set(sourceId, 0);

  while (queue.size > 0) {
    let current: string | null = null;
    let minDist = Infinity;
    for (const st of queue) {
      const dist = distances.get(st)!;
      if (dist < minDist) {
        minDist = dist;
        current = st;
      }
    }

    if (!current || minDist === Infinity) break;
    if (current === targetId) break;

    queue.delete(current);

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!queue.has(neighbor.to)) continue;
      const alt = distances.get(current)! + neighbor.distance;
      if (alt < distances.get(neighbor.to)!) {
        distances.set(neighbor.to, alt);
        previous.set(neighbor.to, current);
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = targetId;
  while (curr) {
    path.unshift(curr);
    curr = previous.get(curr) || null;
  }

  if (path.length === 0 || path[0] !== sourceId) {
    return null;
  }

  const totalDistanceKm = distances.get(targetId) || 0;
  const estDurationMinutes = Math.round((totalDistanceKm / 85) * 60) + 20;

  const popularTrains: string[] = [];
  const src = getStationById(sourceId)?.name || "";
  const dst = getStationById(targetId)?.name || "";

  if ((sourceId === "ndls" && targetId === "mmct") || (sourceId === "mmct" && targetId === "ndls")) {
    popularTrains.push("12952 Mumbai Rajdhani", "12954 August Kranti Express", "22222 CSMT Rajdhani");
  } else if ((sourceId === "ndls" && targetId === "hwh") || (sourceId === "hwh" && targetId === "ndls")) {
    popularTrains.push("12302 Howrah Rajdhani", "22302 Vande Bharat Express", "12306 Poorva Express");
  } else if ((sourceId === "mas" && targetId === "sbc") || (sourceId === "sbc" && targetId === "mas")) {
    popularTrains.push("20607 Vande Bharat Express", "12007 Shatabdi Express", "12609 Intercity");
  } else if ((sourceId === "ndls" && targetId === "bsb") || (sourceId === "bsb" && targetId === "ndls")) {
    popularTrains.push("22436 Vande Bharat Express", "12560 Shiv Ganga Express");
  } else if ((sourceId === "mmct" && targetId === "mao") || (sourceId === "mao" && targetId === "mmct")) {
    popularTrains.push("22229 Vande Bharat Express", "12051 Jan Shatabdi Express", "10103 Mandovi Express");
  } else {
    popularTrains.push(`${src} – ${dst} Superfast Express`, `${src} – ${dst} Vande Bharat`);
  }

  return {
    stationIds: path,
    totalDistanceKm,
    estDurationMinutes,
    popularTrains,
    status: totalDistanceKm > 1000 ? "High Traffic" : "Clear",
  };
}
