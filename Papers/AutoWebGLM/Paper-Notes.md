---
tags: [paper, web-agent, llm-agent, html-simplification]
status: evergreen
source: https://arxiv.org/abs/2404.03648
aliases: [AutoWebGLM, AutoWebBench]
updated: 2026-05-24
---

# AutoWebGLM — Paper Notes

## TL;DR

**AutoWebGLM** is a 6B web navigation agent (ChatGLM3-6B) that beats GPT-4 on real browsing benchmarks by (1) **HTML simplification** — prune noisy DOM trees before the model sees them, (2) **hybrid human–AI curriculum data** (~10k traces + Mind2Web/MiniWoB++), and (3) **bootstrap training** — DPO for preference alignment plus RFT (rejection sampling) in MiniWoB++/WebArena sandboxes. Introduces bilingual **AutoWebBench** (EN/ZH, in/out-of-domain).

## Authors & links

- arXiv: [2404.03648](https://arxiv.org/abs/2404.03648) (KDD 2024)
- Code: [THUDM/AutoWebGLM](https://github.com/THUDM/AutoWebGLM)

## Key thesis

> Most LLM web agents fail in the wild because HTML is huge, actions are diverse, and the web is open-domain. AutoWebGLM treats **observation design** and **curriculum training** as first-class — a small open model can outperform GPT-4 when the interface and data pipeline match how humans browse.

## Core concepts

### Three failure modes (§1)

| Challenge | What breaks | AutoWebGLM response |
| --------- | ----------- | ------------------- |
| Complex HTML | Context overflow, distraction | HTML Pruner algorithm — keep ancestors/descendants/siblings of operable nodes |
| Versatile actions | Inconsistent tool schemas | Unified 10-action space (click, type, scroll, tabs, finish, …) |
| Open-domain web | Generalization gap | Curriculum: simple → complex tasks; RFT in target environments |

### Observation space (§3.2.1)

Four components fed to the policy each step:

1. **Task description** — user goal
2. **Simplified HTML** — pruned tree with operable element IDs
3. **Current position** — scroll offset + page height
4. **Previous actions** — explicit history to avoid action loops

### Training pipeline (§4)

| Stage | Data | Purpose |
| ----- | ---- | ------- |
| Stage 1 | Webpage recognition + simple ops | Basic DOM comprehension |
| Stage 2 | Complex multi-step tasks (hybrid human–AI CoT) | Real-world difficulty |
| DPO | Preferred vs rejected trajectories | Align action choices |
| RFT | Sample 64× in MiniWoB++/WebArena, keep successes | Environment-specific bootstrapping |

### Action space (Table 1)

`click(id)`, `type_string(id, text, enter)`, `scroll_page`, `select`, `go`, `jump_to`, `switch_tab`, `user_input`, `finish(answer)` — language-native, not code generation.

## Key results

### AutoWebBench — Step Success Rate (Table 2, cross-task / cross-domain)

| Model | EN cross-task | EN cross-domain | ZH cross-task | ZH cross-domain |
| ----- | --------------- | --------------- | ------------- | --------------- |
| GPT-4 | 38.6 | 39.7 | 36.7 | 36.3 |
| GPT-3.5-Turbo | 12.1 | 6.4 | 13.5 | 10.8 |
| **AutoWebGLM 6B** | **64.8** | **58.6** | **65.4** | **61.8** |

### Mind2Web average SSR (Table 3)

| Model | Average |
| ----- | ------- |
| GPT-4† | 30.9 |
| LLaMA2-70B* | 54.4 |
| Html-T5-XL* | 66.9 |
| **AutoWebGLM 6B** | **59.5** |

### MiniWoB++ & WebArena task success (Table 4)

| Model | MiniWoB++ | WebArena |
| ----- | --------- | -------- |
| GPT-4 | 32.1 | 14.4 |
| **AutoWebGLM 6B** | **89.3** | **18.2** |

### Training ablation (Table 6, Mind2Web avg)

Train set only 48.1 → +Stage1 48.4 → +Stage2 56.7 → +DPO 59.5 → +RFT MiniWoB 89.3 / WebArena 18.2

### Failure taxonomy (§5.4)

Hallucinations 44%, poor graphical recognition 28%, task misinterpretation 20%, pop-ups 8%.

## Paper assumptions

| ID | Assumption | Break scenario |
| ---- | ---------- | -------------- |
| `static-dom` | Page structure is mostly text/DOM-parseable | Canvas-heavy SPAs, shadow DOM, CAPTCHA walls |
| `simplified-html` | HTML Pruner preserves the operable target | Target lives in collapsed sibling branch pruned away |
| `english-chinese` | Training covers EN/ZH site styles | RTL layouts, radically different mobile-only UIs |
| `sandbox-rft` | RFT can sample successes in MiniWoB/WebArena | Production sites with auth, rate limits, legal blocks |
| `6b-backbone` | ChatGLM3-6B fits latency/cost budget | Need frontier reasoning on novel multi-tab workflows |

## Limitations

- HTML-centric — visual-only cues need OCR module, still weak on graphics (28% failures)
- WebArena 18.2% — far from reliable autonomous browsing on live sites
- Hybrid data construction is labor-intensive at scale
- Predict step dominates latency (~48% of execution time, Table 5)

## Extension directions

1. **Vision-first grounding** — screenshot + Set-of-Marks instead of pruned HTML for graphical UIs
2. **Adaptive prune budget** — dynamic depth/children limits when target not in top-k candidates
3. **Self-check actions** — verify click/type succeeded before next step (paper §6 future work)
4. **Intent layer** — predict next intent (cf. Auto-Intent) before full action generation
5. **Multi-agent decomposition** — planner + grounder split (later AutoGLM insight)

## Paper Journey site mapping

| Part 1 section | Part 2 playground | Part 3 seed |
| -------------- | ------------------- | ----------- |
| Hook + thesis | — | chat starters |
| Problem (HTML/action/open-domain) | `#paradigm` | assumption: `static-dom` |
| Insight (HTML Pruner + observation) | `#granularity` | idea: `adaptive-prune` |
| Method (data + DPO + RFT) | `#context`, `#curriculum` | idea: `self-check` |
| Evidence (benchmarks) | `#evidence` | idea: `vision-grounding` |
| Vocabulary | `#compare`, `#topk` | assumption: `simplified-html` |
