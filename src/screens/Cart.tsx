import { useState } from 'react'
import { STORES, clp, hhmm } from '../data'
import { go, useApp, type Payment } from '../store'
import { Stepper } from '../ui'

// Tarjetas ficticias para la maqueta (no se ingresan datos reales)
const CARDS = [
  { id: 'deb', label: 'Débito', brand: 'DÉBITO', last4: '4242', holder: 'Tarjeta de prueba' },
  { id: 'cred', label: 'Crédito', brand: 'CRÉDITO', last4: '1881', holder: 'Tarjeta de prueba' },
]

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
  const [payMode, setPayMode] = useState<'app' | 'local'>('app')
  const [cardId, setCardId] = useState(CARDS[0].id)
  const [sheet, setSheet] = useState<'closed' | 'form' | 'processing' | 'ok'>('closed')

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

  const computePickup = () => {
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
    return { label, at }
  }

  const finish = (payment: Payment) => {
    const created = placeOrders(computePickup(), note.trim(), payment)
    if (created.length === 1) go('/voucher/' + created[0].id)
    else {
      toast(`🎟️ ${created.length} vouchers generados`)
      go('/pedidos')
    }
  }

  const confirm = () => {
    if (payMode === 'local') finish({ paid: false, method: 'En el local' })
    else setSheet('form')
  }

  // Pago simulado: no se conecta a ninguna pasarela ni se cobra nada
  const payNow = () => {
    const card = CARDS.find((c) => c.id === cardId)!
    setSheet('processing')
    setTimeout(() => setSheet('ok'), 1600)
    setTimeout(() => finish({ paid: true, method: `${card.label} •••• ${card.last4}` }), 2600)
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

      <section className="card">
        <h3 className="card-title">¿Cómo pagas?</h3>
        <div className="pay-options">
          <button className={payMode === 'app' ? 'pay-opt on' : 'pay-opt'} onClick={() => setPayMode('app')}>
            <span className="pay-icon">💳</span>
            <span>
              <b>Pagar ahora en la app</b>
              <small>Débito o crédito. Llegas y retiras directo.</small>
            </span>
            <span className="radio" />
          </button>
          <button className={payMode === 'local' ? 'pay-opt on' : 'pay-opt'} onClick={() => setPayMode('local')}>
            <span className="pay-icon">💵</span>
            <span>
              <b>Pagar al retirar en el local</b>
              <small>Efectivo, débito o crédito en caja.</small>
            </span>
            <span className="radio" />
          </button>
        </div>
      </section>

      <div className="checkout-bar">
        <div>
          <small>{payMode === 'app' ? 'Total · pagas en la app' : 'Total · pagas en el local'}</small>
          <b>{clp(total)}</b>
        </div>
        <button className="btn btn-primary" onClick={confirm}>
          {payMode === 'app' ? 'Ir a pagar' : 'Confirmar pedido'}
        </button>
      </div>

      {sheet !== 'closed' && (
        <div className="sheet-backdrop" onClick={() => sheet === 'form' && setSheet('closed')}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            {sheet === 'form' && (
              <>
                <div className="sheet-grip" />
                <div className="demo-badge">MODO DEMO · no se realiza ningún cobro</div>
                <h2>Pagar {clp(total)}</h2>
                <p className="muted small">Elige un medio de pago</p>
                <div className="pay-options">
                  {CARDS.map((c) => (
                    <button key={c.id} className={cardId === c.id ? 'pay-opt on' : 'pay-opt'} onClick={() => setCardId(c.id)}>
                      <span className={`mini-card ${c.id}`}>{c.brand}</span>
                      <span>
                        <b>
                          {c.label} •••• {c.last4}
                        </b>
                        <small>{c.holder}</small>
                      </span>
                      <span className="radio" />
                    </button>
                  ))}
                  <button className="pay-opt add-card" onClick={() => toast('En la versión real podrás agregar tus tarjetas')}>
                    <span className="pay-icon">＋</span>
                    <span>
                      <b>Agregar tarjeta</b>
                      <small>Disponible en la versión real</small>
                    </span>
                  </button>
                </div>
                <button className="btn btn-primary btn-block" onClick={payNow}>
                  Pagar {clp(total)}
                </button>
                <button className="btn btn-ghost btn-block" onClick={() => setSheet('closed')}>
                  Cancelar
                </button>
              </>
            )}
            {sheet === 'processing' && (
              <div className="pay-status">
                <span className="spinner" />
                <h2>Procesando pago…</h2>
                <p className="muted small">Simulación, no se cobra nada</p>
              </div>
            )}
            {sheet === 'ok' && (
              <div className="pay-status">
                <span className="pay-ok">✓</span>
                <h2>¡Pago aprobado!</h2>
                <p className="muted small">Generando tu voucher…</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
