// 🔧 PARTICIPANT COUNT DEBUGGING GUIDE
// Enhanced version with detailed logging and manual controls

console.log('🎯 Participant Count Issue - Debug Guide');
console.log('=' .repeat(50));

console.log('\n📋 ENHANCED TESTING STEPS:');

console.log('\n1️⃣ ADMIN SETUP:');
console.log('   - Go to http://localhost:3000/admin/live');
console.log('   - Open browser DevTools (F12) → Console');
console.log('   - Create live session');
console.log('   - Look for: "✅ Session created" and "🏠 Joining admin room"');

console.log('\n2️⃣ PARTICIPANT JOIN:');
console.log('   - Open NEW tab: http://localhost:3000/join-live');
console.log('   - Open DevTools in this tab too');
console.log('   - Join with session code');
console.log('   - Should see "Get Ready! The quiz is about to begin..."');

console.log('\n3️⃣ CHECK SERVER LOGS:');
console.log('   Look for these server messages:');
console.log('   - 🎯 Admin socket [id] requesting to join admin room');
console.log('   - 📊 Session found! Sending [X] participants to admin');
console.log('   - 📡 Emitting participant-joined to admin_[sessionId]');
console.log('   - 📡 Emitting participants-updated to admin_[sessionId]');

console.log('\n4️⃣ CHECK ADMIN CONSOLE:');
console.log('   Should see:');
console.log('   - 📋 Participants updated event received: [data]');
console.log('   - 🔢 Total participants: 1');
console.log('   - 🔍 Current participants state: [array with participant]');

console.log('\n5️⃣ IF STILL SHOWS (0):');
console.log('   - Click "🔄 Refresh Participants" button');
console.log('   - Click "🔧 Test Connection" button');
console.log('   - Check "Updates: [number]" indicator');

console.log('\n6️⃣ MANUAL TESTING:');
console.log('   In admin console, paste:');
console.log('   ```');
console.log('   console.log("Participants:", participants.length);');
console.log('   console.log("Socket connected:", socket?.connected);');
console.log('   console.log("Session ID:", sessionId);');
console.log('   ```');

console.log('\n🎯 SUCCESS INDICATORS:');
console.log('   ✅ Admin shows "👥 Participants (1)" or higher');
console.log('   ✅ "🚀 Start Quiz" button becomes enabled');
console.log('   ✅ Participants stay in "Get Ready!" state');
console.log('   ✅ No immediate disconnects in server logs');

console.log('\n🔧 DEBUGGING FEATURES ADDED:');
console.log('   - Enhanced Socket.io logging');
console.log('   - Manual refresh buttons');
console.log('   - Backup polling every 5 seconds');
console.log('   - Force update counter');
console.log('   - Connection status indicators');

console.log('\n💡 If participants join but count stays 0:');
console.log('   - The issue is Socket.io room communication');
console.log('   - Server is sending events but admin not receiving');
console.log('   - Try the refresh buttons for manual sync');