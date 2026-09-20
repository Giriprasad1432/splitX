const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/rooms` : '/api/rooms';

export const api = {
  // Create a new room
  createRoom: async (name, createdBy) => {
    const res = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, createdBy }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create room');
    }
    return res.json();
  },

  // Join a room
  joinRoom: async (roomCode, name) => {
    const res = await fetch(`${API_BASE}/${roomCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to join room');
    }
    return res.json();
  },

  // Add a member (without joining)
  addMember: async (roomCode, name) => {
    const res = await fetch(`${API_BASE}/${roomCode}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add member');
    }
    return res.json();
  },

  // Remove a member
  removeMember: async (roomCode, memberId, adminId) => {
    const res = await fetch(`${API_BASE}/${roomCode}/members/${memberId}`, {
      method: 'DELETE',
      headers: {
        'memberid': adminId
      }
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to remove member');
    }
    return res.json();
  },

  // Get all expenses
  getExpenses: async (roomCode) => {
    const res = await fetch(`${API_BASE}/${roomCode}/expenses`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to fetch expenses');
    }
    return res.json();
  },

  // Delete an expense
  deleteExpense: async (roomCode, expenseId) => {
    const res = await fetch(`${API_BASE}/${roomCode}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete expense');
    }
    return res.json();
  },

  // Add an expense
  addExpense: async (roomCode, payload) => {
    const res = await fetch(`${API_BASE}/${roomCode}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add expense');
    }
    return res.json();
  },

  // Split an expense (or re-split)
  splitExpense: async (roomCode, expenseId, payload) => {
    const res = await fetch(`${API_BASE}/${roomCode}/expenses/${expenseId}/split`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to split expense');
    }
    return res.json();
  },

  // Get balances
  getBalances: async (roomCode) => {
    const res = await fetch(`${API_BASE}/${roomCode}/balances`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to get balances');
    }
    return res.json();
  }
};
