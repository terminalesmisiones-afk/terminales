
export interface Schedule {
  id: string | number;
  company: string;
  destination: string;
  remarks: string; // Turno
  departure_mon_fri: string;
  departure_sat: string;
  departure_sun: string;
  platform?: string;
}

export interface Terminal {
  id: string;
  name: string;
  city: string;
  address: string;
  image: string;
  phone?: string;
  isActive: boolean;
  schedulesVisible: boolean;
  companyCount: number;
  lastUpdated: string;
  latitude?: number;
  longitude?: number;
  schedules?: Schedule[];
  google_sheet_url?: string;
  description?: string;
  municipalityInfo?: string;
}

export interface TerminalsGridProps {
  searchQuery?: string;
  selectedCity?: string;
  adSlotPrefix?: string;
}
