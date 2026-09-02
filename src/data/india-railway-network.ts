export interface RailwayStation {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  lat: number;
  lng: number;
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

export interface RailwayCorridorPreset {
  id: string;
  name: string;
  sourceId: string;
  targetId: string;
  distanceKm: number;
  zone: string;
  tag: string;
  isBackendSection?: boolean;
  backendSectionId?: number;
}

// Strictly the 11 designated Corridor Cities
export const STATIONS: RailwayStation[] = [
  { id: "ndls", code: "NDLS", name: "NEW DELHI", city: "New Delhi", state: "Delhi", zone: "NR", lat: 28.6143, lng: 77.2197, platforms: 16, isHub: true, isCapital: true },
  { id: "mtj", code: "MTJ", name: "MATHURA", city: "Mathura", state: "Uttar Pradesh", zone: "NCR", lat: 27.4924, lng: 77.6737, platforms: 8, isHub: true },
  { id: "agc", code: "AGC", name: "AGRA", city: "Agra", state: "Uttar Pradesh", zone: "NCR", lat: 27.1767, lng: 78.0081, platforms: 6, isHub: true },
  { id: "gwl", code: "GWL", name: "GWALIOR", city: "Gwalior", state: "Madhya Pradesh", zone: "NCR", lat: 26.2183, lng: 78.1828, platforms: 5, isHub: true },
  { id: "jhs", code: "VGLJ", name: "JHANSI", city: "Jhansi", state: "Uttar Pradesh", zone: "NCR", lat: 25.4484, lng: 78.5685, platforms: 8, isHub: true },
  { id: "bina", code: "BINA", name: "BINA", city: "Bina", state: "Madhya Pradesh", zone: "WCR", lat: 24.1750, lng: 78.1830, platforms: 5, isHub: true },
  { id: "bpl", code: "BPL", name: "BHOPAL", city: "Bhopal", state: "Madhya Pradesh", zone: "WCR", lat: 23.2599, lng: 77.4126, platforms: 6, isHub: true },
  { id: "rtm", code: "RTM", name: "RATLAM", city: "Ratlam", state: "Madhya Pradesh", zone: "WR", lat: 23.3315, lng: 75.0367, platforms: 7, isHub: true },
  { id: "brc", code: "BRC", name: "VADODARA", city: "Vadodara", state: "Gujarat", zone: "WR", lat: 22.3072, lng: 73.1812, platforms: 7, isHub: true },
  { id: "st", code: "ST", name: "SURAT", city: "Surat", state: "Gujarat", zone: "WR", lat: 21.1702, lng: 72.8311, platforms: 6, isHub: true },
  { id: "mmct", code: "MMCT", name: "MUMBAI", city: "Mumbai", state: "Maharashtra", zone: "WR", lat: 18.9696, lng: 72.8193, platforms: 18, isHub: true },
];

// Linear & Connected Railway Tracks between the 11 Cities
export const TRACKS: RailwayTrack[] = [
  { id: "t-ndls-mtj", from: "ndls", to: "mtj", distanceKm: 140, electrified: true, tracks: "Quadruple", maxSpeedKmph: 160 },
  { id: "t-mtj-agc", from: "mtj", to: "agc", distanceKm: 54, electrified: true, tracks: "Triple", maxSpeedKmph: 160 },
  { id: "t-agc-gwl", from: "agc", to: "gwl", distanceKm: 118, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-gwl-jhs", from: "gwl", to: "jhs", distanceKm: 98, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-jhs-bina", from: "jhs", to: "bina", distanceKm: 153, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-bina-bpl", from: "bina", to: "bpl", distanceKm: 139, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-bpl-rtm", from: "bpl", to: "rtm", distanceKm: 260, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-mtj-rtm", from: "mtj", to: "rtm", distanceKm: 590, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-rtm-brc", from: "rtm", to: "brc", distanceKm: 260, electrified: true, tracks: "Double", maxSpeedKmph: 130 },
  { id: "t-brc-st", from: "brc", to: "st", distanceKm: 129, electrified: true, tracks: "Quadruple", maxSpeedKmph: 130 },
  { id: "t-st-mmct", from: "st", to: "mmct", distanceKm: 259, electrified: true, tracks: "Quadruple", maxSpeedKmph: 130 },
];

// Available Corridors formed by the 11 cities
export const AVAILABLE_CORRIDORS: RailwayCorridorPreset[] = [
  {
    id: "corr-ndls-mmct",
    name: "New Delhi — Mumbai Complete Corridor",
    sourceId: "ndls",
    targetId: "mmct",
    distanceKm: 1384,
    zone: "Northern / NCR / WCR / WR",
    tag: "Primary Super Corridor (11 Cities)",
  },
  {
    id: "corr-st-mmct",
    name: "Surat — Mumbai Section",
    sourceId: "st",
    targetId: "mmct",
    distanceKm: 259,
    zone: "Western Railway",
    tag: "High Density Western Link",
    isBackendSection: true,
  },
  {
    id: "corr-ndls-mtj",
    name: "New Delhi — Mathura Section",
    sourceId: "ndls",
    targetId: "mtj",
    distanceKm: 140,
    zone: "Northern / NCR",
    tag: "Semi-High Speed Section",
    isBackendSection: true,
  },
  {
    id: "corr-mtj-agc",
    name: "Mathura — Agra Section",
    sourceId: "mtj",
    targetId: "agc",
    distanceKm: 54,
    zone: "North Central",
    tag: "Gatimaan Test Section",
    isBackendSection: true,
  },
  {
    id: "corr-agc-gwl",
    name: "Agra — Gwalior Section",
    sourceId: "agc",
    targetId: "gwl",
    distanceKm: 118,
    zone: "North Central",
    tag: "Central Link Section",
    isBackendSection: true,
  },
  {
    id: "corr-gwl-jhs",
    name: "Gwalior — Jhansi Section",
    sourceId: "gwl",
    targetId: "jhs",
    distanceKm: 98,
    zone: "North Central",
    tag: "NCR Section",
    isBackendSection: true,
  },
  {
    id: "corr-jhs-bina",
    name: "Jhansi — Bina Section",
    sourceId: "jhs",
    targetId: "bina",
    distanceKm: 153,
    zone: "NCR / WCR",
    tag: "Bundelkhand Section",
    isBackendSection: true,
  },
  {
    id: "corr-bina-bpl",
    name: "Bina — Bhopal Section",
    sourceId: "bina",
    targetId: "bpl",
    distanceKm: 139,
    zone: "West Central",
    tag: "Madhya Pradesh Central",
    isBackendSection: true,
  },
  {
    id: "corr-bpl-rtm",
    name: "Bhopal — Ratlam Section",
    sourceId: "bpl",
    targetId: "rtm",
    distanceKm: 260,
    zone: "WCR / WR",
    tag: "Malwa Express Corridor",
    isBackendSection: true,
  },
  {
    id: "corr-rtm-brc",
    name: "Ratlam — Vadodara Section",
    sourceId: "rtm",
    targetId: "brc",
    distanceKm: 260,
    zone: "Western Railway",
    tag: "Gujarat-MP Section",
    isBackendSection: true,
  },
  {
    id: "corr-brc-st",
    name: "Vadodara — Surat Section",
    sourceId: "brc",
    targetId: "st",
    distanceKm: 129,
    zone: "Western Railway",
    tag: "Gujarat Industrial Section",
    isBackendSection: true,
  },
  {
    id: "corr-ndls-bpl",
    name: "New Delhi — Bhopal Section",
    sourceId: "ndls",
    targetId: "bpl",
    distanceKm: 702,
    zone: "NR / NCR / WCR",
    tag: "Shatabdi Trunk Route",
  },
  {
    id: "corr-bpl-mmct",
    name: "Bhopal — Mumbai Section",
    sourceId: "bpl",
    targetId: "mmct",
    distanceKm: 828,
    zone: "WCR / WR",
    tag: "Central-Western Route",
  },
];

export function getStationById(id: string): RailwayStation | undefined {
  if (!id) return undefined;
  const clean = id.trim().toLowerCase();
  return STATIONS.find(
    (s) => s.id === clean || s.code.toLowerCase() === clean
  );
}

export function getStationByName(name: string): RailwayStation | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return STATIONS.find(
    (s) =>
      s.name.toLowerCase().includes(clean) ||
      s.city.toLowerCase().includes(clean) ||
      s.code.toLowerCase() === clean ||
      clean.includes(s.name.toLowerCase()) ||
      clean.includes(s.city.toLowerCase())
  );
}

