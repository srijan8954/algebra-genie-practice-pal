import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, CreditCard, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onOpenChange }) => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');

  const tokenPackages = [
    {
      id: 'basic',
      name: 'Basic Package',
      tokens: 100,
      price: '$40',
      popular: false,
      description: '100 AI-generated problems'
    },
    {
      id: 'premium',
      name: 'Premium Package',
      tokens: 250,
      price: '$80',
      popular: true,
      description: '250 AI-generated problems'
    },
    {
      id: 'ultimate',
      name: 'Ultimate Package',
      tokens: 500,
      price: '$140',
      popular: false,
      description: '500 AI-generated problems'
    }
  ];

  const handlePurchase = async (packageId: string) => {
    if (!user) return;
    
    setIsProcessing(true);
    setSelectedPackage(packageId);
    
    try {
      // Create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { tokenPackage: packageId }
      });

      if (error) throw error;

      // In a real app, you would integrate with Stripe Elements here
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm payment
      const confirmResult = await supabase.functions.invoke('confirm-payment', {
        body: { payment_intent_id: `pi_mock_${Date.now()}` }
      });

      if (confirmResult.error) throw confirmResult.error;

      await refreshProfile();
      
      toast({
        title: "Payment Successful! 🎉",
        description: `${data.tokens} tokens have been added to your account.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedPackage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <span>Purchase Learning Tokens</span>
          </DialogTitle>
          <DialogDescription>
            Choose a token package to continue your AI-powered algebra learning journey.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {tokenPackages.map((pkg) => (
            <Card key={pkg.id} className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
              pkg.popular ? 'border-blue-500 shadow-md' : ''
            }`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-blue-600">{pkg.price}</div>
                  <div className="text-sm text-gray-600">{pkg.tokens} tokens</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${(parseFloat(pkg.price.replace('$', '')) / pkg.tokens).toFixed(2)} per token
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isProcessing}
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {isProcessing && selectedPackage === pkg.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing && selectedPackage === pkg.id ? 'Processing...' : 'Purchase'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">What you get:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• AI-generated algebra problems tailored to your level</li>
            <li>• Instant feedback and detailed explanations</li>
            <li>• Progress tracking and adaptive difficulty</li>
            <li>• Access to all algebra topics and problem types</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;