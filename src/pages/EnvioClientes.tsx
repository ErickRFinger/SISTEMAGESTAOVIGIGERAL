import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Wrench, Headset, Send, AlignLeft, Clipboard, Trash2, ShieldCheck, Zap } from 'lucide-react';

export default function EnvioClientes() {
    const [solicitante, setSolicitante] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [cidade, setCidade] = useState(localStorage.getItem('savedCidade') || '');
    const [servico, setServico] = useState('');
    const [atendente, setAtendente] = useState(localStorage.getItem('savedAtendente') || '');
    const [destinatario, setDestinatario] = useState('');
    const [status, setStatus] = useState('OS Aberta - Necessário contato com o cliente para alinhamento.');
    const [observacao, setObservacao] = useState('');

    const [loading, setLoading] = useState(false);

    // Save persistent fields
    useEffect(() => {
        localStorage.setItem('savedCidade', cidade);
    }, [cidade]);

    useEffect(() => {
        localStorage.setItem('savedAtendente', atendente);
    }, [atendente]);

    // Phone mask
    const handlePhoneChange = (val: string) => {
        let value = val.replace(/\D/g, '').slice(0, 11);
        let formatted = '';
        if (value.length > 0) formatted = '(' + value.substring(0, 2);
        if (value.length > 2) formatted += ') ' + value.substring(2, 7);
        if (value.length > 7) formatted += '-' + value.substring(7, 11);
        setWhatsapp(formatted);
    };

    const getMessage = () => {
        return `📋 *NOVA SOLICITAÇÃO DE ATENDIMENTO*

🔹 *Destinatário:* ${destinatario}
🔹 *Solicitante:* ${solicitante}
🔹 *WhatsApp:* ${whatsapp}
🔹 *Cidade:* ${cidade}
🔹 *Tipo de Serviço:* ${servico}
🔹 *Aberto por:* ${atendente}
🔹 *Status:* ${status}${observacao ? `\n\n📝 *Observação:*\n${observacao}` : ''}`;
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const msg = getMessage();
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
            setLoading(false);
        }, 600);
    };

    const handleCopy = () => {
        const msg = getMessage();
        navigator.clipboard.writeText(msg).then(() => {
            alert('Mensagem copiada para a área de transferência!');
        });
    };

    const handleClear = () => {
        setSolicitante('');
        setWhatsapp('');
        setServico('');
        setDestinatario('');
        setObservacao('');
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.4))', 
                        padding: '1rem', 
                        borderRadius: '16px', 
                        color: '#34d399',
                        boxShadow: '0 8px 30px rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                        <Send size={28} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em', color: 'white' }}>Envio para Clientes</h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Geração inteligente de ordens de serviço e suporte.</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSend} className="glass-panel" style={{ 
                padding: '2.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2.5rem',
                background: 'rgba(15, 23, 42, 0.6)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                
                {/* Section 1: Dados do Cliente */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '4px', height: '20px', background: 'var(--accent)', borderRadius: '2px' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identificação do Cliente</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                <User size={16} style={{ color: 'var(--accent)' }} /> Solicitante (Cliente)
                            </label>
                            <input
                                type="text"
                                className="input-glass"
                                placeholder="Nome completo do cliente"
                                required
                                value={solicitante}
                                onChange={(e) => setSolicitante(e.target.value)}
                                style={{ height: '54px', fontSize: '1rem', background: 'rgba(0,0,0,0.2)' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                <Phone size={16} style={{ color: '#10b981' }} /> WhatsApp para Contato
                            </label>
                            <input
                                type="tel"
                                className="input-glass"
                                placeholder="(00) 00000-0000"
                                required
                                value={whatsapp}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                style={{ height: '54px', fontSize: '1rem', background: 'rgba(0,0,0,0.2)' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                <MapPin size={16} style={{ color: '#ef4444' }} /> Município / Cidade
                            </label>
                            <input
                                type="text"
                                className="input-glass"
                                placeholder="Ex: Palotina, Barracão..."
                                required
                                value={cidade}
                                onChange={(e) => setCidade(e.target.value)}
                                style={{ height: '54px', fontSize: '1rem', background: 'rgba(0,0,0,0.2)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Detalhes do Serviço */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '4px', height: '20px', background: '#f59e0b', borderRadius: '2px' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuração do Chamado</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                <Wrench size={16} style={{ color: '#f59e0b' }} /> Categoria de Serviço
                            </label>
                            <select
                                className="input-glass"
                                required
                                value={servico}
                                onChange={(e) => setServico(e.target.value)}
                                style={{ height: '54px', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', WebkitAppearance: 'none' }}
                            >
                                <option value="">Selecione o serviço</option>
                                <option value="INSTALAÇÃO">🚀 INSTALAÇÃO</option>
                                <option value="MANUTENÇÃO">🛠️ MANUTENÇÃO</option>
                                <option value="TROCA DE TITULARIDADE">👤 TROCA DE TITULARIDADE</option>
                                <option value="COBRANÇA">💰 COBRANÇA</option>
                                <option value="ALTERAÇÃO DE PLANO">📈 ALTERAÇÃO DE PLANO</option>
                                <option value="TROCA DE ENDEREÇO">🏠 TROCA DE ENDEREÇO</option>
                                <option value="OUTROS">🌐 OUTROS</option>
                                <option value="RETIRADA">📥 RETIRADA</option>
                                <option value="ENTREGA DE COPO">🥤 ENTREGA DE COPO</option>
                                <option value="RENOVAÇÃO">♻️ RENOVAÇÃO</option>
                                <option value="ANOTAÇÃO">📝 ANOTAÇÃO</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                <Zap size={16} style={{ color: '#a78bfa' }} /> Destinatário / Unidade
                            </label>
                            <select
                                className="input-glass"
                                required
                                value={destinatario}
                                onChange={(e) => setDestinatario(e.target.value)}
                                style={{ height: '54px', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', WebkitAppearance: 'none' }}
                            >
                                <option value="">Escolha a unidade</option>
                                <option value="GUSTAVO - BARRACÃO">🚩 GUSTAVO - BARRACÃO</option>
                                <option value="GISELI - BARRACÃO">🚩 GISELI - BARRACÃO</option>
                                <option value="ADILSON - PALOTINA">🚩 ADILSON - PALOTINA</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                <ShieldCheck size={16} style={{ color: '#6366f1' }} /> Urgência / Status
                            </label>
                            <select
                                className="input-glass"
                                required
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                style={{ height: '54px', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', WebkitAppearance: 'none' }}
                            >
                                <option value="OS Aberta - Necessário contato com o cliente para alinhamento.">Aguardando Alinhamento</option>
                                <option value="OS Aberta - Urgente.">🔴 URGENTE</option>
                                <option value="OS Fechada.">🟢 FECHADA</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                <Headset size={16} style={{ color: 'var(--accent)' }} /> Atendente Responsável
                            </label>
                            <input
                                type="text"
                                className="input-glass"
                                placeholder="Seu nome"
                                required
                                value={atendente}
                                onChange={(e) => setAtendente(e.target.value)}
                                style={{ height: '54px', fontSize: '1rem', background: 'rgba(0,0,0,0.2)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Observações */}
                <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        <AlignLeft size={16} /> Relato / Observação Adicional
                    </label>
                    <textarea
                        className="input-glass"
                        placeholder="Descreva detalhes específicos do chamado para facilitar o atendimento..."
                        rows={4}
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        style={{ resize: 'none', background: 'rgba(0,0,0,0.2)', padding: '1.25rem' }}
                    />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="btn-secondary"
                            title="Limpar Tudo"
                            style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                        >
                            <Trash2 size={24} />
                        </button>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="btn-secondary"
                            title="Copiar Texto"
                            style={{ width: '64px', height: '64px', borderRadius: '16px' }}
                        >
                            <Clipboard size={24} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ 
                            flex: 1, 
                            height: '64px',
                            background: 'linear-gradient(135deg, #10b981, #059669)', 
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            borderRadius: '16px',
                            boxShadow: '0 15px 35px rgba(16, 185, 129, 0.3)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {loading ? 'Processando...' : (
                            <>
                                <Send size={22} />
                                Finalizar e Enviar via WhatsApp
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
