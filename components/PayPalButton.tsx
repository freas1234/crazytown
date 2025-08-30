'use client';

import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalButtonProps {
  amount: string;
  currency: string;
  orderId: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

export default function PayPalButton({ 
  amount, 
  currency, 
  orderId,
  onSuccess, 
  onError 
}: PayPalButtonProps) {
  const [clientId, setClientId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch the PayPal client ID from the server
    const fetchPayPalConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/payment/config');
        if (response.ok) {
          const data = await response.json();
          if (data.clientId) {
            setClientId(data.clientId);
            setError(null);
          } else {
            console.error('No PayPal client ID returned from server');
            setError('Payment configuration error. Please contact support.');
          }
        } else {
          console.error('Failed to fetch PayPal configuration');
          setError('Failed to load payment configuration.');
        }
      } catch (error) {
        console.error('Error fetching PayPal configuration:', error);
        setError('Error connecting to payment service.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayPalConfig();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 border border-gray-700 rounded-lg bg-gray-800/50">
        <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin mr-3"></div>
        <span className="text-gray-300">Loading payment options...</span>
      </div>
    );
  }
  
  if (error || !clientId) {
    return (
      <div className="p-6 border border-red-500/30 rounded-lg bg-red-500/10 text-red-400">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium">{error || 'Payment service unavailable'}</p>
        </div>
        <p className="text-sm opacity-80">Please try again later or contact support.</p>
      </div>
    );
  }
  
  return (
    <PayPalScriptProvider options={{ 
      clientId: clientId,
      currency: currency,
      intent: 'capture'
    }}>
      <PayPalButtons
        style={{ 
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay'
        }}
        createOrder={(data, actions) => {
          return fetch('/api/payment/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: orderId
            }),
          })
          .then(res => {
            if (!res.ok) throw new Error('Failed to create PayPal order');
            return res.json();
          })
          .then(orderData => {
            return orderData.orderId;
          })
          .catch(err => {
            console.error('Error creating PayPal order:', err);
            onError(err);
            throw err;
          });
        }}
        onApprove={async (data, actions) => {
          try {
            if (actions.order) {
              const details = await actions.order.capture();
              console.log('PayPal transaction completed:', details);
              onSuccess(details);
            }
          } catch (error) {
            console.error('Error capturing PayPal order:', error);
            onError(error);
          }
        }}
        onError={(err) => {
          console.error('PayPal error:', err);
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
}