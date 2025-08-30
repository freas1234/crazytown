import { connectToDatabase } from './db';

const isServer = typeof window === 'undefined';

let isMaintenanceMode = false;

const allowedPaths = [
  '/login',
  '/api/auth/login',
  '/api/auth/me',
  '/api/auth/callback',
  '/api/auth/callback/discord',
  '/api/auth/callback/credentials',
  '/api/auth/[...nextauth]',
  '/admin',
  '/admin/settings',
  '/api/maintenance',
  '/api/admin/maintenance',
];

export function isAllowedPath(path: string): boolean {
  if (path.startsWith('/admin')) {
    return true;
  }
  
  if (path.startsWith('/api/auth')) {
    return true;
  }
  
  return allowedPaths.includes(path);
}

export function isMaintenanceModeEnabled(): boolean {
  return isMaintenanceMode;
}

export async function loadMaintenanceModeFromDb(): Promise<void> {
  // Only run on server
  if (!isServer) {
    console.warn('loadMaintenanceModeFromDb called on client side');
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('settings');
    
    const maintenanceSetting = await settingsCollection.findOne({ key: 'maintenanceMode' });
    
    if (maintenanceSetting) {
      isMaintenanceMode = maintenanceSetting.value === true;
    } else {
      await settingsCollection.insertOne({
        key: 'maintenanceMode',
        value: false,
        updatedAt: new Date()
      });
      isMaintenanceMode = false;
    }
  } catch (error) {
    console.error('Error loading maintenance mode from database:', error);
  }
}

export async function enableMaintenanceMode(): Promise<void> {
  // Only run on server
  if (!isServer) {
    console.warn('enableMaintenanceMode called on client side');
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('settings');
    
    await settingsCollection.updateOne(
      { key: 'maintenanceMode' },
      { 
        $set: { 
          value: true,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    isMaintenanceMode = true;
  } catch (error) {
    console.error('Error enabling maintenance mode:', error);
  }
}

export async function disableMaintenanceMode(): Promise<void> {
  // Only run on server
  if (!isServer) {
    console.warn('disableMaintenanceMode called on client side');
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('settings');
    
    await settingsCollection.updateOne(
      { key: 'maintenanceMode' },
      { 
        $set: { 
          value: false,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    isMaintenanceMode = false;
  } catch (error) {
    console.error('Error disabling maintenance mode:', error);
  }
}

export async function toggleMaintenanceMode(): Promise<boolean> {
  // Only run on server
  if (!isServer) {
    console.warn('toggleMaintenanceMode called on client side');
    return isMaintenanceMode;
  }

  const newState = !isMaintenanceMode;
  
  try {
    const { db } = await connectToDatabase();
    const settingsCollection = db.collection('settings');
    
    const result = await settingsCollection.updateOne(
      { key: 'maintenanceMode' },
      { 
        $set: { 
          value: newState,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    if (result.acknowledged) {
      isMaintenanceMode = newState;
      console.log(`Maintenance mode ${newState ? 'enabled' : 'disabled'}`);
      return isMaintenanceMode;
    } else {
      console.error('Failed to update maintenance mode in database');
      throw new Error('Failed to update maintenance mode in database');
    }
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    throw error;
  }
}

// Only load maintenance mode from DB on server side
if (isServer) {
  loadMaintenanceModeFromDb().catch(console.error);
} 