"use client";

import React, { useState, useMemo } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import { LiveClock } from "@/components/ui/live-clock";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Layers,
  AlertTriangle,
  Radio,
  Zap,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAssets,
  useRailwaySections,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
} from "@/hooks";
import { Asset, CreateAssetInput } from "@/types";
import {
  AssetDepartment,
  ASSET_DEPARTMENT_OPTIONS,
  ASSET_DEPARTMENT_LABELS,
  AssetCategory,
  ASSET_CATEGORY_LABELS,
} from "@/enums";
import { formatDateToISO } from "@/lib/time-utils";
import { AssetsPageSkeleton } from "./skeletons";

// Category options helper derived directly from AssetCategory enum and labels
const ASSET_CATEGORIES = Object.values(AssetCategory).map((cat) => ({
  value: cat,
  label: ASSET_CATEGORY_LABELS[cat] || cat,
}));

// Division options helper
const DIVISIONS: { value: AssetDepartment; label: string; desc: string; color: string }[] = [
  {
    value: AssetDepartment.SNT,
    label: "S&T (Signals & Telecom)",
    desc: "Track circuits, signals, points, axle counters",
    color: "bg-brand-primary text-white border-transparent",
  },
  {
    value: AssetDepartment.ENGINEERING,
    label: "Engineering (Civil / Track)",
    desc: "Rails, sleepers, turnouts, track beds",
    color: "bg-brand-primary text-white border-transparent",
  },
  {
    value: AssetDepartment.TRACTION,
    label: "Traction (Electrical / OHE)",
    desc: "OHE lines, substations, transformers",
    color: "bg-brand-primary text-white border-transparent",
  },
];

// Get Risk Level Badge styling
function getRiskBadge(level: number) {
  if (level >= 8) {
    return {
      bg: "bg-red-600 border-transparent text-white",
      dot: "bg-white animate-pulse",
      label: "Critical Risk",
    };
  }
  if (level >= 6) {
    return {
      bg: "bg-orange-500 border-transparent text-white",
      dot: "bg-white",
      label: "High Risk",
    };
  }
  if (level >= 4) {
    return {
      bg: "bg-amber-500 border-transparent text-white",
      dot: "bg-white",
      label: "Moderate",
    };
  }
  return {
    bg: "bg-emerald-600 border-transparent text-white",
    dot: "bg-white",
    label: "Low Risk",
  };
}

// Format date nicely
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}



