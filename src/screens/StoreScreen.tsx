import { useState, type CSSProperties } from 'react'
import { clp, storeById } from '../data'
import { go, useApp } from '../store'
import { BackButton, Stepper } from '../ui'

export default function StoreScreen({ id }: { id: string }) {
  const store = storeById(id)
  const { cart, addToCart, setQty, waitFor, toast } = useApp()
  const [cat, setCat] = useState('Todo')

  if (!store)
    return (
      <div className="screen empty">
        <p>Este local no existe 🤔</p>
        <button className="btn btn-primary" onClick={() => go('/')}>
          Volver al inicio
        </button>
      </div>
    )

  const qtyOf = (pid: string) => cart.find((c) => c.productId === pid)?.qty ?? 0
  const list = cat === 'Todo' ? store.products : store.products.filter((p) => p.category === cat)
  const totalCount = cart.reduce((a, c) => a + c.qty, 0)
  const cartTotal = cart.reduce((a, c) => {
    const p = storeById(c.storeId)?.products.find((x) => x.id === c.productId)
    return a + (p?.price ?? 0) * c.qty
  }, 0)

  return (
    <div className="screen store-screen" style={{ '--c': store.color, '--cs': store.colorSoft } as CSSProperties}>
      <div className="store-hero">
        <span className="awning big" />
        <BackButton />
        <div className="hero-emoji">{store.emoji}</div>
        <h1>{store.name}</h1>
        <p>{store.tagline}</p>
        <div className="hero-meta">
          <span>🟢 Abierto · {store.hours}</span>
          <span>⏱ ~{waitFor(store.id)} min</span>
          <span>📍 {store.location}</span>
        </div>
      </div>

      <div className="chips">
        {['Todo', ...store.categories].map((c) => (
          <button key={c} className={c === cat ? 'chip on' : 'chip'} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="products">
        {list.map((p) => {
          const q = qtyOf(p.id)
          return (
            <article key={p.id} className={q ? 'product in-cart' : 'product'}>
              <div className="p-emoji">{p.emoji}</div>
              <div className="p-info">
                <h3>
                  {p.name}
                  {p.popular && <span className="tag">Popular</span>}
                </h3>
                <p>{p.desc}</p>
                <strong>{clp(p.price)}</strong>
              </div>
              {q === 0 ? (
                <button
                  className="add"
                  aria-label={`Agregar ${p.name}`}
                  onClick={() => {
                    addToCart(p.id)
                    toast(`${p.emoji} ${p.name} agregado`)
                  }}
                >
                  +
                </button>
              ) : (
                <Stepper qty={q} onChange={(n) => setQty(p.id, n)} />
              )}
            </article>
          )
        })}
      </div>

      {totalCount > 0 && (
        <button className="cart-fab" onClick={() => go('/carrito')}>
          <span className="fab-count">{totalCount}</span>
          Ver carrito
          <b>{clp(cartTotal)}</b>
        </button>
      )}
    </div>
  )
}
