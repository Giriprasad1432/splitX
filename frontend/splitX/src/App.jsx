import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoomProvider } from './context/RoomContext';

// Views
import Landing from './views/Landing';
import CreateRoom from './views/CreateRoom';
import JoinRoom from './views/JoinRoom';
import RoomDashboard from './views/RoomDashboard';
import Balances from './views/Balances';
import AddExpense from './views/AddExpense';

function App() {
  return (
    <RoomProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary selection:text-primary-foreground">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/room/:roomCode" element={<RoomDashboard />} />
            <Route path="/room/:roomCode/balances" element={<Balances />} />
            <Route path="/room/:roomCode/add-expense" element={<AddExpense />} />
            <Route path="/room/:roomCode/expense/:expenseId/edit" element={<AddExpense />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </RoomProvider>
  );
}

export default App;
