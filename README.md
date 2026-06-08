# CashPilot

A modern full-stack platform for taking control of your personal finances.

## Overview

CashPilot is a comprehensive financial application that provides an intuitive dashboard experience for monitoring financial health. It empowers users to search, filter, and categorize daily expenses, visualize spending patterns, track budgets, and gain insights into their income vs. expense flow.

## Features

### Financial Management

* Expense tracking
* Transaction history
* Categorization
* Budget tracking

### Analytics

* Spending breakdowns
* Income vs expense visualization
* Financial metrics

### User Experience

* Authentication
* Responsive design
* Search and filtering

## Tech Stack

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **Database & Auth**: Supabase (PostgreSQL)
* **Styling**: Tailwind CSS
* **Validation**: Zod
* **AI Integration**: Vercel AI SDK

## Architecture

```text
User
│
▼
Next.js Frontend
│
├─ Dashboard
├─ Transactions
├─ Analytics
└─ Authentication
│
▼
Supabase
├─ Auth
├─ PostgreSQL
└─ Storage
│
▼
CashPilot Data Layer
```

## Screenshots

### Authentication

![Authentication](./docs/screenshots/auth.png)

### Dashboard

![Dashboard](./docs/screenshots/dashboard.png)

### Transactions

![Transactions](./docs/screenshots/transactions.png)

## Setup

### Prerequisites
- Node 18+
- Supabase project
- OpenAI API key

### Local Setup
1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env.local`
4. Fill in the required environment values in `.env.local`
5. Run `npm run dev` to start the development server

## Deployment

### Vercel

* Import repository from GitHub
* Configure environment variables
* Deploy the application

### Supabase

* Create project
* Run migrations located in `supabase/migrations/`
* Configure authentication (Email/Password)

## Current Status

Completed:
* Authentication
* Dashboard
* Transaction management
* Analytics views
* Budget management
* AI Chat integrations

## Future Improvements

* Advanced spending insights
* Financial forecasting models
* Plaid integration for bank syncing

## Engineering Highlights

* Next.js App Router for optimized server-side rendering and data mutations
* TypeScript type safety across the entire application stack
* Supabase Authentication with secure session management
* PostgreSQL persistence utilizing Row Level Security (RLS)
* Dashboard analytics aggregating complex financial data points
* Component-driven architecture using robust UI patterns
* Responsive UI design implementing Tailwind CSS utility classes

## Live Demo

Deployment coming soon.

## Suggested GitHub Topics

* nextjs
* typescript
* supabase
* postgresql
* finance
* personal-finance
* dashboard
* tailwindcss
* full-stack
