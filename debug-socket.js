// Debug Socket.io connections
// Open this file in browser console to test Socket.io

console.log('🔍 Testing Socket.io Connection...');

// Test if Socket.io is available
if (typeof io !== 'undefined') {
    console.log('✅ Socket.io library loaded');
    
    // Create test connection
    const testSocket = io();
    
    testSocket.on('connect', () => {
        console.log('✅ Socket connected with ID:', testSocket.id);
        
        // Test create session
        testSocket.emit('create-session', {
            quizId: 'test-quiz-id',
            adminId: 'test-admin-id'
        });
    });
    
    testSocket.on('session-created', (data) => {
        console.log('✅ Session created:', data);
        
        // Test join admin room
        testSocket.emit('join-admin-room', { sessionId: data.sessionId });
    });
    
    testSocket.on('participants-updated', (data) => {
        console.log('✅ Participants updated:', data);
    });
    
    testSocket.on('participant-joined', (data) => {
        console.log('✅ Participant joined:', data);
    });
    
    testSocket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
    });
    
    // Disconnect after 10 seconds
    setTimeout(() => {
        testSocket.disconnect();
        console.log('🔌 Test socket disconnected');
    }, 10000);
    
} else {
    console.error('❌ Socket.io library not loaded');
}

console.log('📋 Instructions:');
console.log('1. Open browser dev tools (F12)');
console.log('2. Go to Console tab');
console.log('3. Copy and paste this entire script');
console.log('4. Press Enter to run the test');
console.log('5. Check the output for any errors');