import React, { useState, useMemo } from 'react';
import { Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Clock, AlertCircle, Eye, Tag, Phone, User, CalendarX } from 'lucide-react';

const JewelScheduleSearch = ({ bookings = [], jewelleries = [], onOpenBooking }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedCode, setSearchedCode] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Execute Search
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const clean = searchTerm.trim();
    if (!clean) return;
    setSearchedCode(clean);
    setHasSearched(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchedCode('');
    setHasSearched(false);
  };

  // Find jewellery matching code
  const matchedJewel = useMemo(() => {
    if (!searchedCode) return null;
    const lower = searchedCode.toLowerCase();
    return (jewelleries || []).find(j => 
      (j.jewelId && j.jewelId.toLowerCase() === lower) ||
      (j.name && j.name.toLowerCase() === lower)
    ) || null;
  }, [searchedCode, jewelleries]);

  // Find upcoming bookings for this jewel
  const upcomingBookings = useMemo(() => {
    if (!searchedCode) return [];
    const lower = searchedCode.toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = [];

    (bookings || []).forEach(b => {
      const status = (b.status || '').toLowerCase();
      if (status === 'rejected' || status === 'cancelled') return;

      let matched = false;

      // 1. Check jewelleryIds
      if (Array.isArray(b.jewelleryIds)) {
        matched = b.jewelleryIds.some(j => {
          if (!j) return false;
          const codeMatch = j.jewelId && j.jewelId.toLowerCase() === lower;
          const idMatch = matchedJewel && (j._id === matchedJewel._id || j === matchedJewel._id);
          const nameMatch = j.name && j.name.toLowerCase() === lower;
          return codeMatch || idMatch || nameMatch;
        });
      }

      // 2. Check tempJewelleries
      if (!matched && Array.isArray(b.tempJewelleries)) {
        matched = b.tempJewelleries.some(t => {
          if (!t) return false;
          return (t.code && t.code.trim().toLowerCase() === lower) ||
                 (t.name && t.name.trim().toLowerCase() === lower);
        });
      }

      if (matched) {
        const pickupDate = b.pickupDate ? new Date(b.pickupDate) : null;
        const returnDate = b.returnDate ? new Date(b.returnDate) : null;
        const eventDate = b.eventDate ? new Date(b.eventDate) : null;
        const effectiveEnd = returnDate || eventDate || pickupDate;

        if (effectiveEnd && effectiveEnd >= today) {
          results.push({
            ...b,
            parsedPickup: pickupDate,
            parsedReturn: returnDate,
            parsedEvent: eventDate
          });
        }
      }
    });

    results.sort((a, b) => (a.parsedPickup || 0) - (b.parsedPickup || 0));
    return results;
  }, [searchedCode, matchedJewel, bookings]);

  // Update calendar month to the first upcoming booking's month when search succeeds
  React.useEffect(() => {
    if (upcomingBookings.length > 0 && upcomingBookings[0].parsedPickup) {
      setCurrentMonthDate(new Date(upcomingBookings[0].parsedPickup.getFullYear(), upcomingBookings[0].parsedPickup.getMonth(), 1));
    } else {
      setCurrentMonthDate(new Date());
    }
  }, [upcomingBookings]);

  // Helper to test if a calendar date falls between Pickup Date and Return Date
  const getBookingForDate = (date) => {
    const dTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return upcomingBookings.find(b => {
      if (!b.parsedPickup) return false;
      const start = new Date(b.parsedPickup.getFullYear(), b.parsedPickup.getMonth(), b.parsedPickup.getDate()).getTime();
      const end = b.parsedReturn 
        ? new Date(b.parsedReturn.getFullYear(), b.parsedReturn.getMonth(), b.parsedReturn.getDate()).getTime()
        : (b.parsedEvent ? new Date(b.parsedEvent.getFullYear(), b.parsedEvent.getMonth(), b.parsedEvent.getDate()).getTime() : start);
      return dTime >= start && dTime <= end;
    });
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false, booking: getBookingForDate(d) });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, booking: getBookingForDate(d) });
    }

    // Next month padding to fill complete grid rows (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, booking: getBookingForDate(d) });
    }

    return days;
  }, [currentMonthDate, upcomingBookings]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Quick suggestions from jewelleries
  const quickCodes = useMemo(() => {
    if (!jewelleries || !jewelleries.length) return [];
    return jewelleries.filter(j => j.jewelId).slice(0, 6).map(j => j.jewelId);
  }, [jewelleries]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B07A85] to-[#c995a0] flex items-center justify-center text-white shadow-md shadow-[#B07A85]/20">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Jewel Availability & Upcoming Schedule</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Check whether a jewel is free or booked for future dates from <span className="font-semibold text-rose-600">Pickup Date</span> to <span className="font-semibold text-rose-600">Return Date</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Jewel Code (e.g. AP-001, JW-102)..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] transition-all uppercase tracking-wider"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1 font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#B07A85] text-white text-sm font-semibold rounded-xl hover:bg-[#9E6A75] shadow-sm shadow-[#B07A85]/20 transition-all flex items-center gap-2 flex-shrink-0"
          >
            <Search size={15} /> Check
          </button>
        </form>
      </div>

      {/* Quick Pills if not searched yet */}
      {!hasSearched && quickCodes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-xs text-gray-400 font-medium">Quick suggestions:</span>
          {quickCodes.map(code => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setSearchTerm(code);
                setSearchedCode(code);
                setHasSearched(true);
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-rose-50 hover:text-[#B07A85] text-gray-600 text-xs font-mono font-medium rounded-lg border border-gray-200 transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      )}

      {/* Main Results Display */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Jewel Meta Card */}
          <div className="bg-gradient-to-r from-amber-50/50 via-rose-50/30 to-purple-50/40 p-4 sm:p-5 rounded-2xl border border-rose-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {matchedJewel && (matchedJewel.images?.[0] || matchedJewel.media?.[0]?.url) ? (
                <img
                  src={matchedJewel.images?.[0] || matchedJewel.media?.[0]?.url}
                  alt={matchedJewel.name}
                  className="w-14 h-14 object-cover rounded-xl border border-white shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-[#B07A85] flex-shrink-0 font-bold font-mono text-sm">
                  {searchedCode.slice(0, 4)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white font-mono text-xs font-bold rounded-md tracking-wider">
                    {searchedCode}
                  </span>
                  {matchedJewel?.name && (
                    <span className="text-sm font-bold text-gray-800">{matchedJewel.name}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                  {matchedJewel?.category && (
                    <span className="capitalize">
                      Category: <strong>{Array.isArray(matchedJewel.category) ? matchedJewel.category.join(', ') : matchedJewel.category}</strong>
                    </span>
                  )}
                  {matchedJewel?.rentalPrice ? (
                    <span>
                      Rent: <strong>₹{matchedJewel.rentalPrice.toLocaleString()}</strong>
                    </span>
                  ) : null}
                  <span>
                    Status:{' '}
                    <strong className={upcomingBookings.length > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {upcomingBookings.length > 0
                        ? `${upcomingBookings.length} Upcoming Booking(s) Reserved`
                        : 'Available & Free for Booking'}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {upcomingBookings.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                  Dates Blocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  No Future Bookings
                </span>
              )}
            </div>
          </div>

          {/* Condition 1: HAS UPCOMING BOOKINGS -> SHOW CALENDAR WITH RED MARKS */}
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left / Top: Interactive Calendar View */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">
                      {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md font-medium border border-rose-100">
                      Red = Booked Dates
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                      title="Previous month"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMonthDate(new Date())}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                      title="Next month"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Day Header Row */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={day} className={`text-xs font-bold py-1 ${i === 0 || i === 6 ? 'text-gray-400' : 'text-gray-600'}`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((cell, idx) => {
                    const isBooked = Boolean(cell.booking);
                    const isCurrent = cell.isCurrentMonth;
                    const isTodayDate = isToday(cell.date);

                    let bgClass = 'bg-white text-gray-700 hover:bg-gray-50';
                    let borderClass = 'border-gray-100';

                    if (!isCurrent) {
                      bgClass = 'bg-gray-50/50 text-gray-300';
                      borderClass = 'border-transparent';
                    }

                    if (isBooked) {
                      // Marked in RED as requested
                      bgClass = 'bg-rose-500 text-white font-bold shadow-sm shadow-rose-500/30 hover:bg-rose-600';
                      borderClass = 'border-rose-600 ring-2 ring-rose-300';
                    } else if (isTodayDate) {
                      borderClass = 'border-[#B07A85] ring-2 ring-[#B07A85]/20 font-bold';
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cell.booking && onOpenBooking) {
                            onOpenBooking(cell.booking);
                          }
                        }}
                        className={`h-12 sm:h-14 rounded-xl border flex flex-col items-center justify-between p-1 transition-all relative ${
                          cell.booking ? 'cursor-pointer hover:scale-105' : ''
                        } ${bgClass} ${borderClass}`}
                        title={
                          cell.booking
                            ? `Reserved for ${cell.booking.customerDetails?.name || 'Customer'}\nPickup: ${formatDateDisplay(cell.booking.pickupDate)}\nReturn: ${formatDateDisplay(cell.booking.returnDate)}`
                            : cell.date.toDateString()
                        }
                      >
                        <span className={`text-xs ${isBooked ? 'text-white' : isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                          {cell.date.getDate()}
                        </span>

                        {isBooked ? (
                          <span className="text-[9px] uppercase tracking-tighter font-extrabold px-1 bg-rose-700 text-white rounded leading-tight text-center truncate max-w-full">
                            BOOKED
                          </span>
                        ) : isTodayDate ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B07A85]"></span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-600"></span>
                    <span>Booked Date (Pickup ➔ Return)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-white border border-[#B07A85] ring-1 ring-[#B07A85]/30"></span>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-white border border-gray-200"></span>
                    <span>Available Date</span>
                  </div>
                </div>
              </div>

              {/* Right / Bottom: Detailed Booking Cards with Pickup -> Return */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Upcoming Bookings Schedule ({upcomingBookings.length})
                  </h4>
                  <span className="text-[11px] text-gray-400">Chronological order</span>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {upcomingBookings.map((b, i) => {
                    const customId = b.bookingCustomId || `BK-${String(i + 1).padStart(3, '0')}`;
                    return (
                      <div
                        key={b._id || i}
                        className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm hover:border-rose-300 transition-all space-y-3 group"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-mono font-bold text-xs rounded border border-rose-100">
                              {customId}
                            </span>
                            <span className="text-xs font-bold text-gray-800 capitalize">
                              {b.customerDetails?.name || b.userId?.name || 'Customer'}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            (b.status || '').toLowerCase() === 'confirmed' || (b.status || '').toLowerCase() === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {b.status || 'Pending'}
                          </span>
                        </div>

                        {/* Highlighted Pickup & Return Date Banner */}
                        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
                          <div className="text-left">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                              Pickup Date
                            </div>
                            <div className="font-bold text-gray-900 mt-0.5">
                              {formatDateDisplay(b.pickupDate)}
                            </div>
                          </div>

                          <div className="text-rose-400 font-bold px-2">➔</div>

                          <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                              Return Date
                            </div>
                            <div className="font-bold text-gray-900 mt-0.5">
                              {formatDateDisplay(b.returnDate)}
                            </div>
                          </div>
                        </div>

                        {/* Customer & Event Details */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                          <div className="flex items-center gap-3">
                            {b.customerDetails?.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone size={11} className="text-gray-400" />
                                {b.customerDetails.phone}
                              </span>
                            )}
                            {b.eventDate && (
                              <span className="text-[11px] text-gray-400">
                                Event: <strong>{formatDateDisplay(b.eventDate)}</strong>
                              </span>
                            )}
                          </div>

                          {onOpenBooking && (
                            <button
                              type="button"
                              onClick={() => onOpenBooking(b)}
                              className="text-xs font-bold text-[#B07A85] hover:text-[#9E6A75] hover:underline flex items-center gap-1"
                            >
                              <Eye size={12} /> View Entry
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Condition 2: NO FUTURE BOOKINGS -> CLEAN HERO CARD WITHOUT CALENDAR */
            <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-blue-50/60 rounded-3xl border border-emerald-100 p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900">
                  Ready for Immediate Booking!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Jewel <span className="font-bold text-emerald-700 font-mono">{searchedCode}</span> has{' '}
                  <strong>no upcoming or future bookings</strong> reserved. All calendar dates are completely free and open.
                </p>
              </div>

              <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2">
                <div className="px-4 py-2 bg-white rounded-xl border border-emerald-200/80 text-xs font-semibold text-emerald-800 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  100% Free Schedule
                </div>
                <div className="px-4 py-2 bg-white rounded-xl border border-emerald-200/80 text-xs font-semibold text-emerald-800 shadow-sm flex items-center gap-2">
                  <Sparkles size={13} className="text-emerald-600" />
                  Available to Rent Out
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JewelScheduleSearch;
