import React from 'react'
import { Link } from 'react-router-dom'

export function AdminHeading({ titulo, descripcion, children }: { titulo: string; descripcion: string; children?: React.ReactNode }) {
  return <header className="admin-page-heading"><div><h1>{titulo}</h1><p>{descripcion}</p></div>{children && <div className="admin-heading-actions">{children}</div>}</header>
}

export function AdminDatos({ datos }: { datos: Record<string, unknown> }) {
  const mostrar = (valor: unknown): React.ReactNode => {
    if (valor === null || valor === undefined || valor === '') return 'Sin datos'
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
    if (Array.isArray(valor)) return <ul>{valor.map((item, i) => <li key={i}>{mostrar(item)}</li>)}</ul>
    if (typeof valor === 'object') return <AdminDatos datos={valor as Record<string, unknown>} />
    return String(valor)
  }
  return <dl className="admin-data">{Object.entries(datos).map(([clave, valor]) => <div key={clave}><dt>{clave.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')}</dt><dd>{mostrar(valor)}</dd></div>)}</dl>
}

export function AdminNoEncontrado() {
  return <section className="admin-empty"><h1>No encontramos esta página</h1><p>La dirección no corresponde a una sección del panel.</p><Link className="admin-button admin-button-primary" to="/admin/dashboard">Volver al resumen</Link></section>
}
