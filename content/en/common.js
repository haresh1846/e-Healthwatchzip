// @ts-check
/** Site-wide chrome for the `en` locale. @type {import('../schema').SiteChrome} */
const chrome = {
  brand: 'e-healthwatch',
  skipToContent: 'Skip to content',
  nav: [
    { label: 'Menopause forecast', href: '/forecasting.asp' },
    { label: 'BMD calculator',     href: '/bmd.asp' },
    { label: 'Gynaecology',        href: '/gynaecology.asp' },
    { label: 'Pregnancy',          href: '/pregnancy.asp' },
    { label: 'Contact',            href: '/contact.asp' },
  ],
  navAction: { label: 'Sign in', href: '/login', variant: 'primary' },
  footer: {
    tagline: 'Predictive health information for women, built on published clinical research.',
    groups: [
      {
        heading: 'Tools',
        links: [
          { label: 'Menopause forecast', href: '/forecasting.asp' },
          { label: 'BMD calculator',     href: '/bmd.asp' },
        ],
      },
      {
        heading: 'Reading',
        links: [
          { label: 'Gynaecology',   href: '/gynaecology.asp' },
          { label: 'Pregnancy',     href: '/pregnancy.asp' },
          { label: 'Menopause',     href: '/menopause.asp' },
          { label: 'General health', href: '/health.asp' },
        ],
      },
      {
        heading: 'Account',
        links: [
          { label: 'Sign in',        href: '/login' },
          { label: 'Create account', href: '/signup' },
          { label: 'Privacy policy', href: '/privacy' },
        ],
      },
    ],
    legal: 'e-healthwatch provides statistical estimates for information only. It is not a diagnosis and does not replace medical advice.',
  },
};

module.exports = { chrome };
