/*
 * ZAIDYN Market Access — Coverage Intelligence
 * Mock dataset.
 *
 * All figures below are illustrative and invented for prototype purposes.
 * They are NOT real payer, coverage, or revenue data and are not connected
 * to any external source. Edit the values here to change what the dashboard
 * shows — the interface reads everything from this object.
 *
 * Coverage colour thresholds (see styles.css / app.js):
 *   >= 70%  favourable  (green)
 *   55-69%  watch       (amber)
 *   < 55%   at risk     (red)
 *
 * A brand's headline "revenue at risk" equals the sum of its open barriers'
 * revenueAtRisk values, so the tiles and the list always reconcile.
 *
 * Each barrier carries a `provenance` object describing where the signal came
 * from: the bought coverage feed, an internal field report, or both. When a
 * field report is ahead of the feed (conflict: true), the barrier shows a
 * "Field-reported" flag and an early-warning note instead of overwriting one
 * source with the other.
 */

const ZAIDYN_DATA = {
  meta: {
    module: "Coverage Intelligence",
    productLine: "Market Access",
    coverageAsOf: "July 2026",
    dataSourceLabel: "MMIT / Norstella feed (illustrative)"
  },

  brands: [
    {
      id: "cardiova",
      name: "Cardiova",
      indication: "Cardiovascular",
      market: "US",
      channel: "All channels",
      coveredLivesPct: 71,
      // payers ordered highest-to-lowest coverage
      payers: [
        { name: "UnitedHealth",    coveragePct: 82 },
        { name: "Cigna",           coveragePct: 73 },
        { name: "CVS Caremark",    coveragePct: 64 },
        { name: "Humana",          coveragePct: 58 },
        { name: "Express Scripts", coveragePct: 41 }
      ],
      barriers: [
        {
          id: "cardiova-esi-step",
          provenance: { primary: "field", fieldNote: "Step therapy reported by FRM — West", fieldDaysAgo: 3, feedNote: "Coverage feed shows no restriction on record", feedDaysAgo: 16, conflict: true },
          payer: "Express Scripts",
          type: "New step therapy",
          severity: "critical",
          livesAffected: 2100000,
          revenueAtRisk: 9200000,
          detectedDaysAgo: 3,
          summary:
            "Express Scripts added a step-therapy requirement: patients must fail a generic beta-blocker before Cardiova is covered.",
          recommendedAction:
            "Engage the Express Scripts P&T contact with the updated cardiovascular-outcomes dossier, and equip the 14 highest-volume accounts with prior-auth support resources this week.",
          suggestedOwner: "Field Reimbursement — West",
          talkingPoints: [
            "Lead with the head-to-head cardiovascular outcomes data versus the generic step agent.",
            "Quantify the delay-to-therapy risk for high-CV-risk patients under step therapy.",
            "Offer the streamlined prior-auth pathway and patient-support enrolment.",
            "Reference the peer plans that cover Cardiova at parity without step therapy."
          ]
        },
        {
          id: "cardiova-cvs-tier",
          provenance: { primary: "feed", feedNote: "Tier 2 → Tier 3 confirmed in coverage feed", feedDaysAgo: 8, conflict: false },
          payer: "CVS Caremark",
          type: "Tier 2 → Tier 3",
          severity: "major",
          livesAffected: 1400000,
          revenueAtRisk: 5100000,
          detectedDaysAgo: 8,
          summary:
            "CVS Caremark moved Cardiova from Tier 2 to Tier 3, raising patient out-of-pocket cost.",
          recommendedAction:
            "Prepare a value re-submission for the next P&T cycle and activate copay-support messaging for affected patients to protect adherence.",
          suggestedOwner: "Market Access — National Accounts",
          talkingPoints: [
            "Present the total-cost-of-care and adherence impact of the tier move.",
            "Position the copay-support program to blunt patient abandonment.",
            "Share real-world adherence data tied to out-of-pocket thresholds."
          ]
        }
      ]
    },

    {
      id: "immunova",
      name: "Immunova",
      indication: "Immunology",
      market: "US",
      channel: "All channels",
      coveredLivesPct: 63,
      payers: [
        { name: "UnitedHealth",    coveragePct: 70 },
        { name: "Cigna",           coveragePct: 66 },
        { name: "Express Scripts", coveragePct: 61 },
        { name: "CVS Caremark",    coveragePct: 55 },
        { name: "Humana",          coveragePct: 48 }
      ],
      barriers: [
        {
          id: "immunova-humana-pa",
          provenance: { primary: "feed", feedNote: "Prior authorization confirmed in coverage feed", feedDaysAgo: 5, conflict: false },
          payer: "Humana",
          type: "New prior authorization",
          severity: "critical",
          livesAffected: 900000,
          revenueAtRisk: 6400000,
          detectedDaysAgo: 5,
          summary:
            "Humana introduced a new prior-authorization requirement for Immunova across commercial plans.",
          recommendedAction:
            "Roll out prior-auth support resources to affected accounts and brief Field Reimbursement — South on the new documentation criteria.",
          suggestedOwner: "Field Reimbursement — South",
          talkingPoints: [
            "Walk the account through the exact PA documentation now required.",
            "Provide completed-form templates to reduce first-pass denials.",
            "Track PA approval turnaround and flag outliers for escalation."
          ]
        },
        {
          id: "immunova-uhc-ql",
          provenance: { primary: "feed", feedNote: "Quantity limit confirmed in coverage feed", feedDaysAgo: 12, conflict: false },
          payer: "UnitedHealth",
          type: "Quantity limit added",
          severity: "major",
          livesAffected: 1100000,
          revenueAtRisk: 3800000,
          detectedDaysAgo: 12,
          summary:
            "UnitedHealth added a quantity limit that caps monthly units below the labeled dose for some patients.",
          recommendedAction:
            "Submit a medical-exception pathway packet and alert prescribers in the top 20 accounts to the new limit.",
          suggestedOwner: "Market Access — National Accounts",
          talkingPoints: [
            "Clarify the labeled dosing versus the imposed quantity cap.",
            "Provide the medical-exception request pathway for above-limit patients.",
            "Monitor for downstream adherence gaps from under-dosing."
          ]
        },
        {
          id: "immunova-cvs-exclusion",
          provenance: { primary: "field", fieldNote: "Exclusion risk flagged by National Accounts", fieldDaysAgo: 2, feedNote: "Coverage feed still lists as covered", feedDaysAgo: 14, conflict: true },
          payer: "CVS Caremark",
          type: "Tier exclusion risk",
          severity: "major",
          livesAffected: 700000,
          revenueAtRisk: 2200000,
          detectedDaysAgo: 2,
          summary:
            "CVS Caremark flagged Immunova for possible tier exclusion at the next formulary review.",
          recommendedAction:
            "Prioritize a value-dossier refresh and secure a pre-review meeting with the CVS clinical team before the decision window.",
          suggestedOwner: "Market Access — National Accounts",
          talkingPoints: [
            "Refresh the budget-impact model with the latest real-world evidence.",
            "Line up KOL support letters ahead of the review.",
            "Prepare a contracting scenario if exclusion risk persists."
          ]
        }
      ]
    }
  ]
};

// Expose for the app (works with a plain <script> include; no build step).
if (typeof window !== "undefined") {
  window.ZAIDYN_DATA = ZAIDYN_DATA;
}
