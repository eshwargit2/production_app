// Quick debugging test for participant tracking
// Run this in browser console on the admin/live page

console.log('🔧 Debugging Participant Tracking');

// Check if socket.io is loaded
if (typeof io !== 'undefined') {
    console.log('✅ Socket.io available');
    
    // Create a test socket connection
    const debugSocket = io();
    
    debugSocket.on('connect', () => {
        console.log('🔌 Debug socket connected:', debugSocket.id);
        
        // Test admin room joining
        const testSessionId = 'session_test_123';
        console.log('🏠 Testing admin room join for session:', testSessionId);
        debugSocket.emit('join-admin-room', { sessionId: testSessionId });
    });
    
    debugSocket.on('participants-updated', (data) => {
        console.log('📋 RECEIVED participants-updated:', data);
    });
    
    debugSocket.on('participant-joined', (data) => {
        console.log('👤 RECEIVED participant-joined:', data);
    });
    
    debugSocket.on('connect_error', (error) => {
        console.error('❌ Debug socket error:', error);
    });
    
    // Cleanup after 30 seconds
    setTimeout(() => {
        debugSocket.disconnect();
        console.log('🧹 Debug socket cleaned up');
    }, 30000);
    
} else {
    console.error('❌ Socket.io not available');
}

// Manual steps to test:
console.log('📋 Manual Test Steps:');
console.log('1. Open this admin page in one tab');
console.log('2. Create a live session');
console.log('3. Open join-live in another tab');
console.log('4. Join with the session code');
console.log('5. Check console logs in BOTH tabs');
console.log('6. Click "🔧 Test Connection" button if needed');