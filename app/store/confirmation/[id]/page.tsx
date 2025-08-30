'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslation } from '../../../../lib/hooks/useTranslation';
import { AuthGuard } from '../../../../components/AuthGuard';

interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentMethod: 'paypal' | 'card';
  paymentId?: string;
  deliveryMethod: 'digital' | 'none';
  createdAt: Date;
  updatedAt: Date;
}

export default function Confirmation({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [id, setId] = useState<string>('');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id: orderId }) => {
      setId(orderId);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/orders/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        
        const data = await response.json();
        setOrder(data.order);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order data');
        setLoading(false);
        router.push('/store');
      }
    };
    
    fetchOrder();
  }, [id, router]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid opacity-5 z-0"></div>
            <div className="container mx-auto px-4 relative z-10">
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
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                      {t('store.confirmation.thank_you', 'Thank You for Your Purchase!')}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-lg mx-auto">
                      {order.status === 'completed' 
                        ? t('store.confirmation.order_completed', 'Your order has been completed successfully.')
                        : t('store.confirmation.order_processed', 'Your order has been processed successfully.')}
                    </p>
                  </div>
                  
                  <div className="game-card border-gray-800 bg-secondary/80 backdrop-blur-sm mb-6">
                    <div className="p-6">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-800 mb-6">
                        <h2 className="text-xl font-bold text-white">{t('store.confirmation.order_details', 'Order Details')}</h2>
                        <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                          {t('store.confirmation.order_number', 'Order #')}{order.id.substring(0, 8)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="text-white font-medium mb-2">{t('store.confirmation.order_information', 'Order Information')}</h3>
                          <ul className="space-y-1 text-gray-400">
                            <li><span className="text-gray-500">{t('store.confirmation.date', 'Date:')}</span> {new Date(order.createdAt).toLocaleDateString()}</li>
                            <li><span className="text-gray-500">{t('store.confirmation.status', 'Status:')}</span> <span className="capitalize">{order.status}</span></li>
                            <li><span className="text-gray-500">{t('store.confirmation.payment_method', 'Payment Method:')}</span> <span className="capitalize">{order.paymentMethod}</span></li>
                            <li><span className="text-gray-500">{t('store.confirmation.total', 'Total:')}</span> ${order.total.toFixed(2)}</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-white font-medium mb-2">{t('store.confirmation.delivery_information', 'Delivery Information')}</h3>
                          <p className="text-gray-400">
                            {order.deliveryMethod === 'digital' 
                              ? t('store.confirmation.digital_items_message', 'Your digital items are available in your account.')
                              : t('store.confirmation.delivery_method_message', 'Your items will be delivered according to the delivery method selected.')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-800 pt-6">
                        <h3 className="text-white font-medium mb-4">{t('store.confirmation.order_items', 'Order Items')}</h3>
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <div>
                                <span className="text-white">{item.name}</span>
                                <span className="text-gray-400"> × {item.quantity}</span>
                              </div>
                              <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          
                          <div className="pt-4 border-t border-gray-800 flex justify-between font-bold">
                            <span className="text-white">{t('store.cart.total', 'Total')}</span>
                            <span className="text-primary">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-400 mb-6">
                      {t('store.confirmation.email_sent', 'A confirmation email has been sent to your email address. You can also view your orders in your account dashboard.')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Link href="/inbox" className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors">
                        {t('store.confirmation.view_in_inbox', 'View in Inbox')}
                      </Link>
                      <Link href="/store" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
                        {t('store.confirmation.continue_shopping', 'Continue Shopping')}
                      </Link>
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