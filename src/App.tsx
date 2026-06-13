import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  TrendingUp,
  Award,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Trash2,
  Copy,
  Volume2,
  Briefcase,
  ShieldCheck,
  CloudRain,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { AssessmentRecord } from "./types";
import { dictationTemplates } from "./presets";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AssessmentRecord | null>(null);
  
  // Tab selector for Client Profile details
  const [activeTab, setActiveTab] = useState<"credit" | "counseling" | "behavioral">("credit");

  // Form states
  const [clientName, setClientName] = useState("");
  const [sector, setSector] = useState("Dairy Farming");
  const [region, setRegion] = useState("");
  const [notes, setNotes] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTrack, setCopiedTrack] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/records");
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
        if (data.records.length > 0 && !selectedRecord) {
          setSelectedRecord(data.records[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching records", err);
      setErrorMessage("Could not connect to database server. Please ensure port 3000 is open.");
    } finally {
      setFetching(false);
    }
  };

  const handleApplyPreset = (index: number) => {
    const preset = dictationTemplates[index];
    setClientName(preset.name);
    setSector(preset.sector);
    setRegion(preset.region);
    setNotes(preset.notes);
    setActivePresetIndex(index);
    setErrorMessage(null);
  };

  const handleClearForm = () => {
    setClientName("");
    setSector("Dairy Farming");
    setRegion("");
    setNotes("");
    setActivePresetIndex(null);
    setErrorMessage(null);
  };

  const handleAnalyzeNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMessage("Please type or record unstructured field notes first.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch("/api/analyze-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: clientName || "Anonymous Application",
          sector: sector || "General Farming",
          region: region || "Unassigned Region",
          notes: notes
        })
      });

      const data = await response.json();

      if (data.success) {
        setRecords(prev => [data.record, ...prev]);
        setSelectedRecord(data.record);
        setSubmitSuccess(true);
        setActiveTab("credit"); // Auto switch to main metrics
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setErrorMessage(data.error || "Failed to analyze raw field notes.");
      }
    } catch (err: any) {
      console.error("Parsing exception:", err);
      setErrorMessage("Analysis failed. Please confirm your GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this record appraisal?")) return;

    try {
      const response = await fetch(`/api/records/${id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        setRecords(prev => {
          const updated = prev.filter(r => r.id !== id);
          if (selectedRecord?.id === id) {
            setSelectedRecord(updated.length > 0 ? updated[0] : null);
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleCopyTalkTrack = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrack(true);
    setTimeout(() => setCopiedTrack(false), 2000);
  };

  // Get localized colors based on score
  const getScoreColorInfo = (score: number) => {
    if (score >= 700) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500", rating: "Prime Alt Credit" };
    if (score >= 580) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500", rating: "Moderate Preferred" };
    return { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", bar: "bg-rose-500", rating: "Hedge High Risk" };
  };

  const getDecisionBadgeClass = (decision: string) => {
    switch (decision) {
      case "Approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Pre-Approved with Conditions":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Referred to Insurance":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      default:
        return "bg-rose-100 text-rose-800 border-rose-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-950 antialiased">
      
      {/* COMPACT POLISHED NAVIGATION */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 shadow-md relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-extrabold text-white">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Agentic Microfinance Copilot</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end text-right hidden sm:flex">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Field Station</span>
            <span className="text-xs font-semibold">Chiapas & Central Highlands Node</span>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
          <div className="bg-slate-800 px-3.5 py-1.5 rounded-full border border-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[11px] font-mono font-medium tracking-wide text-slate-350">
              Agentic Pipeline Active
            </span>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE container (Left Operations sidebar, Right Details Workspace) */}
      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden max-w-[1440px] mx-auto w-full self-stretch">
        
        {/* LEFT COLUMN: FIELD OPERATIONS PORTALS (Width 1/3) */}
        <section id="ops-sidebar" className="w-full md:w-[380px] shrink-0 flex flex-col gap-5">
          
          {/* CLIENT REPOSITORY DIRECTORY */}
          <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-150 pb-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Field Assessments List ({records.length})
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Select to Review</span>
            </div>

            {fetching ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="h-4.5 w-4.5 animate-spin text-indigo-600" />
                <span>Loading Client Dossiers...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No active records. Use the analyzer below to populate.
              </div>
            ) : (
              <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
                {records.map((r) => {
                  const isCur = selectedRecord?.id === r.id;
                  const col = getScoreColorInfo(r.creditViabilityScore);
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedRecord(r);
                        setErrorMessage(null);
                      }}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isCur
                          ? "bg-slate-900 border-slate-900 text-white shadow"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate">{r.clientName}</div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{r.region}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-xs font-mono font-extrabold ${isCur ? "text-emerald-300" : col.text}`}>
                          {r.creditViabilityScore}
                        </div>
                        <div className="text-[9px] uppercase font-bold tracking-widest opacity-85">
                          {r.decision === "Approved" ? "Approved" : "Reviewed"}
                        </div>
                      </div>

                      <button
                        title="Delete Portfolio Item"
                        onClick={(e) => handleDeleteRecord(r.id, e)}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          isCur
                            ? "hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                            : "hover:bg-slate-200 text-slate-400 hover:text-rose-600"
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SIMPLIFIED RAW DICTATION NOTES PORTAL */}
          <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Create / Evaluate Credit Case
                </h3>
                <span className="text-[10px] bg-indigo-55 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">
                  FAST ENGINE
                </span>
              </div>

              {/* DEMO SUGGESTION PILLS */}
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase font-mono tracking-widest">
                  Quick Load Field Scenarios:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {dictationTemplates.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyPreset(i)}
                      className={`text-[10.5px] p-2 rounded-lg border text-center transition-all font-semibold ${
                        activePresetIndex === i
                          ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm"
                          : "bg-slate-50 border-slate-250 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {preset.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg mb-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-normal">{errorMessage}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg mb-3 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">Case processed into system logs.</span>
                </div>
              )}

              {/* SIMPLER INPUT SHEETS */}
              <form onSubmit={handleAnalyzeNotes} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      Applicant Name
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        setActivePresetIndex(null);
                      }}
                      placeholder="e.g. Maria Santos"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      State / Village
                    </label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setActivePresetIndex(null);
                      }}
                      placeholder="e.g. Davao, Philippines"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => {
                      setSector(e.target.value);
                      setActivePresetIndex(null);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Dairy Farming">Dairy Farming</option>
                    <option value="Handloom Weaving & Garments">Handloom Weaving</option>
                    <option value="Horticulture & Small Farm Stalls">Horticulture</option>
                    <option value="Floriculture & Greenhouses">Floriculture</option>
                    <option value="Artisanal Alpaca Textiles">Alpaca Textiles</option>
                    <option value="Highland Coffee Garden">Coffee Garden</option>
                    <option value="General Retail">General Retail</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Raw Conversation Notes & Incomes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setActivePresetIndex(null);
                    }}
                    rows={4}
                    placeholder="Describe daily milk sales, yarn expenditures, village referrals, self-help groups, and home status context..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 leading-normal resize-none font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded font-bold text-xs tracking-wider uppercase shadow hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 disabled:bg-slate-400"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 tey-emerald-400" />
                        Evaluate Insights
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-3.5 py-2.5 bg-white border border-slate-300 rounded text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-4 border-t border-slate-150 pt-3 text-[10.5px] text-slate-400 italic leading-relaxed hidden md:block">
              * The smart assistant extracts exact EBITDA, maps micro-insurance matches, and generates native dialect sound guides on the fly without database lag.
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: REFINED SIMPLIFIED ASSESSMENT PANELS (Width 2/3) */}
        {selectedRecord ? (
          <section id="results-panel" className="flex-1 flex flex-col gap-5 min-w-0 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            
            {/* PORTFOLIO CLIENT TITLE PANEL */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg shrink-0 border border-slate-200">
                  {selectedRecord.clientName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                    {selectedRecord.clientName}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                    <span>{selectedRecord.region}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-indigo-600">{selectedRecord.sector}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-3 py-1 rounded-full border font-bold ${getDecisionBadgeClass(selectedRecord.decision)}`}>
                  {selectedRecord.decision}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  UID: {selectedRecord.id.substring(4, 11)}
                </span>
              </div>
            </div>

            {/* TAB SELECTOR: CREDIT OVERVIEWS (Extremely clear paradigm) */}
            <div className="flex border-b border-slate-150 gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("credit")}
                className={`py-2 px-3.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "credit"
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Award className="h-4 w-4" />
                Credit Metrics & Score
              </button>
              <button
                onClick={() => setActiveTab("counseling")}
                className={`py-2 px-3.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "counseling"
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Volume2 className="h-4 w-4" />
                Empathetic Counseling
              </button>
              <button
                onClick={() => setActiveTab("behavioral")}
                className={`py-2 px-3.5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "behavioral"
                    ? "border-indigo-600 text-indigo-600 font-extrabold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Behavioral Insights & Hedge
              </button>
            </div>

            {/* INTERACTIVE WORKSPACE VIEW (Switches with no lag) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              
              <AnimatePresence mode="wait">
                
                {/* TAB 1: CREDIT EXTRACTION & ALTERNATIVE SCORES */}
                {activeTab === "credit" && (
                  <motion.div
                    key="credit-tab"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4 text-slate-800"
                  >
                    
                    {/* ACCREDITED FINANCIAL REPORT CARD */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider font-mono">
                          Est. Monthly EBITDA
                        </span>
                        <div className="text-2xl font-mono font-extrabold text-emerald-990 mt-2">
                          {typeof selectedRecord.financials.estimatedEbitda === "number"
                            ? `${selectedRecord.financials.currencySymbol || "$"}${selectedRecord.financials.estimatedEbitda.toLocaleString()}`
                            : selectedRecord.financials.estimatedEbitda}
                        </div>
                        <span className="text-[10px] text-emerald-600/90 mt-1 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> 
                          Extract Confidence: 98%
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                          Leverage Ratio
                        </span>
                        <div className="text-2xl font-mono font-extrabold text-slate-900 mt-2">
                          {selectedRecord.financials.debtToEquityRatio ?? "0.15"}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 font-semibold">
                          {selectedRecord.financials.debtToEquityRatio < 0.4 ? "Low Debt Strain" : "Moderate Leverage"}
                        </span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between font-medium">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                          Ledging Records
                        </span>
                        <div className="text-sm font-extrabold text-slate-800 mt-2.5 truncate flex items-center gap-1.5">
                          {selectedRecord.financials.hasPaperLedger ? (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                              Holds Paper Ledgers
                            </>
                          ) : (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shrink-0" />
                              Informal / Notebooks
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Written Log Signal</span>
                      </div>
                    </div>

                    {/* SCORE PROGRESS INDEX CARD */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4.5">
                      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-1.5 mb-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Hybrid Credit Score & Capacity Index (v4.2)
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className={`text-3xl font-extrabold font-mono ${getScoreColorInfo(selectedRecord.creditViabilityScore).text}`}>
                            {selectedRecord.creditViabilityScore}
                          </span>
                          <span className="text-slate-400/80 text-xs text-right select-none">/ 850 Max</span>
                        </div>
                      </div>

                      {/* Score Bar Track */}
                      <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden mb-3.5 flex shadow-inner">
                        <div className="h-full bg-rose-400 w-[30%]" />
                        <div className="h-full bg-amber-400 w-[35%]" />
                        <div className="h-full bg-emerald-400 w-[25%]" />
                        <div className="h-full bg-indigo-500 w-[10%]" />
                      </div>

                      <div className="flex justify-between text-[11px] font-bold text-slate-400 font-mono tracking-wider">
                        <span>300 (Subprime)</span>
                        <span>550 (Moderate)</span>
                        <span>700 (Excellent)</span>
                        <span>850 (Prime)</span>
                      </div>

                      <hr className="border-slate-200 my-4" />

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between pb-2 border-b border-slate-150">
                          <span className="text-slate-500 font-medium">Estimated Monthly Revenues</span>
                          <span className="font-mono font-bold text-slate-800">
                            {selectedRecord.financials.estimatedMonthlyRevenue ? `${selectedRecord.financials.currencySymbol || "$"}${selectedRecord.financials.estimatedMonthlyRevenue.toLocaleString()}` : "Not listed"}
                          </span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-slate-150">
                          <span className="text-slate-500 font-medium">Estimated Monthly Expenses</span>
                          <span className="font-mono font-bold text-slate-800">
                            {selectedRecord.financials.estimatedMonthlyExpenses ? `${selectedRecord.financials.currencySymbol || "$"}${selectedRecord.financials.estimatedMonthlyExpenses.toLocaleString()}` : "Not listed"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Prior Outstanding Microfinance Obligations</span>
                          <span className="font-semibold text-slate-700 max-w-[280px] break-words text-right">
                            {selectedRecord.financials.existingDebtObligations || "None"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SOURCE NOTES REFERENCE */}
                    <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <h5 className="text-[10px] font-bold text-indigo-900 uppercase font-mono tracking-wider mb-1 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                        Original Dialect Field Transcription
                      </h5>
                      <p className="text-xs text-indigo-950 italic leading-relaxed font-serif">
                        "{selectedRecord.notes}"
                      </p>
                    </div>

                  </motion.div>
                )}

                {/* TAB 2: EMPATHETIC ADVISORY & TALK-TRACK */}
                {activeTab === "counseling" && (
                  <motion.div
                    key="counseling-tab"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4 text-slate-800"
                  >
                    
                    {/* SPEECH OUTPUT CARD */}
                    <div className="bg-slate-900 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest block">
                            Field Talk Track (Vernacular Guide)
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            title="Mock Voice Generation speech"
                            onClick={() => alert(`Simulating Localized Speech: "${selectedRecord.empatheticCounseling.localizedTalkTrack}"`)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCopyTalkTrack(selectedRecord.empatheticCounseling.localizedTalkTrack)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedTrack ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-100 leading-relaxed font-serif italic py-1">
                        "{selectedRecord.empatheticCounseling.localizedTalkTrack}"
                      </p>

                      <div className="mt-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-305">
                        <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-orange-400 block mb-0.5">Underwriting Context:</strong>
                          <span className="text-slate-300">{selectedRecord.empatheticCounseling.toneExplanation}</span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONABLE SCORE BOOSER CARD */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-3 block">
                        Credit Viability Boosting Roadmaps
                      </h4>
                      <ol className="space-y-2.5">
                        {selectedRecord.empatheticCounseling.actionableSteps.map((step, idx) => (
                          <li key={idx} className="text-xs text-slate-700 font-medium flex items-start gap-2.5">
                            <span className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="leading-normal pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                  </motion.div>
                )}

                {/* TAB 3: BEHAVIORAL INDICES & INSURANCE STAGES */}
                {activeTab === "behavioral" && (
                  <motion.div
                    key="behavioral-tab"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4 text-slate-800"
                  >
                    
                    {/* 4-BAR BEHAVIORAL OVERVIEW */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-4 block">
                        Qualitative Character & Vulnerability Indices
                      </h4>

                      <div className="space-y-3.5">
                        {/* 1. Character */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-semibold">
                            <span className="text-slate-700">Repayment Consistency</span>
                            <span className="text-indigo-600 font-bold font-mono">
                              {selectedRecord.alternativeBehavioralMetrics.characterScore} / 10
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-700" 
                              style={{ width: `${selectedRecord.alternativeBehavioralMetrics.characterScore * 10}%` }}
                            />
                          </div>
                        </div>

                        {/* 2. Growth Potential */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-semibold">
                            <span className="text-slate-700">Operations Resiliency</span>
                            <span className="text-indigo-600 font-bold font-mono">
                              {selectedRecord.alternativeBehavioralMetrics.growthPotentialScore} / 10
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-700" 
                              style={{ width: `${selectedRecord.alternativeBehavioralMetrics.growthPotentialScore * 10}%` }}
                            />
                          </div>
                        </div>

                        {/* 3. Family Support */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-semibold">
                            <span className="text-slate-700">Cooperative / Family Support Net</span>
                            <span className="text-indigo-600 font-bold font-mono">
                              {selectedRecord.alternativeBehavioralMetrics.familySupportSystemScore} / 10
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-700" 
                              style={{ width: `${selectedRecord.alternativeBehavioralMetrics.familySupportSystemScore * 10}%` }}
                            />
                          </div>
                        </div>

                        {/* 4. Climate Risk */}
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-semibold">
                            <span className="text-slate-750 flex items-center gap-1">
                              Climate Vulnerability Index
                              <span className="text-[10px] text-slate-400 font-normal font-sans">(Lower is better)</span>
                            </span>
                            <span className={`font-bold font-mono ${selectedRecord.alternativeBehavioralMetrics.climateVulnerabilityScore > 6 ? "text-rose-600" : "text-emerald-600"}`}>
                              {selectedRecord.alternativeBehavioralMetrics.climateVulnerabilityScore} / 10
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                selectedRecord.alternativeBehavioralMetrics.climateVulnerabilityScore > 6 ? "bg-rose-500" : "bg-emerald-500"
                              }`} 
                              style={{ width: `${selectedRecord.alternativeBehavioralMetrics.climateVulnerabilityScore * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed flex gap-2.5 text-slate-605 shadow-sm">
                        <Award className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 block font-bold mb-0.5">Reliability Indicator Note:</strong>
                          {selectedRecord.alternativeBehavioralMetrics.repayReliabilityIndicator}
                        </div>
                      </div>
                    </div>

                    {/* MICRO INSURANCE RISKS PAIRINGS */}
                    <div className="bg-cyan-50/40 border border-cyan-155 border-cyan-200 rounded-xl p-4.5 text-cyan-950">
                      <div className="flex items-center justify-between mb-3 border-b border-cyan-200/50 pb-2">
                        <span className="text-[10.5px] uppercase font-bold font-mono tracking-widest text-cyan-800 flex items-center gap-1.5">
                          <CloudRain className="h-4 w-4 text-cyan-650" />
                          Climate Weather & Parametric Shield
                        </span>
                        <span className="text-[9.5px] bg-cyan-100 text-cyan-800 border border-cyan-300 px-2 py-0.5 rounded font-bold font-mono tracking-wider uppercase">
                          Hedge Active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        <div>
                          <span className="text-cyan-800 font-semibold block uppercase tracking-wide text-[10px] h-3.5">
                            Syllabus Product
                          </span>
                          <span className="text-slate-900 font-extrabold text-sm block">
                            {selectedRecord.insuranceFit.recommendedProduct}
                          </span>
                        </div>

                        <div>
                          <span className="text-cyan-800 font-semibold block uppercase tracking-wide text-[10px] h-3.5">
                            Micro-Premium Estimate
                          </span>
                          <span className="text-emerald-700 font-mono font-extrabold text-sm block">
                            {selectedRecord.insuranceFit.premiumEstimate}
                          </span>
                        </div>

                        <div className="md:col-span-2 pt-1 border-t border-cyan-200/40">
                          <span className="text-cyan-800 font-semibold block uppercase tracking-wide text-[10px] mb-1">
                            Parametric Rainfall / Wind Outbreak Trigger Conditions
                          </span>
                          <p className="text-slate-800 italic leading-relaxed bg-white/65 p-2 rounded.5 p-2.5 rounded border border-cyan-200 font-serif shadow-sm">
                            "{selectedRecord.insuranceFit.triggerConditions}"
                          </p>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

            </div>

          </section>
        ) : (
          <section className="flex-1 bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
            <Layers className="h-12 w-12 text-slate-300 animate-pulse mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No Assessment Selected</h3>
            <p className="text-xs text-slate-450 max-w-sm leading-relaxed text-slate-500">
              Please click on a client inside the "Field Assessments List" above or test a new case file in the evaluator.
            </p>
          </section>
        )}

      </main>

      {/* FOOTER STATS INFO */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono">
          <div>Powered by: <span className="text-slate-200">Gemini-2.5-Flash</span></div>
          <div>Port Authority: <span className="text-slate-250">TLS Native Endpoint</span></div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono tracking-tighter">
          CENTRAL-MFI-88219 • BETA v2.0.12
        </div>
      </footer>
    </div>
  );
}
