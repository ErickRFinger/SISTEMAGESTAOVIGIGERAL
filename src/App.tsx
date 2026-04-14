import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PackagePlus, Tag, ShoppingBag, Send, Calendar } from 'lucide-react';
import './index.css';

// Lazy loading could be used here, but for simplicity we import directly for now
import Historico from './pages/Historico';
import NovoEnvio from './pages/NovoEnvio';
import EditarEnvio from './pages/EditarEnvio';
import GerenciarProdutos from './pages/GerenciarProdutos';
import Compras from './pages/Compras';
import EnvioClientes from './pages/EnvioClientes';
import CalendarioViagens from './pages/CalendarioViagens';

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="glass-panel" style={{
      width: '280px',
      margin: '1rem',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <div style={{ padding: '0 1rem' }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.25rem'
        }}>
          VIGI Câmeras
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Sistema de Envios
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link
          to="/"
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          style={navLinkStyle(location.pathname === '/')}
        >
          <LayoutDashboard size={20} />
          Histórico
        </Link>
        <Link
          to="/novo-envio"
          className={`nav-link ${location.pathname === '/novo-envio' ? 'active' : ''}`}
          style={navLinkStyle(location.pathname === '/novo-envio')}
        >
          <PackagePlus size={20} />
          Novo Envio
        </Link>
        <Link
          to="/produtos"
          className={`nav-link ${location.pathname === '/produtos' ? 'active' : ''}`}
          style={navLinkStyle(location.pathname === '/produtos')}
        >
          <Tag size={20} />
          Catálogo
        </Link>
        
        <div style={{ margin: '0.5rem 0', borderTop: '1px solid var(--border)', opacity: 0.5 }}></div>

        <Link
          to="/compras"
          className={`nav-link ${location.pathname === '/compras' ? 'active' : ''}`}
          style={navLinkStyle(location.pathname === '/compras')}
        >
          <ShoppingBag size={20} />
          Compras
        </Link>
        <Link
          to="/envio-clientes"
          className={`nav-link ${location.pathname === '/envio-clientes' ? 'active' : ''}`}
          style={navLinkStyle(location.pathname === '/envio-clientes')}
        >
          <Send size={20} />
          Envio Clientes
        </Link>
        <Link
          to="/viagens"
          className={`nav-link ${location.pathname === '/viagens' ? 'active' : ''}`}
          style={navLinkStyle(location.pathname === '/viagens')}
        >
          <Calendar size={20} />
          Viagens
        </Link>
      </nav>

      <div style={{ marginTop: 'auto', padding: '1rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
          VIGI &copy; 2026
        </p>
      </div>
    </aside>
  );
}

function navLinkStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    color: isActive ? 'white' : 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: '500',
    background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
    border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`,
    transition: 'all 0.2s ease',
  };
}

// Global styles for hovered links (in React we can write a small style block, but we have index.css. 
// Adding hover in index.css for nav-link is cleaner. I'll just use inline styles safely for now or let CSS handle it.

// Legacy App removed in favor of InnerApp

// InnerApp wrapper to safely use useLocation for the MobileNav
function InnerApp() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Historico />} />
          <Route path="/novo-envio" element={<NovoEnvio />} />
          <Route path="/editar/:id" element={<EditarEnvio />} />
          <Route path="/produtos" element={<GerenciarProdutos />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/envio-clientes" element={<EnvioClientes />} />
          <Route path="/viagens" element={<CalendarioViagens />} />
        </Routes>
      </main>

      {/* Mobile Bottom Nav Bar */}
      <nav className="mobile-nav-bar">
        <Link to="/" style={mobileNavStyle(isActive('/'))}>
          <LayoutDashboard size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Início</span>
        </Link>
        <Link to="/novo-envio" style={mobileNavStyle(isActive('/novo-envio'))}>
          <PackagePlus size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Filial</span>
        </Link>
        <Link to="/envio-clientes" style={mobileNavStyle(isActive('/envio-clientes'))}>
          <Send size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Cliente</span>
        </Link>
        <Link to="/compras" style={mobileNavStyle(isActive('/compras'))}>
          <ShoppingBag size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Compras</span>
        </Link>
        <Link to="/produtos" style={mobileNavStyle(isActive('/produtos'))}>
          <Tag size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Prod</span>
        </Link>
        <Link to="/viagens" style={mobileNavStyle(isActive('/viagens'))}>
          <Calendar size={24} />
          <span style={{ fontSize: '0.7rem', fontWeight: '600' }}>Viagens</span>
        </Link>
      </nav>
    </div>
  );
}

function mobileNavStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
    color: active ? 'var(--accent)' : 'var(--text-secondary)', textDecoration: 'none', padding: '0.5rem',
    flex: 1, justifyContent: 'center'
  }
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
}

export default AppWrapper;
