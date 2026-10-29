import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react'
import { DemoRepository } from '../data/repository'
import { errorMessage, newId } from '../data/store'
import type { Command, DemoState, User } from '../data/model'
import { Brand } from '../components/Brand'
import { Button, ErrorMessage, IconButton, Modal } from '../components/UI'

const SESSION = 'trama-demo-profile'
type Notice = { id: string; text: string; kind: 'success' | 'error' | 'info' }
type Context = {
  state: DemoState
  user: User | null
  execute: (command: Command) => Promise<DemoState>
  login: (userId: string) => Promise<User>
  logout: () => void
  reset: () => Promise<void>
  notify: (text: string, kind?: Notice['kind']) => void
}
const DemoContext = createContext<Context | null>(null)

export function DemoProvider({ children, repository: providedRepository }: { children: ReactNode; repository?: DemoRepository }) {
  const [repository] = useState(() => providedRepository ?? new DemoRepository())
  const [state, setState] = useState<DemoState | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [startupError, setStartupError] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const channel = useRef<BroadcastChannel | null>(null)
  const notify = useCallback((text: string, kind: Notice['kind'] = 'success') => setNotice({ id: newId('aviso'), text, kind }), [])
  const refresh = useCallback(async () => {
    const result = await repository.load()
    setState(result)
    return result
  }, [repository])

  const initialize = useCallback(async () => {
    setLoading(true)
    setStartupError('')
    try {
      const currentId = sessionStorage.getItem(SESSION)
      await refresh()
      setUserId(currentId)
    } catch (error) {
      console.error('[Trama demo] No se pudo abrir la demo.', error)
      setStartupError(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [refresh])

  useEffect(() => {
    void initialize()
    if (typeof BroadcastChannel === 'undefined') return
    const updates = new BroadcastChannel('trama-demo-updates')
    channel.current = updates
    updates.onmessage = () => {
      void refresh().catch(error => {
        console.error('[Trama demo] No se pudieron sincronizar los cambios.', error)
        notify('No pudimos leer los cambios de otra pestaña. Recargá antes de seguir editando.', 'error')
      })
    }
    return () => { updates.close(); channel.current = null }
  }, [initialize, notify, refresh])

  useEffect(() => {
    if (!notice || notice.kind === 'error') return
    const timeout = setTimeout(() => setNotice(null), 6000)
    return () => clearTimeout(timeout)
  }, [notice])

  const execute = useCallback(async (command: Command) => {
    const result = await repository.execute(userId, command)
    setState(previous => !previous || result.revision >= previous.revision ? result : previous)
    channel.current?.postMessage({ changed: true })
    return result
  }, [repository, userId])

  const login = useCallback(async (id: string) => {
    const latest = await repository.load()
    const candidate = latest.users.find(user => user.id === id && user.status !== 'deleted')
    if (!candidate) throw new Error('Este perfil de demostración no está disponible.')
    sessionStorage.setItem(SESSION, candidate.id)
    setState(latest)
    setUserId(candidate.id)
    return candidate
  }, [repository])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION)
    setUserId(null)
  }, [])

  const reset = useCallback(async () => {
    const result = await repository.reset()
    sessionStorage.removeItem(SESSION)
    setUserId(null)
    setState(result)
    setStartupError('')
    channel.current?.postMessage({ changed: true })
    notify('La demo se reinició con los datos de ejemplo.')
  }, [notify, repository])

  if (loading || !state || startupError) return <main className="startup">
    <Brand />
    {loading ? <><LoaderCircle className="spin" aria-hidden="true" /><h1>Preparando tu espacio</h1><p role="status">Cargando la demo local de Trama…</p></> : <>
      <h1>No pudimos abrir la demo</h1><ErrorMessage message={startupError} />
      <p>No reemplazamos tus datos por ejemplos cuando algo falla. Podés reintentar o reiniciar únicamente los datos de Trama.</p>
      <div className="button-row"><Button onClick={() => void initialize()}>Reintentar</Button><Button variant="secondary" onClick={() => setResetOpen(true)}>Reiniciar datos de Trama</Button></div>
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reiniciar la demo" description="Se borrarán las obras subidas y los cambios locales de esta demo. No afecta el frontend anterior ni otros sitios.">
        <div className="dialog-actions"><Button variant="secondary" onClick={() => setResetOpen(false)}>Cancelar</Button><Button variant="danger" onClick={() => {
          void reset().then(() => setResetOpen(false)).catch(error => { console.error('[Trama demo] No se pudo reiniciar.', error); setStartupError(errorMessage(error)) })
        }}>Reiniciar demo</Button></div>
      </Modal>
    </>}
  </main>

  const user = state.users.find(candidate => candidate.id === userId && candidate.status !== 'deleted') ?? null
  return <DemoContext.Provider value={{ state, user, execute, login, logout, reset, notify }}>
    {children}
    {notice && <div className={`toast toast-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
      {notice.kind === 'error' ? <AlertCircle size={20} aria-hidden="true" /> : <CheckCircle2 size={20} aria-hidden="true" />}
      <span>{notice.text}</span><IconButton icon={X} label="Cerrar aviso" onClick={() => setNotice(null)} />
    </div>}
  </DemoContext.Provider>
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('No está disponible el contexto de la demo.')
  return context
}

export function useAction() {
  const { execute, notify } = useDemo()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const run = async (command: Command, success?: string) => {
    setPending(true)
    setError('')
    try {
      const result = await execute(command)
      if (success) notify(success)
      return result
    } catch (failure) {
      const message = errorMessage(failure)
      console.error('[Trama demo] Operación rechazada.', failure)
      setError(message)
      notify(message, 'error')
      return null
    } finally {
      setPending(false)
    }
  }
  return { run, pending, error, clearError: () => setError('') }
}
