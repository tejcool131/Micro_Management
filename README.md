<div align="center">
  <img width="1200" height="475" alt="Microfinance AI Copilot Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
  
  # 🌾 Microfinance AI Copilot
  
  **Empowering unbanked rural borrowers with alternative credit scoring, climate-risk mitigation, and localized empathetic counseling powered by Google Gemini AI.**
  
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind_css&logoColor=white)](https://tailwindcss.com/)
  [![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat)](https://expressjs.com/)
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Gemini](https://img.shields.io/badge/gemini--2.5--flash-blue?style=flat&logo=google-gemini)](https://ai.google.dev/)
</div>

---

## 📖 Overview

In many rural regions, smallholders, artisans, and micro-entrepreneurs lack the formal credit histories or land titles required to access conventional banking services. 

The **Microfinance AI Copilot** is an intelligent assistant designed for field officers and microfinance institutions (MFIs). It ingests informal notes, unstructured dictations, and paper-ledger data to construct an **alternative credit profile**. Using **Google Gemini AI**, the application evaluates character indicators, local cash flows, and climate vulnerability metrics to generate loan decisions, tailors insurance options, and builds localized counseling scripts for field agents.

🔗 **View the app in Google AI Studio:** [AI Studio App Link](https://ai.studio/apps/9ca5a185-8636-4d1a-a175-c373cae9572e)

---

## ✨ Key Features

*   **⚡ Alternative Credit Viability Scoring:** Evaluates quantitative and qualitative data (character metrics, family support systems, record-keeping habits) instead of traditional credit scores.
*   **🌦️ Climate Risk & Insurance Integration:** Assesses geographic and meteorological vulnerability (e.g. monsoon flooding, typhoon paths, drought belts) and suggests tailored micro-insurance products.
*   **🗣️ Localized Empathetic Counseling:** Automatically generates actionable financial planning guidance and translated talk-tracks in regional languages/dialects (e.g., Hindi, Swahili, Spanish) for loan officers.
*   **📋 Interactive Dictation & Presets:** Includes test scenarios representing diverse rural sectors across India, Peru, Kenya, and Guatemala to facilitate immediate exploration and testing.
*   **🎨 Premium Glassmorphic UI:** A fully responsive interface featuring real-time analysis, visual scoremeters, interactive data feeds, and dark-mode aesthetics.

---

## 🛠️ Tech Stack

*   **Frontend:** React 19, Tailwind CSS v4, Motion (Framer Motion), Lucide React Icons
*   **Backend:** Express.js, TypeScript, TSX (Node.js runtime)
*   **Vite Integration:** Served via Vite Middleware during development for hot module reloading (single-port architecture)
*   **AI Engine:** Google Gemini SDK (`@google/genai`) powered by the `gemini-2.5-flash` model

---

## 📂 Project Structure

```
├── assets/                 # Project images and styling assets
├── src/                    # Frontend React 19 source code
│   ├── components/         # Modular UI elements (Scorecards, Presets, Form inputs)
│   ├── App.tsx             # Main client dashboard application
│   ├── presets.ts          # Preloaded borrower profiles for quick testing
│   ├── types.ts            # TypeScript definitions for backend communication
│   └── index.css           # Global custom styles and Tailwind configuration
├── server.ts               # Express.js Server & Google Gemini API handlers
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration compiler rules
└── package.json            # Scripts and dependency manifests
```

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   Google Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/))

### 1. Install Dependencies
Clone the repository, open a terminal in the root directory, and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` (or `.env.local`) file in the root of the project and define your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
```
*(You can use [.env.example](file:///d:/Microfinance%20Ai%20Copilot/.env.example) as a baseline template)*

### 3. Run the Development Server
Execute the dev environment:
```bash
npm run dev
```
The server will boot and serve the client:
```
[Express] Root Server listening on http://0.0.0.0:3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 💡 How It Works (AI Agent Logic)

1.  **Ingestion:** The field officer inputs a client's sector, location, and qualitative field notes or voice-to-text dictation.
2.  **Analysis:** The backend ([server.ts](file:///d:/Microfinance%20Ai%20Copilot/server.ts)) prompts the `gemini-2.5-flash` model using structured JSON output schemas.
3.  **Extraction & Scoring:** Gemini parses the informal notes into structured financials (estimated monthly revenue, expenses, EBITDA), alternative behavioral indicators, and calculates a synthetic credit viability score (300-850).
4.  **Counseling generation:** Gemini creates tailored guidance steps and localized counseling prompts for field agents.
5.  **Render:** The React dashboard reads the structured JSON response and populates the charts, dials, and interactive reports dynamically.
