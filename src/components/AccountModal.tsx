import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  Award,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogOut,
  X,
  Truck,
  Sparkles,
} from 'lucide-react';
import {
  AccountRole,
  AccountRegistrationInput,
  UserAccount,
  validateAccountRegistration,
  createUserAccount,
  verifyUserAccount,
  hasAccountPermission,
} from '../utils/storeLogic';
import { useI18n } from '../utils/i18nContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  initialMode?: 'register' | 'login';
  initialRole?: AccountRole;
  onAuthSuccess: (account: UserAccount, token?: string) => void;
  onLogout: () => void;
  onApplyVipDiscount: () => void;
  onOpenTrackOrder: () => void;
  onNavigateAutoship: () => void;
  onAddWholesaleCaseToCart: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialMode = 'register',
  initialRole = 'customer',
  onAuthSuccess,
  onLogout,
  onApplyVipDiscount,
  onOpenTrackOrder,
  onNavigateAutoship,
  onAddWholesaleCaseToCart,
}) => {
  const { t, formatPrice } = useI18n();
  const [authTab, setAuthTab] = useState<'register' | 'login'>(initialMode);

  // Registration state
  const [regForm, setRegForm] = useState<AccountRegistrationInput>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
    companyName: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AccountRegistrationInput, string>>
  >({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Local registry fallback for offline/client-side continuity
  const [localAccounts, setLocalAccounts] = useState<UserAccount[]>([
    {
      accountId: 'KH-USR-1001',
      fullName: 'Sokha Chan',
      email: 'sokha.chan@example.com',
      phone: '+855 12 345 678',
      role: 'customer',
      status: 'active',
      verified: true,
      permissions: [
        'store:shop',
        'vip:first_order_discount',
        'autoship:manage',
        'orders:track',
      ],
      address: 'Street 240, Daun Penh',
      city: 'Phnom Penh',
      postalCode: '12000',
      discountCode: 'HARVEST15',
      createdAt: '2026-10-15T08:00:00.000Z',
    },
  ]);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && !currentUser) {
      setAuthTab(initialMode);
      setRegForm((prev) => ({ ...prev, role: initialRole }));
      setFieldErrors({});
      setGeneralError(null);
      setSuccessBanner(null);
    }
  }, [isOpen, initialMode, initialRole, currentUser]);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessBanner(null);

    const clientValidation = validateAccountRegistration(regForm);
    if (!clientValidation.valid) {
      setFieldErrors(clientValidation.errors);
      setGeneralError('Please correct the highlighted fields below.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setGeneralError(data.error || 'Unable to create account.');
        setIsSubmitting(false);
        return;
      }

      const createdAccount = data.account as UserAccount;
      setLocalAccounts((prev) => [...prev, createdAccount]);
      setSuccessBanner(
        data.message || 'Account created! Welcome to Kampot Harvest Co.'
      );
      onAuthSuccess(createdAccount, data.token);
    } catch {
      // Fallback to local storeLogic account creation
      const localResult = createUserAccount(regForm, localAccounts);
      if (!localResult.success || !localResult.account) {
        setFieldErrors(localResult.fieldErrors || {});
        setGeneralError(localResult.error || 'Unable to create account.');
        setIsSubmitting(false);
        return;
      }
      setLocalAccounts((prev) => [...prev, localResult.account!]);
      setSuccessBanner('Account created! Welcome to Kampot Harvest Co.');
      onAuthSuccess(localResult.account);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessBanner(null);

    if (!loginEmail.trim() || !loginPassword) {
      setGeneralError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setGeneralError(data.error || 'Invalid email or password.');
        setIsSubmitting(false);
        return;
      }

      setSuccessBanner(data.message || 'Signed in!');
      onAuthSuccess(data.account as UserAccount, data.token);
    } catch {
      const match = localAccounts.find(
        (a) => a.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );
      if (!match) {
        setGeneralError('Invalid email or password.');
        setIsSubmitting(false);
        return;
      }
      onAuthSuccess(match);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyWholesale = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: currentUser.accountId }),
      });
      const data = await response.json();
      if (response.ok && data.account) {
        setSuccessBanner(
          data.message ||
            'Business verification complete! Wholesale bulk ordering unlocked.'
        );
        onAuthSuccess(data.account as UserAccount);
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Fallback
    }

    const verifiedAcc = verifyUserAccount(currentUser);
    setSuccessBanner(
      'Business verification complete! Wholesale bulk ordering unlocked.'
    );
    onAuthSuccess(verifiedAcc);
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          currentUser
            ? 'Member Account Profile'
            : authTab === 'register'
            ? 'Create Kampot Harvest Account'
            : 'Sign In to Kampot Harvest'
        }
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#F2F0E3] text-[#384A22] rounded-[28px] shadow-2xl border border-[#384A22]/15 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-[#384A22] text-[#F2F0E3] px-6 sm:px-8 py-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F2F0E3]/12 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-[#9AB87A]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {currentUser
                  ? `Welcome, ${currentUser.fullName}`
                  : authTab === 'register'
                  ? 'Create Your Kampot Harvest Account'
                  : 'Sign In to Your Account'}
              </h2>
              <p className="text-xs sm:text-sm text-[#F2F0E3]/80 mt-0.5">
                {currentUser
                  ? `Account ID: ${currentUser.accountId} · ${
                      currentUser.role === 'wholesale'
                        ? 'Wholesale B2B Partner'
                        : currentUser.role === 'affiliate'
                        ? 'Affiliate Creator Partner'
                        : 'VIP Club Member'
                    }`
                  : 'Unlock 15% VIP savings, manage Autoship deliveries, or register as a Wholesale / Affiliate partner.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Account modal"
            className="p-2 rounded-full hover:bg-white/15 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6">
          {successBanner && (
            <div
              role="status"
              className="flex items-center gap-2.5 p-4 rounded-xl bg-[#384A22]/10 border border-[#384A22]/25 text-[#384A22] text-xs sm:text-sm font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 text-[#384A22] shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {generalError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#B83A2A]/10 border border-[#B83A2A]/30 text-[#B83A2A] text-xs sm:text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {currentUser ? (
            /* ================================================================
             * AUTHENTICATED ACCOUNT DASHBOARD
             * ============================================================== */
            <div className="space-y-6">
              {/* Account Overview & Status Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#384A22]/10">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#384A22]/70 tabular-nums">
                      <span className="font-mono font-bold text-[#384A22]">
                        {currentUser.accountId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{currentUser.email}</span>
                      <span aria-hidden="true">·</span>
                      <span>{currentUser.phone}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#384A22] mt-1">
                      {currentUser.fullName}
                      {currentUser.companyName ? ` — ${currentUser.companyName}` : ''}
                    </h3>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-xs text-[#384A22]/60 block">Account Status</span>
                    <span
                      className={`text-sm font-bold inline-flex items-center gap-1.5 ${
                        currentUser.status === 'active'
                          ? 'text-[#384A22]'
                          : 'text-[#8B6D3B]'
                      }`}
                    >
                      {currentUser.status === 'active' ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-[#384A22]" />
                          <span>Active &amp; Verified</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-[#8B6D3B]" />
                          <span>Pending Verification</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Role & Permissions Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#384A22]/60 block">Account Type</span>
                    <span className="font-semibold text-[#384A22] mt-0.5 capitalize block">
                      {currentUser.role} Account
                    </span>
                  </div>
                  <div>
                    <span className="text-[#384A22]/60 block">VIP Welcome Code</span>
                    <span className="font-mono font-bold text-[#8B6D3B] mt-0.5 block">
                      {currentUser.discountCode} (15% OFF)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#384A22]/60 block">Saved Delivery City</span>
                    <span className="font-semibold text-[#384A22] mt-0.5 block">
                      {currentUser.city
                        ? `${currentUser.city}${
                            currentUser.postalCode ? ` (${currentUser.postalCode})` : ''
                          }`
                        : 'Phnom Penh (Default)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wholesale Pending Verification / Restricted B2B Ordering Section */}
              {currentUser.role === 'wholesale' && (
                <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-[#384A22] flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#8B6D3B]" />
                        <span>Wholesale B2B Partner Portal ({currentUser.companyName})</span>
                      </h4>
                      <p className="text-xs text-[#384A22]/75 mt-1">
                        {hasAccountPermission(currentUser, 'wholesale:bulk_order')
                          ? 'Your business account is verified. You have full access to B2B Master Case ordering (24× 250g Glass Jars at 25% wholesale discount).'
                          : 'Wholesale bulk ordering is restricted until your business registration is verified.'}
                      </p>
                    </div>
                  </div>

                  {!hasAccountPermission(currentUser, 'wholesale:bulk_order') ? (
                    <div className="p-4 rounded-xl bg-[#F2F0E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-[#384A22]">
                        <p className="font-bold">Action Required: Business Verification</p>
                        <p className="text-[#384A22]/75">
                          Verify {currentUser.companyName} to transition status from Pending to
                          Active and unlock wholesale case pricing.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleVerifyWholesale}
                        className="px-5 py-2.5 rounded-xl bg-[#384A22] hover:bg-[#2B3B18] text-[#F2F0E3] text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {isSubmitting ? 'Verifying...' : 'Complete Business Verification'}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#F2F0E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#384A22]">
                          Wholesale Master Case (24× 250g Glass Jars)
                        </p>
                        <p className="text-xs text-[#384A22]/75 tabular-nums">
                          12× Honey Butter + 12× Chili Lime · Partner Rate: {formatPrice(360)}{' '}
                          (Retail {formatPrice(480)})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onAddWholesaleCaseToCart();
                          onClose();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Add Wholesale Case to Bag
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Affiliate Creator Referral Hub */}
              {currentUser.role === 'affiliate' &&
                hasAccountPermission(currentUser, 'affiliate:referrals') && (
                  <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12 space-y-3">
                    <h4 className="text-base font-bold text-[#384A22] flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#8B6D3B]" />
                      <span>Affiliate Creator Referral Hub (Gift $20, Get $20)</span>
                    </h4>
                    <p className="text-xs text-[#384A22]/75">
                      Share your personal Kampot Harvest referral code with your audience to
                      grant 15% off and earn 20% commission on every referred order.
                    </p>
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F2F0E3]">
                      <span className="font-mono font-bold text-sm text-[#384A22] tabular-nums">
                        {currentUser.referralCode || 'KH-REF-VIP1001'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard && currentUser.referralCode) {
                            void navigator.clipboard.writeText(currentUser.referralCode);
                          }
                          setCopiedCode(true);
                          window.setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-[#384A22] text-[#F2F0E3] text-xs font-semibold cursor-pointer whitespace-nowrap"
                      >
                        {copiedCode ? 'Copied ✓' : 'Copy Referral Code'}
                      </button>
                    </div>
                  </div>
                )}

              {/* Quick Member Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onApplyVipDiscount();
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#384A22]/12 hover:border-[#384A22]/40 text-left transition-colors cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-[#8B6D3B] mb-1.5" />
                  <span className="text-sm font-bold text-[#384A22] block">
                    Apply 15% VIP Discount
                  </span>
                  <span className="text-xs text-[#384A22]/70">
                    Activate code {currentUser.discountCode} in bag
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateAutoship();
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#384A22]/12 hover:border-[#384A22]/40 text-left transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-[#384A22] mb-1.5" />
                  <span className="text-sm font-bold text-[#384A22] block">
                    Manage Autoship &amp; Save
                  </span>
                  <span className="text-xs text-[#384A22]/70">
                    Configure monthly jar deliveries
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTrackOrder();
                  }}
                  className="p-4 rounded-2xl bg-white border border-[#384A22]/12 hover:border-[#384A22]/40 text-left transition-colors cursor-pointer"
                >
                  <Truck className="w-5 h-5 text-[#8B6D3B] mb-1.5" />
                  <span className="text-sm font-bold text-[#384A22] block">
                    Track My Orders
                  </span>
                  <span className="text-xs text-[#384A22]/70">
                    Check live Kampot roastery status
                  </span>
                </button>
              </div>

              {/* Sign Out Footer */}
              <div className="pt-3 border-t border-[#384A22]/12 flex items-center justify-between">
                <span className="text-xs text-[#384A22]/65">
                  Checkout forms automatically pre-fill with your saved profile details.
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#B83A2A]/40 text-[#B83A2A] hover:bg-[#B83A2A]/10 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================================================================
             * REGISTRATION & LOGIN FORMS
             * ============================================================== */
            <div className="space-y-6">
              {/* Segmented Tab Switcher: Create Account | Sign In */}
              <div className="flex p-1 bg-[#E5E2CE] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setGeneralError(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    authTab === 'register'
                      ? 'bg-[#384A22] text-[#F2F0E3] shadow-xs'
                      : 'text-[#384A22] hover:text-[#384A22]/80'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setGeneralError(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    authTab === 'login'
                      ? 'bg-[#384A22] text-[#F2F0E3] shadow-xs'
                      : 'text-[#384A22] hover:text-[#384A22]/80'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {authTab === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                  {/* Account Role Selector */}
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#384A22]/80 mb-2">
                      Select Account Type *
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {(
                        [
                          {
                            id: 'customer',
                            title: 'VIP Customer',
                            sub: '15% off + Autoship perks',
                          },
                          {
                            id: 'wholesale',
                            title: 'Wholesale Partner',
                            sub: 'B2B bulk case pricing',
                          },
                          {
                            id: 'affiliate',
                            title: 'Affiliate Creator',
                            sub: 'Referral code & rewards',
                          },
                        ] as const
                      ).map((roleOption) => {
                        const isSelected = regForm.role === roleOption.id;
                        return (
                          <button
                            key={roleOption.id}
                            type="button"
                            onClick={() => {
                              setRegForm({ ...regForm, role: roleOption.id });
                              setFieldErrors((prev) => ({ ...prev, companyName: undefined }));
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#384A22] text-[#F2F0E3] border-[#384A22]'
                                : 'bg-white text-[#384A22] border-[#384A22]/20 hover:border-[#384A22]/50'
                            }`}
                          >
                            <span className="text-xs font-bold block">{roleOption.title}</span>
                            <span
                              className={`text-[11px] block mt-0.5 ${
                                isSelected ? 'text-[#F2F0E3]/80' : 'text-[#384A22]/65'
                              }`}
                            >
                              {roleOption.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="acc-full-name"
                        className="block text-xs font-bold uppercase mb-1"
                      >
                        {t('form_full_name', 'Full Name')} *
                      </label>
                      <input
                        id="acc-full-name"
                        type="text"
                        value={regForm.fullName}
                        onChange={(e) => {
                          setRegForm({ ...regForm, fullName: e.target.value });
                          if (fieldErrors.fullName) {
                            setFieldErrors({ ...fieldErrors, fullName: undefined });
                          }
                        }}
                        placeholder="e.g. Dara Pich"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                      />
                      {fieldErrors.fullName && (
                        <p className="text-xs text-[#B83A2A] mt-1">{fieldErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="acc-email"
                        className="block text-xs font-bold uppercase mb-1"
                      >
                        {t('form_email', 'Email Address')} *
                      </label>
                      <input
                        id="acc-email"
                        type="email"
                        value={regForm.email}
                        onChange={(e) => {
                          setRegForm({ ...regForm, email: e.target.value });
                          if (fieldErrors.email) {
                            setFieldErrors({ ...fieldErrors, email: undefined });
                          }
                        }}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-[#B83A2A] mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Conditional Wholesale Company Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="acc-phone"
                        className="block text-xs font-bold uppercase mb-1"
                      >
                        {t('form_phone', 'Phone Number')} *
                      </label>
                      <input
                        id="acc-phone"
                        type="tel"
                        value={regForm.phone}
                        onChange={(e) => {
                          setRegForm({ ...regForm, phone: e.target.value });
                          if (fieldErrors.phone) {
                            setFieldErrors({ ...fieldErrors, phone: undefined });
                          }
                        }}
                        placeholder="+855 12 345 678"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                      />
                      {fieldErrors.phone && (
                        <p className="text-xs text-[#B83A2A] mt-1">{fieldErrors.phone}</p>
                      )}
                    </div>

                    {regForm.role === 'wholesale' ? (
                      <div>
                        <label
                          htmlFor="acc-company"
                          className="block text-xs font-bold uppercase mb-1"
                        >
                          Business / Company Name *
                        </label>
                        <input
                          id="acc-company"
                          type="text"
                          value={regForm.companyName || ''}
                          onChange={(e) => {
                            setRegForm({ ...regForm, companyName: e.target.value });
                            if (fieldErrors.companyName) {
                              setFieldErrors({ ...fieldErrors, companyName: undefined });
                            }
                          }}
                          placeholder="e.g. Mekong Organic Grocers"
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                        />
                        {fieldErrors.companyName && (
                          <p className="text-xs text-[#B83A2A] mt-1">
                            {fieldErrors.companyName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label
                          htmlFor="acc-city"
                          className="block text-xs font-bold uppercase mb-1"
                        >
                          City (Optional)
                        </label>
                        <input
                          id="acc-city"
                          type="text"
                          value={regForm.city || ''}
                          onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                          placeholder="e.g. Phnom Penh, Siem Reap"
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="acc-password"
                        className="block text-xs font-bold uppercase mb-1"
                      >
                        Password *
                      </label>
                      <input
                        id="acc-password"
                        type="password"
                        value={regForm.password}
                        onChange={(e) => {
                          setRegForm({ ...regForm, password: e.target.value });
                          if (fieldErrors.password) {
                            setFieldErrors({ ...fieldErrors, password: undefined });
                          }
                        }}
                        placeholder="Min. 8 chars (letter & number)"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                      />
                      {fieldErrors.password && (
                        <p className="text-xs text-[#B83A2A] mt-1">{fieldErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="acc-confirm-password"
                        className="block text-xs font-bold uppercase mb-1"
                      >
                        Confirm Password *
                      </label>
                      <input
                        id="acc-confirm-password"
                        type="password"
                        value={regForm.confirmPassword}
                        onChange={(e) => {
                          setRegForm({ ...regForm, confirmPassword: e.target.value });
                          if (fieldErrors.confirmPassword) {
                            setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                          }
                        }}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                      />
                      {fieldErrors.confirmPassword && (
                        <p className="text-xs text-[#B83A2A] mt-1">
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Optional Delivery Address & Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="acc-address"
                        className="block text-xs font-bold uppercase mb-1"
                      >
                        Delivery Address (Optional)
                      </label>
                      <input
                        id="acc-address"
                        type="text"
                        value={regForm.address || ''}
                        onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                        placeholder="Street, Sangkat / District"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="acc-postal"
                        className="block text-xs font-bold uppercase mb-1"
                      >
                        Postal Code (Optional)
                      </label>
                      <input
                        id="acc-postal"
                        type="text"
                        value={regForm.postalCode || ''}
                        onChange={(e) => {
                          setRegForm({ ...regForm, postalCode: e.target.value });
                          if (fieldErrors.postalCode) {
                            setFieldErrors({ ...fieldErrors, postalCode: undefined });
                          }
                        }}
                        placeholder="12000"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22] tabular-nums"
                      />
                      {fieldErrors.postalCode && (
                        <p className="text-xs text-[#B83A2A] mt-1">{fieldErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] disabled:opacity-60 text-[#F2F0E3] font-semibold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    {isSubmitting
                      ? 'Creating Account...'
                      : regForm.role === 'wholesale'
                      ? 'Register Wholesale Partner Account'
                      : regForm.role === 'affiliate'
                      ? 'Create Affiliate Partner Account'
                      : 'Create VIP Account & Unlock 15% Off'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-bold uppercase mb-1"
                    >
                      {t('form_email', 'Email Address')} *
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="sokha.chan@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold uppercase mb-1"
                    >
                      Password *
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#384A22]/25 text-sm focus:outline-none focus:border-[#384A22]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#384A22]/75">
                    <span>Demo member account available:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('sokha.chan@example.com');
                        setLoginPassword('Password123');
                        setGeneralError(null);
                      }}
                      className="font-semibold text-[#8B6D3B] underline cursor-pointer"
                    >
                      Fill Demo Credentials
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#384A22] hover:bg-[#2B3B18] disabled:opacity-60 text-[#F2F0E3] font-semibold text-sm shadow-md transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
