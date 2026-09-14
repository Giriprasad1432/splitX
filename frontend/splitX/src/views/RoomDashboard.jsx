import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Badge } from '../components/ui/ui';
import { Copy, Plus, Users, Receipt, User, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { api } from '../api';
import { useRoom } from '../context/RoomContext';
import { cn } from '../lib/utils';

export default function RoomDashboard() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { loadSession, clearSession } = useRoom();

  const [session, setSession] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Add Member State
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [isAddingSubmitting, setIsAddingSubmitting] = useState(false);

  useEffect(() => {
    const currentSession = loadSession(roomCode);
    if (!currentSession) {
      navigate(`/join?code=${roomCode}`);
      return;
    }
    setSession(currentSession);
  }, [roomCode, loadSession, navigate]);

  const fetchData = useCallback(async () => {
    if (!session) return;
    try {
      setError('');
      const [expRes, balRes] = await Promise.all([
        api.getExpenses(roomCode),
        api.getBalances(roomCode)
      ]);
      setExpenses(expRes.expenses || []);
      setBalances(balRes.balances || []);
    } catch (err) {
      setError('Failed to load room data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, [roomCode, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!session) return null; // Wait for redirect

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return;
    setIsAddingSubmitting(true);
    setError('');
    try {
      await api.addMember(roomCode, newPersonName);
      setNewPersonName('');
      setIsAddingPerson(false);
      // Refresh balances to show the new person (with 0 balance) if needed,
      // though typically they won't show until an expense is added.
      // We call fetchData to refresh everything seamlessly.
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to add person");
    } finally {
      setIsAddingSubmitting(false);
    }
  };

  const myBalance = balances.find(b => b.memberId === session.memberId)?.balance || 0;
  const isPositive = myBalance > 0;
  const isNegative = myBalance < 0;

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground pt-8 pb-12 px-6 rounded-b-[2rem] shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">{session.roomName || 'SplitX Room'}</h1>
              <div 
                className="inline-flex items-center gap-2 mt-1 bg-primary-foreground/10 px-3 py-1 rounded-full cursor-pointer hover:bg-primary-foreground/20 transition-colors"
                onClick={copyCode}
              >
                <span className="text-sm font-medium tracking-wider">{roomCode}</span>
                <Copy className="w-3.5 h-3.5" />
                {copied && <span className="text-xs">Copied!</span>}
              </div>
            </div>
            <div 
              className="flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-primary-foreground/20 transition-colors"
              onClick={() => {
                clearSession(roomCode);
                navigate('/');
              }}
              title="Exit Room"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{session.memberName}</span>
              <LogOut className="w-4 h-4 ml-1 opacity-70" />
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-primary-foreground/80 font-medium mb-1">Your Total Balance</p>
            <div className="text-5xl font-extrabold tracking-tight">
              {myBalance === 0 ? 'Settled' : `₹${Math.abs(myBalance).toFixed(0)}`}
            </div>
            {myBalance !== 0 && (
              <Badge 
                variant="secondary" 
                className={cn("mt-3 px-4 py-1 text-sm border-0", 
                  isPositive ? "bg-green-500/20 text-green-100" : "bg-red-500/20 text-red-100"
                )}
              >
                {isPositive ? 'You get back' : 'You owe'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 -mt-6 space-y-6">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/room/${roomCode}/balances`)}>
            <CardContent className="p-3 flex flex-col items-center justify-center gap-1.5 text-center h-full">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Balances</span>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/room/${roomCode}/add-expense`)}>
            <CardContent className="p-3 flex flex-col items-center justify-center gap-1.5 text-center h-full">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Expense</span>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsAddingPerson(!isAddingPerson)}>
            <CardContent className="p-3 flex flex-col items-center justify-center gap-1.5 text-center h-full">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs">Add Person</span>
            </CardContent>
          </Card>
        </div>

        {/* Add Person Inline Input */}
        {isAddingPerson && (
          <Card className="border-0 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-4 flex items-center gap-2 bg-card">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Enter person's name..." 
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newPersonName}
                  onChange={e => setNewPersonName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddPerson();
                  }}
                  autoFocus
                  disabled={isAddingSubmitting}
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleAddPerson}
                disabled={!newPersonName.trim() || isAddingSubmitting}
                className="h-10"
              >
                {isAddingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
              </Button>
            </div>
          </Card>
        )}

        {/* Expenses List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Recent Expenses</h2>
            <span className="text-sm text-muted-foreground">{expenses.length} total</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 px-6 bg-card rounded-2xl border border-dashed border-border">
              <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-muted-foreground mb-1">No expenses yet</h3>
              <p className="text-sm text-muted-foreground/80">Add your first expense to start splitting!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map(expense => {
                const isSplit = expense.participants && expense.participants.length > 0;
                return (
                  <Card key={expense._id} className="border-0 shadow-sm overflow-visible">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{expense.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Paid by <span className="font-medium text-foreground">{expense.paidBy?.name}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{expense.amount}</div>
                          {isSplit && (
                            <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">
                              {expense.splitType}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!isSplit ? (
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <span className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-md">Not split yet</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 text-xs font-semibold"
                            onClick={() => navigate(`/room/${roomCode}/expense/${expense._id}/edit`)}
                          >
                            Split Now
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="mt-3 pt-3 border-t flex justify-between items-center cursor-pointer group"
                          onClick={() => navigate(`/room/${roomCode}/expense/${expense._id}/edit`)}
                        >
                          <div className="flex -space-x-2">
                            {expense.participants.slice(0, 4).map((p, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-bold z-10">
                                {p.name?.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {expense.participants.length > 4 && (
                              <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold z-0">
                                +{expense.participants.length - 4}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                            Edit Split <ArrowRight className="w-3 h-3 ml-1" />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed FAB for mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button 
          size="icon" 
          className="w-14 h-14 rounded-full shadow-lg shadow-primary/30"
          onClick={() => navigate(`/room/${roomCode}/add-expense`)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
