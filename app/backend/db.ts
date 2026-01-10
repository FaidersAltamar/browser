import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'; // <--- Dòng này phải có


// Tạo thư mục data nếu chưa tồn tại
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.db');
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export SQLite instance for raw queries if needed
export { sqlite };
const migrationsFolder = path.join(__dirname, 'drizzle');

// Database initialization
export async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing SQLite database...');
    // --- CHẠY DRIZZLE MIGRATIONS ĐỂ TẠO CÁC BẢNG ---
    console.log(`🔍 Checking/Running migrations from: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder: migrationsFolder }); // <--- Dòng này là rất quan trọng
    console.log('✅ Migrations completed successfully');
    await createDefaultUsers();
    
    console.log('✅ Database initialized successfully');
    console.log(`📁 Database path: ${dbPath}`);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Create default users (admin and demo)
async function createDefaultUsers() {
  try {
    const { UserModel } = await import('./models/User');
    
    // Create default admin user
    const existingAdmin = await UserModel.findByUsername('admin');
    if (!existingAdmin) {
      const adminData = {
        username: 'admin',
        email: 'admin@localhost',
        password: 'admin123', // Will be hashed by UserModel
        fullName: 'System Administrator',
        role: 'admin'
      };
      
      const admin = await UserModel.create(adminData);
      if (admin) {
        console.log('👤 Default admin user created:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   Email: admin@localhost');
      }
    } else {
      console.log('👤 Default admin user already exists');
    }
    
    // Create demo user with password that meets validation (minimum 6 characters)
    const existingDemo = await UserModel.findByUsername('demo');
    if (!existingDemo) {
      const demoData = {
        username: 'demo',
        email: 'demo@localhost',
        password: 'demo123', // Changed to meet minimum 6 characters requirement
        fullName: 'Demo User',
        role: 'user'
      };
      
      const demo = await UserModel.create(demoData);
      if (demo) {
        console.log('👤 Demo user created:');
        console.log('   Username: demo');
        console.log('   Password: demo123');
        console.log('   Email: demo@localhost');
      }
    } else {
      console.log('👤 Demo user already exists');
      // Update password to meet validation requirements (minimum 6 characters)
      // This ensures existing demo users can login with the new password
      try {
        const updatedDemo = await UserModel.update(existingDemo.id, { password: 'demo123' });
        if (updatedDemo) {
          console.log('✅ Updated demo user password to demo123');
          console.log('   Username: demo');
          console.log('   Password: demo123');
        }
      } catch (updateError) {
        console.log('⚠️ Could not update demo user password, but user exists');
        console.error('Update error:', updateError);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to create default users:', error);
    // Don't throw - database can still work without default users
  }
}

// Graceful shutdown
export function closeDatabase() {
  try {
    sqlite.close();
    console.log('🔒 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
}

// Handle process shutdown
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);