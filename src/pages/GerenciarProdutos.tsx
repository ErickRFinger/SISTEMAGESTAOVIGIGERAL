import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Plus, Search, Trash2, Tag, Edit, X, Check } from 'lucide-react';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';

interface Product {
    id: string;
    name: string;
    category: string;
}

export default function GerenciarProdutos() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        // Supabase fetch
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');

        if (error) {
            console.error('Erro ao buscar produtos', error);
        } else {
            // merge statically bundled ones + database ones for view
            const dbProducts = data || [];

            const merged = [...STATIC_PRODUCTS];

            dbProducts.forEach(dbItem => {
                const existingIdx = merged.findIndex(p => p.id === dbItem.id);
                if (existingIdx >= 0) {
                    merged[existingIdx] = dbItem as any;
                } else {
                    merged.push(dbItem as any);
                }
            });

            // sort alphabetically
            merged.sort((a, b) => a.name.localeCompare(b.name));
            setProducts(merged);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAddOrEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newCategory.trim()) return;

        setAdding(true);

        if (editingProduct) {
            const newValues = {
                id: editingProduct.id,
                name: newName.trim(),
                category: newCategory.trim()
            };

            const { error } = await supabase
                .from('products')
                .upsert(newValues);

            if (error) {
                alert('Erro ao atualizar produto!');
                console.error(error);
            } else {
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...newValues } : p).sort((a, b) => a.name.localeCompare(b.name)));
                cancelEdit();
            }
        } else {
            const newProduct = {
                id: newName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: newName.trim(),
                category: newCategory.trim()
            };

            const { error } = await supabase
                .from('products')
                .insert([newProduct]);

            if (error) {
                alert('Erro ao adicionar produto! Ele já existe no banco de dados?');
                console.error(error);
            } else {
                setNewName('');
                setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
            }
        }

        setAdding(false);
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setNewName(product.name);
        setNewCategory(product.category);
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setNewName('');
        setNewCategory('');
    };

    const handleDelete = async (product: Product) => {
        // Prevent deleting static ones conceptually
        if (STATIC_PRODUCTS.find(p => p.id === product.id)) {
            alert('Produtos da base original não podem ser excluídos pelo painel externo.');
            return;
        }

        if (!window.confirm(`Excluir o produto "${product.name}" permanentemente?`)) return;

        const previous = [...products];
        setProducts(prev => prev.filter(p => p.id !== product.id));

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id);

        if (error) {
            alert('Erro ao excluir produto.');
            setProducts(previous);
        }
    };

    const categories = useMemo(() => {
        const cats = new Set<string>();
        STATIC_PRODUCTS.forEach(p => cats.add(p.category));
        products.forEach(p => cats.add(p.category));
        return Array.from(cats);
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lower = searchTerm.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower));
    }, [searchTerm, products]);

    return (
        <div className="animate-fade-in grid-responsive mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', height: '100%', alignItems: 'start' }}>
            {/* Left: Product List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                <header>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Catálogo de Equipamentos</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie os produtos disponíveis para montar os envios.</p>
                </header>

                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="Buscar equipamentos cadastrados..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.75rem' }}
                        />
                    </div>
                </div>

                <div style={{ overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Carregando catálogo completo...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Nenhum produto encontrado.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {filteredProducts.map(product => {
                                const isStatic = STATIC_PRODUCTS.some(sp => sp.id === product.id);
                                return (
                                    <div key={product.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <p style={{ fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Tag size={12} /> {product.category}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => startEdit(product)}
                                                style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                                title="Editar Produto"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {!isStatic && (
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="Excluir do Catálogo"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Add Form */}
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: 0 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {editingProduct ? <Edit size={20} /> : <Package size={20} />}
                        {editingProduct ? 'Editar Equipamento' : 'Cadastrar Novo'}
                    </div>
                    {editingProduct && (
                        <button onClick={cancelEdit} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    )}
                </h3>

                <form onSubmit={handleAddOrEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Nome do Equipamento *</label>
                        <input
                            type="text"
                            required
                            className="input-glass"
                            placeholder="Ex: Fonte de Alimentação 24V..."
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Categoria *</label>
                        {/* Option to create new category or use existing */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="input-glass"
                                placeholder="Criar nova categoria ou digitar existente"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                required
                            />
                            {categories.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    {categories.map(c => (
                                        <span
                                            key={c}
                                            onClick={() => setNewCategory(c)}
                                            style={{
                                                fontSize: '0.75rem',
                                                background: newCategory === c ? 'var(--accent)' : 'var(--bg-secondary)',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: newCategory === c ? 'white' : 'var(--text-secondary)'
                                            }}
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%' }}
                            disabled={adding || !newName.trim() || !newCategory.trim()}
                        >
                            {adding ? (editingProduct ? 'Salvando...' : 'Cadastrando...') : (
                                <>
                                    {editingProduct ? <Check size={18} /> : <Plus size={18} />}
                                    {editingProduct ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
