import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface DemoVideoModalProps {
  trigger: React.ReactNode;
}

const DemoVideoModal = ({ trigger }: DemoVideoModalProps) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 bg-card border-border">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            AlgebraAI Platform Demo
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative aspect-video bg-muted rounded-lg mx-6 mb-6 overflow-hidden">
          {/* Demo Video Content */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
            <div className="text-center space-y-6 p-8">
              <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-6">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Welcome to AlgebraAI
              </h3>
              
              <div className="space-y-4 text-left max-w-2xl">
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">🎯 Personalized Learning</h4>
                  <p className="text-muted-foreground text-sm">
                    Our AI adapts to your learning style, creating custom algebra problems that match your skill level perfectly.
                  </p>
                </div>
                
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">🧠 Smart Assessment</h4>
                  <p className="text-muted-foreground text-sm">
                    Take an initial assessment to determine your starting point, then watch as the difficulty adjusts based on your performance.
                  </p>
                </div>
                
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">📊 Real-time Progress</h4>
                  <p className="text-muted-foreground text-sm">
                    Track your improvement with detailed analytics, accuracy metrics, and achievement badges.
                  </p>
                </div>
                
                <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">🎮 Interactive Practice</h4>
                  <p className="text-muted-foreground text-sm">
                    Solve engaging multiple-choice problems with instant feedback and detailed explanations for every answer.
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-muted-foreground text-sm">
                  Ready to start your algebra journey? Register now and take your first assessment!
                </p>
              </div>
            </div>
          </div>
          
          {/* Video Controls */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsMuted(!isMuted)}
              className="bg-card/80 backdrop-blur-sm hover:bg-card"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoVideoModal;