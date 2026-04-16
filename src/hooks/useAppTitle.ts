import { useEffect } from 'react'

import { env } from '../lib/env'

export function useAppTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${env.appName}` : env.appName
  }, [title])
}
