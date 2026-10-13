# PlantUML Studio — Agent Instructions

## Project
Web-based PlantUML editor and interactive diagram viewer.

## Source of truth
Before implementing a task, consult:
- docs/PRODUCT.md for product requirements
- docs/ARCHITECTURE.md for technical boundaries
- docs/DESIGN_SYSTEM.md for UI conventions
- docs/ROADMAP.md for current priorities
- docs/DECISIONS.md for accepted decisions

## Engineering rules
- Use TypeScript strict mode.
- Use Next.js App Router and NestJS.
- Follow SOLID principles where applicable.
- Prefer simple, explicit implementations.
- Keep components focused and reusable.
- Separate UI, application logic and infrastructure.
- Avoid unnecessary abstractions.
- Do not introduce dependencies without justification.
- Do not refactor unrelated code.
- Do not implement features outside the requested scope.

## PlantUML constraints
- PlantUML source is the source of truth.
- Use the official PlantUML rendering engine.
- Do not implement a custom PlantUML parser.
- Render diagrams as SVG.
- Keep canvas transformations independent of rendering.
- Do not implement visual node editing in the MVP.

## UI/UX
- Follow docs/DESIGN_SYSTEM.md.
- Design for desktop-first developer workflows.
- Prioritize usability, accessibility and performance.
- Prefer restrained, professional interfaces.
- Avoid generic dashboard layouts.
- Use the relevant UI/UX skill for interface tasks.

## Verification
- Run relevant tests after implementation.
- Run lint and type checking for changed packages.
- Report verification results.
- Do not claim tests passed unless executed.
- Do not modify tests merely to hide failures.

## Workflow
1. Inspect relevant files.
2. Identify the task's scope.
3. Present a short plan for nontrivial changes.
4. Implement only the requested scope.
5. Run relevant verification.
6. Summarize changed files and remaining issues.

## Restrictions
- Never delete user data without explicit approval.
- Never execute destructive commands without approval.
- Never add authentication or database persistence
  unless explicitly requested.
- Do not modify architecture decisions silently.
