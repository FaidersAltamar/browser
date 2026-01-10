"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const User_1 = require("./models/User");
async function createDemoUser() {
    try {
        console.log('🔧 Initializing database...');
        await (0, db_1.initializeDatabase)();
        console.log('👤 Checking for demo user...');
        const existingDemo = await User_1.UserModel.findByUsername('demo');
        if (existingDemo) {
            console.log('✅ Demo user already exists');
            console.log('   Username: demo');
            console.log('   Password: demo');
            return;
        }
        console.log('👤 Creating demo user...');
        const demoData = {
            username: 'demo',
            email: 'demo@localhost',
            password: 'demo',
            fullName: 'Demo User',
            role: 'user'
        };
        const demo = await User_1.UserModel.create(demoData);
        if (demo) {
            console.log('✅ Demo user created successfully!');
            console.log('   Username: demo');
            console.log('   Password: demo');
            console.log('   Email: demo@localhost');
        }
        else {
            console.error('❌ Failed to create demo user');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating demo user:', error);
        process.exit(1);
    }
}
createDemoUser();
