// Shared menopause-forecast formula + intake validation, used by the
// pre-payment gate check, the payment-verification route, and the
// webhook backfill path so the formula lives in exactly one place.
'use strict';

function computeForecastAge(amh, cmbperiods) {
  const b0 = cmbperiods === 'R' ? 35.49 : 41.41;
  const b1 = cmbperiods === 'R' ? 0.15  : 0.17;
  const periods = cmbperiods === 'R' ? 'Regular' : 'Irregular';
  const amhvalue = parseFloat(amh);
  const forecastAge = Math.round(b0 * Math.pow(amhvalue, b1));
  return { forecastAge, periods, amhvalue };
}

function validateForecastInputs({ Txt_age, cmbperiods, Txt_amh }) {
  if (!Txt_age || !cmbperiods || !Txt_amh) return 'All fields are required.';
  const ageNum = parseFloat(Txt_age);
  const amhNum = parseFloat(Txt_amh);
  if (isNaN(ageNum) || ageNum < 18 || ageNum > 60) return 'Please enter a valid age between 18 and 60.';
  if (isNaN(amhNum) || amhNum <= 0 || amhNum > 20) return 'Please enter a valid AMH value between 0.01 and 20 ng/mL.';
  if (cmbperiods !== 'R' && cmbperiods !== 'I') return 'Please select a menstrual cycle type.';
  return null;
}

module.exports = { computeForecastAge, validateForecastInputs };
