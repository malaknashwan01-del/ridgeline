export type Difficulty = 'easy' | 'moderate' | 'hard';
export type LatLng = [number, number];

export interface ElevationPoint {
  /** distance from start, km */
  d: number;
  /** elevation, m */
  e: number;
}

export interface Trail {
  id: string;
  name: string;
  nameAr: string;
  region: string;
  regionAr: string;
  lat: number;
  lng: number;
  distance: number; // km
  gain: number; // m
  duration: [number, number]; // hours
  difficulty: Difficulty;
  rating: number;
  reviews: number;
  palette: [string, string, string];
  image?: string[]; // candidate sources, first that loads wins
  description: { en: string; ar: string };
  route: LatLng[];
  profile: ElevationPoint[];
  maxElevation: number;
}

export interface Hike {
  id: string;
  trailId: string;
  date: string; // ISO
  distance: number;
  gain: number;
  minutes: number;
}

export interface User {
  name: string;
  email: string;
  location: string;
  joined: string;
}

export interface Plan {
  id: string;
  trailId: string;
  date: string; // YYYY-MM-DD
  note: string;
}
