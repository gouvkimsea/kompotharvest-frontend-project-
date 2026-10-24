import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, Search, X, AlertCircle } from 'lucide-react';
import {
  TrackedOrder,
  validateOrderNumber,
  lookupOrderStatus,
} from '../utils/storeLogic';
import { useI18n } from '../utils/i18nContext';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

const SAMPLE_ORDERS = ['KH-2026-1042', 'KH-2026-8831', 'KH-2026-5190'];

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
}) => {
  const { t, formatPrice } = useI18n();
  const [orderInput, setOrderInput] = useState<string>(initialOrderNumber);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    if (isOpen && initialOrderNumber) {
      setOrderInput(initialOrderNumber);
      void performLookup(initialOrderNumber);
    }
  }, [isOpen, initialOrderNumber]);

  if (!isOpen) return null;

  const performLookup = async (rawOrderNum: string) => {
    const validation = validateOrderNumber(rawOrderNum);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Please enter a valid order number.');
      setTrackedOrder(null);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(validation.normalized)}`
      );
      const data = await response.json();
      if (response.ok && data.found && data.order) {
        setTrackedOrder(data.order as TrackedOrder);
        setIsLoading(false);
        return;
      }
      if (data.error) {
        setErrorMsg(data.error);
        setTrackedOrder(null);
        setIsLoading(false);
        return;
      }
    } catch {
      // Fallback to local storeLogic lookup if offline
    }

    const fallback = lookupOrderStatus(validation.normalized);
    if (fallback.found && fallback.order) {
      setTrackedOrder(fallback.order);
      setErrorMsg(null);
    } else {
      setTrackedOrder(null);
      setErrorMsg(fallback.error || 'Order not found.');
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performLookup(orderInput);
  };

  const handleSelectSample = (sampleId: string) => {
    setOrderInput(sampleId);
    void performLookup(sampleId);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('track_modal_title', 'Track Your Order')}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#F2F0E3] text-[#384A22] rounded-[28px] shadow-2xl border border-[#384A22]/15 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-[#384A22] text-[#F2F0E3] px-4 min-[380px]:px-6 sm:px-8 py-4 sm:py-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F2F0E3]/12 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#9AB87A]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                {t('track_modal_title', 'Track Your Order')}
              </h2>
              <p className="text-xs sm:text-sm text-[#F2F0E3]/80 mt-0.5">
                {t(
                  'track_modal_subtitle',
                  'Enter your Kampot Harvest order number to view live roasting and delivery status.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Track Order modal"
            className="p-2 rounded-full hover:bg-white/15 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 min-[380px]:p-6 sm:p-8 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <label
              htmlFor="order-number-input"
              className="block text-xs font-bold uppercase tracking-wider text-[#384A22]/80"
            >
              {t('track_input_label', 'Order Number')}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#384A22]/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="order-number-input"
                  type="text"
                  value={orderInput}
                  onChange={(e) => {
                    setOrderInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder={t('track_input_placeholder', 'e.g. KH-2026-1042')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[#384A22]/25 text-base sm:text-sm font-medium text-[#384A22] placeholder:text-[#384A22]/40 focus:outline-none focus:border-[#384A22] tabular-nums"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-[#8B6D3B] hover:bg-[#765B2F] disabled:opacity-60 text-[#F2F0E3] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isLoading ? 'Checking...' : t('track_btn_check', 'Check Status')}
              </button>
            </div>

            {/* Quick-Fill Sample Order Numbers */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#384A22]/75">
              <span>{t('track_sample_label', 'Try sample order:')}</span>
              {SAMPLE_ORDERS.map((sampleId) => (
                <button
                  key={sampleId}
                  type="button"
                  onClick={() => handleSelectSample(sampleId)}
                  className={`px-2.5 py-1 rounded-lg font-mono tabular-nums transition-colors cursor-pointer ${
                    trackedOrder?.orderId === sampleId
                      ? 'bg-[#384A22] text-[#F2F0E3] font-semibold'
                      : 'bg-[#E5E2CE] text-[#384A22] hover:bg-[#384A22]/15'
                  }`}
                >
                  {sampleId}
                </button>
              ))}
            </div>

            {/* Validation / Lookup Error Message */}
            {errorMsg && (
              <div
                role="alert"
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#B83A2A]/10 border border-[#B83A2A]/30 text-[#B83A2A] text-xs sm:text-sm font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* Real-Time Order Status Result */}
          {trackedOrder && (
            <div className="space-y-6 pt-2 border-t border-[#384A22]/12">
              {/* Top Status Overview Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#384A22]/10">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#384A22]/70 tabular-nums">
                      <span className="font-mono font-bold text-[#384A22] whitespace-nowrap">
                        #{trackedOrder.orderId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="whitespace-nowrap">Placed {trackedOrder.createdAt}</span>
                      <span aria-hidden="true">·</span>
                      <span className="whitespace-nowrap">Tracking {trackedOrder.trackingCode}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#384A22] mt-1.5 flex items-center gap-2">
                      {trackedOrder.status === 'delivered' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#384A22] shrink-0" />
                      ) : (
                        <Package className="w-5 h-5 text-[#8B6D3B] shrink-0" />
                      )}
                      <span>{trackedOrder.statusLabel}</span>
                    </h3>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-xs text-[#384A22]/65 block whitespace-nowrap">
                      {t('track_est_delivery', 'Estimated Delivery')}
                    </span>
                    <span className="text-sm font-bold text-[#8B6D3B] tabular-nums whitespace-nowrap">
                      {trackedOrder.estimatedDelivery}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#384A22]/60 block">
                      {t('track_current_loc', 'Current Location')}
                    </span>
                    <span className="font-semibold text-[#384A22] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#8B6D3B] shrink-0" />
                      {trackedOrder.currentLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#384A22]/60 block">
                      {t('track_carrier', 'Eco-Carrier')}
                    </span>
                    <span className="font-semibold text-[#384A22] mt-0.5 block">
                      {trackedOrder.carrier}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#384A22]/60 block">
                      {t('track_Destination', 'Destination')}
                    </span>
                    <span className="font-semibold text-[#384A22] mt-0.5 block tabular-nums">
                      {trackedOrder.customer.name} · {trackedOrder.customer.city} (
                      {trackedOrder.customer.postalCode})
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Stage Delivery Progress Timeline */}
              <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12">
                <h4 className="text-sm font-bold text-[#384A22] mb-4">
                  {t('track_timeline_title', 'Real-Time Delivery Timeline')}
                </h4>
                <ol className="space-y-4">
                  {trackedOrder.timeline.map((step, index) => {
                    const isLast = index === trackedOrder.timeline.length - 1;
                    return (
                      <li key={step.stage} className="relative flex items-start gap-3.5">
                        {!isLast && (
                          <div
                            aria-hidden="true"
                            className={`absolute left-[13px] top-7 bottom-[-16px] w-[2px] ${
                              step.completed ? 'bg-[#384A22]' : 'bg-[#384A22]/15'
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            step.current
                              ? 'bg-[#8B6D3B] text-[#F2F0E3] ring-4 ring-[#8B6D3B]/20'
                              : step.completed
                              ? 'bg-[#384A22] text-[#F2F0E3]'
                              : 'bg-[#E5E2CE] text-[#384A22]/50'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-1">
                          <div>
                            <p
                              className={`text-sm font-bold ${
                                step.current
                                  ? 'text-[#8B6D3B]'
                                  : step.completed
                                  ? 'text-[#384A22]'
                                  : 'text-[#384A22]/50'
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-xs text-[#384A22]/70">{step.location}</p>
                          </div>
                          <span className="text-xs text-[#384A22]/65 tabular-nums shrink-0">
                            {step.timestamp}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Itemized Order Summary */}
              <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12">
                <h4 className="text-sm font-bold text-[#384A22] mb-3">
                  {t('track_items_title', 'Order Summary')}
                </h4>
                <div className="divide-y divide-[#384A22]/10 text-xs sm:text-sm">
                  {trackedOrder.items.map((item, idx) => (
                    <div
                      key={`${item.name}-${idx}`}
                      className="py-2.5 flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="font-semibold text-[#384A22]">{item.name}</span>
                        {item.variantLabel && (
                          <span className="text-[#384A22]/65"> · {item.variantLabel}</span>
                        )}
                        <span className="text-[#384A22]/65 tabular-nums">
                          {' '}
                          × {item.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-[#384A22] tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 flex items-center justify-between font-bold text-[#384A22]">
                    <span>{t('cart_total', 'Total')}</span>
                    <span className="text-base tabular-nums">
                      {formatPrice(trackedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
