// Quick Test Data Creator
// This creates sample quiz data for testing live sessions

const sampleQuestions = [
  {
    questionText: "What is the capital of France?",
    options: [
      { text: "London" },
      { text: "Berlin" },
      { text: "Paris" },
      { text: "Madrid" }
    ],
    correctOptionIndex: 2,
    points: 100,
    timeLimitSec: 30
  },
  {
    questionText: "Which planet is known as the Red Planet?",
    options: [
      { text: "Venus" },
      { text: "Mars" },
      { text: "Jupiter" },
      { text: "Saturn" }
    ],
    correctOptionIndex: 1,
    points: 100,
    timeLimitSec: 30
  },
  {
    questionText: "What is 2 + 2?",
    options: [
      { text: "3" },
      { text: "4" },
      { text: "5" },
      { text: "6" }
    ],
    correctOptionIndex: 1,
    points: 100,
    timeLimitSec: 20
  }
];

console.log("🎯 Quick Fix for 'No Quizzes Available' Error");
console.log("=" .repeat(50));
console.log("");
console.log("📋 STEP 1: Start your server");
console.log("   npm run dev");
console.log("");
console.log("📋 STEP 2: Open browser and go to:");
console.log("   http://localhost:3000/admin");
console.log("");
console.log("📋 STEP 3: Create a new quiz");
console.log("   - Click 'Create New Quiz'");
console.log("   - Title: 'General Knowledge Quiz'");
console.log("   - Description: 'Test quiz for live sessions'");
console.log("   - Click 'Create Quiz'");
console.log("");
console.log("📋 STEP 4: Add questions to the quiz");
console.log("   Copy and paste these questions:");
console.log("");

sampleQuestions.forEach((q, index) => {
  console.log(`   Question ${index + 1}:`);
  console.log(`   "${q.questionText}"`);
  console.log(`   Options: ${q.options.map(o => o.text).join(", ")}`);
  console.log(`   Correct Answer: ${q.options[q.correctOptionIndex].text}`);
  console.log("");
});

console.log("📋 STEP 5: Test live session");
console.log("   - Go to http://localhost:3000/admin/live");
console.log("   - Select your newly created quiz");
console.log("   - Click 'Create Live Session'");
console.log("   - Share the session code with participants!");
console.log("");
console.log("🎉 You're all set for live quiz sessions!");