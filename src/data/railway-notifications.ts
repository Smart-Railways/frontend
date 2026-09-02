export interface RailwayNotification {
  id: string;
  title: string;
  description: string;
  category: "critical" | "maintenance" | "advisory" | "operational";
  severity: "critical" | "high" | "medium" | "low";
  timestamp: string;
  corridorOrStation: string;
  stationId?: string;
  isRead?: boolean;
}

export const INITIAL_NOTIFICATIONS: RailwayNotification[] = [
  {
    id: "notif-1",
    title: "Track Maintenance Block",
    description: "Scheduled ballast cleaning & overhead wire maintenance on Up Line. Minor delay expected for superfast rakes.",
    category: "maintenance",
    severity: "high",
    timestamp: "10 mins ago",
    corridorOrStation: "Kanpur – Prayagraj",
    stationId: "cnb",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "Caution Order / Speed Restriction",
    description: "Temporary speed restriction (30 km/h) enforced on bridge approach due to monsoon track assessment.",
    category: "critical",
    severity: "critical",
    timestamp: "24 mins ago",
    corridorOrStation: "Surat – Mumbai Central",
    stationId: "st",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Signal Clearance Confirmed",
    description: "Automatic Block Signaling restored between Ghaziabad and Meerut. Line clear for Vande Bharat Express.",
    category: "operational",
    severity: "low",
    timestamp: "45 mins ago",
    corridorOrStation: "New Delhi – Meerut",
    stationId: "ndls",
    isRead: false,
  },
  {
    id: "notif-4",
    title: "Platform Congestion Advisory",
    description: "Heavy passenger movement and simultaneous arrivals on Platforms 8 to 12. Staging delayed for 15 mins.",
    category: "advisory",
    severity: "medium",
    timestamp: "1 hour ago",
    corridorOrStation: "Howrah Junction",
    stationId: "hwh",
    isRead: true,
  },
  {
    id: "notif-5",
    title: "Loco Power Block Window",
    description: "OHE power block approved between 01:30 AM to 04:30 AM for pantograph inspection.",
    category: "maintenance",
    severity: "medium",
    timestamp: "2 hours ago",
    corridorOrStation: "Bhopal – Nagpur",
    stationId: "bpl",
    isRead: true,
  },
];
