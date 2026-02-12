import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Risk {
  risk: string;
  mitigation: string;
}

interface GeneratedTasks {
  userStories: string[];
  engineeringTasks: {
    frontend: string[];
    backend: string[];
    database: string[];
    testing: string[];
    devops: string[];
  };
  risks: Risk[];
  successMetrics: string[];
}

interface Spec {
  id: string;
  goal: string;
  users: string;
  constraints: string;
  template?: string;
  tasks: GeneratedTasks;
  created_at: string;
}

// interface Template {
//   name: string;
//   constraints: string;
//   users: string;
// }

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'status' | 'history'>('home');
  const [formData, setFormData] = useState({
    goal: '',
    users: '',
    constraints: ''
  });
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTasks | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Spec[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<{category: string, index: number, value: string} | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await axios.get('/api/health');
      setHealth(response.data);
    } catch (err) {
      console.error('Failed to fetch health:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/generate', formData);
      setGeneratedTasks(response.data);
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (category: string, index: number, newValue: string) => {
    if (!generatedTasks) return;

    const updatedTasks = {
      ...generatedTasks,
      engineeringTasks: {
        ...generatedTasks.engineeringTasks,
        [category]: generatedTasks.engineeringTasks[category as keyof typeof generatedTasks.engineeringTasks].map((task, i) => 
          i === index ? newValue : task
        )
      }
    };

    setGeneratedTasks(updatedTasks);
    setEditingTask(null);

    // Save to backend
    try {
      await axios.put(`/api/spec/${Date.now()}`, { tasks: updatedTasks });
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const exportAsMarkdown = () => {
    if (!generatedTasks) return;
    
    const markdown = `# Feature Specification

## Goal
${formData.goal}

## Users
${formData.users}

## Constraints
${formData.constraints}

## User Stories
${generatedTasks.userStories.map(story => `- ${story}`).join('\n')}

## Engineering Tasks

### Frontend
${generatedTasks.engineeringTasks.frontend.map(task => `- ${task}`).join('\n')}

### Backend
${generatedTasks.engineeringTasks.backend.map(task => `- ${task}`).join('\n')}

### Database
${generatedTasks.engineeringTasks.database.map(task => `- ${task}`).join('\n')}

### Testing
${generatedTasks.engineeringTasks.testing.map(task => `- ${task}`).join('\n')}

### DevOps
${generatedTasks.engineeringTasks.devops.map(task => `- ${task}`).join('\n')}

## Risks & Mitigation
${generatedTasks.risks.map(risk => `- **Risk**: ${risk.risk}\n  **Mitigation**: ${risk.mitigation}`).join('\n\n')}

## Success Metrics
${generatedTasks.successMetrics.map(metric => `- ${metric}`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature-spec.md';
    a.click();
  };

  const renderHome = () => (
    <div className="container">
      <h1>Tasks Generator</h1>
      <p>Transform your feature ideas into actionable user stories and engineering tasks</p>
      
      {!generatedTasks ? (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="goal">Goal *</label>
            <textarea
              id="goal"
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              placeholder="What do you want to achieve?"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="users">Users *</label>
            <textarea
              id="users"
              value={formData.users}
              onChange={(e) => setFormData({...formData, users: e.target.value})}
              placeholder="Who are the target users?"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="constraints">Constraints *</label>
            <textarea
              id="constraints"
              value={formData.constraints}
              onChange={(e) => setFormData({...formData, constraints: e.target.value})}
              placeholder="What are the limitations or requirements?"
              required
            />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Generating...' : 'Generate Tasks'}
          </button>
        </form>
      ) : (
        <div className="results">
          <div className="results-header">
            <h2>Generated Tasks</h2>
            <div className="results-actions">
              <button onClick={exportAsMarkdown} className="btn-secondary">Export as Markdown</button>
              <button onClick={() => setGeneratedTasks(null)} className="btn-secondary">Generate New</button>
            </div>
          </div>
          
          <div className="section">
            <h3>User Stories</h3>
            <ul>
              {generatedTasks.userStories.map((story, index) => (
                <li key={index}>{story}</li>
              ))}
            </ul>
          </div>
          
          <div className="section">
            <h3>Engineering Tasks</h3>
            {Object.entries(generatedTasks.engineeringTasks).map(([category, tasks]) => (
              <div key={category} className="task-category">
                <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <ul>
                  {tasks.map((task, index) => (
                    <li key={index} className="editable-task">
                      {editingTask?.category === category && editingTask?.index === index ? (
                        <input
                          type="text"
                          defaultValue={task}
                          onBlur={(e) => updateTask(category, index, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateTask(category, index, e.currentTarget.value);
                            }
                          }}
                          autoFocus
                          className="task-input"
                        />
                      ) : (
                        <span onClick={() => setEditingTask({category, index, value: task})}>
                          {task}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="section">
            <h3>Risks & Mitigation</h3>
            <div className="risks-list">
              {generatedTasks.risks.map((risk, index) => (
                <div key={index} className="risk-item">
                  <div className="risk-title"><strong>Risk:</strong> {risk.risk}</div>
                  <div className="risk-mitigation"><strong>Mitigation:</strong> {risk.mitigation}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="section">
            <h3>Success Metrics</h3>
            <ul>
              {generatedTasks.successMetrics.map((metric, index) => (
                <li key={index}>{metric}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderStatus = () => {
    if (!health) {
      fetchHealth();
      return <div className="container">Loading health status...</div>;
    }

    return (
      <div className="container">
        <h1>System Status</h1>
        <div className="status-grid">
          <div className={`status-item ${health.backend}`}>
            <h3>Backend</h3>
            <p>{health.backend}</p>
          </div>
          <div className={`status-item ${health.database}`}>
            <h3>Database</h3>
            <p>{health.database}</p>
          </div>
          <div className={`status-item ${health.llm}`}>
            <h3>LLM Connection</h3>
            <p>{health.llm}</p>
          </div>
        </div>
        <p className="timestamp">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="container">
      <h1>Recent Specifications</h1>
      {history.length === 0 ? (
        <p>No specifications generated yet.</p>
      ) : (
        <div className="history-list">
          {history.map((spec) => (
            <div key={spec.id} className="history-item">
              <h3>{spec.goal}</h3>
              <p><strong>Users:</strong> {spec.users}</p>
              <p><strong>Constraints:</strong> {spec.constraints}</p>
              <p className="timestamp">Created: {new Date(spec.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="App">
      <nav className="navbar">
        <h1>Tasks Generator</h1>
        <div className="nav-links">
          <button onClick={() => setCurrentView('home')} className={currentView === 'home' ? 'active' : ''}>Home</button>
          <button onClick={() => setCurrentView('status')} className={currentView === 'status' ? 'active' : ''}>Status</button>
          <button onClick={() => setCurrentView('history')} className={currentView === 'history' ? 'active' : ''}>History</button>
        </div>
      </nav>
      
      <main>
        {currentView === 'home' && renderHome()}
        {currentView === 'status' && renderStatus()}
        {currentView === 'history' && renderHistory()}
      </main>
    </div>
  );
}

export default App;
