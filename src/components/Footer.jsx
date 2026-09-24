import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Headphones,
  Sprout,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Send,
  Clock,
  Heart,
} from 'lucide-react';
import agriMitraLogo from '../assets/AgriMitra.png';
import toast from 'react-hot-toast';

export const Footer = () => {
  const location = useLocation();
  const [newsletterInput, setNewsletterInput] = useState('');

  // Hide on admin routes so admin panel stays full height
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterInput.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }
    toast.success('Subscribed successfully to AgriMitra Kisan updates!');
    setNewsletterInput('');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 mt-16 border-t border-slate-800">
      {/* 1. Trust Badges Strip (Responsive: 1 col mobile, 2 col tablet, 4 col desktop) */}
      <div className="border-b border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 sm:bg-transparent border sm:border-0 border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">100% Certified Inputs</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Govt.-approved quality</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 sm:bg-transparent border sm:border-0 border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Farm-to-Door Delivery</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct to your field</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 sm:bg-transparent border sm:border-0 border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Direct Sourcing</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Transparent prices, 0 markup</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/50 sm:bg-transparent border sm:border-0 border-slate-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">Dedicated Farmer Desk</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Agronomy & order support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 4-Column Section (Mobile 1 col, Tablet 2 col, Desktop 4 col) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Direct Contact */}
          <div className="space-y-4">
            <Link to="/" className="inline-block group">
              <div className="bg-white rounded-xl p-2.5 inline-block shadow-xs">
                <img
                  src={agriMitraLogo}
                  alt="AgriMitra Logo"
                  className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
                />
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Certified hybrid seeds, organic fertilizers & farm equipment, delivered fast with 100% genuine quality guarantee.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+918280691186" className="hover:text-white font-medium transition">
                  +91 82806 91186 (Toll-Free)
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:support@agrimitra.com" className="hover:text-white transition">
                  support@agrimitra.com
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>#42, 7th Main Road, BTM Layout, Bengaluru — 560029</span>
              </div>
            </div>
          </div>

          {/* Column 2: Shop Categories */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Shop Categories
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/?category=1" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Seeds & Hybrid Crops</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=2" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Fertilizers & Soil Nutrients</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=3" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Crop Protection & Bio-Pesticides</span>
                </Link>
              </li>
              <li>
                <Link to="/?category=4" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Farm Equipment & Tools</span>
                </Link>
              </li>
              <li>
                <Link to="/?search=wheat" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Certified Wheat & Paddy Seeds</span>
                </Link>
              </li>
              <li>
                <Link to="/?search=neem" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Organic Bio-Fungicides & Neem</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/orders" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Track My Orders</span>
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>My Saved Wishlist</span>
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Shopping Cart</span>
                </Link>
              </li>
              <li>
                <Link to="/addresses" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Delivery Addresses</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Farmer Account & Profile</span>
                </Link>
              </li>
              <li>
                <a href="tel:+918280691186" className="hover:text-emerald-400 transition flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Agronomy Helpline Desk</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Kisan Newsletter
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seasonal crop advisories, seed arrival alerts & subsidy updates, straight to your inbox.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2 pt-1">
              <div className="relative">
                <input
                  type="text"
                  value={newsletterInput}
                  onChange={(e) => setNewsletterInput(e.target.value)}
                  placeholder="Enter email or phone..."
                  className="w-full pl-3.5 pr-24 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <span>Subscribe</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Mon – Sat: 8:00 AM – 8:00 PM IST</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Copyright Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-white font-semibold">AgriMitra</strong>. Sowing Prosperity. Growing Trust. All rights reserved.
          </p>
          <p className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
            <span>Empowering Indian Farmers</span>
            <span>•</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            <span>Dedicated Agricultural Commerce</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
