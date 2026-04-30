// components/ui/progress.tsx — standalone (no @base-ui dependency)
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null
  max?: number
}

function Progress({ className, value, max = 100, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={value ?? 0}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100', className)}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export { Progress }
