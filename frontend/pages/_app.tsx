// pages/_app.tsx
import '../styles/globals.css'

import type { AppProps } from 'next/app'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import CSS
config.autoAddCss = false // Prevent auto-adding CSS

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
