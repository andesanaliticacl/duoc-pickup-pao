import { useState, type FormEvent } from 'react'
import { go, useApp } from '../store'

export default function Login() {
  const { login } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) return setError('Escribe tu nombre')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Revisa tu correo')
    login({ name: name.trim(), email: email.trim().toLowerCase() })
    go('/')
  }

  return (
    <div className="login">
      <img src="/logo.png" alt="Retira Fácil" className="login-logo" />
      <h1>
        Pide antes,
        <br />
        <span>retira sin fila</span>
      </h1>

      <ul className="login-steps">
        <li>
          <b>📱</b>Pide desde la sala o en camino
        </li>
        <li>
          <b>🎟️</b>Recibe tu voucher con código
        </li>
        <li>
          <b>💵</b>Paga y retira en el local
        </li>
      </ul>

      <form onSubmit={submit} className="login-form">
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Camila Rojas" autoComplete="given-name" />
        </label>
        <label>
          Correo institucional
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre.apellido@duocuc.cl"
            type="email"
            inputMode="email"
            autoComplete="email"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit">
          Entrar
        </button>
        <p className="muted small center">Versión demo · no se guardan datos fuera de este dispositivo</p>
      </form>

      <button className="link-btn" onClick={() => go('/local')}>
        ¿Trabajas en un local? Entrar al Modo Local →
      </button>
    </div>
  )
}
