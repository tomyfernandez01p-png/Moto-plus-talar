"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productoId: string;
  nombre: string;
  slug: string;
  codigo: string;
  precio: number;
  imagen: string | null;
  cantidad: number;
  stockDisponible: number;
}

interface CartContextValue {
  items: CartItem[];
  cantidadTotal: number;
  subtotal: number;
  agregar: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  quitar: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  vaciar: () => void;
  abierto: boolean;
  setAbierto: (abierto: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mpt_carrito_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage no disponible (modo privado, etc.): el carrito arranca vacío.
    } finally {
      setHidratado(true);
    }
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // idem
    }
  }, [items, hidratado]);

  const agregar = useCallback((item: Omit<CartItem, "cantidad">, cantidad = 1) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.productoId === item.productoId);
      if (existente) {
        const nuevaCantidad = Math.min(
          existente.cantidad + cantidad,
          item.stockDisponible || existente.cantidad + cantidad
        );
        return prev.map((i) =>
          i.productoId === item.productoId ? { ...i, cantidad: nuevaCantidad } : i
        );
      }
      return [...prev, { ...item, cantidad: Math.max(1, cantidad) }];
    });
    setAbierto(true);
  }, []);

  const quitar = useCallback((productoId: string) => {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }, []);

  const actualizarCantidad = useCallback((productoId: string, cantidad: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productoId === productoId
          ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stockDisponible || cantidad)) }
          : i
      )
    );
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const cantidadTotal = useMemo(() => items.reduce((acc, i) => acc + i.cantidad, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    cantidadTotal,
    subtotal,
    agregar,
    quitar,
    actualizarCantidad,
    vaciar,
    abierto,
    setAbierto,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
