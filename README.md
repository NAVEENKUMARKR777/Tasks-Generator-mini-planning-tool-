# Tasks Generator (Mini Planning Tool)

A modern web application that transforms feature ideas into actionable user stories and engineering tasks using AI-powered analysis.

## 🚀 Features

- **Smart Feature Input**: Intuitive form for goal, users, and constraints
- **AI-Powered Generation**: Uses Groq API with Llama 3.1 8B Instant model
- **Task Organization**: Tasks categorized by frontend, backend, database, testing, and DevOps
- **Interactive Editing**: Inline task editing and updating capabilities
- **Export Functionality**: Download specifications as formatted Markdown files
- **History Tracking**: View and access last 5 generated specifications
- **System Health**: Real-time monitoring of backend, database, and LLM status
- **Modern UI**: Professional gradient design with smooth animations and responsive layout
- **Accessibility**: Optimized for desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript for type safety
- **Axios** for efficient API communication
- **Modern CSS** with custom properties and responsive design
- **Glassmorphism effects** and smooth animations

### Backend
- **Node.js** with Express.js framework
- **SQLite** database for persistent storage
- **Groq SDK** with Llama 3.1 8B Instant model
- **CORS** enabled for cross-origin requests
- **Comprehensive error handling** and validation

## ⚡ Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Groq API key** from [Groq Console](https://console.groq.com/)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd "Tasks Generator (mini planning tool)"
```

2. **Install all dependencies:**
```bash
npm run install-all
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

4. **Configure your environment:**
Edit `.env` and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

5. **Start development servers:**
```bash
npm run dev
```

This will start both the backend server (port 5000) and React development server (port 3000).

### Production Deployment

1. **Build the React application:**
```bash
npm run build
```

2. **Start production server:**
```bash
npm start
```

## 📡 API Endpoints

- `GET /api/health` - System health status monitoring
- `POST /api/generate` - Generate tasks from feature descriptions
- `GET /api/history` - Retrieve last 5 generated specifications
- `GET /api/spec/:id` - Get specific specification by ID
- `PUT /api/spec/:id` - Update tasks in existing specification

## 💡 Usage Guide

1. **Generate Tasks**: Fill out the form with your feature idea and click "Generate Tasks"
2. **Review Results**: Examine generated user stories, engineering tasks, risks, and success metrics
3. **Edit Tasks**: Click on any task to edit it inline
4. **Export**: Download your specification as a Markdown file
5. **History**: Access previous specifications from the History tab
6. **Monitor**: Check system health and connection status on the Status page

## ✅ What's Done

### Core Functionality
- ✅ AI-powered task generation with Groq API
- ✅ User-friendly form interface with validation
- ✅ SQLite database for persistent storage
- ✅ Export to Markdown functionality
- ✅ History tracking (last 5 specifications)
- ✅ System health monitoring page
- ✅ Comprehensive error handling
- ✅ Responsive design for all devices

### Advanced Features
- ✅ Inline task editing and updating
- ✅ Modern UI with gradient backgrounds
- ✅ Smooth animations and micro-interactions
- ✅ Glassmorphism design effects
- ✅ Status color consistency
- ✅ Form text visibility optimization
- ✅ Production-ready deployment configuration

### Technical Improvements
- ✅ Updated to Llama 3.1 8B Instant model
- ✅ Fixed JSON parsing with markdown cleanup
- ✅ Enhanced Railway deployment configuration
- ✅ Optimized package.json for production
- ✅ Comprehensive documentation

## ❌ What's Not Done

### Future Enhancements
- ❌ User authentication system
- ❌ Advanced filtering and search capabilities
- ❌ Collaboration features for teams
- ❌ Template system for different project types (removed during development)
- ❌ Drag-and-drop task reordering
- ❌ Integration with project management tools
- ❌ Automated task estimation
- ❌ Multi-language support

## 🔧 Environment Variables

- `GROQ_API_KEY`: Your Groq API key (required)
- `PORT`: Server port (default: 5000)

## 🗄 Database

The application uses **SQLite** for data persistence. The database file (`tasks.db`) is created automatically when the server starts and stores:
- Generated specifications with unique IDs
- User input data (goal, users, constraints)
- Generated tasks in JSON format
- Creation timestamps for tracking

## 🚀 Deployment

### Railway Deployment
This application is optimized for Railway deployment:
- **NIXPACKS** builder for optimal Node.js builds
- **Health checks** with `/api/health` endpoint
- **Automatic restarts** on failures
- **Environment variable** management

### Production Build
- React build process optimized for production
- Express serves static files efficiently
- Error handling for production environment
- Proper CORS configuration

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

- **[AI_NOTES.md](AI_NOTES.md)** - AI usage and development insights
- **[PROMPTS_USED.md](PROMPTS_USED.md)** - Development prompts and techniques
- **[ABOUTME.md](ABOUTME.md)** - Developer information and background

## 🔗 Links

- **Live Demo**: [Application URL](https://tasks-generator.onrender.com)
- **Repository**: [GitHub Repository](https://github.com/your-username/tasks-generator)
- **Issues**: [Report Issues](https://github.com/your-username/tasks-generator/issues)

---

**Built with ❤️ using AI-assisted development**
