export type Product = {
  id: string
  name: string
  desc: string
  price: number
  emoji: string
  category: string
  popular?: boolean
}

export type Store = {
  id: string
  name: string
  kind: string
  tagline: string
  emoji: string
  color: string
  colorSoft: string
  hours: string
  location: string
  baseWait: number
  categories: string[]
  products: Product[]
}

export const STORES: Store[] = [
  {
    id: 'cofemarket',
    name: 'Cofemarket',
    kind: 'Café y pan',
    tagline: 'Tu café de la mañana, sin fila',
    emoji: '☕',
    color: '#FF7A1A',
    colorSoft: '#2E1A0E',
    hours: '07:30 – 20:00',
    location: 'Hall central',
    baseWait: 4,
    categories: ['Cafés', 'Panadería', 'Promos'],
    products: [
      { id: 'cm-americano', name: 'Café americano', desc: 'Grano tostado medio, 12 oz', price: 1500, emoji: '☕', category: 'Cafés', popular: true },
      { id: 'cm-cappuccino', name: 'Cappuccino', desc: 'Espresso, leche vaporizada y espuma', price: 2200, emoji: '☕', category: 'Cafés' },
      { id: 'cm-latte', name: 'Latte vainilla', desc: 'Con jarabe de vainilla, 12 oz', price: 2500, emoji: '🥛', category: 'Cafés' },
      { id: 'cm-te', name: 'Té o infusión', desc: 'Negro, verde, manzanilla o menta', price: 1000, emoji: '🍵', category: 'Cafés' },
      { id: 'cm-palta', name: 'Pan con palta', desc: 'Marraqueta, palta y sal de mar', price: 2300, emoji: '🥑', category: 'Panadería', popular: true },
      { id: 'cm-quesoja', name: 'Pan con jamón queso', desc: 'Caliente en la plancha', price: 2000, emoji: '🥪', category: 'Panadería' },
      { id: 'cm-croissant', name: 'Croissant', desc: 'De mantequilla, recién horneado', price: 1600, emoji: '🥐', category: 'Panadería' },
      { id: 'cm-medialuna', name: 'Medialuna', desc: 'Dulce y glaseada', price: 900, emoji: '🥐', category: 'Panadería' },
      { id: 'cm-queque', name: 'Trozo de queque', desc: 'Marmoleado o de naranja', price: 1200, emoji: '🍰', category: 'Panadería' },
      { id: 'cm-promo1', name: 'Promo Mañanera', desc: 'Americano + medialuna', price: 2100, emoji: '⭐', category: 'Promos', popular: true },
      { id: 'cm-promo2', name: 'Promo Estudio', desc: 'Latte + pan con palta', price: 4300, emoji: '⭐', category: 'Promos' },
    ],
  },
  {
    id: 'achoclonados',
    name: 'Achoclonados',
    kind: 'Almuerzos',
    tagline: 'Comida casera para recargar energía',
    emoji: '🌽',
    color: '#FFC21A',
    colorSoft: '#2E2510',
    hours: '11:30 – 16:00',
    location: 'Patio de comidas',
    baseWait: 8,
    categories: ['Menú del día', 'Platos', 'Bebidas y postres'],
    products: [
      { id: 'ac-menu', name: 'Menú del día', desc: 'Entrada + pastel de choclo + jugo', price: 4900, emoji: '🍱', category: 'Menú del día', popular: true },
      { id: 'ac-menuveg', name: 'Menú vegetariano', desc: 'Entrada + humitas + jugo', price: 4500, emoji: '🥗', category: 'Menú del día' },
      { id: 'ac-pastel', name: 'Pastel de choclo', desc: 'La especialidad de la casa', price: 4200, emoji: '🌽', category: 'Platos', popular: true },
      { id: 'ac-humitas', name: 'Humitas (2)', desc: 'Con ensalada chilena', price: 3800, emoji: '🫔', category: 'Platos' },
      { id: 'ac-pollo', name: 'Pollo arvejado', desc: 'Con arroz graneado', price: 4000, emoji: '🍗', category: 'Platos' },
      { id: 'ac-lasana', name: 'Lasaña boloñesa', desc: 'Porción generosa, gratinada', price: 4300, emoji: '🍝', category: 'Platos' },
      { id: 'ac-cesar', name: 'Ensalada César', desc: 'Pollo, crutones y parmesano', price: 3700, emoji: '🥗', category: 'Platos' },
      { id: 'ac-jugo', name: 'Jugo natural', desc: 'Frutilla, piña o naranja', price: 1500, emoji: '🧃', category: 'Bebidas y postres' },
      { id: 'ac-bebida', name: 'Bebida en lata', desc: '350 ml', price: 1000, emoji: '🥤', category: 'Bebidas y postres' },
      { id: 'ac-postre', name: 'Leche asada', desc: 'Postre de la casa', price: 1200, emoji: '🍮', category: 'Bebidas y postres' },
    ],
  },
  {
    id: 'paraiso',
    name: 'Paraíso',
    kind: 'Dulces y snacks',
    tagline: 'Un gustito entre clases',
    emoji: '🍭',
    color: '#EF3B36',
    colorSoft: '#2E1213',
    hours: '08:00 – 21:00',
    location: 'Junto a la biblioteca',
    baseWait: 2,
    categories: ['Dulces', 'Snacks', 'Bebidas'],
    products: [
      { id: 'pa-alfajor', name: 'Alfajor bañado', desc: 'Manjar y chocolate de leche', price: 900, emoji: '🍪', category: 'Dulces', popular: true },
      { id: 'pa-brownie', name: 'Brownie', desc: 'Con nueces, casero', price: 1300, emoji: '🍫', category: 'Dulces', popular: true },
      { id: 'pa-gomitas', name: 'Gomitas', desc: 'Bolsa surtida 100 g', price: 1000, emoji: '🍬', category: 'Dulces' },
      { id: 'pa-chocolate', name: 'Barra de chocolate', desc: 'Leche o amargo', price: 1100, emoji: '🍫', category: 'Dulces' },
      { id: 'pa-chupete', name: 'Chupete', desc: 'Sabores surtidos', price: 300, emoji: '🍭', category: 'Dulces' },
      { id: 'pa-galletas', name: 'Galletas', desc: 'Paquete individual', price: 800, emoji: '🍪', category: 'Snacks' },
      { id: 'pa-papas', name: 'Papas fritas', desc: 'Bolsa personal', price: 1000, emoji: '🥔', category: 'Snacks' },
      { id: 'pa-mani', name: 'Maní salado', desc: 'Bolsa 100 g', price: 900, emoji: '🥜', category: 'Snacks' },
      { id: 'pa-energetica', name: 'Bebida energética', desc: 'Lata 473 ml', price: 1800, emoji: '⚡', category: 'Bebidas' },
      { id: 'pa-agua', name: 'Agua mineral', desc: '500 ml, con o sin gas', price: 800, emoji: '💧', category: 'Bebidas' },
    ],
  },
]

export const storeById = (id: string) => STORES.find((s) => s.id === id)

export const findProduct = (productId: string) => {
  for (const s of STORES) {
    const p = s.products.find((x) => x.id === productId)
    if (p) return { store: s, product: p }
  }
  return undefined
}

const fmt = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
export const clp = (n: number) => fmt.format(n)

export const hhmm = (t: number) =>
  new Date(t).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