// Graph-based shortest path route resolver across the 11 cities
export function findRailwayRoute(sourceId: string, targetId: string): {
  stationIds: string[];
  totalDistanceKm: number;
  estDurationMinutes: number;
  popularTrains: string[];
  status: "Clear" | "High Traffic" | "Maintenance Alert" | "Speed Restricted";
  geoCoordinates: [number, number][];
} | null {
  if (!sourceId || !targetId) return null;

  if (sourceId === targetId) {
    const st = getStationById(sourceId);
    return {
      stationIds: [sourceId],
      totalDistanceKm: 0,
      estDurationMinutes: 0,
      popularTrains: ["Local Shuttle"],
      status: "Clear",
      geoCoordinates: st ? [[st.lat, st.lng]] : [],
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
  const estDurationMinutes = Math.round((totalDistanceKm / 85) * 60) + 15;

  const popularTrains: string[] = [];
  const src = getStationById(sourceId)?.name || "";
  const dst = getStationById(targetId)?.name || "";

  if ((sourceId === "st" && targetId === "mmct") || (sourceId === "mmct" && targetId === "st")) {
    popularTrains.push("12952 Mumbai Rajdhani", "20902 Vande Bharat Express", "12926 Paschim Express", "12010 Shatabdi Express");
  } else if ((sourceId === "ndls" && targetId === "mmct") || (sourceId === "mmct" && targetId === "ndls")) {
    popularTrains.push("12952 Mumbai Rajdhani", "12954 August Kranti Rajdhani", "22222 CSMT Rajdhani", "20902 Vande Bharat");
  } else if ((sourceId === "ndls" && targetId === "mtj") || (sourceId === "mtj" && targetId === "ndls")) {
    popularTrains.push("12002 Bhopal Shatabdi", "12050 Gatimaan Express", "22436 Vande Bharat");
  } else if ((sourceId === "ndls" && targetId === "bpl") || (sourceId === "bpl" && targetId === "ndls")) {
    popularTrains.push("12002 Bhopal Shatabdi", "20172 Vande Bharat Express", "12616 Grand Trunk Express");
  } else {
    popularTrains.push(`${src} – ${dst} Superfast Express`, `${src} – ${dst} Vande Bharat`);
  }

  const geoCoordinates: [number, number][] = path
    .map((id) => getStationById(id))
    .filter((s): s is RailwayStation => Boolean(s))
    .map((s) => [s.lat, s.lng]);

  return {
    stationIds: path,
    totalDistanceKm,
    estDurationMinutes,
    popularTrains,
    status: totalDistanceKm > 800 ? "High Traffic" : "Clear",
    geoCoordinates,
  };
}
