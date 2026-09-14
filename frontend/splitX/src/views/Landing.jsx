import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/ui';
import { WalletCards } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center rotate-3 transition-transform hover:rotate-6">
            <WalletCards className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Split<span className="text-primary">X</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm mx-auto">
            The easiest way to split expenses with friends and track balances in real-time.
          </p>
        </div>

        <div className="pt-8 space-y-4 w-full">
          <Button 
            className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
            onClick={() => navigate('/create')}
          >
            Create New Room
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 text-lg rounded-xl transition-all hover:scale-[1.02]"
            onClick={() => navigate('/join')}
          >
            Join Existing Room
          </Button>
        </div>

        <p className="text-sm text-muted-foreground pt-6">
          No account needed. Just create a room and share the code.
        </p>
      </div>
    </div>
  );
}
