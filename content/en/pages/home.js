// @ts-check

/**
 * Home page content.
 *
 * `sections` is an ordered array — the page renders it top to bottom. Re-order
 * the array to re-order the page; delete an entry to remove a section. No
 * template edit is required for either.
 *
 * @type {{meta: {title: string, description: string}, sections: import('../../schema').Section[]}}
 */
const home = {
  meta: {
    title: 'e-healthwatch — Predictive women’s health analytics',
    description:
      'Estimate when natural menopause is likely to begin from a single AMH blood test, and check bone mineral density free. Evidence-based, in plain language.',
  },

  sections: [
    {
      type: 'hero',
      eyebrow: 'Predictive women’s health',
      headline: 'Your menopause timeline, estimated from',
      headlineAccent: 'one blood test.',
      body:
        'A single AMH value, read alongside your age and cycle pattern, gives a personal estimate of when natural menopause is likely to begin — explained in plain language, not clinical shorthand.',
      actions: [
        { label: 'Get your forecast — ₹49', href: '/forecasting.asp', variant: 'primary' },
        { label: 'Try the free BMD calculator', href: '/bmd.asp', variant: 'secondary' },
      ],
      assurances: [
        'One-time payment, no subscription',
        'Result saved to your account permanently',
        'Private to you',
      ],
      specimen: {
        caption: 'Sample forecast',
        figure: '47',
        figureUnit: 'years',
        figureLabel: 'Estimated age at natural menopause',
        band: { level: 'calm', label: 'Within the typical range' },
        rows: [
          { label: 'Age at test', value: '38 yrs' },
          { label: 'AMH',         value: '1.8 ng/mL' },
          { label: 'Cycle',       value: 'Regular' },
        ],
        footnote: 'Illustrative example. Your own forecast is computed from your AMH value.',
      },
    },

    {
      type: 'stat-strip',
      stats: [
        { value: '12,000+', label: 'Women have used the forecast' },
        { value: '4.9 / 5', label: 'Average rating from users' },
        { value: 'Under 2 min', label: 'From entering AMH to result' },
        { value: '₹49', label: 'One-time, per forecast' },
      ],
    },

    {
      type: 'specimen',
      eyebrow: 'What you receive',
      heading: 'A number is not an answer. We give you the reading too.',
      body:
        'Every forecast comes with a plain-language interpretation of what your result means for your age and reserve, a downloadable PDF report, and the result stored on your profile so you can compare it against a future test.',
      specimen: {
        caption: 'Interpretation — sample',
        figure: '9',
        figureUnit: 'years',
        figureLabel: 'Estimated time to onset',
        band: { level: 'calm', label: 'Typical ovarian reserve for this age' },
        rows: [
          { label: 'Reading',  value: 'AMH 1.8 ng/mL suggests a typical ovarian reserve for this age.' },
          { label: 'Guidance', value: 'The estimated timeline of 9 years is within the normal range.' },
        ],
      },
      action: { label: 'See how the forecast works', href: '/forecasting.asp', variant: 'quiet' },
    },

    {
      type: 'topic-index',
      eyebrow: 'Reading',
      heading: 'Written for women, not for charts',
      body:
        'Evidence-based guides covering the questions that actually come up — no jargon, no hedging, and no assumption that you already know the terminology.',
      topics: [
        {
          title: 'Gynaecology',
          body: 'The reproductive cycle, the conditions that disrupt it, and when a symptom is worth investigating.',
          href: '/gynaecology.asp',
        },
        {
          title: 'Menopause',
          body: 'What ovarian reserve is, why AMH predicts onset, and what changes in the years either side of it.',
          href: '/menopause.asp',
        },
        {
          title: 'Pregnancy',
          body: 'Conception through postpartum — the stages, the risks worth knowing, and the care that matters.',
          href: '/pregnancy.asp',
        },
        {
          title: 'General health',
          body: 'How the body’s systems interact, and what it means when that balance starts to shift.',
          href: '/health.asp',
        },
      ],
    },

    {
      type: 'method',
      eyebrow: 'Method',
      heading: 'Three steps, about two minutes',
      body:
        'You need one number from a blood test. Everything after that happens here.',
      steps: [
        {
          title: 'Get your AMH tested',
          body:
            'Any NABL-accredited lab — SRL, Dr Lal PathLabs, Metropolis, Thyrocare. No prescription needed, and AMH is stable across your cycle so any day works.',
        },
        {
          title: 'Enter your three values',
          body:
            'Your AMH result, your age at the time of the test, and whether your cycle is regular or irregular. We confirm them back to you before anything is charged.',
        },
        {
          title: 'Read your forecast',
          body:
            'An estimated age of onset, what it means for your reserve, and a PDF report. Stored on your profile — free to revisit any time.',
        },
      ],
    },

    {
      type: 'tool-callout',
      eyebrow: 'Free tool',
      heading: 'Bone mineral density calculator',
      body:
        'Bone density declines around menopause, which makes it worth tracking alongside your forecast. Enter your measurements for an instant score and its WHO classification. No account, no payment.',
      points: [
        'Instant result — no sign-up required',
        'Classified against WHO femoral-neck thresholds',
        'Printable report, private to you',
      ],
      action: { label: 'Calculate my BMD — free', href: '/bmd.asp', variant: 'primary' },
      scale: {
        heading: 'WHO classification',
        bands: [
          { level: 'calm',  label: 'Normal',       range: '≥ 0.738 g/cm²' },
          { level: 'watch', label: 'Osteopenia',   range: '0.558 – 0.737' },
          { level: 'act',   label: 'Osteoporosis', range: '< 0.558' },
        ],
      },
    },

    {
      type: 'pricing',
      eyebrow: 'Pricing',
      heading: 'One price, paid once',
      body:
        'No subscription and no upsell. You pay per forecast; reading it again later is always free.',
      price: '₹49',
      priceWas: '₹199',
      priceNote: 'per forecast · one-time',
      includes: [
        'Estimated age of natural menopause onset',
        'Plain-language interpretation of your result',
        'Downloadable PDF report',
        'Result stored permanently on your profile',
        'Up to 3 profiles — yourself, your mother, your sister',
      ],
      action: { label: 'Create an account', href: '/signup', variant: 'primary' },
      footnote: 'The BMD calculator stays free and needs no account.',
    },

    {
      type: 'contact',
      eyebrow: 'Contact',
      heading: 'Questions about a result?',
      body:
        'Ask about the model, a specific result, or anything that isn’t clear. We read every message.',
      details: [
        { label: 'Email',    value: 'hello@e-healthwatch.com' },
        { label: 'Phone',    value: '+44 (0) 123 456 789' },
        { label: 'Location', value: 'Medical Research Park, London, UK' },
      ],
      form: {
        fname: 'First name',
        lname: 'Last name',
        email: 'Email address',
        phone: 'Phone',
        message: 'Message',
        submit: 'Send message',
        success: 'Message sent. We’ll be in touch soon.',
      },
    },
  ],
};

module.exports = { home };
