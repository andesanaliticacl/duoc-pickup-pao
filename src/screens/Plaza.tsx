import type { CSSProperties } from 'react'
import { STORES, storeById } from '../data'
import { go, isActive, useApp } from '../store'
import { StatusPill } from '../ui'

// Silla vista desde arriba: asiento + respaldo curvo. rot=0 deja el respaldo hacia arriba.
function Chair({ x, y, rot }: { x: number; y: number; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-10" y="-8" width="20" height="17" rx="5" fill="#26262B" stroke="#34343A" strokeWidth="1" />
      <path d="M -12 -5 Q 0 -17 12 -5" fill="none" stroke="#FF8A3D" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  )
}

// Mesa con sillas alrededor: `top`/`bottom` = sillas por lado largo, `ends` = una silla en cada cabecera
function Table({ cx, cy, w, h, top, ends }: { cx: number; cy: number; w: number; h: number; top: number; ends: boolean }) {
  const x0 = cx - w / 2
  const y0 = cy - h / 2
  const xs = Array.from({ length: top }, (_, i) => x0 + (w / top) * (i + 0.5))
  return (
    <g>
      {xs.map((x) => (
        <Chair key={'t' + x} x={x} y={y0 - 13} rot={0} />
      ))}
      {xs.map((x) => (
        <Chair key={'b' + x} x={x} y={y0 + h + 13} rot={180} />
      ))}
      {ends && (
        <>
          <Chair x={x0 - 13} y={cy} rot={-90} />
          <Chair x={x0 + w + 13} y={cy} rot={90} />
        </>
      )}
      <rect x={x0 + 3} y={y0 + 5} width={w} height={h} rx="4" fill="#000" opacity="0.45" />
      <rect x={x0} y={y0} width={w} height={h} rx="4" fill="url(#wood)" stroke="#9A5E32" strokeWidth="1.5" />
      {[0.3, 0.55, 0.8].map((f) => (
        <path key={f} d={`M ${x0 + 6} ${y0 + h * f} H ${x0 + w - 6}`} stroke="#F0BC8A" strokeWidth="1" opacity="0.45" />
      ))}
    </g>
  )
}

function PatioBackground() {
  return (
    <svg className="plaza-bg" viewBox="0 0 360 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="tiles" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#121214" />
          <path d="M30 0H0V30" fill="none" stroke="#1C1C20" strokeWidth="1" />
        </pattern>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E2A673" />
          <stop offset="0.5" stopColor="#CD8A52" />
          <stop offset="1" stopColor="#DA9C66" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#FF7A1A" stopOpacity="0.12" />
          <stop offset="1" stopColor="#FF7A1A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="420" fill="url(#tiles)" />
      <rect width="360" height="420" fill="url(#glow)" />
      <Table cx={108} cy={215} w={104} h={44} top={3} ends />
      <Table cx={272} cy={215} w={48} h={48} top={1} ends />
      <Table cx={62} cy={348} w={64} h={38} top={2} ends={false} />
      <Table cx={302} cy={348} w={40} h={40} top={1} ends />
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
        <img src="/logo.png" alt="Retira Fácil" className="topbar-logo" />
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
            <small>Código RF-{o.code}</small>
          </span>
          <StatusPill status={o.status} />
        </button>
      ))}

      <section className="plaza" aria-label="Patio de comidas">
        <PatioBackground />
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
