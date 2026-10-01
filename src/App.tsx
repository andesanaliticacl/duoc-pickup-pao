import { useEffect, useState } from 'react'
import { useApp } from './store'
import { BottomNav, Toasts } from './ui'
import Login from './screens/Login'
import Plaza from './screens/Plaza'
import StoreScreen from './screens/StoreScreen'
import Cart from './screens/Cart'
import Orders from './screens/Orders'
import Voucher from './screens/Voucher'
import Profile from './screens/Profile'
import LocalMode from './screens/LocalMode'

const currentPath = () => window.location.hash.slice(1) || '/'

function useHashPath() {
  const [path, setPath] = useState(currentPath)
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return path
}

export default function App() {
  const { user } = useApp()
  const path = useHashPath()
  const [section, param] = path.split('/').filter(Boolean)

  // El modo local es la vista del personal de la tienda: no requiere sesión de alumno
  if (section === 'local') return <LocalMode />
  if (!user) return <Login />

  let screen
  switch (section) {
    case 'tienda':
      screen = <StoreScreen id={param} />
      break
    case 'carrito':
      screen = <Cart />
      break
    case 'pedidos':
      screen = <Orders />
      break
    case 'voucher':
      screen = <Voucher id={param} />
      break
    case 'perfil':
      screen = <Profile />
      break
    default:
      screen = <Plaza />
  }

  return (
    <div className="app">
      {screen}
      <BottomNav section={section ?? ''} />
      <Toasts />
    </div>
  )
}
