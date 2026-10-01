import type { CSSProperties } from 'react'
import { STORES, storeById } from '../data'
import { go, isActive, useApp } from '../store'
import { StatusPill } from '../ui'

function PlazaBackground() {
  const trees: [number, number, number][] = [
    [22, 196, 18], [338, 186, 20], [30, 330, 16], [330, 320, 17], [118, 150, 13], [244, 150, 13], [100, 330, 12], [262, 332, 12],
  ]
  const flowers: [number, number, string][] = [
    [60, 220, '#FF7AA8'], [70, 232, '#FFD23F'], [298, 222, '#FF7AA8'], [288, 232, '#FFFFFF'], [150, 330, '#FFD23F'], [212, 330, '#FF7AA8'],
  ]
  return (
    <svg className="plaza-bg" viewBox="0 0 360 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="360" height="420" fill="#B9E29B" />
      <ellipse cx="80" cy="60" rx="70" ry="30" fill="#AAD88B" />
      <ellipse cx="300" cy="390" rx="80" ry="34" fill="#AAD88B" />
      {/* senderos */}
      <path d="M180 0 V420 M0 206 H360" stroke="#EBD8B0" strokeWidth="34" />
      <path d="M180 0 V420 M0 206 H360" stroke="#E2CB9B" strokeWidth="34" strokeDasharray="2 14" />
      {/* plaza central */}
      <circle cx="180" cy="206" r="74" fill="#EBD8B0" />
      <circle cx="180" cy="206" r="74" fill="none" stroke="#DCC18C" strokeWidth="3" strokeDasharray="6 6" />
      {/* pileta */}
      <circle cx="180" cy="206" r="32" fill="#FFFFFF" />
      <circle cx="180" cy="206" r="27" fill="#8FD3F4" />
      <circle cx="180" cy="206" r="10" fill="#5FB8E6" />
      <circle className="splash" cx="180" cy="206" r="16" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      {/* bancas */}
      <rect x="112" y="156" width="22" height="7" rx="2" fill="#A0703F" transform="rotate(-40 123 159)" />
      <rect x="226" y="156" width="22" height="7" rx="2" fill="#A0703F" transform="rotate(40 237 159)" />
      <rect x="112" y="250" width="22" height="7" rx="2" fill="#A0703F" transform="rotate(40 123 253)" />
      <rect x="226" y="250" width="22" height="7" rx="2" fill="#A0703F" transform="rotate(-40 237 253)" />
      {flowers.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={c} />
      ))}
      {trees.map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x + 4} cy={y + r * 0.8} rx={r} ry={r * 0.35} fill="#000" opacity="0.12" />
          <circle cx={x} cy={y} r={r} fill="#4F9D45" />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.45} fill="#6DBA5E" />
        </g>
      ))}
    </svg>
  )
}

export default function Plaza() {
  const { user, orders, waitFor } = useApp()
  const first = user?.name.split(' ')[0] ?? ''
  const active = orders.filter(isActive)

  return (
    <div className="screen">
      <header className="topbar">
        <img src="/logo.png" alt="" className="topbar-logo" />
        <div>
          <small>Hola, {first} 👋</small>
          <h1>¿Qué se te antoja hoy?</h1>
        </div>
      </header>

      {active.slice(0, 2).map((o) => (
        <button key={o.id} className={`active-banner ${o.status === 'listo' ? 'ready' : ''}`} onClick={() => go('/voucher/' + o.id)}>
          <span className="ab-emoji">{storeById(o.storeId)?.emoji}</span>
          <span className="ab-text">
            <b>{o.status === 'listo' ? '¡Tu pedido está listo!' : `Pedido en ${storeById(o.storeId)?.name}`}</b>
            <small>Código PAO-{o.code}</small>
          </span>
          <StatusPill status={o.status} />
        </button>
      ))}

      <section className="plaza" aria-label="Plaza de locales">
        <PlazaBackground />
        {STORES.map((s, i) => (
          <button
            key={s.id}
            className={`stall stall-${i}`}
            style={{ '--c': s.color, '--cs': s.colorSoft } as CSSProperties}
            onClick={() => go('/tienda/' + s.id)}
          >
            <span className="awning" />
            <span className="stall-body">
              <span className="stall-emoji">{s.emoji}</span>
              <strong>{s.name}</strong>
              <span className="stall-kind">{s.kind}</span>
            </span>
            <span className="stall-wait">⏱ ~{waitFor(s.id)} min</span>
          </button>
        ))}
        <span className="you-pin">
          <span>Tú</span>
        </span>
      </section>
      <p className="hint">Toca un local para ver su menú</p>

      <h2 className="section-title">Locales abiertos</h2>
      <div className="store-list">
        {STORES.map((s) => (
          <button key={s.id} className="store-row" style={{ '--c': s.color, '--cs': s.colorSoft } as CSSProperties} onClick={() => go('/tienda/' + s.id)}>
            <span className="sr-emoji">{s.emoji}</span>
            <span className="sr-text">
              <b>{s.name}</b>
              <small>
                {s.kind} · {s.location}
              </small>
            </span>
            <span className="sr-wait">
              <b>~{waitFor(s.id)}</b>
              <small>min</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
