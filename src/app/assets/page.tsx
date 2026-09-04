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
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssets,
  useRailwaySections,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
} from "@/hooks";
import { Asset, CreateAssetInput, AssetDepartment } from "@/types";

// Category options helper
const ASSET_CATEGORIES = [
  { value: "TRACK_CIRCUIT", label: "Track Circuit", icon: Zap },
  { value: "SIGNAL", label: "Signal & Interlocking", icon: Radio },
  { value: "POINT_MACHINE", label: "Point Machine / Switch", icon: Zap },
  { value: "OVERHEAD_EQUIPMENT", label: "OHE / Traction Catenary", icon: Zap },
  { value: "AXLE_COUNTER", label: "Axle Counter", icon: Radio },
  { value: "TRACK_SEGMENT", label: "Track Segment / Rail", icon: Layers },
  { value: "INTERLOCKING", label: "Electronic Interlocking", icon: Zap },
  { value: "TRANSFORMER", label: "Traction Substation Transformer", icon: Zap },
  { value: "OTHER", label: "Other Asset", icon: Building2 },
];

// Division options helper
const DIVISIONS: { value: AssetDepartment; label: string; desc: string; color: string }[] = [
  {
    value: "SNT",
    label: "S&T (Signals & Telecom)",
    desc: "Track circuits, signals, points, axle counters",
    color: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    value: "ENGINEERING",
    label: "Engineering (Civil / Track)",
    desc: "Rails, sleepers, turnouts, track beds",
    color: "text-brand-primary bg-brand-blue-light border-blue-200",
  },
  {
    value: "TRACTION",
    label: "Traction (Electrical / OHE)",
    desc: "OHE lines, substations, transformers",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
];

// Get Risk Level Badge styling
function getRiskBadge(level: number) {
  if (level >= 8) {
    return {
      bg: "bg-red-50 border-red-200 text-red-700",
      dot: "bg-red-500 animate-pulse",
      label: "Critical Risk",
    };
  }
  if (level >= 6) {
    return {
      bg: "bg-orange-50 border-orange-200 text-orange-700",
      dot: "bg-orange-500",
      label: "High Risk",
    };
  }
  if (level >= 4) {
    return {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      dot: "bg-amber-500",
      label: "Moderate",
    };
  }
  return {
    bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    dot: "bg-emerald-500",
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

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("ALL");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [minRiskFilter, setMinRiskFilter] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

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
    category: "TRACK_CIRCUIT",
    division: "SNT",
    risk_level: 5,
    setup_date: new Date().toISOString().split("T")[0],
  });

  const handleOpenCreateModal = () => {
    setEditingAsset(null);
    setFormData({
      section: sections.length > 0 ? sections[0].id : 1,
      asset_title: "",
      category: "TRACK_CIRCUIT",
      division: "SNT",
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
      division: (asset.division as AssetDepartment) || "SNT",
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
      sntCount: assets.filter((a) => a.division === "SNT").length,
      engCount: assets.filter((a) => a.division === "ENGINEERING").length,
      tractionCount: assets.filter((a) => a.division === "TRACTION").length,
    };
  }, [assets]);

  const isSaving = createAssetMutation.isPending || updateAssetMutation.isPending;
  const isDeleting = deleteAssetMutation.isPending;

  return (
    <div className="min-h-screen bg-brand-tertiary text-brand-secondary flex flex-col font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      <VerticalNavbar activeTab={activeNavTab} onTabChange={setActiveNavTab} unreadCount={1} />
      <div className="flex-1 flex pl-20 lg:pl-64">
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
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue-light text-brand-primary">
                  <Building2 className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-brand-secondary tracking-tight">Railway Asset Inventory & Management</h1>
              </div>
              <p className="text-xs text-brand-muted mt-1 font-medium">CRUD operations for railway assets, risk assessments, division assignments, and corridor mapping.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <LiveClock />
              <button onClick={() => { refetchAssets(); refetchSections(); }} disabled={refetchingAssets} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors disabled:opacity-50 cursor-pointer shadow-2xs">
                <RefreshCw className={`w-3.5 h-3.5 text-brand-primary ${refetchingAssets ? "animate-spin" : ""}`} />
                <span>{refetchingAssets ? "Refreshing..." : "Refresh"}</span>
              </button>
              <button onClick={handleOpenCreateModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Railway Asset</span>
              </button>
            </div>
          </header>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5"><Building2 className="w-4 h-4" /></div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">Total Assets</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.total}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Across all sections</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5"><AlertTriangle className="w-4 h-4" /></div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">High Risk Assets</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-red-600 tracking-tight">{stats.criticalRiskCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Risk score ≥ 7 / 10</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5"><Radio className="w-4 h-4" /></div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">S&T Division</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.sntCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Signals & Telecom</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue-light text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5"><Layers className="w-4 h-4" /></div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">Civil Engineering</div>
                {loadingAssets ? (
                  <Skeleton className="h-8 w-14 my-0.5 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-brand-secondary tracking-tight">{stats.engCount}</div>
                )}
                <div className="text-[11px] text-brand-muted mt-0.5 font-medium">Tracks & Turnouts</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border shadow-sm flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5"><Zap className="w-4 h-4" /></div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted mb-0.5">Traction / OHE</div>
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
              <div className="md:col-span-3">
                <select value={selectedSectionFilter} onChange={(e) => setSelectedSectionFilter(e.target.value)} className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs">
                  <option value="ALL">All Railway Sections</option>
                  {sections.map((sec) => <option key={sec.id} value={String(sec.id)}>{sec.section_name} (#{sec.id})</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)} className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold shadow-2xs">
                  <option value="ALL">All Asset Categories</option>
                  {ASSET_CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                <button onClick={() => setViewMode("table")} className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-2xs ${viewMode === "table" ? "bg-brand-primary text-white border-brand-primary" : "bg-brand-surface text-brand-muted border-brand-border hover:bg-brand-tertiary"}`} title="Table View"><TableIcon className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("cards")} className={`p-2 rounded-xl border transition-colors cursor-pointer shadow-2xs ${viewMode === "cards" ? "bg-brand-primary text-white border-brand-primary" : "bg-brand-surface text-brand-muted border-brand-border hover:bg-brand-tertiary"}`} title="Card Grid View"><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-brand-border/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-extrabold text-brand-muted uppercase tracking-wider mr-1">Division:</span>
                {["ALL", "SNT", "ENGINEERING", "TRACTION"].map((div) => (
                  <button key={div} onClick={() => setSelectedDivisionFilter(div)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedDivisionFilter === div ? "bg-brand-primary text-white shadow-xs" : "text-brand-muted hover:text-brand-secondary hover:bg-brand-tertiary"}`}>
                    {div === "SNT" ? "S&T" : div === "ENGINEERING" ? "Civil Track" : div === "TRACTION" ? "Electrical / OHE" : "All Divisions"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-secondary font-bold">
                <Filter className="w-3.5 h-3.5 text-brand-muted" />
                <span className="text-brand-muted">Min Risk:</span>
                <select value={minRiskFilter} onChange={(e) => setMinRiskFilter(Number(e.target.value))} className="bg-brand-surface border border-brand-border text-brand-secondary text-xs rounded-xl px-2.5 py-1 outline-none cursor-pointer font-bold shadow-2xs">
                  <option value={0}>All Levels (0+)</option>
                  <option value={4}>Medium+ (4+)</option>
                  <option value={6}>High+ (6+)</option>
                  <option value={8}>Critical Only (8+)</option>
                </select>
              </div>
            </div>
          </section>
          <section className="rounded-2xl bg-brand-surface border border-brand-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-brand-surface">
              <div>
                <h2 className="text-sm font-bold text-brand-secondary flex items-center gap-2">
                  <span>Tracked Infrastructure Assets</span>
                  {loadingAssets || loadingSections ? (
                    <Skeleton className="h-5 w-14 rounded-full" />
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-blue-light text-brand-primary border border-brand-primary/20 font-bold">
                      {filteredAssets.length} of {assets.length}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-brand-muted mt-0.5 font-medium">Railway network equipment, health scores, and division ownership</p>
              </div>
              <div className="text-xs text-brand-muted font-mono">REST Endpoint: <code className="text-brand-primary bg-brand-blue-light px-2 py-0.5 rounded border border-brand-primary/20 font-bold">/railways/assets/</code></div>
            </div>
            {loadingAssets || loadingSections ? (
              viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-surface text-brand-muted font-bold uppercase tracking-wider border-b border-brand-border text-[10px]">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Asset Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Division</th>
                        <th className="py-3 px-4">Section</th>
                        <th className="py-3 px-4">Risk Level</th>
                        <th className="py-3 px-4">Setup Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/60">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="hover:bg-brand-tertiary/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <Skeleton className="h-4 w-8" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                              <div className="space-y-1.5">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-2.5 w-16" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Skeleton className="h-5 w-20 rounded-md" />
                          </td>
                          <td className="py-3.5 px-4">
                            <Skeleton className="h-5 w-16 rounded-md" />
                          </td>
                          <td className="py-3.5 px-4">
                            <Skeleton className="h-4 w-28 rounded" />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-5 w-14 rounded-md" />
                              <Skeleton className="h-3 w-12 rounded" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
                              <Skeleton className="h-3.5 w-20 rounded" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
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
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-brand-surface border border-brand-border flex flex-col justify-between space-y-3 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                            <div className="space-y-1.5">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-2.5 w-20" />
                            </div>
                          </div>
                          <Skeleton className="h-5 w-16 rounded-md" />
                        </div>
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-14" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-14" />
                            <Skeleton className="h-5 w-16 rounded-md" />
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-brand-border flex items-center justify-between">
                        <Skeleton className="h-4 w-14 rounded" />
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="w-7 h-7 rounded-lg" />
                          <Skeleton className="w-7 h-7 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredAssets.length === 0 ? (
              <div className="py-16 text-center text-brand-muted"><div className="flex flex-col items-center justify-center gap-3"><Building2 className="w-10 h-10 text-brand-muted opacity-60" /><div className="text-sm font-bold text-brand-secondary">No matching assets found</div><button onClick={handleOpenCreateModal} className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"><Plus className="w-4 h-4" />Create First Asset</button></div></div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-brand-surface text-brand-muted font-bold uppercase tracking-wider border-b border-brand-border text-[10px]"><tr><th className="py-3 px-4">ID</th><th className="py-3 px-4">Asset Title</th><th className="py-3 px-4">Category</th><th className="py-3 px-4">Division</th><th className="py-3 px-4">Section</th><th className="py-3 px-4">Risk Level</th><th className="py-3 px-4">Setup Date</th><th className="py-3 px-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-brand-border/60 text-brand-secondary">{filteredAssets.map((asset) => { const risk = getRiskBadge(asset.risk_level); const divInfo = DIVISIONS.find((d) => d.value === asset.division); return (<tr key={asset.id} className="hover:bg-brand-tertiary/60 transition-colors group"><td className="py-3.5 px-4 font-mono font-bold text-brand-muted">#{asset.id}</td><td className="py-3.5 px-4"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-brand-blue-light border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold"><Zap className="w-4 h-4" /></div><div><div className="font-extrabold text-brand-secondary text-sm">{asset.asset_title}</div><div className="text-[10px] text-brand-muted font-mono">{asset.category}</div></div></div></td><td className="py-3.5 px-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-tertiary border border-brand-border text-brand-secondary">{asset.category.replace(/_/g, " ")}</span></td><td className="py-3.5 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${divInfo ? divInfo.color : "text-brand-secondary bg-slate-100 border-slate-200"}`}>{asset.division}</span></td><td className="py-3.5 px-4"><div className="text-brand-secondary font-bold">{asset.section_name || `Section #${asset.section}`}</div></td><td className="py-3.5 px-4"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${risk.bg}`}><span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`}></span>{asset.risk_level}/10</span><span className="text-[10px] text-brand-muted font-medium">{risk.label}</span></div></td><td className="py-3.5 px-4 font-mono text-brand-secondary"><div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-brand-muted" /><span>{formatDate(asset.setup_date)}</span></div></td><td className="py-3.5 px-4 text-right"><div className="flex items-center justify-end gap-1.5"><button onClick={() => setInspectingAsset(asset)} className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary shadow-xs transition-colors cursor-pointer" title="Inspect"><Eye className="w-3.5 h-3.5" /></button><button onClick={() => handleOpenEditModal(asset)} className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary shadow-xs transition-colors cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setDeletingAsset(asset)} className="p-1.5 rounded-lg bg-brand-surface hover:bg-red-50 border border-brand-border hover:border-red-200 text-red-600 shadow-xs transition-colors cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button></div></td></tr>); })}</tbody></table></div>
            ) : (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{filteredAssets.map((asset) => { const risk = getRiskBadge(asset.risk_level); const divInfo = DIVISIONS.find((d) => d.value === asset.division); return (<div key={asset.id} className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/50 transition-all flex flex-col justify-between space-y-3 shadow-sm"><div className="space-y-2"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-brand-blue-light border border-brand-primary/20 flex items-center justify-center text-brand-primary"><Zap className="w-4 h-4" /></div><div><h3 className="text-sm font-bold text-brand-secondary leading-tight">{asset.asset_title}</h3><span className="text-[10px] text-brand-muted font-mono">ID: #{asset.id} • {asset.category}</span></div></div><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${risk.bg}`}><span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`}></span>Risk {asset.risk_level}/10</span></div><div className="space-y-1 pt-1 text-xs"><div className="flex items-center justify-between text-brand-muted"><span>Corridor:</span><span className="text-brand-secondary font-bold truncate max-w-[180px]">{asset.section_name || `Section #${asset.section}`}</span></div><div className="flex items-center justify-between text-brand-muted"><span>Division:</span><span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${divInfo ? divInfo.color : "text-brand-secondary"}`}>{asset.division}</span></div></div></div><div className="pt-2 border-t border-brand-border flex items-center justify-between"><button onClick={() => setInspectingAsset(asset)} className="flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"><Eye className="w-3.5 h-3.5" /><span>Inspect</span></button><div className="flex items-center gap-1.5"><button onClick={() => handleOpenEditModal(asset)} className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-brand-primary transition-colors cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setDeletingAsset(asset)} className="p-1.5 rounded-lg bg-brand-surface hover:bg-red-50 border border-brand-border text-red-600 transition-colors cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button></div></div></div>); })}</div>
            )}
          </section>
        </main>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-brand-blue-light border border-brand-primary/20 flex items-center justify-center text-brand-primary"><Building2 className="w-4 h-4" /></div><div><h3 className="text-base font-extrabold text-brand-secondary">{editingAsset ? `Edit Asset #${editingAsset.id}` : "Create New Railway Asset"}</h3></div></div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div><label className="font-extrabold text-brand-secondary block mb-1">Asset Title / Identification <span className="text-red-500">*</span></label><input type="text" value={formData.asset_title} onChange={(e) => setFormData({ ...formData, asset_title: e.target.value })} required className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs" /></div>
              <div><label className="font-extrabold text-brand-secondary block mb-1">Corridor Section <span className="text-red-500">*</span></label><select value={formData.section} onChange={(e) => setFormData({ ...formData, section: Number(e.target.value) })} required className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs">{sections.map((sec) => <option key={sec.id} value={sec.id}>{sec.section_name} (#{sec.id})</option>)}</select></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="font-extrabold text-brand-secondary block mb-1">Department Division <span className="text-red-500">*</span></label><select value={formData.division} onChange={(e) => setFormData({ ...formData, division: e.target.value as AssetDepartment })} className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs"><option value="SNT">SNT (Signals & Telecom)</option><option value="ENGINEERING">ENGINEERING (Civil / Track)</option><option value="TRACTION">TRACTION (Electrical / OHE)</option></select></div><div><label className="font-extrabold text-brand-secondary block mb-1">Asset Category <span className="text-red-500">*</span></label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2.5 outline-none font-bold shadow-2xs">{ASSET_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><div className="flex items-center justify-between mb-1"><label className="font-extrabold text-brand-secondary">Risk Level (1 - 10)</label><span className="font-mono font-black text-brand-primary">{formData.risk_level} / 10</span></div><input type="range" min={1} max={10} step={1} value={formData.risk_level} onChange={(e) => setFormData({ ...formData, risk_level: Number(e.target.value) })} className="w-full accent-brand-primary cursor-pointer h-2 bg-brand-tertiary rounded-lg" /></div><div><label className="font-extrabold text-brand-secondary block mb-1">Setup / Commission Date</label><input type="date" value={formData.setup_date || ""} onChange={(e) => setFormData({ ...formData, setup_date: e.target.value })} className="w-full bg-brand-surface border border-brand-border focus:border-brand-primary text-brand-secondary text-xs rounded-xl px-3.5 py-2 outline-none font-bold shadow-2xs" /></div></div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer">Cancel</button><button type="submit" disabled={isSaving} className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer">{isSaving ? "Saving..." : editingAsset ? "Update Asset" : "Create Asset"}</button></div>
            </form>
          </div>
        </div>
      )}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-brand-blue-light text-brand-primary flex items-center justify-center"><Eye className="w-4 h-4" /></div><div><h3 className="text-base font-extrabold text-brand-secondary">{inspectingAsset.asset_title}</h3><span className="text-xs text-brand-muted">Asset ID #{inspectingAsset.id}</span></div></div><button onClick={() => setInspectingAsset(null)} className="text-brand-muted hover:text-brand-secondary text-lg font-bold cursor-pointer">✕</button></div>
            <div className="grid grid-cols-2 gap-3 text-xs"><div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border"><span className="text-brand-muted block text-[10px] uppercase font-bold">Category</span><span className="font-bold text-brand-secondary mt-0.5 block">{inspectingAsset.category}</span></div><div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border"><span className="text-brand-muted block text-[10px] uppercase font-bold">Division</span><span className="font-bold text-brand-primary mt-0.5 block">{inspectingAsset.division}</span></div><div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border"><span className="text-brand-muted block text-[10px] uppercase font-bold">Risk Level</span><span className="font-bold text-red-600 mt-0.5 block">{inspectingAsset.risk_level} / 10</span></div><div className="p-3 rounded-xl bg-brand-tertiary border border-brand-border"><span className="text-brand-muted block text-[10px] uppercase font-bold">Setup Date</span><span className="font-bold text-brand-secondary mt-0.5 block">{formatDate(inspectingAsset.setup_date)}</span></div><div className="col-span-2 p-3 rounded-xl bg-brand-tertiary border border-brand-border"><span className="text-brand-muted block text-[10px] uppercase font-bold">Corridor Section</span><span className="font-bold text-brand-secondary mt-0.5 block">{inspectingAsset.section_name || `Section #${inspectingAsset.section}`}</span></div></div>
            <div className="pt-2 flex justify-end"><button onClick={() => setInspectingAsset(null)} className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-tertiary border border-brand-border text-xs font-bold text-brand-secondary transition-colors cursor-pointer">Close</button></div>
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
