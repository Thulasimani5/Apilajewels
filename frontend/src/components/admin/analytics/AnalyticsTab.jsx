import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Package, 
  DollarSign, 
  Layers, 
  PieChart, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye,
  RefreshCw,
  Zap,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

/**
 * AnalyticsTab
 * ─────────────────────────────────────────────────────────────
 * Executive-grade Analytics Dashboard Page for Apila Jewels.
 * Features attractive glow spline & capsule graphs, booking velocity,
 * interactive donut charts for booking statuses, and MoM tracking.
 */
export default function AnalyticsTab({ 
  bookings = [], 
  onViewAllBookings,
  onRefresh
}) {
  const [timeRange, setTimeRange] = useState('12M'); // '6M' | '12M' | '2026' | 'ALL'
  const [graphChoice, setGraphChoice] = useState('glow'); // 'glow' (Spline) | 'bars' (Capsule) | 'hybrid' (Dual)
  const [metricChoice, setMetricChoice] = useState('both'); // 'both' | 'amount' | 'count'
  const [statusFilter, setStatusFilter] = useState('all');
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedIdx, setSelectedIndex] = useState(null);

  const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 1. Process Timeline Series
  const { monthlyData, kpis, statusDistribution, financialHealth } = useMemo(() => {
    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth();

    let targetMonths = [];

    if (timeRange === '6M') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currYear, currMonth - i, 1);
        targetMonths.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: `${MONTH_SHORT[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`,
          fullLabel: `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`
        });
      }
    } else if (timeRange === '12M') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(currYear, currMonth - i, 1);
        targetMonths.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: `${MONTH_SHORT[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`,
          fullLabel: `${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`
        });
      }
    } else if (timeRange === '2026') {
      for (let m = 0; m < 12; m++) {
        targetMonths.push({
          year: 2026,
          month: m,
          key: `2026-${String(m + 1).padStart(2, '0')}`,
          label: MONTH_SHORT[m],
          fullLabel: `${MONTH_FULL[m]} 2026`
        });
      }
    } else {
      // ALL
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
        targetMonths.push({
          year: curr.getFullYear(),
          month: curr.getMonth(),
          key: `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`,
          label: `${MONTH_SHORT[curr.getMonth()]} '${String(curr.getFullYear()).slice(-2)}`,
          fullLabel: `${MONTH_FULL[curr.getMonth()]} ${curr.getFullYear()}`
        });
        curr.setMonth(curr.getMonth() + 1);
      }
      if (targetMonths.length === 0) {
        targetMonths.push({
          year: currYear,
          month: currMonth,
          key: `${currYear}-${String(currMonth + 1).padStart(2, '0')}`,
          label: `${MONTH_SHORT[currMonth]} '${String(currYear).slice(-2)}`,
          fullLabel: `${MONTH_FULL[currMonth]} ${currYear}`
        });
      }
    }

    const bucket = {};
    targetMonths.forEach(m => {
      bucket[m.key] = {
        ...m,
        count: 0,
        amount: 0,
        advance: 0,
        balance: 0,
        pendingCount: 0,
        confirmedCount: 0,
        completedCount: 0,
        ineventCount: 0
      };
    });

    let overallConfirmed = 0;
    let overallCompleted = 0;
    let overallPending = 0;
    let overallInEvent = 0;
    let overallAdvance = 0;
    let overallBalance = 0;
    let overallGross = 0;

    bookings.forEach(b => {
      const rawDate = b.bookingDate || b.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;

      const st = (b.status || 'pending').toLowerCase();
      if (st === 'rejected') return;

      // Status totals
      if (st === 'pending') overallPending += 1;
      else if (['confirmed', 'approved'].includes(st)) overallConfirmed += 1;
      else if (st === 'inevent') overallInEvent += 1;
      else if (st === 'completed') overallCompleted += 1;

      const amt = Number(b.totalAmount || 0);
      const adv = Number(b.advancePaid || 0);
      const bal = Number(b.balanceAmount || (amt - adv));
      overallGross += amt;
      overallAdvance += adv;
      overallBalance += (bal > 0 ? bal : 0);

      // Monthly filter
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!bucket[key]) return;

      if (statusFilter === 'confirmed' && !['confirmed', 'approved', 'inevent', 'completed'].includes(st)) return;
      if (statusFilter === 'pending' && st !== 'pending') return;

      bucket[key].count += 1;
      bucket[key].amount += amt;
      bucket[key].advance += adv;
      bucket[key].balance += bal;

      if (st === 'pending') bucket[key].pendingCount += 1;
      else if (['confirmed', 'approved'].includes(st)) bucket[key].confirmedCount += 1;
      else if (st === 'inevent') bucket[key].ineventCount += 1;
      else if (st === 'completed') bucket[key].completedCount += 1;
    });

    const series = targetMonths.map(m => {
      const item = bucket[m.key];
      const avgValue = item.count > 0 ? Math.round(item.amount / item.count) : 0;
      return { ...item, avgValue };
    });

    // KPIs
    const totalCount = series.reduce((s, m) => s + m.count, 0);
    const totalAmount = series.reduce((s, m) => s + m.amount, 0);
    const avgBookingValue = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

    // Peak month
    let maxMonth = series[0] || null;
    series.forEach(s => {
      if (!maxMonth || s.amount > maxMonth.amount) maxMonth = s;
    });

    // MoM for latest
    const last = series[series.length - 1] || { count: 0, amount: 0 };
    const prev = series[series.length - 2] || { count: 0, amount: 0 };
    const revGrowth = prev.amount > 0 ? Math.round(((last.amount - prev.amount) / prev.amount) * 100) : (last.amount > 0 ? 100 : 0);
    const countGrowth = prev.count > 0 ? Math.round(((last.count - prev.count) / prev.count) * 100) : (last.count > 0 ? 100 : 0);

    const statusDistribution = [
      { label: 'Confirmed / Approved', count: overallConfirmed, color: '#10B981', bg: 'bg-emerald-500' },
      { label: 'Completed', count: overallCompleted, color: '#6366F1', bg: 'bg-indigo-500' },
      { label: 'In Event', count: overallInEvent, color: '#F59E0B', bg: 'bg-amber-500' },
      { label: 'Pending Inquiry', count: overallPending, color: '#3B82F6', bg: 'bg-blue-500' }
    ];

    return {
      monthlyData: series,
      kpis: {
        totalCount,
        totalAmount,
        avgBookingValue,
        maxMonth,
        last,
        prev,
        revGrowth,
        countGrowth
      },
      statusDistribution,
      financialHealth: {
        gross: overallGross,
        advance: overallAdvance,
        balance: overallBalance,
        collectionRate: overallGross > 0 ? Math.round((overallAdvance / overallGross) * 100) : 0
      }
    };
  }, [bookings, timeRange, statusFilter]);

  // Active highlighted point
  const activePoint = useMemo(() => {
    if (hoveredIdx !== null && monthlyData[hoveredIdx]) {
      return monthlyData[hoveredIdx];
    }
    if (selectedIdx !== null && monthlyData[selectedIdx]) {
      return monthlyData[selectedIdx];
    }
    const withData = [...monthlyData].reverse().find(m => m.count > 0);
    return withData || monthlyData[monthlyData.length - 1] || null;
  }, [hoveredIdx, selectedIdx, monthlyData]);

  // 2. Geometry & Scale
  const svgW = 860;
  const svgH = 400;
  const padL = 60;
  const padR = 40;
  const padT = 32;
  const padB = 44;

  const innerW = svgW - padL - padR;
  const innerH = svgH - padT - padB;

  const maxAmount = useMemo(() => {
    const raw = Math.max(...monthlyData.map(m => m.amount), 5000);
    if (raw <= 10000) return 10000;
    if (raw <= 25000) return 25000;
    if (raw <= 50000) return 50000;
    if (raw <= 100000) return 100000;
    return Math.ceil(raw / 25000) * 25000;
  }, [monthlyData]);

  const maxCount = useMemo(() => {
    const raw = Math.max(...monthlyData.map(m => m.count), 4);
    return Math.ceil(raw * 1.3);
  }, [monthlyData]);

  const points = useMemo(() => {
    if (!monthlyData.length) return [];
    const step = monthlyData.length > 1 ? innerW / (monthlyData.length - 1) : innerW;
    return monthlyData.map((m, i) => {
      const x = padL + (monthlyData.length > 1 ? i * step : innerW / 2);
      const yAmount = padT + innerH - (m.amount / maxAmount) * innerH;
      const barHeight = (m.count / maxCount) * innerH;
      const yBar = padT + innerH - barHeight;
      return {
        ...m,
        index: i,
        x,
        yAmount,
        barHeight,
        yBar
      };
    });
  }, [monthlyData, innerW, innerH, maxAmount, maxCount]);

  // Cubic Bezier curve for Spline
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

  const areaGradientPath = useMemo(() => {
    if (!bezierPath || !points.length) return '';
    const baseY = padT + innerH;
    return `${bezierPath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  }, [bezierPath, points]);

  // Donut circumference & segments
  const totalStatusCount = statusDistribution.reduce((s, d) => s + d.count, 0);
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const donutSegments = useMemo(() => {
    if (totalStatusCount === 0) return [];
    let accumulated = 0;
    return statusDistribution.map(d => {
      const pct = d.count / totalStatusCount;
      const strokeLen = pct * donutCircumference;
      const offset = accumulated;
      accumulated += strokeLen;
      return {
        ...d,
        pct: Math.round(pct * 100),
        strokeDasharray: `${strokeLen.toFixed(1)} ${(donutCircumference - strokeLen).toFixed(1)}`,
        strokeDashoffset: -offset.toFixed(1)
      };
    });
  }, [statusDistribution, totalStatusCount, donutCircumference]);

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
    <div className="space-y-6 font-sans">
      
      {/* ── 1. EXECUTIVE HEADER ── */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B07A85] to-[#8D5B66] text-white flex items-center justify-center font-bold shadow-md shadow-rose-900/10">
              <BarChart3 size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B07A85] bg-rose-50 px-2.5 py-0.5 rounded-full">
                Intelligence Suite
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Analytics & Performance Dashboard
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Real-time monthly booking volume, revenue flow, conversion health, and seasonal trajectory
          </p>
        </div>

        {/* Global Controls & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#B07A85]/20 cursor-pointer shadow-2xs"
            >
              <option value="all">All Bookings</option>
              <option value="confirmed">Confirmed & In-Event</option>
              <option value="pending">Pending Inquiries</option>
            </select>
          </div>

          {/* Time Range Pills */}
          <div className="bg-gray-100/80 p-1 rounded-xl flex items-center text-xs font-bold text-gray-500">
            {['6M', '12M', '2026', 'ALL'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === r 
                    ? 'bg-[#B07A85] text-white shadow-xs' 
                    : 'hover:text-gray-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              title="Refresh Analytics"
            >
              <RefreshCw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Gross Revenue */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#B07A85]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Gross Rental Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
              ₹
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-3 tracking-tight">
            {formatINR(kpis.totalAmount)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
            {kpis.revGrowth >= 0 ? (
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight size={14} /> +{kpis.revGrowth}%
              </span>
            ) : (
              <span className="text-rose-500 flex items-center">
                <ArrowDownRight size={14} /> {kpis.revGrowth}%
              </span>
            )}
            <span className="text-gray-400 font-normal">vs prev month</span>
          </div>
        </div>

        {/* Card 2: Total Bookings */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#B07A85]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#B07A85] flex items-center justify-center font-bold text-xs">
              <Package size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-3 tracking-tight flex items-baseline gap-1.5">
            {kpis.totalCount}
            <span className="text-xs font-medium text-gray-400">orders</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
            {kpis.countGrowth >= 0 ? (
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight size={14} /> +{kpis.countGrowth}%
              </span>
            ) : (
              <span className="text-rose-500 flex items-center">
                <ArrowDownRight size={14} /> {kpis.countGrowth}%
              </span>
            )}
            <span className="text-gray-400 font-normal">MoM volume</span>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#B07A85]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Avg Booking Value</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-3 tracking-tight">
            {formatINR(kpis.avgBookingValue)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 font-normal">
            <span>Average revenue per booking</span>
          </div>
        </div>

        {/* Card 4: Advance Collection Rate */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#B07A85]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Collection Health</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-3 tracking-tight flex items-baseline gap-1.5">
            {financialHealth.collectionRate}%
            <span className="text-xs font-semibold text-emerald-600">collected</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 font-normal">
            <span>{formatINR(financialHealth.advance)} advance collected</span>
          </div>
        </div>

      </div>

      {/* ── 3. MAIN FEATURED GRAPH CARD (MOST ATTRACTIVE CHOICE) ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        
        {/* Graph Header: Chart Style Switcher */}
        <div className="p-6 sm:p-7 border-b border-gray-100/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-white via-rose-50/20 to-transparent">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#B07A85]" />
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                Monthly Performance Trajectory
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Interactive timeline analysis. Switch between attractive visualization styles below:
            </p>
          </div>

          {/* Graph Choices & Metric Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Attractive Chart Choice Switcher */}
            <div className="bg-gray-100/90 p-1 rounded-2xl flex items-center text-xs font-extrabold text-gray-500 shadow-2xs">
              <button
                onClick={() => setGraphChoice('glow')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  graphChoice === 'glow' 
                    ? 'bg-gradient-to-r from-[#B07A85] to-[#8D5B66] text-white shadow-sm' 
                    : 'hover:text-gray-900'
                }`}
              >
                <Zap size={13} />
                Radiant Spline
              </button>
              <button
                onClick={() => setGraphChoice('bars')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  graphChoice === 'bars' 
                    ? 'bg-gradient-to-r from-[#B07A85] to-[#8D5B66] text-white shadow-sm' 
                    : 'hover:text-gray-900'
                }`}
              >
                <BarChart3 size={13} />
                Capsule Bars
              </button>
              <button
                onClick={() => setGraphChoice('hybrid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  graphChoice === 'hybrid' 
                    ? 'bg-gradient-to-r from-[#B07A85] to-[#8D5B66] text-white shadow-sm' 
                    : 'hover:text-gray-900'
                }`}
              >
                <Layers size={13} />
                Hybrid Wave
              </button>
            </div>

            {/* Metric Mode Filter */}
            <div className="bg-gray-100/90 p-1 rounded-2xl flex items-center text-xs font-bold text-gray-500">
              <button
                onClick={() => setMetricChoice('both')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  metricChoice === 'both' ? 'bg-white text-gray-900 shadow-2xs' : 'hover:text-gray-900'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setMetricChoice('amount')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  metricChoice === 'amount' ? 'bg-white text-emerald-700 shadow-2xs' : 'hover:text-gray-900'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setMetricChoice('count')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  metricChoice === 'count' ? 'bg-white text-[#B07A85] shadow-2xs' : 'hover:text-gray-900'
                }`}
              >
                Count
              </button>
            </div>
          </div>
        </div>

        {/* ── HIGHLIGHT HERO DETAILS (User explicitly requested!) ── */}
        <div className="px-6 sm:px-7 py-5 bg-gradient-to-b from-[#FFFDFD] via-white to-gray-50/20 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            {/* Active Month Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] text-[#B07A85] border border-rose-200/60 flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
                <Calendar size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">
                    {activePoint ? activePoint.fullLabel : 'Select Month'}
                  </h4>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {hoveredIdx !== null ? 'Inspecting Month from Graph Hover' : 'Active Month Selected Focus'}
                </p>
              </div>
            </div>

            {/* The 3 Highlighted Badges: Bookings | Revenue | Avg */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full lg:w-auto">
              
              {/* Highlight 1: Bookings */}
              <div className="bg-gradient-to-br from-[#FFF5F7] to-white border-2 border-rose-200/90 rounded-2xl px-5 py-3.5 shadow-sm hover:border-[#B07A85] transition-all">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                    Bookings
                  </span>
                  <Package size={14} className="text-[#B07A85]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#8D5B66] mt-1 leading-none">
                  {activePoint?.count || 0}
                  <span className="text-xs font-semibold text-rose-500/80 ml-1.5">orders</span>
                </div>
              </div>

              {/* Highlight 2: Revenue */}
              <div className="bg-gradient-to-br from-[#F0FDF4] to-white border-2 border-emerald-300 rounded-2xl px-5 py-3.5 shadow-sm hover:border-emerald-500 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                    Revenue
                  </span>
                  <span className="text-xs font-black text-emerald-600">₹</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1 leading-none">
                  {formatINR(activePoint?.amount || 0)}
                </div>
              </div>

              {/* Highlight 3: Avg per booking */}
              <div className="bg-gradient-to-br from-[#EFF6FF] to-white border-2 border-blue-300 rounded-2xl px-5 py-3.5 shadow-sm hover:border-blue-500 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                    Avg Order
                  </span>
                  <TrendingUp size={14} className="text-blue-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-1 leading-none">
                  {formatINR(activePoint?.avgValue || 0)}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ── THE GRAPH CANVAS ── */}
        <div className="p-6 sm:p-7">
          <div className="relative w-full overflow-x-auto">
            <div className="min-w-[700px] relative select-none">
              <svg 
                viewBox={`0 0 ${svgW} ${svgH}`} 
                className="w-full h-auto overflow-visible"
                preserveAspectRatio="none"
                style={{ minHeight: '380px', maxHeight: '460px' }}
              >
                <defs>
                  {/* Neon Glow Filter */}
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#B07A85" floodOpacity="0.35" />
                  </filter>

                  {/* Bar Drop Shadow */}
                  <filter id="barShadow" x="-20%" y="-10%" width="140%" height="130%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#8D5B66" floodOpacity="0.18" />
                  </filter>

                  {/* Spline Area Gradient */}
                  <linearGradient id="glowAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B07A85" stopOpacity="0.28" />
                    <stop offset="50%" stopColor="#E11D48" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00" />
                  </linearGradient>

                  {/* Radiant Spline Stroke Gradient */}
                  <linearGradient id="splineStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#B07A85" />
                    <stop offset="50%" stopColor="#E11D48" />
                    <stop offset="100%" stopColor="#B07A85" />
                  </linearGradient>

                  {/* Modern Capsule Bar Gradient */}
                  <linearGradient id="capsuleBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B07A85" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#E2A8B3" stopOpacity="0.75" />
                  </linearGradient>

                  <linearGradient id="capsuleActiveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity="1" />
                    <stop offset="100%" stopColor="#9F1239" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Soft Horizontal Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = padT + innerH - pct * innerH;
                  const valueLabel = formatShortINR(pct * maxAmount);
                  return (
                    <g key={idx}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={svgW - padR}
                        y2={y}
                        stroke="#F1F5F9"
                        strokeWidth="1.2"
                      />
                      <text
                        x={padL - 12}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10.5"
                        fill="#94A3B8"
                        fontWeight="600"
                      >
                        {valueLabel}
                      </text>
                    </g>
                  );
                })}

                {/* ── BARS RENDERING (Choice: 'bars' or 'hybrid') ── */}
                {(graphChoice === 'bars' || graphChoice === 'hybrid') && (metricChoice === 'both' || metricChoice === 'count') && (
                  <g>
                    {points.map((p) => {
                      const isFocus = activePoint?.key === p.key;
                      const barW = Math.max(18, Math.min(30, (innerW / points.length) * 0.44));
                      const x = p.x - barW / 2;
                      const h = Math.max(p.barHeight, p.count > 0 ? 6 : 0);
                      const y = padT + innerH - h;

                      return (
                        <g 
                          key={`bar-${p.key}`} 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIdx(p.index)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          onClick={() => setSelectedIndex(p.index)}
                        >
                          <rect
                            x={x}
                            y={y}
                            width={barW}
                            height={h}
                            rx="8"
                            fill={isFocus ? 'url(#capsuleActiveGrad)' : 'url(#capsuleBarGrad)'}
                            filter="url(#barShadow)"
                            className="transition-all duration-200"
                          />
                          {p.count > 0 && (
                            <text
                              x={p.x}
                              y={Math.max(padT + 14, y - 7)}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="800"
                              fill={isFocus ? '#E11D48' : '#8D5B66'}
                            >
                              {p.count}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* ── GLOW SPLINE RENDERING (Choice: 'glow' or 'hybrid') ── */}
                {(graphChoice === 'glow' || graphChoice === 'hybrid') && (metricChoice === 'both' || metricChoice === 'amount') && (
                  <g>
                    {/* Glowing Radiant Area */}
                    {areaGradientPath && (
                      <path
                        d={areaGradientPath}
                        fill="url(#glowAreaGrad)"
                        className="pointer-events-none transition-all duration-300"
                      />
                    )}

                    {/* Radiant Curved Line with Glow Filter */}
                    {bezierPath && (
                      <path
                        d={bezierPath}
                        fill="none"
                        stroke="url(#splineStrokeGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#neonGlow)"
                        className="pointer-events-none transition-all duration-300"
                      />
                    )}

                    {/* Data Points on Curve */}
                    {points.map((p) => {
                      const isFocus = activePoint?.key === p.key;
                      return (
                        <g 
                          key={`pt-${p.key}`} 
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIdx(p.index)}
                          onMouseLeave={() => setHoveredIdx(null)}
                          onClick={() => setSelectedIndex(p.index)}
                        >
                          {isFocus && (
                            <circle
                              cx={p.x}
                              cy={p.yAmount}
                              r="13"
                              fill="#E11D48"
                              opacity="0.22"
                              className="animate-ping"
                            />
                          )}
                          <circle
                            cx={p.x}
                            cy={p.yAmount}
                            r={isFocus ? '6.5' : '4'}
                            fill="#FFFFFF"
                            stroke={isFocus ? '#E11D48' : '#B07A85'}
                            strokeWidth={isFocus ? '4' : '2.5'}
                            className="transition-all duration-200"
                          />
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* ── INTERACTION HITBOXES & VERTICAL GUIDELINE ── */}
                {points.map((p) => {
                  const colW = innerW / points.length;
                  const isFocus = activePoint?.key === p.key;

                  return (
                    <g key={`hit-${p.key}`}>
                      {/* Transparent Hover Hitbox */}
                      <rect
                        x={p.x - colW / 2}
                        y={padT}
                        width={colW}
                        height={innerH}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(p.index)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        onClick={() => setSelectedIndex(p.index)}
                      />

                      {/* Subtle Laser Guideline on Hover */}
                      {isFocus && (
                        <line
                          x1={p.x}
                          y1={padT}
                          x2={p.x}
                          y2={padT + innerH}
                          stroke="#E11D48"
                          strokeDasharray="4 4"
                          strokeWidth="1.5"
                          opacity="0.75"
                          className="pointer-events-none"
                        />
                      )}

                      {/* X-Axis Month Label */}
                      <text
                        x={p.x}
                        y={svgH - 14}
                        textAnchor="middle"
                        fontSize={isFocus ? '11.5' : '10'}
                        fontWeight={isFocus ? '800' : '500'}
                        fill={isFocus ? '#B07A85' : '#64748B'}
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
        </div>

      </div>

      {/* ── 4. STATUS DONUT CHART & COLLECTION HEALTH CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Donut Chart of Status Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Booking Status Mix</h3>
              <p className="text-xs text-gray-400 mt-0.5">Distribution of all recorded orders</p>
            </div>
            <PieChart size={18} className="text-[#B07A85]" />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={donutRadius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="16"
                />
                {/* Segments */}
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 hover:opacity-80"
                  />
                ))}
              </svg>
              {/* Center Total Count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-gray-900 leading-none">
                  {totalStatusCount}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Total
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2.5 w-full">
              {donutSegments.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600 font-medium">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <span>{d.count}</span>
                    <span className="text-[10px] text-gray-400 font-normal">({d.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Financial Collection Health (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Payment & Advance Collection Rate</h3>
                <p className="text-xs text-gray-400 mt-0.5">Advance collected vs pending balance payments</p>
              </div>
              <CreditCard size={18} className="text-emerald-600" />
            </div>

            {/* Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>Advance Paid: {formatINR(financialHealth.advance)}</span>
                <span>Outstanding: {formatINR(financialHealth.balance)}</span>
              </div>
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" 
                  style={{ width: `${financialHealth.collectionRate}%` }} 
                />
                <div 
                  className="bg-amber-400 h-full rounded-r-full transition-all duration-500" 
                  style={{ width: `${100 - financialHealth.collectionRate}%` }} 
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{financialHealth.collectionRate}% secured advance</span>
                <span>{100 - financialHealth.collectionRate}% due upon delivery</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 mt-6 text-center">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Gross Booking</span>
              <strong className="block text-sm sm:text-base font-black text-gray-900 mt-1">
                {formatINR(financialHealth.gross)}
              </strong>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Advance Held</span>
              <strong className="block text-sm sm:text-base font-black text-emerald-700 mt-1">
                {formatINR(financialHealth.advance)}
              </strong>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Balance Due</span>
              <strong className="block text-sm sm:text-base font-black text-amber-800 mt-1">
                {formatINR(financialHealth.balance)}
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. DETAILED MONTHLY BREAKDOWN TABLE ── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">Monthly Ledger & Performance Audit</h3>
            <p className="text-xs text-gray-400 mt-0.5">Historical breakdown across recorded timeline</p>
          </div>
          {onViewAllBookings && (
            <button
              onClick={onViewAllBookings}
              className="text-xs text-[#B07A85] font-bold hover:underline flex items-center gap-1"
            >
              <Eye size={13} /> View All Bookings
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200/90 bg-gray-50/80 text-gray-500 font-black uppercase text-xs tracking-wider">
                <th className="py-4 px-6 text-sm font-black">Month Period</th>
                <th className="py-4 px-5 text-sm font-black">Bookings</th>
                <th className="py-4 px-5 text-sm font-black">Gross Revenue</th>
                <th className="py-4 px-5 text-sm font-black">Average Value</th>
                <th className="py-4 px-5 text-sm font-black">Advance Collected</th>
                <th className="py-4 px-5 text-sm font-black">Balance Due</th>
                <th className="py-4 px-5 text-sm font-black">Status Mix</th>
                <th className="py-4 px-6 text-right text-sm font-black">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {monthlyData.slice().reverse().map((m) => {
                const isSelected = activePoint?.key === m.key;
                return (
                  <tr 
                    key={m.key} 
                    className={`hover:bg-rose-50/20 transition-colors cursor-pointer ${
                      isSelected ? 'bg-rose-50/40 font-bold' : ''
                    }`}
                    onClick={() => setSelectedIndex(m.index)}
                  >
                    <td className="py-4 px-6 text-base font-extrabold text-gray-900">
                      {m.fullLabel}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-block bg-gray-100 text-gray-900 font-black px-3 py-1 rounded-xl text-sm">
                        {m.count}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-base sm:text-lg font-black text-gray-900">
                      {formatINR(m.amount)}
                    </td>
                    <td className="py-4 px-5 text-sm sm:text-base font-bold text-gray-700">
                      {formatINR(m.avgValue)}
                    </td>
                    <td className="py-4 px-5 text-sm sm:text-base font-bold text-emerald-700">
                      {formatINR(m.advance)}
                    </td>
                    <td className="py-4 px-5 text-sm sm:text-base font-bold text-amber-700">
                      {formatINR(m.balance)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 text-xs">
                        {m.confirmedCount + m.completedCount > 0 && (
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">
                            {m.confirmedCount + m.completedCount} conf
                          </span>
                        )}
                        {m.pendingCount > 0 && (
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold">
                            {m.pendingCount} pend
                          </span>
                        )}
                        {m.count === 0 && <span className="text-gray-400 italic text-xs">No orders</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(m.index);
                          if (onViewAllBookings) onViewAllBookings();
                        }}
                        className="text-[#B07A85] font-black hover:underline text-sm"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

