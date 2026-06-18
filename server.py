import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types
import time

# Load environment variables
load_dotenv()

app = FastAPI(title="Microfinance AI Copilot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed records
seed_records = [
    {
        "id": "rec-1",
        "clientName": "Ramesh Kumar",
        "sector": "Dairy Farming",
        "region": "Uttar Pradesh, Western Belt",
        "notes": "Ramesh currently owns 4 milkgiving buffaloes. He reports a daily milk sales of roughly 28-32 liters to the local cooperative at ₹42 per liter. Monthly feed costs and veterinary inspections total approx ₹14,000. He is requesting a microloan of ₹80,000 for purchasing an automatic fodder cutter and a biogas digester. His uncle and a village committee member, Prem Chand, vouched strongly for his consistency. He has never missed a payment on village self-help group seed loans of ₹15,000 last year.",
        "financials": {
            "estimatedMonthlyRevenue": 37800,
            "estimatedMonthlyExpenses": 14000,
            "estimatedEbitda": 23800,
            "debtToEquityRatio": 0.18,
            "existingDebtObligations": "₹15,000 informal village self-help seed loan (fully repaid last month)",
            "hasPaperLedger": True,
            "currencySymbol": "₹"
        },
        "alternativeBehavioralMetrics": {
            "repayReliabilityIndicator": "Vouched by Village committee leader Prem Chand; stellar repayments in SHG last year",
            "characterScore": 9,
            "growthPotentialScore": 8,
            "familySupportSystemScore": 8,
            "climateVulnerabilityScore": 4
        },
        "creditViabilityScore": 780,
        "decision": "Approved",
        "insuranceFit": {
            "recommendedProduct": "Cattle Health Guard & Biogas Rig Cover",
            "premiumEstimate": "₹240/month",
            "triggerConditions": "Insured animal mortality or structural damage to biogas rig"
        },
        "empatheticCounseling": {
            "toneExplanation": "Ramesh shows strong cashflow and robust cooperative tie-ups with a solid local reference.",
            "actionableSteps": [
                "Create a dedicated ledger of cooperative transactions to prove offtake rate",
                "Insure newly acquired assets with our cattle protection policy to mitigate disease vector losses",
                "Consider expanding milk route to adjacent colony next quarter"
            ],
            "localizedTalkTrack": "Ramesh ji, aapka cooperative record aur Prem ji ki gawahi bahut badiya hai. Hum fodder cutter ke liye ₹80,000 manzoor kar rahe hain. Bas humara sujhaav hai ki naye buffaloes ko 'Cattle Guard' se bachaaye rakhein taaki bimaari ka dukh na jhelna pade."
        },
        "createdAt": "2026-06-11T12:00:00.000Z"
    },
    {
        "id": "rec-2",
        "clientName": "Amina Al-Hassan",
        "sector": "Handloom Weaving & Garments",
        "region": "Kano Outer Fringe",
        "notes": "Amina has been running a weaving shop from her home for over 4 years. She weaves traditional cotton clothes and sells to 2 local markets. She earns about 95,000 Naira per month on average but weavers face serious cotton supply chain delays during rain season. Her expenses are 40,000 Naira for yarn and dyes. Currently seeking 200,000 Naira for a secondary secondhand weaving machine to train her daughter who will join her. She does not keep formal ledgers but showed three handwritten books with detail of customers.",
        "financials": {
            "estimatedMonthlyRevenue": 95000,
            "estimatedMonthlyExpenses": 40000,
            "estimatedEbitda": 55000,
            "debtToEquityRatio": 0.0,
            "existingDebtObligations": "None",
            "hasPaperLedger": True,
            "currencySymbol": "₦"
        },
        "alternativeBehavioralMetrics": {
            "repayReliabilityIndicator": "Keeps meticulous three hand-written customer books showing consistent deposit history",
            "characterScore": 8,
            "growthPotentialScore": 9,
            "familySupportSystemScore": 9,
            "climateVulnerabilityScore": 3
        },
        "creditViabilityScore": 710,
        "decision": "Pre-Approved with Conditions",
        "insuranceFit": {
            "recommendedProduct": "Handloom Core Asset Shield",
            "premiumEstimate": "2,100 NGN/month",
            "triggerConditions": "Water seepage or fire damage destroying weaving loom inventory in the residential workstation"
        },
        "empatheticCounseling": {
            "toneExplanation": "Very high growth capacity and good records but requires proof of steady raw material costs.",
            "actionableSteps": [
                "Take photos of weaving logs and cotton purchase invoices weekly to generate a digital trail",
                "Formulate a steady group buy with neighboring weavers to shield dye price spikes",
                "Enroll daughter as co-applicant to solidify operational continuity"
            ],
            "localizedTalkTrack": "Amina, your customer records are extremely clear and very neat! We can provide a pre-approval of 200k Nairas, but we would love for you to start noting down yarn purchase dates. This will shield you against sudden price raises."
        },
        "createdAt": "2026-06-10T10:30:00.000Z"
    },
    {
        "id": "rec-3",
        "clientName": "Maria Santos",
        "sector": "Horticulture & Small Farm Stalls",
        "region": "Davao Del Sur, rural zone",
        "notes": "Maria runs a roadside vegetable and mango stall. Her crops are highly vulnerable to typhoon seasons. Currently, the farm has a debt of 35k PHP borrowed from a local informal money-lender at 15% monthly interest. She wants a ₹50,000 (roughly 35,000 PHP equivalent) microfinance loan to pay off this high-interest debt and secure seed supplies. She has no land title, only a temporary cultivation permit. The note indicates she suffered substantial crop losses during the heavy rain last November, leading to her high-interest borrowing under distress.",
        "financials": {
            "estimatedMonthlyRevenue": 28000,
            "estimatedMonthlyExpenses": 18000,
            "estimatedEbitda": 10000,
            "debtToEquityRatio": 0.85,
            "existingDebtObligations": "35,000 PHP informal distress debt (currently at predatory 15% monthly interest)",
            "hasPaperLedger": False,
            "currencySymbol": "₱"
        },
        "alternativeBehavioralMetrics": {
            "repayReliabilityIndicator": "High willingness helper, active in Barangay community council; struggling with high-interest debt loop",
            "characterScore": 7,
            "growthPotentialScore": 6,
            "familySupportSystemScore": 6,
            "climateVulnerabilityScore": 9
        },
        "creditViabilityScore": 490,
        "decision": "Referred to Insurance",
        "insuranceFit": {
            "recommendedProduct": "Typhoon Index Crop-Loss Cover & Debt Restructuring",
            "premiumEstimate": "450 PHP/month",
            "triggerConditions": "Wind speed > 115 km/h or extreme rain anomaly over Davao station during typhoon months"
        },
        "empatheticCounseling": {
            "toneExplanation": "Highly vulnerable to climate shock, locked in a predatory microfinance trap. High risk for direct traditional loan without relief.",
            "actionableSteps": [
                "Refinance predatory debt immediately using low-interest restructuring facility",
                "Engage in cooperative-managed weather protection scheme rather than separate farming",
                "Acquire index-based micro-insurance to cover seed cost in the next planting cycle"
            ],
            "localizedTalkTrack": "Maria, your farm's output is good but the private debt at 15% interest is weighing you down significantly. We want to help you restructure this debt with low-rate relief, but we must pair it with a typhoon weather protection cover to keep you safe from heavy rains."
        },
        "createdAt": "2026-06-09T14:15:00.000Z"
    }
]

dynamic_records = list(seed_records)

# Define schemas for Google GenAI SDK structured outputs
class FinancialsSchema(BaseModel):
    estimatedMonthlyRevenue: float = Field(description="Monthly raw incoming revenues estimated from notes (normalized to local currency or generic value)")
    estimatedMonthlyExpenses: float = Field(description="Total raw monthly operation expenses")
    estimatedEbitda: float = Field(description="Revenue minus expenses")
    debtToEquityRatio: float = Field(description="Approx ratio or estimate")
    existingDebtObligations: str
    hasPaperLedger: bool = Field(description="Is there any mention of written or notebook records?")
    currencySymbol: str = Field(description="The local currency symbol based on region and context (e.g. ₹, ₦, ₱, $, S/., Q, Sh, etc.)")

class AlternativeBehavioralMetricsSchema(BaseModel):
    repayReliabilityIndicator: str
    characterScore: int
    growthPotentialScore: int
    familySupportSystemScore: int
    climateVulnerabilityScore: int

class InsuranceFitSchema(BaseModel):
    recommendedProduct: str
    premiumEstimate: str
    triggerConditions: str

class EmpatheticCounselingSchema(BaseModel):
    toneExplanation: str
    actionableSteps: List[str]
    localizedTalkTrack: str

class AssessmentSchema(BaseModel):
    clientName: str
    sector: str
    region: str
    financials: FinancialsSchema
    alternativeBehavioralMetrics: AlternativeBehavioralMetricsSchema
    creditViabilityScore: int
    decision: str = Field(description='Must be "Approved", "Pre-Approved with Conditions", "Referred to Insurance", or "Rejected"')
    insuranceFit: InsuranceFitSchema
    empatheticCounseling: EmpatheticCounselingSchema

# Request body for analyze endpoint
class AnalyzeRequest(BaseModel):
    notes: str
    clientName: Optional[str] = ""
    sector: Optional[str] = ""
    region: Optional[str] = ""

@app.get("/api/records")
def get_records():
    return {"success": True, "records": dynamic_records}

@app.post("/api/analyze-notes")
def analyze_notes(payload: AnalyzeRequest):
    notes = payload.notes
    client_name = payload.clientName
    sector = payload.sector
    region = payload.region

    if not notes or not notes.strip():
        raise HTTPException(status_code=400, detail="Raw field notes cannot be empty.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="GEMINI_API_KEY is missing. Please provide a valid Gemini API Key to enable agentic processing."
        )

    try:
        # Initialize Google GenAI client
        client = genai.Client(api_key=api_key)

        prompt_html = f"""
        You are an advanced credit scoring specialist, financial advisor, and agricultural/weaving micro-risk underwriter.
        Your task is to analyze field notes taken by rural microfinance field agents. These notes are qualitative, unstructured, and contain colloquial descriptions of income, expenses, family size, local reputation, crop health, village gossip, and asset ownership.

        Analyze the following unstructured raw field notes and pull out:
        1. Full Client Name (use provided name "{client_name or ''}" as fallback if not in notes)
        2. Business Sector (use "{sector or ''}" as fallback)
        3. Local Region (use "{region or ''}" as fallback)
        4. Estimated Monthly Financials (Revenue, Expenses, EBITDA, existing obligations, and appropriate local currency symbol)
        5. Alternative Behavioral Metrics (repayment reliability indicator, character estimation score out of 10, growth potential out of 10, family support out of 10, climate vulnerability out of 10)
        6. Credit Viability Score (A hybrid index similar to FICO but calibrated for local thin-file micro-credit - between 300 to 850)
        7. Credit Decision (Must be one of: "Approved", "Pre-Approved with Conditions", "Referred to Insurance", or "Rejected")
        8. Alternative Micro-Insurance recommendations that would help de-risk them
        9. Localized Counseling Script (how to read the news to them, localized talk track, actionable suggestions to improve viability)

        **RAW FIELD NOTES TO PROCESS**:
        \"\"\"
        Holdings and background: {notes}
        \"\"\"

        Think objectively to calculate metrics based on cash sales, feed/yarn/material pricing, and community references. If currency isn't mentioned, infer from context/region.
        Keep all textual explanations, localized talk tracks, and descriptions extremely concise (maximum 1-2 short sentences each). Limit the actionable suggestions to exactly 3 brief bullet points.
        Return valid structured JSON matching the requested schema. Ensure language/localized talk track is supportive and empathetic in local context/tone.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt_html,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AssessmentSchema,
            )
        )

        import json
        clean_json = json.loads(response.text.strip())

        new_record = {
            "id": f"rec-{int(time.time() * 1000)}",
            "clientName": clean_json.get("clientName") or client_name or "Anonymous Client",
            "sector": clean_json.get("sector") or sector or "Rural Sector",
            "region": clean_json.get("region") or region or "Rural Outskirts",
            "notes": notes,
            "financials": clean_json.get("financials", {}),
            "alternativeBehavioralMetrics": clean_json.get("alternativeBehavioralMetrics", {}),
            "creditViabilityScore": clean_json.get("creditViabilityScore") or 600,
            "decision": clean_json.get("decision") or "Pre-Approved with Conditions",
            "insuranceFit": clean_json.get("insuranceFit", {}),
            "empatheticCounseling": clean_json.get("empatheticCounseling", {}),
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
        }

        dynamic_records.insert(0, new_record)
        return {"success": True, "record": new_record}

    except Exception as e:
        import traceback
        print("Analysis Exception: ", e)
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e) or "An error occurred during Gemini AI notes parsing."
            }
        )

@app.delete("/api/records/{record_id}")
def delete_record(record_id: str):
    global dynamic_records
    dynamic_records = [r for r in dynamic_records if r["id"] != record_id]
    return {"success": True, "id": record_id}

# Serve static files in production if dist directory exists
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="static")

    # Add a fallback route for SPA client-side routing
    @app.get("/{catchall:path}")
    def read_index(catchall: str):
        index_path = os.path.join("dist", "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

if __name__ == "__main__":
    import uvicorn
    # Default to 3000 in production, or read PORT env var
    port = int(os.getenv("PORT", 3000))
    print(f"[FastAPI] Starting server on http://0.0.0.0:{port}")
    uvicorn.run("server:app", host="0.0.0.0", port=port)
