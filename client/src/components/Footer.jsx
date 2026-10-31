import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E5EAE5] bg-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/" className="inline-block py-1">
              <img
                src="/logo.png"
                alt="Hezal Market"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-[#647067] max-w-sm leading-relaxed">
              A location-based community platform connecting local roadside stalls, street food vendors, and small artisans with nearby shoppers.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#647067] pt-1">
              <MapPin className="h-3.5 w-3.5 text-[#16803D]" />
              <span>Direct Hyperlocal Market Discovery Across Gujarat</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#17231D] block">
              Market Discovery
            </span>
            <ul className="space-y-1.5 text-xs text-[#647067]">
              <li>
                <Link to="/explore" className="hover:text-[#16803D] transition-colors">
                  Explore Stalls
                </Link>
              </li>
              <li>
                <Link to="/explore?category=street-food-chaat" className="hover:text-[#16803D] transition-colors">
                  Street Food & Chaat
                </Link>
              </li>
              <li>
                <Link to="/explore?category=fruits-vegetables" className="hover:text-[#16803D] transition-colors">
                  Fruits & Vegetables
                </Link>
              </li>
              <li>
                <Link to="/explore?category=beverages-chai" className="hover:text-[#16803D] transition-colors">
                  Beverages & Chai
                </Link>
              </li>
              <li>
                <Link to="/explore?category=bakery-sweets" className="hover:text-[#16803D] transition-colors">
                  Bakery & Sweets
                </Link>
              </li>
              <li>
                <Link to="/explore?category=fast-food-meals" className="hover:text-[#16803D] transition-colors">
                  Fast Food & Meals
                </Link>
              </li>
            </ul>
          </div>

          {/* For Street Vendors & Sellers */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#17231D] block">
              Vendor Community
            </span>
            <ul className="space-y-1.5 text-xs text-[#647067]">
              <li>
                <Link to="/register/vendor" className="text-[#16803D] hover:underline font-semibold transition-colors">
                  Register Your Stall
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#16803D] transition-colors">
                  Vendor Sign In
                </Link>
              </li>
              <li>
                <Link to="/register/customer" className="hover:text-[#16803D] transition-colors">
                  Customer Sign Up
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-[#16803D] transition-colors">
                  Browse Verified Stalls
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E5EAE5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#647067] gap-3">
          <p>© 2026 Hezal Market. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#647067]">
            <span>Zero Platform Commissions • 100% Direct Vendor Discovery</span>
            <span className="text-[#E5EAE5]">|</span>
            <Link to="/admin/login" className="hover:text-[#17231D] text-[#647067] flex items-center space-x-1 transition-colors">
              <Shield className="h-3 w-3 text-slate-400" />
              <span>Staff Console</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
