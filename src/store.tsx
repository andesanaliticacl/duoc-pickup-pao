import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { STORES, findProduct, storeById } from './data'

// Maqueta sin backend: todo vive en localStorage y se sincroniza entre pestañas
// (así la vista "Modo Local" y la del alumno se actualizan en vivo en el mismo navegador).

export type User = { name: string; email: string }
export type CartItem = { productId: string; storeId: string; qty: number }
export type OrderStatus = 'recibido' | 'preparando' | 'listo' | 'entregado' | 'cancelado'
export type OrderItem = { productId: string; name: string; emoji: string; price: number; qty: number }
export type Order = {
  id: string
  code: string
  storeId: string
  items: OrderItem[]
  total: number
  pickupLabel: string
  pickupAt: number
  note: string
  createdAt: number
  status: OrderStatus
  history: { status: OrderStatus; at: number }[]
  customer: User
  paid?: boolean
  payMethod?: string
}
export type Pickup = { label: string; at: number }
export type Payment = { paid: boolean; method: string }

type Persisted = { user: User | null; cart: CartItem[]; orders: Order[]; autoSim: boolean }

const KEY = 'retira-facil-v1'
const DEFAULTS: Persisted = { user: null, cart: [], orders: [], autoSim: true }

const load = (): Persisted => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  return DEFAULTS
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const newCode = (taken: Set<string>) => {
  let c = ''
  do {
    c = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
  } while (taken.has(c))
  return c
}

export const isActive = (o: Order) => o.status !== 'entregado' && o.status !== 'cancelado'

type Ctx = Persisted & {
  login: (u: User) => void
  logout: () => void
  addToCart: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clearCart: () => void
  placeOrders: (pickup: Pickup, note: string, payment: Payment) => Order[]
  setStatus: (orderId: string, status: OrderStatus) => void
  setAutoSim: (v: boolean) => void
  resetDemo: () => void
  waitFor: (storeId: string) => number
  toast: (msg: string) => void
  toasts: { id: string; msg: string }[]
}

const AppContext = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load)
  const [toasts, setToasts] = useState<{ id: string; msg: string }[]>([])
  const stateRef = useRef(state)
  stateRef.current = state

  // Persistir
  useEffect(() => {
    const json = JSON.stringify(state)
    if (localStorage.getItem(KEY) !== json) localStorage.setItem(KEY, json)
  }, [state])

  // Sincronizar entre pestañas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setState(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Simulación: el local "recibe" y "prepara" solo, para que la demo se vea viva
  useEffect(() => {
    const t = setInterval(() => {
      const s = stateRef.current
      if (!s.autoSim) return
      const now = Date.now()
      let changed = false
      const orders = s.orders.map((o) => {
        const last = o.history[o.history.length - 1]?.at ?? o.createdAt
        let next: OrderStatus | null = null
        if (o.status === 'recibido' && now - last > 8000) next = 'preparando'
        else if (o.status === 'preparando' && now - last > 25000) next = 'listo'
        if (!next) return o
        changed = true
        return { ...o, status: next, history: [...o.history, { status: next, at: now }] }
      })
      if (changed) setState((prev) => ({ ...prev, orders }))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  const toast = useCallback((msg: string) => {
    const id = uid()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200)
  }, [])

  const ctx: Ctx = {
    ...state,
    toasts,
    toast,
    login: (user) => setState((s) => ({ ...s, user })),
    logout: () => setState((s) => ({ ...s, user: null, cart: [] })),
    addToCart: (productId) => {
      const found = findProduct(productId)
      if (!found) return
      setState((s) => {
        const existing = s.cart.find((c) => c.productId === productId)
        const cart = existing
          ? s.cart.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c))
          : [...s.cart, { productId, storeId: found.store.id, qty: 1 }]
        return { ...s, cart }
      })
    },
    setQty: (productId, qty) =>
      setState((s) => ({
        ...s,
        cart: qty <= 0 ? s.cart.filter((c) => c.productId !== productId) : s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
      })),
    clearCart: () => setState((s) => ({ ...s, cart: [] })),
    placeOrders: (pickup, note, payment) => {
      const s = stateRef.current
      if (!s.user) return []
      const taken = new Set(s.orders.map((o) => o.code))
      const now = Date.now()
      const created: Order[] = []
      for (const store of STORES) {
        const lines = s.cart.filter((c) => c.storeId === store.id)
        if (!lines.length) continue
        const items: OrderItem[] = lines.map((l) => {
          const p = store.products.find((x) => x.id === l.productId)!
          return { productId: p.id, name: p.name, emoji: p.emoji, price: p.price, qty: l.qty }
        })
        const code = newCode(taken)
        taken.add(code)
        created.push({
          id: uid(),
          code,
          storeId: store.id,
          items,
          total: items.reduce((a, i) => a + i.price * i.qty, 0),
          pickupLabel: pickup.label,
          pickupAt: pickup.at,
          note,
          createdAt: now,
          status: 'recibido',
          history: [{ status: 'recibido', at: now }],
          customer: s.user,
          paid: payment.paid,
          payMethod: payment.method,
        })
      }
      setState((prev) => ({ ...prev, cart: [], orders: [...created, ...prev.orders] }))
      return created
    },
    setStatus: (orderId, status) =>
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id === orderId ? { ...o, status, history: [...o.history, { status, at: Date.now() }] } : o,
        ),
      })),
    setAutoSim: (autoSim) => setState((s) => ({ ...s, autoSim })),
    resetDemo: () => setState((s) => ({ ...DEFAULTS, user: s.user })),
    waitFor: (storeId) => {
      const base = storeById(storeId)?.baseWait ?? 5
      const queue = state.orders.filter((o) => o.storeId === storeId && (o.status === 'recibido' || o.status === 'preparando')).length
      return base + queue * 3
    },
  }

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const c = useContext(AppContext)
  if (!c) throw new Error('useApp fuera de AppProvider')
  return c
}

export const go = (path: string) => {
  window.location.hash = path
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  recibido: 'Recibido',
  preparando: 'En preparación',
  listo: 'Listo para retirar',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}
