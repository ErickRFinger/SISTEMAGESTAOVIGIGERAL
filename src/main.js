// Initial Mock State
const defaultState = {
  users: [
    { id: 1, name: 'Franklin', role: 'Líder', points: 0 },
    { id: 2, name: 'Raone', role: 'Líder', points: 0 },
    { id: 3, name: 'Marcelo', role: 'Líder', points: 0 },
    { id: 4, name: 'Leonardo', role: 'Líder', points: 0 },
    { id: 5, name: 'Arilson', role: 'Líder', points: 0 },
    { id: 6, name: 'Ueslei', role: 'Auxiliar', points: 0 },
    { id: 7, name: 'Guilherme', role: 'Auxiliar', points: 0 },
    { id: 8, name: 'Cauê', role: 'Auxiliar', points: 0 },
    { id: 9, name: 'Arthur', role: 'Auxiliar', points: 0 },
    { id: 10, name: 'Fernando', role: 'Auxiliar', points: 0 },
  ],
  trips: []
};

// Load state from localStorage or use default
let stateString = localStorage.getItem('travelScheduleState_v2');
let state = stateString ? JSON.parse(stateString) : JSON.parse(JSON.stringify(defaultState));

// Contexts for modals
let tradeContext = { tripId: null, targetRole: null, currentUserBeingReplaced: null };
let editContext = { tripId: null };

// Pointers for round-robin - recalculate based on last original leaders/assistants in state
let nextLeaderIndex = 0;
let nextAssistantIndex = 0;

function saveState() {
  localStorage.setItem('travelScheduleState_v2', JSON.stringify(state));
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'danger' ? 'toast-danger' : ''}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function calculatePoints() {
  state.users.forEach(u => u.points = 0);
  state.trips.forEach(trip => {
    const l = state.users.find(u => u.id === trip.leaderId);
    if(l) l.points += 1;
    
    const a = state.users.find(u => u.id === trip.assistantId);
    if(a) a.points += 1;

    if (trip.originalLeaderId) {
      const ol = state.users.find(u => u.id === trip.originalLeaderId);
      if(ol) ol.points -= 1;
    }
    if (trip.originalAssistantId) {
      const oa = state.users.find(u => u.id === trip.originalAssistantId);
      if(oa) oa.points -= 1;
    }
  });
}

function getMedal(points, rankIndex) {
  if (points <= 0) return '';
  if (rankIndex === 0) return '🥇'; // Top 1
  if (rankIndex === 1) return '🥈'; // Top 2
  if (rankIndex === 2) return '🥉'; // Top 3
  if (points >= 5) return '🎖️';     // Reached 5+ trips minimum score
  return '';
}

function formatDate(isoString) {
  if(!isoString) return '';
  const parts = isoString.split('-');
  if(parts.length !== 3) return isoString;
  const [yy, mm, dd] = parts;
  return `${dd}/${mm}/${yy}`;
}

