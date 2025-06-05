import { ReactNode, FormEvent, useState } from 'react'

interface Props {
  title: string
  onSubmit: (email: string, password: string) => Promise<void>
  children?: ReactNode
}

export default function AuthForm({ title, onSubmit, children }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(email, password)
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl text-center">{title}</h1>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="w-full p-2 bg-gray-900 text-white rounded"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
        className="w-full p-2 bg-gray-900 text-white rounded"
      />
      <button
        type="submit"
        className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded"
      >
        {title}
      </button>
      {children}
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  )
}