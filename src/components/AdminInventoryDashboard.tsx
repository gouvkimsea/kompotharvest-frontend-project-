import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  ArrowUpDown,
  ShieldAlert,
  Plus,
  Minus,
  RotateCcw,
  LogOut,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  UserAccount,
  isAdminAccount,
  InventoryItem,
  InventoryStats,
  StockMovementRecord,
  createInitialInventory,
  calculateInventoryStats,
  adjustInventoryStock,
} from '../utils/storeLogic';
import { useI18n } from '../utils/i18nContext';
import { SmartImage } from './SmartImage';
import { BotenzLogo } from './Navbar';

interface AdminInventoryDashboardProps {
  currentUser: UserAccount | null;
  authToken: string | null;
  onBackToStore: () => void;
  onOpenSignIn: () => void;
  onLogout: () => void;
}

type SortField = 'name_asc' | 'name_desc' | 'stock_asc' | 'stock_desc';

export const AdminInventoryDashboard: React.FC<AdminInventoryDashboardProps> = ({
  currentUser,
  authToken,
  onBackToStore,
  onOpenSignIn,
  onLogout,
}) => {
  const { formatPrice } = useI18n();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [adjustingItemId, setAdjustingItemId] = useState<string | null>(null);

  // Filters, sorting, and pagination state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('stock_asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  const isAuthorizedAdmin = isAdminAccount(currentUser);

  const fetchInventory = useCallback(async () => {
    if (!isAuthorizedAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setApiError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/admin/inventory', {
        method: 'GET',
        headers,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setApiError(
          data.error || 'Failed to load inventory from server. Verify your admin session.'
        );
        setIsLoading(false);
        return;
      }

      setInventory(data.inventory || []);
      setStats(data.stats || calculateInventoryStats(data.inventory || []));
      setMovements(data.movements || []);
    } catch {
      // Fallback to calculated business catalog if network request fails while admin is verified
      const fallbackItems = createInitialInventory();
      setInventory(fallbackItems);
      setStats(calculateInventoryStats(fallbackItems));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorizedAdmin, authToken]);

  useEffect(() => {
    void fetchInventory();
  }, [fetchInventory]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, sortBy]);

  const handleStockAdjustment = async (
    itemId: string,
    quantityDelta: number,
    type: 'restock' | 'return' | 'adjustment',
    reason: string
  ) => {
    if (!isAuthorizedAdmin) return;
    setAdjustingItemId(itemId);
    setApiError(null);
    setActionFeedback(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          itemId,
          quantityDelta,
          type,
          reason,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setApiError(data.error || 'Unable to update stock level.');
        setAdjustingItemId(null);
        return;
      }

      setInventory(data.inventory);
      setStats(data.stats);
      setMovements(data.movements || []);
      setActionFeedback(data.message || 'Stock updated.');
    } catch {
      const localAdjust = adjustInventoryStock(
        inventory,
        itemId,
        quantityDelta,
        type,
        reason
      );
      if (!localAdjust.success) {
        setApiError(localAdjust.error || 'Unable to update stock level.');
      } else {
        setInventory(localAdjust.updatedInventory);
        setStats(calculateInventoryStats(localAdjust.updatedInventory));
        if (localAdjust.movement) {
          setMovements((prev) => [localAdjust.movement!, ...prev]);
        }
        setActionFeedback(`Updated stock for ${localAdjust.updatedItem?.name}`);
      }
    } finally {
      setAdjustingItemId(null);
    }
  };

  // Filtered and sorted inventory
  const filteredAndSortedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = inventory.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.barcode.toLowerCase().includes(q) ||
        item.variantLabel.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'stock_asc') return a.stockQuantity - b.stockQuantity;
      if (sortBy === 'stock_desc') return b.stockQuantity - a.stockQuantity;
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });
  }, [inventory, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(start, start + pageSize);
  }, [filteredAndSortedItems, currentPage]);

  const computedStats = useMemo(
    () => stats || calculateInventoryStats(inventory),
    [stats, inventory]
  );

  // Guard against unauthorized / non-admin access
  if (!currentUser || !isAuthorizedAdmin) {
    return (
      <div
        data-testid="admin-unauthorized-guard"
        className="min-h-[75vh] bg-[#F2F0E3] text-[#384A22] flex items-center justify-center px-4 py-16"
      >
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#B83A2A]/25 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#B83A2A]/10 text-[#B83A2A] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#384A22]">
            Administrator Access Required
          </h1>
          <p className="text-sm text-[#384A22]/75 leading-relaxed">
            {currentUser
              ? `Your account (${currentUser.email}) has the Normal User role and does not have permission to view the business inventory dashboard.`
              : 'Please sign in with an authorized Kampot Harvest Administrator account to view full business inventory.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToStore}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#384A22]/30 text-[#384A22] text-xs font-bold hover:bg-[#384A22]/5 cursor-pointer"
            >
              Back to Store
            </button>
            {!currentUser && (
              <button
                type="button"
                onClick={onOpenSignIn}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#384A22] text-[#F2F0E3] text-xs font-bold hover:bg-[#2B3B18] cursor-pointer"
              >
                Admin Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="admin-inventory-dashboard"
      className="min-h-screen bg-[#F2F0E3] text-[#384A22] pb-20"
    >
      {/* Top Admin Header Bar */}
      <div className="bg-[#384A22] text-[#F2F0E3] border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Storefront</span>
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#9AB87A] font-mono uppercase tracking-wider">
                <span>Admin Portal</span>
                <span>·</span>
                <span>{currentUser.accountId}</span>
                <span>·</span>
                <span className="truncate max-w-[220px] sm:max-w-none">{currentUser.email}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-[#F2F0E3] mt-0.5">
                Business Inventory Overview
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchInventory()}
              disabled={isLoading}
              data-testid="admin-refresh-inventory-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Stock</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              data-testid="admin-logout-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B83A2A] hover:bg-[#9E2F21] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 space-y-8">
        {/* Status / Error Alerts */}
        {apiError && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-[#B83A2A]/10 border border-[#B83A2A]/30 text-[#B83A2A] text-sm font-medium flex items-center justify-between"
          >
            <span>{apiError}</span>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-xs underline font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {actionFeedback && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-[#384A22]/10 border border-[#384A22]/25 text-[#384A22] text-sm font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#384A22]" />
              <span>{actionFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-xs underline font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 4 Inventory KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#384A22]/65">
              <span>Total Products</span>
              <Package className="w-4 h-4 text-[#384A22]" />
            </div>
            <p
              data-testid="kpi-total-products"
              className="text-3xl font-extrabold text-[#384A22] mt-2 tabular-nums"
            >
              {computedStats.totalProducts}
            </p>
            <span className="text-xs text-[#384A22]/65 mt-1 block">
              Active SKUs across all categories
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#384A22]/65">
              <span>Total Available Stock</span>
              <Layers className="w-4 h-4 text-[#8B6D3B]" />
            </div>
            <p
              data-testid="kpi-total-stock"
              className="text-3xl font-extrabold text-[#384A22] mt-2 tabular-nums"
            >
              {computedStats.totalStockUnits} units
            </p>
            <span className="text-xs text-[#384A22]/65 mt-1 block tabular-nums">
              Valuation: {formatPrice(computedStats.totalInventoryValueUSD)}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#8B6D3B]/30 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#8B6D3B]">
              <span>Low-Stock Products</span>
              <AlertTriangle className="w-4 h-4 text-[#8B6D3B]" />
            </div>
            <p
              data-testid="kpi-low-stock"
              className="text-3xl font-extrabold text-[#8B6D3B] mt-2 tabular-nums"
            >
              {computedStats.lowStockCount}
            </p>
            <span className="text-xs text-[#384A22]/65 mt-1 block">
              At or below reorder threshold
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#B83A2A]/30 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#B83A2A]">
              <span>Out-of-Stock Products</span>
              <XCircle className="w-4 h-4 text-[#B83A2A]" />
            </div>
            <p
              data-testid="kpi-out-of-stock"
              className="text-3xl font-extrabold text-[#B83A2A] mt-2 tabular-nums"
            >
              {computedStats.outOfStockCount}
            </p>
            <span className="text-xs text-[#384A22]/65 mt-1 block">
              0 units available — requires restock
            </span>
          </div>
        </div>

        {/* Search, Category Filter, Status Filter, and Sort Bar */}
        <div className="bg-white rounded-2xl p-5 border border-[#384A22]/12 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#384A22]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                data-testid="inventory-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name, SKU, or barcode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-sm focus:outline-none focus:border-[#384A22]"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                aria-label="Filter by category"
                data-testid="inventory-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-sm font-medium text-[#384A22] focus:outline-none focus:border-[#384A22] cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Single Pouches (100g)">Single Pouches (100g)</option>
                <option value="Glass Jars (250g)">Glass Jars (250g)</option>
                <option value="Value Bundles">Value Bundles</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <select
                aria-label="Filter by stock status"
                data-testid="inventory-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-sm font-medium text-[#384A22] focus:outline-none focus:border-[#384A22] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-2">
              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#384A22]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  aria-label="Sort inventory"
                  data-testid="inventory-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-sm font-medium text-[#384A22] focus:outline-none focus:border-[#384A22] cursor-pointer"
                >
                  <option value="stock_asc">Stock: Low → High</option>
                  <option value="stock_desc">Stock: High → Low</option>
                  <option value="name_asc">Name: A → Z</option>
                  <option value="name_desc">Name: Z → A</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-[#384A22]/12 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-[#384A22] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-[#384A22]">
                Loading business inventory records...
              </p>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-10 h-10 text-[#384A22]/40 mx-auto" />
              <h3 className="text-base font-bold text-[#384A22]">
                No matching inventory products found
              </h3>
              <p className="text-xs text-[#384A22]/70">
                Try clearing your search query or switching category/status filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 rounded-xl bg-[#384A22] text-[#F2F0E3] text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#384A22]/10 bg-[#F2F0E3]/60 text-[11px] font-bold uppercase tracking-wider text-[#384A22]/70">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">SKU &amp; Barcode</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Unit Price</th>
                      <th className="py-3.5 px-4">Stock / Reorder Min</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Stock Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#384A22]/10 text-sm">
                    {paginatedItems.map((item) => {
                      const isUpdating = adjustingItemId === item.id;
                      return (
                        <tr
                          key={item.id}
                          data-testid={`inventory-row-${item.sku}`}
                          className="hover:bg-[#F2F0E3]/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-[#F2F0E3] p-1.5 shrink-0 flex items-center justify-center">
                                <SmartImage
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                  fallbackBg="transparent"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-[#384A22] leading-snug">
                                  {item.name}
                                </p>
                                <p className="text-xs text-[#384A22]/65">
                                  {item.variantLabel}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono text-xs">
                            <span className="font-bold text-[#384A22] block">
                              {item.sku}
                            </span>
                            <span className="text-[#384A22]/60 block">
                              EAN: {item.barcode}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-xs font-semibold text-[#384A22]/85">
                            {item.category}
                          </td>

                          <td className="py-4 px-4 font-bold tabular-nums text-[#384A22]">
                            {formatPrice(item.price)}
                          </td>

                          <td className="py-4 px-4 tabular-nums">
                            <span className="text-base font-extrabold text-[#384A22]">
                              {item.stockQuantity}
                            </span>
                            <span className="text-xs text-[#384A22]/60 block">
                              Min threshold: {item.reorderThreshold} units
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {item.status === 'in_stock' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#384A22]">
                                <span className="w-2 h-2 rounded-full bg-[#384A22]" />
                                <span>In Stock</span>
                              </span>
                            )}
                            {item.status === 'low_stock' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B6D3B]">
                                <span className="w-2 h-2 rounded-full bg-[#8B6D3B]" />
                                <span>Low Stock</span>
                              </span>
                            )}
                            {item.status === 'out_of_stock' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B83A2A]">
                                <span className="w-2 h-2 rounded-full bg-[#B83A2A]" />
                                <span>Out of Stock</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isUpdating}
                                data-testid={`restock-btn-${item.sku}`}
                                onClick={() =>
                                  void handleStockAdjustment(
                                    item.id,
                                    10,
                                    'restock',
                                    'Roastery batch restock (+10)'
                                  )
                                }
                                title="Restock +10 units"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#384A22] hover:bg-[#2B3B18] disabled:opacity-50 text-[#F2F0E3] text-xs font-semibold cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>10</span>
                              </button>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  void handleStockAdjustment(
                                    item.id,
                                    1,
                                    'return',
                                    'Customer return restocked (+1)'
                                  )
                                }
                                title="Record customer return (+1 unit)"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8B6D3B]/15 hover:bg-[#8B6D3B]/25 disabled:opacity-50 text-[#8B6D3B] text-xs font-semibold cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>+1</span>
                              </button>

                              <button
                                type="button"
                                disabled={isUpdating || item.stockQuantity <= 0}
                                onClick={() =>
                                  void handleStockAdjustment(
                                    item.id,
                                    -1,
                                    'adjustment',
                                    'Manual stock count adjustment (-1)'
                                  )
                                }
                                title="Deduct 1 unit"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#384A22]/25 hover:bg-[#384A22]/10 disabled:opacity-40 text-[#384A22] text-xs font-semibold cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                                <span>1</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="px-5 py-3.5 bg-[#F2F0E3]/40 border-t border-[#384A22]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#384A22]/75">
                <span>
                  Showing{' '}
                  <strong>
                    {(currentPage - 1) * pageSize + 1}–
                    {Math.min(
                      currentPage * pageSize,
                      filteredAndSortedItems.length
                    )}
                  </strong>{' '}
                  of <strong>{filteredAndSortedItems.length}</strong> products
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-[#384A22]/20 disabled:opacity-40 font-semibold text-[#384A22] hover:bg-[#384A22]/10 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-[#384A22] px-2 tabular-nums">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="px-3 py-1.5 rounded-lg border border-[#384A22]/20 disabled:opacity-40 font-semibold text-[#384A22] hover:bg-[#384A22]/10 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Stock Movements Log (Sales, Restocks, Returns & Adjustments) */}
        <div className="bg-white rounded-2xl p-6 border border-[#384A22]/12 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B6D3B]" />
              <h2 className="text-base font-bold text-[#384A22]">
                Recent Inventory Movements (Orders, Restocks &amp; Returns)
              </h2>
            </div>
            <span className="text-xs text-[#384A22]/60">
              Live audit log of stock changes
            </span>
          </div>

          {movements.length === 0 ? (
            <p className="text-xs text-[#384A22]/65">
              No stock movements recorded in this session yet.
            </p>
          ) : (
            <div className="divide-y divide-[#384A22]/10 text-xs">
              {movements.slice(0, 8).map((mov) => (
                <div
                  key={mov.movementId}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-mono font-bold text-[#384A22]">
                      {mov.sku}
                    </span>{' '}
                    — <span className="font-semibold">{mov.productName}</span>
                    <span className="text-[#384A22]/65 block sm:inline sm:ml-2">
                      ({mov.reason})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 tabular-nums shrink-0">
                    <span
                      className={`font-bold ${
                        mov.quantityDelta > 0
                          ? 'text-[#384A22]'
                          : 'text-[#B83A2A]'
                      }`}
                    >
                      {mov.quantityDelta > 0
                        ? `+${mov.quantityDelta}`
                        : mov.quantityDelta}{' '}
                      units
                    </span>
                    <span className="text-[#384A22]/60">
                      Balance: <strong>{mov.resultingStock}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
