# Bank Supervisory Dashboard

A comprehensive React-based supervisory dashboard for monitoring private sector banks. Built for the Central Bank of Syria (CBS) banking supervision function, incorporating international best practice standards (Basel III/BCBS) for prudential ratios and risk assessment.

## Features

### 1. Sector Overview
- Aggregate KPIs across all 18 banks (12 conventional, 4 Islamic, 2 microfinance)
- Supervisory alerts for high-risk banks, low capitalization, and stale reporting
- Asset distribution, risk distribution, and audit opinion charts
- Full prudential heatmap with color-coded status indicators

### 2. Bank Comparison
- Sortable, filterable table with 12 key columns
- Search by bank name, filter by type, risk level, and audit opinion
- Click-through to individual bank profiles
- Visual highlighting for concerning metrics

### 3. Prudential Standards
- Basel III / BCBS benchmark reference cards with expandable details
- CBS regulatory requirements mapped to international standards
- Interactive metric selector with threshold-aware bar charts
- Compliance summary table with pass/fail indicators

### 4. Risk & Audit
- Audit opinion breakdown with detailed findings
- Lebanese bank exposure analysis (systemic risk tracking)
- CBS compliance status for affected banks
- Data gap assessment against Basel III disclosure requirements

### 5. Analytics
- Market concentration analysis (HHI calculation)
- Cumulative asset concentration curve
- Bank size distribution
- Conventional vs Islamic radar comparison
- Interactive scatter plot with selectable X/Y metrics
- Profitability rankings

### 6. Bank Profiles
- Individual bank deep-dives with full metric breakdowns
- Performance radar chart
- Peer comparison (vs same bank type average)
- Prudential compliance detail cards
- Lebanese exposure warnings where applicable

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **React Router** for client-side routing
- **Lucide React** for icons

## Project Structure

```
src/
  components/
    charts/          # Reusable chart components
      HeatmapTable.tsx
      MetricBarChart.tsx
      ScatterPlotChart.tsx
      SectorCompositionChart.tsx
    layout/          # Layout shell
      AppLayout.tsx
      Header.tsx
      Sidebar.tsx
    ui/              # shadcn/ui primitives
    FilterBar.tsx    # Reusable filter bar
    MetricCard.tsx   # KPI card component
    StatusBadge.tsx  # Status badge component
  data/
    banks.ts               # Bank data, benchmarks, aggregates
    lebanese-exposure.ts   # Lebanese exposure and data gaps
  hooks/
    useBankFilters.ts      # Filtering/sorting hook
    useSelectedBank.ts     # Bank selection hook
  lib/
    utils.ts               # Formatting, color, and metric utilities
  pages/
    OverviewPage.tsx
    BanksPage.tsx
    PrudentialPage.tsx
    RiskPage.tsx
    AnalyticsPage.tsx
    ProfilesPage.tsx
  types/
    index.ts               # Central TypeScript interfaces
  App.tsx                  # Root with routing
  main.tsx                 # Entry point
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Data Sources

Financial data extracted from published annual audit reports (YE 2023/2024) of 18 Syrian private sector banks. Prudential benchmarks reference Basel III/BCBS standards, CBS regulatory decisions, and international banking best practices.

## Prudential Framework

| Metric | Basel III Reference | CBS Requirement |
|--------|-------------------|-----------------|
| Capital Adequacy (E/A) | >= 3% Tier 1 Leverage | Decision 253 |
| ROA | N/A (profitability) | N/A |
| ROE | N/A (profitability) | N/A |
| Cost-to-Income | N/A (efficiency) | N/A |
| Loans-to-Deposits | NSFR framework | Decision 395 |
| Cash-to-Assets | LCR >= 100% | Decision 395/461 |

## License

Internal supervisory tool. Not for public distribution.
