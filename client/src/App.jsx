import React, { useEffect, useMemo, useState } from 'react';
import { api, setAdminToken } from './api';
import { ChefHat, Plus, Pencil, Trash2, Utensils, Tags, Search, X, Leaf, Flame, Clock3, MessageCircle } from 'lucide-react';

const money = (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function Modal({ title, onClose, children }) {
  return <div className="overlay" onMouseDown={onClose}><section className="modal" onMouseDown={e => e.stopPropagation()}>
    <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Fechar"><X size={19}/></button></div>{children}
  </section></div>;
}

export default function App() {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [dishForm, setDishForm] = useState({ name:'', description:'', price:'', available:true });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => { try { return Boolean(window.sessionStorage.getItem('casaDoSaborAdminToken')); } catch { return false; } });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  async function loadCategories(preferredId) {
    const data = await api.categories();
    setCategories(data);
    const next = data.find(c => c.id === (preferredId || selected?.id)) || data[0] || null;
    setSelected(next);
    if (next) await loadDishes(next.id); else setDishes([]);
  }
  async function loadDishes(id) { setDishes(await api.dishes(id)); }
  useEffect(() => {
    loadCategories().catch(e => setError(e.message)).finally(() => setLoading(false));
    const onExpired = () => setIsAdmin(false);
    window.addEventListener('admin-session-expired', onExpired);
    return () => window.removeEventListener('admin-session-expired', onExpired);
  }, []);
  const visibleDishes = useMemo(() => dishes.filter(d => `${d.name} ${d.description || ''}`.toLowerCase().includes(search.toLowerCase())), [dishes, search]);

  async function loginAdmin(e) {
    e.preventDefault(); setError('');
    try { const result = await api.login(loginForm); setAdminToken(result.token); setIsAdmin(true); setLoginForm({ username: '', password: '' }); setModal(null); }
    catch (e) { setError(e.message); }
  }
  function logoutAdmin() { setAdminToken(''); setIsAdmin(false); setModal(null); }

  function openCategory(category) {
    setEditingId(category?.id || null); setCategoryName(category?.name || ''); setError(''); setModal('category');
  }
  function openDish(dish) {
    setEditingId(dish?.id || null);
    setDishForm(dish ? { name:dish.name, description:dish.description || '', price:String(dish.price), available:dish.available } : { name:'', description:'', price:'', available:true });
    setError(''); setModal('dish');
  }
  async function saveCategory(e) {
    e.preventDefault(); setError('');
    try {
      const data = editingId ? await api.updateCategory(editingId, { name:categoryName }) : await api.createCategory({ name:categoryName });
      await loadCategories(data.id); setModal(null);
    } catch (e) { setError(e.message); }
  }
  async function saveDish(e) {
    e.preventDefault(); setError('');
    try {
      const payload = { ...dishForm, price:Number(dishForm.price) };
      if (editingId) await api.updateDish(editingId, payload); else await api.createDish(selected.id, payload);
      await loadDishes(selected.id); setModal(null);
    } catch (e) { setError(e.message); }
  }
  async function removeCategory(category) {
    if (!confirm(`Excluir a categoria "${category.name}"?`)) return;
    try { await api.deleteCategory(category.id); await loadCategories(); } catch (e) { alert(e.message); }
  }
  async function removeDish(dish) {
    if (!confirm(`Excluir o prato "${dish.name}"?`)) return;
    try { await api.deleteDish(dish.id); await loadDishes(selected.id); } catch (e) { alert(e.message); }
  }

  const whatsappUrl = 'https://wa.me/5588981562234?text=Olá!%20Vim%20pelo%20cardápio%20da%20Casa%20do%20Sabor%20e%20gostaria%20de%20fazer%20um%20pedido.';

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark"><ChefHat size={23}/></span><span>casa do <b>sabor.</b><small>COMIDA FEITA COM CARINHO</small></span></a><div className="top-actions"><span className="top-tag">CARDÁPIO DIGITAL</span>{isAdmin ? <button className="outline-btn" onClick={logoutAdmin}>Sair do painel</button> : <button className="outline-btn" onClick={() => {setError("");setModal("login");}}>Acesso administrativo</button>}</div></header>
    <main>
      <section className="hero"><div className="hero-copy"><span className="eyebrow">SABOR DE COMIDA DE CASA</span><h1>Seu dia merece<br/><em>comida de verdade.</em></h1><p>Receitas preparadas com carinho, ingredientes frescos e aquele tempero que abraça.</p><div className="hero-points"><span><Leaf size={16}/> Ingredientes frescos</span><span><Flame size={16}/> Feito na hora</span><span><Clock3 size={16}/> Todo dia, com carinho</span></div></div><div className="hero-image"><div className="image-note">FEITO COM AMOR <span>♥</span></div><a className="whatsapp-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/> Pedir pelo WhatsApp</a></div></section>
      <section className="menu-section">
        <div className="section-heading"><div><span className="eyebrow">ESCOLHA SEU FAVORITO</span><h2>Nosso cardápio</h2><p>Um menu cheio de sabor esperando por você.</p></div>{isAdmin && <div className="admin-actions"><button className="outline-btn" onClick={() => openCategory(null)}><Plus size={16}/> Nova categoria</button></div>}</div>
        <div className="menu-layout">
          <aside className="category-panel"><div className="panel-title"><Tags size={17}/> Categorias</div>{loading ? <p>Carregando...</p> : categories.map(c => <div key={c.id} className={`category-row ${selected?.id===c.id?'active':''}`}><button className="category-select" onClick={() => {setSelected(c);loadDishes(c.id).catch(e=>setError(e.message));}}>{c.name}<span>{c._count?.dishes ?? ''}</span></button>{isAdmin && <><button className="tiny-btn" onClick={() => openCategory(c)} title="Editar"><Pencil size={14}/></button><button className="tiny-btn danger" onClick={() => removeCategory(c)} title="Excluir"><Trash2 size={14}/></button></>}</div>)}{!categories.length && !loading && <p className="muted">Cadastre a primeira categoria.</p>}</aside>
          <div className="dishes-panel"><div className="dishes-toolbar"><div><span className="eyebrow">MENU DA CASA</span><h3>{selected?.name || 'Pratos'}</h3></div><div className="toolbar-actions"><label className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar prato"/></label>{isAdmin && <button className="primary-btn" disabled={!selected} onClick={() => openDish(null)}><Plus size={16}/> Novo prato</button>}</div></div>
            {error && <div className="error-banner">{error}</div>}
            {!selected ? <div className="empty-state"><Utensils size={32}/><h3>Comece criando uma categoria</h3><p>Organize seus pratos em grupos como Pratos feitos, Bebidas e Sobremesas.</p></div> : visibleDishes.length ? <div className="dish-grid">{visibleDishes.map(d => <article className="dish-card" key={d.id}><div className="dish-photo"><Utensils size={30}/><span>{d.available?'DISPONÍVEL':'INDISPONÍVEL'}</span></div><div className="dish-info"><div className="dish-title"><h4>{d.name}</h4><strong>{money(d.price)}</strong></div><p>{d.description || 'Uma opção deliciosa preparada com carinho.'}</p><div className="dish-actions"><span className={d.available?'status-on':'status-off'}>{d.available?'Disponível':'Indisponível'}</span><div>{isAdmin && <><button className="tiny-btn" onClick={() => openDish(d)} title="Editar"><Pencil size={15}/></button><button className="tiny-btn danger" onClick={() => removeDish(d)} title="Excluir"><Trash2 size={15}/></button></>}</div></div></div></article>)}</div> : <div className="empty-state"><Utensils size={32}/><h3>Nenhum prato por aqui ainda</h3><p>Adicione o primeiro prato desta categoria.</p></div>}
          </div>
        </div>
      </section>
    </main>
    <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Fazer pedido pelo WhatsApp"><MessageCircle size={25}/><span>Peça pelo WhatsApp</span></a>
    <footer><div className="footer-brand"><ChefHat size={20}/> Casa do Sabor</div><span>Comida de verdade, feita com carinho. © {new Date().getFullYear()}</span><span className="footer-admin">Painel de cardápio</span></footer>
    {modal==='login' && <Modal title="Acesso administrativo" onClose={()=>setModal(null)}><form onSubmit={loginAdmin} className="form"><p className="login-hint">Entre com as credenciais configuradas no servidor para gerenciar o cardápio.</p><label>Usuário<input autoFocus required autoComplete="username" value={loginForm.username} onChange={e=>setLoginForm({...loginForm,username:e.target.value})}/></label><label>Senha<input required type="password" autoComplete="current-password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})}/></label>{error&&<p className="form-error">{error}</p>}<button className="primary-btn full">Entrar</button></form></Modal>}
    {isAdmin && modal==='category' && <Modal title={editingId?'Editar categoria':'Nova categoria'} onClose={()=>setModal(null)}><form onSubmit={saveCategory} className="form"><label>Nome da categoria<input autoFocus required maxLength="60" value={categoryName} onChange={e=>setCategoryName(e.target.value)} placeholder="Ex.: Pratos feitos"/></label>{error&&<p className="form-error">{error}</p>}<button className="primary-btn full">Salvar categoria</button></form></Modal>}
    {isAdmin && modal==='dish' && <Modal title={editingId?'Editar prato':'Novo prato'} onClose={()=>setModal(null)}><form onSubmit={saveDish} className="form"><label>Nome do prato<input required maxLength="80" value={dishForm.name} onChange={e=>setDishForm({...dishForm,name:e.target.value})} placeholder="Ex.: Frango grelhado"/></label><label>Descrição<textarea maxLength="240" value={dishForm.description} onChange={e=>setDishForm({...dishForm,description:e.target.value})} placeholder="Descreva os acompanhamentos e ingredientes"/></label><label>Preço (R$)<input required type="number" min="0.01" step="0.01" value={dishForm.price} onChange={e=>setDishForm({...dishForm,price:e.target.value})} placeholder="22.90"/></label><label className="check-label"><input type="checkbox" checked={dishForm.available} onChange={e=>setDishForm({...dishForm,available:e.target.checked})}/> Prato disponível para pedidos</label>{error&&<p className="form-error">{error}</p>}<button className="primary-btn full">Salvar prato</button></form></Modal>}
  </div>;
}
