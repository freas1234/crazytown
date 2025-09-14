'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleGuard } from '../../components/RoleGuard';
import { useAuth } from '../../lib/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import MaintenanceModeIndicator from '../../components/MaintenanceModeIndicator';
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  FileText, 
  RefreshCw, 
  Users, 
  XCircle,
  ArrowRight,
  Plus,
  UserPlus,
  Edit,
  FileCode,
  Settings,
  LayoutDashboard,
  Eye
} from 'lucide-react';
import { Progress } from "../../components/ui/progress";
import { useTranslation } from '../../lib/hooks/useTranslation';

interface Application {
  id: string;
  jobId: string;
  jobTitle?: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { locale, isRTL } = useTranslation();
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    fetchRecentApplications();
    
    // Simulate progress animation
    const timer = setTimeout(() => setProgressValue(100), 500);
    return () => clearTimeout(timer);
  }, []);

  // Jobs functionality disabled - no jobs API endpoint available
  // const fetchJobs = async () => {
  //   // Jobs API not implemented yet
  // };

  const fetchRecentApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/applications');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Add job titles to applications (fallback to jobId if job API not available)
      const applicationsWithJobDetails = data.applications.slice(0, 5).map((app: Application) => ({
        ...app,
        jobTitle: app.jobTitle || `Job ${app.jobId?.substring(0, 8) || 'Unknown'}`
      }));
      
      setRecentApplications(applicationsWithJobDetails);
    } catch (error) {
      console.error('Error fetching recent applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
    }
  };

  const StatCard = ({ title, value, icon, description, trend, color = "primary" }: { 
    title: string, 
    value: string | number, 
    icon: React.ReactNode, 
    description?: string,
    trend?: { value: string, positive: boolean },
    color?: "primary" | "green" | "blue" | "amber" | "red" | "purple"
  }) => {
    const colorClasses = {
      primary: "from-primary/20 to-primary/5 border-primary/20 text-primary",
      green: "from-green-500/20 to-green-500/5 border-green-500/20 text-green-500",
      blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-500",
      amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-500",
      red: "from-red-500/20 to-red-500/5 border-red-500/20 text-red-500",
      purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-500"
    };
    
    return (
      <Card className={`border bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full`}>
        <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/5 group-hover:bg-white/10 transition-all duration-300"></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="p-2 bg-white/10 rounded-full">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <div className={`flex items-center justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {description && <p className="text-xs opacity-70">{description}</p>}
            {trend && (
              <div className={`flex items-center text-xs ${trend.positive ? 'text-green-400' : 'text-red-400'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                {trend.positive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {trend.value}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <RoleGuard allowedRoles={['admin', 'owner']} redirectTo="/login">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <span className="cyberpunk-border inline-block">Admin Dashboard</span>
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name || 'Administrator'}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchRecentApplications} 
              className="gap-2 border-primary/30 hover:bg-primary/20 hover:text-primary transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* System status indicator */}
        <div className="mb-8 bg-secondary/50 border border-gray-800 rounded-lg p-4 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-sm font-medium text-white">System Status</h3>
              <p className="text-xs text-gray-400">All systems operational</p>
            </div>
          </div>
          <Progress value={progressValue} className="w-32 h-2" />
        </div>
        
        <Tabs 
          defaultValue="overview" 
          className="w-full" 
          onValueChange={setActiveTab} 
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 backdrop-blur-sm border border-gray-800 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(255,107,0,0.2)] rounded-md"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="applications"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(255,107,0,0.2)] rounded-md"
            >
              <Users className="h-4 w-4 mr-2" />
              Applications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard 
                title="Total Applications" 
                value={recentApplications.length}
                icon={<Activity className="h-4 w-4" />}
                description="All time applications"
                color="blue"
              />
              <StatCard 
                title="Pending Applications" 
                value={recentApplications.filter(app => app.status === 'pending').length}
                icon={<Clock className="h-4 w-4" />}
                description="Waiting for review"
                color="amber"
              />
              <StatCard 
                title="Approved Applications" 
                value={recentApplications.filter(app => app.status === 'approved').length}
                icon={<CheckCircle className="h-4 w-4" />}
                color="green"
              />
              <StatCard 
                title="Rejected Applications" 
                value={recentApplications.filter(app => app.status === 'rejected').length}
                icon={<XCircle className="h-4 w-4" />}
                color="red"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-3 md:col-span-2 border-gray-800 bg-secondary/50 backdrop-blur-sm overflow-hidden shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between bg-secondary/30 border-b border-gray-800/50">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <Users className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-primary`} />
                      Recent Applications
                    </CardTitle>
                    <CardDescription className="text-gray-400">Latest job applications received</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="hover:bg-primary/20 hover:text-primary transition-all duration-300">
                    <Link href="/admin/store" className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      View All
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 flip-x' : 'ml-2'}`} />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <Skeleton className="h-4 w-32 mb-2 bg-gray-700" />
                            <Skeleton className="h-3 w-24 bg-gray-700" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
                            <Skeleton className="h-4 w-12 bg-gray-700" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20">
                      <p className="text-red-500">{error}</p>
                      <Button variant="outline" size="sm" onClick={fetchRecentApplications} className="mt-2 border-red-500/30 hover:bg-red-500/20">
                        Try Again
                      </Button>
                    </div>
                  ) : recentApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No applications found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentApplications.map(application => (
                        <div key={application.id} className="flex items-center justify-between border-b border-gray-800/50 pb-4 last:border-0 last:pb-0 hover:bg-gray-800/10 p-2 rounded-md transition-colors">
                          <div>
                            <span className="font-medium text-white">
                              {application.name}
                            </span>
                            <p className="text-sm text-gray-500">Applied for {application.jobTitle}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(application.status)}
                            <span className="text-xs text-gray-500">{formatDate(application.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-secondary/30 border-t border-gray-800/50">
                  <Button asChild className="w-full bg-primary hover:bg-primary/80 text-white gap-2">
                    <Link href="/admin/store">
                      <Users className="h-4 w-4" />
                      Manage Store & Products
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
          
              <Card className="col-span-3 md:col-span-1 border-gray-800 bg-secondary/50 backdrop-blur-sm overflow-hidden shadow-lg">
                <CardHeader className="bg-secondary/30 border-b border-gray-800/50">
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-gray-400">Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  <Button variant="outline" className={`w-full justify-start border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} asChild>
                    <Link href="/admin/store/products/create">
                      <Plus className="h-4 w-4" />
                      Create New Product
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className={`w-full justify-start border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} asChild>
                    <Link href="/admin/users">
                      <UserPlus className="h-4 w-4" />
                      Add New User
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className={`w-full justify-start border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} asChild>
                    <Link href="/admin/content">
                      <Edit className="h-4 w-4" />
                      Edit Website Content
                    </Link>
                  </Button>

                  <Button variant="outline" className={`w-full justify-start border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} asChild>
                    <Link href="/admin/rules">
                      <FileCode className="h-4 w-4" />
                      Manage Rules
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className={`w-full justify-start border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} asChild>
                    <Link href="/admin/settings">
                      <Settings className="h-4 w-4" />
                      Site Settings
                    </Link>
                  </Button>
                  
                  <div className="mt-4 pt-4 border-t border-gray-800/50">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Site Status</h3>
                    <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-gray-300">Maintenance Mode:</span>
                      <MaintenanceModeIndicator />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="applications">
            <Card className="border-gray-800 bg-secondary/50 backdrop-blur-sm overflow-hidden shadow-lg">
              <CardHeader className="bg-secondary/30 border-b border-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      All Recent Applications
                    </CardTitle>
                    <CardDescription className="text-gray-400">Manage all job applications</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchRecentApplications} 
                    className="gap-2 border-primary/30 hover:bg-primary/20 hover:text-primary"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-4 w-32 mb-2 bg-gray-700" />
                          <Skeleton className="h-3 w-24 bg-gray-700" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
                          <Skeleton className="h-4 w-12 bg-gray-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20">
                    <p className="text-red-500">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchRecentApplications} className="mt-2 border-red-500/30 hover:bg-red-500/20">
                      Try Again
                    </Button>
                  </div>
                ) : recentApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No applications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map(application => (
                      <div key={application.id} className="flex items-center justify-between border-b border-gray-800/50 pb-4 last:border-0 last:pb-0 hover:bg-gray-800/10 p-2 rounded-md transition-colors">
                        <div>
                          <span className="font-medium text-white">
                            {application.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">Applied for {application.jobTitle}</p>
                            <p className="text-xs text-gray-600">• {application.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(application.status)}
                          <span className="text-xs text-gray-500">{formatDate(application.createdAt)}</span>
                          <Button variant="ghost" size="sm" className="hover:bg-primary/20 hover:text-primary" disabled>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-secondary/30 border-t border-gray-800/50">
                  <Button asChild className={`w-full bg-primary hover:bg-primary/80 text-white gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Link href="/admin/store">
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'flip-x' : ''}`} />
                      Manage Store
                    </Link>
                  </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
} 