# Fallback Rules

Fallback is a first-class deliverable, not an error page.

## Trigger Conditions

- `?fallback=1` query parameter.
- WebGL context creation fails.
- Three.js import fails.
- Reduced motion is enabled and the scene is too intense.

## Requirements

- Keep the same content, chapter states, navigation, and progress bar.
- Render a Canvas 2D ambient field or static visual system.
- Preserve text contrast and CTA visibility.
- Make fallback obvious to developers through `document.body.dataset.renderMode`.

## Validation

- Test `/?fallback=1`.
- Confirm `body[data-render-mode="fallback"]` appears.
- Confirm the canvas is not transparent or empty.
