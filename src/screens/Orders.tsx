import { clp, hhmm, storeById } from '../data'
import { go, isActive, useApp, type Order } from '../store'
import { StatusPill } from '../ui'

function OrderRow({ o }: { o: Order }) {
  const s = storeById(o.storeId)
  return (
    <button className="order-row" onClick={() => go('/voucher/' + o.id)}>
      <span className="or-emoji" style={{ background: s?.colorSoft }}>
        {s?.emoji}
      </span>
      <span className="or-text">
        <b>{s?.name}</b>
        <small>
          RF-{o.code} · {o.items.reduce((a, i) => a + i.qty, 0)} productos · {hhmm(o.createdAt)}
        </small>
      </span>
      <span className="or-right">
        <StatusPill status={o.status} />
        <b>{clp(o.total)}</b>
      </span>
    </button>
  )
}

export default function Orders() {
  const { orders } = useApp()
  const active = orders.filter(isActive)
  const past = orders.filter((o) => !isActive(o))

  return (
    <div className="screen">
      <header className="page-head">
        <h1>Mis pedidos</h1>
      </header>
      {!orders.length && (
        <div className="empty">
          <div className="empty-emoji">🎟️</div>
          <p className="muted">Aún no tienes pedidos. Tus vouchers aparecerán aquí.</p>
          <button className="btn btn-primary" onClick={() => go('/')}>
            Hacer mi primer pedido
          </button>
        </div>
      )}
      {active.length > 0 && (
        <>
          <h2 className="section-title">En curso</h2>
          <div className="list">{active.map((o) => <OrderRow key={o.id} o={o} />)}</div>
        </>
      )}
      {past.length > 0 && (
        <>
          <h2 className="section-title">Historial</h2>
          <div className="list">{past.map((o) => <OrderRow key={o.id} o={o} />)}</div>
        </>
      )}
    </div>
  )
}
