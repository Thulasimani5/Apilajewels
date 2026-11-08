import React, { useState, useMemo } from 'react';
import { 
  TrendingUp,
  Package, 
  TrendingDown, 
  Calendar, 
  BarChart2, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  ChevronDown,
  Layers
} from 'lucide-react';

/**
 * MonthlyBookingAnalytics
 * ─────────────────────────────────────────────────────────────
 * High-performance, rich interactive analytics component for
 * tracking monthly booking volume, revenue amounts, and trends.
 */
export default function MonthlyBookingAnalytics({ 
  bookings = [], 
  onViewAllBookings,
  className = '' 
}) {
  const [timeRange, setTimeRange] = useState('12M'); // '6M' | '12M' | '2026' | 'ALL'
  const [metricView, setMetricView] = useState('dual'); // 'dual' | 'amount' | 'count'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'confirmed' | 'pending'
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState(null);
  const [showTable, setShowTable] = useState(false);

  // Month names helper
  const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const FULL_MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 1. Process and aggregate monthly data based on selected filters
  const { monthlyData, kpis } = useMemo(() => {
    // Current date reference
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();

    // Determine months to include
    let monthsToInclude = [];

    if (timeRange === '6M') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonthIndex - i, 1);
        monthsToInclude.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`,
          fullLabel: `${FULL_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
        });
      }
    } else if (timeRange === '12M') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(currentYear, currentMonthIndex - i, 1);
        monthsToInclude.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`,
          fullLabel: `${FULL_MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
        });
      }
    } else if (timeRange === '2026') {
      for (let m = 0; m < 12; m++) {
        monthsToInclude.push({
          year: 2026,
          month: m,
          key: `2026-${String(m + 1).padStart(2, '0')}`,
          label: MONTH_NAMES[m],
          fullLabel: `${FULL_MONTH_NAMES[m]} 2026`
        });
      }
    } else {
      // ALL: Discover min and max month from actual booking dates
      let minDate = new Date();
      let maxDate = new Date();
      if (bookings.length > 0) {
        bookings.forEach(b => {
          const raw = b.bookingDate || b.createdAt;
          if (raw) {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) {
              if (d < minDate) minDate = d;
              if (d > maxDate) maxDate = d;
            }
          }
        });
      }
      let curr = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 1);
      while (curr < end) {
        monthsToInclude.push({
          year: curr.getFullYear(),
          month: curr.getMonth(),
          key: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`,
          label: `${MONTH_NAMES[curr.getMonth()]} '${String(curr.getFullYear()).slice(-2)}`,
          fullLabel: `${FULL_MONTH_NAMES[curr.getMonth()]} ${curr.getFullYear()}`
        });
        curr.setMonth(curr.getMonth() + 1);
      }
      if (monthsToInclude.length === 0) {
        monthsToInclude.push({
          year: currentYear,
          month: currentMonthIndex,
          key: `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`,
          label: `${MONTH_NAMES[currentMonthIndex]} '${String(currentYear).slice(-2)}`,
          fullLabel: `${FULL_MONTH_NAMES[currentMonthIndex]} ${currentYear}`
        });
      }
    }

    // Map buckets
    const bucketMap = {};
    monthsToInclude.forEach(m => {
      bucketMap[m.key] = {
        ...m,
        count: 0,
        amount: 0,
        advance: 0,
        pendingCount: 0,
        confirmedCount: 0,
        completedCount: 0,
        otherCount: 0,
        bookingsList: []
      };
    });

    // Populate data
    bookings.forEach(b => {
      const rawDate = b.bookingDate || b.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!bucketMap[key]) return; // Outside selected range

      const st = (b.status || 'pending').toLowerCase();
      // Apply status filter
      if (statusFilter === 'confirmed' && !['confirmed', 'approved', 'inevent', 'completed'].includes(st)) return;
      if (statusFilter === 'pending' && st !== 'pending') return;
      if (st === 'rejected') return; // Ignore rejected in revenue/counts

      const totalAmt = Number(b.totalAmount || 0);
      const advAmt = Number(b.advancePaid || 0);

      const bucket = bucketMap[key];
      bucket.count += 1;
      bucket.amount += totalAmt;
      bucket.advance += advAmt;
      bucket.bookingsList.push(b);

      if (st === 'pending') bucket.pendingCount += 1;
      else if (['confirmed', 'approved', 'inevent'].includes(st)) bucket.confirmedCount += 1;
      else if (st === 'completed') bucket.completedCount += 1;
      else bucket.otherCount += 1;
    });

    const series = monthsToInclude.map(m => {
      const b = bucketMap[m.key];
      const avgValue = b.count > 0 ? Math.round(b.amount / b.count) : 0;
      return {
        ...b,
        avgValue
      };
    });

    // KPIs calculation
    const totalCount = series.reduce((sum, s) => sum + s.count, 0);
    const totalAmount = series.reduce((sum, s) => sum + s.amount, 0);
    const avgBookingValue = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
    
    // Find peak month
    let maxAmountMonth = series[0] || null;
    let maxCountMonth = series[0] || null;
    series.forEach(s => {
      if (!maxAmountMonth || s.amount > maxAmountMonth.amount) maxAmountMonth = s;
      if (!maxCountMonth || s.count > maxCountMonth.count) maxCountMonth = s;
    });

    // MoM comparison for latest month vs previous month
    const lastIdx = series.length - 1;
    const latestMonth = series[lastIdx] || { count: 0, amount: 0 };
    const prevMonth = series[lastIdx - 1] || { count: 0, amount: 0 };

    const countGrowth = prevMonth.count > 0 
      ? Math.round(((latestMonth.count - prevMonth.count) / prevMonth.count) * 100)
      : (latestMonth.count > 0 ? 100 : 0);

    const amountGrowth = prevMonth.amount > 0 
      ? Math.round(((latestMonth.amount - prevMonth.amount) / prevMonth.amount) * 100)
      : (latestMonth.amount > 0 ? 100 : 0);

    return {
      monthlyData: series,
      kpis: {
        totalCount,
        totalAmount,
        avgBookingValue,
        maxAmountMonth,
        maxCountMonth,
        latestMonth,
        prevMonth,
        countGrowth,
        amountGrowth
      }
    };
  }, [bookings, timeRange, statusFilter]);

  // Selected or hovered active month
  const activeMonth = useMemo(() => {
    if (hoveredMonthIndex !== null && monthlyData[hoveredMonthIndex]) {
      return monthlyData[hoveredMonthIndex];
    }
    if (selectedMonthKey) {
      return monthlyData.find(m => m.key === selectedMonthKey) || monthlyData[monthlyData.length - 1];
    }
    return monthlyData[monthlyData.length - 1] || null;
  }, [hoveredMonthIndex, selectedMonthKey, monthlyData]);

  // 2. Chart geometry calculations
  const chartHeight = 240;
  const chartWidth = 720;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 28;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxAmount = useMemo(() => {
    const maxVal = Math.max(...monthlyData.map(m => m.amount), 1000);
    // Round up to clean ceiling
    if (maxVal <= 5000) return 5000;
    if (maxVal <= 10000) return 10000;
    if (maxVal <= 25000) return 25000;
    if (maxVal <= 50000) return 50000;
    if (maxVal <= 100000) return 100000;
    return Math.ceil(maxVal / 50000) * 50000;
  }, [monthlyData]);

  const maxCount = useMemo(() => {
    const maxVal = Math.max(...monthlyData.map(m => m.count), 5);
    return Math.ceil(maxVal * 1.25);
  }, [monthlyData]);

  // Coordinates for points
  const points = useMemo(() => {
    if (monthlyData.length === 0) return [];
    const step = monthlyData.length > 1 ? innerWidth / (monthlyData.length - 1) : innerWidth;

    return monthlyData.map((m, i) => {
      const x = paddingLeft + (monthlyData.length > 1 ? i * step : innerWidth / 2);
      const yAmount = paddingTop + innerHeight - (m.amount / maxAmount) * innerHeight;
      const yCount = paddingTop + innerHeight - (m.count / maxCount) * innerHeight;
      const barHeight = (m.count / maxCount) * innerHeight;
      return {
        ...m,
        index: i,
        x,
        yAmount,
        yCount,
        barHeight
      };
    });
  }, [monthlyData, innerWidth, innerHeight, maxAmount, maxCount]);

  // Smooth Catmull-Rom cubic bezier curve for Amount
  const bezierPath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].yAmount}`;

    let path = `M ${points[0].x} ${points[0].yAmount}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.yAmount + (p2.yAmount - p0.yAmount) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.yAmount - (p3.yAmount - p1.yAmount) / 6;
      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.yAmount.toFixed(1)}`;
    }
    return path;
  }, [points]);

  // Gradient area path (closed curve to baseline)
  const areaPath = useMemo(() => {
    if (!bezierPath || points.length === 0) return '';
    const baselineY = paddingTop + innerHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${bezierPath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  }, [bezierPath, points]);

  // Format currency
  const formatINR = (val) => {
    if (val == null) return '₹0';
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  const formatShortINR = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
    return `₹${val}`;
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      
      {/* ── TOP HEADER & CONTROLS ── */}
      <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-white via-rose-50/20 to-amber-50/20">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] text-[#B07A85] flex items-center justify-center font-bold shadow-xs">
              <BarChart2 size={19} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Monthly Booking Analytics
                <span className="text-[10px] font-semibold bg-[#FFF0F3] text-[#B07A85] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Insights
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Track monthly booking volume, revenue flow, and seasonal booking trends
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed / Completed</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>

          {/* Metric View Tabs */}
          <div className="bg-gray-100/90 p-0.5 rounded-lg flex items-center text-xs font-semibold">
            <button
              onClick={() => setMetricView('dual')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricView === 'dual' 
                  ? 'bg-white text-gray-900 shadow-xs' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setMetricView('amount')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricView === 'amount' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setMetricView('count')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricView === 'count' 
                  ? 'bg-white text-[#B07A85] shadow-xs' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Bookings
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="bg-gray-100/90 p-0.5 rounded-lg flex items-center text-xs font-semibold">
            {['6M', '12M', '2026', 'ALL'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeRange === r 
                    ? 'bg-[#B07A85] text-white shadow-xs font-bold' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PERFORMANCE HIGHLIGHT CARDS (MoM) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-5 sm:p-6 bg-gray-50/40 border-b border-gray-100">
        
        {/* Card 1: Total Revenue in Range */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
            {formatINR(kpis.totalAmount)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
            {kpis.amountGrowth >= 0 ? (
              <span className="text-emerald-600 font-bold flex items-center">
                <ArrowUpRight size={13} /> {kpis.amountGrowth}%
              </span>
            ) : (
              <span className="text-rose-500 font-bold flex items-center">
                <ArrowDownRight size={13} /> {Math.abs(kpis.amountGrowth)}%
              </span>
            )}
            <span className="text-gray-400">vs prev month</span>
          </div>
        </div>

        {/* Card 2: Total Bookings Count */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#B07A85] flex items-center justify-center font-bold text-xs">
              <Calendar size={13} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
            {kpis.totalCount} <span className="text-xs font-normal text-gray-400">orders</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
            {kpis.countGrowth >= 0 ? (
              <span className="text-emerald-600 font-bold flex items-center">
                <ArrowUpRight size={13} /> {kpis.countGrowth}%
              </span>
            ) : (
              <span className="text-rose-500 font-bold flex items-center">
                <ArrowDownRight size={13} /> {Math.abs(kpis.countGrowth)}%
              </span>
            )}
            <span className="text-gray-400">MoM count</span>
          </div>
        </div>

        {/* Card 3: Average Booking Value */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Avg Order Value</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <TrendingUp size={13} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">
            {formatINR(kpis.avgBookingValue)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500">
            <span>Per booking average</span>
          </div>
        </div>

        {/* Card 4: Best Performing Month */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Peak Month</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              <Sparkles size={13} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-gray-900 mt-2 truncate">
            {kpis.maxAmountMonth ? kpis.maxAmountMonth.label : 'N/A'}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-600 font-semibold">
            {kpis.maxAmountMonth ? formatINR(kpis.maxAmountMonth.amount) : '₹0'} ({kpis.maxAmountMonth?.count || 0} orders)
          </div>
        </div>

      </div>

      {/* ── GRAPH VISUALIZATION CANVAS ── */}
      <div className="p-5 sm:p-6">
        
        {/* ── HIGHLIGHTED INSPECTOR BANNER (Bookings, Revenue & Avg) ── */}
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-50/60 via-white to-emerald-50/60 border-2 border-[#B07A85]/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Active Month Focus */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#B07A85] border border-rose-200/70 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                  {activeMonth ? activeMonth.fullLabel : 'Select Month'}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#B07A85] animate-ping" />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {hoveredMonthIndex !== null ? 'Hovered Month Details' : 'Active Month Focus'}
              </p>
            </div>
          </div>

          {/* Prominent Highlighted Badges: Bookings | Revenue | Avg */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            
            {/* Highlighted Badge 1: Bookings */}
            <div className="flex-1 sm:flex-none flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-br from-[#FFF0F3] to-rose-100/70 border-2 border-rose-300 rounded-xl shadow-xs ring-2 ring-rose-50">
              <div className="w-7 h-7 rounded-lg bg-white text-[#B07A85] flex items-center justify-center font-bold text-xs shadow-2xs">
                <Package size={14} />
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-rose-700 uppercase tracking-wider block leading-tight">
                  Bookings
                </span>
                <span className="text-base sm:text-lg font-black text-[#8D5B66] leading-none">
                  {activeMonth?.count || 0}
                  <span className="text-[10.5px] font-semibold text-rose-600/80 ml-1">orders</span>
                </span>
              </div>
            </div>

            {/* Highlighted Badge 2: Revenue */}
            <div className="flex-1 sm:flex-none flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-2 border-emerald-300 rounded-xl shadow-xs ring-2 ring-emerald-50">
              <div className="w-7 h-7 rounded-lg bg-white text-emerald-700 flex items-center justify-center font-black text-xs shadow-2xs">
                ₹
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-emerald-700 uppercase tracking-wider block leading-tight">
                  Revenue
                </span>
                <span className="text-base sm:text-lg font-black text-emerald-800 leading-none">
                  {formatINR(activeMonth?.amount || 0)}
                </span>
              </div>
            </div>

            {/* Highlighted Badge 3: Average Booking Value */}
            <div className="flex-1 sm:flex-none flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-br from-blue-50 to-indigo-100/70 border-2 border-blue-300 rounded-xl shadow-xs ring-2 ring-blue-50">
              <div className="w-7 h-7 rounded-lg bg-white text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                <TrendingUp size={14} />
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-blue-700 uppercase tracking-wider block leading-tight">
                  Avg Value
                </span>
                <span className="text-base sm:text-lg font-black text-blue-900 leading-none">
                  {formatINR(activeMonth?.avgValue || 0)}
                </span>
              </div>
            </div>

          </div>

          {/* Graph Legend */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] bg-white px-3 py-1.5 rounded-lg border border-gray-200/70 shadow-2xs">
            {(metricView === 'dual' || metricView === 'amount') && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-sm bg-gradient-to-r from-[#B07A85] to-emerald-600 inline-block" />
                <span className="text-gray-600 font-medium">Revenue</span>
              </div>
            )}
            {(metricView === 'dual' || metricView === 'count') && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#B07A85] inline-block" />
                <span className="text-gray-600 font-medium">Count</span>
              </div>
            )}
          </div>

        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[620px] relative select-none">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible"
              preserveAspectRatio="none"
              style={{ minHeight: '220px', maxHeight: '300px' }}
            >
              <defs>
                {/* Revenue Gradient */}
                <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B07A85" stopOpacity="0.32" />
                  <stop offset="45%" stopColor="#10B981" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
                </linearGradient>

                {/* Bar Gradient */}
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B07A85" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#8D5B66" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#B45309" stopOpacity="0.75" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = paddingTop + innerHeight - pct * innerHeight;
                const valueLabel = formatShortINR(pct * maxAmount);
                const countLabel = Math.round(pct * maxCount);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeDasharray={pct === 0 ? 'none' : '3 3'}
                      strokeWidth={pct === 0 ? '1.5' : '1'}
                    />
                    {/* Left Axis: Revenue */}
                    {(metricView === 'dual' || metricView === 'amount') && (
                      <text
                        x={paddingLeft - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize="9.5"
                        fill="#9CA3AF"
                        fontWeight="500"
                        fontFamily="inherit"
                      >
                        {valueLabel}
                      </text>
                    )}
                    {/* Right Axis: Count */}
                    {(metricView === 'dual' || metricView === 'count') && (
                      <text
                        x={chartWidth - paddingRight + 8}
                        y={y + 3.5}
                        textAnchor="start"
                        fontSize="9.5"
                        fill="#9CA3AF"
                        fontWeight="500"
                        fontFamily="inherit"
                      >
                        {countLabel}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* ── BARS FOR COUNT (Rendered in 'dual' and 'count' mode) ── */}
              {(metricView === 'dual' || metricView === 'count') && (
                <g>
                  {points.map((p, i) => {
                    const isHovered = hoveredMonthIndex === i;
                    const isSelected = selectedMonthKey === p.key;
                    const barWidth = Math.max(12, Math.min(28, (innerWidth / points.length) * 0.45));
                    const x = p.x - barWidth / 2;
                    const y = paddingTop + innerHeight - p.barHeight;

                    return (
                      <g 
                        key={p.key} 
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredMonthIndex(i)}
                        onMouseLeave={() => setHoveredMonthIndex(null)}
                        onClick={() => setSelectedMonthKey(selectedMonthKey === p.key ? null : p.key)}
                      >
                        {/* Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(p.barHeight, p.count > 0 ? 4 : 0)}
                          rx="4"
                          fill={isHovered || isSelected ? 'url(#barGradActive)' : 'url(#barGrad)'}
                          opacity={isHovered || isSelected ? 1 : 0.85}
                          className="transition-all duration-200"
                        />
                        {/* Count pill above bar */}
                        {p.count > 0 && (
                          <text
                            x={p.x}
                            y={Math.max(paddingTop + 10, y - 5)}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="700"
                            fill={isHovered || isSelected ? '#D97706' : '#6B7280'}
                          >
                            {p.count}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ── AREA AND CURVE FOR AMOUNT (Rendered in 'dual' and 'amount' mode) ── */}
              {(metricView === 'dual' || metricView === 'amount') && (
                <g>
                  {/* Gradient Area Fill */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#revenueAreaGrad)"
                      className="transition-all duration-300 pointer-events-none"
                    />
                  )}

                  {/* Smooth Bezier Line */}
                  {bezierPath && (
                    <path
                      d={bezierPath}
                      fill="none"
                      stroke="#B07A85"
                      strokeWidth={metricView === 'amount' ? '3' : '2.5'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300 pointer-events-none"
                    />
                  )}

                  {/* Data Dots on Curve */}
                  {points.map((p, i) => {
                    const isHovered = hoveredMonthIndex === i;
                    const isSelected = selectedMonthKey === p.key;
                    return (
                      <g 
                        key={`dot-${p.key}`} 
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonthIndex(i)}
                        onMouseLeave={() => setHoveredMonthIndex(null)}
                        onClick={() => setSelectedMonthKey(selectedMonthKey === p.key ? null : p.key)}
                      >
                        {/* Pulsing ring on hover/selected */}
                        {(isHovered || isSelected) && (
                          <circle
                            cx={p.x}
                            cy={p.yAmount}
                            r="9"
                            fill="#B07A85"
                            opacity="0.25"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          cx={p.x}
                          cy={p.yAmount}
                          r={isHovered || isSelected ? '5.5' : '3.5'}
                          fill={isHovered || isSelected ? '#10B981' : '#ffffff'}
                          stroke="#B07A85"
                          strokeWidth="2.5"
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ── HOVER CROSSHAIR & INTERACTIVE COLUMN HITBOX ── */}
              {points.map((p, i) => {
                const colWidth = innerWidth / points.length;
                const isHovered = hoveredMonthIndex === i;
                const isSelected = selectedMonthKey === p.key;

                return (
                  <g key={`hitbox-${p.key}`}>
                    {/* Transparent hover detection rectangle */}
                    <rect
                      x={p.x - colWidth / 2}
                      y={paddingTop}
                      width={colWidth}
                      height={innerHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIndex(i)}
                      onMouseLeave={() => setHoveredMonthIndex(null)}
                      onClick={() => setSelectedMonthKey(selectedMonthKey === p.key ? null : p.key)}
                    />

                    {/* Vertical dashed guideline on hover */}
                    {(isHovered || isSelected) && (
                      <line
                        x1={p.x}
                        y1={paddingTop}
                        x2={p.x}
                        y2={paddingTop + innerHeight}
                        stroke="#B07A85"
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                        opacity="0.8"
                        className="pointer-events-none"
                      />
                    )}

                    {/* X-Axis Month Label */}
                    <text
                      x={p.x}
                      y={chartHeight - 14}
                      textAnchor="middle"
                      fontSize={isHovered || isSelected ? '11' : '10'}
                      fontWeight={isHovered || isSelected ? '700' : '500'}
                      fill={isHovered || isSelected ? '#B07A85' : '#6B7280'}
                      className="pointer-events-none transition-colors"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Floating Tooltip Summary when month is active */}
        {activeMonth && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50/40 via-white to-amber-50/30 border-2 border-rose-200/70 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B07A85] to-[#8D5B66] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {activeMonth.label.slice(0, 3)}
              </div>
              <div>
                <div className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  {activeMonth.fullLabel}
                  {selectedMonthKey === activeMonth.key && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Selected Month
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span>Advance Collected: <strong className="text-gray-800 font-semibold">{formatINR(activeMonth.advance)}</strong></span>
                  <span>•</span>
                  <span>Completed: <strong className="text-emerald-700 font-semibold">{activeMonth.completedCount}</strong></span>
                  <span>•</span>
                  <span>Pending: <strong className="text-blue-700 font-semibold">{activeMonth.pendingCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Prominent Highlighted Pills */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="px-3.5 py-2 rounded-xl bg-white border-2 border-rose-300 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B07A85]"></span>
                <div>
                  <span className="text-[9px] uppercase font-bold text-rose-500 block leading-tight">Bookings</span>
                  <span className="text-base font-black text-[#B07A85] leading-none">{activeMonth.count} <span className="text-[10px] font-normal text-gray-400">orders</span></span>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white border-2 border-emerald-300 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <div>
                  <span className="text-[9px] uppercase font-bold text-emerald-600 block leading-tight">Revenue</span>
                  <span className="text-base font-black text-emerald-700 leading-none">{formatINR(activeMonth.amount)}</span>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white border-2 border-blue-300 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <div>
                  <span className="text-[9px] uppercase font-bold text-blue-600 block leading-tight">Avg Value</span>
                  <span className="text-base font-black text-blue-700 leading-none">{formatINR(activeMonth.avgValue)}</span>
                </div>
              </div>

              {onViewAllBookings && (
                <button
                  onClick={onViewAllBookings}
                  className="inline-flex items-center gap-1.5 bg-[#B07A85] hover:bg-[#9E6A75] text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm ml-auto sm:ml-2"
                >
                  <Eye size={13} /> View Bookings
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ── MONTHLY BREAKDOWN DRAWER / TABLE TOGGLE ── */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full px-6 py-3 flex items-center justify-between text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers size={14} className="text-[#B07A85]" />
            Detailed Monthly Performance Breakdown ({monthlyData.length} Months)
          </span>
          <span className="flex items-center gap-1 text-[#B07A85]">
            {showTable ? 'Hide Table' : 'Show Table'}
            <ChevronDown size={14} className={`transform transition-transform ${showTable ? 'rotate-180' : ''}`} />
          </span>
        </button>

        {showTable && (
          <div className="px-5 sm:px-6 pb-6 pt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Bookings</th>
                  <th className="py-2.5 px-3">Volume Share</th>
                  <th className="py-2.5 px-3">Gross Revenue</th>
                  <th className="py-2.5 px-3">Avg Order Value</th>
                  <th className="py-2.5 px-3">Status Mix</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {monthlyData.slice().reverse().map((m) => {
                  const sharePct = kpis.totalCount > 0 
                    ? Math.round((m.count / kpis.totalCount) * 100) 
                    : 0;
                  const isCurrent = selectedMonthKey === m.key;

                  return (
                    <tr 
                      key={m.key} 
                      className={`hover:bg-white transition-colors cursor-pointer ${isCurrent ? 'bg-amber-50/40 font-bold' : ''}`}
                      onClick={() => setSelectedMonthKey(m.key === selectedMonthKey ? null : m.key)}
                    >
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        {m.fullLabel}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          {m.count}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#B07A85] h-full rounded-full" 
                              style={{ width: `${sharePct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-500">{sharePct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        {formatINR(m.amount)}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {formatINR(m.avgValue)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {m.confirmedCount > 0 && (
                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                              {m.confirmedCount} conf
                            </span>
                          )}
                          {m.pendingCount > 0 && (
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                              {m.pendingCount} pend
                            </span>
                          )}
                          {m.count === 0 && (
                            <span className="text-gray-400 italic">No bookings</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMonthKey(m.key);
                            if (onViewAllBookings) onViewAllBookings();
                          }}
                          className="text-[#B07A85] font-bold hover:underline text-[11px]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

