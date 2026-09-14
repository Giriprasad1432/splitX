import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui/ui';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../api';
import { useRoom } from '../context/RoomContext';

export default function CreateRoom() {
  const navigate = useNavigate();
  const { saveSession } = useRoom();
  
  const [roomName, setRoomName] = useState('');
  const [yourName, setYourName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim() || !yourName.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // 1. Create Room
      const createRes = await api.createRoom(roomName, yourName);
      const room = createRes.room;
      
      // 2. Join the created room immediately so the creator is a Member
      const joinRes = await api.joinRoom(room.roomCode, yourName);
      
      // 3. Save Session
      saveSession(room.roomCode, {
        roomCode: room.roomCode,
        roomName: room.name,
        memberId: joinRes.member._id,
        memberName: joinRes.member.name
      });
      
      // 4. Navigate to dashboard
      navigate(`/room/${room.roomCode}`);
    } catch (err) {
      setError(err.message || 'Failed to create room. Please try again.');
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
        <h2 className="text-xl font-semibold ml-2">Create a Room</h2>
      </div>

      <Card className="border-0 shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl">Room Details</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Give your room a name and enter your name to get started.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Room Name
              </label>
              <Input 
                placeholder="e.g. Goa Trip 🌴" 
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Your Name
              </label>
              <Input 
                placeholder="e.g. Alex" 
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

            <Button type="submit" className="w-full h-12 text-base mt-4" disabled={isLoading || !roomName.trim() || !yourName.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
