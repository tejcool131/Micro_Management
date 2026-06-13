import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const PORT = 3000;

// High-fidelity pre-loaded seed records of rural borrowers for immediate exploration
const seedAssessmentRecords = [
  {
    id: "rec-1",
    clientName: "Ramesh Kumar",
    sector: "Dairy Farming",
    region: "Uttar Pradesh, Western Belt",
    notes: "Ramesh currently owns 4 milkgiving buffaloes. He reports a daily milk sales of roughly 28-32 liters to the local cooperative at ₹42 per liter. Monthly feed costs and veterinary inspections total approx ₹14,000. He is requesting a microloan of ₹80,000 for purchasing an automatic fodder cutter and a biogas digester. His uncle and a village committee member, Prem Chand, vouched strongly for his consistency. He has never missed a payment on village self-help group seed loans of ₹15,000 last year.",
    financials: {
      estimatedMonthlyRevenue: 37800,
      estimatedMonthlyExpenses: 14000,
      estimatedEbitda: 23800,
      debtToEquityRatio: 0.18,
      existingDebtObligations: "₹15,000 informal village self-help seed loan (fully repaid last month)",
      hasPaperLedger: true,
      currencySymbol: "₹"
    },
    alternativeBehavioralMetrics: {
      repayReliabilityIndicator: "Vouched by Village committee leader Prem Chand; stellar repayments in SHG last year",
      characterScore: 9,
      growthPotentialScore: 8,
      familySupportSystemScore: 8,
      climateVulnerabilityScore: 4
    },
    creditViabilityScore: 780,
    decision: "Approved",
    insuranceFit: {
      recommendedProduct: "Cattle Health Guard & Biogas Rig Cover",
      premiumEstimate: "₹240/month",
      triggerConditions: "Insured animal mortality or structural damage to biogas rig"
    },
    empatheticCounseling: {
      toneExplanation: "Ramesh shows strong cashflow and robust cooperative tie-ups with a solid local reference.",
      actionableSteps: [
        "Create a dedicated ledger of cooperative transactions to prove offtake rate",
        "Insure newly acquired assets with our cattle protection policy to mitigate disease vector losses",
        "Consider expanding milk route to adjacent colony next quarter"
      ],
      localizedTalkTrack: "Ramesh ji, aapka cooperative record aur Prem ji ki gawahi bahut badiya hai. Hum fodder cutter ke liye ₹80,000 manzoor kar rahe hain. Bas humara sujhaav hai ki naye buffaloes ko 'Cattle Guard' se bachaaye rakhein taaki bimaari ka dukh na jhelna pade."
    },
    createdAt: "2026-06-11T12:00:00.000Z"
  },
  {
    id: "rec-2",
    clientName: "Amina Al-Hassan",
    sector: "Handloom Weaving & Garments",
    region: "Kano Outer Fringe",
    notes: "Amina has been running a weaving shop from her home for over 4 years. She weaves traditional cotton clothes and sells to 2 local markets. She earns about 95,000 Naira per month on average but weavers face serious cotton supply chain delays during rain season. Her expenses are 40,000 Naira for yarn and dyes. Currently seeking 200,000 Naira for a secondary secondhand weaving machine to train her daughter who will join her. She does not keep formal ledgers but showed three handwritten books with detail of customers.",
    financials: {
      estimatedMonthlyRevenue: 95000,
      estimatedMonthlyExpenses: 40000,
      estimatedEbitda: 55000,
      debtToEquityRatio: 0.0,
      existingDebtObligations: "None",
      hasPaperLedger: true,
      currencySymbol: "₦"
    },
    alternativeBehavioralMetrics: {
      repayReliabilityIndicator: "Keeps meticulous three hand-written customer books showing consistent deposit history",
      characterScore: 8,
      growthPotentialScore: 9,
      familySupportSystemScore: 9,
      climateVulnerabilityScore: 3
    },
    creditViabilityScore: 710,
    decision: "Pre-Approved with Conditions",
    sourceNotes: "Raw notes on weavers cotton supply chain",
    insuranceFit: {
      recommendedProduct: "Handloom Core Asset Shield",
      premiumEstimate: "2,100 NGN/month",
      triggerConditions: "Water seepage or fire damage destroying weaving loom inventory in the residential workstation"
    },
    empatheticCounseling: {
      toneExplanation: "Very high growth capacity and good records but requires proof of steady raw material costs.",
      actionableSteps: [
        "Take photos of weaving logs and cotton purchase invoices weekly to generate a digital trail",
        "Formulate a steady group buy with neighboring weavers to shield dye price spikes",
        "Enroll daughter as co-applicant to solidify operational continuity"
      ],
      localizedTalkTrack: "Amina, your customer records are extremely clear and very neat! We can provide a pre-approval of 200k Nairas, but we would love for you to start noting down yarn purchase dates. This will shield you against sudden price raises."
    },
    createdAt: "2026-06-10T10:30:00.000Z"
  },
  {
    id: "rec-3",
    clientName: "Maria Santos",
    sector: "Horticulture & Small Farm Stalls",
    region: "Davao Del Sur, rural zone",
    notes: "Maria runs a roadside vegetable and mango stall. Her crops are highly vulnerable to typhoon seasons. Currently, the farm has a debt of 35k PHP borrowed from a local informal money-lender at 15% monthly interest. She wants a ₹50,000 (roughly 35,000 PHP equivalent) microfinance loan to pay off this high-interest debt and secure seed supplies. She has no land title, only a temporary cultivation permit. The note indicates she suffered substantial crop losses during the heavy rain last November, leading to her high-interest borrowing under distress.",
    financials: {
      estimatedMonthlyRevenue: 28000,
      estimatedMonthlyExpenses: 18000,
      estimatedEbitda: 10000,
      debtToEquityRatio: 0.85,
      existingDebtObligations: "35,000 PHP informal distress debt (currently at predatory 15% monthly interest)",
      hasPaperLedger: false,
      currencySymbol: "₱"
    },
    alternativeBehavioralMetrics: {
      repayReliabilityIndicator: "High willingness helper, active in Barangay community council; struggling with high-interest debt loop",
      characterScore: 7,
      growthPotentialScore: 6,
      familySupportSystemScore: 6,
      climateVulnerabilityScore: 9
    },
    creditViabilityScore: 490,
    decision: "Referred to Insurance",
    insuranceFit: {
      recommendedProduct: "Typhoon Index Crop-Loss Cover & Debt Restructuring",
      premiumEstimate: "450 PHP/month",
      triggerConditions: "Wind speed > 115 km/h or extreme rain anomaly over Davao station during typhoon months"
    },
    empatheticCounseling: {
      toneExplanation: "Highly vulnerable to climate shock, locked in a predatory microfinance trap. High risk for direct traditional loan without relief.",
      actionableSteps: [
        "Refinance predatory debt immediately using low-interest restructuring facility",
        "Engage in cooperative-managed weather protection scheme rather than separate farming",
        "Acquire index-based micro-insurance to cover seed cost in the next planting cycle"
      ],
      localizedTalkTrack: "Maria, your farm's output is good but the private debt at 15% interest is weighing you down significantly. We want to help you restructure this debt with low-rate relief, but we must pair it with a typhoon weather protection cover to keep you safe from heavy rains."
    },
    createdAt: "2026-06-09T14:15:00.000Z"
  }
];

