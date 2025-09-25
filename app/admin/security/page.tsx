'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '../../../components/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search,
  Trash2,
  Eye,
  Clock,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  clientIP: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: string;
  resolved: boolean;
}

interface SecurityStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topIPs: Array<{ ip: string; count: number }>;
}

interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  duration: number;
}

export default function SecurityManagement() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIP, setSelectedIP] = useState('');

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [eventsRes, statsRes, blockedRes] = await Promise.all([
        fetch('/api/admin/security/events'),
        fetch('/api/admin/security/stats'),
        fetch('/api/admin/security/blocked-ips')
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || null);
      }

      if (blockedRes.ok) {
        const blockedData = await blockedRes.json();
        setBlockedIPs(blockedData.blockedIPs || []);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const unblockIP = async (ip: string) => {
    try {
      const response = await fetch('/api/admin/security/unblock-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip }),
      });

      if (response.ok) {
        toast.success(`IP ${ip} unblocked successfully`);
        fetchSecurityData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to unblock IP');
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
      toast.error('Failed to unblock IP');
    }
  };

  const blockIP = async (ip: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/security/block-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip, reason }),
      });

      if (response.ok) {
        toast.success(`IP ${ip} blocked successfully`);
        fetchSecurityData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to block IP');
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      toast.error('Failed to block IP');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RATE_LIMIT_EXCEEDED': return <Clock className="h-4 w-4" />;
      case 'SUSPICIOUS_ACTIVITY': return <AlertTriangle className="h-4 w-4" />;
      case 'DOS_ATTEMPT': return <XCircle className="h-4 w-4" />;
      case 'AUTH_FAILURE': return <Shield className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const filteredEvents = events.filter(event =>
    event.clientIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Security Management</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Security Management</h1>
          <Button onClick={fetchSecurityData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Blocked IPs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{blockedIPs.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">High Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  {(stats.eventsBySeverity.HIGH || 0) + (stats.eventsBySeverity.CRITICAL || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Top Threat IP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-white">
                  {stats.topIPs[0]?.ip || 'None'}
                </div>
                <div className="text-xs text-gray-400">
                  {stats.topIPs[0]?.count || 0} events
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="blocked">Blocked IPs</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          {/* Security Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by IP or event type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredEvents.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="py-8 text-center">
                    <Shield className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">No security events found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(event.type)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">{event.type}</span>
                              <Badge className={`${getSeverityColor(event.severity)} text-white`}>
                                {event.severity}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-400">
                              IP: {event.clientIP} • {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedIP(event.clientIP)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => blockIP(event.clientIP, `Blocked due to ${event.type}`)}
                          >
                            Block IP
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Blocked IPs Tab */}
          <TabsContent value="blocked" className="space-y-4">
            <div className="space-y-2">
              {blockedIPs.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="py-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-gray-400">No blocked IPs</p>
                  </CardContent>
                </Card>
              ) : (
                blockedIPs.map((blockedIP) => (
                  <Card key={blockedIP.ip} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{blockedIP.ip}</div>
                          <div className="text-sm text-gray-400">
                            Reason: {blockedIP.reason}
                          </div>
                          <div className="text-sm text-gray-400">
                            Blocked: {new Date(blockedIP.blockedAt).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unblockIP(blockedIP.ip)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Unblock
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>Block IP Address</CardTitle>
                <CardDescription>Manually block an IP address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter IP address"
                    value={selectedIP}
                    onChange={(e) => setSelectedIP(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (selectedIP) {
                        blockIP(selectedIP, 'Manually blocked by admin');
                        setSelectedIP('');
                      }
                    }}
                    disabled={!selectedIP}
                  >
                    Block IP
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>Security Actions</CardTitle>
                <CardDescription>Quick security management actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => fetchSecurityData()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh All Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Clear old events (implement this in API)
                    toast.info('Feature coming soon');
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Old Events
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
