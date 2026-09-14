import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui/ui';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../api';
import { useRoom } from '../context/RoomContext';

export default function JoinRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveSession } = useRoom();
  
  const [roomCode, setRoomCode] = useState('');
  const [yourName, setYourName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If navigated from a direct room link, prepopulate the code
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get('code');
    if (codeFromUrl) {
      setRoomCode(codeFromUrl);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode.trim() || !yourName.trim()) return;

    setIsLoading(true);
    setError('');

    const formattedCode = roomCode.trim().toUpperCase();

    try {
      const joinRes = await api.joinRoom(formattedCode, yourName);
      
      saveSession(formattedCode, {
        roomCode: formattedCode,
        memberId: joinRes.member._id,
        memberName: joinRes.member.name
      });
      
      navigate(`/room/${formattedCode}`);
    } catch (err) {
      setError(err.message || 'Failed to join room. Check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 max-w-md mx-auto">
      <div className="flex items-center mb-8 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="-ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-semibold ml-2">Join a Room</h2>
      </div>

      <Card className="border-0 shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl">Enter Room Code</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Ask the creator for the 6-character room code.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Room Code
              </label>
              <Input 
                placeholder="e.g. AB12CD" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
                disabled={isLoading}
                className="uppercase tracking-widest font-mono text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Your Name
              </label>
              <Input 
                placeholder="e.g. Sarah" 
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isLoading || !roomCode.trim() || !yourName.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
