#  ElastoAI – Elastomer Formulation Intelligence Platform

## Overview

ElastoAI is an AI-powered platform designed to assist in elastomer formulation, material analysis, and domain-specific Q&A using Retrieval-Augmented Generation (RAG) and Large Language Models (LLMs).

---

## Features

* 🔬 Elastomer formulation prediction
* 📄 Document analysis (PDF research papers)
* 💬 Chat-based Q&A on elastomers
* 🧠 Knowledge base management
* 📊 Formulation comparison & optimization
* 🔐 JWT Authentication
* 🧾 Chat history persistence

---

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* shadcn/ui

### Backend

* FastAPI (Python)
* MongoDB

### AI / ML

* Groq (LLM API)
* Sentence Transformers (embeddings)
* RAG pipeline

---

## ⚙️ Setup Instructions

### 🔹 1. Clone Repository

```bash
git clone https://github.com/charu006/elastoAI.git
cd elastoAI
```

---

### 🔹 2. Backend Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

---

### 🔹 3. Environment Variables

Create a `.env` file inside `backend/` folder:

```env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
HF_TOKEN=your_huggingface_token
```

---

### 🔹 4. Run Backend

```bash
uvicorn server:app --reload --port 8000
```

---

### 🔹 5. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

---

## 🌍 Access

* Frontend → http://localhost:3000
* Backend → http://localhost:8000

---

## ⚠️ Important Notes

* You must use your own API keys
* Use MongoDB Atlas (cloud DB recommended)
* Do NOT commit `.env` file

---

## 📁 Project Structure

```
elastoAI/
│
├── backend/
│   ├── rag/
│   ├── server.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   └── package.json
│
└── README.md
```

---

## 🚀 Future Improvements

* Deployment (Vercel + Render)
* Better model fine-tuning
* Real-time collaboration
* Advanced material simulations

---

## 👨‍💻 Author

Charu Ramachandraiah

---

## ⭐ If you like this project, give it a star!
# Here are your Instructions
