// 🚀 IMMEDIATE WORKAROUND: Force Start Quiz
// Add this button to your admin live page to bypass the participant count issue

// 1. Open your admin/live page
// 2. Open browser DevTools (F12) → Console
// 3. Paste and run this code:

// Quick fix: Override the participant check
if (typeof startQuiz === 'function') {
    console.log('✅ startQuiz function found');
} else {
    console.log('❌ startQuiz function not found, creating one...');
    
    window.forceStartQuiz = function() {
        // Get the current socket and sessionId from the page
        const socket = window.socket || io();
        const sessionId = window.sessionId || document.querySelector('[data-session-id]')?.getAttribute('data-session-id');
        
        if (!sessionId) {
            alert('❌ No session ID found. Please create a session first.');
            return;
        }
        
        const confirmed = confirm('⚡ Force start quiz?\n\nThis will start the quiz even if participant count shows 0.');
        
        if (confirmed) {
            console.log('🚀 Force starting quiz for session:', sessionId);
            socket.emit('start-quiz', { sessionId });
            
            // Navigate to controller
            window.location.href = `/admin/live-controller/${sessionId}`;
        }
    };
}

// Create the force start button
if (!document.getElementById('force-start-btn')) {
    const forceBtn = document.createElement('button');
    forceBtn.id = 'force-start-btn';
    forceBtn.innerHTML = '⚡ FORCE START QUIZ';
    forceBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(45deg, #ff6b35, #f7931e);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        font-size: 14px;
    `;
    
    forceBtn.onclick = window.forceStartQuiz;
    document.body.appendChild(forceBtn);
    
    console.log('🎯 Force Start button added to page');
}

console.log('📋 INSTRUCTIONS:');
console.log('1. Create a live session as normal');
console.log('2. Users join and wait in "Get Ready!" page');
console.log('3. If admin shows Participants (0), click "⚡ FORCE START QUIZ" button');
console.log('4. Quiz will start for all connected users');

console.log('🎉 Workaround ready! Look for the orange button in top-right corner.');