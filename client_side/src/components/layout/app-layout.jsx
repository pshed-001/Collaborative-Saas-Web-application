import { Outlet } from 'react-router-dom'
import Navbar from './navbar'

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px' }}>
        <Outlet />
      </main>
    </div>
  )
}
