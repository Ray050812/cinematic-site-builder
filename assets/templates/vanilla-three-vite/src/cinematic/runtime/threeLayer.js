import * as THREE from "three";
import { createPresetObjects } from "../presets/presetRegistry.js";

export async function createThreeRenderer({ canvas, config, reducedMotion }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = reducedMotion ? 0.9 : 1.08;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color(config.theme?.background || "#05070a"), 0.024);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5.8);

  const keyLight = new THREE.PointLight(config.theme?.color || "#8cecff", 22, 14);
  keyLight.position.set(1.8, 2.2, 2.4);
  const rimLight = new THREE.PointLight(config.theme?.accent || "#ffd08a", 8, 18);
  rimLight.position.set(-2.4, -1.1, 1.8);
  scene.add(keyLight);
  scene.add(rimLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.36));

  const presetObjects = createPresetObjects(THREE, config);
  presetObjects.forEach((entry) => scene.add(entry.object));

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, reducedMotion ? 1.25 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    update(snapshot, time) {
      const activeChapter = snapshot.activeChapter || config.chapters[0];
      const preset = activeChapter.scene?.preset || "particle-field";
      const local = snapshot.local;
      const cinematicPaths = {
        "particle-field": { x: -0.2 + local * 0.25, y: 0.02, z: 5.8 - local * 1.05, lookX: 0.42, lookY: 0.02, lookZ: -1.5 },
        "ai-era-sphere": { x: 0.05 + local * 0.34, y: -0.02 - local * 0.08, z: 5.8 - local * 1.25, lookX: 0.14, lookY: -0.02, lookZ: -2.55 },
        "researched-3d-subject": { x: 0.04 + local * 0.22, y: -0.03 - local * 0.05, z: 5.72 - local * 1.08, lookX: 0.08, lookY: -0.08, lookZ: -2.72 },
        "video-composite": { x: 0.24 + local * 0.42, y: -0.02, z: 5.15 - local * 0.95, lookX: 1.36, lookY: -0.02, lookZ: -2.9 },
        "product-orbit": { x: 0.42 + local * 0.18, y: 0.02, z: 5.15 - local * 0.92, lookX: 0.96, lookY: 0, lookZ: -2.6 },
        "depth-composite": { x: 0.36 + local * 0.36, y: -0.02, z: 5.28 - local * 0.86, lookX: 1.28, lookY: -0.03, lookZ: -3.0 },
        "distorted-media-plane": { x: 0.34 + local * 0.42, y: -0.04, z: 5.35 - local * 0.7, lookX: 0.92, lookY: -0.04, lookZ: -2.9 },
        "gallery-scroll-sync": { x: -0.18 + local * 0.76, y: 0.02, z: 5.6 - local * 0.5, lookX: 0.52, lookY: 0, lookZ: -2.8 },
        "modular-interface": { x: 0.28 + local * 0.26, y: 0.02, z: 5.25 - local * 0.75, lookX: 0.82, lookY: -0.02, lookZ: -2.55 },
        "light-ribbon": { x: -0.36 + local * 0.5, y: 0.04, z: 5.55 - local * 0.68, lookX: 0.36, lookY: 0, lookZ: -2.6 },
        "portal-transition": { x: 0.18 + local * 0.36, y: 0, z: 5.35 - local * 1.45, lookX: 1.12, lookY: 0, lookZ: -3.1 }
      };
      const path = cinematicPaths[preset] || cinematicPaths["particle-field"];
      const zoom = snapshot.zoom || 0;
      const zoomFocus = (preset === "ai-era-sphere" || preset === "researched-3d-subject") ? zoom : 0;
      const targetFov = 45 - zoomFocus * 12;
      if (Math.abs(camera.fov - targetFov) > 0.01) {
        camera.fov += (targetFov - camera.fov) * 0.08;
        camera.updateProjectionMatrix();
      }
      camera.position.x += (path.x + snapshot.pointer.x * (0.12 + zoomFocus * 0.08) - camera.position.x) * 0.08;
      camera.position.y += (path.y - snapshot.pointer.y * (0.08 + zoomFocus * 0.06) - camera.position.y) * 0.08;
      camera.position.z += (path.z - zoomFocus * 2.65 - camera.position.z) * 0.08;
      camera.lookAt(
        path.lookX + snapshot.pointer.x * (0.04 + zoomFocus * 0.04),
        path.lookY - snapshot.pointer.y * (0.035 + zoomFocus * 0.03),
        path.lookZ + zoomFocus * 0.28
      );

      keyLight.position.x = 1.6 + Math.sin(time * 0.21 + snapshot.progress * 2.4) * 0.65;
      keyLight.position.y = 2.1 + Math.cos(time * 0.17) * 0.32;
      keyLight.intensity = 15 + Math.sin(snapshot.progress * Math.PI) * 11;
      rimLight.position.x = -2.3 + Math.cos(time * 0.19) * 0.6;
      rimLight.intensity = 5 + local * 7;

      presetObjects.forEach((entry) => {
        const rawPhase = snapshot.phases[entry.id] || 0;
        const visiblePhase = entry.id === snapshot.activeChapterId ? Math.max(rawPhase, 0.42) : rawPhase;
        entry.update({
          phase: visiblePhase,
          local: entry.id === snapshot.activeChapterId ? snapshot.local : 0,
          pointer: snapshot.pointer,
          progress: snapshot.progress,
          zoom: snapshot.zoom,
          time
        });
      });

      renderer.render(scene, camera);
    }
  };
}

