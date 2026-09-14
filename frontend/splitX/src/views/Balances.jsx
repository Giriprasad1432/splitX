import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '../components/ui/ui';
import { ArrowLeft, Loader2, IndianRupee, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { useRoom } from '../context/RoomContext';
import { cn } from '../lib/utils';

export default function Balances() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { loadSession } = useRoom();

  const [session, setSession] = useState(null);
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentSession = loadSession(roomCode);
    if (!currentSession) {
      navigate(`/join?code=${roomCode}`);
      return;
    }
    setSession(currentSession);
    
    const fetchBalances = async () => {
      try {
        const res = await api.getBalances(roomCode);
        // Sort balances: positive first, then negative, then 0
        const sorted = (res.balances || []).sort((a, b) => b.balance - a.balance);
        setBalances(sorted);
      } catch (err) {
        setError('Failed to fetch balances.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalances();
  }, [roomCode, loadSession, navigate]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 p-6 pb-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/room/${roomCode}`)} className="-ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="ml-2">
            <h1 className="text-xl font-bold">Room Balances</h1>
            <p className="text-xs text-muted-foreground">{session.roomName}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
            {error}
          </div>
        ) : balances.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-muted-foreground">No balances to show yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {balances.map(b => {
              const isMe = b.memberId === session.memberId;
              const isPositive = b.balance > 0;
              const isNegative = b.balance < 0;
              const isSettled = b.balance === 0;

              return (
                <Card 
                  key={b.memberId} 
                  className={cn(
                    "border-0 shadow-sm transition-all",
                    isMe ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  )}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-base flex items-center gap-2">
                          {b.name}
                          {isMe && <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-bold">You</span>}
                        </div>
                        <div className={cn("text-xs font-medium mt-0.5", 
                          isPositive ? "text-green-600" : 
                          isNegative ? "text-red-600" : 
                          "text-muted-foreground"
                        )}>
                          {isPositive ? 'Gets back' : isNegative ? 'Owes' : 'Settled up'}
                        </div>
                      </div>
                    </div>
                    
                    <div className={cn("font-bold text-lg flex items-center", 
                      isPositive ? "text-green-600" : 
                      isNegative ? "text-red-600" : 
                      "text-muted-foreground"
                    )}>
                      {isPositive ? '+' : isNegative ? '-' : ''}
                      <IndianRupee className="w-4 h-4 ml-0.5 mr-[1px]" />
                      {Math.abs(b.balance).toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
