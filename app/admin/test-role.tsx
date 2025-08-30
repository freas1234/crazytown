'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { useSession } from 'next-auth/react';

export default function TestRole() {
  const { user, isLoading, isAdmin } = useAuth();
  const { data: session } = useSession();
  const [apiUser, setApiUser] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(true);
  
  useEffect(() => {
    async function fetchApiUser() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setApiUser(data.user);
      } catch (error) {
        console.error('Error fetching API user:', error);
      } finally {
        setApiLoading(false);
      }
    }
    
    fetchApiUser();
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Role Diagnostic</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary/80 p-4 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">Auth Context</h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : user ? (
            <div>
              <p><span className="font-medium">User ID:</span> {user.id}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Username:</span> {user.username}</p>
              <p><span className="font-medium">Role:</span> <span className="text-primary font-bold">{user.role}</span></p>
              <p><span className="font-medium">Is Admin:</span> {isAdmin ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>Not authenticated</p>
          )}
        </div>
        
        <div className="bg-secondary/80 p-4 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">NextAuth Session</h2>
          {!session ? (
            <p>No session</p>
          ) : (
            <div>
              <p><span className="font-medium">User ID:</span> {session.user?.id}</p>
              <p><span className="font-medium">Email:</span> {session.user?.email}</p>
              <p><span className="font-medium">Name:</span> {session.user?.name}</p>
              <p><span className="font-medium">Role:</span> <span className="text-primary font-bold">{session.user?.role || 'Not set'}</span></p>
            </div>
          )}
        </div>
        
        <div className="bg-secondary/80 p-4 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold mb-2">API User (/api/auth/me)</h2>
          {apiLoading ? (
            <p>Loading...</p>
          ) : apiUser ? (
            <div>
              <p><span className="font-medium">User ID:</span> {apiUser.id}</p>
              <p><span className="font-medium">Email:</span> {apiUser.email}</p>
              <p><span className="font-medium">Username:</span> {apiUser.username}</p>
              <p><span className="font-medium">Role:</span> <span className="text-primary font-bold">{apiUser.role}</span></p>
            </div>
          ) : (
            <p>No user from API</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 bg-secondary/80 p-4 rounded-lg border border-gray-800">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-96 text-xs">
          <code>
            {JSON.stringify({
              authContext: { user, isLoading, isAdmin },
              session,
              apiUser
            }, null, 2)}
          </code>
        </pre>
      </div>
    </div>
  );
} 