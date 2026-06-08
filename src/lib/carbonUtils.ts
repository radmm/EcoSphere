import { FootprintData, EcoAction, CarbonSummary } from '../types';

// Standard emissions coefficients (kg CO2e)
export const EMISSION_FACTORS = {
  car_gasoline_km: 0.22, // kg CO2e per km
  car_hybrid_km: 0.12,   // kg CO2e per km
  car_electric_km: 0.05, // kg CO2e per km (electric grid overhead)
  car_none_km: 0.0,

  public_transit_hour: 1.2, // kg CO2e per passenger hour (trains/buses blend)
  flight_hour: 85.0,        // kg CO2e per sky hour (averaged)

  electricity_kwh: 0.41,    // kg CO2e per kWh (standard grid)
  natural_gas_therm: 5.3,   // kg CO2e per therm (100k BTU)

  diet_meat_heavy_daily: 7.2,
  diet_average_daily: 5.0,
  diet_vegetarian_daily: 3.8,
  diet_vegan_daily: 2.8,

  food_waste_high_daily: 1.6,
  food_waste_medium_daily: 0.7,
  food_waste_low_daily: 0.1,

  clothing_item: 12.0,      // kg CO2e per item (cotton/polyester blend avg)
  device_item_yearly: 180.0, // kg CO2e lifetime build footprint amortized yearly
  general_waste_daily: 2.2,  // base packaging/waste emissions before recycling
};

// Static eco-actions database
export const ECO_ACTIONS: EcoAction[] = [
  {
    id: 'act_01',
    name: 'Meat-Free Day',
    description: 'Swapped all meals for plant-based choices today to cut greenhouse gases.',
    co2SavedKg: 3.5,
    points: 30,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'act_02',
    name: 'Bike/Walk to Destination',
    description: 'Walked or cycled for a daily trip instead of driving a personal vehicle.',
    co2SavedKg: 2.4,
    points: 40,
    category: 'transport',
    difficulty: 'medium',
  },
  {
    id: 'act_03',
    name: 'Line Dry Laundry',
    description: 'Air-dried clothes instead of running the energy-intensive tumble dryer.',
    co2SavedKg: 1.8,
    points: 25,
    category: 'energy',
    difficulty: 'easy',
  },
  {
    id: 'act_04',
    name: 'Unplug Standby Devices',
    description: 'Unplugged vampire appliances or switched off power strips on standby items.',
    co2SavedKg: 0.8,
    points: 15,
    category: 'energy',
    difficulty: 'easy',
  },
  {
    id: 'act_05',
    name: 'Cold Water Quick Wash',
    description: 'Washed laundry in cold water (≤ 30°C) rather than warm water settings.',
    co2SavedKg: 0.6,
    points: 15,
    category: 'energy',
    difficulty: 'easy',
  },
  {
    id: 'act_06',
    name: 'Zero Food Waste Day',
    description: 'Finishing all leftovers, utilizing vegetable trims, and throwing out zero food.',
    co2SavedKg: 1.2,
    points: 25,
    category: 'food',
    difficulty: 'easy',
  },
  {
    id: 'act_07',
    name: 'Composting Waste',
    description: 'Composted organic scraps, preventing anaerobic decomposition in landfills.',
    co2SavedKg: 1.0,
    points: 20,
    category: 'waste',
    difficulty: 'easy',
  },
  {
    id: 'act_08',
    name: 'Public Transit Commute',
    description: 'Took a bus, metro, or shared train ride instead of driving solo.',
    co2SavedKg: 4.5,
    points: 35,
    category: 'transport',
    difficulty: 'medium',
  },
  {
    id: 'act_09',
    name: 'Adopt Smart Thermostat Adjustments',
    description: 'Turned thermostat down by 2°C in winter / up in summer to optimize heating cycles.',
    co2SavedKg: 2.1,
    points: 30,
    category: 'energy',
    difficulty: 'medium',
  },
  {
    id: 'act_10',
    name: 'Zero-Buy Clothing Month Pledge',
    description: 'Avoided buying fast fashion items or brand new accessories, opting for vintage/no-buy.',
    co2SavedKg: 10.0,
    points: 100,
    category: 'waste',
    difficulty: 'hard',
  },
];

export const INITIAL_FOOTPRINT_DATA: FootprintData = {
  carKmWeekly: 180,
  carType: 'gasoline',
  publicTransitHoursWeekly: 3,
  flightsHoursYearly: 12,

  electricityMonthlyKwh: 320,
  gasMonthlyTherms: 15,
  cleanEnergyPercentage: 15,
  householdSize: 2,

  dietType: 'average',
  foodWasteLevel: 'medium',
  localFoodPercentage: 20,

  clothingPurchasesMonthly: 2,
  devicePurchasesYearly: 2,
  recyclingRating: 3,
};

/**
 * Calculates detailed daily and annual carbon footprint metrics (in kg CO2e and Metric Tons)
 */
