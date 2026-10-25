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
  Truck,
  Undo2,
  X,
} from 'lucide-react';
import {
  UserAccount,
  isAdminAccount,
  InventoryItem,
  InventoryStats,
  StockMovementRecord,
  PurchaseOrder,
  createInitialInventory,
  createInitialPurchaseOrders,
  calculateInventoryStats,
  adjustInventoryStock,
  reverseStockMovement,
  receivePurchaseOrderDelivery,
  approvePurchaseOrder,
  cancelPurchaseOrder,
  createPurchaseOrder,
  LOW_STOCK_RED_THRESHOLD,
  isLowStockRedHighlight,
  CreateInventoryProductInput,
  InventoryCategory,
  UnitOfMeasure,
  validateNewInventoryProduct,
  createInventoryProduct,
} from '../utils/storeLogic';
import { useI18n } from '../utils/i18nContext';
import { SmartImage } from './SmartImage';

interface AdminInventoryDashboardProps {
  currentUser: UserAccount | null;
  authToken: string | null;
  onBackToStore: () => void;
  onOpenSignIn: () => void;
  onLogout: () => void;
  onInventoryUpdated?: (updatedInventory: InventoryItem[]) => void;
}

type SortField = 'name_asc' | 'name_desc' | 'stock_asc' | 'stock_desc';

