import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Anton: Latin only. The full package also ships Latin-ext and Vietnamese —
// unicode-range means a browser never downloads them, but they'd still sit in
// dist and get copied into the image on every deploy.
// Inter: weight axis only, no optical-size or italic axes (nothing here uses
// them). The variable package has no per-subset entry point, so all subsets
// come along; unicode-range still keeps them off the wire.
import '@fontsource/anton/latin-400.css'
import '@fontsource-variable/inter/wght.css'
import './index.css'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
