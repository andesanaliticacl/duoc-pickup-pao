import { useState, type CSSProperties, type FormEvent } from 'react'
import { STORES, clp, hhmm, storeById } from '../data'
import { go, useApp, type Order, type OrderStatus } from '../store'
import { StatusPill, Toasts } from '../ui'

const normalize = (s: string) => s.toUpperCase().replace(/^(RF|PAO)[-:\s]?/, '').replace(/[^A-Z0-9]/g, '')

const COLUMNS: { status: OrderStatus; title: string; action?: { label: string; next: OrderStatus } }[] = [
  { status: 'recibido', title: 'Nuevos', action: { label: 'Empezar a preparar', next: 'preparando' } },
  { status: 'preparando', title: 'En preparación', action: { label: 'Marcar como listo', next: 'listo' } },
  { status: 'listo', title: 'Listos para retirar' },
]

function QueueCard({ o, action }: { o: Order; action?: { label: string; next: OrderStatus } }) {
  const { setStatus } = useApp()
  return (
    <article className="queue-card">
      <div className="qc-head">
        <b>RF-{o.code}</b>
        <small>{hhmm(o.createdAt)}</small>
      </div>
      <small className="muted">
        {o.customer.name} · retiro: {o.pickupLabel}
      </small>
      <ul>
        {o.items.map((i) => (
          <li key={i.productId}>
            {i.qty}× {i.name}
          </li>
        ))}
      </ul>
      {o.note && <p className="t-note">📝 {o.note}</p>}
      <div className="qc-foot">
        <b>{clp(o.total)} {o.paid ? <span className="paid-tag">PAGADO</span> : <span className="unpaid-tag">COBRAR</span>}</b>
        {action ? (
          <button className="btn btn-sm btn-primary" onClick={() => setStatus(o.id, action.next)}>
            {action.label}
          </button>
        ) : (
          <small className="muted">Esperando al cliente</small>
        )}
      </div>
    </article>
  )
}

export default function LocalMode() {
  const { orders, setStatus, toast } = useApp()
  const [storeId, setStoreId] = useState(() => sessionStorage.getItem('rf-local') ?? STORES[0].id)
  const [input, setInput] = useState('')
  const [searched, setSearched] = useState('')
  const store = storeById(storeId)!

  const pick = (id: string) => {
    setStoreId(id)
    sessionStorage.setItem('rf-local', id)
    setSearched('')
    setInput('')
  }

  const mine = orders.filter((o) => o.storeId === storeId)
  const today = mine.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString())
  const delivered = today.filter((o) => o.status === 'entregado')

  const match = searched ? orders.find((o) => o.code === searched) : undefined
  const validate = (e: FormEvent) => {
    e.preventDefault()
    setSearched(normalize(input))
  }

  return (
    <div className="local" style={{ '--c': store.color, '--cs': store.colorSoft } as CSSProperties}>
      <header className="local-head">
        <img src="/logo.png" alt="" />
        <div>
          <small>Modo Local</small>
          <h1>
            {store.emoji} {store.name}
          </h1>
        </div>
        <button className="link-btn light" onClick={() => go('/')}>
          Salir
        </button>
      </header>

      <div className="chips local-stores">
        {STORES.map((s) => (
          <button key={s.id} className={s.id === storeId ? 'chip on' : 'chip'} onClick={() => pick(s.id)}>
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      <div className="local-grid">
        <section className="card validate">
          <h2>Validar voucher</h2>
          <p className="muted small">Pide al cliente su código (o escanea el QR) y cobra el total.</p>
          <form onSubmit={validate} className="validate-form">
            <span className="prefix">RF-</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="K7QM"
              maxLength={12}
              autoCapitalize="characters"
              aria-label="Código del voucher"
            />
            <button className="btn btn-primary" type="submit">
              Buscar
            </button>
          </form>

          {searched && !match && <div className="v-result bad">❌ No existe un voucher con el código RF-{searched}</div>}
          {match && match.storeId !== storeId && (
            <div className="v-result bad">⚠️ Este voucher es de {storeById(match.storeId)?.name}, no de este local.</div>
          )}
          {match && match.storeId === storeId && (
            <div className={`v-result ${match.status === 'entregado' || match.status === 'cancelado' ? 'bad' : 'ok'}`}>
              <div className="qc-head">
                <b>RF-{match.code}</b>
                <StatusPill status={match.status} />
              </div>
              <small className="muted">
                {match.customer.name} · {match.customer.email}
              </small>
              <ul>
                {match.items.map((i) => (
                  <li key={i.productId}>
                    {i.qty}× {i.name} <span>{clp(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              {match.status === 'entregado' && (
                <p>
                  <b>Ya fue retirado</b> a las {hhmm(match.history[match.history.length - 1].at)}.
                </p>
              )}
              {match.status === 'cancelado' && <p><b>El cliente canceló este pedido.</b></p>}
              {match.status !== 'entregado' && match.status !== 'cancelado' && (
                <>
                  {match.status !== 'listo' && <p className="small">⚠️ Aún no está marcado como listo.</p>}
                  <button
                    className="btn btn-success btn-block"
                    onClick={() => {
                      setStatus(match.id, 'entregado')
                      toast(match.paid ? `✅ RF-${match.code} entregado` : `✅ RF-${match.code} cobrado y entregado`)
                      setInput('')
                    }}
                  >
                    {match.paid ? 'Ya pagado en la app · Entregar' : `Cobrar ${clp(match.total)} y entregar`}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="stats local-stats">
            <div>
              <b>{today.length}</b>
              <small>pedidos hoy</small>
            </div>
            <div>
              <b>{delivered.length}</b>
              <small>entregados</small>
            </div>
            <div>
              <b>{clp(delivered.reduce((a, o) => a + o.total, 0))}</b>
              <small>recaudado</small>
            </div>
          </div>
        </section>

        <div className="queue">
          {COLUMNS.map((col) => {
            const list = mine.filter((o) => o.status === col.status).sort((a, b) => a.createdAt - b.createdAt)
            return (
              <section key={col.status} className="queue-col">
                <h3>
                  {col.title} <span className="count">{list.length}</span>
                </h3>
                {list.length ? list.map((o) => <QueueCard key={o.id} o={o} action={col.action} />) : <p className="muted small">Sin pedidos</p>}
              </section>
            )
          })}
        </div>
      </div>
      <p className="muted small center pad">
        Tip demo: abre la app del alumno en otra pestaña de este mismo navegador y verás los pedidos llegar en vivo.
      </p>
      <Toasts />
    </div>
  )
}