export const AdminInventoryDashboard: React.FC<AdminInventoryDashboardProps> = ({
  currentUser,
  authToken,
  onBackToStore,
  onOpenSignIn,
  onLogout,
  onInventoryUpdated,
}) => {
  const { t, formatPrice } = useI18n();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [adjustingItemId, setAdjustingItemId] = useState<string | null>(null);
  const [processingPoId, setProcessingPoId] = useState<string | null>(null);

  // Filters, sorting, and pagination state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('stock_asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Add New Product form state
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);
  const [newProductForm, setNewProductForm] = useState<{
    name: string;
    sku: string;
    barcode: string;
    variantLabel: string;
    category: InventoryCategory;
    unitOfMeasure: UnitOfMeasure;
    price: string;
    unitCost: string;
    initialStock: string;
    reorderThreshold: string;
    image: string;
  }>({
    name: '',
    sku: '',
    barcode: '',
    variantLabel: '',
    category: 'Glass Jars (250g)',
    unitOfMeasure: '250g Glass Jar',
    price: '20.00',
    unitCost: '8.50',
    initialStock: '25',
    reorderThreshold: '12',
    image: '/assets/aistudio/product-honey-butter-jar-250g.png',
  });
  const [newProductErrors, setNewProductErrors] = useState<
    Partial<Record<keyof CreateInventoryProductInput, string>>
  >({});

  const isAuthorizedAdmin = isAdminAccount(currentUser);
  const onInventoryUpdatedRef = React.useRef(onInventoryUpdated);
  useEffect(() => {
    onInventoryUpdatedRef.current = onInventoryUpdated;
  }, [onInventoryUpdated]);

  const syncInventoryState = useCallback(
    (
      nextInventory: InventoryItem[],
      nextStats?: InventoryStats,
      nextMovements?: StockMovementRecord[],
      nextPos?: PurchaseOrder[]
    ) => {
      setInventory(nextInventory);
      setStats(nextStats || calculateInventoryStats(nextInventory));
      if (nextMovements) setMovements(nextMovements);
      if (nextPos) setPurchaseOrders(nextPos);
      if (onInventoryUpdatedRef.current) {
        onInventoryUpdatedRef.current(nextInventory);
      }
    },
    []
  );

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

      syncInventoryState(
        data.inventory || [],
        data.stats,
        data.movements || [],
        data.purchaseOrders || createInitialPurchaseOrders()
      );
    } catch {
      const fallbackItems = createInitialInventory();
      syncInventoryState(
        fallbackItems,
        calculateInventoryStats(fallbackItems),
        [],
        createInitialPurchaseOrders()
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorizedAdmin, authToken, syncInventoryState]);

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

      syncInventoryState(data.inventory, data.stats, data.movements, data.purchaseOrders);
      setActionFeedback(data.message || 'Stock updated.');
    } catch {
      const localAdjust = adjustInventoryStock(
        inventory,
        itemId,
        quantityDelta,
        type,
        reason,
        {
          existingMovements: movements,
          performedBy: currentUser?.email,
        }
      );
      if (!localAdjust.success) {
        setApiError(localAdjust.error || 'Unable to update stock level.');
      } else {
        const nextMovs = localAdjust.movement
          ? [localAdjust.movement, ...movements]
          : movements;
        syncInventoryState(
          localAdjust.updatedInventory,
          calculateInventoryStats(localAdjust.updatedInventory),
          nextMovs
        );
        setActionFeedback(`Updated stock for ${localAdjust.updatedItem?.name}`);
      }
    } finally {
      setAdjustingItemId(null);
    }
  };

  const handleReverseMovement = async (movementId: string) => {
    if (!isAuthorizedAdmin) return;
    setApiError(null);
    setActionFeedback(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const response = await fetch('/api/admin/inventory/reverse', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          movementId,
          reason: `Compensating reversal by ${currentUser?.fullName}`,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setApiError(data.error || 'Could not reverse movement.');
        return;
      }
      syncInventoryState(data.inventory, data.stats, data.movements, data.purchaseOrders);
      setActionFeedback(data.message || 'Movement reversed via compensating entry.');
    } catch {
      const localRev = reverseStockMovement(
        inventory,
        movements,
        movementId,
        currentUser?.email || 'Kampot Harvest Admin',
        `Compensating reversal by ${currentUser?.fullName}`
      );
      if (!localRev.success) {
        setApiError(localRev.error || 'Could not reverse movement.');
      } else {
        syncInventoryState(
          localRev.updatedInventory,
          calculateInventoryStats(localRev.updatedInventory),
          localRev.updatedMovements
        );
        setActionFeedback(`Reversed movement ${movementId}.`);
      }
    }
  };

  const handleReceivePurchaseOrder = async (
    po: PurchaseOrder,
    customLines?: Array<{ itemId: string; quantityReceived: number }>
  ) => {
    if (!isAuthorizedAdmin) return;
    setProcessingPoId(po.poId);
    setApiError(null);
    setActionFeedback(null);

    const linesToReceive =
      customLines ||
      po.items
        .map((l) => ({
          itemId: l.itemId,
          quantityReceived: Math.max(0, l.orderedQty - l.receivedQty),
        }))
        .filter((l) => l.quantityReceived > 0);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const response = await fetch(`/api/admin/purchase-orders/${po.poId}/receive`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          receivedLines: linesToReceive,
          receiptId: `RCPT-${po.poId}-${Date.now()}`,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setApiError(data.error || 'Failed to receive supplier delivery.');
        setProcessingPoId(null);
        return;
      }
      syncInventoryState(data.inventory, data.stats, data.movements, data.purchaseOrders);
      setActionFeedback(data.message || `Received delivery for ${po.poId}.`);
    } catch {
      const localRes = receivePurchaseOrderDelivery(
        po,
        inventory,
        linesToReceive.map((l) => ({ itemId: l.itemId, acceptedQty: l.quantityReceived })),
        currentUser,
        `RCPT-${po.poId}-${Date.now()}`
      );
      if (!localRes.success || !localRes.updatedPO) {
        setApiError(localRes.error || 'Failed to receive supplier delivery.');
      } else {
        const nextPos = purchaseOrders.map((p) =>
          p.poId === localRes.updatedPO!.poId ? localRes.updatedPO! : p
        );
        syncInventoryState(
          localRes.updatedInventory,
          calculateInventoryStats(localRes.updatedInventory),
          [...localRes.movements, ...movements],
          nextPos
        );
        setActionFeedback(`Received supplier delivery for ${po.poId}.`);
      }
    } finally {
      setProcessingPoId(null);
    }
  };

  const handleApprovePurchaseOrder = async (po: PurchaseOrder) => {
    if (!isAuthorizedAdmin) return;
    setProcessingPoId(po.poId);
    setApiError(null);
    setActionFeedback(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const response = await fetch(`/api/admin/purchase-orders/${po.poId}/approve`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setApiError(data.error || 'Failed to approve purchase order.');
        setProcessingPoId(null);
        return;
      }
      setPurchaseOrders(data.purchaseOrders || purchaseOrders);
      setActionFeedback(data.message || `Approved ${po.poId}.`);
    } catch {
      const localApp = approvePurchaseOrder(po, currentUser);
      if (localApp.success && localApp.purchaseOrder) {
        setPurchaseOrders((prev) =>
          prev.map((p) => (p.poId === localApp.purchaseOrder!.poId ? localApp.purchaseOrder! : p))
        );
        setActionFeedback(`Approved ${po.poId}.`);
      }
    } finally {
      setProcessingPoId(null);
    }
  };

  const handleCancelPurchaseOrder = async (po: PurchaseOrder) => {
    if (!isAuthorizedAdmin) return;
    setProcessingPoId(po.poId);
    setApiError(null);
    setActionFeedback(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const response = await fetch(`/api/admin/purchase-orders/${po.poId}/cancel`, {
        method: 'POST',
        headers,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setApiError(data.error || 'Failed to cancel purchase order.');
        setProcessingPoId(null);
        return;
      }
      setPurchaseOrders(data.purchaseOrders || purchaseOrders);
      setActionFeedback(data.message || `Cancelled ${po.poId}.`);
    } catch {
      const localCancel = cancelPurchaseOrder(po, currentUser);
      if (localCancel.success && localCancel.purchaseOrder) {
        setPurchaseOrders((prev) =>
          prev.map((p) =>
            p.poId === localCancel.purchaseOrder!.poId ? localCancel.purchaseOrder! : p
          )
        );
        setActionFeedback(`Cancelled ${po.poId} (inventory unchanged).`);
      }
    } finally {
      setProcessingPoId(null);
    }
  };

  const handleCreateReplenishmentPo = async () => {
    if (!isAuthorizedAdmin) return;
    setApiError(null);
    setActionFeedback(null);

    const lowOrOutItems = inventory.filter((i) => i.stockQuantity <= i.reorderThreshold);
    const lines =
      lowOrOutItems.length > 0
        ? lowOrOutItems.map((i) => ({
            itemId: i.id,
            orderedQty: Math.max(25, i.reorderThreshold * 2 - i.stockQuantity),
            unitCost: i.unitCost,
          }))
        : [{ itemId: 'chili-lime-100g-pouch', orderedQty: 50, unitCost: 4.5 }];

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const response = await fetch('/api/admin/purchase-orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          supplierName: 'Kampot Cashew Growers Cooperative',
          lines,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setApiError(data.error || 'Failed to create replenishment PO.');
        return;
      }
      setPurchaseOrders(data.purchaseOrders || purchaseOrders);
      setActionFeedback(
        data.message || `Created draft Purchase Order ${data.purchaseOrder?.poId}.`
      );
    } catch {
      const localPo = createPurchaseOrder(
        inventory,
        {
          supplierName: 'Kampot Cashew Growers Cooperative',
          items: lines,
          status: 'draft',
        },
        currentUser,
        purchaseOrders
      );
      if (localPo.success && localPo.purchaseOrder) {
        setPurchaseOrders((prev) => [localPo.purchaseOrder!, ...prev]);
        setActionFeedback(
          `Created draft Purchase Order ${localPo.purchaseOrder.poId} (stock unchanged until received).`
        );
      }
    }
  };

  const handleCreateNewProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedAdmin) return;
    setApiError(null);
    setActionFeedback(null);

    const payload: CreateInventoryProductInput = {
      name: newProductForm.name.trim(),
      sku: newProductForm.sku.trim().toUpperCase(),
      barcode: newProductForm.barcode.trim() || undefined,
      variantLabel: newProductForm.variantLabel.trim() || undefined,
      category: newProductForm.category,
      unitOfMeasure: newProductForm.unitOfMeasure,
      price: Number(newProductForm.price),
      unitCost: Number(newProductForm.unitCost),
      initialStock: Number(newProductForm.initialStock),
      reorderThreshold: Number(newProductForm.reorderThreshold),
      image: newProductForm.image.trim() || undefined,
    };

    const validation = validateNewInventoryProduct(payload, inventory);
    if (!validation.valid) {
      setNewProductErrors(validation.errors);
      return;
    }

    setNewProductErrors({});
    setIsCreatingProduct(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers.Authorization = `Bearer ${authToken}`;

      const response = await fetch('/api/admin/inventory/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fieldErrors) {
          setNewProductErrors(data.fieldErrors);
        }
        setApiError(data.error || 'Could not add new product.');
        setIsCreatingProduct(false);
        return;
      }

      syncInventoryState(data.inventory, data.stats, data.movements, data.purchaseOrders);
      await fetchInventory();
      setActionFeedback(
        data.message || `Added new product "${data.newItem?.name}" (${data.newItem?.sku}).`
      );
      setNewProductForm({
        name: '',
        sku: '',
        barcode: '',
        variantLabel: '',
        category: 'Glass Jars (250g)',
        unitOfMeasure: '250g Glass Jar',
        price: '20.00',
        unitCost: '8.50',
        initialStock: '25',
        reorderThreshold: '12',
        image: '/assets/aistudio/product-honey-butter-jar-250g.png',
      });
      setIsAddProductOpen(false);
    } catch {
      const localCreated = createInventoryProduct(inventory, payload, {
        actorAccount: currentUser,
        performedBy: currentUser?.email,
      });
      if (!localCreated.success || !localCreated.newItem) {
        if (localCreated.fieldErrors) {
          setNewProductErrors(localCreated.fieldErrors);
        }
        setApiError(localCreated.error || 'Could not add new product.');
      } else {
        const nextMovs = localCreated.movement
          ? [localCreated.movement, ...movements]
          : movements;
        syncInventoryState(
          localCreated.updatedInventory,
          calculateInventoryStats(localCreated.updatedInventory),
          nextMovs
        );
        setActionFeedback(
          `Added "${localCreated.newItem.name}" (SKU: ${localCreated.newItem.sku}) with ${localCreated.newItem.stockQuantity} initial units.`
        );
        setNewProductForm({
          name: '',
          sku: '',
          barcode: '',
          variantLabel: '',
          category: 'Glass Jars (250g)',
          unitOfMeasure: '250g Glass Jar',
          price: '20.00',
          unitCost: '8.50',
          initialStock: '25',
          reorderThreshold: '12',
          image: '/assets/aistudio/product-honey-butter-jar-250g.png',
        });
        setIsAddProductOpen(false);
      }
    } finally {
      setIsCreatingProduct(false);
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
              {t('btn_back_to_store', 'Back to Store')}
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
              <span>{t('btn_back_to_store', 'Storefront')}</span>
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
                {t('nav_inventory_overview', 'Business Inventory Overview')}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsAddProductOpen(true);
                setNewProductErrors({});
              }}
              data-testid="toggle-add-product-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B6D3B] hover:bg-[#765B2F] text-[#F2F0E3] text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

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
              <span>{t('account_sign_out', 'Sign Out')}</span>
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
            <span className="text-xs text-[#384A22]/65 mt-1 block tabular-nums">
              {computedStats.unitsByMeasure.pouches} pouches · {computedStats.unitsByMeasure.jars} jars · {computedStats.unitsByMeasure.bundles} bundles
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
              Cost: {formatPrice(computedStats.totalInventoryCostUSD)} · Retail: {formatPrice(computedStats.totalInventoryValueUSD)}
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

        {/* Add New Product Form Modal (Admin Only) */}
        {isAddProductOpen && (
          <div
            data-testid="add-product-modal-backdrop"
            onClick={() => setIsAddProductOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-product-modal-title"
              data-testid="add-product-modal"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#F2F0E3] rounded-3xl border border-[#384A22]/20 shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-[#384A22] text-[#F2F0E3] px-6 py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-[#9AB87A]" />
                  </div>
                  <div>
                    <h2
                      id="add-product-modal-title"
                      className="text-lg font-bold text-[#F2F0E3]"
                    >
                      Add New Product
                    </h2>
                    <p className="text-xs text-[#F2F0E3]/75">
                      Enter product details to save to catalog and refresh inventory immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="autofill-sample-product-btn"
                    onClick={() => {
                      setNewProductForm({
                        name: 'Artisan Roasted Cashews — Kampot Black Pepper (250g Jar)',
                        sku: `KH-BP-${Math.floor(100 + Math.random() * 899)}J`,
                        barcode: '',
                        variantLabel: 'Kampot Black Pepper · 250g Glass Jar',
                        category: 'Glass Jars (250g)',
                        unitOfMeasure: '250g Glass Jar',
                        price: '22.00',
                        unitCost: '9.50',
                        initialStock: '35',
                        reorderThreshold: '15',
                        image: '/assets/aistudio/product-chilli-lime-jar-250g.png',
                      });
                      setNewProductErrors({});
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-[#F2F0E3] text-xs font-semibold cursor-pointer"
                  >
                    Fill Sample
                  </button>
                  <button
                    type="button"
                    aria-label="Close Add New Product modal"
                    data-testid="close-add-product-modal-btn"
                    onClick={() => setIsAddProductOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F2F0E3] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Form Body */}
              <form
                onSubmit={handleCreateNewProductSubmit}
                data-testid="add-product-panel"
                className="p-4 sm:p-6 bg-white space-y-5 max-h-[75vh] overflow-y-auto"
                noValidate
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Product Name */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="new-prod-name"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      Product Name *
                    </label>
                    <input
                      id="new-prod-name"
                      type="text"
                      required
                      data-testid="new-product-name-input"
                      value={newProductForm.name}
                      onChange={(e) => {
                        setNewProductForm({ ...newProductForm, name: e.target.value });
                        if (newProductErrors.name) {
                          setNewProductErrors({ ...newProductErrors, name: undefined });
                        }
                      }}
                      placeholder="e.g. Artisan Roasted Cashews — Sea Salt Caramel (250g Jar)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm text-[#384A22] focus:outline-none focus:border-[#384A22]"
                    />
                    {newProductErrors.name && (
                      <p className="text-xs text-[#B83A2A] mt-1">{newProductErrors.name}</p>
                    )}
                  </div>

                  {/* 2. Category */}
                  <div>
                    <label
                      htmlFor="new-prod-category"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      Category *
                    </label>
                    <select
                      id="new-prod-category"
                      data-testid="new-product-category-select"
                      value={newProductForm.category}
                      onChange={(e) => {
                        const cat = e.target.value as InventoryCategory;
                        const autoUom: UnitOfMeasure =
                          cat === 'Single Pouches (100g)'
                            ? '100g Pouch'
                            : cat === 'Glass Jars (250g)'
                            ? '250g Glass Jar'
                            : 'Bundle Box';
                        const autoImg =
                          cat === 'Single Pouches (100g)'
                            ? '/assets/aistudio/product-honey-butter-pouch-100g.png'
                            : cat === 'Glass Jars (250g)'
                            ? '/assets/aistudio/product-honey-butter-jar-250g.png'
                            : '/assets/aistudio/bundle-complete-4pack.png';
                        setNewProductForm({
                          ...newProductForm,
                          category: cat,
                          unitOfMeasure: autoUom,
                          image: autoImg,
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm font-medium text-[#384A22] focus:outline-none focus:border-[#384A22] cursor-pointer"
                    >
                      <option value="Single Pouches (100g)">Single Pouches (100g)</option>
                      <option value="Glass Jars (250g)">Glass Jars (250g)</option>
                      <option value="Value Bundles">Value Bundles</option>
                    </select>
                  </div>

                  {/* 3. SKU */}
                  <div>
                    <label
                      htmlFor="new-prod-sku"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      SKU *
                    </label>
                    <input
                      id="new-prod-sku"
                      type="text"
                      required
                      data-testid="new-product-sku-input"
                      value={newProductForm.sku}
                      onChange={(e) => {
                        setNewProductForm({
                          ...newProductForm,
                          sku: e.target.value.toUpperCase(),
                        });
                        if (newProductErrors.sku) {
                          setNewProductErrors({ ...newProductErrors, sku: undefined });
                        }
                      }}
                      placeholder="e.g. KH-SC-250J"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm font-mono text-[#384A22] focus:outline-none focus:border-[#384A22]"
                    />
                    {newProductErrors.sku && (
                      <p className="text-xs text-[#B83A2A] mt-1">{newProductErrors.sku}</p>
                    )}
                  </div>

                  {/* 4. Initial Stock Quantity */}
                  <div>
                    <label
                      htmlFor="new-prod-stock"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      Initial Stock Quantity *
                    </label>
                    <input
                      id="new-prod-stock"
                      type="number"
                      step="1"
                      min="0"
                      required
                      data-testid="new-product-stock-input"
                      value={newProductForm.initialStock}
                      onChange={(e) => {
                        setNewProductForm({ ...newProductForm, initialStock: e.target.value });
                        if (newProductErrors.initialStock) {
                          setNewProductErrors({ ...newProductErrors, initialStock: undefined });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm tabular-nums text-[#384A22] focus:outline-none focus:border-[#384A22]"
                    />
                    {newProductErrors.initialStock && (
                      <p className="text-xs text-[#B83A2A] mt-1">
                        {newProductErrors.initialStock}
                      </p>
                    )}
                  </div>

                  {/* 5. Price (USD) */}
                  <div>
                    <label
                      htmlFor="new-prod-price"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      Price (USD) *
                    </label>
                    <input
                      id="new-prod-price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      data-testid="new-product-price-input"
                      value={newProductForm.price}
                      onChange={(e) => {
                        setNewProductForm({ ...newProductForm, price: e.target.value });
                        if (newProductErrors.price) {
                          setNewProductErrors({ ...newProductErrors, price: undefined });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm tabular-nums text-[#384A22] focus:outline-none focus:border-[#384A22]"
                    />
                    {newProductErrors.price && (
                      <p className="text-xs text-[#B83A2A] mt-1">{newProductErrors.price}</p>
                    )}
                  </div>

                  {/* Unit Cost & Reorder Threshold */}
                  <div>
                    <label
                      htmlFor="new-prod-cost"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      Unit Cost (USD)
                    </label>
                    <input
                      id="new-prod-cost"
                      type="number"
                      step="0.01"
                      min="0"
                      data-testid="new-product-cost-input"
                      value={newProductForm.unitCost}
                      onChange={(e) => {
                        setNewProductForm({ ...newProductForm, unitCost: e.target.value });
                        if (newProductErrors.unitCost) {
                          setNewProductErrors({ ...newProductErrors, unitCost: undefined });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm tabular-nums text-[#384A22] focus:outline-none focus:border-[#384A22]"
                    />
                    {newProductErrors.unitCost && (
                      <p className="text-xs text-[#B83A2A] mt-1">{newProductErrors.unitCost}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="new-prod-threshold"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      Reorder Threshold
                    </label>
                    <input
                      id="new-prod-threshold"
                      type="number"
                      step="1"
                      min="0"
                      data-testid="new-product-threshold-input"
                      value={newProductForm.reorderThreshold}
                      onChange={(e) => {
                        setNewProductForm({
                          ...newProductForm,
                          reorderThreshold: e.target.value,
                        });
                        if (newProductErrors.reorderThreshold) {
                          setNewProductErrors({
                            ...newProductErrors,
                            reorderThreshold: undefined,
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm tabular-nums text-[#384A22] focus:outline-none focus:border-[#384A22]"
                    />
                    {newProductErrors.reorderThreshold && (
                      <p className="text-xs text-[#B83A2A] mt-1">
                        {newProductErrors.reorderThreshold}
                      </p>
                    )}
                  </div>

                  {/* Variant Label & Packaging Image */}
                  <div>
                    <label
                      htmlFor="new-prod-variant"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      Variant / Pack Label
                    </label>
                    <input
                      id="new-prod-variant"
                      type="text"
                      data-testid="new-product-variant-input"
                      value={newProductForm.variantLabel}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, variantLabel: e.target.value })
                      }
                      placeholder="e.g. Sea Salt Caramel · 250g Jar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm text-[#384A22] focus:outline-none focus:border-[#384A22]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-prod-image"
                      className="block text-xs font-bold uppercase text-[#384A22]/85 mb-1"
                    >
                      Packaging Image
                    </label>
                    <select
                      id="new-prod-image"
                      data-testid="new-product-image-select"
                      value={newProductForm.image}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, image: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm font-medium text-[#384A22] focus:outline-none focus:border-[#384A22] cursor-pointer"
                    >
                      <option value="/assets/aistudio/product-honey-butter-jar-250g.png">
                        250g Glass Jar — Golden Label
                      </option>
                      <option value="/assets/aistudio/product-chilli-lime-jar-250g.png">
                        250g Glass Jar — Spice Red Label
                      </option>
                      <option value="/assets/aistudio/product-honey-butter-pouch-100g.png">
                        100g Resealable Pouch — Golden Label
                      </option>
                      <option value="/assets/aistudio/product-chili-lime-pouch-100g.png">
                        100g Resealable Pouch — Spice Red Label
                      </option>
                      <option value="/assets/aistudio/bundle-complete-4pack.png">
                        Value Bundle — 4-Pack Collection
                      </option>
                      <option value="/assets/aistudio/bundle-jars-duo.png">
                        Value Bundle — 250g Jar Duo
                      </option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-[#384A22]/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#384A22]/25 text-[#384A22] text-xs font-bold uppercase tracking-wider hover:bg-[#384A22]/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingProduct}
                    data-testid="submit-new-product-btn"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#384A22] hover:bg-[#2B3B18] disabled:opacity-60 text-[#F2F0E3] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingProduct ? 'Saving Product...' : 'Save Product'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search, Category Filter, Status Filter, and Sort Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#384A22]/12 shadow-xs space-y-4">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm focus:outline-none focus:border-[#384A22]"
              />
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                aria-label="Filter by category"
                data-testid="inventory-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm font-medium text-[#384A22] focus:outline-none focus:border-[#384A22] cursor-pointer"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm font-medium text-[#384A22] focus:outline-none focus:border-[#384A22] cursor-pointer"
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
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F2F0E3]/50 border border-[#384A22]/20 text-base sm:text-sm font-medium text-[#384A22] focus:outline-none focus:border-[#384A22] cursor-pointer"
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
                      <th className="py-3.5 px-4">Category &amp; UOM</th>
                      <th className="py-3.5 px-4">Cost / Price</th>
                      <th className="py-3.5 px-4">Stock / Reorder Min</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Stock Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#384A22]/10 text-sm">
                    {paginatedItems.map((item) => {
                      const isUpdating = adjustingItemId === item.id;
                      const isLowStockRed = isLowStockRedHighlight(item.stockQuantity);
                      return (
                        <tr
                          key={item.id}
                          data-testid={`inventory-row-${item.sku}`}
                          data-low-stock-highlight={isLowStockRed ? 'true' : 'false'}
                          className={`transition-colors ${
                            isLowStockRed
                              ? 'bg-[#B83A2A]/[0.07] hover:bg-[#B83A2A]/[0.12]'
                              : 'hover:bg-[#F2F0E3]/30'
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-xl p-1.5 shrink-0 flex items-center justify-center ${
                                  isLowStockRed
                                    ? 'bg-[#B83A2A]/10 border border-[#B83A2A]/30'
                                    : 'bg-[#F2F0E3]'
                                }`}
                              >
                                <SmartImage
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                  fallbackBg="transparent"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  {isLowStockRed && (
                                    <AlertTriangle
                                      aria-hidden="true"
                                      className="w-4 h-4 text-[#B83A2A] shrink-0"
                                    />
                                  )}
                                  <p
                                    className={`font-bold leading-snug ${
                                      isLowStockRed ? 'text-[#B83A2A]' : 'text-[#384A22]'
                                    }`}
                                  >
                                    {item.name}
                                  </p>
                                </div>
                                <p
                                  className={`text-xs ${
                                    isLowStockRed ? 'text-[#B83A2A]/80' : 'text-[#384A22]/65'
                                  }`}
                                >
                                  {item.variantLabel}
                                  {isLowStockRed &&
                                    ` · Below ${LOW_STOCK_RED_THRESHOLD} units`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 font-mono text-xs">
                            <span
                              className={`font-bold block ${
                                isLowStockRed ? 'text-[#B83A2A]' : 'text-[#384A22]'
                              }`}
                            >
                              {item.sku}
                            </span>
                            <span
                              className={`block ${
                                isLowStockRed ? 'text-[#B83A2A]/75' : 'text-[#384A22]/60'
                              }`}
                            >
                              EAN: {item.barcode}
                            </span>
                          </td>

                          <td
                            className={`py-4 px-4 text-xs font-semibold ${
                              isLowStockRed ? 'text-[#B83A2A]/90' : 'text-[#384A22]/85'
                            }`}
                          >
                            <span className="block">{item.category}</span>
                            <span className="text-[11px] opacity-75 block">
                              UOM: {item.unitOfMeasure || 'Unit'}
                            </span>
                          </td>

                          <td
                            className={`py-4 px-4 tabular-nums ${
                              isLowStockRed ? 'text-[#B83A2A]' : 'text-[#384A22]'
                            }`}
                          >
                            <span className="font-bold block">{formatPrice(item.price)}</span>
                            <span className="text-[11px] opacity-75 block">
                              Cost: {formatPrice(item.unitCost ?? 0)}
                            </span>
                          </td>

                          <td className="py-4 px-4 tabular-nums">
                            <div className="flex items-baseline gap-1.5">
                              <span
                                data-testid={`stock-qty-${item.sku}`}
                                className={`text-base font-extrabold ${
                                  isLowStockRed ? 'text-[#B83A2A]' : 'text-[#384A22]'
                                }`}
                              >
                                {item.stockQuantity}
                              </span>
                              {isLowStockRed && (
                                <span className="text-[11px] font-bold text-[#B83A2A]">
                                  (&lt; {LOW_STOCK_RED_THRESHOLD})
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-xs block ${
                                isLowStockRed
                                  ? 'text-[#B83A2A]/80 font-medium'
                                  : 'text-[#384A22]/60'
                              }`}
                            >
                              Min threshold: {item.reorderThreshold} units
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {item.status === 'in_stock' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#384A22] whitespace-nowrap">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>In Stock</span>
                              </span>
                            )}
                            {item.status === 'low_stock' && (
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${
                                  isLowStockRed ? 'text-[#B83A2A]' : 'text-[#8B6D3B]'
                                }`}
                              >
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {isLowStockRed ? 'Critical Low Stock' : 'Low Stock'}
                                </span>
                              </span>
                            )}
                            {item.status === 'out_of_stock' && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B83A2A] whitespace-nowrap">
                                <XCircle className="w-3.5 h-3.5 shrink-0" />
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

        {/* Supplier Purchase Orders & Receiving Workflow */}
        <div
          data-testid="admin-purchase-orders-section"
          className="bg-white rounded-2xl p-6 border border-[#384A22]/12 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#384A22]" />
              <div>
                <h2 className="text-base font-bold text-[#384A22]">
                  Supplier Purchase Orders &amp; Stock Receiving
                </h2>
                <p className="text-xs text-[#384A22]/65">
                  Draft &amp; Approved POs do not inflate on-hand stock until physical delivery is received.
                </p>
              </div>
            </div>
            <button
              type="button"
              data-testid="create-replenishment-po-btn"
              onClick={() => void handleCreateReplenishmentPo()}
              className="px-4 py-2 rounded-xl bg-[#384A22] hover:bg-[#2B3B18] text-[#F2F0E3] text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              + Create Replenishment PO
            </button>
          </div>

          {purchaseOrders.length === 0 ? (
            <p className="text-xs text-[#384A22]/65">No supplier purchase orders recorded.</p>
          ) : (
            <div className="space-y-3">
              {purchaseOrders.map((po) => {
                const isProcessing = processingPoId === po.poId;
                const canReceive =
                  po.status === 'approved' || po.status === 'partially_received';
                return (
                  <div
                    key={po.poId}
                    data-testid={`po-card-${po.poId}`}
                    className="p-4 rounded-xl bg-[#F2F0E3]/45 border border-[#384A22]/12 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#384A22] text-sm">
                          {po.poId}
                        </span>
                        <span className="font-semibold text-[#384A22]">{po.supplierName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#384A22]/10 text-[#384A22] font-bold uppercase text-[10px]">
                          Status: {po.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#8B6D3B]/15 text-[#8B6D3B] font-bold uppercase text-[10px]">
                          Invoice: {po.invoiceStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#384A22]/80 pt-1">
                        {po.items.map((line) => (
                          <span key={line.itemId} className="tabular-nums">
                            <strong className="font-mono">{line.sku}</strong>: {line.receivedQty}/
                            {line.orderedQty} received (@ {formatPrice(line.unitCost)})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {po.status === 'draft' && (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            data-testid={`approve-po-btn-${po.poId}`}
                            onClick={() => void handleApprovePurchaseOrder(po)}
                            className="px-3 py-1.5 rounded-lg bg-[#384A22] text-[#F2F0E3] text-xs font-semibold hover:bg-[#2B3B18] cursor-pointer"
                          >
                            Approve PO
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => void handleCancelPurchaseOrder(po)}
                            className="px-3 py-1.5 rounded-lg border border-[#B83A2A]/40 text-[#B83A2A] text-xs font-semibold hover:bg-[#B83A2A]/10 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {canReceive && (
                        <>
                          <button
                            type="button"
                            disabled={isProcessing}
                            data-testid={`receive-po-full-btn-${po.poId}`}
                            onClick={() => void handleReceivePurchaseOrder(po)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#384A22] text-[#F2F0E3] text-xs font-semibold hover:bg-[#2B3B18] cursor-pointer"
                          >
                            Receive Full Delivery
                          </button>
                          {po.status === 'approved' && (
                            <button
                              type="button"
                              disabled={isProcessing}
                              data-testid={`cancel-po-btn-${po.poId}`}
                              onClick={() => void handleCancelPurchaseOrder(po)}
                              className="px-3 py-1.5 rounded-lg border border-[#B83A2A]/40 text-[#B83A2A] text-xs font-semibold hover:bg-[#B83A2A]/10 cursor-pointer"
                            >
                              Cancel PO
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Stock Movements Log (Sales, Restocks, Returns, Adjustments & Reversals) */}
        <div className="bg-white rounded-2xl p-6 border border-[#384A22]/12 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B6D3B]" />
              <h2 className="text-base font-bold text-[#384A22]">
                Recent Inventory Movements (Orders, Restocks &amp; Returns)
              </h2>
            </div>
            <span className="text-xs text-[#384A22]/60">
              Immutable audit log — use Reverse for compensating adjustments
            </span>
          </div>

          {movements.length === 0 ? (
            <p className="text-xs text-[#384A22]/65">
              No stock movements recorded in this session yet.
            </p>
          ) : (
            <div className="divide-y divide-[#384A22]/10 text-xs">
              {movements.slice(0, 10).map((mov) => (
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
                    {mov.referenceId && (
                      <span className="font-mono text-[11px] text-[#8B6D3B] ml-2">
                        Ref: {mov.referenceId}
                      </span>
                    )}
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
                    {!mov.reversedByMovementId && mov.type !== 'reversal' ? (
                      <button
                        type="button"
                        data-testid={`reverse-mov-btn-${mov.movementId}`}
                        onClick={() => void handleReverseMovement(mov.movementId)}
                        title="Create compensating reversal movement"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#384A22]/25 hover:bg-[#384A22]/10 text-[#384A22] font-semibold cursor-pointer"
                      >
                        <Undo2 className="w-3 h-3" />
                        <span>Reverse</span>
                      </button>
                    ) : mov.reversedByMovementId ? (
                      <span className="text-[11px] text-[#B83A2A] font-semibold">
                        Reversed
                      </span>
                    ) : null}
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
