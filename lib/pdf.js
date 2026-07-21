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
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text('e-healthwatch', 40, 26);
  doc.fillColor('#CBD5E1').font('Helvetica').fontSize(11).text(title, 40, 52);
  doc.fillColor(FAINT).fontSize(9).text(subtitle, 40, 66);
  doc.fillColor(INK);
  doc.y = 116;
}

function labelValueRow(doc, label, value, labelWidth = 170) {
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(MUTED).text(label, 40, y, { width: labelWidth });
  doc.font('Helvetica').fontSize(10).fillColor(INK).text(value, 40 + labelWidth, y, { width: 515 - labelWidth });
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

  doc.font('Helvetica-Bold').fontSize(13).fillColor(INK).text(`Hello${consumerName ? ' ' + consumerName : ''},`);
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(10.5).fillColor(MUTED).text('Thank you for your payment. Here are your details:');
  doc.moveDown(1.2);

  labelValueRow(doc, 'Order number', `#${orderId}`);
  labelValueRow(doc, 'Product', `Menopause Forecast (profile: ${profileName})`);
  labelValueRow(doc, 'Amount paid', `Rs. ${amountInr}`);
  labelValueRow(doc, 'Payment ID', paymentId);
  labelValueRow(doc, 'Date', paidAt);

  doc.moveDown(1.5);
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(
    'Your result is stored permanently on your profile — sign in at any time to view it or download the report.',
    { width: 515 }
  );

  doc.moveDown(3);
  doc.font('Helvetica').fontSize(8.5).fillColor(FAINT).text('e-healthwatch — this is a computer-generated receipt.');

  return collect(doc);
}

function buildForecastReportPdf({ profileName, relationshipLabel, input, result, yearsToOnset, interpNote, testDate, printDate }) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  drawHeader(doc, 'Menopause Forecast Report', `Tested: ${testDate}   |   Report date: ${printDate}`);

  doc.font('Helvetica-Bold').fontSize(16).fillColor(INK).text(profileName, 40, doc.y, { continued: true });
  doc.font('Helvetica').fontSize(11).fillColor(MUTED).text(`   ·   ${relationshipLabel}`);
  doc.moveDown(1.2);

  doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text('Test Inputs');
  doc.moveDown(0.5);
  labelValueRow(doc, 'Age at test', `${input.age} years`, 220);
  labelValueRow(doc, 'AMH (Anti-Müllerian Hormone)', `${input.amh} ng/mL`, 220);
  labelValueRow(doc, 'Menstrual cycle', input.periods, 220);

  doc.moveDown(1);
  const boxTop = doc.y;
  doc.rect(40, boxTop, 515, 74).fill('#FFF1F2');
  doc.fillColor(ROSE).font('Helvetica-Bold').fontSize(24).text(`${result.forecastAge} years`, 55, boxTop + 12);
  doc.fillColor(MUTED).font('Helvetica').fontSize(9.5).text('Estimated age of menopause onset', 55, boxTop + 44);
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(10.5).text(`~${yearsToOnset} years from test age`, 300, boxTop + 30, { width: 240, align: 'right' });
  doc.y = boxTop + 74 + 16;

  doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text('Interpretation');
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(10).fillColor(INK).text(interpNote, { width: 515 });

  doc.moveDown(1.2);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(MUTED).text('Method');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(
    `The forecast is derived from a published statistical association between serum AMH concentration and age at natural menopause, using the model variant matched to the reported cycle regularity (${input.periods.toLowerCase()} cycles).`,
    { width: 515 }
  );

  doc.moveDown(1.2);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(FAINT).text('Disclaimer');
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(8).fillColor(FAINT).text(
    'This report is a statistical estimate generated by a mathematical prediction model and is for informational purposes only. It is not a clinical diagnosis or a substitute for laboratory investigation or specialist assessment. Individual results vary with health conditions, medications, and genetic factors. Please share this report with your gynaecologist for personalised medical advice.',
    { width: 515 }
  );

  return collect(doc);
}

module.exports = { buildReceiptPdf, buildForecastReportPdf, computeForecastInterpretation };
