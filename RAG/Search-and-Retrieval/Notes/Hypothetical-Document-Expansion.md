---
tags: [rag, retrieval, hyde, query-expansion, embeddings]
status: budding
source: https://arxiv.org/abs/2212.10496
aliases: [Hypothetical Document Embeddings, HyDE]
parent: "[[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]"
updated: 2026-05-20
---

# Hypothetical document expansion (HyDE)

## TL;DR

HyDE has an LLM write a short hypothetical answer, embeds that text, and retrieves on similarity to that embedding instead of (or as well as) the raw question. It matters when query–document wording diverges and you lack labeled query–passage pairs to train a bridge.

## When to use / not

- **Use** when questions are short or abstract but relevant passages are written in different vocabulary (lexical / semantic mismatch).
- **Poor fit** when hallucinated hypothetical text could poison retrieval (high-stakes facts, adversarial settings) without reranking or verification.

## Core ideas

### Mechanism

- **Hypothetical document:** model-generated passage standing in for “what an answer might look like.”
- **Embed the hypothesis:** nearest neighbors in corpus embedding space emphasize passages that **read like** that fake answer.
- **Tradeoff:** gains robustness to query phrasing; risk of **wrong facts** in the hypothesis skewing neighborhoods.

### Primary sources

- Paper (PDF): [https://arxiv.org/pdf/2212.10496](https://arxiv.org/pdf/2212.10496)
- Abstract: [https://arxiv.org/abs/2212.10496](https://arxiv.org/abs/2212.10496)

### Gotchas

- Pair with reranking ([[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]]) or reflection ([[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]]) when bad hypotheses are likely.

## How it fits

HyDE attacks the **query representation** problem at the top of the RAG funnel. Downstream stacks often combine it with precise rerankers and adaptive retrieval so a bad hypothetical does not dictate the final context.

## Links out

- [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]
- [[Generative AI/RAG/Search-and-Retrieval/SOTA-Retrieval-Catalog]]
- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]]
- [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]]

## Next steps

- **Follow-up note:** prompt patterns that keep hypothetical docs neutral and excerpt-like vs overconfident.
- **Question:** Will you always run a second-stage reranker when HyDE is on?
- **Resource:** revisit HyDE paper § on failure modes with biased generators.

## Related questions

- When is traditional query expansion safer than full hypothetical documents?
