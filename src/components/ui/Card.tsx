import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-2xl border border-green-100 bg-white shadow-lg shadow-green-100/50 ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b border-green-100 bg-gradient-to-r from-green-50 to-white px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`border-t border-green-100 bg-green-50/50 px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

// Notice Badge component
interface NoticeBadgeProps {
  type: 'info' | 'warning' | 'success' | 'urgent'
}

export function NoticeBadge({ type }: NoticeBadgeProps) {
  const styles = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  }
  
  const icons = {
    info: '📢',
    warning: '⚠️',
    success: '✅',
    urgent: '🚨',
  }
  
  const labels = {
    info: 'Info',
    warning: 'Aviso',
    success: 'OK',
    urgent: 'Urgente',
  }
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span>{labels[type]}</span>
    </span>
  )
}