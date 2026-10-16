# SingaRate - Prompt & Specification History

## Project Overview
SingaRate is a Singapore-focused real-time foreign exchange rate application and currency calculator tailored for Singapore Dollar (SGD) currency pairs, with integration capabilities for the Monetary Authority of Singapore (MAS) APIs.

---

## Prompt 1: Initial Application Specification
**User Prompt:**
> 1. build a singapore-based exchange rate tool that provides real-time currency conversion for the SGD currencies.
> 2. build just the front end for now. i will add the backend integration using MAS API keys later. Use a clean UI with search, favorites, and a simple calculator.

**Key Requirements & Implementation:**
- Domestic base currency: Singapore Dollar (SGD).
- 25+ major, regional ASEAN, and trading partner currencies (MYR, USD, JPY, EUR, GBP, AUD, THB, IDR, CNY, BND, HKD, TWD, KRW, INR, PHP, VND, CAD, CHF, NZD, AED, SAR, SEK, TRY, ZAR).
- Singapore-specific financial contexts:
  - Brunei Dollar (BND) 1:1 parity under the 1967 Currency Interchangeability Agreement.
  - MAS 100-unit quotation convention (JPY, MYR, IDR, THB, INR, KRW, TWD quoted per 100 units).
  - Causeway / Johor Bahru (SGD to MYR) travel calculator and commuter tips.
  - Singapore retail channel spread comparisons (MAS benchmark, local retail banks like DBS/OCBC/UOB, money changers like The Arcade / Chinatown, and multi-currency travel cards like YouTrip/Wise/Revolut).
- Simple & advanced calculator with travel expense/tax keypad (+9% GST, +10% service charge).
- Interactive favorites ribbon with `localStorage` persistence.
- High-density rates table with real-time search, regional tabs, 24h change, and 7-day SVG sparklines.

---

## Prompt 2: Git Repository Push
**User Prompt:**
> git push
> https://<REDACTED_GITHUB_TOKEN>@github.com/cyudr/mas-exchanger.git

**Execution & Implementation:**
- Initialized git repository on `main` branch.
- Added all source files, components, and configuration.
- Set remote origin to `https://<REDACTED_GITHUB_TOKEN>@github.com/cyudr/mas-exchanger.git`.
- Successfully pushed the complete codebase to GitHub.

---

## Prompt 3: Serverless MAS API Connection
**User Prompt:**
> 1. add a serverless API connection that pulls live data from MAS API catalogue using the following endpoint:
> 
> GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14
> # KeyId: <MAS_KEY_ID>
> ;
> 
> 2. store this in /api folder at the project root level, not the src folder;
> 3. include health.ts and /exchangerates.ts within the same subfolder;
> 4. do not hardcode any API key, I will manually include them

**Implementation:**
- Created `/api/health.ts` at root level for service health checking.
- Created `/api/exchangerates.ts` at root level connecting to the exact MAS API Gateway endpoint with dynamic `end_of_day` querying and secure `KeyId` authorization via environment variables (`MAS_KEY_ID`, `MAS_API_KEY`) or request headers.
- Configured `.env.example` with placeholders for `MAS_KEY_ID` and `MAS_API_KEY`.
- Created root `server.ts` Express server with Vite middleware integration routing `/api/health` and `/api/exchangerates`.

---

## Prompt 4: Export Chat Prompts
**User Prompt:**
> export this chat as prompts.md

**Implementation:**
- Created `/prompts.md` documenting all chronological user prompts, requirements, architecture, and implementations.

---

## Prompt 5: Mobile Optimization & Dynamic Scaling
**User Prompt:**
> optimize this view for mobile phone, scale dynamically

**Implementation:**
- Mobile-first responsive fluid scaling using Tailwind CSS.
- Adherence to < 15% mobile sticky header height cap.
- High touch-target compliance ($\ge 44\text{px}$) for thumb navigation.
- Responsive mobile currency list cards with instant tap-to-convert.
- Adaptive SVG chart viewBox scaling for small phone viewports down to 320px.
- Bottom thumb navigation bar on mobile devices for seamless one-handed operation.
