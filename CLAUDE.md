# Product Brief Maintenance

## Purpose

The file `docs/product-brief.md` is the permanent business representation of this application.

It is the single source of truth describing the product for business stakeholders.

Another AI agent called the **Growth Officer** relies entirely on this document to understand the product and make strategic decisions regarding:

- marketing
- pricing
- packaging
- positioning
- SEO
- launch strategy
- customer acquisition
- competitive analysis
- product portfolio management

The Growth Officer does not review the source code or this conversation.

Therefore, the quality of its decisions depends entirely on the accuracy of this document.

---

## Objective

The Product Brief must always describe the application exactly as it exists today.

It must allow a business executive to understand the product without reading the source code.

It is not technical documentation.

It is not a changelog.

It is not a development log.

It is a business document.

---

## When to Update

Update the Product Brief whenever completed work changes the product from a business perspective.

Examples include:

- a new customer-facing feature is completed
- an existing feature changes behaviour
- a feature is removed
- onboarding changes
- user experience changes
- permissions change
- subscription plans change
- pricing changes
- positioning changes
- target audience changes
- roadmap priorities change
- launch readiness changes
- customer value changes
- important product limitations are removed or introduced

Do NOT update the Product Brief for:

- refactoring
- internal architecture improvements
- dependency updates
- code cleanup
- unit tests
- performance improvements with no customer impact
- internal tooling
- developer experience improvements

unless those changes have a visible impact on customers.

---

## How to Update

When updating the Product Brief:

1. Read the current `docs/product-brief.md`.
2. Review all completed work since the previous update.
3. Update every impacted section.
4. Remove obsolete information.
5. Keep the entire document internally consistent.
6. Save the updated file.

The document must always represent the current product.

Never append information.

Never maintain historical information.

Rewrite sections whenever necessary.

---

## Writing Principles

Always write from the customer's perspective.

Describe:

- what the product does
- who it helps
- the problems it solves
- the value it creates
- why customers would choose it
- what is available today
- what is currently being developed
- what is planned next

Focus on customer value rather than technical implementation.

Only mention technical details if they directly influence customer experience or business decisions.

---

## Accuracy Rules

Never invent information.

Never speculate.

Never exaggerate capabilities.

Never describe unfinished functionality as completed.

Always distinguish between:

- Completed Features
- Features In Development
- Planned Features

If information is uncertain, leave the existing information unchanged rather than guessing.

Accuracy is more important than completeness.

---

## Quality Checklist

Before saving the Product Brief, verify that:

- every completed customer-facing feature is documented
- removed features have been removed
- roadmap priorities are still correct
- pricing information is still accurate
- positioning is still accurate
- target audience is still accurate
- launch readiness reflects the current product
- known limitations are still valid
- there are no contradictions anywhere in the document

The document should read as if it had been written today from scratch.

---

## Growth Officer Compatibility

The Product Brief will be consumed by an AI Growth Officer.

Write the document so that the Growth Officer can confidently make strategic decisions without needing to ask the engineering team additional questions.

The Growth Officer should be able to understand:

- the product
- its value proposition
- its maturity
- its strengths
- its weaknesses
- its competitive positioning
- its current priorities
- its commercial readiness

without reading any code.

---

## Command

Whenever I write:

**Update the Product Brief**

Immediately update `docs/product-brief.md`.

Do not ask for confirmation.

Do not explain the changes.

Do not generate a summary.

Simply update the file.