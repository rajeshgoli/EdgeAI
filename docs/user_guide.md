# User Guide

This guide provides instructions on how to set up, run, and use the Edge.ai application.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **Python** (v3.8 or higher recommended)
- **npm** (usually comes with Node.js)

## Setup

### 1. Clone the Repository
If you haven't already, clone the repository to your local machine.

### 2. Backend Setup
The backend is built with FastAPI.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  (Optional) Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # On macOS/Linux:
    source venv/bin/activate
    # On Windows:
    .\venv\Scripts\activate
    ```

3.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

4.  Set up environment variables:
    - Ensure you have a valid Google Gemini API key.
    - You may need to configure it in the backend code or environment variables as required by `ai_engine.py` or `main.py`.

### 3. Frontend Setup
The frontend is built with React and Vite.

1.  Navigate to the root directory (if you are in `backend`, go back up):
    ```bash
    cd ..
    ```

2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    - Create a `.env.local` file in the root directory.
    - Add your Gemini API key:
      ```
      VITE_GEMINI_API_KEY=your_api_key_here
      ```
      *(Note: Check `src/` code to confirm the exact variable name expected, usually `VITE_` prefix is required for Vite)*

## Running the Application

You need to run both the backend and frontend servers.

### 1. Start the Backend Server
In the `backend` directory, run:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be available at `http://localhost:8000`.

### 2. Start the Frontend Server
In the root directory, run:
```bash
npm run dev
```
The application will typically be accessible at `http://localhost:5173` (check the terminal output for the exact URL).

## Usage

1.  Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
2.  Use the interface to interact with the Edge.ai features.
    - Upload strategy PDFs (if applicable).
    - View market data analysis and charts.
