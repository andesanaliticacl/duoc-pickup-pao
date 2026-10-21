import { useState } from 'react'
import { STORES, clp, hhmm } from '../data'
import { go, useApp } from '../store'
import { Stepper } from '../ui'

const OPTIONS = [
  { key: 'asap', label: 'Lo antes posible', min: 0 },
  { key: '15', label: 'En 15 min', min: 15 },
  { key: '30', label: 'En 30 min', min: 30 },
  { key: 'hora', label: 'Elegir hora', min: -1 },
]

const defaultTime = () => {
  const d = new Date(Date.now() + 60 * 60000)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function Cart() {
  const { cart, setQty, placeOrders, clearCart, waitFor, toast } = useApp()
  const [when, setWhen] = useState('asap')
  const [time, setTime] = useState(defaultTime)
  const [note, setNote] = useState('')

  const groups = STORES.map((s) => ({
    store: s,
    lines: cart
      .filter((c) => c.storeId === s.id)
      .map((c) => ({ ...c, product: s.products.find((p) => p.id === c.productId)! })),
  })).filter((g) => g.lines.length)

  const total = groups.reduce((a, g) => a + g.lines.reduce((b, l) => b + l.product.price * l.qty, 0), 0)

  if (!groups.length)
    return (
      <div className="screen empty">
        <div className="empty-emoji">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p className="muted">Date una vuelta por los locales y elige algo rico.</p>
        <button className="btn btn-primary" onClick={() => go('/')}>
          Ver locales
        </button>
      </div>
    )

  const confirm = () => {
    const opt = OPTIONS.find((o) => o.key === when)!
    let at: number
    let label: string
    if (opt.min === -1) {
      const [h, m] = time.split(':').map(Number)
      const d = new Date()
      d.setHours(h, m, 0, 0)
      at = d.getTime()
      label = `A las ${time}`
    } else if (opt.min === 0) {
      at = Date.now() + Math.max(...groups.map((g) => waitFor(g.store.id))) * 60000
      label = 'Lo antes posible'
    } else {
      at = Date.now() + opt.min * 60000
      label = `${opt.label} (${hhmm(at)})`
    }
    const created = placeOrders({ label, at }, note.trim())
    if (created.length === 1) go('/voucher/' + created[0].id)
    else {
      toast(`🎟️ ${created.length} vouchers generados`)
      go('/pedidos')
    }
  }

  return (
    <div className="screen">
      <header className="page-head">
        <h1>Tu carrito</h1>
        <button className="link-btn" onClick={clearCart}>
          Vaciar
        </button>
      </header>

      {groups.map(({ store, lines }) => (
        <section key={store.id} className="card cart-group">
          <div className="cg-head" style={{ color: store.color }}>
            <span>{store.emoji}</span>
            <b>{store.name}</b>
            <button className="link-btn small" onClick={() => go('/tienda/' + store.id)}>
              + Agregar más
            </button>
          </div>
          {lines.map((l) => (
            <div key={l.productId} className="cart-line">
              <span className="cl-emoji">{l.product.emoji}</span>
              <span className="cl-name">
                {l.product.name}
                <small>{clp(l.product.price)} c/u</small>
              </span>
              <Stepper qty={l.qty} onChange={(n) => setQty(l.productId, n)} />
            </div>
          ))}
        </section>
      ))}
      {groups.length > 1 && <p className="muted small pad">Se generará un voucher por cada local.</p>}

      <section className="card">
        <h3 className="card-title">¿Cuándo lo retiras?</h3>
        <div className="chips wrap">
          {OPTIONS.map((o) => (
            <button key={o.key} className={when === o.key ? 'chip on' : 'chip'} onClick={() => setWhen(o.key)}>
              {o.label}
            </button>
          ))}
        </div>
        {when === 'hora' && (
          <label className="time-row">
            Hora de retiro
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        )}
        <textarea placeholder="Comentario para el local (opcional): sin azúcar, sin cebolla…" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </section>

      <section className="card pay-card">
        <span className="pay-icon">💵</span>
        <div>
          <b>Pagas al retirar en el local</b>
          <p className="muted small">Efectivo, débito o crédito. Muestra tu código en caja y listo.</p>
        </div>
      </section>

      <div className="checkout-bar">
        <div>
          <small>Total · pagas en el local</small>
          <b>{clp(total)}</b>
        </div>
        <button className="btn btn-primary" onClick={confirm}>
          Confirmar pedido
        </button>
      </div>
    </div>
  )
}
