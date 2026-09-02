export interface RailwaySection {
  id: number;
  section_name: string;
  origin_station: string;
  end_station: string;
  distance: number;
  status: boolean;
}

export interface CreateRailwaySectionInput {
  section_name: string;
  origin_station: string;
  end_station: string;
  distance: number;
  status?: boolean;
}

export interface UpdateRailwaySectionInput {
  section_name?: string;
  origin_station?: string;
  end_station?: string;
  distance?: number;
  status?: boolean;
}
