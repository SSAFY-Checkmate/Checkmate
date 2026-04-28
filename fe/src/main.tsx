import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import OAuthRedirect from './pages/oauth2/redirect.tsx'
import { initializeAuth } from './lib/store.ts'

const root = document.getElementById('root')!;

// 앱 시작 시 로그인 상태 복원
initializeAuth();

const isOAuthRedirect = 
  window.location.pathname.includes('/oauth2/redirect') || 
  window.location.search.includes('oauth=success');

if (isOAuthRedirect) {
  createRoot(root).render(
    <StrictMode>
      <OAuthRedirect />
    </StrictMode>,
  )
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
