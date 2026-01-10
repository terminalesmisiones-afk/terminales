import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/quill-overrides.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Service Worker Registration
// Handled by vite-plugin-pwa virtual module or auto-injection
// Previous unregistration code removed to allow PWA functionality
