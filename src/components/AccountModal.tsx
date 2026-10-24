import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Truck,
  Sparkles,
} from 'lucide-react';
import {
  AccountRole,
  AccountRegistrationInput,
  UserAccount,
  validateAccountRegistration,
  createUserAccount,
  getRolePermissions,
  isAdminAccount,
} from '../utils/storeLogic';
import { useI18n } from '../utils/i18nContext';
import { BotenzLogo } from './Navbar';

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
  onNavigateAdminInventory?: () => void;
  onAddWholesaleCaseToCart?: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialMode = 'register',
  onAuthSuccess,
  onLogout,
  onApplyVipDiscount,
  onOpenTrackOrder,
  onNavigateAutoship,
  onNavigateAdminInventory,
}) => {
  const { t } = useI18n();
  const [authTab, setAuthTab] = useState<'register' | 'login'>(initialMode);

  // Simple registration state (no account type selector; phone/city/address/postalCode only asked at checkout)
  const [regForm, setRegForm] = useState<AccountRegistrationInput>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
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
      accountId: 'KH-ADM-0001',
      fullName: 'Kampot Harvest Admin',
      email: 'admin@kampotharvest.com',
      role: 'admin',
      status: 'active',
      verified: true,
      permissions: getRolePermissions('admin', 'active'),
      discountCode: 'HARVEST15',
      createdAt: '2026-10-01T08:00:00.000Z',
    },
    {
      accountId: 'KH-USR-1001',
      fullName: 'Sokha Chan',
      email: 'sokha.chan@example.com',
      role: 'user',
      status: 'active',
      verified: true,
      permissions: getRolePermissions('user', 'active'),
      discountCode: 'HARVEST15',
      createdAt: '2026-10-15T08:00:00.000Z',
    },
  ]);

  useEffect(() => {
    if (isOpen && !currentUser) {
      setAuthTab(initialMode);
      setFieldErrors({});
      setGeneralError(null);
      setSuccessBanner(null);
    }
  }, [isOpen, initialMode, currentUser]);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessBanner(null);

    const payload: AccountRegistrationInput = {
      ...regForm,
      role: 'user',
    };

    const clientValidation = validateAccountRegistration(payload);
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
        body: JSON.stringify(payload),
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
      const localResult = createUserAccount(payload, localAccounts);
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        currentUser
          ? 'Member Account Profile'
          : authTab === 'register'
          ? 'Create Account'
          : 'Sign In'
      }
      className="fixed inset-0 z-50 w-screen h-screen bg-[#F2F0E3] text-[#384A22] overflow-y-auto flex flex-col"
    >
      {/* Clean Full-Screen Top Navigation Bar */}
      <header className="w-full border-b border-[#384A22]/10 bg-[#F2F0E3]/95 backdrop-blur-xs sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-8 h-[76px] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account page"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-[#384A22] hover:text-[#8B6D3B] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden min-[380px]:inline">Back to Store</span>
            <span className="min-[380px]:hidden">Back</span>
          </button>

          <BotenzLogo variant="green" className="h-[38px] min-[380px]:h-[44px] sm:h-[48px] w-auto object-contain" />

          <div className="w-[100px] flex justify-end">
            {currentUser && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B83A2A] hover:underline cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Centered Content Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-lg space-y-6">
          {successBanner && (
            <div
              role="status"
              className="flex items-center gap-2.5 p-4 rounded-xl bg-[#384A22]/10 border border-[#384A22]/25 text-[#384A22] text-sm font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 text-[#384A22] shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {generalError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#B83A2A]/10 border border-[#B83A2A]/30 text-[#B83A2A] text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {currentUser ? (
            /* ================================================================
             * SIMPLE FULL-SCREEN MEMBER PROFILE (NO ACCOUNT TYPE)
             * ============================================================== */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#384A22]/12 shadow-sm space-y-6">
              {/* Default Profile Picture + Member Identity */}
              <div className="flex items-center gap-4 pb-6 border-b border-[#384A22]/10">
                <div
                  data-testid="profile-default-avatar"
                  className="w-16 h-16 rounded-full bg-[#384A22] text-[#F2F0E3] flex items-center justify-center shrink-0 shadow-xs"
                  title="Default Profile Picture"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-9 h-9"
                    aria-hidden="true"
                  >
                    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[#384A22]/65 font-mono">
                    {currentUser.accountId}
                  </div>
                  <h1 className="text-xl font-bold text-[#384A22] truncate">
                    {currentUser.fullName}
                  </h1>
                  <p className="text-xs text-[#384A22]/75 truncate">
                    {currentUser.email}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold inline-flex items-center gap-1 text-[#384A22]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Active</span>
                  </span>
                </div>
              </div>

              {/* Simple Member Actions */}
              <div className="space-y-2.5">
                {isAdminAccount(currentUser) && onNavigateAdminInventory && (
                  <button
                    type="button"
                    data-testid="profile-open-admin-inventory-btn"
                    onClick={() => {
                      onClose();
                      onNavigateAdminInventory();
                    }}
                    className="w-full p-4 rounded-2xl bg-[#384A22] text-[#F2F0E3] hover:bg-[#2B3B18] flex items-center justify-between transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#9AB87A]" />
                      <div>
                        <span className="text-sm font-bold block">
                          Admin Inventory Overview
                        </span>
                        <span className="text-xs text-[#F2F0E3]/75">
                          View and manage full business product inventory
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#9AB87A]">Open →</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onApplyVipDiscount();
                    onClose();
                  }}
                  className="w-full p-4 rounded-2xl bg-[#F2F0E3]/70 hover:bg-[#F2F0E3] flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#8B6D3B]" />
                    <div>
                      <span className="text-sm font-bold text-[#384A22] block">
                        15% VIP Discount ({currentUser.discountCode})
                      </span>
                      <span className="text-xs text-[#384A22]/70">
                        Apply to your shopping bag
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#8B6D3B]">Apply →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateAutoship();
                  }}
                  className="w-full p-4 rounded-2xl bg-[#F2F0E3]/70 hover:bg-[#F2F0E3] flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#384A22]" />
                    <div>
                      <span className="text-sm font-bold text-[#384A22] block">
                        Autoship &amp; Save
                      </span>
                      <span className="text-xs text-[#384A22]/70">
                        Manage recurring jar deliveries
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#384A22]">Open →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTrackOrder();
                  }}
                  className="w-full p-4 rounded-2xl bg-[#F2F0E3]/70 hover:bg-[#F2F0E3] flex items-center justify-between transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#8B6D3B]" />
                    <div>
                      <span className="text-sm font-bold text-[#384A22] block">
                        Track Order Status
                      </span>
                      <span className="text-xs text-[#384A22]/70">
                        Check live delivery progress
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#384A22]">Track →</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#384A22]/10 flex items-center justify-between">
                <span className="text-xs text-[#384A22]/60">
                  Delivery address &amp; phone are asked only at checkout.
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#B83A2A]/35 text-[#B83A2A] hover:bg-[#B83A2A]/10 text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================================================================
             * SIMPLE FULL-SCREEN SIGN IN / CREATE ACCOUNT FORM (NO ACCOUNT TYPE)
             * ============================================================== */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#384A22]/12 shadow-sm space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-[#384A22]">
                  {authTab === 'login' ? 'Sign In' : 'Create Account'}
                </h1>
                <p className="text-xs text-[#384A22]/70">
                  {authTab === 'login'
                    ? 'Sign in to access your 15% VIP discount and Autoship perks.'
                    : 'Quick sign-up — delivery address and phone are only asked when you order.'}
                </p>
              </div>

              {/* Simple Tab Toggle */}
              <div className="flex p-1 bg-[#F2F0E3] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setGeneralError(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    authTab === 'login'
                      ? 'bg-[#384A22] text-[#F2F0E3]'
                      : 'text-[#384A22] hover:text-[#384A22]/80'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setGeneralError(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    authTab === 'register'
                      ? 'bg-[#384A22] text-[#F2F0E3]'
                      : 'text-[#384A22] hover:text-[#384A22]/80'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authTab === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                  {/* Full Name */}
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
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F2F0E3]/40 border border-[#384A22]/20 text-base sm:text-sm focus:outline-none focus:border-[#384A22]"
                    />
                    {fieldErrors.fullName && (
                      <p className="text-xs text-[#B83A2A] mt-1">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email Address */}
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
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F2F0E3]/40 border border-[#384A22]/20 text-base sm:text-sm focus:outline-none focus:border-[#384A22]"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-[#B83A2A] mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="Min. 8 chars"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F2F0E3]/40 border border-[#384A22]/20 text-base sm:text-sm focus:outline-none focus:border-[#384A22]"
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
                        placeholder="Repeat password"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F2F0E3]/40 border border-[#384A22]/20 text-base sm:text-sm focus:outline-none focus:border-[#384A22]"
                      />
                      {fieldErrors.confirmPassword && (
                        <p className="text-xs text-[#B83A2A] mt-1">
                          {fieldErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#8B6D3B] hover:bg-[#765B2F] disabled:opacity-60 text-[#F2F0E3] font-semibold text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F2F0E3]/40 border border-[#384A22]/20 text-base sm:text-sm focus:outline-none focus:border-[#384A22]"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F2F0E3]/40 border border-[#384A22]/20 text-base sm:text-sm focus:outline-none focus:border-[#384A22]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#384A22]/70">
                    <span>Demo accounts:</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        data-testid="fill-user-demo-btn"
                        onClick={() => {
                          setLoginEmail('sokha.chan@example.com');
                          setLoginPassword('Password123');
                          setGeneralError(null);
                        }}
                        className="font-semibold text-[#8B6D3B] underline cursor-pointer"
                      >
                        Normal User Demo
                      </button>
                      <button
                        type="button"
                        data-testid="fill-admin-demo-btn"
                        onClick={() => {
                          setLoginEmail('admin@kampotharvest.com');
                          setLoginPassword('AdminHarvest2026');
                          setGeneralError(null);
                        }}
                        className="font-semibold text-[#384A22] underline cursor-pointer"
                      >
                        Admin Demo
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#384A22] hover:bg-[#2B3B18] disabled:opacity-60 text-[#F2F0E3] font-semibold text-sm shadow-sm transition-colors cursor-pointer"
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
