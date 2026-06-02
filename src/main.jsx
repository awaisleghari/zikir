import React from 'react'
import ReactDOM from 'react-dom/client'
// Mantine base styles. Mantine v7 scopes these under a low-priority @layer, so
// the app's own runtime-injected <style> (see App.jsx STYLE) still wins on any
// overlap. Must be imported once, globally, here.
import '@mantine/core/styles.css'
import Root from './Root.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
