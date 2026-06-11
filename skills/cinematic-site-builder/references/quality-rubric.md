# Quality Rubric

A generated site is acceptable only when the experience is coherent and resilient.

## Functional

- The site loads without fatal console errors.
- Navigation, wheel, touch, and keyboard progress controls work.
- Canvas is nonblank in WebGL mode.
- `?fallback=1` renders a readable Canvas/DOM experience.
- Reduced motion keeps all content accessible.

## Visual

- Hero has an immediate first-viewport signal for the brand or product.
- DOM text does not overlap across desktop and mobile.
- WebGL visuals and DOM chapters share one progress/phase model.
- A restrained film/post layer adds vignette, scanline, sweep, and color separation without reducing text readability.
- Transitions feel continuous rather than separate effects pasted together.
- Buttons and navigation remain clickable when chapters change.

## Engineering

- Content is data-driven.
- Chapter ranges are valid and ordered.
- Runtime internals are not rewritten for simple copy/theme changes.
- Presets expose parameters instead of hard-coded project-specific values.
- Validation commands are present in `package.json`.

## Final Evidence

Prefer command output, screenshots, and file references over subjective claims.
