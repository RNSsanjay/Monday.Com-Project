# Monday.com BI AI Agent

A production-ready Founder-Level Business Intelligence AI Agent integrated with Monday.com.

## Architecture
- **Backend**: FastAPI (Python)
    - Monday.com GraphQL integration
    - Dynamic data normalization
    - BI Analytics engine
    - AI Agent with tool-calling (via Groq)
- **Frontend**: React (TypeScript + Vite)
    - Premium glassmorphism UI
    - Live Agent Trace display
    - Framer Motion animations

## Setup

### 1. Prerequisites
- Python 3.9+
- Node.js 18+

### 2. Environment Variables
Create a `.env` file in the `backend` directory:
```env
MONDAY_API_TOKEN=your_token_here
GROQ_API_KEY=your_groq_key_here
```

### 3. Installation
**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Running the Application
**Start Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

## Features
- **Live Tool Trace**: See exactly how the agent fetches and analyzes data.
- **Normalization**: Handles messy currency (₹, $, Lakh), percentages, and missing data.
- **BI Insights**: Provides weighted pipeline, sector breakdown, and risk analysis.
