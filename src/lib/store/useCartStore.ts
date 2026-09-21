import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types';
import { DEFAULT_EXCHANGE_RATE, convertUSDToVES } from '@/lib/currency';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  exchangeRate: number;
  
  // Acciones
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setExchangeRate: (rate: number) => void;

  // Calculados
  getTotalItems: () => number;
  getSubtotalUSD: () => number;
  getSubtotalVES: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      exchangeRate: DEFAULT_EXCHANGE_RATE,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            const newQty = Math.min(
              currentItem.quantity + newItem.quantity,
              newItem.availableStock
            );
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: newQty,
            };
            return { items: updatedItems, isOpen: true };
          }

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) };
          }
          return {
            items: state.items.map((item) =>
              item.id === itemId
                ? { ...item, quantity: Math.min(quantity, item.availableStock) }
                : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setExchangeRate: (rate) => set({ exchangeRate: rate }),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotalUSD: () => {
        const total = get().items.reduce(
          (acc, item) => acc + item.unitPriceUSD * item.quantity,
          0
        );
        return Math.round(total * 100) / 100;
      },

      getSubtotalVES: () => {
        const usd = get().getSubtotalUSD();
        const rate = get().exchangeRate;
        return convertUSDToVES(usd, rate);
      },
    }),
    {
      name: 'quirona-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        exchangeRate: state.exchangeRate,
      }),
    }
  )
);
