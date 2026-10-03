import { useState } from 'react';
import {
  fetchAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../../services/api';

export const useAdminBookings = (token, adminJewelleries, fetchAllJewelleriesData) => {
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [newBookingData, setNewBookingData] = useState({
    bookingCustomId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    bookingPlace: '',
    bookingDate: new Date().toISOString().split('T')[0],
    eventDate: '',
    pickupDate: '',
    returnDate: '',
    discountPercent: 0,
    discountAmount: 0,
    advancePaid: 0,
    depositAmount: 0,
    paymentStatus: 'Pending',
    status: 'pending',
    notes: '',
    jewelleryIds: [],
    tempJewelleries: []
  });
  const [tempJewelInput, setTempJewelInput] = useState({
    name: '',
    code: '',
    rentalPrice: '',
    deposit: '',
    image: ''
  });
  const [jewelCodeSearch, setJewelCodeSearch] = useState('');
  const [addBookingLoading, setAddBookingLoading] = useState(false);
  const [showAddTempJewelModal, setShowAddTempJewelModal] = useState(false);

  // Invoice state
  const [showInvoiceBooking, setShowInvoiceBooking] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isReorderingInvoiceItems, setIsReorderingInvoiceItems] = useState(false);
  const [invoiceDraggedIndex, setInvoiceDraggedIndex] = useState(null);

  const fetchBookingsList = async () => {
    setBookingsLoading(true);
    try {
      const result = await fetchAllBookings(token);
      if (result.success) setBookings(result.data);
    } catch (e) {
      console.error("Error fetching bookings:", e);
    } fontFinally: {
      setBookingsLoading(false);
    }
  };

  const handleOpenInvoice = (b) => {
    const customId = b.bookingCustomId || `BK-${String(b._id || '').slice(-4)}`;
    const regularItems = Array.isArray(b.jewelleryIds) ? b.jewelleryIds : [];
    const tempItems = Array.isArray(b.tempJewelleries) ? b.tempJewelleries : [];
    const combined = [
      ...regularItems.map(item => ({ ...item, isTemp: false })),
      ...tempItems.map(item => ({ ...item, isTemp: true }))
    ];
    setInvoiceItems(combined);
    setIsReorderingInvoiceItems(false);
    setInvoiceDraggedIndex(null);
    setShowInvoiceBooking({ ...b, customId });
  };

  const handleOpenEditBooking = (b) => {
    setEditingBookingId(b._id);
    const bItems = Array.isArray(b.jewelleryIds) ? b.jewelleryIds : [];
    const bTempItems = Array.isArray(b.tempJewelleries) ? b.tempJewelleries : [];
    const dbPercent = parseFloat(b.discountPercent) || 0;
    const dbAmount = parseFloat(b.discountAmount) || 0;
    
    let initialPercent = 0;
    let initialAmount = 0;

    if (dbPercent > 0) {
      initialPercent = dbPercent;
      initialAmount = 0;
    } else if (dbAmount > 0) {
      initialPercent = 0;
      initialAmount = dbAmount;
    }

    setNewBookingData({
      bookingCustomId: b.bookingCustomId || `BK-${String(b._id || '').slice(-4)}`,
      customerName: b.customerDetails?.name || (b.userId?.role !== 'admin' ? b.userId?.name : '') || '',
      customerPhone: b.customerDetails?.phone || (b.userId?.role !== 'admin' ? b.userId?.phone : '') || '',
      customerAddress: b.customerDetails?.address || '',
      bookingPlace: b.bookingPlace || '',
      bookingDate: b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      eventDate: b.eventDate ? new Date(b.eventDate).toISOString().split('T')[0] : '',
      pickupDate: b.pickupDate ? new Date(b.pickupDate).toISOString().split('T')[0] : '',
      returnDate: b.returnDate ? new Date(b.returnDate).toISOString().split('T')[0] : '',
      discountPercent: initialPercent,
      discountAmount: initialAmount,
      advancePaid: b.advancePaid || 0,
      depositAmount: b.depositAmount || 0,
      paymentStatus: b.paymentStatus || 'Pending',
      status: b.status || 'pending',
      notes: b.notes || '',
      jewelleryIds: bItems.map(item => item._id || item),
      tempJewelleries: bTempItems
    });
    if (!adminJewelleries.length && fetchAllJewelleriesData) fetchAllJewelleriesData();
    setShowAddBookingModal(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking entry?')) return;

    try {
      const result = await deleteBooking(token, bookingId);
      if (result.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        alert('Booking entry deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete booking.');
      }
    } catch (e) {
      console.error('Error deleting booking:', e);
      alert('Failed to delete booking. Please try again.');
    }
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();
    if (!newBookingData.jewelleryIds.length && (!newBookingData.tempJewelleries || !newBookingData.tempJewelleries.length)) {
      alert('Please select at least one jewellery item by Jewel Code or add a temporary item.');
      return;
    }
    if (!newBookingData.customerName) {
      alert('Please enter customer name.');
      return;
    }

    setAddBookingLoading(true);

    const selectedJewels = adminJewelleries.filter(j => newBookingData.jewelleryIds.includes(j._id));
    const regularRentalAmount = selectedJewels.reduce((sum, j) => sum + (j.rentalPrice || j.price || 0), 0);
    const tempRentalAmount = (newBookingData.tempJewelleries || []).reduce((sum, j) => sum + (parseFloat(j.rentalPrice) || 0), 0);
    const rentalAmount = regularRentalAmount + tempRentalAmount;

    const dPercent = parseFloat(newBookingData.discountPercent) || 0;
    const dAmount = parseFloat(newBookingData.discountAmount) || 0;
    const discountAmount = dAmount > 0 ? dAmount : (rentalAmount * dPercent) / 100;
    const netAmount = Math.max(0, rentalAmount - discountAmount);
    const advancePaid = parseFloat(newBookingData.advancePaid) || 0;
    const balanceAmount = Math.max(0, netAmount - advancePaid);
    const depositAmount = parseFloat(newBookingData.depositAmount) || 0;

    const payload = {
      bookingCustomId: newBookingData.bookingCustomId || `BK-${String(bookings.length + 1).padStart(3, '0')}`,
      jewelleryIds: newBookingData.jewelleryIds,
      tempJewelleries: newBookingData.tempJewelleries || [],
      bookingDate: newBookingData.bookingDate,
      eventDate: newBookingData.eventDate || null,
      pickupDate: newBookingData.pickupDate || null,
      returnDate: newBookingData.returnDate || null,
      bookingPlace: newBookingData.bookingPlace,
      status: newBookingData.status,
      paymentStatus: newBookingData.paymentStatus,
      rentalAmount,
      discountPercent: dPercent,
      discountAmount,
      totalAmount: netAmount,
      advancePaid,
      balanceAmount,
      depositAmount,
      notes: newBookingData.notes,
      customerDetails: {
        name: newBookingData.customerName,
        phone: newBookingData.customerPhone,
        address: newBookingData.customerAddress
      }
    };

    try {
      const result = editingBookingId
        ? await updateBooking(token, editingBookingId, payload)
        : await createBooking(token, payload);

      if (result.success) {
        setShowAddBookingModal(false);
        setEditingBookingId(null);
        setNewBookingData({
          bookingCustomId: '',
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          bookingPlace: '',
          bookingDate: new Date().toISOString().split('T')[0],
          eventDate: '',
          pickupDate: '',
          returnDate: '',
          discountPercent: 0,
          discountAmount: 0,
          advancePaid: 0,
          depositAmount: 0,
          paymentStatus: 'Pending',
          status: 'pending',
          notes: '',
          jewelleryIds: [],
          tempJewelleries: []
        });
        setJewelCodeSearch('');

        const bResult = await fetchAllBookings(token);
        if (bResult.success) setBookings(bResult.data);
        alert(editingBookingId ? 'Booking updated successfully!' : 'New booking created successfully!');
      } else {
        alert(result.error || 'Failed to save booking.');
      }
    } catch (err) {
      console.error('Error saving booking:', err);
      alert('Failed to save booking. Please try again.');
    } finally {
      setAddBookingLoading(false);
    }
  };

  return {
    bookings,
    setBookings,
    bookingsLoading,
    setBookingsLoading,
    showAddBookingModal,
    setShowAddBookingModal,
    editingBookingId,
    setEditingBookingId,
    newBookingData,
    setNewBookingData,
    tempJewelInput,
    setTempJewelInput,
    jewelCodeSearch,
    setJewelCodeSearch,
    addBookingLoading,
    showAddTempJewelModal,
    setShowAddTempJewelModal,
    showInvoiceBooking,
    setShowInvoiceBooking,
    invoiceItems,
    setInvoiceItems,
    isReorderingInvoiceItems,
    setIsReorderingInvoiceItems,
    invoiceDraggedIndex,
    setInvoiceDraggedIndex,
    fetchBookingsList,
    handleOpenInvoice,
    handleOpenEditBooking,
    handleDeleteBooking,
    handleSaveBooking
  };
};
