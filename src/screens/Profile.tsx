import { clp } from '../data'
import { go, useApp } from '../store'

export default function Profile() {
  const { user, orders, autoSim, setAutoSim, logout, resetDemo, toast } = useApp()
  if (!user) return null
  const delivered = orders.filter((o) => o.status === 'entregado')
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="screen">
      <header className="page-head">
        <h1>Perfil</h1>
      </header>
      <section className="card profile-card">
        <span className="avatar">{initials}</span>
        <div>
          <b>{user.name}</b>
          <small className="muted">{user.email}</small>
        </div>
      </section>

      <div className="stats">
        <div>
          <b>{orders.length}</b>
          <small>pedidos</small>
        </div>
        <div>
          <b>{delivered.length}</b>
          <small>retirados</small>
        </div>
        <div>
          <b>{clp(delivered.reduce((a, o) => a + o.total, 0))}</b>
          <small>gastado</small>
        </div>
      </div>

      <h2 className="section-title">Demo</h2>
      <section className="card menu">
        <button onClick={() => window.open(window.location.pathname + '#/local', '_blank')}>
          <span>🏪</span>
          <span>
            <b>Abrir Modo Local</b>
            <small>La vista del local: recibe pedidos y valida vouchers (se abre en otra pestaña)</small>
          </span>
        </button>
        <label className="toggle-row">
          <span>⚙️</span>
          <span>
            <b>Simular avance del pedido</b>
            <small>El local "prepara" tu pedido automáticamente en ~30 s</small>
          </span>
          <input type="checkbox" checked={autoSim} onChange={(e) => setAutoSim(e.target.checked)} />
        </label>
        <button
          onClick={() => {
            if (confirm('¿Borrar todos los pedidos de la demo?')) {
              resetDemo()
              toast('Datos de demo reiniciados')
            }
          }}
        >
          <span>🧹</span>
          <span>
            <b>Reiniciar datos de demo</b>
            <small>Borra carrito y pedidos de este dispositivo</small>
          </span>
        </button>
      </section>

      <button
        className="btn btn-ghost btn-block"
        onClick={() => {
          logout()
          go('/')
        }}
      >
        Cerrar sesión
      </button>
      <p className="muted small center">Duoc Pick Up PAO · versión maqueta 0.1</p>
    </div>
  )
}
