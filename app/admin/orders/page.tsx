'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleGuard } from '../../../components/RoleGuard';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Skeleton } from '../../../components/ui/skeleton';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';

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
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const handleRefresh = () => {
    fetchOrders();
    toast.success('Orders refreshed');
  };
  
  const handleUpdateStatus = async (orderId: string, status: 'pending' | 'paid' | 'completed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
      
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };
  
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);
  
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    paid: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    completed: 'bg-green-500/20 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/20',
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="cyberpunk-border inline-block">Order Management</span>
          </h1>
          <Button 
            onClick={handleRefresh}
            disabled={loading}
            className="bg-primary hover:bg-primary/80 text-white"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Orders
              </span>
            )}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-secondary/50 border border-gray-800 mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              All Orders
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Pending
            </TabsTrigger>
            <TabsTrigger value="paid" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Paid
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Cancelled
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="bg-secondary/80 border-gray-800">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex justify-between items-center mb-4">
                          <div className="h-6 bg-gray-800 rounded w-1/4"></div>
                          <div className="h-6 bg-gray-800 rounded w-1/6"></div>
                        </div>
                        <div className="h-4 bg-gray-800 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
                        <div className="h-10 bg-gray-800 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="bg-secondary/80 border-gray-800">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-xl text-white mb-2">No orders found</h3>
                  <p className="text-gray-400">
                    {activeTab === 'all' 
                      ? 'There are no orders in the system yet.' 
                      : `There are no orders with status "${activeTab}".`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <Card key={order.id} className="bg-secondary/80 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">Order #{order.id.substring(0, 8)}</h3>
                            <Badge className={statusColors[order.status]}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">
                            {formatDate(order.createdAt)} • {order.paymentMethod.toUpperCase()} • ${order.total.toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="mt-2 md:mt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-primary/30 hover:bg-primary/20 hover:text-primary"
                            asChild
                          >
                            <Link href={`/admin/orders/${order.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Customer</h4>
                        <p className="text-sm text-gray-400">
                          {order.user ? (
                            <>
                              <span className="text-white">{order.user.username}</span> • {order.user.email}
                            </>
                          ) : (
                            <span className="italic">User information not available</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Items</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span>
                                {item.name} × {item.quantity}
                              </span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-800">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {order.status !== 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                              onClick={() => handleUpdateStatus(order.id, 'pending')}
                            >
                              Mark as Pending
                            </Button>
                          )}
                          {order.status !== 'paid' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                              onClick={() => handleUpdateStatus(order.id, 'paid')}
                            >
                              Mark as Paid
                            </Button>
                          )}
                          {order.status !== 'completed' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                            >
                              Mark as Completed
                            </Button>
                          )}
                          {order.status !== 'cancelled' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            >
                              Mark as Cancelled
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
} 