# EcoSphere 🌿

**EcoSphere** is a high-fidelity, interactive, and intelligent carbon footprint auditor, daily lifestyle habit-logger, and AI sustainability companion. It is designed to empower individuals to measure, visualize, and systematically reduce their carbon emission rates using actionable scientific insights.

---

## 🌟 Solution Overview

### Choice of Challenge Vertical
* **Vertical**: Individual Carbon Audit, Habit Tracking, and Personalized AI Coach.
* **Persona**: Supportive, non-judgmental, scientifically precise personal sustainability companion.
* **Mission**: Convert complex carbon accounting parameters into actionable daily habits (such as cold washes, localized dietary additions, and low-waste optimization).

---

## 🚀 Key Features

### 📊 1. Precision Multi-Sector Analytics Dashboard
* **Sector Decomposition**: Splits emissions into four crucial pillars based on real-world consumption models:
  1. **Mobility & Travel**: Gauges private vehicle mileage (gasoline vs. hybrid vs. electric), public transit, and commercial flights.
  2. **Household Utilities**: Models monthly electricity and natural gas consumption against home sizes and renewable clean grid offset multipliers.
  3. **Diet Options**: Tracks dietary profiles (Meat-Heavy, Mixed, Vegetarian, Vegan) alongside grocery transport and food waste metrics.
  4. **Goods & Waste**: Calculates clothes/device cycles and models positive sorting offsets based on household recycling ratings.
* **Interactive SVG Visualization**: Real-time relative bar graphs projecting day-to-day contributions.
* **Equivalencies Calculators**: Translates Metric Tons of CO2e into tangible analogies, like equivalent tree absorption requirements or gasoline miles driven.

### ⚙️ 2. Dynamic Ledgers (Calculator Setup)
* Real-time sliders allow users to adjust commute numbers, billing data, dietary preferences, and recycle ratings.
* Calculated rates update dynamically without page reloads, and the user's custom carbon profile is preserved inside browser `localStorage`.

### ⏱️ 3. Active Eco Actions Logger
* Features a list of target actions (e.g. Meat-Free day, Cold quick-washes, Zero food-waste pledges).
* Logs completions, calculates verified offsets, and rewards "Green Points".
* Keeps an active history log allowing items to be cleared or appended dynamically.

### 💬 4. AI Carbon Coach & Advisor ("Sustaina")
* Powered by server-side Gemini (`gemini-3.5-flash`), integrated via the `@google/genai` TypeScript SDK.
* Context-Aware prompting automatically injects the user's latest computed footprint and logged offsets directly into the systemic discussion, ensuring fully personalized suggestions.
* Includes auto-suggestion chips for instant consulting.

---

## 🧪 Scientific Assumptions & Emission Factors

EcoSphere relies on carbon accounting metrics adapted from guidelines specified by the **U.S. Environmental Protection Agency (EPA)** and the **Intergovernmental Panel on Climate Change (IPCC)**:

| Parameter | Coefficient | Unit | Note |
| :--- | :--- | :--- | :--- |
| **Gasoline Travel** | `0.22` | kg CO2e / km | Average passenger vehicle |
| **Hybrid Travel** | `0.12` | kg CO2e / km | Direct internal hybrid recovery |
| **Electric EV** | `0.05` | kg CO2e / km | Regional electric grid overhead average |
| **Public Transit** | `1.20` | kg CO2e / hour | Combined buses & trains |
| **Commercial Aviation** | `85.0` | kg CO2e / hour | Passenger cruise altitude averages |
| **Household Power** | `0.41` | kg CO2e / kWh | Standard burning fossil fuel grid average |
| **Natural Gas** | `5.30` | kg CO2e / therm | Thermal conversion rates |
| **Meat-Heavy Diet** | `7.20` | kg CO2e / day | High beef/lamb consumption |
| **Omnivore Diet** | `5.00` | kg CO2e / day | Standard mixed crops/meat diet |
| **Vegetarian Diet** | `3.80` | kg CO2e / day | Dairy-inclusive food |
| **Vegan Diet** | `2.80` | kg CO2e / day | Strictly plant-based food |

* **Tree Offsets Calculation**: One adult tree absorbs roughly **25 kg of CO2 per year** (or 1 metric ton of CO2 requires roughly 40 mature trees for yearly absorption).
* **Gasoline Mileage Conversion**: 1 kg of carbon dioxide matches driving a standard passenger car roughly **2.5 miles**.

---

## 🛠️ Code Quality & Architecture

* **Framework Stack**: React 19, TypeScript, styled with Tailwind CSS via the `Sleek Interface` theme presets.
* **State Engines**: High performance local React hooks linked smoothly with local storage trackers.
* **Server Middleware**: Custom Express backend handles endpoint proxies for Gemini API to shield the API key, keeping browser communications clean of sensitive credentials.

---

## 🏃 Getting Started Locally

### 1. Configure the Environment
Create a `.env` file in the root workspace listing your secrets:
```env
GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY"
PORT=3000
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
This runs the full Express API routes alongside the unified client SPA server seamlessly.

---

*EcoSphere encourages conscious changes towards protecting our global biosphere.* 🌎
