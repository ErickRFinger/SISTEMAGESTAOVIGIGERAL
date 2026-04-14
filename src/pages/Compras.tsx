import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Phone, MapPin, Package, Search, Building2, ShoppingBag, X, Check, Plus, Minus, Loader2, ExternalLink } from 'lucide-react';

interface SupplierItem {
    id: string;
    name: string;
    sku?: string;
}

interface Supplier {
    id: string;
    name: string;
    phone: string;
    city: string;
    region: string;
    category: string;
    supplier_items?: SupplierItem[];
}

export default function Compras() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState<string>('all');
    
    // Modal states
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Management states
    const [isManageMode, setIsManageMode] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemSku, setNewItemSku] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    async function fetchSuppliers() {
        setLoading(true);
        const { data, error } = await supabase
            .from('suppliers')
            .select('*, supplier_items(*)');

        if (error) {
            console.error('Erro ao buscar fornecedores:', error);
        } else {
            const sortedData = (data || []).map((s: Supplier) => ({
                ...s,
                supplier_items: s.supplier_items?.sort((a, b) => a.name.localeCompare(b.name))
            }));
            setSuppliers(sortedData);
        }
        setLoading(false);
    }

    const cities = ['all', ...new Set(suppliers.map(s => s.city))];

    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch =
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCity = selectedCity === 'all' || supplier.city === selectedCity;
        return matchesSearch && matchesCity;
    });

    const openOrderModal = (supplier: Supplier) => {
        const isExternal = supplier.phone.startsWith('http');
        if (isExternal && !isManageMode) {
            window.open(supplier.phone, '_blank');
            return;
        }

        setSelectedSupplier(supplier);
        setItemQuantities({});
        setModalSearchTerm('');
        setNewItemName('');
        setNewItemSku('');
        setIsModalOpen(true);
    };

    const updateQuantity = (itemName: string, delta: number) => {
        setItemQuantities(prev => {
            const current = prev[itemName] || 0;
            const next = Math.max(0, current + delta);
            const newState = { ...prev };
            if (next === 0) {
                delete newState[itemName];
            } else {
                newState[itemName] = next;
            }
            return newState;
        });
    };

    const handleAddItem = async () => {
        if (!selectedSupplier || !newItemName.trim() || isAddingItem) return;

        setIsAddingItem(true);
        const { data, error } = await supabase
            .from('supplier_items')
            .insert([{
                supplier_id: selectedSupplier.id,
                name: newItemName.trim(),
                sku: newItemSku.trim() || null
            }])
            .select()
            .single();

        if (error) {
            alert('Erro ao adicionar item: ' + error.message);
        } else {
            setSuppliers(prev => prev.map(s => {
                if (s.id === selectedSupplier.id) {
                    return {
                        ...s,
                        supplier_items: [...(s.supplier_items || []), data].sort((a, b) => a.name.localeCompare(b.name))
                    };
                }
                return s;
            }));
            
            setSelectedSupplier(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    supplier_items: [...(prev.supplier_items || []), data].sort((a, b) => a.name.localeCompare(b.name))
                };
            });
            
            setNewItemName('');
            setNewItemSku('');
        }
        setIsAddingItem(false);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm('Deseja realmente excluir este produto?')) return;

        const { error } = await supabase
            .from('supplier_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            alert('Erro ao excluir item: ' + error.message);
        } else {
            setSuppliers(prev => prev.map(s => ({
                ...s,
                supplier_items: s.supplier_items?.filter(i => i.id !== itemId)
            })));
            
            setSelectedSupplier(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    supplier_items: prev.supplier_items?.filter(i => i.id !== itemId)
                };
            });
        }
    };

    const handleWhatsApp = () => {
        if (!selectedSupplier) return;
        
        const selectedEntries = Object.entries(itemQuantities);
        let message = '';
        
        if (selectedEntries.length > 0) {
            message = `*Olá, ${selectedSupplier.name}! Gostaria de fazer um pedido:*\n\n`;
            selectedEntries.forEach(([name, qty]) => {
                const item = selectedSupplier.supplier_items?.find(i => i.name === name);
                const skuTag = item?.sku ? ` - ${item.sku}` : '';
                message += `• ${qty}x ${name}${skuTag}\n`;
            });
            message += `\n*Aguardo confirmação.*`;
        } else {
            message = `Olá, gostaria de consultar preços de produtos.`;
        }
        
        window.open(`https://wa.me/${selectedSupplier.phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.4))', 
                            padding: '1rem', 
                            borderRadius: '16px', 
                            color: '#fb923c',
                            boxShadow: '0 8px 30px rgba(249, 115, 22, 0.2)',
                            border: '1px solid rgba(249, 115, 22, 0.2)'
                        }}>
                            <ShoppingBag size={28} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em', color: 'white' }}>
                                Compras Premium
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Gestão inteligente de fornecedores e cotações.</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsManageMode(!isManageMode)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            background: isManageMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: isManageMode ? 'var(--accent)' : 'var(--text-secondary)',
                            border: '1px solid ' + (isManageMode ? 'var(--accent)' : 'var(--border)'),
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isManageMode ? <Check size={18} /> : <X size={18} style={{ transform: 'rotate(45deg)' }} />}
                        {isManageMode ? 'Concluir Gestão' : 'Gerenciar Produtos'}
                    </button>
                </div>
            </header>

            {/* Filters & Search */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                            Buscar Fornecedor ou Categoria
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
                            <input
                                type="text"
                                className="input-glass"
                                placeholder="Ex: Adelaide, Cabos, Alarmes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '3rem', height: '54px' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                            Filtrar por Cidade
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {cities.map(city => (
                                <button
                                    key={city}
                                    onClick={() => setSelectedCity(city)}
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap',
                                        background: selectedCity === city ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                        color: selectedCity === city ? 'white' : 'var(--text-secondary)',
                                        border: '1px solid ' + (selectedCity === city ? 'var(--accent)' : 'var(--border)'),
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {city === 'all' ? 'Todas' : city}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent)' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Carregando fornecedores...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '10px', color: 'var(--accent)' }}>
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--accent)', display: 'block', marginBottom: '-0.2rem' }}>ID: {supplier.id.slice(0, 4).toUpperCase()}</span>
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'white' }}>{supplier.name}</h3>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(249, 115, 22, 0.14)', color: '#fb923c', fontWeight: '600', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                                    {supplier.category}
                                </span>
                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                    {supplier.region}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                <MapPin size={14} />
                                {supplier.city}
                            </div>

                            <button
                                onClick={() => openOrderModal(supplier)}
                                className="btn-primary"
                                style={{ 
                                    marginTop: '1rem', 
                                    width: '100%', 
                                    height: '48px', 
                                    background: isManageMode ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                                               supplier.phone.startsWith('http') ? 'linear-gradient(135deg, #a855f7, #7e22ce)' :
                                               'linear-gradient(135deg, #f97316, #ea580c)',
                                    boxShadow: isManageMode ? '0 10px 20px rgba(59, 130, 246, 0.3)' : '0 10px 20px rgba(0,0,0,0.2)'
                                }}
                            >
                                {isManageMode ? <Plus size={18} /> : supplier.phone.startsWith('http') ? <ExternalLink size={18} /> : <Package size={18} />}
                                {isManageMode ? 'Gerenciar Produtos' : supplier.phone.startsWith('http') ? 'Abrir no Site' : 'Fazer Pedido'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Pedido / Gestão */}
            {isModalOpen && selectedSupplier && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem'
                }}>
                    <div className="glass-panel animate-fade-in" style={{
                        width: '100%', maxWidth: '550px', maxHeight: '90vh',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>{selectedSupplier.name}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {isManageMode ? 'Gestão de Catálogo' : 'Selecione e ajuste as quantidades'}
                                        </p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
                                        <X size={24} />
                                    </button>
                                </div>
                                
                                {!isManageMode && (
                                    <div style={{ marginTop: '1rem', position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)' }} />
                                        <input
                                            type="text"
                                            className="input-glass"
                                            placeholder="Buscar produto neste fornecedor..."
                                            value={modalSearchTerm}
                                            onChange={(e) => setModalSearchTerm(e.target.value)}
                                            style={{ height: '38px', paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add New Item Section */}
                        {isManageMode && (
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'rgba(59, 130, 246, 0.05)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.75rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Nome:</p>
                                        <input 
                                            type="text"
                                            className="input-glass"
                                            placeholder="Ex: Cabo LAN..."
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            style={{ height: '44px', width: '100%', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Código:</p>
                                        <input 
                                            type="text"
                                            className="input-glass"
                                            placeholder="Cód..."
                                            value={newItemSku}
                                            onChange={(e) => setNewItemSku(e.target.value)}
                                            style={{ height: '44px', width: '100%', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div style={{ alignSelf: 'end' }}>
                                        <button 
                                            onClick={handleAddItem}
                                            disabled={isAddingItem || !newItemName.trim()}
                                            className="btn-primary"
                                            style={{ width: '44px', height: '44px', padding: 0 }}
                                        >
                                            {isAddingItem ? <Loader2 size={20} className="animate-spin" /> : <Plus size={24} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {selectedSupplier.supplier_items && selectedSupplier.supplier_items.length > 0 ? (
                                selectedSupplier.supplier_items
                                    .filter(item => item.name.toLowerCase().includes(modalSearchTerm.toLowerCase()))
                                    .map(item => (
                                    <div
                                        key={item.id}
                                        style={{
                                            padding: '0.85rem 1rem',
                                            borderRadius: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: !isManageMode && itemQuantities[item.name] ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.03)',
                                            border: '1px solid ' + (!isManageMode && itemQuantities[item.name] ? 'var(--accent)' : 'var(--border)'),
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <span style={{ fontWeight: '600', color: 'white' }}>{item.name}</span>
                                            {item.sku && <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: '700' }}>CÓD: {item.sku}</span>}
                                        </div>

                                        {isManageMode ? (
                                            <button 
                                                onClick={() => handleDeleteItem(item.id)}
                                                style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}
                                            >
                                                <X size={18} />
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: '10px' }}>
                                                <button 
                                                    onClick={() => updateQuantity(item.name, -1)}
                                                    style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                                                >
                                                    <Minus size={18} strokeWidth={3} />
                                                </button>
                                                <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '800', color: itemQuantities[item.name] ? 'white' : 'var(--text-secondary)' }}>
                                                    {itemQuantities[item.name] || 0}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(item.name, 1)}
                                                    style={{ border: 'none', background: 'transparent', color: '#22c55e', cursor: 'pointer', padding: '0.2rem' }}
                                                >
                                                    <Plus size={18} strokeWidth={3} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                                    <Package size={40} style={{ margin: '0 auto 1rem' }} />
                                    <p>Nenhum produto cadastrado.</p>
                                </div>
                            )}
                        </div>

                        {!isManageMode && (
                            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textAlign: 'center' }}>
                                    {Object.values(itemQuantities).reduce((a, b) => a + b, 0)} itens selecionados
                                </p>
                                <button
                                    onClick={handleWhatsApp}
                                    className="btn-primary"
                                    style={{ 
                                        width: '100%', 
                                        height: '56px', 
                                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                                        fontSize: '1.1rem',
                                        fontWeight: '800',
                                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <Phone size={22} />
                                    Enviar Pedido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
