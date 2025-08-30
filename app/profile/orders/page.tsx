'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../lib/AuthContext';
import { RoleGuard } from '../../../components/RoleGuard';
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentMethod: 'paypal' | 'card';
  paymentId?: string;
  deliveryMethod: 'digital' | 'none';
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { t, locale, isRTL } = useTranslation();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [processingCancel, setProcessingCancel] = useState(false);
  
  useEffect(() => {
    if (user && !authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/orders');
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error(t('orders.fetch_error', 'Failed to load orders'));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('orders.fetch_error', 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    
    try {
      setProcessingCancel(true);
      
      const response = await fetch('/api/user/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: cancellingOrder
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(t('orders.cancel_success', 'Order cancelled successfully'));
        
        // Update orders list
        setOrders(orders.map(order => 
          order.id === cancellingOrder 
            ? { ...order, status: 'cancelled' } 
            : order
        ));
        
        setCancelDialogOpen(false);
      } else {
        toast.error(data.error || t('orders.cancel_error', 'Failed to cancel order'));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(t('orders.cancel_error', 'Failed to cancel order'));
    } finally {
      setProcessingCancel(false);
      setCancellingOrder(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: locale === 'ar' ? ar : undefined });
  };
  
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">{t('orders.status.pending', 'Pending')}</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">{t('orders.status.paid', 'Paid')}</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">{t('orders.status.completed', 'Completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">{t('orders.status.cancelled', 'Cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RoleGuard allowedRoles={['user', 'admin', 'owner']} redirectTo="/login">
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-20 mt-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">{t('orders.title', 'My Orders')}</h1>
              <Link href="/profile">
                <Button variant="outline">
                  {t('common.back_to_profile', 'Back to Profile')}
                </Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-4 text-gray-400">{t('common.loading', 'Loading...')}</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">{t('orders.no_orders', 'No Orders Found')}</h2>
                  <p className="text-gray-400 mb-6">{t('orders.no_orders_desc', 'You haven\'t placed any orders yet.')}</p>
                  <Link href="/store">
                    <Button>
                      {t('orders.shop_now', 'Shop Now')}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-[#1A1A1A] border-[#333] overflow-hidden">
                    <CardHeader className="bg-[#222] border-b border-[#333] pb-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            {t('orders.order_number', 'Order')} #{order.id.substring(0, 8)}
                            {getStatusBadge(order.status)}
                          </CardTitle>
                          <CardDescription>
                            {t('orders.placed_on', 'Placed on')} {formatDate(order.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Link href={`/store/confirmation/${order.id}`}>
                            <Button variant="outline" size="sm">
                              {t('orders.view_details', 'View Details')}
                            </Button>
                          </Link>
                          
                          {(order.status === 'pending' || order.status === 'paid') && (
                            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => setCancellingOrder(order.id)}
                                >
                                  {t('orders.cancel_order', 'Cancel Order')}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t('orders.confirm_cancel', 'Confirm Cancellation')}</DialogTitle>
                                  <DialogDescription>
                                    {t('orders.cancel_warning', 'Are you sure you want to cancel this order? This action cannot be undone.')}
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setCancelDialogOpen(false);
                                      setCancellingOrder(null);
                                    }}
                                    disabled={processingCancel}
                                  >
                                    {t('common.cancel', 'Cancel')}
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleCancelOrder}
                                    disabled={processingCancel}
                                  >
                                    {processingCancel ? t('common.processing', 'Processing...') : t('orders.confirm', 'Confirm')}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm text-gray-400">
                          <span>{t('orders.items', 'Items')}: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                          <span>{t('orders.total', 'Total')}: ${order.total.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={`${order.id}-item-${index}`} className="flex justify-between items-center py-2 border-b border-[#333] last:border-0">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center mr-3">
                                  <span className="text-primary text-xs">{item.quantity}x</span>
                                </div>
                                <div>
                                  <p className="text-white">{item.name}</p>
                                  <div className="flex items-center text-sm">
                                    {item.originalPrice && item.originalPrice > item.price ? (
                                      <>
                                        <span className="text-gray-400 line-through mr-2">${item.originalPrice.toFixed(2)}</span>
                                        <span className="text-primary">${item.price.toFixed(2)}</span>
                                      </>
                                    ) : (
                                      <span className="text-gray-400">${item.price.toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {order.items.length > 3 && (
                            <div className="text-center text-sm text-gray-400 pt-2">
                              {t('orders.more_items', `+ ${order.items.length - 3} more items`)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </RoleGuard>
  );
} 