export function calculateCarbonFootprint(data: FootprintData): CarbonSummary {
  // 1. TRANSPORT SECTOR
  // Regular commuter car calculations (weekly to daily)
  const carFactor =
    data.carType === 'gasoline'
      ? EMISSION_FACTORS.car_gasoline_km
      : data.carType === 'hybrid'
      ? EMISSION_FACTORS.car_hybrid_km
      : data.carType === 'electric'
      ? EMISSION_FACTORS.car_electric_km
      : 0;
  const carDailyKg = (data.carKmWeekly * carFactor) / 7;
  const publicTransitDailyKg = (data.publicTransitHoursWeekly * EMISSION_FACTORS.public_transit_hour) / 7;
  const flightsDailyKg = (data.flightsHoursYearly * EMISSION_FACTORS.flight_hour) / 365;
  const transportDailyKg = carDailyKg + publicTransitDailyKg + flightsDailyKg;

  // 2. ENERGY SECTOR
  // Electricity monthly consumption (adjusted for clean energy percentage)
  const electricityEmissions = data.electricityMonthlyKwh * EMISSION_FACTORS.electricity_kwh;
  const offsetMultiplier = (100 - data.cleanEnergyPercentage) / 100;
  const netElectricityEmissions = electricityEmissions * offsetMultiplier;

  // Natural Gas monthly consumption
  const gasEmissions = data.gasMonthlyTherms * EMISSION_FACTORS.natural_gas_therm;

  // Total household emissions sharing
  const householdDailyShareKg = (netElectricityEmissions + gasEmissions) / 30 / Math.max(1, data.householdSize);
  const energyDailyKg = householdDailyShareKg;

  // 3. DIET & FOOD SECTOR
  const baseDietDailyKg =
    data.dietType === 'meat-heavy'
      ? EMISSION_FACTORS.diet_meat_heavy_daily
      : data.dietType === 'average'
      ? EMISSION_FACTORS.diet_average_daily
      : data.dietType === 'vegetarian'
      ? EMISSION_FACTORS.diet_vegetarian_daily
      : EMISSION_FACTORS.diet_vegan_daily;

  const foodWasteDailyKg =
    data.foodWasteLevel === 'high'
      ? EMISSION_FACTORS.food_waste_high_daily
      : data.foodWasteLevel === 'medium'
      ? EMISSION_FACTORS.food_waste_medium_daily
      : EMISSION_FACTORS.food_waste_low_daily;

  // Local food offsets food emissions by up to 8%
  const localFoodDiscount = (data.localFoodPercentage / 100) * 0.08 * baseDietDailyKg;
  const foodDailyKg = Math.max(1.0, baseDietDailyKg + foodWasteDailyKg - localFoodDiscount);

  // 4. CONSUMPTION & WASTE SECTOR
  const clothingDailyKg = (data.clothingPurchasesMonthly * EMISSION_FACTORS.clothing_item) / 30;
  const devicesDailyKg = (data.devicePurchasesYearly * EMISSION_FACTORS.device_item_yearly) / 365;

  // Recycling rating reduces the general packaging waste emissions
  // Rating 5 reduces base packaging waste by 75%; rating 1 reduces it by 0%.
  const recyclingSavingsFactor = (data.recyclingRating - 1) / 4; // 0 to 1
  const wasteEmissionsReduction = EMISSION_FACTORS.general_waste_daily * 0.75 * recyclingSavingsFactor;
  const baseWasteDailyKg = Math.max(0.4, EMISSION_FACTORS.general_waste_daily - wasteEmissionsReduction);

  const wasteDailyKg = clothingDailyKg + devicesDailyKg + baseWasteDailyKg;

  // TOTAL CALCULATIONS
  const totalDailyKg = transportDailyKg + energyDailyKg + foodDailyKg + wasteDailyKg;
  const totalYearlyTons = (totalDailyKg * 365) / 1000;

  // Percentile calculation representation (Global/Regional references)
  // US Average: ~16 Metric Tons/year per person
  // Europe Average: ~7 Metric Tons/year per person
  // Global Average Target for Climate Neutrality: ~2.0 Metric Tons/year per person
  let percentileText = '';
  if (totalYearlyTons > 12) {
    percentileText = '⚠️ High (60% above standard averages. Focus on transport and home electricity optimization!)';
  } else if (totalYearlyTons > 6.5) {
    percentileText = '📈 Moderate (Close to typical urban averages. Target green energy or high-impact diet swaps.)';
  } else if (totalYearlyTons > 2.5) {
    percentileText = '🌱 Eco-Conscious (Excellent job! You are below average and well on your way to sustainability targets.)';
  } else {
    percentileText = '✨ Earth Champion (Outstanding! Your footprint is compatible with global 1.5°C climate goals!)';
  }

  return {
    transportDailyKg: Number(transportDailyKg.toFixed(2)),
    energyDailyKg: Number(energyDailyKg.toFixed(2)),
    foodDailyKg: Number(foodDailyKg.toFixed(2)),
    wasteDailyKg: Number(wasteDailyKg.toFixed(2)),
    totalDailyKg: Number(totalDailyKg.toFixed(2)),
    totalYearlyTons: Number(totalYearlyTons.toFixed(2)),
    percentileText,
  };
}