export default function AssetsPage() {
  const [activeNavTab, setActiveNavTab] = useState<string>("assets");

  const {
    data: assets = [],
    isLoading: loadingAssets,
    isRefetching: refetchingAssets,
    refetch: refetchAssets,
  } = useAssets();

  const {
    data: sections = [],
    isLoading: loadingSections,
    refetch: refetchSections,
  } = useRailwaySections();

  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  // Gate: show full-page skeleton until every first-load fetch resolves
  const isPageLoading = loadingAssets || loadingSections;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("ALL");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [minRiskFilter, setMinRiskFilter] = useState<number>(0);

  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => { setToastMessage(null); }, 4000);
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [inspectingAsset, setInspectingAsset] = useState<Asset | null>(null);

  const [formData, setFormData] = useState<CreateAssetInput>({
    section: 1,
    asset_title: "",
    category: AssetCategory.TRACK_CIRCUIT,
    division: AssetDepartment.SNT,
    risk_level: 5,
    setup_date: new Date().toISOString().split("T")[0],
  });

  const handleOpenCreateModal = () => {
    setEditingAsset(null);
    setFormData({
      section: sections.length > 0 ? sections[0].id : 1,
      asset_title: "",
      category: AssetCategory.TRACK_CIRCUIT,
      division: AssetDepartment.SNT,
      risk_level: 5,
      setup_date: new Date().toISOString().split("T")[0],
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      section: asset.section,
      asset_title: asset.asset_title,
      category: asset.category,
      division: (asset.division as AssetDepartment) || AssetDepartment.SNT,
      risk_level: asset.risk_level,
      setup_date: asset.setup_date ? asset.setup_date.substring(0, 10) : new Date().toISOString().split("T")[0],
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.asset_title.trim()) { showToast("error", "Asset Title is required."); return; }
    if (!formData.section) { showToast("error", "Please select a railway section."); return; }

    if (editingAsset) {
      updateAssetMutation.mutate(
        { id: editingAsset.id, data: formData },
        {
          onSuccess: (updated) => {
            setIsCreateModalOpen(false);
            setEditingAsset(null);
            showToast("success", `Asset "${updated?.asset_title || editingAsset.asset_title}" updated successfully.`);
          },
          onError: (err) => { showToast("error", err instanceof Error ? err.message : "Failed to update asset."); },
        }
      );
    } else {
      createAssetMutation.mutate(formData, {
        onSuccess: (created) => {
          setIsCreateModalOpen(false);
          showToast("success", `Asset "${created?.asset_title || formData.asset_title}" created successfully.`);
        },
        onError: (err) => { showToast("error", err instanceof Error ? err.message : "Failed to create asset."); },
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return;
    deleteAssetMutation.mutate(deletingAsset.id, {
      onSuccess: () => {
        showToast("success", `Asset "${deletingAsset.asset_title}" deleted successfully.`);
        setDeletingAsset(null);
      },
      onError: (err) => { showToast("error", err instanceof Error ? err.message : "Failed to delete asset."); },
    });
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.asset_title?.toLowerCase().includes(q) && !String(item.id).includes(q)) return false;
      }
      if (selectedSectionFilter !== "ALL" && String(item.section) !== selectedSectionFilter) return false;
      if (selectedDivisionFilter !== "ALL" && item.division !== selectedDivisionFilter) return false;
      if (selectedCategoryFilter !== "ALL" && item.category !== selectedCategoryFilter) return false;
      if (item.risk_level < minRiskFilter) return false;
      return true;
    });
  }, [assets, searchQuery, selectedSectionFilter, selectedDivisionFilter, selectedCategoryFilter, minRiskFilter]);

  const stats = useMemo(() => {
    return {
      total: assets.length,
      criticalRiskCount: assets.filter((a) => a.risk_level >= 7).length,
      sntCount: assets.filter((a) => a.division === AssetDepartment.SNT).length,
      engCount: assets.filter((a) => a.division === AssetDepartment.ENGINEERING).length,
      tractionCount: assets.filter((a) => a.division === AssetDepartment.TRACTION).length,
    };
  }, [assets]);

  const isSaving = createAssetMutation.isPending || updateAssetMutation.isPending;
  const isDeleting = deleteAssetMutation.isPending;

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-brand-tertiary flex flex-col font-sans">
        <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />
        <AssetsPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />
      <div className="flex-1 flex pl-0 lg:pl-64 pt-14 lg:pt-0">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-5 max-w-[1600px] mx-auto w-full">
          {toastMessage && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all animate-in fade-in slide-in-from-top-3 ${toastMessage.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
              {toastMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
              <span className="text-xs font-bold">{toastMessage.text}</span>
              <button onClick={() => setToastMessage(null)} className="text-brand-muted hover:text-brand-secondary text-xs ml-2 font-bold cursor-pointer">✕</button>
            </div>
          )}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-brand-border/80">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-secondary/80 text-brand-tertiary">
                  <Building2 className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-brand-secondary tracking-tight">Railway Asset Inventory & Management</h1>
              </div>
              <p className="text-xs text-brand-muted mt-2 font-medium">Operations for railway assets, risk assessments, division assignments, and corridor mapping.</p>
            </div>
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
              <LiveClock />
            
            </div>
          </header>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-brand-tertiary flex items-center justify-center flex-shrink-0 mt-0.5"><Building2 className="w-4 h-4" /></div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">Total Assets</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.total}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Across all sections</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full  bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5"><AlertTriangle className="w-4 h-4" /></div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">High Risk Assets</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-black tracking-tight">{stats.criticalRiskCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Risk score ≥ 7 / 10</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5"><Radio className="w-4 h-4" /></div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">S&T Division</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.sntCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Signals & Telecom</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5"><Layers className="w-4 h-4" /></div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">Civil Engineering</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.engCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Tracks & Turnouts</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-secondary/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5"><Zap className="w-4 h-4" /></div>
              <div>
                <div className="text-xs font-bold text-brand-muted mb-0.5">Traction / OHE</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.tractionCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Electrical Grid</div>
              </div>
            </div>
          </section>
          <section className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input type="text" placeholder="Search asset title, ID, section..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-xs text-brand-secondary placeholder:text-brand-muted rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors font-medium shadow-2xs" />
              </div>
              <div className="md:col-span-4">
                <Select value={selectedSectionFilter} onValueChange={(val) => val && setSelectedSectionFilter(val)}>
                  <SelectTrigger className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs cursor-pointer">
                    <SelectValue placeholder="All Railway Sections" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-xl rounded-xl p-1.5">
                    <SelectItem value="ALL" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      All Railway Sections
                    </SelectItem>
                    {sections.map((sec) => (
                      <SelectItem key={sec.id} value={String(sec.id)} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                        {sec.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-4">
                <Select value={selectedCategoryFilter} onValueChange={(val) => val && setSelectedCategoryFilter(val)}>
                  <SelectTrigger className="w-full bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs cursor-pointer">
                    <SelectValue placeholder="All Asset Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-xl rounded-xl p-1.5">
                    <SelectItem value="ALL" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                      All Asset Categories
                    </SelectItem>
                    {ASSET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-brand-border/60">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none min-w-0">
                <span className="text-xs font-bold text-brand-muted mr-1 shrink-0">Division:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 py-0.5">
                  {[
                    { key: "ALL", label: "All Divisions" },
                    { key: AssetDepartment.SNT, label: "S&T" },
                    { key: AssetDepartment.ENGINEERING, label: "Civil Track" },
                    { key: AssetDepartment.TRACTION, label: "Electrical / OHE" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setSelectedDivisionFilter(item.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        selectedDivisionFilter === item.key
                          ? "bg-brand-primary text-white shadow-xs"
                          : "text-brand-muted hover:text-brand-secondary hover:bg-brand-tertiary"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-brand-secondary font-bold shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                  <span className="text-brand-muted whitespace-nowrap">Min Risk:</span>
                </div>
                <Select value={String(minRiskFilter)} onValueChange={(val) => setMinRiskFilter(Number(val))}>
                  <SelectTrigger className="bg-brand-surface border border-brand-border hover:border-brand-primary/50 text-brand-secondary text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer font-bold shadow-2xs min-w-[130px]">
                    <SelectValue placeholder="All Levels (0+)" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-surface border-brand-border text-brand-secondary max-h-60 overflow-y-auto shadow-xl rounded-xl p-1.5">
                    <SelectItem value="0" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">All Levels (0+)</SelectItem>
                    <SelectItem value="4" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">Medium+ (4+)</SelectItem>
                    <SelectItem value="6" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">High+ (6+)</SelectItem>
                    <SelectItem value="8" className="rounded-lg px-3 py-2 text-xs font-medium cursor-pointer focus:bg-brand-blue-light/50 focus:text-brand-primary">Critical Only (8+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
     
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface">
              <div className="flex flex-col justify-center">
                <h2 className="text-sm font-bold text-brand-secondary flex items-center gap-2">
                  <span>Tracked Infrastructure Assets</span>
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-medium">Railway network equipment, health scores, and division ownership</p>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                <button
                  onClick={() => {
                    refetchAssets();
                    refetchSections();
                  }}
                  disabled={refetchingAssets || loadingAssets}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-secondary text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-60 whitespace-nowrap"
                  title="Refresh Assets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refetchingAssets ? "animate-spin" : ""}`} />
                  <span>{refetchingAssets ? "Refreshing..." : "Refresh"}</span>
                </button>
                <button
                  onClick={handleOpenCreateModal}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Railway Asset</span>
                </button>
              </div>
            </div>
            {(loadingAssets || loadingSections || refetchingAssets) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead className="bg-brand-surface text-brand-muted font-semibold border-b border-brand-border text-[10px] lg:text-[12px]">
                    <tr>
                      <th className="py-3 px-4 text-center">ID</th>
                      <th className="py-3 px-4 text-center">Asset Title</th>
                      <th className="py-3 px-4 text-center">Category</th>
                      <th className="py-3 px-4 text-center">Section</th>
                      <th className="py-3 px-4 text-center">Risk Level</th>
                      <th className="py-3 px-4 text-center">Setup Date</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <Skeleton className="h-4 w-8 mx-auto" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2.5">
                            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-2.5 w-16" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-5 w-20 mx-auto rounded-md" />
                        </td>
                        <td className="py-3.5 px-4">
                          <Skeleton className="h-4 w-28 mx-auto rounded" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Skeleton className="h-5 w-14 rounded-md" />
                            <Skeleton className="h-3 w-12 rounded" />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                            <Skeleton className="h-3.5 w-20 rounded" />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Skeleton className="w-7 h-7 rounded-lg" />
                            <Skeleton className="w-7 h-7 rounded-lg" />
                            <Skeleton className="w-7 h-7 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="py-16 text-center text-brand-muted">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Building2 className="w-10 h-10 text-brand-muted opacity-60" />
                  <div className="text-sm font-bold text-brand-secondary">No matching assets found</div>
                  <button
                    onClick={handleOpenCreateModal}
                    className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Asset
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead className="bg-brand-surface text-brand-muted font-semibold border-b border-brand-border text-xs">
                    <tr>
                      <th className="py-3 px-4 text-center">ID</th>
                      <th className="py-3 px-4 text-center">Asset Title</th>
                      <th className="py-3 px-4 text-center">Category</th>
                      <th className="py-3 px-4 text-center">Section</th>
                      <th className="py-3 px-4 text-center">Risk Level</th>
                      <th className="py-3 px-4 text-center">Setup Date</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60 text-brand-secondary">
                    {filteredAssets.map((asset) => {
                      const risk = getRiskBadge(asset.risk_level);
                      return (
                        <tr key={asset.id} className="hover:bg-brand-tertiary/60 transition-colors group">
                          <td className="py-3.5 px-4 font-mono font-bold text-brand-muted text-center">#{asset.id}</td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2.5">
                              <div>
                                <div className="font-semibold text-brand-secondary text-sm">{asset.asset_title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-brand-tertiary border border-brand-border text-brand-secondary">
                              {asset.category.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="text-brand-secondary font-semibold">
                              {asset.section_name || `Section #${asset.section}`}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${risk.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`}></span>
                                {asset.risk_level}/10
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-brand-secondary text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Calendar className="w-3 h-3 text-brand-muted" />
                              <span>{formatDate(asset.setup_date)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setInspectingAsset(asset)}
                                className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-black shadow-xs transition-colors cursor-pointer"
                                title="Inspect"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(asset)}
                                className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary shadow-xs transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingAsset(asset)}
                                className="p-1.5 rounded-lg bg-brand-surface hover:bg-red-50 border border-brand-border hover:border-red-200 text-red-600 shadow-xs transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-brand-tertiary">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">
                    {editingAsset ? `Edit Asset #${editingAsset.id}` : "Create New Railway Asset"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-brand-secondary block mb-1">
                  Asset Title / Identification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.asset_title}
                  onChange={(e) => setFormData({ ...formData, asset_title: e.target.value })}
                  required
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs"
                />
              </div>
              <div>
                <label className="font-extrabold text-brand-secondary block mb-1">
                  Corridor Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: Number(e.target.value) })}
                  required
                  className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs"
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.section_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Department Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) =>
                      setFormData({ ...formData, division: e.target.value as AssetDepartment })
                    }
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs"
                  >
                    {ASSET_DEPARTMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} ({opt.displayLabel})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Asset Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs"
                  >
                    {ASSET_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-extrabold text-brand-secondary">Risk Level (1 - 10)</label>
                    <span className="font-mono font-black text-brand-primary">{formData.risk_level} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: Number(e.target.value) })}
                    className="w-full accent-brand-primary cursor-pointer h-2 bg-brand-tertiary rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-brand-secondary block mb-1">
                    Setup / Commission Date
                  </label>
                  <input
                    type="date"
                    value={formData.setup_date || ""}
                    max={formatDateToISO(new Date())}
                    onChange={(e) => {
                      const val = e.target.value;
                      const today = formatDateToISO(new Date());
                      if (val > today) return;
                      setFormData({ ...formData, setup_date: val });
                    }}
                    className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2 outline-none font-bold shadow-2xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingAsset ? "Update Asset" : "Create Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-secondary/80 text-brand-tertiary flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-brand-secondary">{inspectingAsset.asset_title}</h3>
                  <span className="text-xs text-brand-muted">Asset ID #{inspectingAsset.id}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectingAsset(null)}
                className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Category</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{inspectingAsset.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Division</span>
                <span className="font-bold text-brand-primary mt-0.5 block">{inspectingAsset.division}</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Risk Level</span>
                <span className="font-bold text-red-600 mt-0.5 block">{inspectingAsset.risk_level} / 10</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Setup Date</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">{formatDate(inspectingAsset.setup_date)}</span>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-brand-tertiary border border-brand-border">
                <span className="text-brand-muted block text-xs font-semibold">Corridor Section</span>
                <span className="font-bold text-brand-secondary mt-0.5 block">
                  {inspectingAsset.section_name || `Section #${inspectingAsset.section}`}
                </span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectingAsset(null)}
                className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-brand-secondary">Confirm Delete</h3>
                <p className="text-xs text-brand-muted mt-0.5">
                  Are you sure you want to remove <span className="font-bold text-brand-secondary">"{deletingAsset.asset_title}"</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
              <button
                onClick={() => setDeletingAsset(null)}
                className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Asset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
