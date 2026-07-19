import React, { useState } from 'react';
import { 
  Stethoscope, 
  Activity, 
  Database, 
  Info, 
  Menu, 
  X, 
  ChevronRight, 
  Calculator, 
  LineChart, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight
} from 'lucide-react';
import './_group.css';

export function ClinicalTrust() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter'] text-slate-800 flex flex-col">
      {/* Top Bar - Trust Indicators */}
      <div className="bg-[#0A2540] text-slate-300 text-xs py-2 px-4 md:px-8 flex justify-between items-center border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5E9]" />
            Evidence-based predictions
          </span>
          <span className="hidden md:flex items-center gap-1.5 border-l border-slate-600 pl-4">
            <Database className="w-3.5 h-3.5 text-[#0EA5E9]" />
            Data privacy secured
          </span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Patient Portal Login</a>
        </div>
      </div>

      {/* Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0A2540] text-white flex items-center justify-center font-bold text-xl font-['Playfair_Display']">e</div>
              <span className="font-['Playfair_Display'] font-bold text-xl text-[#0A2540] tracking-tight">
                healthwatch
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#" className="text-sm font-medium text-[#0A2540] hover:text-[#0EA5E9] transition-colors border-b-2 border-transparent hover:border-[#0EA5E9] py-8">Home</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-[#0A2540] transition-colors py-8">Gynaecology</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-[#0A2540] transition-colors py-8">Pregnancy</a>
              <div className="relative group">
                <button className="text-sm font-medium text-slate-600 hover:text-[#0A2540] transition-colors py-8 flex items-center gap-1">
                  Calculators <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </button>
                <div className="absolute top-full left-0 w-56 bg-white border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 grid p-2">
                  <a href="#" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0EA5E9] flex items-center gap-2"><LineChart className="w-4 h-4" /> Forecast Menopause</a>
                  <a href="#" className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#0EA5E9] flex items-center gap-2"><Calculator className="w-4 h-4" /> BMD Calculator <span className="ml-auto text-[10px] bg-slate-100 px-1.5 py-0.5 text-slate-500">Login</span></a>
                </div>
              </div>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-[#0A2540] transition-colors py-8">Contact Us</a>
            </nav>

            <button 
              className="md:hidden text-slate-600 hover:text-[#0A2540]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3">
            <a href="#" className="block px-3 py-2 text-base font-medium text-[#0A2540] bg-slate-50">Home</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0A2540]">Gynaecology</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0A2540]">Pregnancy</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0A2540]">Forecast Menopause</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0A2540]">BMD Calculator</a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0A2540]">Contact Us</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#0A2540] overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute inset-y-0 right-0 w-1/2 opacity-20 lg:opacity-40 pointer-events-none mix-blend-screen">
            <img src="/__mockup/images/clinical-hero.jpg" alt="Clinical Analytics" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A2540] via-[#0A2540]/80 to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold tracking-wider uppercase mb-6">
              Women's Health Analytics
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-white leading-tight mb-6">
              Precision Health <span className="text-[#0EA5E9]">Analytics.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 font-light leading-relaxed max-w-xl">
              Predictive health information using rigorous mathematical modelling to empower women with accurate, individualized clinical foresight.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#" className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium bg-[#0EA5E9] text-white hover:bg-[#0284C7] transition-colors gap-2">
                Forecast Menopause
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#" className="inline-flex items-center justify-center px-6 py-3.5 border border-slate-600 text-base font-medium text-white hover:bg-white/5 transition-colors gap-2">
                Calculate BMD
                <Calculator className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-['Playfair_Display'] font-bold text-[#0A2540] mb-4">Clinical Competencies</h2>
            <p className="text-slate-600">Comprehensive resources backed by peer-reviewed research and applied mathematical modelling.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 relative group hover:border-[#0EA5E9]/50 transition-colors shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0EA5E9]"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center mb-6 text-[#0EA5E9]">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A2540] mb-3">General Health</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Evidence-based information on women's general health, gynaecology, and reproductive wellness.
                </p>
                <a href="#" className="inline-flex items-center text-sm font-medium text-[#0EA5E9] hover:text-[#0284C7] group-hover:translate-x-1 transition-transform">
                  Explore resources <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 relative group hover:border-[#0EA5E9]/50 transition-colors shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0EA5E9]"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center mb-6 text-[#0EA5E9]">
                  <LineChart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A2540] mb-3">Menopause</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Proprietary AMH-based forecasting tools to predict menopausal onset with clinical precision.
                </p>
                <a href="#" className="inline-flex items-center text-sm font-medium text-[#0EA5E9] hover:text-[#0284C7] group-hover:translate-x-1 transition-transform">
                  Access tools <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 relative group hover:border-[#0EA5E9]/50 transition-colors shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0EA5E9]"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center mb-6 text-[#0EA5E9]">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A2540] mb-3">Data Modelling</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Sophisticated algorithms utilizing demographic and clinical data for individualized health trajectories.
                </p>
                <a href="#" className="inline-flex items-center text-sm font-medium text-[#0EA5E9] hover:text-[#0284C7] group-hover:translate-x-1 transition-transform">
                  Review methodology <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200 relative group hover:border-[#0EA5E9]/50 transition-colors shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0EA5E9]"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#E0F2FE] flex items-center justify-center mb-6 text-[#0EA5E9]">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A2540] mb-3">Disease Pathology</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  In-depth clinical insights into disease manifestation, progression, and evidence-based interventions.
                </p>
                <a href="#" className="inline-flex items-center text-sm font-medium text-[#0EA5E9] hover:text-[#0284C7] group-hover:translate-x-1 transition-transform">
                  View literature <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Calculator Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0A2540] text-white p-8 md:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="99.5" stroke="currentColor"/>
                <circle cx="100" cy="100" r="79.5" stroke="currentColor"/>
                <circle cx="100" cy="100" r="59.5" stroke="currentColor"/>
                <path d="M100 0V200" stroke="currentColor"/>
                <path d="M0 100H200" stroke="currentColor"/>
              </svg>
            </div>
            
            <div className="relative z-10 grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                <span className="text-[#0EA5E9] font-medium tracking-wide uppercase text-sm mb-2 block">Clinical Tool</span>
                <h2 className="text-3xl font-['Playfair_Display'] font-bold mb-4">Bone Mineral Density (BMD) Calculator</h2>
                <p className="text-slate-300 mb-8 max-w-xl text-lg font-light">
                  A sophisticated assessment tool designed for medical professionals and verified patients to evaluate bone health trajectory and fracture risk probability.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Requires verified user authentication for data integrity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Incorporates T-score, Z-score, and demographic variables</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Generates comprehensive PDF diagnostic reports</span>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#" className="inline-flex items-center justify-center px-6 py-3 bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] transition-colors">
                    Access Calculator
                  </a>
                  <a href="#" className="inline-flex items-center justify-center px-6 py-3 border border-slate-600 text-white font-medium hover:bg-white/5 transition-colors">
                    Create Provider Account
                  </a>
                </div>
              </div>
              <div className="lg:col-span-2 hidden lg:block">
                <div className="bg-slate-800 p-6 border border-slate-700 shadow-2xl">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                    <h4 className="font-semibold text-slate-200 flex items-center gap-2"><Calculator className="w-4 h-4 text-[#0EA5E9]"/> Secure Login</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Provider / Patient ID</label>
                      <input type="text" className="w-full bg-slate-900 border border-slate-700 p-2 text-slate-200 text-sm focus:outline-none focus:border-[#0EA5E9]" placeholder="Enter ID" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Passcode</label>
                      <input type="password" className="w-full bg-slate-900 border border-slate-700 p-2 text-slate-200 text-sm focus:outline-none focus:border-[#0EA5E9]" placeholder="••••••••" />
                    </div>
                    <button className="w-full bg-slate-700 text-white py-2 text-sm font-medium hover:bg-slate-600 transition-colors mt-2">Authenticate</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Trust Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Trust Builder Panel */}
            <div>
              <h2 className="text-3xl font-['Playfair_Display'] font-bold text-[#0A2540] mb-6">Why e-healthwatch?</h2>
              <p className="text-slate-600 mb-10 leading-relaxed text-lg">
                We bridge the gap between complex epidemiological data and actionable individual foresight. Our platform is built on rigorous scientific principles.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-none flex items-center justify-center flex-shrink-0 text-[#0A2540]">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#0A2540] mb-2">Mathematical Precision</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Our forecasting models utilize validated longitudinal datasets to provide statistically significant predictions rather than generic estimates.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-none flex items-center justify-center flex-shrink-0 text-[#0A2540]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#0A2540] mb-2">Clinical Utility</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Designed specifically to assist both healthcare providers in diagnosis and patients in proactive lifestyle management.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-none flex items-center justify-center flex-shrink-0 text-[#0A2540]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[#0A2540] mb-2">Data Integrity</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">Adherence to strict medical data privacy standards ensuring all calculator inputs and demographic data remain secure.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-slate-200 p-8 lg:p-10 shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0A2540]"></div>
              <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#0A2540] mb-2">Clinical Inquiry</h3>
              <p className="text-slate-500 text-sm mb-8">For medical professionals, researchers, and technical support.</p>
              
              <form className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input type="text" className="w-full border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input type="text" className="w-full border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all bg-slate-50" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input type="email" className="w-full border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all bg-slate-50" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select className="w-full border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all bg-slate-50 text-slate-700">
                    <option>General Inquiry</option>
                    <option>Calculator Technical Support</option>
                    <option>Data Modelling Methodology</option>
                    <option>Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea rows={4} className="w-full border border-slate-300 p-2.5 text-sm focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] transition-all bg-slate-50 resize-none"></textarea>
                </div>
                
                <button type="button" className="w-full bg-[#0A2540] text-white py-3 font-medium hover:bg-[#1e3a5f] transition-colors flex items-center justify-center gap-2 mt-2">
                  Submit Inquiry <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2540] text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Col */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#0EA5E9] text-white flex items-center justify-center font-bold text-xl font-['Playfair_Display']">e</div>
                <span className="font-['Playfair_Display'] font-bold text-xl text-white tracking-tight">
                  healthwatch
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Predictive health information using rigorous mathematical modelling to empower women with accurate, individualized clinical foresight.
              </p>
            </div>

            {/* Links Col 1 */}
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-wider">Clinical Areas</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm hover:text-[#0EA5E9] transition-colors">Gynaecology</a></li>
                <li><a href="#" className="text-sm hover:text-[#0EA5E9] transition-colors">Pregnancy</a></li>
                <li><a href="#" className="text-sm hover:text-[#0EA5E9] transition-colors">General Health</a></li>
                <li><a href="#" className="text-sm hover:text-[#0EA5E9] transition-colors">Disease Pathology</a></li>
              </ul>
            </div>

            {/* Links Col 2 */}
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-wider">Predictive Tools</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm hover:text-[#0EA5E9] transition-colors flex items-center gap-2"><LineChart className="w-3.5 h-3.5"/> Forecast Menopause</a></li>
                <li><a href="#" className="text-sm hover:text-[#0EA5E9] transition-colors flex items-center gap-2"><Calculator className="w-3.5 h-3.5"/> BMD Calculator</a></li>
                <li><a href="#" className="text-sm hover:text-[#0EA5E9] transition-colors">Data Modelling Specs</a></li>
                <li><a href="#" className="text-sm hover:text-[#0EA5E9] transition-colors">Research Methodology</a></li>
              </ul>
            </div>

            {/* Contact Col */}
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase text-xs tracking-wider">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#0EA5E9] mt-0.5" />
                  <span className="text-sm">inquiries@ehealthwatch.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#0EA5E9] mt-0.5" />
                  <span className="text-sm">+1 (800) 555-0198</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#0EA5E9] mt-0.5" />
                  <span className="text-sm">1400 Clinical Blvd<br/>Suite 300<br/>Medical District</span>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} e-healthwatch. All rights reserved. Not intended as substitute for professional medical advice.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Cookie Notice</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
