import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, errorMessage: '', componentStack: '' };
  }
  static getDerivedStateFromError(error) {
    return { failed: true, errorMessage: error?.message || String(error) };
  }
  componentDidCatch(error, info) {
    console.error('Falha ao renderizar Casa do Sabor:', error, info);
    this.setState({ componentStack: info?.componentStack || '' });
  }
  render() {
    if (this.state.failed) {
      return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'24px',background:'#f7f5ef',color:'#173d2c',fontFamily:'Arial,sans-serif'}}>
        <section style={{width:'min(100%,760px)',textAlign:'center'}}>
          <h1>Não foi possível abrir o cardápio.</h1>
          <p>Identificamos uma falha no site. Envie ao responsável os detalhes abaixo para corrigirmos.</p>
          <div style={{margin:'20px 0',padding:'16px',border:'1px solid #d8b7a7',borderRadius:'10px',background:'#fff',color:'#642d20',textAlign:'left',overflowWrap:'anywhere'}}>
            <strong>Erro técnico:</strong>
            <pre style={{whiteSpace:'pre-wrap',fontSize:'13px'}}>{this.state.errorMessage}</pre>
            {this.state.componentStack && <details><summary>Detalhes adicionais</summary><pre style={{whiteSpace:'pre-wrap',fontSize:'12px'}}>{this.state.componentStack}</pre></details>}
          </div>
          <button onClick={() => window.location.reload()} style={{padding:'12px 20px',border:0,borderRadius:8,background:'#173d2c',color:'#fff',cursor:'pointer'}}>Recarregar página</button>
        </section>
      </main>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AppErrorBoundary><App /></AppErrorBoundary></React.StrictMode>
);
