import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('main.tsx - Starting React application');
console.log('main.tsx - DOM ready, creating root');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

console.log('main.tsx - React app rendered');
