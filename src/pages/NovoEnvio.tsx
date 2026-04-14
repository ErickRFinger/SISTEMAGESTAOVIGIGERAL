import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';
import { Search, Plus, Minus, Send, Trash2, User, Truck, FileText } from 'lucide-react';

interface CartItem {
    product_id: string;
    product_name: string;
    product_category: string;
    quantity: number;
}

interface Product {
    id: string;
    name: string;
    category: string;
}

const FILIAIS = ['BARRACAO PR', 'PALOTINA PR', 'FRANCISCO BELTRAO PR'];

export default function NovoEnvio() {
    const navigate = useNavigate();
    const [branch, setBranch] = useState(FILIAIS[0]);
    const [senderName, setSenderName] = useState('');
    const [driverName, setDriverName] = useState('');
    const [notes, setNotes] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<Record<string, CartItem>>({});
    const [saving, setSaving] = useState(false);

    // Novo State para Catalogo Dinâmico
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingCatalog, setLoadingCatalog] = useState(true);

    useEffect(() => {
        const fetchCatalog = async () => {
            const { data } = await supabase.from('products').select('*');
            const merged = [...STATIC_PRODUCTS];

            if (data) {
                data.forEach(dbItem => {
                    const existingIdx = merged.findIndex(p => p.id === dbItem.id);
                    if (existingIdx >= 0) {
                        merged[existingIdx] = dbItem as any;
                    } else {
                        merged.push(dbItem as any);
                    }
                });
            }
            merged.sort((a, b) => a.name.localeCompare(b.name));
            setProducts(merged);
            setLoadingCatalog(false);
        };
        fetchCatalog();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        products.forEach(p => cats.add(p.category));
        return Array.from(cats);
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lower = searchTerm.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower));
    }, [searchTerm, products]);

    const cartArray = Object.values(cart);

    const handleUpdateCart = (product: Product, delta: number) => {
        setCart(prev => {
            const current = prev[product.id]?.quantity || 0;
            const nextQuantity = current + delta;

            if (nextQuantity <= 0) {
                const newCart = { ...prev };
                delete newCart[product.id];
                return newCart;
            }

            return {
                ...prev,
                [product.id]: {
                    product_id: product.id,
                    product_name: product.name,
                    product_category: product.category,
                    quantity: nextQuantity
                }
            };
        });
    };

    const handleSave = async () => {
        if (cartArray.length === 0) return alert('Adicione pelo menos um produto ao envio.');
        if (!senderName.trim()) return alert('O nome do remetente (responsável) é obrigatório.');

        setSaving(true);

        try {
            const { data: headerData, error: headerError } = await supabase
                .from('shipments')
                .insert([{
                    branch_name: branch,
                    status: 'pendente',
                    sender_name: senderName.trim(),
                    driver_name: driverName.trim() || null,
                    notes: notes.trim() || null
                }])
                .select()
                .single();

            if (headerError) throw headerError;

            const shipmentId = headerData.id;

            const itemsToInsert = cartArray.map(item => ({
                shipment_id: shipmentId,
                product_id: item.product_id,
                product_name: item.product_name,
                product_category: item.product_category,
                quantity: item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('shipment_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            alert('Envio registrado com sucesso!');
            navigate('/');
        } catch (err: any) {
            console.error(err);
            alert('Erro ao registrar o envio. Verifique o console. Você executou o novo schema.sql no banco?');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Novo Envio</h2>
            </div>

            {/* SEÇÃO 1: DADOS DO LOTE */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent)' }}>1. Dados do Lote</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Destino (Filial):</label>
                        <select
                            className="input-glass"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            style={{ WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer', fontWeight: '500' }}
                        >
                            {FILIAIS.map(f => <option key={f} value={f} style={{ color: 'var(--bg-primary)' }}>{f}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <User size={14} /> Remetente / Responsável *
                        </label>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="Quem está enviando..."
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <Truck size={14} /> Motorista / Transportadora
                        </label>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="Ex: João (Van), Correios..."
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <FileText size={14} /> Observações
                        </label>
                        <textarea
                            className="input-glass"
                            placeholder="Detalhes adicionais..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={1}
                            style={{ resize: 'none' }}
                        />
                    </div>
                </div>
            </div>

            {/* SEÇÃO 2: LISTA DE PRODUTOS */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>2. Adicionar Produtos</h3>

                <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="Buscar produtos ou categorias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.75rem' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {loadingCatalog ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Carregando catálogo de equipamentos...</div>
                    ) : categories.map(category => {
                        const categoryProducts = filteredProducts.filter(p => p.category === category);
                        if (categoryProducts.length === 0) return null;

                        return (
                            <div key={category}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                    {category}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                    {categoryProducts.map(product => {
                                        const quantityInCart = cart[product.id]?.quantity || 0;

                                        return (
                                            <div key={product.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: '500', lineHeight: 1.4, fontSize: '0.9rem' }}>{product.name}</p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qtd:</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '8px' }}>
                                                        <button
                                                            onClick={() => handleUpdateCart(product, -1)}
                                                            disabled={quantityInCart === 0}
                                                            style={{
                                                                background: quantityInCart > 0 ? 'var(--bg-secondary)' : 'transparent',
                                                                color: quantityInCart > 0 ? 'white' : 'var(--text-secondary)',
                                                                border: 'none',
                                                                padding: '0.25rem',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={quantityInCart || ''}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                if (val <= 0) {
                                                                    setCart(prev => {
                                                                        const newCart = { ...prev };
                                                                        delete newCart[product.id];
                                                                        return newCart;
                                                                    });
                                                                } else {
                                                                    setCart(prev => ({
                                                                        ...prev,
                                                                        [product.id]: {
                                                                            product_id: product.id,
                                                                            product_name: product.name,
                                                                            product_category: product.category,
                                                                            quantity: val
                                                                        }
                                                                    }));
                                                                }
                                                            }}
                                                            style={{
                                                                width: '2.5rem',
                                                                textAlign: 'center',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: 'white',
                                                                fontWeight: '600',
                                                                fontSize: '0.9rem',
                                                                outline: 'none',
                                                                MozAppearance: 'textfield'
                                                            }}
                                                            placeholder="0"
                                                        />
                                                        <button
                                                            onClick={() => handleUpdateCart(product, 1)}
                                                            style={{
                                                                background: 'var(--accent)',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.25rem',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SEÇÃO 3: RESUMO DO CARRINHO + BOTÃO CONFIRMAR */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent)', marginBottom: '1.25rem' }}>3. Resumo do Envio</h3>

                {cartArray.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 1rem', fontSize: '0.9rem' }}>
                        Nenhum produto selecionado. Adicione produtos acima.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {cartArray.map(item => (
                            <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product_name}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.product_category}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>x{item.quantity}</span>
                                    <button
                                        onClick={() => setCart(prev => { const n = { ...prev }; delete n[item.product_id]; return n; })}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                                        title="Remover Item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total de Volumes:</span>
                        <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{cartArray.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                    </div>
                    <button
                        className="btn-primary"
                        style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', borderRadius: '12px' }}
                        onClick={handleSave}
                        disabled={saving || cartArray.length === 0}
                    >
                        {saving ? 'Registrando...' : (
                            <>
                                <Send size={18} />
                                Confirmar Lote de Envio
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
