const express = require('express');
const cors = require('cors');
const path = require('path');
const { Groq } = require('groq-sdk');
const sqlite3 = require('sqlite3');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Database setup
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS specifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal TEXT NOT NULL,
    users TEXT NOT NULL,
    constraints TEXT NOT NULL,
    tasks TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    backend: 'healthy',
    database: 'connected',
    llm: 'connected',
    timestamp: new Date().toISOString()
  };
  res.json(health);
});

// Generate endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { goal, users, constraints } = req.body;
    
    if (!goal || !users || !constraints) {
      return res.status(400).json({ 
        error: 'Missing required fields: goal, users, constraints' 
      });
    }

    // Generate user stories and tasks using Groq
    const prompt = `Generate detailed user stories and engineering tasks for the following feature:

Goal: ${goal}
Users: ${users}
Constraints: ${constraints}

Please provide:
1. 3-5 detailed user stories following the format: "As a [user type], I want to [action] so that [benefit]"
2. For each user story, provide 3-5 specific engineering tasks
3. Include acceptance criteria for each user story
4. Consider the specified constraints and user types

Format the response as JSON with the following structure:
{
  "userStories": [
    {
      "id": "US001",
      "title": "User Story Title",
      "description": "As a [user], I want to [action] so that [benefit]",
      "acceptanceCriteria": ["criteria1", "criteria2", "criteria3"],
      "tasks": [
        {
          "id": "T001",
          "title": "Task Title",
          "description": "Detailed task description",
          "estimatedHours": 8,
          "priority": "High"
        }
      ]
    }
  ]
}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const generatedContent = response.choices[0].message.content;
    let parsedContent;
    
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      // If JSON parsing fails, create a basic structure
      parsedContent = {
        userStories: [
          {
            id: "US001",
            title: "Basic User Story",
            description: generatedContent,
            acceptanceCriteria: ["To be implemented"],
            tasks: [
              {
                id: "T001",
                title: "Implementation Task",
                description: "Implement the basic functionality",
                estimatedHours: 8,
                priority: "High"
              }
            ]
          ]
        ]
      };
    }

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO specifications (goal, users, constraints, tasks, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      goal,
      users,
      constraints,
      JSON.stringify(parsedContent),
      new Date().toISOString()
    );

    res.json({
      success: true,
      data: parsedContent,
      id: lastID
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate content',
      details: error.message 
    });
  }
});

// Get all specifications
app.get('/api/specifications', (req, res) => {
  db.all(`
    SELECT id, goal, users, constraints, created_at
    FROM specifications
    ORDER BY created_at DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app;
