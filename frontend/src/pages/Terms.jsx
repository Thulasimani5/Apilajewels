import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Package, Gem, Clock, Droplets, Phone, Sparkles, ShieldCheck, Heart } from 'lucide-react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FAF8F5] min-h-screen flex flex-col font-sans text-gray-800">
      <Navbar />

      <main className="flex-1 mt-[64px] md:mt-[60px] pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        
        {/* Header Hero */}
        <div className="text-center pt-10 pb-8 border-b border-amber-950/10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B07A85]/10 text-[#B07A85] text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Apila Jewels – Jewellery Rental
          </div>
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 font-bold tracking-tight mb-3"
            style={{ fontFamily: "'Bacasime Antique', serif, 'Playfair Display'" }}
          >
            Terms & Conditions Policy
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto font-light leading-relaxed">
            Please read our rental agreement, care guidelines, and returns policy carefully before booking your jewellery.
          </p>
        </div>

        {/* Policy Cards Grid */}
        <div className="mt-10 space-y-6">

          {/* 1. Booking & Payment */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-900/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#B07A85] flex items-center justify-center font-bold flex-shrink-0">
                <Calendar size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
                📌 Booking & Payment
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-gray-700 font-normal leading-relaxed pl-2 sm:pl-4">
              <li className="flex items-start gap-2.5">
                <span className="text-[#B07A85] font-bold mt-1">•</span>
                <span>Booking is confirmed after <strong className="font-semibold text-gray-900">full rental payment + security deposit</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#B07A85] font-bold mt-1">•</span>
                <span><strong className="font-semibold text-[#B07A85]">No cancellation or refund</strong> after confirmation.</span>
              </li>
            </ul>
          </div>

          {/* 2. Packing & Return */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-900/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                <Package size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
                📦 Packing & Return
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-gray-700 font-normal leading-relaxed pl-2 sm:pl-4">
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Kindly return the jewellery <strong className="font-semibold text-gray-900">in the same way it was packed when received</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Please <strong className="font-semibold text-gray-900">bubble-wrap and pack it carefully</strong> to maintain its original condition.</span>
              </li>
            </ul>
          </div>

          {/* 3. Damage / Loss */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold flex-shrink-0">
                <Gem size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
                💎 Damage / Loss
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-gray-700 font-normal leading-relaxed pl-2 sm:pl-4">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-bold mt-1">•</span>
                <span>In case of any <strong className="font-semibold text-gray-900">stone damage or loose stones, please do not attempt to repair them</strong>. Kindly inform us and return the jewellery to us.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-bold mt-1">•</span>
                <span>Any <strong className="font-semibold text-gray-900">damage, missing stones/parts, or loss</strong> will be chargeable.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-600 font-bold mt-1">•</span>
                <span>Applicable charges will be adjusted from the <strong className="font-semibold text-gray-900">security deposit</strong>.</span>
              </li>
            </ul>
          </div>

          {/* 4. Late Return */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-900/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
                <Clock size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
                ⏰ Late Return
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-gray-700 font-normal leading-relaxed pl-2 sm:pl-4">
              <li className="flex items-start gap-2.5">
                <span className="text-amber-700 font-bold mt-1">•</span>
                <span>Please return the jewellery on the <strong className="font-semibold text-gray-900">agreed date</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-700 font-bold mt-1">•</span>
                <span>Late returns may incur <strong className="font-semibold text-[#B07A85]">additional charges</strong>.</span>
              </li>
            </ul>
          </div>

          {/* 5. Care Guidelines */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                <Droplets size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
                💧 Care Instructions
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm sm:text-base text-gray-700 font-normal leading-relaxed pl-2 sm:pl-4">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span>Please keep the jewellery away from <strong className="font-semibold text-gray-900">water, perfume, makeup, sweat & chemicals</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-600 font-bold mt-1">•</span>
                <span>Handle and store the jewellery <strong className="font-semibold text-gray-900">with care</strong>.</span>
              </li>
            </ul>
          </div>

          {/* 6. Support */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                <Phone size={20} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
                📞 Support & Assistance
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed pl-2 sm:pl-4">
              For any queries or assistance, please contact us using your <strong className="font-semibold text-gray-900">booking number</strong>.
            </p>
          </div>

        </div>

        {/* Thank You Footer Box */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-[#FFF8F3] to-[#F5EBE6] text-center border border-[#B07A85]/20 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#B07A85]/10 text-[#B07A85] flex items-center justify-center mx-auto mb-3">
            <Heart size={22} className="fill-[#B07A85]" />
          </div>
          <h3 
            className="text-xl sm:text-2xl font-serif text-gray-900 font-bold tracking-tight mb-1"
            style={{ fontFamily: "'Bacasime Antique', serif" }}
          >
            Thank you for choosing Apila Jewels.
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            We are honored to be a part of your special moments.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Terms;
