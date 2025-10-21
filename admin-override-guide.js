// Simple Admin Override for Starting Quiz
// Use this when participants show as (0) but users are actually connected

console.log('🎯 Admin Quiz Start Override');
console.log('Use this when participants show (0) but users are waiting');

// Method 1: Browser Console (Quickest)
console.log('\n📋 METHOD 1 - Browser Console:');
console.log('1. Go to your admin/live page');
console.log('2. Open DevTools (F12) → Console');
console.log('3. Copy your session ID (e.g., session_1759472851443)');
console.log('4. Paste this code (replace SESSION_ID):');
console.log('');
console.log('const sessionId = "SESSION_ID"; // Replace with actual session ID');
console.log('const socket = io();');
console.log('socket.on("connect", () => {');
console.log('  console.log("Starting quiz...");');
console.log('  socket.emit("start-quiz", { sessionId });');
console.log('  setTimeout(() => window.location.href = `/admin/live-controller/${sessionId}`, 1000);');
console.log('});');

// Method 2: Force Start Tool
console.log('\n📋 METHOD 2 - Force Start Tool:');
console.log('1. Open: http://localhost:3000/force-start.html');
console.log('2. Enter your session ID');
console.log('3. Click "Connect" then "Force Start"');

// Method 3: URL Direct Access
console.log('\n📋 METHOD 3 - Direct Controller Access:');
console.log('If you know your session ID, go directly to:');
console.log('http://localhost:3000/admin/live-controller/YOUR_SESSION_ID');

console.log('\n✅ All methods bypass the participant count issue');
console.log('✅ Users waiting in "Get Ready!" will start the quiz');
console.log('✅ Works even when admin shows Participants (0)');