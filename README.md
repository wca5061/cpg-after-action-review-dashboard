# CPG After-Action Review Dashboard

Interactive after-action review dashboard for the Cognitive Performance Group Data Visualization Specialist candidate assessment.

## Project Summary

This submission delivers a production-style interactive dashboard for a 5-day military cognitive performance exercise involving five teams. The application is intentionally self-contained and designed to open locally with no build step, no local server requirement, and no CSV fetch dependency.

The dashboard includes:

- Global multi-select filters for team, day, scenario, phase, and decision type
- KPI summary strip with daily sparklines and delta comparisons
- Team radar chart
- Daily performance timeline with stress overlay
- Domain-by-team heatmap
- Stress vs. accuracy scatter plot with per-team regressions
- Error flag stacked bar analysis
- Auto-generated key findings briefing section
- Raw-event drill-down drawer
- Export filtered CSV and share-view URL hash support
- Optional Anthropic-powered AI analyst panel

## Approach

The solution uses a single HTML file with vanilla JavaScript and D3.js v7. Both provided CSV datasets are embedded inline at the top of the file as JavaScript strings so the application can run directly from disk.

The app is organized around a single `appState` object and a shared `getFilteredData()` pipeline. Every visualization re-renders from the same filtered dataset so interactions stay synchronized across the full dashboard.

Key implementation choices:

- Self-contained `index.html` for frictionless local review
- D3-driven rendering and transitions for all chart interactions
- Dark tactical visual language aligned to the assessment prompt
- Inline drill-down table for traceability from aggregate views to raw events
- Embedded data plus copied source CSVs for transparency and reviewer convenience

## Tech Stack

- HTML / CSS / JavaScript
- [D3.js v7](https://d3js.org/)
- Google Fonts (`Inter`)

## Repository Structure

```text
.
├── index.html
├── FINDINGS.md
├── .gitignore
└── data
    ├── exercise_performance_data.csv
    └── participant_roster.csv
```

## Setup / Installation

No installation is required for the core dashboard.

1. Clone or download the repository.
2. Open `index.html` in Chrome.

Because the dashboard embeds the datasets inline, it does not depend on the local CSV files to render. The `data/` folder is included for reference only.

## How To Run

### Simplest option

Open `index.html` directly in Chrome:

```bash
open index.html
```

### Optional local server

If you prefer serving files locally:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## AI Analyst Panel

The AI panel is optional and only activates if an Anthropic API key is entered in the interface.

- The dashboard works fully without an API key.
- The only network request in the app is the optional Anthropic Messages API call.
- The AI request is constructed from the currently filtered dataset summary plus the user’s question.

## Written Findings

The required written findings are included in two places:

- In the dashboard itself under the **KEY FINDINGS** section
- As a separate submission document in [FINDINGS.md](./FINDINGS.md)

## AI Tool Usage

AI tools were used to accelerate implementation, code organization, and polishing of the submission. Specifically, AI assistance was used for:

- structuring the dashboard architecture
- refining D3 chart implementations
- improving interaction design and styling details
- drafting submission documentation

All final implementation decisions, validation, and submission packaging were reviewed and assembled deliberately for this project.

