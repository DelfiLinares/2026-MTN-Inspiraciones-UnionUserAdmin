import React from 'react'

export type NavigationIconName = 'inicio' | 'descubrir' | 'desafios' | 'perfil' | 'notificaciones' | 'publicar'

const paths: Record<NavigationIconName, React.ReactNode> = {
  inicio: <><path d="m3 10 9-7 9 7v10H3Z" /><path d="M9 20v-7h6v7" /></>,
  descubrir: <><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></>,
  desafios: <><path d="M8 3h8v6a4 4 0 0 1-8 0Z" /><path d="M8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 1v7m-4 1h8" /></>,
  perfil: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2Z" /></>,
  notificaciones: <><path d="M5 10a7 7 0 0 1 14 0v5l2 3H3l2-3Zm5 11h4" /></>,
  publicar: <path d="M12 5v14M5 12h14" />,
}

export const NavigationIcon: React.FC<{ name: NavigationIconName }> = ({ name }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths[name]}
  </svg>
)
