import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Package, 
  ChevronRight, 
  Filter, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';

/**
 * MonthlyBookingAnalytics — Premium, Minimalist, Neat Graph UI
 * ─────────────────────────────────────────────────────────────
 * Designed for Apila Jewels: ultra-clean typography, smooth bezier
 * curve, elegant responsive bars, and crystal-clear hero highlights.
 */
export default function MonthlyBookingAnalytics({ 
  bookings = [], 
  onViewAllBookings,
  className = '' 
}) {
  const [timeRange, setTimeRange] = useState('12M'); // '6M' | '12M' | '2026' | 'ALL'
  const [metricView, setMetricView] = useState('dual'); // 'dual' | 'amount' | 'count'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'confirmed' | 'pending'
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showBreakdownTable, setShowBreakdownTable] = useState(false);

  const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // 1. Process and aggregate monthly data
  const { monthlyData, totalStats } = useMemo(() => {
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
        pending: 0,
        confirmed: 0,
        completed: 0
      };
    });

    bookings.forEach(b => {
      const rawDate = b.bookingDate || b.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!bucket[key]) return;

      const st = (b.status || 'pending').toLowerCase();
      if (statusFilter === 'confirmed' && !['confirmed', 'approved', 'inevent', 'completed'].includes(st)) return;
      if (statusFilter === 'pending' && st !== 'pending') return;
      if (st === 'rejected') return;

      const amt = Number(b.totalAmount || 0);
      bucket[key].count += 1;
      bucket[key].amount += amt;
      bucket[key].advance += Number(b.advancePaid || 0);

      if (st === 'pending') bucket[key].pending += 1;
      else if (['confirmed', 'approved', 'inevent'].includes(st)) bucket[key].confirmed += 1;
      else if (st === 'completed') bucket[key].completed += 1;
    });

    const series = targetMonths.map(m => {
      const item = bucket[m.key];
      const avgValue = item.count > 0 ? Math.round(item.amount / item.count) : 0;
      return { ...item, avgValue };
    });

    const totalCount = series.reduce((sum, s) => sum + s.count, 0);
    const totalAmount = series.reduce((sum, s) => sum + s.amount, 0);
    const avgValue = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

    return {
      monthlyData: series,
      totalStats: { totalCount, totalAmount, avgValue }
    };
  }, [bookings, timeRange, statusFilter]);

  // Current active data point (hovered or selected or latest)
  const activePoint = useMemo(() => {
    if (hoveredIndex !== null && monthlyData[hoveredIndex]) {
      return monthlyData[hoveredIndex];
    }
    if (selectedIndex !== null && monthlyData[selectedIndex]) {
      return monthlyData[selectedIndex];
    }
    // Default to the last month with actual activity or the latest month
    const withActivity = [...monthlyData].reverse().find(m => m.count > 0);
    return withActivity || monthlyData[monthlyData.length - 1] || null;
  }, [hoveredIndex, selectedIndex, monthlyData]);

  // 2. Geometry coordinates
  const svgWidth = 800;
  const svgHeight = 260;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const innerW = svgWidth - padLeft - padRight;
  const innerH = svgHeight - padTop - padBottom;

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
      const x = padLeft + (monthlyData.length > 1 ? i * step : innerW / 2);
      const yAmount = padTop + innerH - (m.amount / maxAmount) * innerH;
      const barHeight = (m.count / maxCount) * innerH;
      const yBar = padTop + innerH - barHeight;
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

  // Cubic Bezier curve for amount
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
    const baseY = padTop + innerH;
    return `${bezierPath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  }, [bezierPath, points]);

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
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden transition-all ${className}`}>
      
      {/* ── TOP NAV & FILTERS BAR ── */}
      <div className="px-6 pt-6 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-[#B07A85] uppercase bg-[#FFF0F3] px-2.5 py-0.5 rounded-full">
              Analytics Overview
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mt-1">
            Monthly Booking & Revenue Trends
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#B07A85]/20 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed / Completed</option>
            <option value="pending">Pending</option>
          </select>

          {/* Metric View Pills */}
          <div className="bg-gray-100/80 p-1 rounded-xl flex items-center text-xs font-semibold text-gray-500">
            <button
              onClick={() => setMetricView('dual')}
              className={`px-3 py-1 rounded-lg transition-all ${
                metricView === 'dual' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setMetricView('amount')}
              className={`px-3 py-1 rounded-lg transition-all ${
                metricView === 'amount' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setMetricView('count')}
              className={`px-3 py-1 rounded-lg transition-all ${
                metricView === 'count' ? 'bg-white text-[#B07A85] shadow-xs font-bold' : 'hover:text-gray-900'
              }`}
            >
              Bookings
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="bg-gray-100/80 p-1 rounded-xl flex items-center text-xs font-semibold text-gray-500">
            {['6M', '12M', '2026', 'ALL'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeRange === r 
                    ? 'bg-[#B07A85] text-white shadow-xs font-bold' 
                    : 'hover:text-gray-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO STATS HIGHLIGHT BANNER ── */}
      {/* Specifically highlights: Bookings: X | Revenue: ₹Y | Avg: ₹Z */}
      <div className="px-6 py-5 bg-gradient-to-b from-[#FFFDFD] to-white border-b border-gray-100/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Active Month Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] text-[#B07A85] flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-gray-900">
                  {activePoint ? activePoint.fullLabel : 'Select Month'}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                  {hoveredIndex !== null ? 'Inspecting' : 'Selected Month'}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Click or hover over any bar/point in the graph below to switch months
              </p>
            </div>
          </div>

          {/* 3 Prominent Highlights: Bookings | Revenue | Avg Value */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full md:w-auto">
            
            {/* 1. Bookings Count */}
            <div className="bg-gradient-to-br from-[#FFF5F7] to-white border border-[#FBCFE8] px-4 py-3 rounded-2xl shadow-xs transition-all hover:border-[#B07A85]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Bookings</span>
                <Package size={13} className="text-[#B07A85]" />
              </div>
              <div className="text-2xl font-black text-[#8D5B66] mt-0.5 flex items-baseline gap-1">
                {activePoint?.count || 0}
                <span className="text-xs font-semibold text-gray-400">orders</span>
              </div>
            </div>

            {/* 2. Gross Revenue */}
            <div className="bg-gradient-to-br from-[#F0FDF4] to-white border border-[#BBF7D0] px-4 py-3 rounded-2xl shadow-xs transition-all hover:border-emerald-500">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Revenue</span>
                <span className="text-xs font-bold text-emerald-600">₹</span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {formatINR(activePoint?.amount || 0)}
              </div>
            </div>

            {/* 3. Average Value */}
            <div className="bg-gradient-to-br from-[#EFF6FF] to-white border border-[#BFDBFE] px-4 py-3 rounded-2xl shadow-xs transition-all hover:border-blue-500">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Avg Order</span>
                <TrendingUp size={13} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-blue-700 mt-0.5">
                {formatINR(activePoint?.avgValue || 0)}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── NEAT GRAPH CANVAS ── */}
      <div className="p-6">
        
        {/* Graph Legend & Status Sub-strip */}
        <div className="flex items-center justify-between text-xs text-gray-400 pb-2">
          <div className="flex items-center gap-4">
            {(metricView === 'dual' || metricView === 'amount') && (
              <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                <span className="w-3.5 h-1 bg-[#B07A85] rounded-full inline-block" />
                <span>Revenue Curve</span>
              </div>
            )}
            {(metricView === 'dual' || metricView === 'count') && (
              <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                <span className="w-2.5 h-2.5 bg-[#E8C2CA] rounded-sm inline-block" />
                <span>Booking Volume</span>
              </div>
            )}
          </div>
          <div className="text-[11px] text-gray-400">
            Range Total: <strong className="text-gray-700 font-bold">{totalStats.totalCount} orders</strong> (
            <strong className="text-emerald-700 font-bold">{formatINR(totalStats.totalAmount)}</strong>)
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[650px] relative select-none">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-auto overflow-visible"
              preserveAspectRatio="none"
              style={{ minHeight: '230px', maxHeight: '280px' }}
            >
              <defs>
                {/* Clean Translucent Area Gradient */}
                <linearGradient id="cleanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B07A85" stopOpacity="0.16" />
                  <stop offset="70%" stopColor="#B07A85" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#B07A85" stopOpacity="0.00" />
                </linearGradient>

                {/* Soft Bar Gradient */}
                <linearGradient id="cleanBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D99EA9" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#EED9DF" stopOpacity="0.65" />
                </linearGradient>
                <linearGradient id="activeBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B07A85" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8D5B66" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines (Ultra-clean, thin) */}
              {[0, 0.33, 0.66, 1].map((pct, idx) => {
                const y = padTop + innerH - pct * innerH;
                const valueLabel = formatShortINR(pct * maxAmount);
                return (
                  <g key={idx}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1.2"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94A3B8"
                      fontWeight="500"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* ── BARS (Count) ── */}
              {(metricView === 'dual' || metricView === 'count') && (
                <g>
                  {points.map((p) => {
                    const isFocus = activePoint?.key === p.key;
                    const barWidth = Math.max(16, Math.min(26, (innerW / points.length) * 0.42));
                    const x = p.x - barWidth / 2;
                    const h = Math.max(p.barHeight, p.count > 0 ? 5 : 0);
                    const y = padTop + innerH - h;

                    return (
                      <g 
                        key={`bar-${p.key}`} 
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredIndex(p.index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setSelectedIndex(p.index)}
                      >
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={h}
                          rx="6"
                          fill={isFocus ? 'url(#activeBarGrad)' : 'url(#cleanBarGrad)'}
                          className="transition-all duration-200"
                        />
                        {p.count > 0 && (
                          <text
                            x={p.x}
                            y={Math.max(padTop + 12, y - 6)}
                            textAnchor="middle"
                            fontSize="9.5"
                            fontWeight="700"
                            fill={isFocus ? '#B07A85' : '#94A3B8'}
                          >
                            {p.count}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ── AREA & LINE (Amount) ── */}
              {(metricView === 'dual' || metricView === 'amount') && (
                <g>
                  {/* Subtle Translucent Gradient Area */}
                  {areaGradientPath && (
                    <path
                      d={areaGradientPath}
                      fill="url(#cleanAreaGrad)"
                      className="pointer-events-none transition-all duration-300"
                    />
                  )}

                  {/* Bezier Line */}
                  {bezierPath && (
                    <path
                      d={bezierPath}
                      fill="none"
                      stroke="#B07A85"
                      strokeWidth={metricView === 'amount' ? '3.5' : '2.8'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="pointer-events-none transition-all duration-300"
                    />
                  )}

                  {/* Points on Line */}
                  {points.map((p) => {
                    const isFocus = activePoint?.key === p.key;
                    return (
                      <g 
                        key={`point-${p.key}`} 
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(p.index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setSelectedIndex(p.index)}
                      >
                        {isFocus && (
                          <circle
                            cx={p.x}
                            cy={p.yAmount}
                            r="11"
                            fill="#B07A85"
                            opacity="0.18"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          cx={p.x}
                          cy={p.yAmount}
                          r={isFocus ? '5.5' : '3.5'}
                          fill="#FFFFFF"
                          stroke="#B07A85"
                          strokeWidth={isFocus ? '3.5' : '2'}
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* ── HOVER HITBOXES & VERTICAL GUIDELINE ── */}
              {points.map((p) => {
                const colW = innerW / points.length;
                const isFocus = activePoint?.key === p.key;

                return (
                  <g key={`col-${p.key}`}>
                    {/* Transparent Hit Area */}
                    <rect
                      x={p.x - colW / 2}
                      y={padTop}
                      width={colW}
                      height={innerH}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(p.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setSelectedIndex(p.index)}
                    />

                    {/* Subtle Vertical Guideline when active */}
                    {isFocus && (
                      <line
                        x1={p.x}
                        y1={padTop}
                        x2={p.x}
                        y2={padTop + innerH}
                        stroke="#B07A85"
                        strokeDasharray="4 4"
                        strokeWidth="1.2"
                        opacity="0.6"
                        className="pointer-events-none"
                      />
                    )}

                    {/* X-Axis Month Label */}
                    <text
                      x={p.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fontSize={isFocus ? '11' : '10'}
                      fontWeight={isFocus ? '700' : '500'}
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

      {/* ── EXPANDABLE TABLE / DETAILED BREAKDOWN ── */}
      <div className="border-t border-gray-100 bg-gray-50/40">
        <button
          onClick={() => setShowBreakdownTable(!showBreakdownTable)}
          className="w-full px-6 py-3 flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers size={14} className="text-[#B07A85]" />
            Detailed Month-by-Month Breakdown ({monthlyData.length} Months)
          </span>
          <span className="text-[#B07A85] font-bold">
            {showBreakdownTable ? 'Hide Table ▲' : 'Show Table ▼'}
          </span>
        </button>

        {showBreakdownTable && (
          <div className="px-6 pb-6 pt-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Orders</th>
                  <th className="py-2.5 px-3">Gross Revenue</th>
                  <th className="py-2.5 px-3">Avg Order Value</th>
                  <th className="py-2.5 px-3">Status Breakdown</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {monthlyData.slice().reverse().map((m) => {
                  const isCurrent = activePoint?.key === m.key;
                  return (
                    <tr 
                      key={m.key} 
                      className={`hover:bg-white transition-colors cursor-pointer ${isCurrent ? 'bg-amber-50/40 font-bold' : ''}`}
                      onClick={() => setSelectedIndex(m.index)}
                    >
                      <td className="py-3 px-3 font-semibold text-gray-900">
                        {m.fullLabel}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-bold text-[11px]">
                          {m.count}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        {formatINR(m.amount)}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {formatINR(m.avgValue)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {m.confirmed + m.completed > 0 && (
                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                              {m.confirmed + m.completed} done
                            </span>
                          )}
                          {m.pending > 0 && (
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                              {m.pending} pending
                            </span>
                          )}
                          {m.count === 0 && <span className="text-gray-400 italic">No bookings</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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
