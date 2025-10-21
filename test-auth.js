// Test script to check database connection and create test user
const { dbConnect } = require('./lib/mongodb.js')
const User = require('./models/user.js')
const bcrypt = require('bcryptjs')

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...')
    await dbConnect()
    console.log('✅ MongoDB connected successfully!')
    
    // Check if any users exist
    const userCount = await User.countDocuments()
    console.log(`📊 Users in database: ${userCount}`)
    
    // Create a test user if none exist
    if (userCount === 0) {
      console.log('🔧 Creating test user...')
      const passwordHash = await bcrypt.hash('test123', 10)
      const testUser = await User.create({
        email: 'test@example.com',
        passwordHash,
        name: 'Test User',
        isAdmin: false
      })
      console.log('✅ Test user created:', testUser.email)
      console.log('Login with: test@example.com / test123')
    } else {
      // Show existing users (without passwords)
      const users = await User.find({}, { passwordHash: 0 })
      console.log('👥 Existing users:')
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.name})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testConnection()
