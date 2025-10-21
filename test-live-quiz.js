/**
 * Manual Test for Live Quiz System
 * 
 * 🧪 Testing Steps:
 * 
 * 1. FIRST: Create a quiz with questions
 *    - Go to http://localhost:3000/admin
 *    - Click "Create New Quiz"
 *    - Title: "Test Quiz"
 *    - Add at least one question with 4 options
 *    - Save the quiz
 * 
 * 2. THEN: Test live session
 *    - Go to http://localhost:3000/admin/live
 *    - Select your quiz from dropdown
 *    - Click "Create Live Session"
 *    - Note the session code
 * 
 * 3. PARTICIPANT TEST:
 *    - Open new browser tab/window
 *    - Go to http://localhost:3000/join-live
 *    - Enter session code and participant name
 *    - Click "Join Session"
 * 
 * 4. CHECK CONSOLE LOGS:
 *    - Open browser dev tools (F12)
 *    - Look for Socket.io connection logs
 *    - Check for participant join events
 * 
 * 🔍 What to Look For:
 * 
 * Admin Console Should Show:
 * - 🔌 Admin socket connected: [socket-id]
 * - ✅ Session created: {sessionId, code}
 * - 🏠 Joining admin room for session: [session-id]
 * - 👤 Participant joined: [participant-data]
 * 
 * User Console Should Show:
 * - 🔌 User socket connected: [socket-id]
 * - 🎯 Attempting to join session: [join-data]
 * - ✅ Successfully joined session: [session-data]
 * 
 * Server Console Should Show:
 * - Client connected: [socket-id]
 * - Session created: [session-code]
 * - Admin socket [socket-id] requesting to join admin room
 * - [username] joined session [session-code]
 */

console.log('📋 Live Quiz Testing Guide');
console.log('Follow the steps above to test your live quiz system');
console.log('Check console logs in both admin and user browser tabs');

// Quick Socket.io connection test
if (typeof window !== 'undefined' && window.location) {
    console.log('🌐 Current URL:', window.location.href);
    console.log('🔧 Socket.io test available at:', window.location.origin + '/debug-socket.js');
}