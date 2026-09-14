import React, { createContext, useContext, useState, useEffect } from 'react';

const RoomContext = createContext();

export function RoomProvider({ children }) {
  const [currentSession, setCurrentSession] = useState(null);

  // Helper to load session from localStorage
  const loadSession = (roomCode) => {
    try {
      const stored = localStorage.getItem(`splitx_session_${roomCode}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load session", e);
    }
    return null;
  };

  // Helper to save session
  const saveSession = (roomCode, sessionData) => {
    try {
      localStorage.setItem(`splitx_session_${roomCode}`, JSON.stringify(sessionData));
      setCurrentSession(sessionData);
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

  const clearSession = (roomCode) => {
    localStorage.removeItem(`splitx_session_${roomCode}`);
    if (currentSession?.roomCode === roomCode) {
      setCurrentSession(null);
    }
  };

  return (
    <RoomContext.Provider value={{
      currentSession,
      setCurrentSession,
      loadSession,
      saveSession,
      clearSession
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => useContext(RoomContext);
