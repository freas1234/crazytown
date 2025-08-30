'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import Link from 'next/link';
import { toast } from 'sonner';
import Script from 'next/script';
import { useTranslation } from '../../../../lib/hooks/useTranslation';
import { AuthGuard } from '../../../../components/AuthGuard';
import { use } from 'react';
import PayPalButton from '../../../../components/PayPalButton';

interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    discountPercentage?: number;
  }[];
  total: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentMethod: 'paypal' | 'card';
  paymentId?: string;
  deliveryMethod: 'digital' | 'none';
  createdAt: string;  
  updatedAt: string;  
}

export default function Checkout({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order data');
        router.push('/store/cart');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [resolvedParams.id, router]);
  
  useEffect(() => {
    if (order?.status === 'paid' || order?.status === 'completed') {
      router.push(`/store/confirmation/${order.id}`);
    }
  }, [order, router]);

  const handlePaymentSuccess = async (details: any) => {
        try {
          const response = await fetch('/api/payment/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
          paypalOrderId: details.orderID || details.id,
          orderId: order?.id
            }),
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to capture payment');
          }
      
          toast.success('Payment successful!');
          localStorage.removeItem('cart');
      router.push(`/store/confirmation/${order?.id}`);
        } catch (error) {
          console.error('Error capturing payment:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to process payment');
          setPaymentProcessing(false);
        }
  };

  const handlePaymentError = (error: any) => {
    console.error('PayPal error:', error);
        toast.error('There was an error with PayPal. Please try again.');
        setPaymentProcessing(false);
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  <span className="cyberpunk-border inline-block">{t('store.checkout.title', 'Checkout')}</span>
                </h1>
                <Link href="/store/cart" className="text-primary hover:text-primary/80 transition-colors">
                  {t('store.checkout.back_to_cart', 'Back to Cart')}
                </Link>
              </div>

              {loading ? (
                <div className="max-w-3xl mx-auto">
                  <div className="game-card animate-pulse">
                    <div className="h-12 bg-gray-800 rounded w-full mb-6"></div>
                    <div className="h-8 bg-gray-800 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-800 rounded w-1/2 mb-8"></div>
                    <div className="h-40 bg-gray-800 rounded w-full"></div>
                  </div>
                </div>
              ) : !order ? (
                <div className="max-w-3xl mx-auto text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl text-white mb-2">{t('store.checkout.order_not_found', 'Order not found')}</h2>
                  <p className="text-gray-400 mb-6">{t('store.checkout.order_not_found_message', 'We couldn\'t find the order you\'re looking for.')}</p>
                  <Link href="/store" className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors">
                    {t('store.checkout.return_to_store', 'Return to Store')}
                  </Link>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <div className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm mb-6">
                    <div className="p-6">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-800 mb-6">
                        <h2 className="text-xl font-bold text-white">{t('store.checkout.order_summary', 'Order Summary')}</h2>
                        <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                          {t('store.checkout.order_number', 'Order #')}{order.id.substring(0, 8)}
                        </span>
                      </div>

                      <div className="space-y-4 mb-6">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <div>
                              <span className="text-white">{item.name}</span>
                              <span className="text-gray-400"> × {item.quantity}</span>
                              {item.discountPercentage && item.discountPercentage > 0 && (
                                <span className="ml-2 bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded">
                                  {item.discountPercentage}% {t('store.checkout.off', 'off')}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <div className="text-gray-400 line-through text-sm">
                                  ${(item.originalPrice * item.quantity).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400">{t('store.cart.subtotal', 'Subtotal')}</span>
                          <span className="text-white">${order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                          <span className="text-gray-400">{t('store.cart.taxes', 'Taxes')}</span>
                          <span className="text-white">$0.00</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-white">{t('store.cart.total', 'Total')}</span>
                          <span className="text-primary">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm">
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-white mb-6">{t('store.checkout.payment_method', 'Payment Method')}</h2>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                          </span>
                          <span className="text-white">{t('store.checkout.paypal_or_card', 'PayPal or Credit Card')}</span>
                        </div>

                        <p className="text-gray-400 text-sm mb-6">
                          {t('store.checkout.paypal_redirect_message', 'You\'ll be redirected to PayPal to complete your purchase securely.')}
                        </p>

                        <div className={paymentProcessing ? 'opacity-50 pointer-events-none' : ''}>
                          <PayPalButton
                            amount={order.total.toString()}
                            currency="USD"
                            orderId={order.id}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                          />
                        </div>

                        {paymentProcessing && (
                          <div className="text-center mt-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-primary border-r-2 border-b-2 border-gray-800 mr-2"></div>
                            <span className="text-gray-400">{t('store.checkout.processing_payment', 'Processing payment...')}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-800">
                        <p className="text-gray-400 text-sm">
                          {t('store.checkout.terms_agreement', 'By completing this purchase, you agree to our')} <Link href="/terms" className="text-primary hover:underline">{t('store.checkout.terms_of_service', 'Terms of Service')}</Link> {t('store.checkout.and', 'and')} <Link href="/privacy" className="text-primary hover:underline">{t('store.checkout.privacy_policy', 'Privacy Policy')}</Link>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}