import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, Truck, Clock, User, FileText, CheckCircle, Edit, Check, Trash2, ShoppingBag, Send } from 'lucide-react';

interface ShipmentItem {
    id: string;
    product_name: string;
    product_category: string;
    quantity: number;
}

interface Shipment {
    id: string;
    branch_name: string;
    sender_name: string;
    driver_name: string | null;
    notes: string | null;
    status: string;
    created_at: string;
    shipment_items: ShipmentItem[];
}

export default function Historico() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pendente' | 'recebido'>('pendente');
    const navigate = useNavigate();

    async function fetchShipments() {
        setLoading(true);
        const { data, error } = await supabase
            .from('shipments')
            .select('*, shipment_items(*)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar envios:', error);
        } else {
            setShipments(data as Shipment[]);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchShipments();
    }, []);

    async function handleConfirmReceive(id: string) {
        if (!window.confirm('Confirmar o recebimento deste lote na filial?')) return;

        // Optimistic update
        setShipments(prev => prev.map(s => s.id === id ? { ...s, status: 'recebido' } : s));

        const { error } = await supabase
            .from('shipments')
            .update({ status: 'recebido' })
            .eq('id', id);

        if (error) {
            alert('Erro ao confirmar recebimento!');
            fetchShipments(); // revert
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Atenção: Tem certeza que deseja EXCLUIR este lote permanentemente?')) return;

        // Optimistic update
        const previous = [...shipments];
        setShipments(prev => prev.filter(s => s.id !== id));

        const { error } = await supabase
            .from('shipments')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir envio. Tente novamente.');
            console.error(error);
            setShipments(previous); // revert no front
        }
    }

    const filteredShipments = shipments.filter(s => s.status === activeTab);

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Controle de Lotes</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Gerencie os despachos pendentes e visualize o histórico de recebidos.</p>
            </header>

            {/* Mobile Quick Actions - Dashboard style */}
            <div className="mobile-only" style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate('/compras')}
                        className="glass-panel"
                        style={{
                            padding: '1.5rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.2))',
                            border: '1px solid rgba(249, 115, 22, 0.2)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <div style={{ background: '#f97316', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
                            <ShoppingBag size={24} />
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Compras</span>
                    </button>

                    <button 
                        onClick={() => navigate('/envio-clientes')}
                        className="glass-panel"
                        style={{
                            padding: '1.5rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.2))',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <div style={{ background: '#10b981', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
                            <Send size={24} />
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Envio Clientes</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('pendente')}
                    style={{
                        background: activeTab === 'pendente' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: activeTab === 'pendente' ? 'var(--accent)' : 'var(--text-secondary)',
                        border: `1px solid ${activeTab === 'pendente' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`,
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Clock size={18} />
                    A Caminho / Pendentes
                    {shipments.filter(s => s.status === 'pendente').length > 0 && (
                        <span style={{ background: 'var(--accent)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '99px', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                            {shipments.filter(s => s.status === 'pendente').length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('recebido')}
                    style={{
                        background: activeTab === 'recebido' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                        color: activeTab === 'recebido' ? 'var(--success)' : 'var(--text-secondary)',
                        border: `1px solid ${activeTab === 'recebido' ? 'rgba(34, 197, 94, 0.3)' : 'transparent'}`,
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <CheckCircle size={18} />
                    Já Recebidos
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ display: 'inline-block', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Sincronizando com a base...</p>
                    </div>
                ) : filteredShipments.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                        <Package size={48} style={{ margin: '0 auto', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.25rem' }}>Nada para mostrar aqui.</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            {activeTab === 'pendente' ? 'Você não tem nenhum envio a caminho ou pendente.' : 'Ainda não há lotes marcados como recebidos.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
                        {filteredShipments.map((shipment) => (
                            <div key={shipment.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {/* Header do Card */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '250px' }}>
                                        <div style={{ background: activeTab === 'pendente' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)', padding: '0.75rem', borderRadius: '12px', color: activeTab === 'pendente' ? 'var(--accent)' : 'var(--success)' }}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                Destino: {shipment.branch_name}
                                            </h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <Clock size={14} /> Enviado em {new Date(shipment.created_at).toLocaleString('pt-BR')}
                                                </span>
                                                {shipment.sender_name && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                        <User size={14} /> Enviado por: {shipment.sender_name}
                                                    </span>
                                                )}
                                                {shipment.driver_name && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                        <Truck size={14} /> Transportado por: {shipment.driver_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Area */}
                                    <div className="mobile-stack" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
                                        {shipment.status === 'pendente' && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/editar/${shipment.id}`)}
                                                    className="mobile-w-full"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        color: 'white',
                                                        border: '1px solid var(--border)',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s',
                                                        justifyContent: 'center'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                >
                                                    <Edit size={16} />
                                                    Editar Lote
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmReceive(shipment.id)}
                                                    className="mobile-w-full"
                                                    style={{
                                                        background: 'var(--success)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s',
                                                        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                                                        justifyContent: 'center'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <Check size={16} />
                                                    Confirmar Chegada
                                                </button>
                                            </>
                                        )}
                                        {shipment.status === 'recebido' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', justifyContent: 'space-between' }}>
                                                <span style={{ padding: '0.4rem 1rem', background: 'rgba(34,197,94,0.15)', color: 'var(--success)', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(34,197,94,0.3)' }}>
                                                    ENTREGUE
                                                </span>
                                                <button
                                                    onClick={() => handleDelete(shipment.id)}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        color: 'var(--text-secondary)',
                                                        border: '1px solid var(--border)',
                                                        padding: '0.5rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                                        e.currentTarget.style.color = 'var(--danger)';
                                                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                                        e.currentTarget.style.borderColor = 'var(--border)';
                                                    }}
                                                    title="Excluir Lote Permanentemente"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Observações Dropdown */}
                                {shipment.notes && (
                                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: `3px solid ${activeTab === 'pendente' ? 'var(--accent)' : 'var(--success)'}` }}>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                            <FileText size={14} /> Observações do Envio:
                                        </p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                                            "{shipment.notes}"
                                        </p>
                                    </div>
                                )}

                                {/* Itens */}
                                <div>
                                    <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <span>Volumes Inclusos</span>
                                        <span style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold' }}>
                                            Total: {shipment.shipment_items.reduce((acc, curr) => acc + curr.quantity, 0)} un.
                                        </span>
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                                        {shipment.shipment_items.map(item => (
                                            <div key={item.id} style={{
                                                background: 'rgba(0, 0, 0, 0.2)',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                            }}>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <p style={{ fontWeight: '500', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product_name}</p>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.product_category}</p>
                                                </div>
                                                <div style={{
                                                    background: 'var(--glass-bg)',
                                                    padding: '0.35rem 0.85rem',
                                                    borderRadius: '6px',
                                                    fontWeight: '700',
                                                    border: '1px solid var(--border)',
                                                    color: activeTab === 'pendente' ? 'var(--accent)' : 'var(--text-primary)'
                                                }}>
                                                    x{item.quantity}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
