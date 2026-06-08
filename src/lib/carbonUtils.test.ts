import { describe, it, expect } from 'vitest';
import { calculateCarbonFootprint, EMISSION_FACTORS, INITIAL_FOOTPRINT_DATA } from './carbonUtils';
import { FootprintData } from '../types';

describe('Carbon Calculator Calculations', () => {
  it('should calculate transport emissions accurately matching README coefficients', () => {
    const testData: FootprintData = {
      ...INITIAL_FOOTPRINT_DATA,
      carKmWeekly: 200,
      carType: 'gasoline',
      publicTransitHoursWeekly: 5,
      flightsHoursYearly: 10,
    };

    const summary = calculateCarbonFootprint(testData);

    // Gasoline commuter emissions calculation:
    // (200 km * 0.22) / 7 = 6.2857 kg / day
    const expectedCarDaily = (200 * EMISSION_FACTORS.car_gasoline_km) / 7;
    // Transit: (5 hr * 1.2) / 7 = 0.8571 kg / day
    const expectedTransitDaily = (5 * EMISSION_FACTORS.public_transit_hour) / 7;
    // Aviation: (10 hr * 85.0) / 365 = 2.3288 kg / day
    const expectedAviationDaily = (10 * EMISSION_FACTORS.flight_hour) / 365;

    const expectedTotalTransport = expectedCarDaily + expectedTransitDaily + expectedAviationDaily;
    expect(summary.transportDailyKg).toBeCloseTo(expectedTotalTransport, 1);
  });

  it('should verify electric and hybrid vehicles use correct fainted coefficients', () => {
    const gasolineData: FootprintData = { ...INITIAL_FOOTPRINT_DATA, carKmWeekly: 350, carType: 'gasoline' };
    const hybridData: FootprintData = { ...INITIAL_FOOTPRINT_DATA, carKmWeekly: 350, carType: 'hybrid' };
    const electricData: FootprintData = { ...INITIAL_FOOTPRINT_DATA, carKmWeekly: 350, carType: 'electric' };
    const noneData: FootprintData = { ...INITIAL_FOOTPRINT_DATA, carKmWeekly: 350, carType: 'none' };

    const gasSummary = calculateCarbonFootprint(gasolineData);
    const hybridSummary = calculateCarbonFootprint(hybridData);
    const electricSummary = calculateCarbonFootprint(electricData);
    const noneSummary = calculateCarbonFootprint(noneData);

    const expectedGas = (350 * 0.22) / 7;
    const expectedHybrid = (350 * 0.12) / 7;
    const expectedElectric = (350 * 0.05) / 7;
    const expectedNone = 0;

    expect(gasSummary.transportDailyKg).toBeCloseTo(expectedGas + (INITIAL_FOOTPRINT_DATA.publicTransitHoursWeekly * 1.2) / 7 + (INITIAL_FOOTPRINT_DATA.flightsHoursYearly * 85) / 365, 1);
    expect(hybridSummary.transportDailyKg).toBeCloseTo(expectedHybrid + (INITIAL_FOOTPRINT_DATA.publicTransitHoursWeekly * 1.2) / 7 + (INITIAL_FOOTPRINT_DATA.flightsHoursYearly * 85) / 365, 1);
    expect(electricSummary.transportDailyKg).toBeCloseTo(expectedElectric + (INITIAL_FOOTPRINT_DATA.publicTransitHoursWeekly * 1.2) / 7 + (INITIAL_FOOTPRINT_DATA.flightsHoursYearly * 85) / 365, 1);
    expect(noneSummary.transportDailyKg).toBeCloseTo(expectedNone + (INITIAL_FOOTPRINT_DATA.publicTransitHoursWeekly * 1.2) / 7 + (INITIAL_FOOTPRINT_DATA.flightsHoursYearly * 85) / 365, 1);
  });

  it('should calculate household utility carbon emissions accounting for clean energy percentage and sharing', () => {
    const testData: FootprintData = {
      ...INITIAL_FOOTPRINT_DATA,
      electricityMonthlyKwh: 400,
      gasMonthlyTherms: 20,
      cleanEnergyPercentage: 30, // 30% clean renewable energy
      householdSize: 4, // divided by 4 members
    };

    const summary = calculateCarbonFootprint(testData);

    // Electricity emissions: 400 kWh * 0.41 = 164 kg CO2e
    // Adjusted electricity (30% offset): 164 * (100 - 30) / 100 = 114.8 kg CO2e
    const electricityEmissions = 400 * EMISSION_FACTORS.electricity_kwh;
    const netElectricity = electricityEmissions * 0.7;

    // Natural gas emissions: 20 therms * 5.30 = 106 kg CO2e
    const gasEmissions = 20 * EMISSION_FACTORS.natural_gas_therm;

    // Per member daily share: (114.8 + 106) / 30 / 4 = 1.84 kg / day
    const expectedEnergyTotal = (netElectricity + gasEmissions) / 30 / 4;

    expect(summary.energyDailyKg).toBeCloseTo(expectedEnergyTotal, 1);
  });

  it('should handle food diet choices, local sourcing discounts and zero food waste factor', () => {
    const veganData: FootprintData = {
      ...INITIAL_FOOTPRINT_DATA,
      dietType: 'vegan',
      foodWasteLevel: 'low',
      localFoodPercentage: 50, // 50% local food percentage
    };

    const summary = calculateCarbonFootprint(veganData);

    // Base diet vegan daily is 2.80 kg CO2e
    // Low food waste is 0.10 kg CO2e
    // Local food discount is 50% * 0.08 * 2.80 = 0.112 kg CO2e
    // Total food: 2.80 + 0.10 - 0.112 = 2.788 kg CO2e
    const expectedFoodDaily = 2.80 + 0.10 - (0.5 * 0.08 * 2.80);
    expect(summary.foodDailyKg).toBeCloseTo(expectedFoodDaily, 1);
  });

  it('should output the correct climate status classification and percentile wording', () => {
    const championData: FootprintData = {
      ...INITIAL_FOOTPRINT_DATA,
      carKmWeekly: 0,
      carType: 'none',
      publicTransitHoursWeekly: 0,
      flightsHoursYearly: 0,
      electricityMonthlyKwh: 0,
      gasMonthlyTherms: 0,
      cleanEnergyPercentage: 100,
      householdSize: 5,
      dietType: 'vegan',
      foodWasteLevel: 'low',
      localFoodPercentage: 100,
      clothingPurchasesMonthly: 0,
      devicePurchasesYearly: 0,
      recyclingRating: 5,
    };

    const summary = calculateCarbonFootprint(championData);
    expect(summary.totalYearlyTons).toBeLessThan(2.5);
    expect(summary.percentileText).toContain('Earth Champion');
  });
});
