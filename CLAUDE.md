# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Edge.ai is an AI-powered trading strategy backtester that allows users to upload trading strategy PDFs and test them against historical market data. It features a "Goldbach" mathematical analysis mode using Power of 3 (PO3) ratios.

## Development Commands

### Frontend (React + Vite)
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend (Python FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py       # Start server on port 8000
```

### Environment Variables
- Backend requires `GEMINI_API_KEY` in `backend/.env`
- Frontend can access it via `process.env.GEMINI_API_KEY` (configured in vite.config.ts)

## Architecture

### Frontend (`src/`)
- **App.tsx**: Main component managing game state machine (IDLE → READY → ANALYZING → ANALYZED → REVEALED)
- **services/api.ts**: API client calling backend at `http://localhost:8000`
- **components/Chart.tsx**: TradingView Lightweight Charts wrapper with imperative handle for data updates and price line overlays
- **types.ts**: TypeScript interfaces for `Candle`, `GameState`, `AnalysisResult`, `PriceLevel`

### Backend (`backend/`)
- **main.py**: FastAPI app with endpoints `/spin`, `/compile_strategy`, `/analyze`
- **goldbach.py**: Core Goldbach strategy logic - calculates dealing ranges, PO3 levels, detects HIPPO patterns and PO3 Stop Runs
- **ai_engine.py**: Gemini API integration for PDF strategy compilation and chart analysis
- **utils.py**: Data loading from `backend/data/es-4h.csv` (S&P 500 futures 4H candles)

### Data Flow
1. `/spin` returns past candles (displayed) and future candles (hidden for reveal)
2. `/compile_strategy` accepts PDF upload, returns strategy persona (or `GOLDBACH_MODE` for Goldbach PDFs)
3. `/analyze` runs either Goldbach analysis (default) or AI analysis based on persona, returns sentiment + price levels

### Goldbach Strategy Logic (`goldbach.py`)
Key functions:
- `get_dynamic_po3()`: Selects PO3 (9, 27, 81, 243, etc.) based on visible price range
- `calculate_dealing_range()`: Floor division to find range boundaries
- `get_goldbach_levels()`: Maps ratios (0.11, 0.29, 0.50, etc.) to price levels with labels (OB, FVG, LV, BR, EQ)
- `detect_patterns()`: Scans for HIPPO (gap-isolated consolidation) and PO3 Stop Runs (wick rejections at exact PO3 distances)

## Path Alias
`@/` resolves to `src/` directory (configured in vite.config.ts)
