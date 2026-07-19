import React, { useState } from 'react';
import { 
  Menu, X, ChevronRight, Activity, 
  Brain, Database, FlaskConical, Calculator, 
  ArrowRight, ShieldCheck, Mail, Send
} from 'lucide-react';
import './_bold_science.css';

export default function BoldScience() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bold-science-container relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-charcoal/90 backdrop-blur-md border-b border-dark-separator">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-cyan-accent/10 flex items-center justify-center border border-cyan-accent/30">
                <Activity className="w-5 h-5 text-cyan-accent" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                e-health<span className="text-cyan-accent">watch</span>
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8">
              {['Home', 'Gynaecology', 'Pregnancy', 'Forecast Menopause', 'BMD Calculator'].map((item) => (
                <a key={item} href="#" className="text-sm text-gray-400 hover:text-cyan-accent transition-colors font-medium">
                  {item}
                </a>
              ))}
            </div>
            
            <div className="hidden md:flex items-center">
              <button className="px-5 py-2 text-sm font-semibold bg-cyan-accent text-charcoal rounded-none hover:bg-white transition-colors">
                Login / Register
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-card border-b border-dark-separator">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Home', 'Gynaecology', 'Pregnancy', 'Forecast Menopause', 'BMD Calculator'].map((item) => (
                <a key={item} href="#" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-cyan-accent hover:bg-white/5">
                  {item}
                </a>
              ))}
              <div className="mt-4 pt-4 border-t border-dark-separator">
                <button className="w-full text-center px-5 py-3 text-sm font-semibold bg-cyan-accent text-charcoal">
                  Login / Register
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-cyan-accent/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[100px] rounded-full mix-blend-screen" />
          
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-accent/10 border border-cyan-accent/20 text-cyan-accent text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-accent animate-pulse" />
                Evidence-Based Medicine
              </div>
              
              <h1 className="font-heading text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Predictive health through <br/>
                <span className="text-gradient-cyan glow-text">mathematical modelling</span>
              </h1>
              
              <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed font-light">
                Advanced clinical algorithms delivering precise forecasts for menopause transition, BMD assessment, and women's health diagnostics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="glow-btn bg-cyan-accent text-charcoal px-8 py-4 font-semibold flex items-center justify-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Run Prediction Model
                </button>
                <button className="px-8 py-4 font-semibold border border-dark-separator text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                  View Methodology <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6 pt-8 border-t border-dark-separator/50">
                <div>
                  <div className="text-3xl font-heading font-bold text-white mb-1">4.2M</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Data Points Analyzed</div>
                </div>
                <div>
                  <div className="text-3xl font-heading font-bold text-white mb-1">98<span className="text-cyan-accent">%</span></div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Model Accuracy</div>
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              {/* Abstract decorative nodes */}
              <div className="data-node top-10 left-10 animate-float" />
              <div className="data-node bottom-20 right-20 animate-float-delayed" />
              <div className="data-node top-1/2 right-10 animate-float" />
              
              <div className="relative w-full aspect-square max-w-md mx-auto border border-dark-separator/50 bg-dark-card/50 backdrop-blur-sm p-4 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-tr before:from-cyan-500/10 before:to-transparent before:z-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-accent to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-transparent via-cyan-accent to-transparent opacity-50" />
                
                <img 
                  src="/__mockup/images/bold-hero.jpg" 
                  alt="Scientific Data Visualization" 
                  className="w-full h-full object-cover filter contrast-125 brightness-90 relative z-10"
                />
                
                {/* Floating UI element */}
                <div className="absolute -left-6 bottom-12 bg-charcoal border border-dark-separator p-4 shadow-2xl z-20 animate-float">
                  <div className="text-xs text-cyan-accent font-mono mb-1">SYS.MODEL_AMH</div>
                  <div className="font-heading font-bold text-lg">Menopause Forecast</div>
                  <div className="w-full bg-dark-separator h-1 mt-2">
                    <div className="w-3/4 h-full bg-cyan-accent" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Info Cards Section */}
      <div className="py-24 bg-[#0a0d12] border-y border-dark-separator/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-16">
            <h2 className="font-heading text-3xl font-bold mb-4">Core Competencies</h2>
            <div className="h-1 w-20 bg-cyan-accent" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-dark-card p-8 glow-border-top group hover:bg-dark-card/80 transition-colors border-x border-b border-dark-separator">
              <Activity className="w-8 h-8 text-cyan-accent mb-6" />
              <h3 className="font-heading text-xl font-bold mb-3">Women's Health</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Comprehensive physiological modelling for reproductive health, bone density, and hormonal transitions.
              </p>
              <a href="#" className="inline-flex items-center text-xs font-bold text-cyan-accent group-hover:text-white transition-colors uppercase tracking-widest">
                Explore Domain <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Card 2 */}
            <div className="bg-dark-card p-8 group hover:bg-dark-card/80 transition-colors border border-dark-separator">
              <Brain className="w-8 h-8 text-gold-accent mb-6" />
              <h3 className="font-heading text-xl font-bold mb-3">Menopause Modelling</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Predictive algorithms utilizing AMH (Anti-Müllerian Hormone) biomarkers to forecast transition timelines.
              </p>
              <a href="#" className="inline-flex items-center text-xs font-bold text-gold-accent group-hover:text-white transition-colors uppercase tracking-widest">
                View Algorithm <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Card 3 */}
            <div className="bg-dark-card p-8 group hover:bg-dark-card/80 transition-colors border border-dark-separator">
              <Database className="w-8 h-8 text-cyan-accent mb-6" />
              <h3 className="font-heading text-xl font-bold mb-3">Data Analytics</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Rigorous statistical frameworks mapping longitudinal health data against standardized physiological models.
              </p>
              <a href="#" className="inline-flex items-center text-xs font-bold text-cyan-accent group-hover:text-white transition-colors uppercase tracking-widest">
                Data Security <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Card 4 */}
            <div className="bg-dark-card p-8 group hover:bg-dark-card/80 transition-colors border border-dark-separator">
              <FlaskConical className="w-8 h-8 text-white mb-6" />
              <h3 className="font-heading text-xl font-bold mb-3">Disease Vectors</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Risk stratification for age-related conditions including osteoporosis and cardiovascular complications.
              </p>
              <a href="#" className="inline-flex items-center text-xs font-bold text-white group-hover:text-cyan-accent transition-colors uppercase tracking-widest">
                Read Research <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Computational Tools Section */}
      <div className="py-24 relative overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-heading text-4xl font-bold mb-4">Clinical Calculators</h2>
              <p className="text-gray-400">Validated mathematical models designed for clinical decision support and patient prognostication.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calculator 1 */}
            <div className="relative p-1 bg-gradient-to-br from-dark-separator to-transparent group">
              <div className="bg-charcoal h-full p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Calculator className="w-48 h-48" />
                </div>
                
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-cyan-accent/10 text-cyan-accent text-xs font-mono mb-6 border border-cyan-accent/20">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED MODEL
                </div>
                
                <h3 className="font-heading text-2xl font-bold mb-2">BMD Calculator</h3>
                <p className="text-gray-400 mb-8 max-w-sm">
                  Bone Mineral Density diagnostic tool based on latest DXA scan normative data parameters.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm border-b border-dark-separator pb-2">
                    <span className="text-gray-500">Input Variables</span>
                    <span className="font-mono text-white">T-Score, Z-Score</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-dark-separator pb-2">
                    <span className="text-gray-500">Access Level</span>
                    <span className="font-mono text-gold-accent">Requires Login</span>
                  </div>
                </div>

                <button className="w-full py-4 border border-cyan-accent text-cyan-accent hover:bg-cyan-accent hover:text-charcoal transition-all font-semibold uppercase tracking-widest text-sm">
                  Initialize Calculator
                </button>
              </div>
            </div>

            {/* Calculator 2 */}
            <div className="relative p-1 bg-gradient-to-br from-dark-separator to-transparent group">
              <div className="bg-charcoal h-full p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity className="w-48 h-48" />
                </div>
                
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-cyan-accent/10 text-cyan-accent text-xs font-mono mb-6 border border-cyan-accent/20">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED MODEL
                </div>
                
                <h3 className="font-heading text-2xl font-bold mb-2">Menopause Forecast</h3>
                <p className="text-gray-400 mb-8 max-w-sm">
                  Predictive horizon modelling utilizing AMH levels and chronological age matrices.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm border-b border-dark-separator pb-2">
                    <span className="text-gray-500">Input Variables</span>
                    <span className="font-mono text-white">Age, AMH (ng/ml)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-dark-separator pb-2">
                    <span className="text-gray-500">Access Level</span>
                    <span className="font-mono text-white">Public Access</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-cyan-accent text-charcoal hover:bg-white transition-all font-semibold uppercase tracking-widest text-sm">
                  Run Forecast Model
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-24 bg-dark-card border-t border-dark-separator">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-dark-separator bg-charcoal p-8 md:p-12 relative overflow-hidden">
            {/* Accent corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-accent/20 clip-path-polygon-[100%_0,0_0,100%_100%]" />
            <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-accent clip-path-polygon-[100%_0,0_0,100%_100%]" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-none bg-dark-separator flex items-center justify-center">
                <Mail className="w-5 h-5 text-cyan-accent" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold">System Inquiry</h2>
                <p className="text-sm text-gray-400">Establish encrypted communication</p>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Identifier</label>
                  <input 
                    type="text" 
                    className="w-full bg-dark-card border border-dark-separator focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent p-3 text-white transition-colors"
                    placeholder="Dr. Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Return Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-dark-card border border-dark-separator focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent p-3 text-white transition-colors"
                    placeholder="email@institution.edu"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Subject Payload</label>
                <select className="w-full bg-dark-card border border-dark-separator focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent p-3 text-white transition-colors appearance-none">
                  <option>General Inquiry</option>
                  <option>Model Feedback</option>
                  <option>Research Collaboration</option>
                  <option>Data Access Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Data Transmission</label>
                <textarea 
                  rows={4}
                  className="w-full bg-dark-card border border-dark-separator focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent p-3 text-white transition-colors resize-none"
                  placeholder="Enter message parameters..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button type="button" className="flex items-center gap-2 bg-cyan-accent text-charcoal px-6 py-3 font-semibold hover:bg-white transition-colors">
                  <Send className="w-4 h-4" /> Transmit Data
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#050608] border-t border-dark-separator py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-cyan-accent" />
                <span className="font-heading font-bold text-xl tracking-tight text-white">
                  e-health<span className="text-cyan-accent">watch</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 max-w-sm mb-6">
                Advancing women's health through rigorous mathematical modelling, data science, and evidence-based predictive algorithms.
              </p>
              <div className="text-xs font-mono text-cyan-accent bg-cyan-accent/10 inline-block px-2 py-1 border border-cyan-accent/20">
                SYSTEM STATUS: ONLINE / v2.4.1
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-widest mb-4">Architecture</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-cyan-accent transition-colors">Prediction Models</a></li>
                <li><a href="#" className="hover:text-cyan-accent transition-colors">BMD Calculator</a></li>
                <li><a href="#" className="hover:text-cyan-accent transition-colors">Data Schemas</a></li>
                <li><a href="#" className="hover:text-cyan-accent transition-colors">Clinical Research</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-widest mb-4">Operations</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-cyan-accent transition-colors">About Facility</a></li>
                <li><a href="#" className="hover:text-cyan-accent transition-colors">Contact Node</a></li>
                <li><a href="#" className="hover:text-cyan-accent transition-colors">Privacy Protocol</a></li>
                <li><a href="#" className="hover:text-cyan-accent transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
          </div>

          <div className="border-t border-dark-separator pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-600 font-mono">
              &copy; {new Date().getFullYear()} E-Healthwatch Research. All rights reserved.
            </div>
            <div className="flex gap-4 text-xs font-mono text-gray-600">
              <span>SECURE CONNECTION</span>
              <span className="text-dark-separator">|</span>
              <span>AES-256</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
