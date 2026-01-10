"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlite = exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
const schema = __importStar(require("./schema"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const migrator_1 = require("drizzle-orm/better-sqlite3/migrator"); // <--- Dòng này phải có
// Tạo thư mục data nếu chưa tồn tại
const dataDir = path_1.default.join(process.cwd(), 'data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path_1.default.join(dataDir, 'database.db');
const sqlite = new better_sqlite3_1.default(dbPath);
exports.sqlite = sqlite;
// Enable foreign keys
sqlite.pragma('foreign_keys = ON');
// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
// Create Drizzle instance
exports.db = (0, better_sqlite3_2.drizzle)(sqlite, { schema });
const migrationsFolder = path_1.default.join(__dirname, 'drizzle');
// Database initialization
async function initializeDatabase() {
    try {
        console.log('🗄️ Initializing SQLite database...');
        // --- CHẠY DRIZZLE MIGRATIONS ĐỂ TẠO CÁC BẢNG ---
        console.log(`🔍 Checking/Running migrations from: ${migrationsFolder}`);
        await (0, migrator_1.migrate)(exports.db, { migrationsFolder: migrationsFolder }); // <--- Dòng này là rất quan trọng
        console.log('✅ Migrations completed successfully');
        await createDefaultUsers();
        console.log('✅ Database initialized successfully');
        console.log(`📁 Database path: ${dbPath}`);
    }
    catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}
// Create default users (admin and demo)
async function createDefaultUsers() {
    try {
        const { UserModel } = await Promise.resolve().then(() => __importStar(require('./models/User')));
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
        }
        else {
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
        }
        else {
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
            }
            catch (updateError) {
                console.log('⚠️ Could not update demo user password, but user exists');
                console.error('Update error:', updateError);
            }
        }
    }
    catch (error) {
        console.error('❌ Failed to create default users:', error);
        // Don't throw - database can still work without default users
    }
}
// Graceful shutdown
function closeDatabase() {
    try {
        sqlite.close();
        console.log('🔒 Database connection closed');
    }
    catch (error) {
        console.error('❌ Error closing database:', error);
    }
}
// Handle process shutdown
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
