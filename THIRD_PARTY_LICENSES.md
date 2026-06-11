# Third-Party Licenses

This project vendors or references third-party software so generated sites can run without depending on external CDNs.

## Three.js

- Package: `three`
- License: MIT
- Copyright: 2010-2026 three.js authors
- Vendored files:
  - `assets/templates/vanilla-three-vite/public/vendor/three.module.min.js`
  - `assets/templates/vanilla-three-vite/public/vendor/three.core.min.js`
  - `assets/templates/vanilla-three-vite/public/vendor/addons/loaders/GLTFLoader.js`
  - `assets/templates/vanilla-three-vite/public/vendor/addons/utils/BufferGeometryUtils.js`
- Upstream: https://github.com/mrdoob/three.js

The AI Era immersive example also imports Three.js at runtime from `https://esm.sh/three@0.165.0`. See `examples/ai-era-immersive-site/THIRD_PARTY_LICENSES.md`.

## Vite

- Package: `vite`
- License: MIT
- Copyright: 2019-present, VoidZero Inc. and Vite contributors
- Used by generated projects through `assets/templates/vanilla-three-vite/package.json`.
- Upstream: https://github.com/vitejs/vite

## Playwright

- Package: `@playwright/test`
- License: Apache-2.0
- Used by the optional visual smoke test in generated projects.
- Upstream: https://github.com/microsoft/playwright

## Node.js and npm ecosystem

Generated projects expect a local Node.js/npm environment for development and test commands. Node.js and packages installed from npm retain their own licenses.
