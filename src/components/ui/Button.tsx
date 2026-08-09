import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'solid' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-medium uppercase tracking-[0.14em] transition-[background-color,color,border-color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-px disabled:pointer-events-none disabled:opacity-40'

const variants: Record<Variant, string> = {
  solid: 'bg-paper text-ink hover:bg-white',
  outline: 'border border-line-bright text-paper hover:border-paper hover:bg-paper hover:text-ink',
  ghost: 'text-paper hover:text-muted',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.68rem]',
  md: 'h-12 px-6 text-[0.72rem]',
  lg: 'h-14 px-8 text-[0.78rem]',
}

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode }

export function Button({
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...props
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...props
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </a>
  )
}
