export interface FootprintData {
  // Transport inputs
  carKmWeekly: number;
  carType: 'gasoline' | 'hybrid' | 'electric' | 'none';
  publicTransitHoursWeekly: number;
  flightsHoursYearly: number;

  // Household Energy inputs
  electricityMonthlyKwh: number;
  gasMonthlyTherms: number;
  cleanEnergyPercentage: number; // 0% to 100%
  householdSize: number; // to divide household emissions

  // Diet / Food inputs
  dietType: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan';
  foodWasteLevel: 'high' | 'medium' | 'low';
  localFoodPercentage: number; // 0% to 100%

  // Consumption inputs
  clothingPurchasesMonthly: number; // items
  devicePurchasesYearly: number; // items
  recyclingRating: number; // 1 to 5
}

export interface EcoAction {
  id: string;
  name: string;
  description: string;
  co2SavedKg: number; // daily savings
  points: number;
  category: 'transport' | 'energy' | 'food' | 'waste';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LoggedActionInstance {
  id: string;
  actionId: string;
  name: string;
  co2SavedKg: number;
  points: number;
  category: 'transport' | 'energy' | 'food' | 'waste';
  timestamp: string; // ISO string
}

export interface DailyLog {
  dateString: string; // YYYY-MM-DD
  loggedActions: LoggedActionInstance[];
  customDailyFootprintOverride?: number; // adjusted daily footprint in kg CO2e
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface CarbonSummary {
  transportDailyKg: number;
  energyDailyKg: number;
  foodDailyKg: number;
  wasteDailyKg: number;
  totalDailyKg: number;
  totalYearlyTons: number;
  percentileText: string; // compared to average
}
