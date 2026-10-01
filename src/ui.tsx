import { go, useApp, isActive, STATUS_LABEL, type OrderStatus } from './store'

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)

const ICONS = {
  plaza: 'M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6',
  pedidos: 'M6 2h12v20l-3-2-3 2-3-2-3 2V2zM9 7h6M9 11h6M9 15h4',
  carrito: 'M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6M9 21h.01M18 21h.01',
  perfil: 'M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
}

export function BottomNav({ section }: { section: string }) {
  const { cart, orders } = useApp()
  const count = cart.reduce((a, c) => a + c.qty, 0)
  const active = orders.filter(isActive).length
  const items = [
    { key: '', label: 'Plaza', icon: ICONS.plaza, badge: 0, match: ['', 'tienda'] },
    { key: 'pedidos', label: 'Pedidos', icon: ICONS.pedidos, badge: active, match: ['pedidos', 'voucher'] },
    { key: 'carrito', label: 'Carrito', icon: ICONS.carrito, badge: count, match: ['carrito'] },
    { key: 'perfil', label: 'Perfil', icon: ICONS.perfil, badge: 0, match: ['perfil'] },
  ]
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button key={it.key} className={it.match.includes(section) ? 'on' : ''} onClick={() => go('/' + it.key)}>
          <span className="nav-icon">
            <Icon d={it.icon} />
            {it.badge > 0 && <span className="badge">{it.badge}</span>}
          </span>
          {it.label}
        </button>
      ))}
    </nav>
  )
}

export function Toasts() {
  const { toasts } = useApp()
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.msg}
        </div>
      ))}
    </div>
  )
}

export function Stepper({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  return (
    <div className="stepper">
      <button aria-label="Quitar uno" onClick={() => onChange(qty - 1)}>
        {qty === 1 ? '🗑' : '−'}
      </button>
      <span>{qty}</span>
      <button aria-label="Agregar uno" onClick={() => onChange(qty + 1)}>
        +
      </button>
    </div>
  )
}

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`pill pill-${status}`}>{STATUS_LABEL[status]}</span>
}

export function BackButton({ to = '/' }: { to?: string }) {
  return (
    <button className="back" aria-label="Volver" onClick={() => go(to)}>
      <Icon d="M15 18l-6-6 6-6" />
    </button>
  )
}
