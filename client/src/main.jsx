import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error('Falha ao renderizar Casa do Sabor:', error);
  }
  render() {
    if (this.state.failed) {
      return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'24px',background:'#f7f5ef',color:'#173d2c',fontFamily:'Arial,sans-serif',textAlign:'center'}}>
        <section><h1>Não foi possível abrir o cardápio.</h1><p>Atualize a página. Se o problema continuar, entre em contato com o responsável pelo sistema.</p><button onClick={() => window.location.reload()} style={{padding:'12px 20px',border:0,borderRadius:8,background:'#173d2c',color:'#fff',cursor:'pointer'}}>Recarregar página</button></section>
      </main>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AppErrorBoundary><App /></AppErrorBoundary></React.StrictMode>
);
