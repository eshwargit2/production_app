const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; // Update this if your MongoDB URI is different
const dbName = "quiz-app"; // Update this to your database name

async function createSampleQuiz() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db(dbName);
    const questionsCollection = db.collection('questions');
    const quizzesCollection = db.collection('quizzes');
    
    // Create sample questions
    const questions = [
      {
        questionText: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
        points: 100,
        timeLimitSec: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        questionText: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1,
        points: 100,
        timeLimitSec: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        questionText: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
        points: 100,
        timeLimitSec: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        questionText: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correctAnswer: 2,
        points: 150,
        timeLimitSec: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        questionText: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3,
        points: 100,
        timeLimitSec: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert questions
    const questionResult = await questionsCollection.insertMany(questions);
    console.log(`${questionResult.insertedCount} questions inserted`);
    
    const questionIds = Object.values(questionResult.insertedIds);
    
    // Create sample quiz
    const quiz = {
      title: "General Knowledge Quiz",
      description: "A fun general knowledge quiz with 5 questions covering various topics",
      category: "General",
      timeLimitSec: 30,
      questionIds: questionIds,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const quizResult = await quizzesCollection.insertOne(quiz);
    console.log(`Quiz created with ID: ${quizResult.insertedId}`);
    
    // Create another quiz for variety
    const quiz2 = {
      title: "Quick Math Quiz",
      description: "Test your basic math skills",
      category: "Mathematics",
      timeLimitSec: 20,
      questionIds: [questionIds[2]], // Just the math question
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const quiz2Result = await quizzesCollection.insertOne(quiz2);
    console.log(`Second quiz created with ID: ${quiz2Result.insertedId}`);
    
    console.log("\n✅ Sample quizzes created successfully!");
    console.log("You can now create live sessions with these quizzes.");
    
  } catch (error) {
    console.error("Error creating sample quizzes:", error);
  } finally {
    await client.close();
  }
}

createSampleQuiz();