import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, MapPin, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md pt-16 pb-12 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <img src="/tempora-logo.jpg" alt="Tempora" className="w-10 h-10 rounded-xl shadow-glow-emerald object-cover" />
              <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                TEMPORA
              </span>
            </Link>
            
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Why buy something you only need temporarily? TEMPORA connects neighbors and verified businesses
              to share premium goods with zero hassle, instant doorstep delivery, and total deposit protection.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 py-2 px-3.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 w-fit">
              <Zap className="w-3.5 h-3.5" />
              <span>Hyperlocal Operations Active in Chennai, Bengaluru & Mumbai</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/search?category=Furniture" className="hover:text-emerald-500 transition">Furniture & Decor</Link></li>
              <li><Link to="/clothing-mode" className="hover:text-emerald-500 transition">Occasion Apparel</Link></li>
              <li><Link to="/search?category=Electronics" className="hover:text-emerald-500 transition">Electronics & Displays</Link></li>
              <li><Link to="/search?category=Cameras%20%26%20Creator%20Equipment" className="hover:text-emerald-500 transition">Cinema & Optics</Link></li>
              <li><Link to="/search?category=Appliances" className="hover:text-emerald-500 transition">Home Appliances</Link></li>
              <li><Link to="/search?category=Sports%20Equipment" className="hover:text-emerald-500 transition">Sports & Outdoor</Link></li>
            </ul>
          </div>

          {/* Col 3: AI Experiences */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              AI Experiences
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/setup-builder" className="hover:text-violet-500 transition flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-violet-500" /> Tell Us What You Need</Link></li>
              <li><Link to="/furniture-mode" className="hover:text-violet-500 transition">1BHK / Studio Room Builder</Link></li>
              <li><Link to="/clothing-mode" className="hover:text-violet-500 transition">AI Outfit Stylist</Link></li>
              <li><Link to="/inspect" className="hover:text-violet-500 transition">AI Item Inspection</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Platform & Trust
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/owner" className="hover:text-emerald-500 transition">Owner Earnings Portal</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-500 transition">Operations & Trust Admin</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-500 transition">Customer Dashboard</Link></li>
              <li><span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs font-medium mt-1"><ShieldCheck className="w-4 h-4" /> 100% Deposit Guarantee</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} TEMPORA Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Neon PostgreSQL Connected</span>
            <span>•</span>
            <span>Vercel Edge Ready</span>
            <span>•</span>
            <span className="flex items-center gap-1">Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for sustainability</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
