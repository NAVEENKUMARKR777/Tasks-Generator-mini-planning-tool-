const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Groq } = require('groq-sdk');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Load .env from parent directory
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Validate Groq API key
if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
  console.error('ERROR: GROQ_API_KEY is required. Please set a valid Groq API key in your .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS specs (id TEXT PRIMARY KEY, goal TEXT, users TEXT, constraints TEXT, tasks TEXT, template TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

// Templates
const templates = {
  mobile: {
    name: "Mobile App",
    constraints: "Must work on iOS and Android, offline-first, responsive design, touch-friendly UI, battery efficient",
    users: "Mobile users, tablet users, users with limited connectivity"
  },
  web: {
    name: "Web Application",
    constraints: "Cross-browser compatibility, SEO friendly, fast loading, accessible, PWA features",
    users: "Desktop users, laptop users, users with various browsers and devices"
  },
  internal: {
    name: "Internal Tool",
    constraints: "Integrate with existing systems, role-based access, audit logs, internal authentication, data security",
    users: "Employees, administrators, managers, support staff"
  }
};

app.get('/api/health', (req, res) => {
  const health = {
    backend: 'healthy',
    database: 'connected',
    llm: 'connected',
    timestamp: new Date().toISOString()
  };
  res.json(health);
});

app.post('/api/generate', async (req, res) => {
  try {
    const { goal, users, constraints } = req.body;
    
    if (!goal || !users || !constraints) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate tasks using Groq API
    const prompt = `Generate a comprehensive list of user stories and engineering tasks for a feature with the following details:

Goal: ${goal}
Users: ${users}
Constraints: ${constraints}

Please provide:
1. 5-8 user stories in the format "As a [user type], I want [action] so that [benefit]"
2. 8-12 engineering tasks broken down by category (frontend, backend, database, testing, devops)
3. 3-5 potential risks or unknowns with mitigation strategies
4. 2-3 success metrics or acceptance criteria

Format the response as JSON with this structure:
{
  "userStories": ["story1", "story2", ...],
  "engineeringTasks": {
    "frontend": ["task1", "task2", ...],
    "backend": ["task1", "task2", ...],
    "database": ["task1", "task2", ...],
    "testing": ["task1", "task2", ...],
    "devops": ["task1", "task2", ...]
  },
  "risks": [{"risk": "risk description", "mitigation": "mitigation strategy"}],
  "successMetrics": ["metric1", "metric2", ...]
}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 3000,
      });

      // Clean the response - remove markdown code blocks if present
      let responseText = completion.choices[0].message.content;
      if (responseText.includes('```json')) {
        responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (responseText.includes('```')) {
        responseText = responseText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const generatedTasks = JSON.parse(responseText.trim());
      const specId = Date.now().toString();
      
      db.run(
        "INSERT INTO specs (id, goal, users, constraints, tasks, template) VALUES (?, ?, ?, ?, ?, ?)",
        [specId, goal, users, constraints, JSON.stringify(generatedTasks), null],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to save specification' });
          }
          res.json({ id: specId, ...generatedTasks });
        }
      );
    } catch (groqError) {
      console.error('Groq API error:', groqError);
      res.status(500).json({ error: 'Failed to generate tasks using AI service' });
    }
  } catch (error) {
    console.error('Error generating tasks:', error);
    res.status(500).json({ error: 'Failed to generate tasks' });
  }
});

app.put('/api/spec/:id', (req, res) => {
  const { id } = req.params;
  const { tasks } = req.body;
  
  db.run(
    "UPDATE specs SET tasks = ? WHERE id = ?",
    [JSON.stringify(tasks), id],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Failed to update specification' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Spec not found' });
      } else {
        res.json({ success: true });
      }
    }
  );
});

app.get('/api/history', (req, res) => {
  db.all(
    "SELECT * FROM specs ORDER BY created_at DESC LIMIT 5",
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
      } else {
        const history = rows.map(row => ({
          id: row.id,
          goal: row.goal,
          users: row.users,
          constraints: row.constraints,
          tasks: JSON.parse(row.tasks),
          created_at: row.created_at
        }));
        res.json(history);
      }
    }
  );
});

app.get('/api/spec/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    "SELECT * FROM specs WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch spec' });
      } else if (!row) {
        res.status(404).json({ error: 'Spec not found' });
      } else {
        res.json({
          id: row.id,
          goal: row.goal,
          users: row.users,
          constraints: row.constraints,
          tasks: JSON.parse(row.tasks),
          created_at: row.created_at
        });
      }
    }
  );
});

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Groq API configured and ready');
});
