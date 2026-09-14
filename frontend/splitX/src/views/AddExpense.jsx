import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardContent } from '../components/ui/ui';
import { ArrowLeft, Loader2, IndianRupee } from 'lucide-react';
import { api } from '../api';
import { useRoom } from '../context/RoomContext';
import { cn } from '../lib/utils';

export default function AddExpense() {
  const { roomCode, expenseId } = useParams();
  const isEditing = !!expenseId;
  
  const navigate = useNavigate();
  const { loadSession } = useRoom();
  const [session, setSession] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [participants, setParticipants] = useState([]); // array of member IDs
  const [splits, setSplits] = useState({}); // { memberId: amount }

  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

    const initData = async () => {
      try {
        // We use getBalances to conveniently get all members in the room
        const balRes = await api.getBalances(roomCode);
        const fetchedMembers = (balRes.balances || []).map(b => ({
          _id: b.memberId,
          name: b.name
        }));
        setMembers(fetchedMembers);

        if (isEditing) {
          // Fetch existing expense to populate
          const expRes = await api.getExpenses(roomCode);
          const exp = (expRes.expenses || []).find(e => e._id === expenseId);
          if (exp) {
            setTitle(exp.title);
            setAmount(exp.amount.toString());
            setPaidBy(exp.paidBy?._id || exp.paidBy);
            
            if (exp.participants && exp.participants.length > 0) {
              setSplitType(exp.splitType || 'equal');
              const pIds = exp.participants.map(p => p._id || p);
              setParticipants(pIds);
              
              if (exp.splitType === 'unequal' && exp.splits) {
                const sp = {};
                exp.splits.forEach(s => {
                  sp[s.memberId._id || s.memberId] = s.amount.toString();
                });
                setSplits(sp);
              }
            } else {
              // Not split yet
              setParticipants(fetchedMembers.map(m => m._id));
              setSplitType('equal');
            }
          } else {
            setError("Expense not found.");
          }
        } else {
          // Defaults for new
          setPaidBy(currentSession.memberId);
          setParticipants(fetchedMembers.map(m => m._id));
        }
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [roomCode, expenseId, loadSession, navigate, isEditing]);

  const toggleParticipant = (memberId) => {
    setParticipants(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return;
    setIsAddingSubmitting(true);
    setError('');
    try {
      const res = await api.addMember(roomCode, newPersonName);
      const newMember = { _id: res.member._id, name: res.member.name };
      
      setMembers(prev => [...prev, newMember]);
      setParticipants(prev => [...prev, newMember._id]);
      
      setNewPersonName('');
      setIsAddingPerson(false);
    } catch (err) {
      setError(err.message || "Failed to add person");
    } finally {
      setIsAddingSubmitting(false);
    }
  };

  // Calculations
  const numAmount = parseFloat(amount) || 0;
  const equalShare = participants.length > 0 ? +(numAmount / participants.length).toFixed(2) : 0;
  
  const unequalTotal = useMemo(() => {
    return Object.values(splits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [splits]);

  const remaining = +(numAmount - unequalTotal).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || numAmount <= 0 || !paidBy) return;

    if (participants.length > 0) {
      if (splitType === 'unequal') {
        if (Math.abs(remaining) > 0.05) {
          setError(`Unequal splits must exactly sum up to the total amount. Remaining: ₹${remaining}`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title,
        amount: numAmount,
        paidBy,
        createdBy: session.memberId,
        participants,
        splitType: participants.length > 0 ? splitType : null,
      };

      if (participants.length > 0 && splitType === 'unequal') {
        payload.splits = participants.map(id => ({
          memberId: id,
          amount: parseFloat(splits[id] || 0)
        }));
      }

      if (isEditing) {
        await api.splitExpense(roomCode, expenseId, payload);
      } else {
        await api.addExpense(roomCode, payload);
      }
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError(err.message || 'Failed to save expense');
      setIsSubmitting(false);
    }
  };

  if (!session || isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 p-6 pb-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/room/${roomCode}`)} className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="ml-2">
            <h1 className="text-xl font-bold">{isEditing ? 'Edit Expense' : 'Add Expense'}</h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">What was this for?</label>
                <Input 
                  placeholder="e.g. Dinner at absolute barbeques" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="font-medium text-lg h-12"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">How much?</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <IndianRupee className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="pl-10 font-bold text-2xl h-14"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Who paid?</label>
                <select 
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  value={paidBy}
                  onChange={e => setPaidBy(e.target.value)}
                  required
                >
                  <option value="" disabled>Select payer</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.name} {m._id === session.memberId ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Split Details</h3>
              <div className="bg-secondary p-1 rounded-lg inline-flex">
                <button 
                  type="button"
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", splitType === 'equal' ? "bg-background shadow-sm" : "text-muted-foreground")}
                  onClick={() => setSplitType('equal')}
                >
                  Equal
                </button>
                <button 
                  type="button"
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition-colors", splitType === 'unequal' ? "bg-background shadow-sm" : "text-muted-foreground")}
                  onClick={() => setSplitType('unequal')}
                >
                  Unequal
                </button>
              </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="divide-y divide-border">
                {members.map(m => {
                  const isSelected = participants.includes(m._id);
                  return (
                    <div key={m._id} className="p-4 flex items-center justify-between bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3" onClick={() => toggleParticipant(m._id)}>
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-md border-primary text-primary focus:ring-primary cursor-pointer"
                          checked={isSelected}
                          readOnly
                        />
                        <span className={cn("font-medium select-none cursor-pointer", !isSelected && "text-muted-foreground")}>
                          {m.name} {m._id === session.memberId ? '(You)' : ''}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <div className="w-1/3">
                          {splitType === 'equal' ? (
                            <div className="text-right font-semibold">
                              ₹{equalShare.toFixed(2)}
                            </div>
                          ) : (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                              <Input 
                                type="number"
                                step="0.01"
                                className="pl-7 h-9 text-right text-sm font-medium"
                                value={splits[m._id] || ''}
                                onChange={e => setSplits({...splits, [m._id]: e.target.value})}
                                placeholder="0"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Person Inline UX */}
                {isAddingPerson ? (
                  <div className="p-4 flex items-center justify-between bg-card transition-colors">
                    <div className="flex-1 mr-4 relative">
                      <Input 
                        type="text" 
                        placeholder="Enter person's name..." 
                        className="h-10 text-sm"
                        value={newPersonName}
                        onChange={e => setNewPersonName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPerson();
                          }
                        }}
                        autoFocus
                        disabled={isAddingSubmitting}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        size="sm" 
                        variant="ghost" 
                        onClick={() => { setIsAddingPerson(false); setNewPersonName(''); }}
                        disabled={isAddingSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        size="sm" 
                        onClick={handleAddPerson}
                        disabled={!newPersonName.trim() || isAddingSubmitting}
                      >
                        {isAddingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="p-4 flex items-center gap-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer text-primary"
                    onClick={() => setIsAddingPerson(true)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center font-bold text-lg">+</div>
                    <span className="font-medium">Add person</span>
                  </div>
                )}
              </div>
            </Card>

            {splitType === 'unequal' && (
              <div className={cn("text-center text-sm font-medium p-3 rounded-lg", 
                remaining === 0 ? "bg-green-50 text-green-700" : "bg-destructive/10 text-destructive"
              )}>
                {remaining === 0 
                  ? "Perfectly split! ✨" 
                  : remaining > 0 
                    ? `₹${remaining.toFixed(2)} left to allocate`
                    : `Over-allocated by ₹${Math.abs(remaining).toFixed(2)}`
                }
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-14 text-lg mt-4 shadow-lg shadow-primary/20" disabled={isSubmitting || !title.trim() || numAmount <= 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Expense'
            )}
          </Button>
          
          <div className="h-10"></div>
        </form>
      </div>
    </div>
  );
}
