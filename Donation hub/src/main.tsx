import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadContractConfig } from './contracts/contractLoader'

// Load contract configuration before initializing React
loadContractConfig().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((error) => {
  console.error('Failed to load contract configuration:', error);
  // Still render the app but with fallback values
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