function renderLeaderboard() {
  calculatePoints();
  const list = document.getElementById('leaderboard');
  list.innerHTML = '';
  // sort by points first, then alphabetically
  const sortedUsers = [...state.users].sort((a,b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.name.localeCompare(b.name);
  });
  
  sortedUsers.forEach((user, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <span class="user-name"><span class="medal">${getMedal(user.points, index)}</span> ${user.name}</span>
        <span class="user-role">${user.role}</span>
      </div>
      <span class="user-points">${user.points} pts</span>
    `;
    list.appendChild(li);
  });
}

function getStatusBadge(status) {
  if (status.includes('Trocado')) return `<span class="status-badge status-trocado">${status}</span>`;
  if (status === 'Confirmado') return `<span class="status-badge status-confirmado">[✔] Confirmado</span>`;
  return `<span class="status-badge status-pendente">${status}</span>`;
}

function renderSchedule() {
  const tbody = document.getElementById('scheduleBody');
  tbody.innerHTML = '';
  
  state.trips.forEach(trip => {
    const leader = state.users.find(u => u.id === trip.leaderId);
    const assistant = state.users.find(u => u.id === trip.assistantId);
    
    let originalText = '';
    if (trip.originalLeaderId) {
      const ol = state.users.find(u => u.id === trip.originalLeaderId);
      originalText += `Líder Orig: ${ol ? ol.name : '?'}<br>`;
    }
    if (trip.originalAssistantId) {
      const oa = state.users.find(u => u.id === trip.originalAssistantId);
      originalText += `Aux Orig: ${oa ? oa.name : '?'}`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${trip.id}</td>
      <td><strong>${formatDate(trip.date)}</strong></td>
      <td>${leader ? leader.name : '?'}</td>
      <td>${assistant ? assistant.name : '?'}</td>
      <td>${getStatusBadge(trip.status)}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${originalText || '-'}</td>
      <td>
        <div class="action-btns">
          <div class="action-line">
            <button class="btn btn-secondary btn-small" title="Trocar Líder" onclick="openTradeModal(${trip.id}, 'Líder', ${leader ? leader.id : 0})">🔄 Líder</button>
            <button class="btn btn-secondary btn-small" title="Trocar Auxiliar" onclick="openTradeModal(${trip.id}, 'Auxiliar', ${assistant ? assistant.id : 0})">🔄 Aux</button>
          </div>
          <div class="action-line" style="margin-top: 0.2rem">
            <button class="btn btn-secondary btn-icon" title="Editar Viagem" onclick="openEditModal(${trip.id})">✏️</button>
            <button class="btn btn-danger btn-icon" title="Excluir Viagem" onclick="deleteTrip(${trip.id})">🗑️</button>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// === TRADE LOGIC ===
window.openTradeModal = (tripId, role, currentUserId) => {
  if(!currentUserId) { showToast("Usuário inválido para troca.", "danger"); return; }
  tradeContext = { tripId, targetRole: role, currentUserBeingReplaced: currentUserId };
  
  const trip = state.trips.find(t => t.id === tripId);
  const currentUser = state.users.find(u => u.id === currentUserId);
  document.getElementById('tradeTripInfo').textContent = `Viagem #${tripId} - ${formatDate(trip.date)}`;
  
  const select = document.getElementById('tradeTarget');
  select.innerHTML = '';
  const candidates = state.users.filter(u => u.role === role && u.id !== currentUserId);
  candidates.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.name;
    select.appendChild(option);
  });
  
  document.getElementById('tradeModal').showModal();
};

window.openEditModal = (tripId) => {
  editContext = { tripId };
  const trip = state.trips.find(t => t.id === tripId);
  if (!trip) return;

  document.getElementById('editTripId').textContent = `#${tripId}`;
  document.getElementById('editDate').value = trip.date;

  const leaderSelect = document.getElementById('editLeader');
  leaderSelect.innerHTML = '';
  state.users.filter(u => u.role === 'Líder').forEach(l => {
    const option = document.createElement('option');
    option.value = l.id;
    option.textContent = l.name;
    if (l.id === trip.leaderId) option.selected = true;
    leaderSelect.appendChild(option);
  });

  const assistantSelect = document.getElementById('editAssistant');
  assistantSelect.innerHTML = '';
  state.users.filter(u => u.role === 'Auxiliar').forEach(a => {
    const option = document.createElement('option');
    option.value = a.id;
    option.textContent = a.name;
    if (a.id === trip.assistantId) option.selected = true;
    assistantSelect.appendChild(option);
  });

  document.getElementById('editModal').showModal();
};

window.deleteTrip = (tripId) => {
  if (confirm(`Tem certeza que deseja excluir a viagem #${tripId}?`)) {
    state.trips = state.trips.filter(t => t.id !== tripId);
    showToast("Viagem excluída com sucesso!", "danger");
    fullRender();
  }
};

function fullRender() {
  saveState();
  renderLeaderboard();
  renderSchedule();
}