// In-memory array of active records added or evaluated during the app session
let dynamicRecords = [...seedAssessmentRecords];

let aiInstance: GoogleGenAI | null = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the workspace secrets. Access the Secrets panel to configure it.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoints

  // 1. Get all assessment records (combining seed data and newly evaluated ones)
  app.get("/api/records", (req, res) => {
    res.json({ success: true, records: dynamicRecords });
  });

  // 2. Perform the agentic parsing and behavioral scoring of raw notes
  app.post("/api/analyze-notes", async (req, res) => {
    try {
      const { notes, clientName, sector, region } = req.body;

      if (!notes || notes.trim() === "") {
        return res.status(400).json({ success: false, error: "Raw field notes cannot be empty." });
      }

      // Check if API key is present
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          success: false,
          error: "GEMINI_API_KEY is missing. Please go to the AI Studio 'Settings > Secrets' menu and provide a valid Gemini API Key to enable agentic processing."
        });
      }

      const client = getGeminiClient();

      const promptHtml = `
        You are an advanced credit scoring specialist, financial advisor, and agricultural/weaving micro-risk underwriter.
        Your task is to analyze field notes taken by rural microfinance field agents. These notes are qualitative, unstructured, and contain colloquial descriptions of income, expenses, family size, local reputation, crop health, village gossip, and asset ownership.

        Analyze the following unstructured raw field notes and pull out:
        1. Full Client Name (use provided name "${clientName || ""}" as fallback if not in notes)
        2. Business Sector (use "${sector || ""}" as fallback)
        3. Local Region (use "${region || ""}" as fallback)
        4. Estimated Monthly Financials (Revenue, Expenses, EBITDA, existing obligations, and appropriate local currency symbol)
        5. Alternative Behavioral Metrics (repayment reliability indicator, character estimation score out of 10, growth potential out of 10, family support out of 10, climate vulnerability out of 10)
        6. Credit Viability Score (A hybrid index similar to FICO but calibrated for local thin-file micro-credit - between 300 to 850)
        7. Credit Decision (Must be one of: "Approved", "Pre-Approved with Conditions", "Referred to Insurance", or "Rejected")
        8. Alternative Micro-Insurance recommendations that would help de-risk them
        9. Localized Counseling Script (how to read the news to them, localized talk track, actionable suggestions to improve viability)

        **RAW FIELD NOTES TO PROCESS**:
        """
        Holdings and background: ${notes}
        """

        Think objectively to calculate metrics based on cash sales, feed/yarn/material pricing, and community references. If currency isn't mentioned, infer from context/region.
        Keep all textual explanations, localized talk tracks, and descriptions extremely concise (maximum 1-2 short sentences each). Limit the actionable suggestions to exactly 3 brief bullet points.
        Return valid structured JSON matching the requested schema. Ensure language/localized talk track is supportive and empathetic in local context/tone.
      `;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptHtml,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clientName: { type: Type.STRING },
              sector: { type: Type.STRING },
              region: { type: Type.STRING },
              financials: {
                type: Type.OBJECT,
                properties: {
                  estimatedMonthlyRevenue: { type: Type.NUMBER, description: "Monthly raw incoming revenues estimated from notes (normalized to local currency or generic value)" },
                  estimatedMonthlyExpenses: { type: Type.NUMBER, description: "Total raw monthly operation expenses" },
                  estimatedEbitda: { type: Type.NUMBER, description: "Revenue minus expenses" },
                  debtToEquityRatio: { type: Type.NUMBER, description: "Approx ratio or estimate" },
                  existingDebtObligations: { type: Type.STRING },
                  hasPaperLedger: { type: Type.BOOLEAN, description: "Is there any mention of written or notebook records?" },
                  currencySymbol: { type: Type.STRING, description: "The local currency symbol based on region and context (e.g. ₹, ₦, ₱, $, S/., Q, Sh, etc.)" }
                },
                required: ["estimatedMonthlyRevenue", "estimatedMonthlyExpenses", "estimatedEbitda", "currencySymbol"]
              },
              alternativeBehavioralMetrics: {
                type: Type.OBJECT,
                properties: {
                  repayReliabilityIndicator: { type: Type.STRING },
                  characterScore: { type: Type.INTEGER },
                  growthPotentialScore: { type: Type.INTEGER },
                  familySupportSystemScore: { type: Type.INTEGER },
                  climateVulnerabilityScore: { type: Type.INTEGER }
                },
                required: ["repayReliabilityIndicator", "characterScore", "growthPotentialScore", "familySupportSystemScore", "climateVulnerabilityScore"]
              },
              creditViabilityScore: { type: Type.INTEGER },
              decision: { type: Type.STRING, description: 'Must be "Approved", "Pre-Approved with Conditions", "Referred to Insurance", or "Rejected"' },
              insuranceFit: {
                type: Type.OBJECT,
                properties: {
                  recommendedProduct: { type: Type.STRING },
                  premiumEstimate: { type: Type.STRING },
                  triggerConditions: { type: Type.STRING }
                },
                required: ["recommendedProduct", "premiumEstimate"]
              },
              empatheticCounseling: {
                type: Type.OBJECT,
                properties: {
                  toneExplanation: { type: Type.STRING },
                  actionableSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  localizedTalkTrack: { type: Type.STRING }
                },
                required: ["toneExplanation", "actionableSteps", "localizedTalkTrack"]
              }
            },
            required: ["clientName", "sector", "region", "financials", "alternativeBehavioralMetrics", "creditViabilityScore", "decision", "insuranceFit", "empatheticCounseling"]
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error("No output generated from Gemini API");
      }

      const cleanJson = JSON.parse(textOutput.trim());

      // Save record in our memory list
      const newRecord = {
        id: `rec-${Date.now()}`,
        clientName: cleanJson.clientName || clientName || "Anonymous Client",
        sector: cleanJson.sector || sector || "Rural Sector",
        region: cleanJson.region || region || "Rural Outskirts",
        notes: notes,
        financials: {
          ...cleanJson.financials,
          currencySymbol: cleanJson.financials.currencySymbol || "$"
        },
        alternativeBehavioralMetrics: cleanJson.alternativeBehavioralMetrics,
        creditViabilityScore: cleanJson.creditViabilityScore || 600,
        decision: cleanJson.decision || "Pre-Approved with Conditions",
        insuranceFit: cleanJson.insuranceFit,
        empatheticCounseling: cleanJson.empatheticCounseling,
        createdAt: new Date().toISOString()
      };

      dynamicRecords.unshift(newRecord);
      res.json({ success: true, record: newRecord });

    } catch (error: any) {
      console.error("Analysis Exception: ", error);
      res.status(500).json({
        success: false,
        error: error.message || "An error occurred during Gemini AI notes parsing."
      });
    }
  });

  // 3. Delete a record (to keep data fresh/clean)
  app.delete("/api/records/:id", (req, res) => {
    const { id } = req.params;
    dynamicRecords = dynamicRecords.filter(r => r.id !== id);
    res.json({ success: true, id });
  });

  // Serve static assets or mount Vite Dev Server middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Root Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
