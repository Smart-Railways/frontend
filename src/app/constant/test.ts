export const MOCK_MAINTENANCE_TASKS = [
  {
    id: "mock-1",
    task_code: "TMS-MOCK-001",
    task_status: "ACTIVE",
    section_name: "New Delhi - Mathura",
    target_asset: "Track Segment",

    // Fields required by IndiaLeafletMap
    asset_name: "Track Segment",
    details: "Track maintenance is currently in progress.",
    estimated_duration: 60,
    urgency: "HIGH",

    deadline: "2026-09-20T10:00:00",
  },

  {
    id: "mock-2",
    task_code: "TMS-MOCK-002",
    task_status: "SCHEDULED",
    section_name: "Mathura - Agra",
    target_asset: "Signal & Interlocking",

    asset_name: "Signal & Interlocking",
    details: "Signal maintenance is scheduled.",
    estimated_duration: 90,
    urgency: "MEDIUM",

    deadline: "2026-09-22T10:00:00",
  },

  {
    id: "mock-3",
    task_code: "TMS-MOCK-003",
    task_status: "SCHEDULED",
    section_name: "Gwalior - Jhansi",
    target_asset: "OHE Section",

    asset_name: "OHE Section",
    details: "OHE inspection and maintenance is scheduled.",
    estimated_duration: 120,
    urgency: "LOW",

    deadline: "2026-09-25T10:00:00",
  },
];

export const MOCK_SECTIONS = [
  {
    id: "mock-section-1",
    section_name: "New Delhi - Mathura",
    source_station_code: "NDLS",
    destination_station_code: "MTJ",
    origin_station: "New Delhi",
    end_station: "Mathura",
  },

  {
    id: "mock-section-2",
    section_name: "Mathura - Agra",
    source_station_code: "MTJ",
    destination_station_code: "AGC",
    origin_station: "Mathura",
    end_station: "Agra",
  },

  {
    id: "mock-section-3",
    section_name: "Gwalior - Jhansi",
    source_station_code: "GWL",
    destination_station_code: "JHS",
    origin_station: "Gwalior",
    end_station: "Jhansi",
  },
];