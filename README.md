# Refai — Mortgage Savings Calculator

Interactive front-end app that models how everyday savings — subscriptions, bills, wages, lump sums, and advanced strategies — reduce mortgage interest and shorten loan payoff.

**Live:** [refai-app-savings-calc.vercel.app](https://refai-app-savings-calc.vercel.app)

## Stack

- React 19 (hooks)
- Vite 6
- Tailwind CSS v4
- Shared mortgage simulation engine (`src/utils/mortgage.js`)
- Local state + `localStorage` for lifetime savings

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Features

### Mortgage offset calculator (always visible)
- Default scenario: **$800,000 · 6.5% · 30 years**
- **Total interest payable** updates dynamically as savings are added across all pages
- Combines savings from subscriptions, bills, rate comparison, pay frequency, wage flush, and lump sums
- **Start new scenario** resets everything to a clean baseline

### Subscriptions (💳)
- Pause / cancel subscriptions with confirmation modal
- Reactivate paused subscriptions
- Savings tracker with animated counters (monthly, annual, lifetime)

### Bill Tracker (📋)
- Negotiate household bills; target savings planner (% discount across all bills)
- Renegotiation badges and savings summary banner
- Sort, filter, and add bills

### Wages (💰)
- Weekly wage flush through offset (deposit weekly, withdraw at month-end)
- Results shown above wage inputs

### Pay Frequency (🏦)
- Compare monthly vs fortnightly repayment schedules

### Rate Compare (📉)
- Model interest savings from a lower rate

### Lump Sums (💵)
- Tax returns and savings deposits into offset

### Advanced (🔒)
- Gamified **Apply advanced strategies** simulator (equity recycling preview)
- Teaser results only: payoff time, time saved, interest saved
- Blurred confidential strategy detail with **See If You Qualify (for advanced strategies)** CTA

## Sample data

Pre-loaded subscriptions and household bills at AU pricing.

## About

Subscription and bill reduction mortgage impact calculator for [refai.app](https://refai.app).
