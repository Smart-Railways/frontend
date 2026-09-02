export type AssetDepartment = "ENGINEERING" | "SNT" | "TRACTION";

export interface Asset {
  id: number;
  asset_title: string;
  category: string;
  division: AssetDepartment | string;
  risk_level: number;
  setup_date?: string | null;
  section: number;
  section_name?: string;
}

export interface CreateAssetInput {
  section: number;
  asset_title: string;
  category: string;
  division: AssetDepartment | string;
  risk_level: number;
  setup_date?: string | null;
}

export interface UpdateAssetInput {
  section?: number;
  asset_title?: string;
  category?: string;
  division?: AssetDepartment | string;
  risk_level?: number;
  setup_date?: string | null;
}
