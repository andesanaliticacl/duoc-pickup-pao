import type { CSSProperties } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { clp, hhmm, storeById } from '../data'
import { go, useApp, type OrderStatus } from '../store'
import { BackButton, StatusPill } from '../ui'

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'recibido', label: 'Recibido', icon: '📝' },
  { key: 'preparando', label: 'Preparando', icon: '👩‍🍳' },
  { key: 'listo', label: 'Listo', icon: '🛍️' },
  { key: 'entregado', label: 'Retirado', icon: '✅' },
]

export default function Voucher({ id }: { id: string }) {
  const { orders, setStatus, toast } = useApp()
  const order = orders.find((o) => o.id === id)
  const store = order && storeById(order.storeId)

  if (!order || !store)
    return (
      <div className="screen empty">
        <p>No encontramos este voucher.</p>
        <button className="btn btn-primary" onClick={() => go('/pedidos')}>
          Ver mis pedidos
        </button>
      </div>
    )

  const stepIdx = STEPS.findIndex((s) => s.key === order.status)
  const done = order.status === 'entregado'
  const cancelled = order.status === 'cancelado'

  const message = {
    recibido: `${store.name} recibió tu pedido. Te avisamos cuando empiecen a prepararlo.`,
    preparando: `Están preparando tu pedido. Retiro estimado: ${hhmm(order.pickupAt)}.`,
    listo: `¡Ya puedes ir! Acércate a ${store.name} (${store.location}) y muestra este código.`,
    entregado: '¡Gracias por tu compra! Que lo disfrutes.',
    cancelado: 'Este pedido fue cancelado.',
  }[order.status]

  return (
    <div className="screen voucher-screen" style={{ '--c': store.color, '--cs': store.colorSoft } as CSSProperties}>
      <header className="page-head">
        <BackButton to="/pedidos" />
        <h1>Tu voucher</h1>
        <span />
      </header>

      <div className={`status-banner s-${order.status}`}>{message}</div>

      {!cancelled && (
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.key} className={i < stepIdx || done ? 'done' : i === stepIdx ? 'current' : ''}>
              <span className="step-dot">{s.icon}</span>
              <small>{s.label}</small>
            </li>
          ))}
        </ol>
      )}

      <article className={`ticket ${done || cancelled ? 'used' : ''}`}>
        <div className="ticket-top">
          <span className="t-store">
            {store.emoji} {store.name}
          </span>
          <StatusPill status={order.status} />
        </div>
        <div className="qr-wrap">
          <QRCodeSVG value={`PAO:${order.code}`} size={168} fgColor="#14284B" level="M" />
          {(done || cancelled) && <span className="stamp">{done ? 'RETIRADO' : 'CANCELADO'}</span>}
        </div>
        <div className="code-label">Código de retiro</div>
        <div className="code">PAO-{order.code}</div>
        <div className="ticket-cut" />
        <ul className="t-items">
          {order.items.map((i) => (
            <li key={i.productId}>
              <span>
                {i.qty}× {i.name}
              </span>
              <span>{clp(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        {order.note && <p className="t-note">📝 {order.note}</p>}
        <div className="t-total">
          <span>{done ? 'Pagado en el local' : 'A pagar en el local'}</span>
          <b>{clp(order.total)}</b>
        </div>
        <div className="t-meta">
          <span>🕒 Retiro: {order.pickupLabel}</span>
          <span>
            Pedido a las {hhmm(order.createdAt)} · {order.customer.name}
          </span>
        </div>
      </article>

      {order.status === 'recibido' && (
        <button
          className="btn btn-ghost btn-block"
          onClick={() => {
            if (confirm('¿Cancelar este pedido?')) {
              setStatus(order.id, 'cancelado')
              toast('Pedido cancelado')
            }
          }}
        >
          Cancelar pedido
        </button>
      )}
    </div>
  )
}
