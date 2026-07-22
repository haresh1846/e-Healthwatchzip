// Shared BMD score + WHO classification logic, used by the save route,
// /result.asp, and /bmd-report/:guid so the formula and thresholds live in
// exactly one place.
'use strict';

// WHO classification thresholds for femoral neck BMD (g/cm²).
// Based on NHANES III reference data: young adult mean 0.858, SD 0.120
//   T-score −1.0  →  BMD ≥ 0.738  → Normal
//   T-score −2.5  →  BMD ≥ 0.558  → Osteopenia
//                    BMD  < 0.558  → Osteoporosis
function computeBmdResult({ height, weight, age, hal, nsa }) {
  const h   = parseFloat(height);
  const w   = parseFloat(weight);
  const a   = parseFloat(age);
  const hal_ = parseFloat(hal);
  const nsa_ = parseFloat(nsa);

  const score = parseFloat((
    1.06861 *
    Math.pow(h * 0.01, 0.326842) *
    Math.pow(w, 0.211909) *
    Math.pow(hal_, 0.0608258) *
    Math.pow(a, -0.332916) *
    Math.pow(nsa_ * 0.0174533, -0.239446)
  ).toFixed(4));

  let classification, classColor, classNote;
  if (score >= 0.738) {
    classification = 'Normal';
    classColor     = 'green';
    classNote      = 'Bone density is within the normal range. Maintain with regular weight-bearing exercise and adequate calcium intake.';
  } else if (score >= 0.558) {
    classification = 'Osteopenia';
    classColor     = 'amber';
    classNote      = 'Bone density is lower than normal. Consider lifestyle modifications, dietary calcium, vitamin D supplementation, and a DEXA scan for monitoring.';
  } else {
    classification = 'Osteoporosis';
    classColor     = 'rose';
    classNote      = 'Bone density is significantly reduced. Refer to a specialist for DEXA scan, pharmacological assessment, and fracture risk evaluation.';
  }

  return { score, classification, classColor, classNote };
}

module.exports = { computeBmdResult };
