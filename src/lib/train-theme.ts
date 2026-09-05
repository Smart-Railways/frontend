import { TrainType, TRAIN_TYPE_LABELS } from "@/enums";

export interface TrainTypeTheme {
  typeKey: TrainType | string;
  displayName: string;
  badge: string;
  accentBg: string;
  textColor: string;
  lineColor: string;
  borderColor: string;
  lightBg: string;
  iconColor: string;
}

export function getTrainTypeTheme(trainType?: string, trainName?: string): TrainTypeTheme {
  const t = (trainType || "").toUpperCase();
  const n = (trainName || "").toUpperCase();

  if (t.includes(TrainType.RAJDHANI) || n.includes(TrainType.RAJDHANI)) {
    return {
      typeKey: TrainType.RAJDHANI,
      displayName: `${TRAIN_TYPE_LABELS[TrainType.RAJDHANI]} Express`,
      badge: "bg-red-50 text-red-700 border-red-200 font-bold",
      accentBg: "bg-red-500",
      textColor: "text-red-700",
      lineColor: "bg-red-600",
      borderColor: "border-r-4 border-r-red-600",
      lightBg: "bg-red-50/50",
      iconColor: "text-red-600",
    };
  }

  if (t.includes(TrainType.SHATABDI) || n.includes(TrainType.SHATABDI)) {
    return {
      typeKey: TrainType.SHATABDI,
      displayName: `${TRAIN_TYPE_LABELS[TrainType.SHATABDI]} Express`,
      badge: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
      accentBg: "bg-blue-600",
      textColor: "text-blue-700",
      lineColor: "bg-blue-600",
      borderColor: "border-r-4 border-r-blue-600",
      lightBg: "bg-blue-50/50",
      iconColor: "text-blue-600",
    };
  }

  if (t.includes("TEJAS") || n.includes("TEJAS")) {
    return {
      typeKey: "TEJAS",
      displayName: "Tejas Express",
      badge: "bg-sky-50 text-sky-700 border-sky-200 font-bold",
      accentBg: "bg-sky-600",
      textColor: "text-sky-700",
      lineColor: "bg-sky-600",
      borderColor: "border-r-4 border-r-sky-600",
      lightBg: "bg-sky-50/50",
      iconColor: "text-sky-600",
    };
  }

  if (
    t.includes(TrainType.VB) ||
    t.includes("VANDE BHARAT") ||
    n.includes("VANDE BHARAT") ||
    n.includes(TrainType.VB)
  ) {
    return {
      typeKey: TrainType.VB,
      displayName: TRAIN_TYPE_LABELS[TrainType.VB],
      badge: "bg-slate-100 text-slate-800 border-slate-300 font-bold",
      accentBg: "bg-slate-700",
      textColor: "text-slate-800",
      lineColor: "bg-slate-700",
      borderColor: "border-r-4 border-r-slate-700",
      lightBg: "bg-slate-100/60",
      iconColor: "text-slate-700",
    };
  }

  if (t.includes(TrainType.EXPRESS) || t.includes("SUPERFAST") || t.includes("SF")) {
    return {
      typeKey: TrainType.EXPRESS,
      displayName: "Superfast / Express",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold",
      accentBg: "bg-emerald-600",
      textColor: "text-emerald-700",
      lineColor: "bg-emerald-600",
      borderColor: "border-r-4 border-r-emerald-600",
      lightBg: "bg-emerald-50/50",
      iconColor: "text-emerald-600",
    };
  }

  if (t.includes(TrainType.FREIGHT) || t.includes("GOODS")) {
    return {
      typeKey: TrainType.FREIGHT,
      displayName: `${TRAIN_TYPE_LABELS[TrainType.FREIGHT]} Cargo`,
      badge: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
      accentBg: "bg-amber-600",
      textColor: "text-amber-700",
      lineColor: "bg-amber-500",
      borderColor: "border-r-4 border-r-amber-500",
      lightBg: "bg-amber-50/50",
      iconColor: "text-amber-600",
    };
  }

  return {
    typeKey: TrainType.PASSENGER,
    displayName: `${TRAIN_TYPE_LABELS[TrainType.PASSENGER]} / General`,
    badge: "bg-slate-100 text-slate-700 border-slate-200 font-bold",
    accentBg: "bg-slate-500",
    textColor: "text-slate-700",
    lineColor: "bg-slate-400",
    borderColor: "border-r-4 border-r-slate-400",
    lightBg: "bg-slate-50",
    iconColor: "text-slate-500",
  };
}
