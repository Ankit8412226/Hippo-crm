import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building,
  ShieldCheck,
  Award,
  MapPin,
  Users,
  ChevronRight,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck,
  TrendingUp,
  Search,
  CheckCircle2,
  Lock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import api from '../services/api';
import { Project, Plot } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interest: 'General Inquiry'
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, plotRes] = await Promise.all([
          api.get('/projects').catch(() => ({ data: [] })),
          api.get('/plots').catch(() => ({ data: [] }))
        ]);
        setProjects(projRes.data || []);
        setPlots(plotRes.data || []);
      } catch (err) {
        console.error('Failed to load landing page preview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', phone: '', message: '', interest: 'General Inquiry' });
    }, 4000);
  };

  const availablePlotsCount = plots.filter((p) => p.status === 'AVAILABLE').length;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/80 backdrop-blur-lg border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                HIPPO <span className="text-amber-500">REALTY</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Plot Management & MLM Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#about" className="hover:text-amber-400 transition-colors">About Us</a>
            <a href="#services" className="hover:text-amber-400 transition-colors">Core Capabilities</a>
            <a href="#projects" className="hover:text-amber-400 transition-colors">Projects</a>
            <a href="#inventory" className="hover:text-amber-400 transition-colors">Plots Preview</a>
            <a href="#contact" className="hover:text-amber-400 transition-colors">Contact Us</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all hover:border-slate-600"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Portal Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Next-Gen Enterprise Real Estate Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Transparent Plot Sales & <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                  Automated MLM Network Engine
                </span>
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Hippo Realty combines interactive blueprint site maps, automated spreadsheet-reconciled plot pricing, and differential MLM commission structures into one unified, production-grade management system.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-3 px-7 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <span>Access Agent Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#projects"
                  className="flex items-center gap-2 px-7 py-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-base border border-slate-700 transition-all"
                >
                  <span>Explore Projects</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-white">500+</h4>
                  <p className="text-xs text-slate-400 font-medium">Plots Managed</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-amber-400">₹50Cr+</h4>
                  <p className="text-xs text-slate-400 font-medium">Sales Processed</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-white">7-Tier</h4>
                  <p className="text-xs text-slate-400 font-medium">MLM Matrix Engine</p>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live System Status</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Engine Online
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Interactive Naksa Blueprint</h4>
                        <p className="text-xs text-slate-400">AI OCR Vector Parser & Overlay</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Differential Commission Engine</h4>
                        <p className="text-xs text-slate-400">Ascending Sponsor Tree Distribution</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Spreadsheet Pricing Reconciliation</h4>
                        <p className="text-xs text-slate-400">PLC + OTMC + 18% GST Calculations</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-400">
                    Trusted by real estate developers, directors, and sales networks across India.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section id="about" className="py-20 border-b border-slate-800/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold text-amber-400 tracking-widest uppercase">About Hippo Realty</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Built Specifically for Real Estate Developers & Agent Networks
            </h3>
            <p className="text-slate-300 text-base leading-relaxed">
              We eliminate spreadsheets, uncoordinated agent structures, and delayed commission processing. Hippo Realty bridges physical site inventory with automated multi-tier sales trees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Complete Plot Lifecycle</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track plots from initial layout import (`AVAILABLE`), through customer reservation (`BOOKED`), registry (`PENDING`), to completed registry (`SOLD`).
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Multi-Tier MLM Matrix</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                7 distinct qualification ranks ranging from Business Executive (5%) to Director Sales (20%). Automatic promotion evaluation upon sales milestone completion.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">AI Naksa OCR Parser</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload architectural blueprint maps (PDF/PNG). Google Gemini Vision extracts vector boundary polygons and plot details with human-in-the-loop validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Projects Showcase */}
      <section id="projects" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold text-amber-400 tracking-widest uppercase">Featured Developments</h2>
              <h3 className="text-3xl font-extrabold text-white mt-1">Premier Real Estate Projects</h3>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View Full Inventory in Portal</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {projects.length > 0 ? (
              projects.slice(0, 3).map((proj) => (
                <div key={proj._id} className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase">
                        {proj.code}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{proj.location}</span>
                    </div>
                    <h4 className="text-xl font-extrabold text-white">{proj.name}</h4>
                    <div className="space-y-2 pt-2 border-t border-slate-800/80 text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Area:</span>
                        <span className="text-slate-200 font-semibold">{proj.totalAreaSqft.toLocaleString()} sqft</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Base Rate:</span>
                        <span className="text-amber-400 font-semibold">₹{proj.basePricePerSqft}/sqft</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors"
                    >
                      View Layout & Plots
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Default Fallback Cards if API data not yet loaded
              <>
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">HIPPO-INFRA</span>
                  <h4 className="text-xl font-bold text-white">Hippo Infra Phase 1</h4>
                  <p className="text-sm text-slate-400">Prime residential plotted colony with 12m & 9m main road access.</p>
                  <p className="text-amber-400 font-semibold text-sm">Base Rate: ₹6,500 / sq-yd</p>
                </div>
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">RAMLOK-TOWN</span>
                  <h4 className="text-xl font-bold text-white">Ramlok Township</h4>
                  <p className="text-sm text-slate-400">Integrated gated township featuring corner and park-facing premium plots.</p>
                  <p className="text-amber-400 font-semibold text-sm">Base Rate: ₹5,800 / sq-yd</p>
                </div>
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold">ENCLAVE-VILA</span>
                  <h4 className="text-xl font-bold text-white">Hippo Enclave</h4>
                  <p className="text-sm text-slate-400">Luxury villa plot development with OTMC amenities included.</p>
                  <p className="text-amber-400 font-semibold text-sm">Base Rate: ₹7,200 / sq-yd</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 5. Inventory Preview */}
      <section id="inventory" className="py-20 border-b border-slate-800/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-xs font-bold text-amber-400 tracking-widest uppercase">Real-Time Inventory Status</h2>
              <h3 className="text-3xl font-extrabold text-white">Color-Coded Canvas Plot Inventory</h3>
              <p className="text-slate-300 leading-relaxed">
                Agents and admins can inspect live plot availability, view valuation breakdowns (PLC, OTMC, 18% GST), check owner details, and record customer payments in real time.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#22C55E]" />
                  <div>
                    <h5 className="text-sm font-bold text-white">AVAILABLE</h5>
                    <p className="text-xs text-slate-400">Ready for booking</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#3B82F6]" />
                  <div>
                    <h5 className="text-sm font-bold text-white">BOOKED</h5>
                    <p className="text-xs text-slate-400">Token received</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#FACC15]" />
                  <div>
                    <h5 className="text-sm font-bold text-white">PENDING</h5>
                    <p className="text-xs text-slate-400">Registry in process</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#EF4444]" />
                  <div>
                    <h5 className="text-sm font-bold text-white">SOLD</h5>
                    <p className="text-xs text-slate-400">Registry complete</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors"
                >
                  Log In to View Map Canvas
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-sm font-bold text-white">Sample Plot Ledger (E5 Block)</span>
                  <span className="text-xs text-slate-400">Reconciled with Client Spreadsheets</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">Plot E5-83</span>
                      <span className="block text-[10px] text-slate-400">Sellable: 201.28 sq-yd | OTMC: ₹250</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">₹13,67,510</span>
                      <span className="block text-[10px] text-slate-400">AVAILABLE</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">Plot E5-80</span>
                      <span className="block text-[10px] text-slate-400">Sellable: 188.82 sq-yd | PLC: Corner+9m</span>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 font-bold">₹14,49,926</span>
                      <span className="block text-[10px] text-slate-400">SOLD</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">Plot E5-86</span>
                      <span className="block text-[10px] text-slate-400">Sellable: 201.28 sq-yd | PLC: Corner+Park</span>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-400 font-bold">₹14,86,266</span>
                      <span className="block text-[10px] text-slate-400">AVAILABLE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Section */}
      <section id="contact" className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-bold text-amber-400 tracking-widest uppercase">Get in Touch</h2>
              <h3 className="text-3xl font-extrabold text-white">Contact Hippo Realty Sales</h3>
              <p className="text-slate-300 leading-relaxed">
                Interested in developer onboarding, sales agent registration, or site plot inquiries? Reach out to our team directly.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Direct Sales Line</p>
                    <p className="text-sm font-bold text-white">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email Inquiry</p>
                    <p className="text-sm font-bold text-white">ankit@hippo.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Corporate HQ</p>
                    <p className="text-sm font-bold text-white">Hippo RealEstate Tower, Cyber City, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                <h4 className="text-xl font-bold text-white mb-6">Send Us a Direct Message</h4>

                {formSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h5 className="text-lg font-bold text-white">Message Received!</h5>
                    <p className="text-sm text-slate-300">Thank you for contacting Hippo Realty. Our sales executive will get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Ankit Kumar"
                          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="ankit@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Purpose</label>
                      <select
                        value={contactForm.interest}
                        onChange={(e) => setContactForm({ ...contactForm, interest: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="General Inquiry">Plot Booking Inquiry</option>
                        <option value="Agent Registration">Agent Network Registration</option>
                        <option value="Developer Partnership">Project Developer Partnership</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                      <textarea
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Specify plot number or project details..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm transition-all"
                    >
                      Submit Inquiry
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 bg-[#080B11] border-t border-slate-800/80 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-sm">HIPPO REALTY PLATFORM</span>
          </div>

          <p>© {new Date().getFullYear()} Hippo RealEstate CRM & Plot Management System. All rights reserved.</p>

          <div className="flex gap-6">
            <Link to="/login" className="hover:text-white transition-colors">Agent Portal</Link>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Widget */}
      <WhatsAppButton />
    </div>
  );
};

export default LandingPage;
