import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, 
  Sparkles, CreditCard, Ticket, ArrowRight, ShieldAlert, Check, Plane, 
  Train, Bus, Download, QrCode, User, Phone, Mail, FileText, Smartphone,
  Building, ChevronRight, Receipt, KeyRound, Building2, Plus, Minus
} from 'lucide-react';
import { api } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tripData: any;
  selectedTransit: any;
  selectedHotel: any;
  holdData: any;
  bookingMode?: 'TRANSIT' | 'HOTEL' | 'COMBINED';
}

export const SagaBookingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tripData,
  selectedTransit,
  selectedHotel,
  holdData,
  bookingMode = 'TRANSIT'
}) => {
  // Phase in Checkout: 'details' | 'otp' | 'receipt'
  const [checkoutPhase, setCheckoutPhase] = useState<'details' | 'otp' | 'receipt'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  
  // Hotel inclusion toggle
  const isHotelDirectBooking = bookingMode === 'HOTEL';
  const [includeHotel, setIncludeHotel] = useState<boolean>(isHotelDirectBooking);

  // Sync includeHotel if bookingMode changes
  useEffect(() => {
    if (bookingMode === 'HOTEL') {
      setIncludeHotel(true);
    }
  }, [bookingMode]);

  // Passenger Form State
  const [passengerName, setPassengerName] = useState('Aarav Sharma');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [contactEmail, setContactEmail] = useState('aarav.sharma@example.com');

  // Payment Form State
  const [upiApp, setUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'CUSTOM'>('GPAY');
  const [upiId, setUpiId] = useState('aarav@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('821');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // OTP Verification State
  const DEMO_OTP = "482910";
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);

  // Execution & Simulation
  const [isExecuting, setIsExecuting] = useState(false);
  const [sagaResult, setSagaResult] = useState<any>(null);
  const [simulateFailure, setSimulateFailure] = useState<string>('NONE');

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (checkoutPhase === 'otp' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [checkoutPhase, otpTimer]);

  if (!isOpen) return null;

  const transitPrice = selectedTransit?.fare_inr || 4850;
  const hotelPrice = selectedHotel?.price_per_night_inr || 4200;
  
  // Calculate price based on whether it is Hotel-Only, Transit-Only, or Combined
  const subtotal = isHotelDirectBooking 
    ? hotelPrice 
    : (includeHotel ? (transitPrice + hotelPrice) : transitPrice);
    
  const gstTax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gstTax;

  const isFlight = selectedTransit?.type === 'FLIGHT' || selectedTransit?.airline || selectedTransit?.name?.toLowerCase().includes('flight') || selectedTransit?.name?.toLowerCase().includes('indigo') || selectedTransit?.name?.toLowerCase().includes('air india') || selectedTransit?.name?.toLowerCase().includes('akasa');

  // Step 1 -> Step 2: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setEnteredOtp('');
    setOtpError('');
    setOtpTimer(30);
    setCheckoutPhase('otp');
  };

  // Step 2 -> Step 3: Verify OTP & Execute Booking
  const handleVerifyOtpAndBook = async () => {
    if (enteredOtp !== DEMO_OTP && enteredOtp !== '123456') {
      setOtpError(`Invalid OTP. Please enter ${DEMO_OTP} to authorize transaction.`);
      return;
    }

    setOtpError('');
    setIsExecuting(true);

    // Call Backend Saga Orchestrator
    const res = await api.executeSagaBooking({
      trip_id: tripData?.trip_id || "yatra_trip_01",
      hotel_id: (isHotelDirectBooking || includeHotel) ? (selectedHotel?.hotel_id || "htl_vns_01") : null,
      hotel_name: (isHotelDirectBooking || includeHotel) ? (selectedHotel?.name || "Taj Ganges Heritage") : null,
      transit_id: isHotelDirectBooking ? null : (selectedTransit?.id || "tr_opt_flight"),
      transit_type: isHotelDirectBooking ? "HOTEL_ONLY" : (isFlight ? "FLIGHT" : (selectedTransit?.type || "TRAIN")),
      transit_name: isHotelDirectBooking ? null : (selectedTransit?.name || (isFlight ? "IndiGo 6E-204" : "Vande Bharat Express")),
      total_amount_inr: grandTotal,
      kms_payment_token: `KMS_PAY_OTP_VERIFIED_${Date.now()}`,
      include_hotel: includeHotel || isHotelDirectBooking,
      booking_type: isHotelDirectBooking ? "HOTEL_ONLY" : (includeHotel ? "COMBINED" : "TRANSIT"),
      simulate_failure_step: simulateFailure !== 'NONE' ? simulateFailure : null
    });

    if (res) {
      setSagaResult(res);
      setCheckoutPhase('receipt');
    } else {
      // Local fallback simulation
      if (simulateFailure === 'HOTEL_HOLD' || simulateFailure === 'TRANSIT_RESERVE') {
        setSagaResult({
          status: "COMPENSATED_FAILED",
          saga_id: "SAGA_FAIL_SIM_09",
          compensation_reason: isHotelDirectBooking 
            ? "Hotel room inventory lock expired during payment verification." 
            : "Transit seats suddenly sold out during peak Tatkal window.",
          compensation_steps: [
            { action: "RELEASE_HOTEL_INVENTORY", status: "UNLOCKED", message: "Any inventory hold released." },
            { action: "INSTANT_UPI_REVERSAL", status: "SETTLED_INSTANT_CREDIT", message: "Payment authorization reversed. ₹0 debited." }
          ]
        });
      } else {
        const flightPnr = isFlight ? "6E-W8X92K" : "PNR_VB_8820";
        const flightEticket = "ETKT-098-482910481";
        const txnId = `TXN_${paymentMethod}_${Math.floor(100000000 + Math.random() * 900000000)}`;

        setSagaResult({
          status: "CONFIRMED_SUCCESS",
          saga_id: "SAGA_AUTH_88921",
          transaction_id: txnId,
          payment_method: paymentMethod === 'UPI' ? `UPI (${upiId})` : (paymentMethod === 'CARD' ? `Card ending in 8821` : `NetBanking (${selectedBank})`),
          amount_paid: grandTotal,
          paid_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_hotel_only: isHotelDirectBooking,
          transit_type: isHotelDirectBooking ? null : (isFlight ? "FLIGHT" : "TRAIN"),
          transit_pnr: isHotelDirectBooking ? null : flightPnr,
          hotel_confirmation_code: (isHotelDirectBooking || includeHotel) ? "HTL_CONF_8829" : null,
          flight_details: (!isHotelDirectBooking && isFlight) ? {
            pnr: flightPnr,
            eticket_number: flightEticket,
            seat_assignment: "12A (Window - Auto Checked In)",
            terminal: "T2 Terminal (Gate 08A)",
            baggage_allowance: "15 kg Check-in + 7 kg Cabin",
            airline_gds: "Amadeus / Google Flights GDS Rail",
            boarding_pass_status: "READY_FOR_DOWNLOAD"
          } : null,
          steps_executed: [
            ...(isHotelDirectBooking ? [
              { step: 1, action: "HOTEL_ROOM_LOCK", status: "SUCCESS", details: `Room confirmed at ${selectedHotel?.name || 'Taj Ganges Heritage'}.` },
              { step: 2, action: "PAYMENT_SETTLEMENT", status: "SUCCESS", details: `₹${grandTotal} settled via OTP authorized payment rail.` },
              { step: 3, action: "HOTEL_VOUCHER_ISSUANCE", status: "SUCCESS", details: "Official digital hotel stay voucher generated." }
            ] : [
              ...(includeHotel ? [{ step: 1, action: "HOTEL_RESERVATION", status: "SUCCESS", details: `Room confirmed at ${selectedHotel?.name || 'Taj Ganges Heritage'}.` }] : []),
              { step: includeHotel ? 2 : 1, action: isFlight ? "AUTONOMOUS_FLIGHT_BOOKING" : "TRANSIT_SEAT_RESERVED", status: "SUCCESS", details: isFlight ? `Flight confirmed on ${selectedTransit?.name || 'IndiGo 6E-204'}.` : `Seat confirmed on ${selectedTransit?.name || 'Vande Bharat Express'}.` },
              { step: includeHotel ? 3 : 2, action: "PAYMENT_SETTLEMENT", status: "SUCCESS", details: `₹${grandTotal} settled via OTP authorized payment rail.` },
              { step: includeHotel ? 4 : 3, action: "TICKET_ISSUANCE", status: "SUCCESS", details: "Travel tickets & invoices issued." }
            ])
          ]
        });
      }
      setCheckoutPhase('receipt');
    }

    setIsExecuting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel-glow w-full max-w-2xl rounded-2xl p-5 sm:p-6 border border-sky-500/35 relative max-h-[92vh] overflow-y-auto animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              {isHotelDirectBooking ? <Building2 className="w-5 h-5" /> : (isFlight ? <Plane className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />)}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                {checkoutPhase === 'receipt' 
                  ? "Booking & Payment Confirmed" 
                  : (checkoutPhase === 'otp' 
                    ? "Enter OTP for Payment Authorization" 
                    : (isHotelDirectBooking 
                      ? "Book Heritage Stay" 
                      : (isFlight ? "Book Flight Tickets" : "Book Travel Tickets")))}
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30">
                  {checkoutPhase === 'receipt' ? "Completed" : (checkoutPhase === 'otp' ? "Step 2: OTP Verification" : "Step 1: Payment Details")}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {checkoutPhase === 'receipt' 
                  ? "Your transaction is verified and travel documents are ready." 
                  : (checkoutPhase === 'otp' 
                    ? `A 6-digit verification code has been sent to ${contactPhone}.` 
                    : (isHotelDirectBooking 
                      ? "Direct room reservation with instant voucher issuance" 
                      : "Review your travel selection, passenger info, and payment option."))}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* PHASE 1: DETAILS & PAYMENT */}
        {checkoutPhase === 'details' && (
          <form onSubmit={handleSendOtp} className="space-y-4 my-4">
            
            {/* If Hotel-Only Booking */}
            {isHotelDirectBooking ? (
              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    1. Selected Heritage Stay
                  </span>
                  <span className="text-[11px] font-mono text-cyan-300 font-bold">₹{hotelPrice} / night</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{selectedHotel?.name || 'Taj Ganges Heritage Retreat'}</div>
                    <div className="text-slate-400 text-[11px]">⭐ {selectedHotel?.rating || 4.8} • {selectedHotel?.category || 'Heritage Deluxe'} • {selectedHotel?.distance_to_core_temple || '1.2 km to sanctum'}</div>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-medium">
                    Instant Room Lock
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Transit Card */}
                <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      {isFlight ? <Plane className="w-3.5 h-3.5" /> : <Train className="w-3.5 h-3.5" />}
                      1. Selected Transportation
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">₹{transitPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{selectedTransit?.name || (isFlight ? 'IndiGo 6E-204' : 'Vande Bharat Express')}</div>
                      <div className="text-slate-400 text-[11px]">{selectedTransit?.duration || '1h 25m non-stop'} • 15 kg Baggage Included</div>
                    </div>
                    <span className="text-[10px] bg-sky-950 text-cyan-300 px-2 py-0.5 rounded border border-sky-800 font-medium">
                      {isFlight ? 'Direct Flight' : 'Confirmed Transit'}
                    </span>
                  </div>
                </div>

                {/* Optional Hotel Toggle */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeHotel}
                        onChange={(e) => setIncludeHotel(e.target.checked)}
                        className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-400"
                      />
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                        Add Hotel Stay to this booking (Optional)
                      </span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-300 font-bold">+ ₹{hotelPrice}/night</span>
                  </div>
                  {includeHotel ? (
                    <div className="pl-6 text-[11px] text-cyan-300">
                      ✓ Hotel added: <strong>{selectedHotel?.name || 'Taj Ganges Heritage'}</strong> (1 Room, Heritage Deluxe).
                    </div>
                  ) : (
                    <div className="pl-6 text-[11px] text-slate-400">
                      Currently booking <strong>transit only</strong>. Check the box above if you wish to bundle the hotel stay.
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Passenger & Contact Details */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <User className="w-3.5 h-3.5" /> 2. Guest / Traveler Details
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  ✓ DigiLocker Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">Primary Guest Name</label>
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Mobile (for OTP)</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-400 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Email for Vouchers</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <CreditCard className="w-3.5 h-3.5" /> 3. Select Payment Method
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2.5 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all text-xs ${
                    paymentMethod === 'UPI'
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2.5 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all text-xs ${
                    paymentMethod === 'CARD'
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`p-2.5 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all text-xs ${
                    paymentMethod === 'NETBANKING'
                      ? 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" /> Net Banking
                </button>
              </div>

              {/* UPI Sub-fields */}
              {paymentMethod === 'UPI' && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'GPAY', label: 'Google Pay' },
                      { id: 'PHONEPE', label: 'PhonePe' },
                      { id: 'PAYTM', label: 'Paytm' },
                      { id: 'CUSTOM', label: 'Other UPI ID' }
                    ].map(app => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setUpiApp(app.id as any)}
                        className={`px-2.5 py-1 rounded text-xs transition-all ${
                          upiApp === app.id 
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-semibold' 
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {app.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">UPI ID / VPA</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Card Sub-fields */}
              {paymentMethod === 'CARD' && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-400 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-400 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-400 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking Sub-fields */}
              {paymentMethod === 'NETBANKING' && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <label className="text-slate-400 block">Bank Name</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-sky-400 focus:outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-1.5 text-xs">
              {isHotelDirectBooking ? (
                <div className="flex justify-between text-slate-300">
                  <span>Hotel Stay ({selectedHotel?.name || 'Taj Ganges'}):</span>
                  <span className="font-mono text-slate-200 font-bold">₹{hotelPrice}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-300">
                    <span>{isFlight ? "Flight Airfare" : "Transit Fare"}:</span>
                    <span className="font-mono text-slate-200 font-bold">₹{transitPrice}</span>
                  </div>
                  {includeHotel && (
                    <div className="flex justify-between text-slate-300">
                      <span>Hotel Stay (Taj Ganges Heritage):</span>
                      <span className="font-mono text-slate-200 font-bold">₹{hotelPrice}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Goods & Services Tax (GST 5%):</span>
                <span className="font-mono">₹{gstTax}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-slate-100">
                <span>Total Amount to Pay:</span>
                <span className="text-sky-300 text-base font-black font-mono">₹{grandTotal}</span>
              </div>
            </div>

            {/* Send OTP CTA */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-black text-sm transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-slate-950" />
              Send OTP & Proceed for Payment (₹{grandTotal})
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </form>
        )}

        {/* PHASE 2: MANDATORY OTP VERIFICATION */}
        {checkoutPhase === 'otp' && (
          <div className="space-y-4 my-4 animate-fade-in-up">
            
            {/* Simulated SMS Alert Banner */}
            <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-400/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-200">
                  OTP sent to <strong>{contactPhone}</strong> for ₹{grandTotal} transaction.
                </span>
              </div>
              <span className="text-[11px] bg-cyan-400 text-slate-950 px-2 py-0.5 rounded font-black font-mono">
                DEMO OTP: {DEMO_OTP}
              </span>
            </div>

            {/* OTP Input Card */}
            <div className="glass-panel rounded-xl p-5 border border-sky-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="font-bold text-slate-100 text-base">Enter 6-Digit Transaction OTP</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Required by bank authorization to finalize your {isHotelDirectBooking ? "hotel booking" : (isFlight ? "flight reservation" : "travel booking")}.
                </p>
              </div>

              {/* 6-Digit OTP Field */}
              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center tracking-[1em] text-2xl font-mono font-bold bg-slate-950 border border-sky-400 rounded-xl p-3 text-cyan-300 focus:outline-none focus:ring-4 focus:ring-sky-500/20 shadow-inner"
                />
              </div>

              {/* Error Alert */}
              {otpError && (
                <div className="text-rose-400 text-xs font-semibold bg-rose-950/60 p-2 rounded border border-rose-500/40">
                  {otpError}
                </div>
              )}

              {/* Resend Timer & Helper */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEnteredOtp(DEMO_OTP)}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  ⚡ Auto-Fill Demo OTP ({DEMO_OTP})
                </button>

                <div>
                  {otpTimer > 0 ? (
                    <span>Resend in <strong>{otpTimer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setOtpTimer(30); setEnteredOtp(''); }}
                      className="text-sky-400 font-semibold hover:underline"
                    >
                      Resend New OTP
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Verify & Pay CTA */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCheckoutPhase('details')}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpAndBook}
                disabled={isExecuting || enteredOtp.length < 6}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-black text-sm transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-400/40 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    Verifying OTP & Confirming {isHotelDirectBooking ? "Stay" : "Tickets"}...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    Verify OTP & Complete Booking (₹{grandTotal})
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: RECEIPT & VOUCHER ISSUANCE */}
        {checkoutPhase === 'receipt' && sagaResult && (
          <div className="space-y-4 my-4 animate-fade-in-up">
            <div className={`p-4 rounded-xl border ${
              sagaResult.status === 'CONFIRMED_SUCCESS' 
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {sagaResult.status === 'CONFIRMED_SUCCESS' ? (
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
                <div>
                  <div className="font-bold text-base">
                    {sagaResult.status === 'CONFIRMED_SUCCESS' 
                      ? (isHotelDirectBooking ? '🎉 Hotel Room Confirmed Successfully!' : '🎉 Booking Confirmed Successfully!') 
                      : '🛡️ Transaction Rolled Back & Fully Refunded'}
                  </div>
                  <div className="text-xs opacity-80 font-mono">
                    Transaction ID: {sagaResult.transaction_id || sagaResult.saga_id}
                  </div>
                </div>
              </div>

              {/* Confirmed Details */}
              {sagaResult.status === 'CONFIRMED_SUCCESS' && (
                <div className="space-y-3 text-xs">
                  {/* Transaction Details Box */}
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-sky-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Amount Paid:</span>
                      <div className="font-bold text-emerald-300 font-mono text-sm">₹{sagaResult.amount_paid || grandTotal}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Payment Method:</span>
                      <div className="font-bold text-slate-200">{sagaResult.payment_method || paymentMethod}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Guest / Traveler:</span>
                      <div className="font-bold text-slate-200">{passengerName}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Authorization:</span>
                      <div className="font-bold text-cyan-300">OTP VERIFIED ✓</div>
                    </div>
                  </div>

                  {/* Hotel Stay Voucher Card */}
                  {(isHotelDirectBooking || includeHotel) && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/80 to-cyan-950/80 border border-sky-400/40 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-sky-500/30">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-400" />
                          <span className="font-bold text-slate-100">{selectedHotel?.name || 'Taj Ganges Heritage'}</span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-400 text-slate-950 font-black rounded text-[11px]">
                          ROOM CONFIRMED
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Hotel Voucher Code:</span>
                          <div className="font-mono font-bold text-cyan-300 text-xs">{sagaResult.hotel_confirmation_code || 'HTL_CONF_8829'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Room Category:</span>
                          <div className="font-bold text-slate-200">{selectedHotel?.category || 'Heritage Deluxe'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Check-in Verification:</span>
                          <div className="font-bold text-emerald-300">DigiLocker ID Linked</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flight E-Ticket Confirmation Card (If flight booked) */}
                  {!isHotelDirectBooking && isFlight && (
                    <div className="p-3.5 rounded-xl bg-sky-950/80 border border-sky-400/40 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-sky-500/30">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-sky-400" />
                          <span className="font-bold text-slate-100">{selectedTransit?.name || 'IndiGo 6E-204'}</span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-cyan-400 text-slate-950 font-black rounded text-[11px]">
                          E-TICKET CONFIRMED
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400">Airline PNR:</span>
                          <div className="font-mono font-bold text-cyan-300">{sagaResult.flight_details?.pnr || sagaResult.transit_pnr || '6E-W8X92K'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">E-Ticket No:</span>
                          <div className="font-mono font-bold text-slate-200">{sagaResult.flight_details?.eticket_number || 'ETKT-098-482910481'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Seat Assignment:</span>
                          <div className="font-bold text-emerald-300">{sagaResult.flight_details?.seat_assignment || '12A (Window)'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Terminal & Gate:</span>
                          <div className="font-bold text-slate-200">{sagaResult.flight_details?.terminal || 'T2 (Gate 08A)'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Non-Flight Confirmation Card */}
                  {!isHotelDirectBooking && !isFlight && (
                    <div className="p-3 rounded-lg bg-sky-900/40 border border-sky-500/30 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-cyan-300">Transit PNR: {sagaResult.transit_pnr || 'PNR_TR_8820'}</div>
                        <div className="text-[11px] text-slate-300">Passenger: {passengerName}</div>
                      </div>
                      <span className="px-3 py-1 bg-cyan-400 text-slate-950 font-black rounded text-xs">
                        ✓ TICKET CONFIRMED
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button 
                      onClick={() => alert(`Tax Invoice downloaded for Txn: ${sagaResult.transaction_id || 'TXN_9821'}`)}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-cyan-400" /> Download Tax Invoice (PDF)
                    </button>
                    <button 
                      onClick={() => alert(`Digital vouchers sent to: ${contactEmail}`)}
                      className="flex-1 py-2.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 rounded-lg border border-sky-400/40 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4 text-sky-300" /> Download Vouchers & Passes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex gap-2">
              <button
                onClick={() => setCheckoutPhase('details')}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                Modify / Book Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
