import { motion } from "motion/react";
import { CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface ScoreGaugeProps {
  score: number;
  decision: string;
}

export default function ScoreGauge({ score, decision }: ScoreGaugeProps) {
  // Convert 300-850 scale to rotation or fraction
  // Min: 300, Max: 850. Span: 550.
  const scorePercentage = Math.min(Math.max((score - 300) / 550, 0), 1);
  const strokeDashoffset = 339.292 * (1 - scorePercentage * 0.75); // semi-circle effect

  // Color selection based on score
  let scoreColor = "text-rose-500 border-rose-500/20 bg-rose-500/5";
  let scoreBarColor = "#ef4444";
  let ratingText = "Subprime / High Risk";

  if (score >= 700) {
    scoreColor = "text-emerald-400 border-emerald-400/20 bg-emerald-400/5";
    scoreBarColor = "#34d399";
    ratingText = "Excellent / Prime Alternative";
  } else if (score >= 580) {
    scoreColor = "text-amber-400 border-amber-400/20 bg-amber-400/5";
    scoreBarColor = "#fbbf24";
    ratingText = "Moderate / Insured Preferred";
  } else if (score >= 450) {
    scoreColor = "text-orange-400 border-orange-400/20 bg-orange-400/5";
    scoreBarColor = "#fb923c";
    ratingText = "Thin File / Hedged Underwriting";
  }

  // Get localized icon configuration for the underwriting decision
  const getDecisionDetails = (dec: string) => {
    switch (dec) {
      case "Approved":
        return {
          bg: "bg-emerald-950/40 border-emerald-500/30 text-emerald-300",
          desc: "Full Micro-Loan Approved. Disbursal scheduled through local cooperative node.",
          icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />
        };
      case "Pre-Approved with Conditions":
        return {
          bg: "bg-amber-950/40 border-amber-500/30 text-amber-300",
          desc: "Disbursal pending on setting up a weekly sales ledger or adding secondary guarantor.",
          icon: <AlertTriangle className="h-5 w-5 text-amber-400" />
        };
      case "Referred to Insurance":
        return {
          bg: "bg-cyan-950/40 border-cyan-500/30 text-cyan-300",
          desc: "Direct loan hedged. Crop failure/climate index insurance registration recommended first.",
          icon: <HelpCircle className="h-5 w-5 text-cyan-400" />
        };
      default:
        return {
          bg: "bg-rose-950/40 border-rose-500/30 text-rose-300",
          desc: "High vulnerability risk. Requires complete restructuring and local guild advisory setup.",
          icon: <AlertTriangle className="h-5 w-5 text-rose-400" />
        };
    }
  };

  const decisionMeta = getDecisionDetails(decision);

  return (
    <div id="gauge-container" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
      <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">
        Alternative Credit Rating
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Core Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-135" viewBox="0 0 120 120">
            {/* Background Arch */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="8"
              strokeDasharray="339.292"
              strokeDashoffset="84.823" // 25% empty
              strokeLinecap="round"
            />
            {/* Value Arch with Motion */}
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="transparent"
              stroke={scoreBarColor}
              strokeWidth="8"
              strokeDasharray="339.292"
              initial={{ strokeDashoffset: 339.292 }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Internal text overlay */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-white tracking-tighter">
              {score}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              FICO-Alt Score
            </span>
          </div>
        </div>

        {/* Descriptor and Tier */}
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-2 uppercase tracking-wider font-mono bg-slate-950/55 border-slate-800 shadow-inner">
            <span className={`w-2 h-2 rounded-full ${score >= 700 ? "bg-emerald-400" : score >= 580 ? "bg-amber-400" : "bg-rose-400"}`} />
            {ratingText}
          </div>

          <h4 className="text-xl font-bold text-white mb-1">
            {decision}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Based on structured cashflow extracts, regional agricultural weather factors, and informal village referrals.
          </p>
        </div>
      </div>

      {/* Decision Info Card */}
      <div className={`mt-5 p-4 rounded-xl border ${decisionMeta.bg} flex gap-3 transition-colors duration-300`}>
        <div className="flex-shrink-0 mt-0.5">
          {decisionMeta.icon}
        </div>
        <div>
          <h5 className="text-xs font-semibold font-mono tracking-wider uppercase mb-1">
            Underwriter Decision Note
          </h5>
          <p className="text-xs text-slate-300 leading-relaxed">
            {decisionMeta.desc}
          </p>
        </div>
      </div>
    </div>
  );
}