document.addEventListener('DOMContentLoaded', () => {
  // === EVENT LISTENERS ===
  document.getElementById('tradeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const substituteId = parseInt(document.getElementById('tradeTarget').value);
    const { tripId, targetRole } = tradeContext;
    
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;
    const substitute = state.users.find(u => u.id === substituteId);
    
    if (targetRole === 'Líder') {
      if(!trip.originalLeaderId) trip.originalLeaderId = trip.leaderId;
      trip.leaderId = substituteId;
    } else {
      if(!trip.originalAssistantId) trip.originalAssistantId = trip.assistantId;
      trip.assistantId = substituteId;
    }
    trip.status = `Trocado com ${substitute.name}`;
    
    document.getElementById('tradeModal').close();
    showToast("Troca realizada com sucesso!");
    fullRender();
  });

  document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const tripId = editContext.tripId;
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;
    
    trip.date = document.getElementById('editDate').value;
    
    const newLId = parseInt(document.getElementById('editLeader').value);
    const newAId = parseInt(document.getElementById('editAssistant').value);
    
    if(trip.leaderId !== newLId || trip.assistantId !== newAId) {
       trip.status = "Confirmado";
       if(trip.leaderId !== newLId) trip.originalLeaderId = null;
       if(trip.assistantId !== newAId) trip.originalAssistantId = null;
    }

    trip.leaderId = newLId;
    trip.assistantId = newAId;

    document.getElementById('editModal').close();
    showToast("Viagem atualizada com sucesso!");
    fullRender();
  });

  document.getElementById('addTripBtn').addEventListener('click', () => {
    const leaders = state.users.filter(u => u.role === 'Líder');
    const assistants = state.users.filter(u => u.role === 'Auxiliar');
    
    let lastOrigLId = null, lastOrigAId = null;
    if(state.trips.length > 0) {
      const lastT = state.trips[state.trips.length - 1];
      lastOrigLId = lastT.originalLeaderId || lastT.leaderId;
      lastOrigAId = lastT.originalAssistantId || lastT.assistantId;
    }
    
    if (lastOrigLId) nextLeaderIndex = leaders.findIndex(l => l.id === lastOrigLId) + 1;
    if (lastOrigAId) nextAssistantIndex = assistants.findIndex(a => a.id === lastOrigAId) + 1;

    const nextL = leaders[nextLeaderIndex % leaders.length];
    const nextA = assistants[nextAssistantIndex % assistants.length];
    
    let dateStr = '';
    if(state.trips.length > 0) {
      const lastTrip = state.trips[state.trips.length - 1];
      const parts = lastTrip.date.split('-');
      if(parts.length === 3) {
        let [yy, mm, dd] = parts;
        let newMm = parseInt(mm) + 1;
        let newYy = parseInt(yy);
        if(newMm > 12) { newMm = 1; newYy++; }
        dateStr = `${newYy}-${newMm.toString().padStart(2, '0')}-${dd}`;
      }
    } else {
      dateStr = new Date().toISOString().split('T')[0];
    }
    
    const newId = state.trips.length > 0 ? Math.max(...state.trips.map(t=>t.id)) + 1 : 1;
    
    state.trips.push({
      id: newId, date: dateStr,
      leaderId: nextL.id, assistantId: nextA.id,
      status: 'Confirmado',
      originalLeaderId: null, originalAssistantId: null
    });
    
    showToast("Nova viagem gerada!");
    fullRender();
  });

  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Data,Lider,Auxiliar,Status,LiderOriginal,AuxiliarOriginal\n";
    
    state.trips.forEach(trip => {
      const leader = state.users.find(u => u.id === trip.leaderId)?.name || '';
      const assistant = state.users.find(u => u.id === trip.assistantId)?.name || '';
      const origLeader = state.users.find(u => u.id === trip.originalLeaderId)?.name || '';
      const origAssistant = state.users.find(u => u.id === trip.originalAssistantId)?.name || '';
      
      csvContent += `${trip.id},${trip.date},${leader},${assistant},${trip.status},${origLeader},${origAssistant}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cronograma_viagens.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Planilha CSV baixada!");
  });

  fullRender();
});
