'use client';

import { useAuth } from '../lib/AuthContext';

interface UserRoleIndicatorProps {
  showLabel?: boolean;
}

export function UserRoleIndicator({ showLabel = true }: UserRoleIndicatorProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-6 w-16 bg-gray-800/50 animate-pulse rounded"></div>;
  }
  
  if (!user) return null;
  
  const roleColors = {
    owner: 'bg-red-500',
    admin: 'bg-purple-500',
    moderator: 'bg-blue-500',
    user: 'bg-green-500',
    guest: 'bg-gray-500'
  };
  
  const roleColor = roleColors[user.role as keyof typeof roleColors] || roleColors.guest;
  
  return (
    <div className="flex items-center space-x-2">
      {showLabel && <span className="text-sm text-gray-400">Role:</span>}
      <div className="flex items-center">
        <span className={`inline-block w-3 h-3 rounded-full ${roleColor} mr-2`}></span>
        <span className="text-sm font-medium capitalize">{user.role}</span>
      </div>
    </div>
  );
} 