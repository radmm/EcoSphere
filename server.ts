import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Check for required API key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY environment variable is not defined in .env! AI capabilities may fail.');
}

// Lazy init for GoogleGenAI - robust against empty keys on start
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY || 'MOCK_KEY';
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'ecosphere-app',
        },
      },
    });
  }
  return genAIClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Carbon Coach Chat API Proxying
  app.post('/api/coach/chat', async (req, res) => {
    try {
      const { messages, footprintSummary, latestPrompt } = req.body;

      if (!latestPrompt) {
        res.status(400).json({ error: 'latestPrompt is a required parameter.' });
        return;
      }

      // Format contextual carbon profile for the agent
      const summaryText = footprintSummary
        ? `User's Daily Carbon Profile:
- Total Daily Footprint: ${footprintSummary.totalDailyKg} kg CO2e
- Estimated Yearly Footprint: ${footprintSummary.totalYearlyTons} Metric Tons (CO2e)
- Transport Share: ${footprintSummary.transportDailyKg} kg CO2e / day
- Home Energy Share: ${footprintSummary.energyDailyKg} kg CO2e / day
- Food Habits Share: ${footprintSummary.foodDailyKg} kg CO2e / day
- Shopping & Waste Share: ${footprintSummary.wasteDailyKg} kg CO2e / day
- Multiplier Rating status: ${footprintSummary.percentileText}`
        : 'User has not completed the precise footprint profile yet.';

      const systemInstruction = `You are "Sustaina", an expert personal AI Sustainability Coach & Carbon Advisor.
Your purpose is to help individuals understand, track, and strategically reduce their carbon footprint through positive, accessible, realistic lifestyle adjustments.

### CORE PERSONA & VOICE:
- **Scientific but Accessible**: Root your ideas in verifiable environmental science, carbon accounting coefficients, and waste cycle mechanics.
- **Supportive & Non-Judgmental**: Never shame or blame. Praise small changes. Use a warm, empathetic, motivational, and constructive tone.
- **Extremely Actionable**: Give concrete, specific tips. Instead of saying "reduce energy usage", say "try washing laundry in cold water (saves ~0.6kg CO2e per load) or set your smart thermostat 1°C lower in winter."
- **Localized & Relatable**: Use everyday analogies (e.g., comparing kg of carbon to miles driven or phone charging cycles).

### FOOTPRINT DATA AWARENESS:
Use the provided user footprint breakdown to offer hyper-personalized answers:
${summaryText}

If they have high Transport emissions, emphasize biking, carpooling, active commuting, and eco-driving.
If they have high Energy emissions, focus on thermal envelope improvements, vampire draw, thermostat scheduling, and solar grids.
If they have high Food emissions, suggest tasty meat-free alternatives, residual composting, meal-planning to combat food waste, and local crop seasonal calendars.
If they have high Consumption/Waste emissions, highlight thrifting, textile recycling, second-hand reuse, and avoiding single-use containers.

### TASK FOCUS:
You can help with:
1. Answering Q&As about climate science, green-washing, and carbon pricing.
2. Generating a customized green commute comparison (comparing bus, train, hybrid, gas car).
3. Designing an eco-friendly recipe based on current food leftovers to eliminate food waste.
4. Providing a custom 3-step action plan to tackle their highest emissions category.

Keep your responses organized using markdown formatting, bullet points, and highlight metrics (e.g. **-2.3 kg CO2e** saved) in bold. Respond directly and maintain deep engagement without code, technical logging, or meta-references.`;

      // Build discussion log history
      const formattedHistory = (messages || [])
        .map((m: any) => `${m.role === 'user' ? 'User' : 'Sustaina'}: ${m.content}`)
        .join('\n\n');

      const fullPrompt = `${formattedHistory}\n\nUser: ${latestPrompt}\n\nSustaina:`;

      // Fetch from Gemini via @google/genai SDK
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "I was unable to formulate a response at this time. Let's try again!";

      res.json({
        content: responseText,
        systemModel: 'gemini-3.5-flash',
      });
    } catch (err: any) {
      console.error('Gemini SDK integration exception:', err);
      res.status(500).json({
        error: 'AI Sustainability Coach is temporarily recharging. Please try again.',
        details: err.message,
      });
    }
  });

  // Client Static Assets and Vite Middleware Configuration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Carbon Tracker Server listening on port ${PORT} with Vite integration.`);
  });
}

startServer();
