
export interface Schedule {
  id: number;
  company: string;
  destination: string;
  departure: string;
  arrival: string;
  frequency: string;
  platform: string;
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
}

export interface TerminalsGridProps {
  searchQuery?: string;
  selectedCity?: string;
}
