"use client";

import React, { useState, useMemo } from "react";
import { VerticalNavbar } from "@/components/navigation/vertical-navbar";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Code2,
  CheckCircle2,
  XCircle,
  Wrench,
  Radio,
  Sparkles,
  Filter,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
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
  { value: "POINT_MACHINE", label: "Point Machine / Switch", icon: Wrench },
  { value: "OVERHEAD_EQUIPMENT", label: "OHE / Traction Catenary", icon: Zap },
  { value: "AXLE_COUNTER", label: "Axle Counter", icon: Radio },
  { value: "TRACK_SEGMENT", label: "Track Segment / Rail", icon: Layers },
  { value: "INTERLOCKING", label: "Electronic Interlocking", icon: ShieldCheck },
  { value: "TRANSFORMER", label: "Traction Substation Transformer", icon: Zap },
  { value: "OTHER", label: "Other Asset", icon: Building2 },
];

// Division options helper
const DIVISIONS: { value: AssetDepartment; label: string; desc: string; color: string }[] = [
  {
    value: "SNT",
    label: "S&T (Signals & Telecom)",
    desc: "Track circuits, signals, points, axle counters",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    value: "ENGINEERING",
    label: "Engineering (Civil / Track)",
    desc: "Rails, sleepers, turnouts, track beds",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    value: "TRACTION",
    label: "Traction (Electrical / OHE)",
    desc: "OHE lines, substations, transformers",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
];

// Get Risk Level Badge styling
function getRiskBadge(level: number) {
  if (level >= 8) {
    return {
      bg: "bg-red-500/15 border-red-500/40 text-red-300",
      dot: "bg-red-400 animate-pulse",
      label: "Critical Risk",
    };
  }
  if (level >= 6) {
    return {
      bg: "bg-orange-500/15 border-orange-500/40 text-orange-300",
      dot: "bg-orange-400",
      label: "High Risk",
    };
  }
  if (level >= 4) {
    return {
      bg: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
      dot: "bg-yellow-400",
      label: "Moderate",
    };
  }
  return {
    bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    dot: "bg-emerald-400",
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

  // Query Hooks
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

  // Mutation Hooks
  const createAssetMutation = useCreateAsset();
  const updateAssetMutation = useUpdateAsset();
  const deleteAssetMutation = useDeleteAsset();

  // Filters & UI Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("ALL");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [minRiskFilter, setMinRiskFilter] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [inspectingAsset, setInspectingAsset] = useState<Asset | null>(null);
  const [showApiDocModal, setShowApiDocModal] = useState<boolean>(false);

  // Form State for Create / Edit
  const [formData, setFormData] = useState<CreateAssetInput>({
    section: 1,
    asset_title: "",
    category: "TRACK_CIRCUIT",
    division: "SNT",
    risk_level: 5,
    setup_date: new Date().toISOString().split("T")[0],
  });

  // Open Create Modal
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

  // Open Edit Modal
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

  // Form Submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.asset_title.trim()) {
      showToast("error", "Asset Title is required.");
      return;
    }

    if (!formData.section) {
      showToast("error", "Please select a railway section.");
      return;
    }

    if (editingAsset) {
      // Update Asset (PUT / PATCH)
      updateAssetMutation.mutate(
        { id: editingAsset.id, data: formData },
        {
          onSuccess: (updated) => {
            setIsCreateModalOpen(false);
            setEditingAsset(null);
            showToast("success", `Asset "${updated?.asset_title || editingAsset.asset_title}" updated successfully.`);
          },
          onError: (err) => {
            showToast("error", err instanceof Error ? err.message : "Failed to update asset.");
          },
        }
      );
    } else {
      // Create Asset (POST /railways/assets/)
      createAssetMutation.mutate(formData, {
        onSuccess: (created) => {
          setIsCreateModalOpen(false);
          showToast("success", `Asset "${created?.asset_title || formData.asset_title}" created successfully.`);
        },
        onError: (err) => {
          showToast("error", err instanceof Error ? err.message : "Failed to create asset.");
        },
      });
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingAsset) return;

    deleteAssetMutation.mutate(deletingAsset.id, {
      onSuccess: () => {
        showToast("success", `Asset "${deletingAsset.asset_title}" deleted successfully.`);
        setDeletingAsset(null);
      },
      onError: (err) => {
        showToast("error", err instanceof Error ? err.message : "Failed to delete asset.");
      },
    });
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.asset_title?.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesSection = item.section_name?.toLowerCase().includes(q);
        const matchesId = String(item.id).includes(q);
        if (!matchesTitle && !matchesCategory && !matchesSection && !matchesId) {
          return false;
        }
      }

      // 2. Section filter
      if (selectedSectionFilter !== "ALL" && String(item.section) !== selectedSectionFilter) {
        return false;
      }

      // 3. Division filter
      if (selectedDivisionFilter !== "ALL" && item.division !== selectedDivisionFilter) {
        return false;
      }

      // 4. Category filter
      if (selectedCategoryFilter !== "ALL" && item.category !== selectedCategoryFilter) {
        return false;
      }

      // 5. Min Risk filter
      if (item.risk_level < minRiskFilter) {
        return false;
      }

      return true;
    });
  }, [assets, searchQuery, selectedSectionFilter, selectedDivisionFilter, selectedCategoryFilter, minRiskFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = assets.length;
    const criticalRiskCount = assets.filter((a) => a.risk_level >= 7).length;
    const sntCount = assets.filter((a) => a.division === "SNT").length;
    const engCount = assets.filter((a) => a.division === "ENGINEERING").length;
    const tractionCount = assets.filter((a) => a.division === "TRACTION").length;

    return {
      total,
      criticalRiskCount,
      sntCount,
      engCount,
      tractionCount,
    };
  }, [assets]);

  const isSaving = createAssetMutation.isPending || updateAssetMutation.isPending;
  const isDeleting = deleteAssetMutation.isPending;

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Left Vertical Navbar */}
      <VerticalNavbar
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        unreadCount={3}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex pl-20 lg:pl-64">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 flex flex-col space-y-6 max-w-[1500px] mx-auto w-full">
          
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-3 ${
                toastMessage.type === "success"
                  ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                  : "bg-red-950/90 border-red-500/50 text-red-200"
              }`}
            >
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold">{toastMessage.text}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white text-xs ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#172642]/60">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-950">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Railway Asset Inventory & Management
                  </h1>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                CRUD operations for railway assets, risk assessments, division assignments, and corridor mapping.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowApiDocModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#121d36] border border-[#172642] text-xs text-slate-300 transition-colors cursor-pointer"
                title="View API Docs & Schema"
              >
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>API Spec</span>
              </button>

              <button
                onClick={() => {
                  refetchAssets();
                  refetchSections();
                }}
                disabled={refetchingAssets}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#121d36] border border-[#172642] text-xs text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refetchingAssets ? "animate-spin" : ""}`} />
                <span>{refetchingAssets ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Railway Asset</span>
              </button>
            </div>
          </header>

          {/* Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Assets</span>
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats.total}</div>
              <div className="text-[11px] text-slate-400 mt-1">Across all active sections</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">High Risk Assets</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-black text-red-400">{stats.criticalRiskCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Risk score ≥ 7 / 10</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">S&T Division</span>
                <Radio className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-300">{stats.sntCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Signals & Telecom</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Civil Engineering</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-300">{stats.engCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Tracks, Points & Rails</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0d1527] to-[#070b13] border border-[#172642]">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Traction / OHE</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">{stats.tractionCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Electrical Infrastructure</div>
            </div>
          </section>

          {/* Filtering and Controls Bar */}
          <section className="p-4 rounded-2xl bg-[#0d1527]/90 border border-[#172642] shadow-xl backdrop-blur-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Search Bar */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search asset title, ID, section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                />
              </div>

              {/* Section Filter Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedSectionFilter}
                  onChange={(e) => setSelectedSectionFilter(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Railway Sections</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={String(sec.id)}>
                      {sec.section_name} (#{sec.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Asset Categories</option>
                  {ASSET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-[#070b13] text-slate-400 border-[#172642] hover:text-white"
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-[#070b13] text-slate-400 border-[#172642] hover:text-white"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Division Filter Badges & Min Risk Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#172642]/60">
              {/* Division Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Division:
                </span>
                {["ALL", "SNT", "ENGINEERING", "TRACTION"].map((div) => (
                  <button
                    key={div}
                    onClick={() => setSelectedDivisionFilter(div)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedDivisionFilter === div
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                        : "bg-[#070b13] text-slate-400 border-[#172642] hover:text-slate-200"
                    }`}
                  >
                    {div === "SNT" ? "S&T" : div === "ENGINEERING" ? "Civil Track" : div === "TRACTION" ? "Electrical / OHE" : "All Divisions"}
                  </button>
                ))}
              </div>

              {/* Min Risk Filter */}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Min Risk:</span>
                <select
                  value={minRiskFilter}
                  onChange={(e) => setMinRiskFilter(Number(e.target.value))}
                  className="bg-[#070b13] border border-[#1e3256] text-white text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  <option value={0}>All Levels (0+)</option>
                  <option value={4}>Medium+ (4+)</option>
                  <option value={6}>High+ (6+)</option>
                  <option value={8}>Critical Only (8+)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Asset List Content */}
          <section className="rounded-2xl bg-[#0d1527] border border-[#172642] shadow-2xl overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-4 border-b border-[#172642] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#09101d]">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Tracked Infrastructure Assets</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {filteredAssets.length} of {assets.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Railway network equipment, health scores, and division ownership
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                REST Endpoint: <code className="text-emerald-400 bg-[#070b13] px-1.5 py-0.5 rounded border border-[#172642]">/railways/assets/</code>
              </div>
            </div>

            {/* View Switching: Table or Grid */}
            {loadingAssets || loadingSections ? (
              <div className="py-16 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
                  <span className="text-xs font-semibold">Loading assets from backend...</span>
                </div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Building2 className="w-10 h-10 text-slate-600" />
                  <div className="text-sm font-bold text-slate-300">
                    No matching assets found
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Try adjusting your search keywords, section filters, or create a new railway asset.
                  </p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="mt-2 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Asset
                  </button>
                </div>
              </div>
            ) : viewMode === "table" ? (
              /* TABLE VIEW */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070b13]/80 text-slate-400 font-bold uppercase tracking-wider border-b border-[#172642]">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Asset Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Division</th>
                      <th className="py-3 px-4">Section / Corridor</th>
                      <th className="py-3 px-4">Risk Level</th>
                      <th className="py-3 px-4">Setup Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172642]/60">
                    {filteredAssets.map((asset) => {
                      const risk = getRiskBadge(asset.risk_level);
                      const divInfo = DIVISIONS.find((d) => d.value === asset.division);

                      return (
                        <tr
                          key={asset.id}
                          className="hover:bg-[#121d36]/60 transition-colors group"
                        >
                          {/* ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                            #{asset.id}
                          </td>

                          {/* Asset Title */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#070b13] border border-[#1e3256] flex items-center justify-center text-emerald-400 font-bold group-hover:border-emerald-400/50 transition-colors">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-white text-sm">
                                  {asset.asset_title}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {asset.category}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#070b13] border border-[#1e3256] text-slate-300">
                              {asset.category.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Division */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                divInfo ? divInfo.color : "text-slate-300 bg-slate-800 border-slate-700"
                              }`}
                            >
                              {asset.division}
                            </span>
                          </td>

                          {/* Section */}
                          <td className="py-3.5 px-4">
                            <div className="text-white font-medium">
                              {asset.section_name || `Section #${asset.section}`}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Section ID: {asset.section}
                            </div>
                          </td>

                          {/* Risk Level */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${risk.bg}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`}></span>
                                {asset.risk_level}/10
                              </span>
                              <span className="text-[10px] text-slate-400">{risk.label}</span>
                            </div>
                          </td>

                          {/* Setup Date */}
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{formatDate(asset.setup_date)}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectingAsset(asset)}
                                className="p-1.5 rounded-lg bg-[#070b13] hover:bg-[#1a2b4f] border border-[#1e3256] text-slate-300 hover:text-white transition-colors"
                                title="Inspect Asset Details"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(asset)}
                                className="p-1.5 rounded-lg bg-[#070b13] hover:bg-[#1a2b4f] border border-[#1e3256] text-slate-300 hover:text-white transition-colors"
                                title="Edit Asset"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                              </button>
                              <button
                                onClick={() => setDeletingAsset(asset)}
                                className="p-1.5 rounded-lg bg-[#070b13] hover:bg-red-950/50 border border-[#1e3256] hover:border-red-500/40 text-slate-300 hover:text-red-400 transition-colors"
                                title="Delete Asset"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARD GRID VIEW */
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => {
                  const risk = getRiskBadge(asset.risk_level);
                  const divInfo = DIVISIONS.find((d) => d.value === asset.division);

                  return (
                    <div
                      key={asset.id}
                      className="p-4 rounded-xl bg-gradient-to-b from-[#09101d] to-[#070b13] border border-[#172642] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 shadow-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#0d1527] border border-[#1e3256] flex items-center justify-center text-emerald-400">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white leading-tight">
                                {asset.asset_title}
                              </h3>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: #{asset.id} • {asset.category}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${risk.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`}></span>
                            Risk {asset.risk_level}/10
                          </span>
                        </div>

                        <div className="space-y-1 pt-1 text-xs">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Corridor:</span>
                            <span className="text-slate-200 font-semibold truncate max-w-[180px]">
                              {asset.section_name || `Section #${asset.section}`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span>Division:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                                divInfo ? divInfo.color : "text-slate-300"
                              }`}
                            >
                              {asset.division}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span>Setup Date:</span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              {formatDate(asset.setup_date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-[#172642] flex items-center justify-between">
                        <button
                          onClick={() => setInspectingAsset(asset)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(asset)}
                            className="p-1.5 rounded-lg bg-[#070b13] hover:bg-[#121d36] border border-[#1e3256] text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingAsset(asset)}
                            className="p-1.5 rounded-lg bg-[#070b13] hover:bg-red-950/50 border border-[#1e3256] text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* MODAL 1: Create or Edit Asset */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1527] border border-[#172642] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#172642]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingAsset ? `Edit Asset #${editingAsset.id}` : "Create New Railway Asset"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingAsset ? "PUT /railways/assets/:id/" : "POST /railways/assets/"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {/* Asset Title */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Asset Title / Identification <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Track Circuit 01, Signal S-24, Turnout Point 102"
                  value={formData.asset_title}
                  onChange={(e) => setFormData({ ...formData, asset_title: e.target.value })}
                  required
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                />
              </div>

              {/* Section Assignment */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Corridor Section <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: Number(e.target.value) })}
                  required
                  className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.section_name} (#{sec.id}) • {sec.origin_station} → {sec.end_station}
                    </option>
                  ))}
                </select>
              </div>

              {/* Division & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Division */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Department Division <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value as AssetDepartment })}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                  >
                    <option value="SNT">SNT (Signals & Telecom)</option>
                    <option value="ENGINEERING">ENGINEERING (Civil / Track)</option>
                    <option value="TRACTION">TRACTION (Electrical / OHE)</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Asset Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                  >
                    {ASSET_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label} ({c.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Risk Level & Setup Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Risk Level */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Risk Level (1 - 10)
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {formData.risk_level} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-[#070b13] rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 (Low Risk)</span>
                    <span>5 (Moderate)</span>
                    <span className="text-red-400 font-bold">10 (Critical)</span>
                  </div>
                </div>

                {/* Setup Date */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Setup / Commission Date
                  </label>
                  <input
                    type="date"
                    value={formData.setup_date || ""}
                    onChange={(e) => setFormData({ ...formData, setup_date: e.target.value })}
                    className="w-full bg-[#070b13] border border-[#1e3256] focus:border-emerald-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Payload Live Preview Accordion */}
              <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-purple-400" />
                    Outgoing JSON Payload Preview
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">
                    {editingAsset ? `PUT /railways/assets/${editingAsset.id}/` : "POST /railways/assets/"}
                  </span>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 bg-[#04070d] p-2.5 rounded-lg overflow-x-auto border border-[#121d36]">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#172642]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving
                    ? editingAsset
                      ? "Updating Asset..."
                      : "Creating Asset..."
                    : editingAsset
                    ? "Save Changes"
                    : "Create Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Inspect Asset Details */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1527] border border-[#172642] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#172642]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {inspectingAsset.asset_title}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Asset ID: #{inspectingAsset.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingAsset(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Asset Category</span>
                  <span className="font-bold text-white text-sm">{inspectingAsset.category}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Division</span>
                  <span className="font-bold text-purple-300 text-sm">{inspectingAsset.division}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Section Corridor</span>
                  <span className="font-bold text-white text-sm">
                    {inspectingAsset.section_name || `Section #${inspectingAsset.section}`}
                  </span>
                  <span className="text-[10px] text-slate-500 block">ID: {inspectingAsset.section}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                  <span className="text-slate-400 block text-[11px]">Risk Level</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {inspectingAsset.risk_level} / 10
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#070b13] border border-[#172642]">
                <span className="text-slate-400 block text-[11px] mb-1">Setup / Commission Date</span>
                <span className="font-mono text-slate-200">
                  {formatDate(inspectingAsset.setup_date)}
                </span>
              </div>

              {/* Raw JSON inspection */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Server Response Payload:</span>
                <pre className="text-[11px] font-mono text-cyan-300 bg-[#04070d] p-3 rounded-xl border border-[#172642] overflow-x-auto">
                  {JSON.stringify(inspectingAsset, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#172642]">
              <button
                onClick={() => {
                  const toEdit = inspectingAsset;
                  setInspectingAsset(null);
                  handleOpenEditModal(toEdit);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#121d36] hover:bg-[#1a2b4f] border border-[#1e3256] text-xs font-semibold text-emerald-400 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Asset</span>
              </button>

              <button
                onClick={() => setInspectingAsset(null)}
                className="px-4 py-1.5 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1527] border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Asset</h3>
                <p className="text-xs text-slate-400">DELETE /railways/assets/{deletingAsset.id}/</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete asset{" "}
              <span className="font-bold text-white">"{deletingAsset.asset_title}"</span> (ID: #{deletingAsset.id})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#172642]">
              <button
                type="button"
                onClick={() => setDeletingAsset(null)}
                className="px-4 py-2 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: API Docs & Schema Inspector */}
      {showApiDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d1527] border border-[#172642] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#172642]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Railway Asset API Endpoints</h3>
                  <p className="text-xs text-slate-400">REST API contract for CRUD operations</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiDocModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* GET Endpoint */}
              <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#172642] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px]">
                      GET
                    </span>
                    /railways/assets/
                  </span>
                  <span className="text-[11px] text-slate-400">List all assets</span>
                </div>
              </div>

              {/* POST Endpoint */}
              <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#172642] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[10px]">
                      POST
                    </span>
                    /railways/assets/
                  </span>
                  <span className="text-[11px] text-slate-400">Create asset</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Request Body:
                  </span>
                  <pre className="text-[11px] font-mono text-blue-300 bg-[#04070d] p-2.5 rounded-lg border border-[#121d36]">
{`{
  "section": 1,
  "asset_title": "Track Circuit 01",
  "category": "TRACK_CIRCUIT",
  "division": "SNT",
  "risk_level": 7,
  "setup_date": "2024-01-15"
}`}
                  </pre>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Response (201 Created):
                  </span>
                  <pre className="text-[11px] font-mono text-emerald-300 bg-[#04070d] p-2.5 rounded-lg border border-[#121d36]">
{`{
  "id": 1,
  "asset_title": "Track Circuit 01",
  "category": "TRACK_CIRCUIT",
  "division": "SNT",
  "risk_level": 7,
  "setup_date": "2024-01-15",
  "section": 1,
  "section_name": "New Delhi - Mathura"
}`}
                  </pre>
                </div>
              </div>

              {/* PUT / DELETE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#172642] space-y-1">
                  <span className="font-mono font-bold text-amber-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[10px]">
                      PUT / PATCH
                    </span>
                    /railways/assets/:id/
                  </span>
                  <p className="text-[11px] text-slate-400">Update existing asset attributes</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070b13] border border-[#172642] space-y-1">
                  <span className="font-mono font-bold text-red-400 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[10px]">
                      DELETE
                    </span>
                    /railways/assets/:id/
                  </span>
                  <p className="text-[11px] text-slate-400">Remove asset by ID</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#172642] text-right">
              <button
                onClick={() => setShowApiDocModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#070b13] hover:bg-[#121d36] text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
