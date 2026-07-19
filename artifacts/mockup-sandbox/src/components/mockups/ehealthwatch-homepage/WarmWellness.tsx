import React, { useState } from 'react';
import { Heart, Activity, LineChart, BookOpen, ChevronRight, Menu, X, Mail, MapPin, Phone, ArrowRight, User, Sparkles, Users, ShieldCheck, Zap, Star, CheckCircle2, Clock } from 'lucide-react';
import './_group.css';

export default function WarmWellness() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Gynaecology', href: '#' },
    { name: 'Pregnancy', href: '#' },
    { name: 'Forecast Menopause', href: '#' },
    { name: 'BMD Calculator', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#78716C] font-nunito overflow-x-hidden selection:bg-rose-200 selection:text-rose-900">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#FFFBF5]/90 backdrop-blur-md border-b border-rose-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                <Heart className="w-6 h-6" fill="currentColor" />
              </div>
              <span className="font-lora text-2xl font-semibold text-[#44403C]">e-health<span className="text-[#E11D48]">watch</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-[15px] font-medium text-[#78716C] hover:text-[#E11D48] transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-[#E11D48] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  {link.name}
                </a>
              ))}
              <button className="bg-gradient-to-r from-[#E11D48] to-rose-500 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                <User className="w-4 h-4" />
                Login
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#78716C] hover:text-[#E11D48] focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#FFFBF5] border-t border-rose-100 px-4 pt-2 pb-6 space-y-2 shadow-xl absolute w-full">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-3 text-base font-medium text-[#78716C] hover:text-[#E11D48] hover:bg-rose-50 rounded-xl"
              >
                {link.name}
              </a>
            ))}
            <div className="px-3 pt-4">
              <button className="w-full bg-[#E11D48] text-white px-6 py-3 rounded-full font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Login to BMD Calculator
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden bg-gradient-warm">
        {/* Decorative background blurs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-green-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Text */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/80 text-rose-700 font-medium text-sm mb-6 border border-rose-200/50 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Trusted Women's Health Platform
              </div>
              <h1 className="font-lora text-4xl sm:text-5xl lg:text-6xl text-[#44403C] leading-tight mb-6">
                Predictive health insights with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E11D48] to-rose-400">warmth & precision.</span>
              </h1>
              <p className="text-lg sm:text-xl text-[#78716C] mb-10 leading-relaxed font-light">
                Empowering women through advanced mathematical modelling. Because understanding your health journey shouldn't feel clinical—it should feel deeply personal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#E11D48] text-white px-8 py-4 rounded-full font-medium hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-600/20 transition-all duration-300 flex items-center justify-center gap-2 group text-lg">
                  Forecast Menopause
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="bg-white text-[#44403C] border-2 border-rose-100 px-8 py-4 rounded-full font-medium hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 flex items-center justify-center gap-2 text-lg">
                  BMD Calculator
                </button>
              </div>
              
              <div className="mt-10 flex items-center gap-4 text-sm text-[#78716C]">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#FFFBF5] bg-rose-${i}00 flex items-center justify-center overflow-hidden bg-rose-100`}>
                       <User className="w-5 h-5 text-rose-300" />
                    </div>
                  ))}
                </div>
                <p>Join 12,000+ women<br/>taking control of their health today</p>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative lg:ml-10">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                <img 
                  src="/__mockup/images/warm-hero.jpg" 
                  alt="Abstract feminine health" 
                  className="w-full h-full object-cover blob-shape shadow-2xl shadow-rose-900/10 border-4 border-white/50"
                />
                
                {/* Floating deal card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md px-5 py-4 rounded-3xl shadow-xl shadow-rose-200/60 border border-rose-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-rose-500 font-bold uppercase tracking-widest mb-0.5">Limited Offer</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-lora font-bold text-[#44403C]">₹49</span>
                      <span className="text-sm line-through text-stone-400">₹199</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="wave-divider text-[#FFFBF5]">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,111.47,196.59,101.4,239.5,94.9,282.7,80.8,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="bg-white border-y border-rose-100/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-[#78716C]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['bg-rose-200','bg-amber-200','bg-green-200','bg-purple-200'].map((c,i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center`}>
                    <User className="w-4 h-4 text-stone-600" />
                  </div>
                ))}
              </div>
              <span className="font-medium text-[#44403C]">12,000+ women <span className="text-rose-500 font-semibold">already using it</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4" fill="currentColor" />)}
              </div>
              <span className="font-medium text-[#44403C]">4.9 / 5 <span className="text-stone-400 font-normal">from users</span></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span className="font-medium text-[#44403C]">100% Private & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span className="font-medium text-[#44403C]">Special Offer: <span className="text-rose-500 font-bold">₹49</span> <span className="line-through text-stone-400 font-normal">₹199</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* Information Cards Section */}
      <section className="py-24 bg-[#FFFBF5] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-lora text-3xl sm:text-4xl text-[#44403C] mb-4">Comprehensive Understanding</h2>
            <p className="text-[#78716C] text-lg">We bridge the gap between complex medical data and actionable, personal health insights.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-rose-50/50 border border-rose-100 hover:border-rose-300 hover:bg-rose-50 transition-all duration-300 rounded-[2rem] p-8 group cursor-pointer">
              <div className="w-14 h-14 bg-rose-200/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="font-lora text-xl font-semibold text-[#44403C] mb-3">General Health</h3>
              <p className="text-[#78716C] mb-6 leading-relaxed">Evidence-based insights into women's daily health and wellbeing.</p>
              <div className="inline-flex items-center text-[#E11D48] font-medium group-hover:underline decoration-2 underline-offset-4">
                Learn more <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-amber-50/50 border border-amber-100 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300 rounded-[2rem] p-8 group cursor-pointer mt-0 lg:mt-8">
              <div className="w-14 h-14 bg-amber-200/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-lora text-xl font-semibold text-[#44403C] mb-3">Menopause</h3>
              <p className="text-[#78716C] mb-6 leading-relaxed">Forecast your timeline with AMH-based predictive algorithms.</p>
              <div className="inline-flex items-center text-amber-600 font-medium group-hover:underline decoration-2 underline-offset-4">
                Learn more <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-green-50/50 border border-green-100 hover:border-green-300 hover:bg-green-50 transition-all duration-300 rounded-[2rem] p-8 group cursor-pointer">
              <div className="w-14 h-14 bg-green-200/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <LineChart className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-lora text-xl font-semibold text-[#44403C] mb-3">Data Modelling</h3>
              <p className="text-[#78716C] mb-6 leading-relaxed">Sophisticated mathematical models translating raw data to insights.</p>
              <div className="inline-flex items-center text-green-600 font-medium group-hover:underline decoration-2 underline-offset-4">
                Learn more <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-purple-50/50 border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 rounded-[2rem] p-8 group cursor-pointer mt-0 lg:mt-8">
              <div className="w-14 h-14 bg-purple-200/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-lora text-xl font-semibold text-[#44403C] mb-3">About Disease</h3>
              <p className="text-[#78716C] mb-6 leading-relaxed">Comprehensive library of gynaecological conditions and markers.</p>
              <div className="inline-flex items-center text-purple-600 font-medium group-hover:underline decoration-2 underline-offset-4">
                Learn more <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,207,232,0.2),transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-rose-500 font-semibold text-sm uppercase tracking-widest mb-4">
              <Zap className="w-4 h-4" /> Simple to use
            </span>
            <h2 className="font-lora text-3xl sm:text-4xl text-[#44403C] mb-4">Your health journey in 3 steps</h2>
            <p className="text-[#78716C] text-lg">No jargon, no sign-up walls. Just clear, personalised health insights at your fingertips.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-rose-200 via-amber-200 to-green-200"></div>
            {[
              { step: '01', icon: <BookOpen className="w-7 h-7 text-rose-600" />, bg: 'bg-rose-100', title: 'Explore Your Topics', desc: 'Browse gynaecology, menopause, pregnancy, and bone health guides — all written in plain language, evidence-based.' },
              { step: '02', icon: <Activity className="w-7 h-7 text-amber-600" />, bg: 'bg-amber-100', title: 'Run a Prediction', desc: 'Enter your AMH level or BMD data into our calculators and get an instant, personalised forecast in seconds.' },
              { step: '03', icon: <CheckCircle2 className="w-7 h-7 text-green-600" />, bg: 'bg-green-100', title: 'Understand Your Results', desc: 'Receive clear insights and guidance on your results with recommended next steps tailored to you.' },
            ].map(({ step, icon, bg, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center p-8">
                <div className={`w-20 h-20 ${bg} rounded-3xl flex items-center justify-center mb-6 shadow-sm`}>
                  {icon}
                </div>
                <span className="text-4xl font-lora font-bold text-stone-100 absolute top-6 right-8 select-none">{step}</span>
                <h3 className="font-lora text-xl font-semibold text-[#44403C] mb-3">{title}</h3>
                <p className="text-[#78716C] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          {/* Quick-start CTA */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-gradient-to-r from-[#E11D48] to-rose-500 text-white px-10 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
              <Zap className="w-5 h-5" /> Get Started at ₹49
            </button>
            <button className="border border-rose-200 text-[#E11D48] px-10 py-4 rounded-full font-semibold hover:bg-rose-50 transition-all duration-300 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Takes less than 2 minutes
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section (BMD) */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Soft curve top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-[#FFFBF5]">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,111.47,196.59,101.4,239.5,94.9,282.7,80.8,321.39,56.44Z"></path>
            </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-[3rem] p-8 md:p-16 border border-rose-100 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="font-lora text-3xl sm:text-4xl text-[#44403C] mb-4">Bone Mineral Density Calculator</h2>
              <p className="text-[#78716C] text-lg mb-8 max-w-xl leading-relaxed">
                Log in to securely access our advanced BMD calculator. Track your bone health trajectory over time and receive personalized insights based on your specific medical profile.
              </p>
              <ul className="space-y-4 mb-8">
                {['Track historical BMD data', 'Compare with age-matched averages', 'Secure and private analysis'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#44403C]">
                    <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-rose-700" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="bg-[#44403C] text-white px-8 py-4 rounded-full font-medium hover:bg-[#292524] transition-all duration-300 flex items-center gap-2">
                <User className="w-5 h-5" />
                Login to Access Calculator
              </button>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-[4/3] bg-white rounded-3xl shadow-xl shadow-rose-900/5 border border-stone-100 overflow-hidden p-6 flex flex-col">
                 <div className="h-8 border-b border-stone-100 flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-stone-200"></div>
                    <div className="w-3 h-3 rounded-full bg-stone-200"></div>
                    <div className="w-3 h-3 rounded-full bg-stone-200"></div>
                 </div>
                 <div className="flex-1 bg-stone-50 rounded-xl border border-stone-100 relative overflow-hidden">
                    {/* Fake chart */}
                    <svg className="absolute bottom-0 w-full h-2/3" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M0,100 L0,50 Q25,20 50,60 T100,30 L100,100 Z" fill="url(#gradientRose)" opacity="0.5" />
                      <path d="M0,50 Q25,20 50,60 T100,30" fill="none" stroke="#E11D48" strokeWidth="2" />
                      <defs>
                        <linearGradient id="gradientRose" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E11D48" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                 </div>
              </div>
              {/* Decorative blobs around image */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-rose-100 rounded-full mix-blend-multiply blur-xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-100 rounded-full mix-blend-multiply blur-xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[#FFFBF5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-rose-100 text-rose-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">Limited Time Offer</span>
            <h2 className="font-lora text-3xl sm:text-4xl text-[#44403C] mb-4">Simple, honest pricing</h2>
            <p className="text-[#78716C] text-lg">Full access to predictive health tools — at a price that respects you.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Offer Card */}
            <div className="relative bg-gradient-to-br from-rose-500 to-rose-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-rose-500/30 overflow-hidden">
              {/* Background glow */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-bold mb-6">
                  <Sparkles className="w-4 h-4" /> Special Offer — Limited Time
                </div>

                <div className="flex items-end gap-4 mb-2">
                  <span className="text-7xl font-lora font-bold leading-none">₹49</span>
                  <div className="pb-2">
                    <p className="text-white/60 text-sm line-through">₹199</p>
                    <p className="text-white/80 text-sm">75% off</p>
                  </div>
                </div>
                <p className="text-white/80 mb-8">One-time access · No subscription</p>

                <ul className="space-y-3 mb-10">
                  {[
                    'Menopause Forecasting Calculator',
                    'Bone Mineral Density (BMD) Calculator',
                    'Full Gynaecology & Pregnancy Guides',
                    'Personalised health insights',
                    'Private & secure results',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/90">
                      <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full bg-white text-rose-600 font-bold py-4 rounded-2xl hover:bg-rose-50 transition-colors shadow-lg text-lg">
                  Get Full Access — ₹49
                </button>
                <p className="text-center text-white/60 text-sm mt-4">Secure payment · Instant access</p>
              </div>
            </div>

            {/* Value props */}
            <div className="space-y-6 pl-0 md:pl-6">
              <h3 className="font-lora text-2xl text-[#44403C]">Why ₹49 is worth every rupee</h3>
              {[
                { icon: <ShieldCheck className="w-6 h-6 text-green-500" />, bg: 'bg-green-50', title: 'Clinically grounded models', desc: 'Our AMH-based menopause forecasting and BMD algorithms are built on peer-reviewed research.' },
                { icon: <Zap className="w-6 h-6 text-amber-500" />, bg: 'bg-amber-50', title: 'Results in under 2 minutes', desc: 'Enter your data, get a personalised prediction instantly — no waiting, no appointments.' },
                { icon: <Users className="w-6 h-6 text-rose-500" />, bg: 'bg-rose-50', title: 'Trusted by 12,000+ women', desc: 'Women across India use e-healthwatch to understand their health journey on their own terms.' },
                { icon: <Star className="w-6 h-6 text-purple-500" />, bg: 'bg-purple-50', title: '4.9 / 5 user satisfaction', desc: 'Users consistently rate us highly for clarity, accuracy, and ease of use.' },
              ].map(({ icon, bg, title, desc }) => (
                <div key={title} className="flex gap-4 items-start">
                  <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
                  <div>
                    <p className="font-semibold text-[#44403C] mb-1">{title}</p>
                    <p className="text-[#78716C] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-[#FFFBF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-lora text-3xl sm:text-4xl text-[#44403C] mb-4">Let's start a conversation</h2>
              <p className="text-[#78716C] text-lg">Have questions about our predictive models or need technical support? We're here for you.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-rose-900/5 border border-stone-100 p-8 md:p-12">
              <div className="grid md:grid-cols-5 gap-12">
                
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="font-lora text-2xl font-medium text-[#44403C] mb-6">Contact Info</h3>
                    <div className="space-y-6 text-[#78716C]">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 text-[#E11D48]">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[#44403C]">Email us</p>
                          <p>hello@e-healthwatch.com</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 text-[#E11D48]">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[#44403C]">Call us</p>
                          <p>+44 (0) 123 456 789</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 text-[#E11D48]">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[#44403C]">Location</p>
                          <p>Medical Research Park<br/>London, UK</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#44403C]">First Name</label>
                        <input type="text" className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all text-[#44403C]" placeholder="Jane" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#44403C]">Last Name</label>
                        <input type="text" className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all text-[#44403C]" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#44403C]">Email Address</label>
                      <input type="email" className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all text-[#44403C]" placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#44403C]">Message</label>
                      <textarea rows={4} className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all text-[#44403C] resize-none" placeholder="How can we help you?"></textarea>
                    </div>
                    <button type="button" className="w-full bg-[#44403C] text-white py-4 rounded-2xl font-medium hover:bg-[#292524] transition-colors shadow-lg shadow-stone-800/10">
                      Send Message
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#44403C] pt-20 pb-10 text-stone-300 relative overflow-hidden">
        {/* Decorative soft glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-rose-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6 text-white">
                <Heart className="w-6 h-6 text-rose-400" fill="currentColor" />
                <span className="font-lora text-2xl font-semibold">e-health<span className="text-rose-400">watch</span></span>
              </div>
              <p className="text-stone-400 leading-relaxed mb-6">
                Predictive health information using sophisticated mathematical modelling. Empowering women with data.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-lora font-medium text-lg mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-rose-400 transition-colors">Menopause Forecast</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">BMD Calculator</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Gynaecology Data</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Pregnancy Info</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-lora font-medium text-lg mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-rose-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Methodology</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-lora font-medium text-lg mb-6">Stay Updated</h4>
              <p className="text-stone-400 mb-4">Join our newsletter for the latest updates in women's health modelling.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-rose-400 text-white placeholder-stone-500" />
                <button className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-xl transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500 text-sm">
            <p>© {new Date().getFullYear()} e-healthwatch. All rights reserved.</p>
            <p>Designed with warmth and precision.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
