// Server-side PDF generation for payment receipts and forecast reports,
// attached to emails via nodemailer. Uses pdfkit with the standard 14 fonts
// only (no custom font embedding), so there is nothing here that needs a
// headless browser — safe and lightweight to run in a Vercel function.
'use strict';

const PDFDocument = require('pdfkit');

const INK   = '#0F172A';
const MUTED = '#64748B';
const FAINT = '#94A3B8';
const ROSE  = '#E11D48';
const DARK  = '#1E293B';

// A4 content box: page is 595.28pt wide with a 40pt margin each side, giving
// 515.28pt of usable width. Every wrapped text call below explicitly passes
// its own x position rather than relying on doc.x/doc.y carried over from a
// previous call — pdfkit leaves the cursor wherever the last explicit-x call
// put it (e.g. mid-line after a label/value pair), and text wrapped with a
// {width} but no matching x will silently run past the right edge of the
// page instead of wrapping where expected.
const X = 40;
const W = 510;

function collect(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function drawHeader(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 86).fill(DARK);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text('e-healthwatch', X, 26);
  doc.fillColor('#CBD5E1').font('Helvetica').fontSize(11).text(title, X, 52);
  doc.fillColor(FAINT).fontSize(9).text(subtitle, X, 66);
  doc.fillColor(INK);
  doc.x = X;
  doc.y = 116;
}

// A full-width paragraph/heading line, always anchored at the left margin.
function line(doc, text, { font = 'Helvetica', size = 10, color = INK, gapAfter = 0.9 } = {}) {
  doc.font(font).fontSize(size).fillColor(color).text(text, X, doc.y, { width: W });
  doc.x = X;
  if (gapAfter) doc.moveDown(gapAfter);
}

function labelValueRow(doc, label, value, labelWidth = 170) {
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(MUTED).text(label, X, y, { width: labelWidth });
  doc.font('Helvetica').fontSize(10).fillColor(INK).text(value, X + labelWidth, y, { width: W - labelWidth });
  doc.x = X;
  doc.moveDown(0.9);
}

// Menopause-forecast interpretation copy, shared with the on-site printable
// report (server.js GET /forecast-report/:profileId) so wording never drifts
// between the two surfaces.
function computeForecastInterpretation(input, result) {
  const yearsToOnset = result.forecastAge - parseInt(input.age, 10);
  const interpNote =
    yearsToOnset > 15 ? `Based on the AMH level of ${input.amh} ng/mL, ovarian reserve appears well-preserved, with an estimated ${yearsToOnset} years before natural menopause onset — well within the expected range for the current age.` :
    yearsToOnset > 8  ? `The AMH level of ${input.amh} ng/mL suggests a typical ovarian reserve for this age. The estimated timeline of ${yearsToOnset} years to menopause is within the normal range.` :
                        `The AMH level of ${input.amh} ng/mL suggests ovarian reserve may be lower than average for this age. We recommend discussing this result with a gynaecologist for a full clinical assessment.`;
  return { yearsToOnset, interpNote };
}

function buildReceiptPdf({ orderId, profileName, amountInr, paymentId, paidAt, consumerName }) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  drawHeader(doc, 'Payment Receipt', `Order #${orderId}`);

  line(doc, `Hello${consumerName ? ' ' + consumerName : ''},`, { font: 'Helvetica-Bold', size: 13, gapAfter: 0.4 });
  line(doc, 'Thank you for your payment. Here are your details:', { color: MUTED, size: 10.5, gapAfter: 1.2 });

  labelValueRow(doc, 'Order number', `#${orderId}`);
  labelValueRow(doc, 'Product', `Menopause Forecast (profile: ${profileName})`);
  labelValueRow(doc, 'Amount paid', `Rs. ${amountInr}`);
  labelValueRow(doc, 'Payment ID', paymentId);
  labelValueRow(doc, 'Date', paidAt);

  doc.moveDown(0.6);
  line(doc, 'Your result is stored permanently on your profile — sign in at any time to view it or download the report.', { color: MUTED, gapAfter: 3 });
  line(doc, 'e-healthwatch — this is a computer-generated receipt.', { color: FAINT, size: 8.5, gapAfter: 0 });

  return collect(doc);
}

function buildForecastReportPdf({ profileName, relationshipLabel, input, result, yearsToOnset, interpNote, testDate, printDate }) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  drawHeader(doc, 'Menopause Forecast Report', `Tested: ${testDate}   |   Report date: ${printDate}`);

  line(doc, `${profileName}  ·  ${relationshipLabel}`, { font: 'Helvetica-Bold', size: 16, gapAfter: 1.2 });

  line(doc, 'Test Inputs', { font: 'Helvetica-Bold', size: 11, gapAfter: 0.5 });
  labelValueRow(doc, 'Age at test', `${input.age} years`, 220);
  labelValueRow(doc, 'AMH (Anti-Müllerian Hormone)', `${input.amh} ng/mL`, 220);
  labelValueRow(doc, 'Menstrual cycle', input.periods, 220);

  doc.moveDown(0.4);
  const boxTop = doc.y;
  doc.rect(X, boxTop, W, 74).fill('#FFF1F2');
  doc.fillColor(ROSE).font('Helvetica-Bold').fontSize(24).text(`${result.forecastAge} years`, X + 15, boxTop + 12);
  doc.fillColor(MUTED).font('Helvetica').fontSize(9.5).text('Estimated age of menopause onset', X + 15, boxTop + 44);
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(10.5).text(`~${yearsToOnset} years from test age`, X + 260, boxTop + 30, { width: W - 260, align: 'right' });
  doc.x = X;
  doc.y = boxTop + 74 + 16;

  line(doc, 'Interpretation', { font: 'Helvetica-Bold', size: 11, gapAfter: 0.4 });
  line(doc, interpNote, { gapAfter: 1.2 });

  line(doc, 'Method', { font: 'Helvetica-Bold', size: 9.5, color: MUTED, gapAfter: 0.3 });
  line(doc, `The forecast is derived from a published statistical association between serum AMH concentration and age at natural menopause, using the model variant matched to the reported cycle regularity (${input.periods.toLowerCase()} cycles).`, { size: 9, color: MUTED, gapAfter: 1.2 });

  line(doc, 'Disclaimer', { font: 'Helvetica-Bold', size: 9, color: FAINT, gapAfter: 0.2 });
  line(doc, 'This report is a statistical estimate generated by a mathematical prediction model and is for informational purposes only. It is not a clinical diagnosis or a substitute for laboratory investigation or specialist assessment. Individual results vary with health conditions, medications, and genetic factors. Please share this report with your gynaecologist for personalised medical advice.', { size: 8, color: FAINT, gapAfter: 0 });

  return collect(doc);
}

module.exports = { buildReceiptPdf, buildForecastReportPdf, computeForecastInterpretation };
