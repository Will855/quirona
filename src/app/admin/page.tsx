'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Package, ShoppingBag, Lock, Tag, Settings } from 'lucide-react';
import { Product, Order, Category } from '@/types';
import { useCartStore } from '@/lib/store/useCartStore';

// Componentes modulares de Admin
import AdminLoginCard from '@/components/admin/AdminLoginCard';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminProductsTable from '@/components/admin/AdminProductsTable';
import AdminProductModal from '@/components/admin/AdminProductModal';
import AdminOrdersTable from '@/components/admin/AdminOrdersTable';
import AdminReceiptModal, { AdminReceiptData } from '@/components/admin/AdminReceiptModal';
import AdminCategoriesTable from '@/components/admin/AdminCategoriesTable';
import AdminSiteConfigTab from '@/components/admin/AdminSiteConfigTab';

type AdminTab = 'products' | 'categories' | 'orders' | 'config';

export default function AdminPage() {
  const { exchangeRate, setExchangeRate } = useCartStore();

  // Autenticación administrativa
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  // Navegación de pestañas
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Inventario / Productos
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Pedidos y verificación
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<AdminReceiptData | null>(null);

  // Cargar productos del backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Cargar categorías del backend
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error cargando categorías:', err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Cargar órdenes del backend
  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Verificación de sesión al montar
  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminEmail(data.email || 'admin@quirona.com');
          fetchProducts();
          fetchCategories();
          fetchOrders();
        }
      })
      .catch(() => {})
      .finally(() => {
        setCheckingAuth(false);
      });
  }, [fetchProducts, fetchCategories, fetchOrders]);

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true);
    setAdminEmail(email);
    fetchProducts();
    fetchCategories();
    fetchOrders();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: string, productName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${productName}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert('Error: ' + data.error);
      }
    } catch {
      alert('Error de conexión al eliminar');
    }
  };

  // Actualizar estado de una orden
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
      } else {
        alert('Error al actualizar orden: ' + (data.error || 'error desconocido'));
      }
    } catch {
      alert('Error de conexión al actualizar el pedido');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Eliminar orden
  const handleDeleteOrder = async (orderId: string, orderCode: string) => {
    if (!confirm(`¿Estás seguro de eliminar el pedido ${orderCode}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        alert('Error al eliminar orden: ' + (data.error || 'error desconocido'));
      }
    } catch {
      alert('Error de conexión al eliminar la orden');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-quirona-cream p-6 rounded-2xl border-2 border-quirona-burgundy retro-shadow flex items-center gap-3 text-xs font-black text-quirona-burgundy animate-pulse">
          <Lock className="w-5 h-5 text-quirona-burgundy" />
          <span>Verificando acceso seguro...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginCard onLoginSuccess={handleLoginSuccess} />;
  }

  const reportedPaymentsCount = orders.filter((o) => o.status === 'PAGO_REPORTADO').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Admin */}
      <AdminHeader
        adminEmail={adminEmail}
        exchangeRate={exchangeRate}
        onUpdateExchangeRate={setExchangeRate}
        onLogout={handleLogout}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b-2 border-quirona-burgundy/20 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('products')}
          className={`retro-btn px-4 sm:px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy retro-shadow-sm'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/40 hover:border-quirona-burgundy'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Productos ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`retro-btn px-4 sm:px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy retro-shadow-sm'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/40 hover:border-quirona-burgundy'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Categorías ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`retro-btn px-4 sm:px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy retro-shadow-sm'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/40 hover:border-quirona-burgundy'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Verificación de Pagos ({orders.length})</span>
          {reportedPaymentsCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {reportedPaymentsCount} por verificar
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`retro-btn px-4 sm:px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all flex items-center gap-2 ${
            activeTab === 'config'
              ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy retro-shadow-sm'
              : 'bg-quirona-cream text-quirona-burgundy border-quirona-burgundy/40 hover:border-quirona-burgundy'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Textos & Tienda</span>
        </button>
      </div>

      {/* Pestaña 1: Productos */}
      {activeTab === 'products' && (
        <AdminProductsTable
          products={products}
          categories={categories}
          loading={loadingProducts}
          exchangeRate={exchangeRate}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* Pestaña 2: Categorías */}
      {activeTab === 'categories' && (
        <AdminCategoriesTable
          categories={categories}
          products={products}
          loading={loadingCategories}
          onRefresh={fetchCategories}
        />
      )}

      {/* Pestaña 3: Pedidos */}
      {activeTab === 'orders' && (
        <AdminOrdersTable
          orders={orders}
          loadingOrders={loadingOrders}
          updatingOrderId={updatingOrderId}
          onRefreshOrders={fetchOrders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onViewReceipt={setSelectedReceipt}
        />
      )}

      {/* Pestaña 4: Textos y Configuración de Tienda */}
      {activeTab === 'config' && <AdminSiteConfigTab />}

      {/* Modal de Crear Producto */}
      <AdminProductModal
        isOpen={isCreateModalOpen}
        categories={categories}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={fetchProducts}
      />

      {/* Modal de Visor de Comprobante */}
      <AdminReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
