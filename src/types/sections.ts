export interface RailwaySection {
  id: number;
  section_name: string;
  origin_station: string;
  source_station_code?: string;
  end_station: string;
  destination_station_code?: string;
  distance: number;
  status: boolean;
}

export interface CreateRailwaySectionInput {
  section_name: string;
  origin_station: string;
  source_station_code?: string;
  end_station: string;
  destination_station_code?: string;
  distance: number;
  status?: boolean;
}

export interface UpdateRailwaySectionInput {
  section_name?: string;
  origin_station?: string;
  source_station_code?: string;
  end_station?: string;
  destination_station_code?: string;
  distance?: number;
  status?: boolean;
}
