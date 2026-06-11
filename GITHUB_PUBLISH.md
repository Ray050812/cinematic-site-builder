# Publish To GitHub

Use this guide to publish `cinematic-site-builder` as an open-source GitHub repository.

## 1. Install Required Tools

Install:

- Git for Windows: https://git-scm.com/download/win
- GitHub CLI: https://cli.github.com/

After installation, open a new terminal and confirm:

```bash
git --version
gh --version
```

Login to GitHub:

```bash
gh auth login
```

Choose:

- GitHub.com
- HTTPS
- Login with a web browser

## 2. Initialize The Local Repository

From the plugin root:

```bash
cd /path/to/cinematic-site-builder
git init
git branch -M main
git add .
git commit -m "Initial open-source release"
```

On Windows PowerShell, for this local project, the path may look like:

```powershell
cd "<path-to-cinematic-site-builder>"
```

## 3. Create A Public GitHub Repository

Recommended repository name:

```txt
cinematic-site-builder
```

Create and push in one command:

```bash
gh repo create cinematic-site-builder --public --source . --remote origin --push --description "Codex plugin for generating cinematic WebGL/Three.js animated websites with real-subject 3D pipelines."
```

If the repository already exists on GitHub:

```bash
git remote add origin https://github.com/<your-github-username>/cinematic-site-builder.git
git push -u origin main
```

## 4. Configure The GitHub Repository

In GitHub repository settings:

- Description: `Codex plugin for generating cinematic WebGL/Three.js animated websites with real-subject 3D pipelines.`
- Website: optional demo URL, if you deploy one later.
- Topics:
  - `codex-plugin`
  - `threejs`
  - `webgl`
  - `vite`
  - `cinematic-web`
  - `creative-coding`
  - `generative-ui`
  - `lusion-like`
  - `interactive-3d`

## 5. Check The First CI Run

After pushing, open the repository's Actions tab.

The `Release Check` workflow should run:

- Plugin audit.
- Template dependency install.
- Config validation.
- Logic tests.
- Real-subject preset test.
- Build smoke test.

If CI fails because dependencies changed, inspect the Actions log and fix the reported file or command.

## 6. Publish A First Release

After the main branch is green:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Then create a GitHub Release from tag `v0.1.0`.

Suggested release title:

```txt
v0.1.0 alpha - Cinematic Site Builder
```

Suggested release notes:

```md
Initial alpha release of Cinematic Site Builder.

- Codex plugin manifest and skill workflow.
- Vite/Three.js cinematic site template.
- Scroll-driven WebGL runtime with Canvas fallback.
- Scene presets including ai-era-sphere, video-composite, depth-composite, and researched-3d-subject.
- Real-subject 3D pipeline with model, reconstructed asset, HD/Canva 2.5D, and procedural fallback strategies.
- Wuhan/Yellow Crane Tower example with attribution.
- Release audit, config validation, logic tests, and real-subject preset test.

Known limitation: real-world subject realism depends on available licensed models, reconstructed assets, or high-quality image layers. Procedural reconstructions are approximate and should be disclosed.
```

## 7. Verify Someone Else Can Install It

Ask a second machine or a fresh Codex setup to configure the plugin with:

```json
{
  "plugins": [
    {
      "name": "cinematic-site-builder",
      "source": {
        "source": "local",
        "path": "/absolute/path/to/cinematic-site-builder"
      }
    }
  ]
}
```

Then test:

```txt
Use cinematic-site-builder to create a cinematic animated site for an AI product.
```
