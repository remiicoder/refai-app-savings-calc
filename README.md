# Refai — Subscription & Bill Tracker (Prototype)

Front-end prototype with two companion views: **Subscription Manager** and **Bill Negotiation Tracker**.

## Stack

- React 19 (hooks)
- Tailwind CSS v4
- Local state + `localStorage` for lifetime savings

## Run locally

```bash
cd subscription-manager
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Features

### Subscriptions (💳)
- Subscription cards with service icon, monthly AUD cost, billing date, status badge
- **Pause** / **Cancel** with confirmation modal and savings messaging
- **Reactivate** paused subscriptions (adjusts lifetime savings)
- **Savings tracker** — monthly, projected annual, and lifetime totals with animated counters
- **Cancelled** section — collapsed at the bottom

### Bill Tracker (📋)
- Household bill cards with original vs negotiated pricing and auto-calculated savings
- Renegotiation badges: green (≤6 mo), yellow (6–12 mo), red (12+ mo overdue)
- **Time to Call 📞** on overdue bills; **Edit price** resets last-negotiated date
- Savings summary banner (original vs negotiated spend, monthly & annual savings)
- Sort by saving, date, or category; **+ Add Bill** modal
- Mobile-responsive layout

Toggle between views via the top nav tabs.

## Sample data

Pre-loaded with Netflix, Spotify, Disney+, Kayo Sports, Stan, Binge, Apple TV+, and YouTube Premium at AU pricing.
