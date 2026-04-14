import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, RefreshCw, Pencil, Trash2, Download, Plus, Medal, LayoutDashboard, CalendarDays } from 'lucide-react';
import { fetchTravelUsers, fetchTravelTrips, createTravelTrip, updateTravelTrip, deleteTravelTrip } from '../lib/travelService';
import type { TravelUser, TravelTrip } from '../lib/travelService';

// Função utilitária para o cálculo de dias
function calculateDays(start: string, end: string) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays >= 0 ? diffDays + 1 : 0; // Includente e evitar números negativos virados
}

export default function CalendarioViagens() {
  const [activeTab, setActiveTab] = useState<'calendario' | 'dashboard'>('calendario');
  const [users, setUsers] = useState<TravelUser[]>([]);
  const [trips, setTrips] = useState<TravelTrip[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeContext, setTradeContext] = useState<{tripId: number; targetRole: string; currentUserId: number} | null>(null);
  const [tradeSubstituteId, setTradeSubstituteId] = useState<number | ''>('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editContext, setEditContext] = useState<{tripId: number; startDate: string; endDate: string; leaderId: number; assistantId: number} | null>(null);

  // Dashboard state
  const [dashboardMonthYear, setDashboardMonthYear] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await fetchTravelUsers();
      const t = await fetchTravelTrips();
      setUsers(u);
      setTrips(t);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar dados do Supabase. Verifique se o schema foi criado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====== LOGICA / RANKING (Aba 1) ====== 
  const usersWithPoints = useMemo(() => {
    const calculated = users.map(u => ({ ...u, points: 0 }));
    trips.forEach(trip => {
      // Como o ranking original é apenas por número de VIAGENS (e não dias que viajou):
      const l = calculated.find(u => u.id === trip.leader_id);
      if (l) l.points += 1;
      
      const a = calculated.find(u => u.id === trip.assistant_id);
      if (a) a.points += 1;

      if (trip.original_leader_id) {
        const ol = calculated.find(u => u.id === trip.original_leader_id);
        if (ol) ol.points -= 1;
      }
      if (trip.original_assistant_id) {
        const oa = calculated.find(u => u.id === trip.original_assistant_id);
        if (oa) oa.points -= 1;
      }
    });

    return calculated.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.name.localeCompare(b.name);
    });
  }, [users, trips]);

  const getMedal = (points: number, rankIndex: number) => {
    if (points <= 0) return null;
    if (rankIndex === 0) return '🥇'; 
    if (rankIndex === 1) return '🥈'; 
    if (rankIndex === 2) return '🥉'; 
    if (points >= 5) return '🎖️';     
    return null;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const parts = isoString.split('-');
    if (parts.length !== 3) return isoString;
    const [yy, mm, dd] = parts;
    return `${dd}/${mm}/${yy}`;
  };

  // ====== LOGICA DASHBOARD (Aba 2) ======
  const dashboardStats = useMemo(() => {
    const [filterYear, filterMonth] = dashboardMonthYear.split('-');
    
    return users.map(user => {
      let daysThisMonth = 0;
      let daysThisYear = 0;
      let totalDays = 0;

      trips.forEach(trip => {
        // Se o usuario for o que fez as vezes na viagem final assumo os dias pra ele
        if (trip.leader_id === user.id || trip.assistant_id === user.id) {
          const tripDays = calculateDays(trip.start_date, trip.end_date);
          totalDays += tripDays;

          const tripStart = new Date(trip.start_date);
          const tYear = tripStart.getFullYear().toString();
          const tMonth = String(tripStart.getMonth() + 1).padStart(2, '0');

          if (tYear === filterYear) {
            daysThisYear += tripDays;
            if (tMonth === filterMonth) {
              daysThisMonth += tripDays;
            }
          }
        }
      });

      return {
        ...user,
        daysThisMonth,
        daysThisYear,
        totalDays
      };
    }).sort((a, b) => b.daysThisMonth - a.daysThisMonth || b.totalDays - a.totalDays);
  }, [users, trips, dashboardMonthYear]);

  // ====== AÇÕES ====== 
  const nextLeaderIndex = useMemo(() => {
    const leaders = users.filter(u => u.role === 'Líder');
    if (leaders.length === 0 || trips.length === 0) return 0;
    const lastTrip = trips[trips.length - 1];
    const lastOrigId = lastTrip.original_leader_id || lastTrip.leader_id;
    const currIdx = leaders.findIndex(l => l.id === lastOrigId);
    return Math.max(0, currIdx) + 1;
  }, [users, trips]);

  const nextAssistantIndex = useMemo(() => {
    const assistants = users.filter(u => u.role === 'Auxiliar');
    if (assistants.length === 0 || trips.length === 0) return 0;
    const lastTrip = trips[trips.length - 1];
    const lastOrigId = lastTrip.original_assistant_id || lastTrip.assistant_id;
    const currIdx = assistants.findIndex(a => a.id === lastOrigId);
    return Math.max(0, currIdx) + 1;
  }, [users, trips]);

  const handleCreateTrip = async () => {
    const leaders = users.filter(u => u.role === 'Líder');
    const assistants = users.filter(u => u.role === 'Auxiliar');
    if (leaders.length === 0 || assistants.length === 0) {
      alert("É necessário ter pelo menos 1 Líder e 1 Auxiliar cadastrados.");
      return;
    }

    const nextL = leaders[nextLeaderIndex % leaders.length];
    const nextA = assistants[nextAssistantIndex % assistants.length];

    let startStr = '';
    
    if (trips.length > 0) {
      const lastTrip = trips[trips.length - 1];
      const parts = lastTrip.start_date.split('-');
      if (parts.length === 3) {
        let [yy, mm, dd] = parts;
        let newMm = parseInt(mm) + 1;
        let newYy = parseInt(yy);
        if (newMm > 12) { newMm = 1; newYy++; }
        startStr = `${newYy}-${newMm.toString().padStart(2, '0')}-${dd}`;
      } else {
        startStr = new Date().toISOString().split('T')[0];
      }
    } else {
      startStr = new Date().toISOString().split('T')[0];
    }

    // Por padrão coloca Início = Fim (viagem de um 1 dia)
    try {
      await createTravelTrip({
        start_date: startStr,
        end_date: startStr,
        leader_id: nextL.id,
        assistant_id: nextA.id,
        status: 'Confirmado',
        original_leader_id: null,
        original_assistant_id: null
      });
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao criar viagem.");
    }
  };

  const openTradeModal = (tripId: number, role: string, currentUserId: number) => {
    if (!currentUserId) return;
    setTradeContext({ tripId, targetRole: role, currentUserId });
    setTradeSubstituteId('');
    setShowTradeModal(true);
  };

  const handleTradeSubmit = async () => {
    if (!tradeContext || !tradeSubstituteId) return;
    const trip = trips.find(t => t.id === tradeContext.tripId);
    if (!trip) return;

    const substitute = users.find(u => u.id === tradeSubstituteId);
    if (!substitute) return;

    const updates: Partial<TravelTrip> = {
      status: `Trocado com ${substitute.name}`
    };

    if (tradeContext.targetRole === 'Líder') {
      if (!trip.original_leader_id) updates.original_leader_id = trip.leader_id;
      updates.leader_id = tradeSubstituteId;
    } else {
      if (!trip.original_assistant_id) updates.original_assistant_id = trip.assistant_id;
      updates.assistant_id = tradeSubstituteId;
    }

    try {
      await updateTravelTrip(tradeContext.tripId, updates);
      setShowTradeModal(false);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao realizar toque.");
    }
  };

  const openEditModal = (trip: TravelTrip) => {
    setEditContext({
      tripId: trip.id,
      startDate: trip.start_date,
      endDate: trip.end_date,
      leaderId: trip.leader_id,
      assistantId: trip.assistant_id
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editContext) return;
    const trip = trips.find(t => t.id === editContext.tripId);
    if (!trip) return;

    const updates: Partial<TravelTrip> = {
      start_date: editContext.startDate,
      end_date: editContext.endDate,
      leader_id: editContext.leaderId,
      assistant_id: editContext.assistantId
    };

    if (trip.leader_id !== editContext.leaderId || trip.assistant_id !== editContext.assistantId) {
       updates.status = "Confirmado";
       if (trip.leader_id !== editContext.leaderId) updates.original_leader_id = null;
       if (trip.assistant_id !== editContext.assistantId) updates.original_assistant_id = null;
    }

    try {
      await updateTravelTrip(editContext.tripId, updates);
      setShowEditModal(false);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao editar viagem.");
    }
  };

  const handleDeleteTrip = async (id: number) => {
    if (!confirm(`Tem certeza que deseja excluir a viagem #${id}?`)) return;
    try {
      await deleteTravelTrip(id);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir.");
    }
  };

  const handleExportCsv = () => {
    if (activeTab === 'calendario') {
      let csvContent = "data:text/csv;charset=utf-8,ID,DataInicio,DataFim,Lider,Auxiliar,Status,LiderOriginal,AuxiliarOriginal\n";
      trips.forEach(trip => {
        const leader = users.find(u => u.id === trip.leader_id)?.name || '';
        const assistant = users.find(u => u.id === trip.assistant_id)?.name || '';
        const origLeader = users.find(u => u.id === trip.original_leader_id)?.name || '';
        const origAssistant = users.find(u => u.id === trip.original_assistant_id)?.name || '';
        csvContent += `${trip.id},${trip.start_date},${trip.end_date},${leader},${assistant},${trip.status},${origLeader},${origAssistant}\n`;
      });
      triggerDownload(csvContent, "cronograma_viagens.csv");
    } else {
      let csvContent = `data:text/csv;charset=utf-8,Funcionario,Cargo,Dias-${dashboardMonthYear},Dias-Ano,Dias-Geral\n`;
      dashboardStats.forEach(stat => {
        csvContent += `${stat.name},${stat.role},${stat.daysThisMonth},${stat.daysThisYear},${stat.totalDays}\n`;
      });
      triggerDownload(csvContent, `comissoes_viagens_${dashboardMonthYear}.csv`);
    }
  };

  const triggerDownload = (csvContent: string, filename: string) => {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status.includes('Trocado')) return { background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b', boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)' };
    if (status === 'Confirmado') return { background: 'rgba(0, 255, 170, 0.2)', color: '#00ffaa', border: '1px solid #00ffaa', boxShadow: '0 0 10px rgba(0, 255, 170, 0.2)' };
    return { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444' };
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando dados...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* HEADER & TABS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Calendar color="var(--accent)" /> Controle de Viagens
        </h2>
        
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('calendario')}
            style={activeTab === 'calendario' ? activeTabStyle : inactiveTabStyle}
          >
            <CalendarDays size={16} /> Escala
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={activeTab === 'dashboard' ? activeTabStyle : inactiveTabStyle}
          >
            <LayoutDashboard size={16} /> Dashboard & Comissões
          </button>
        </div>
      </div>

      {activeTab === 'calendario' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', gap: '1rem' }}>
            <button className="btn-secondary" style={btnActionStyle} onClick={handleExportCsv} title="Exportar CSV">
              <Download size={18} /> Exportar CSV
            </button>
            <button className="btn-primary" style={{...btnPrimaryStyle, display: 'flex', gap: '0.5rem', alignItems: 'center'}} onClick={handleCreateTrip}>
              <Plus size={18} /> Gerar Próxima
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* RANKING SECTION */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Medal size={20} color="#f59e0b" /> Ranking de Participação (Presenças/Idas)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {usersWithPoints.map((user, index) => {
                  const medal = getMedal(user.points, index);
                  return (
                    <div key={user.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '1.05rem' }}>
                          {medal && <span style={{ fontSize: '1.2rem' }}>{medal}</span>}
                          {user.name}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.role}</span>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--accent)' }}>
                        {user.points} viagens
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SCHEDULE SECTION */}
            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                Escala Mensal
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Data</th>
                    <th style={thStyle}>Dias</th>
                    <th style={thStyle}>Líder</th>
                    <th style={thStyle}>Auxiliar</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(trip => {
                    const leader = users.find(u => u.id === trip.leader_id);
                    const assistant = users.find(u => u.id === trip.assistant_id);
                    const origLeader = users.find(u => u.id === trip.original_leader_id);
                    const origAssistant = users.find(u => u.id === trip.original_assistant_id);

                    return (
                      <tr key={trip.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle}>#{trip.id}</td>
                        <td style={{...tdStyle, fontWeight: '500', fontSize: '0.85rem'}}>
                          <div>De: {formatDate(trip.start_date)}</div>
                          <div style={{color: 'var(--text-secondary)'}}>Até: {formatDate(trip.end_date)}</div>
                        </td>
                        <td style={{...tdStyle, fontWeight: '700', color: 'var(--accent)'}}>{calculateDays(trip.start_date, trip.end_date)}</td>
                        <td style={tdStyle}>
                          <div style={{fontWeight: 600}}>{leader?.name || '?'}</div>
                          {origLeader && <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>(Era {origLeader.name})</div>}
                        </td>
                        <td style={tdStyle}>
                          <div style={{fontWeight: 600}}>{assistant?.name || '?'}</div>
                          {origAssistant && <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>(Era {origAssistant.name})</div>}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block', ...getStatusBadgeStyle(trip.status) }}>
                            {trip.status === 'Confirmado' ? '[✔] Confirmado' : trip.status}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="btn-secondary" style={btnSmallStyle} title="Trocar Líder" onClick={() => openTradeModal(trip.id, 'Líder', leader?.id || 0)}>
                                <RefreshCw size={12} /> Líder
                              </button>
                              <button className="btn-secondary" style={btnSmallStyle} title="Trocar Auxiliar" onClick={() => openTradeModal(trip.id, 'Auxiliar', assistant?.id || 0)}>
                                <RefreshCw size={12} /> Aux
                              </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="btn-secondary" style={{...btnSmallStyle, padding: '0.3rem'}} onClick={() => openEditModal(trip)}><Pencil size={14} /></button>
                              <button style={{...btnSmallStyle, padding: '0.3rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)', cursor: 'pointer', borderRadius: '4px'}} onClick={() => handleDeleteTrip(trip.id)}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {trips.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Nenhuma viagem na escala.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'dashboard' && (
        <div className="animate-fade-in">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Período do Relatório:</label>
              <input 
                type="month" 
                className="input-glass"
                style={{ width: '180px', colorScheme: 'dark' }}
                value={dashboardMonthYear}
                onChange={(e) => setDashboardMonthYear(e.target.value)}
              />
            </div>
            <button className="btn-secondary" style={btnActionStyle} onClick={handleExportCsv}>
              <Download size={18} /> Exportar Relatório (CSV)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
             <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid var(--accent)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Faturamento / Dias da Equipe (Mês)</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {dashboardStats.reduce((acc, curr) => acc + curr.daysThisMonth, 0)} <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)'}}>dias operados</span>
                </span>
             </div>
             <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #f59e0b' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Volume Acumulado da Equipe (Ano)</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {dashboardStats.reduce((acc, curr) => acc + curr.daysThisYear, 0)} <span style={{fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)'}}>dias operados</span>
                </span>
             </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              Relatório Individual para Comissões
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Colaborador (Nome)</th>
                  <th style={thStyle}>Cargo</th>
                  <th style={{...thStyle, color: 'var(--accent)'}}>Dias (Neste Mês)</th>
                  <th style={thStyle}>Dias (Ano)</th>
                  <th style={thStyle}>Histórico Todo Tempo</th>
                </tr>
              </thead>
              <tbody>
                {dashboardStats.map(stat => (
                  <tr key={stat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{...tdStyle, fontWeight: '600'}}>{stat.name}</td>
                    <td style={{...tdStyle, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{stat.role}</td>
                    <td style={{...tdStyle, fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent)'}}>
                      {stat.daysThisMonth} d
                    </td>
                    <td style={tdStyle}>{stat.daysThisYear} d</td>
                    <td style={{...tdStyle, color: 'var(--text-secondary)'}}>{stat.totalDays} d</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              * Os dias são computados analisando o início e fim de cada viagem no sistema. Usuários substituídos (Troca) não recebem dias na respectiva viagem.
            </p>
          </div>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeModal && tradeContext && (
        <div style={modalBackdropStyle}>
          <div className="glass-panel" style={modalStyle}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Trocar {tradeContext.targetRole}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Selecione o substituto. Os dias correspondentes dessa viagem serão transferidos ao substituto na contagem final.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Novo {tradeContext.targetRole}:</label>
              <select className="input-glass" style={{ width: '100%', WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }}
                value={tradeSubstituteId} onChange={(e) => setTradeSubstituteId(Number(e.target.value))}>
                <option value="" disabled style={{ color: 'var(--bg-primary)' }}>Selecione...</option>
                {users.filter(u => u.role === tradeContext.targetRole && u.id !== tradeContext.currentUserId).map(c => (
                  <option key={c.id} value={c.id} style={{ color: 'var(--bg-primary)' }}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
               <button className="btn-secondary" style={btnActionStyle} onClick={() => setShowTradeModal(false)}>Cancelar</button>
               <button className="btn-primary" style={btnActionStyle} onClick={handleTradeSubmit} disabled={!tradeSubstituteId}>Confirmar Troca</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editContext && (
        <div style={modalBackdropStyle}>
          <div className="glass-panel" style={modalStyle}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Editar Viagem #{editContext.tripId}</h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Início:</label>
                <input type="date" className="input-glass" style={{ width: '100%', colorScheme: 'dark' }} 
                  value={editContext.startDate} onChange={(e) => setEditContext({...editContext, startDate: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Fim:</label>
                <input type="date" className="input-glass" style={{ width: '100%', colorScheme: 'dark' }} 
                  value={editContext.endDate} onChange={(e) => setEditContext({...editContext, endDate: e.target.value})} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Líder:</label>
              <select className="input-glass" style={{ width: '100%', WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }}
                value={editContext.leaderId} onChange={(e) => setEditContext({...editContext, leaderId: Number(e.target.value)})}>
                {users.filter(u => u.role === 'Líder').map(l => (
                  <option key={l.id} value={l.id} style={{ color: 'var(--bg-primary)' }}>{l.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Auxiliar:</label>
              <select className="input-glass" style={{ width: '100%', WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer' }}
                value={editContext.assistantId} onChange={(e) => setEditContext({...editContext, assistantId: Number(e.target.value)})}>
                {users.filter(u => u.role === 'Auxiliar').map(a => (
                  <option key={a.id} value={a.id} style={{ color: 'var(--bg-primary)' }}>{a.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
               <button className="btn-secondary" style={btnActionStyle} onClick={() => setShowEditModal(false)}>Cancelar</button>
               <button className="btn-primary" style={btnActionStyle} onClick={handleEditSubmit}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Estilos Nativos Inline
const thStyle: React.CSSProperties = { padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' };
const tdStyle: React.CSSProperties = { padding: '1rem', verticalAlign: 'middle' };

const btnActionStyle: React.CSSProperties = { padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const btnPrimaryStyle: React.CSSProperties = { ...btnActionStyle, background: 'var(--accent)', color: 'white', border: 'none' };
const btnSmallStyle: React.CSSProperties = { padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)' };

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
};
const modalStyle: React.CSSProperties = {
  width: '90%', maxWidth: '450px', padding: '2rem', position: 'relative'
};

const activeTabStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-main)', 
  border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
  transition: 'all 0.2s'
};
const inactiveTabStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-secondary)', 
  border: '1px solid transparent', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 500, cursor: 'pointer',
  transition: 'all 0.2s'
};
