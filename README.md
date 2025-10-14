# Aura - AI Wellness Assistant

Aura is a sophisticated, AI-powered wellness assistant designed to support the unique challenges faced by healthcare professionals. It serves as a personal companion to help monitor stress, prevent burnout, and provide instant access to mental health tools and supportive micro-interventions.

The application is built as a comprehensive, serverless single-page application (SPA) that leverages the power of the Google Gemini API for its core intelligence and runs entirely in the browser using local storage for data persistence.



## ✨ Core Features

Aura is packed with features designed to provide a holistic wellness experience:

*   *🧠 AI-Powered Chat*: A multi-lingual conversational interface (supporting English and major Indian languages like Kannada) where users can log stress, sleep, and significant work events. The AI provides empathetic and context-aware responses.
*   *📊 Wellness Dashboard*: A personalized dashboard that visualizes stress trends, sleep patterns, and calculates a real-time burnout risk score. It features AI-generated summaries and actionable insights based on the user's data.
*   *🧘 Micro-Interventions*: A collection of quick, guided exercises, including:
    *   *Guided Breathing*: An animated, timed breathing exercise to calm the nervous system.
    *   *Mindfulness Activities*: Short, text-based guides for grounding and present-moment awareness.
*   *🎵 Calming Soundscapes*: An integrated sound player with a selection of ambient sounds (rain, waves) to aid relaxation and focus.
*   *🛠 Wellness Tools*: A suite of interactive tools:
    *   *Cognitive Reframing*: An exercise to help users identify and challenge automatic negative thoughts.
    *   *Emotion Wheel*: A guided tool to help users identify, specify, and log their emotions, building emotional awareness.
    *   *Mini-Games*: A section of light cognitive games like Sudoku, Mind Tap, and Colorful Weave designed for a mindful break.
*   *📸 Scan & Analyze*: A multimodal feature that uses the device's camera to capture images of product labels (e.g., food, medicine) and uses Gemini to analyze and summarize the content.
*   *🤝 Peer Support*: A simulated, AI-driven chat system where users can connect with anonymized "peers" (AI personas) for support and conversation.
*   *🏆 Gamification & Wellness Journey*: Users earn "Wellness Points" for logging data and completing challenges, unlocking achievements to encourage consistent engagement.
*   *🌊 Real-time Stress Meter*: A feature that uses the microphone to provide a (simulated) live analysis of ambient noise and vocal tone to gauge stress levels.
*   *🤖 Predictive AI Agent*: A tool that simulates a machine learning model to predict a user's stress level based on environmental inputs like humidity, temperature, and activity levels.
*   *🔐 Admin Portal*: A separate, password-protected dashboard for organizational leaders. It provides an anonymized, high-level overview of team-wide stress trends, burnout risks, and top stressors, allowing for data-driven wellness initiatives.

---

## 🛠 Tech Stack

*   *Frontend*: React, TypeScript, Tailwind CSS
*   *AI & Language Models*: Google Gemini API (gemini-2.5-flash)
*   *Charting & Visualization*: Recharts
*   *Icons*: Lucide React
*   *Data Persistence*: Browser Local Storage (for a serverless, privacy-focused demo experience)
*   *State Management*: React Hooks (useState, useEffect, useMemo) and custom hooks for managing concerns like authentication, user data, and chat history.

---

## 🚀 Getting Started

This project is designed to run in a web-based development environment where the Gemini API key is securely managed.

### Prerequisites

*   An environment with Node.js and npm installed.
*   A valid *Google Gemini API Key*.

### Installation & Running

1.  *Clone the repository*:
    bash
    git clone <repository-url>
    cd aura-wellness-assistant
    

2.  *Install dependencies*:
    bash
    npm install
    

3.  *Set up environment variables*:
    Create a file named .env in the root of your project and add your Gemini API key:
    
    API_KEY=YOUR_GEMINI_API_KEY
    

4.  *Start the development server*:
    bash
    npm start
    
    The application will now be running on your local server, typically http://localhost:3000.

---

## 🔑 Demo Login Credentials

The application features a complete, self-contained "dummy" authentication flow.

### User Portal

*   *Email*: user@aura.health
*   *Password*: password

### Admin Portal

1.  Navigate to the /admin route of the application (e.g., http://localhost:3000/#/admin).
