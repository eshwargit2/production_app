// Sample data creator using the API endpoints
// Make sure your server is running (npm run dev) before running this script

async function createSampleData() {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('🚀 Creating sample quiz data...\n');
  
  try {
    // Sample questions to create
    const sampleQuestions = [
      {
        text: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctOptionIndex: 2,
        category: "Geography",
        difficulty: "easy"
      },
      {
        text: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctOptionIndex: 1,
        category: "Science",
        difficulty: "easy"
      },
      {
        text: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctOptionIndex: 1,
        category: "Mathematics",
        difficulty: "easy"
      },
      {
        text: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correctOptionIndex: 2,
        category: "Art",
        difficulty: "medium"
      }
    ];

    // Create questions
    console.log('📝 Creating questions...');
    const createdQuestions = [];
    
    for (const questionData of sampleQuestions) {
      try {
        const response = await fetch(`${baseUrl}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData)
        });
        
        if (response.ok) {
          const result = await response.json();
          createdQuestions.push(result.question);
          console.log(`✅ Created: "${questionData.text}"`);
        } else {
          const error = await response.json();
          console.log(`❌ Failed to create question: ${error.error || response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ Network error creating question: ${error.message}`);
      }
    }

    if (createdQuestions.length === 0) {
      console.log('\n❌ No questions were created. Make sure:');
      console.log('1. Your server is running (npm run dev)');
      console.log('2. You are logged in as an admin');
      console.log('3. Run this script from your project directory');
      return;
    }

    // Create a quiz
    console.log('\n🧩 Creating quiz...');
    const quizData = {
      title: "General Knowledge Quiz",
      description: "A fun quiz with questions from various categories",
      category: "General",
      timeLimitSec: 30
    };

    const quizResponse = await fetch(`${baseUrl}/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData)
    });

    if (quizResponse.ok) {
      const quizResult = await quizResponse.json();
      console.log(`✅ Created quiz: "${quizData.title}"`);
      
      // Add questions to the quiz (you'll need to do this manually in the admin interface)
      console.log('\n📋 Next steps:');
      console.log('1. Go to http://localhost:3000/admin');
      console.log('2. Edit your newly created quiz');
      console.log('3. Add the created questions to the quiz');
      console.log('4. Then go to /admin/live to create live sessions!');
      
    } else {
      const error = await quizResponse.json();
      console.log(`❌ Failed to create quiz: ${error.error || quizResponse.statusText}`);
    }

    console.log('\n🎉 Sample data creation completed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Your server is running: npm run dev');
    console.log('2. You are logged in as an admin');
    console.log('3. Your MongoDB is running');
  }
}

// Run the script
createSampleData();