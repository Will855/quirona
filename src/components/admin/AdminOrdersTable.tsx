'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  Search,
  Eye,
  Check,
  XCircle,
  Trash2,
  MessageCircle,
} from 'lucide-react';
import { Order } from '@/types';
import { formatUSD, formatVES } from '@/lib/currency';
import { AdminReceiptData } from './AdminReceiptModal';

interface AdminOrdersTableProps {
  orders: Order[];
  loadingOrders: boolean;
  updatingOrderId: string | null;
  onRefreshOrders: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onDeleteOrder: (orderId: string, orderCode: string) => void;
  onViewReceipt: (receipt: AdminReceiptData) => void;
}

export default function AdminOrdersTable({
  orders,
  loadingOrders,
  updatingOrderId,
  onRefreshOrders,
  onUpdateOrderStatus,
  onDeleteOrder,
  onViewReceipt,
}: AdminOrdersTableProps) {
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // SEC-15: En el filtrado filteredOrders, comprobación de campos nulos en customer.fullName y orderCode
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    if (orderStatusFilter !== 'ALL' && order.status !== orderStatusFilter) {
      return false;
    }
    if (orderSearchTerm.trim()) {
      const term = orderSearchTerm.toLowerCase();
      const matchesCode = Boolean(order.orderCode && order.orderCode.toLowerCase().includes(term));
      const matchesCustomer = Boolean(
        order.customer?.fullName && order.customer.fullName.toLowerCase().includes(term)
      );
      const matchesPhone = Boolean(
        order.customer?.whatsapp && order.customer.whatsapp.toLowerCase().includes(term)
      );
      const matchesRef = Boolean(
        order.paymentReceipt?.referenceNumber &&
          order.paymentReceipt.referenceNumber.toLowerCase().includes(term)
      );
      return matchesCode || matchesCustomer || matchesPhone || matchesRef;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header de la sección y métricas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-quirona-burgundy">
            Verificación de Pagos y Despacho
          </h2>
          <p className="text-xs text-quirona-burgundy/80">
            Supervisa pedidos entrantes, valida captures bancarios y actualiza el estado de envío.
          </p>
        </div>

        <button
          onClick={onRefreshOrders}
          disabled={loadingOrders}
          className="retro-btn self-start sm:self-auto bg-quirona-yellow text-quirona-burgundy px-4 py-2 rounded-full font-black text-xs border-2 border-quirona-burgundy retro-shadow-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
          <span>{loadingOrders ? 'Actualizando...' : 'Actualizar Pedidos'}</span>
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-quirona-cream p-4 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-quirona-burgundy/70">
            <span>Por Verificar</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-quirona-burgundy mt-1">
            {orders.filter((o) => o.status === 'PAGO_REPORTADO').length}
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-0.5">Captures enviados</div>
        </div>

        <div className="bg-quirona-cream p-4 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-quirona-burgundy/70">
            <span>Esperando Pago</span>
            <Clock className="w-4 h-4 text-quirona-burgundy/60" />
          </div>
          <div className="text-2xl font-black text-quirona-burgundy mt-1">
            {orders.filter((o) => o.status === 'PENDIENTE_PAGO').length}
          </div>
          <div className="text-[10px] text-quirona-burgundy/60 font-semibold mt-0.5">Sin reporte aún</div>
        </div>

        <div className="bg-quirona-cream p-4 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-quirona-burgundy/70">
            <span>Verificados</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-black text-quirona-burgundy mt-1">
            {orders.filter((o) => o.status === 'PAGO_VERIFICADO').length}
          </div>
          <div className="text-[10px] text-green-700 font-bold mt-0.5">Listos para empaque</div>
        </div>

        <div className="bg-quirona-cream p-4 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-quirona-burgundy/70">
            <span>Despachados</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-quirona-burgundy mt-1">
            {orders.filter((o) => o.status === 'ENVIADO').length}
          </div>
          <div className="text-[10px] text-blue-700 font-bold mt-0.5">Entregados / En camino</div>
        </div>
      </div>

      {/* Filtros de estatus y barra de búsqueda */}
      <div className="bg-quirona-cream p-4 rounded-2xl border-2 border-quirona-burgundy retro-shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: `Todos (${orders.length})` },
            {
              id: 'PAGO_REPORTADO',
              label: `Por Revisar (${orders.filter((o) => o.status === 'PAGO_REPORTADO').length})`,
            },
            {
              id: 'PENDIENTE_PAGO',
              label: `Pendientes (${orders.filter((o) => o.status === 'PENDIENTE_PAGO').length})`,
            },
            {
              id: 'PAGO_VERIFICADO',
              label: `Verificados (${orders.filter((o) => o.status === 'PAGO_VERIFICADO').length})`,
            },
            {
              id: 'ENVIADO',
              label: `Enviados (${orders.filter((o) => o.status === 'ENVIADO').length})`,
            },
            {
              id: 'CANCELADO',
              label: `Cancelados (${orders.filter((o) => o.status === 'CANCELADO').length})`,
            },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setOrderStatusFilter(f.id)}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-full border transition-all ${
                orderStatusFilter === f.id
                  ? 'bg-quirona-burgundy text-quirona-cream border-quirona-burgundy shadow-sm'
                  : 'bg-quirona-bg text-quirona-burgundy border-quirona-burgundy/30 hover:border-quirona-burgundy'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-quirona-burgundy/50" />
          <input
            type="text"
            placeholder="Buscar por #QN, cliente o cel..."
            value={orderSearchTerm}
            onChange={(e) => setOrderSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-quirona-bg border border-quirona-burgundy/40 rounded-xl text-xs font-bold text-quirona-burgundy placeholder:text-quirona-burgundy/40 focus:outline-none focus:border-quirona-burgundy"
          />
        </div>
      </div>

      {/* Listado de Pedidos */}
      {loadingOrders ? (
        <div className="p-12 text-center text-sm font-bold text-quirona-burgundy">
          Cargando órdenes recibidas...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-quirona-cream p-12 rounded-3xl border-3 border-quirona-burgundy retro-shadow text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-quirona-yellow border-2 border-quirona-burgundy mx-auto flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-quirona-burgundy" />
          </div>
          <h3 className="text-lg font-black text-quirona-burgundy">
            {orders.length === 0 ? 'Aún no hay pedidos registrados' : 'No hay pedidos con los filtros seleccionados'}
          </h3>
          <p className="text-xs text-quirona-burgundy/80 max-w-sm mx-auto">
            {orders.length === 0
              ? 'Cuando un cliente realice un checkout en la tienda, el pedido aparecerá automáticamente aquí en tiempo real.'
              : 'Prueba cambiando el filtro de estado o limpiando el campo de búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            // SEC-16: Sanitización de número de WhatsApp para enlace wa.me eliminando guiones y espacios
            const rawPhone = order.customer?.whatsapp || '';
            const cleanPhone = rawPhone.replace(/[\s-]/g, '').replace(/\D/g, '');
            const waNumber = cleanPhone.startsWith('58')
              ? cleanPhone
              : cleanPhone.startsWith('0')
              ? `58${cleanPhone.substring(1)}`
              : `58${cleanPhone}`;
            const waChatUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
              `¡Hola ${order.customer?.fullName || 'Cliente'}! Te escribimos de Quirona Store acerca de tu pedido *${order.orderCode || ''}*`
            )}`;

            return (
              <div
                key={order.id}
                className="bg-quirona-cream rounded-2xl border-2 border-quirona-burgundy retro-shadow overflow-hidden transition-all"
              >
                {/* Cabecera de la Orden */}
                <div className="bg-quirona-bg/80 px-5 py-3 border-b-2 border-quirona-burgundy/15 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-base text-quirona-burgundy bg-quirona-yellow px-3 py-0.5 rounded-lg border border-quirona-burgundy">
                      {order.orderCode}
                    </span>
                    <span className="text-xs text-quirona-burgundy/70 font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {order.status === 'PENDIENTE_PAGO' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Esperando Pago
                      </span>
                    )}
                    {order.status === 'PAGO_REPORTADO' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 border border-blue-400 text-blue-800 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pago Reportado (Revisar)
                      </span>
                    )}
                    {order.status === 'PAGO_VERIFICADO' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-green-100 border border-green-400 text-green-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pago Verificado
                      </span>
                    )}
                    {order.status === 'ENVIADO' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-100 border border-purple-400 text-purple-800">
                        <Truck className="w-3.5 h-3.5" /> Paquete Despachado
                      </span>
                    )}
                    {order.status === 'CANCELADO' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-red-100 border border-red-300 text-red-700">
                        <XCircle className="w-3.5 h-3.5" /> Cancelado
                      </span>
                    )}
                  </div>
                </div>

                {/* Cuerpo de la Orden */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Columna 1: Cliente & Entrega */}
                    <div className="bg-quirona-bg p-3.5 rounded-xl border border-quirona-burgundy/30 space-y-2">
                      <div className="font-black text-quirona-burgundy uppercase text-[11px] border-b border-quirona-burgundy/15 pb-1">
                        Cliente y Destino
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-quirona-burgundy/70 font-semibold">Nombre:</span>
                        <span className="font-extrabold text-quirona-burgundy">{order.customer?.fullName || 'Cliente'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-quirona-burgundy/70 font-semibold">Cédula / DNI:</span>
                        <span className="font-mono font-bold text-quirona-burgundy">{order.customer?.idDocument || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-quirona-burgundy/70 font-semibold">WhatsApp:</span>
                        <a
                          href={waChatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-extrabold text-green-700 hover:underline flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded border border-green-300"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{order.customer?.whatsapp || 'N/A'}</span>
                        </a>
                      </div>
                      <div className="flex justify-between items-start pt-1 border-t border-quirona-burgundy/10">
                        <span className="text-quirona-burgundy/70 font-semibold">Modalidad:</span>
                        <span className="font-extrabold text-right text-quirona-burgundy">
                          {order.deliveryMethod === 'retiro'
                            ? 'Retiro Personal (Gratis)'
                            : order.deliveryMethod === 'delivery'
                            ? `Delivery: ${order.customer?.city || ''} (${order.customer?.address || 'Sin dirección'})`
                            : `Envío Nacional: ${order.customer?.city || ''} (${order.customer?.address || 'Sin dirección'})`}
                        </span>
                      </div>
                    </div>

                    {/* Columna 2: Pago & Comprobante */}
                    <div className="bg-quirona-bg p-3.5 rounded-xl border border-quirona-burgundy/30 space-y-2">
                      <div className="font-black text-quirona-burgundy uppercase text-[11px] border-b border-quirona-burgundy/15 pb-1 flex justify-between">
                        <span>Detalle de Pago</span>
                        <span className="font-bold lowercase text-[10px] text-quirona-burgundy/70">
                          tasa: {formatVES(order.exchangeRateUsed)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-quirona-burgundy/70 font-semibold">Método:</span>
                        <span className="font-black uppercase text-quirona-burgundy bg-quirona-yellow/50 px-2 py-0.5 rounded border border-quirona-burgundy/20">
                          {order.paymentMethod === 'pago_movil'
                            ? 'Pago Móvil'
                            : order.paymentMethod === 'transferencia'
                            ? 'Transferencia Bs'
                            : order.paymentMethod === 'zelle'
                            ? 'Zelle (USD)'
                            : 'Efectivo'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-quirona-burgundy/70 font-semibold">Total a Cobrar:</span>
                        <div className="text-right">
                          <div className="font-black text-quirona-burgundy text-sm">{formatUSD(order.subtotalUSD)}</div>
                          <div className="text-[10px] text-quirona-burgundy/60">~{formatVES(order.subtotalVES)}</div>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-quirona-burgundy/10 flex justify-between items-center">
                        <span className="text-quirona-burgundy/70 font-semibold">Comprobante Web:</span>
                        {order.paymentReceipt ? (
                          <div className="flex items-center gap-1.5">
                            {order.paymentReceipt.referenceNumber && (
                              <span className="font-mono font-bold bg-quirona-cream px-1.5 py-0.5 rounded border border-quirona-burgundy/20">
                                Ref: {order.paymentReceipt.referenceNumber}
                              </span>
                            )}
                            {order.paymentReceipt.receiptImageUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  onViewReceipt({
                                    imageUrl: order.paymentReceipt!.receiptImageUrl!,
                                    orderCode: order.orderCode,
                                    clientName: order.customer?.fullName || 'Cliente',
                                    referenceNumber: order.paymentReceipt?.referenceNumber,
                                  })
                                }
                                className="font-extrabold text-quirona-burgundy hover:text-black flex items-center gap-1 bg-quirona-yellow px-2 py-0.5 rounded border border-quirona-burgundy"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Ver Capture</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-quirona-burgundy/50 italic text-[11px]">
                            (Pendiente de envío)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prendas del pedido */}
                  <div className="border border-quirona-burgundy/20 rounded-xl p-3 bg-quirona-cream/50">
                    <div className="text-[11px] font-black uppercase text-quirona-burgundy mb-2">
                      Prendas Solicitadas ({order.items.reduce((acc, i) => acc + i.quantity, 0)} unidades):
                    </div>
                    <div className="divide-y divide-quirona-burgundy/10">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8 rounded border border-quirona-burgundy overflow-hidden bg-quirona-bg flex-shrink-0">
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-extrabold text-quirona-burgundy">{item.productName}</span>
                              <div className="text-[10px] text-quirona-burgundy/70 flex gap-1.5">
                                <span>Talla: <strong>{item.size}</strong></span>
                                <span>•</span>
                                <span>Color: <strong>{item.colorName}</strong></span>
                                <span>•</span>
                                <span>Cant: <strong>{item.quantity}</strong></span>
                              </div>
                            </div>
                          </div>
                          <div className="font-black text-quirona-burgundy text-right">
                            {formatUSD(item.unitPriceUSD * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Barra de Acciones del Pedido */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-quirona-burgundy/15">
                    <div className="flex items-center gap-2">
                      {order.status !== 'PAGO_VERIFICADO' &&
                        order.status !== 'ENVIADO' &&
                        order.status !== 'CANCELADO' && (
                          <button
                            type="button"
                            disabled={updatingOrderId === order.id}
                            onClick={() => onUpdateOrderStatus(order.id, 'PAGO_VERIFICADO')}
                            className="retro-btn bg-green-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-quirona-burgundy flex items-center gap-1.5 hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verificar Pago (Aprobar)</span>
                          </button>
                        )}

                      {order.status === 'PAGO_VERIFICADO' && (
                        <button
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => onUpdateOrderStatus(order.id, 'ENVIADO')}
                          className="retro-btn bg-quirona-yellow text-quirona-burgundy font-black text-xs px-3.5 py-1.5 rounded-full border border-quirona-burgundy flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Marcar como Despachado</span>
                        </button>
                      )}

                      {order.status !== 'CANCELADO' && (
                        <button
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => onUpdateOrderStatus(order.id, 'CANCELADO')}
                          className="text-xs font-bold text-quirona-burgundy/70 hover:text-red-700 px-2 py-1 disabled:opacity-50"
                        >
                          Cancelar Pedido
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteOrder(order.id, order.orderCode)}
                      className="p-1.5 rounded-lg text-quirona-burgundy/50 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Eliminar pedido"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
