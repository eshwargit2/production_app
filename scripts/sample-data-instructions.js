// Test script to create sample quiz with questions
// Run this script to populate your database with test data

async function createSampleData() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('Creating sample quiz and questions...');
    
    // First, create questions
    const questions = [
      {
        questionText: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        points: 100,
        timeLimitSec: 30
      },
      {
        questionText: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        points: 100,
        timeLimitSec: 30
      },
      {
        questionText: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        points: 100,
        timeLimitSec: 20
      },
      {
        questionText: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correctAnswer: 2,
        points: 150,
        timeLimitSec: 30
      },
      {
        questionText: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        points: 100,
        timeLimitSec: 25
      }
    ];
    
    console.log('Sample questions to create:');
    questions.forEach((q, i) => {
      console.log(`${i + 1}. ${q.questionText}`);
    });
    
    console.log('\n📝 Instructions:');
    console.log('1. Make sure your server is running (npm run dev)');
    console.log('2. Go to /admin page in your browser');
    console.log('3. Create a new quiz called "General Knowledge Quiz"');
    console.log('4. Add the above questions to your quiz');
    console.log('5. Then go to /admin/live to create live sessions');
    
    console.log('\n💡 Or you can use the admin interface to:');
    console.log('- Create quizzes');
    console.log('- Add questions to quizzes');
    console.log('- Then test live sessions');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createSampleData();