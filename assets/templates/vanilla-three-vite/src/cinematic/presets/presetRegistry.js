export function createPresetObjects(THREE, config) {
  return config.chapters.map((chapter, index) => {
    const preset = chapter.scene?.preset;
    if (preset === "modular-interface") return createModularInterface(THREE, chapter, index, config);
    if (preset === "portal-transition") return createPortalTransition(THREE, chapter, index, config);
    if (preset === "light-ribbon") return createLightRibbon(THREE, chapter, index, config);
    if (preset === "ai-era-sphere") return createAiEraSphere(THREE, chapter, index, config);
    if (preset === "researched-3d-subject") return createResearchedSubjectHero(THREE, chapter, index, config);
    if (preset === "video-composite") return createVideoComposite(THREE, chapter, index, config);
    if (preset === "depth-composite") return createDepthComposite(THREE, chapter, index, config);
    if (preset === "distorted-media-plane") return createDistortedMediaPlane(THREE, chapter, index, config);
    if (preset === "gallery-scroll-sync") return createGalleryScrollSync(THREE, chapter, index, config);
    if (preset === "product-orbit") return createProductOrbit(THREE, chapter, index, config);
    return createParticleField(THREE, chapter, index, config);
  });
}

function material(THREE, color, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

function hashSeed(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeMediaSources(scene) {
  const media = scene?.media;
  if (!Array.isArray(media)) return [];
  return media
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") return item.src || item.url;
      return "";
    })
    .filter(Boolean);
}

function createInterfaceTexture(THREE, colorA, colorB, seed) {
  const width = 96;
  const height = 56;
  const random = seededRandom(seed);
  const data = new Uint8Array(width * height * 4);
  const rows = [8, 16, 27, 38, 47];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const vignette = 1 - Math.min(1, Math.hypot((x / width - 0.5) * 1.2, (y / height - 0.5) * 1.6));
      const scan = rows.some((row) => Math.abs(y - row) <= 1 && x > 10 && x < 84) ? 0.58 : 0;
      const card = ((x > 16 && x < 44 && y > 15 && y < 34) || (x > 52 && x < 82 && y > 24 && y < 44)) ? 0.42 : 0;
      const pulse = random() > 0.992 ? 0.5 : 0;
      const mixValue = x / width;
      const color = colorA.clone().lerp(colorB, mixValue * 0.8 + scan * 0.2);
      const energy = Math.min(1, 0.08 + vignette * 0.16 + scan + card + pulse);
      data[idx] = Math.floor(color.r * 255 * energy);
      data[idx + 1] = Math.floor(color.g * 255 * energy);
      data[idx + 2] = Math.floor(color.b * 255 * energy);
      data[idx + 3] = Math.floor(255 * Math.min(0.86, 0.28 + energy));
    }
  }
  const texture = new THREE.DataTexture(data, width, height);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createNebulaTexture(THREE, colorA, colorB, colorC, seed) {
  if (typeof document === "undefined") return createInterfaceTexture(THREE, colorA, colorB, seed);
  const random = seededRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const base = ctx.createRadialGradient(170, 145, 10, 256, 256, 290);
  base.addColorStop(0, "rgba(255,244,215,0.84)");
  base.addColorStop(0.18, "rgba(255,190,90,0.42)");
  base.addColorStop(0.38, "rgba(4,12,18,0.94)");
  base.addColorStop(0.62, "rgba(2,5,10,0.96)");
  base.addColorStop(0.82, "rgba(47,231,255,0.62)");
  base.addColorStop(1, "rgba(255,91,76,0.34)");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  ctx.globalCompositeOperation = "lighter";
  const palette = [
    colorA,
    colorB,
    colorC,
    new THREE.Color("#ff5b6e"),
    new THREE.Color("#8b5cff"),
    new THREE.Color("#44ffbb")
  ];
  for (let i = 0; i < 120; i += 1) {
    const color = palette[i % palette.length];
    const x = 80 + random() * 360;
    const y = 65 + random() * 390;
    const radius = 18 + random() * 86;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${Math.floor(color.r * 255)},${Math.floor(color.g * 255)},${Math.floor(color.b * 255)},${0.1 + random() * 0.22})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 90; i += 1) {
    const color = palette[(i + 2) % palette.length];
    const x = 40 + random() * 430;
    const y = 80 + random() * 360;
    ctx.strokeStyle = `rgba(${Math.floor(color.r * 255)},${Math.floor(color.g * 255)},${Math.floor(color.b * 255)},${0.04 + random() * 0.08})`;
    ctx.lineWidth = 0.8 + random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + (random() - 0.5) * 140,
      y + (random() - 0.5) * 90,
      x + (random() - 0.5) * 240,
      y + (random() - 0.5) * 140,
      x + (random() - 0.5) * 320,
      y + (random() - 0.5) * 190
    );
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createDetailTexture(THREE, seed) {
  const random = seededRandom(seed);
  const size = 160;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4;
      const nx = x / size - 0.5;
      const ny = y / size - 0.5;
      const ring = Math.sin((Math.hypot(nx, ny) * 28 + Math.atan2(ny, nx) * 2.4) * Math.PI);
      const vein = Math.sin((nx * 18 + ny * 9 + Math.sin(ny * 18) * 0.8) * Math.PI);
      const grain = random() * 0.28;
      const value = Math.max(0, Math.min(1, 0.44 + ring * 0.16 + vein * 0.12 + grain));
      const luma = Math.floor(value * 255);
      data[i] = luma;
      data[i + 1] = luma;
      data[i + 2] = luma;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.4, 2.4);
  texture.needsUpdate = true;
  return texture;
}

function createAiEraSphere(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const root = new THREE.Group();
  const colorA = new THREE.Color(chapter.scene?.color || config.theme?.color || "#76d8ff");
  const colorB = new THREE.Color(chapter.scene?.accent || config.theme?.accent || "#fff4d7");
  const colorC = new THREE.Color(chapter.scene?.hot || "#ff5b4c");
  const random = seededRandom(hashSeed(`${chapter.id}:${index}:ai-era-sphere`));
  const nebulaTexture = createNebulaTexture(THREE, colorA, colorB, colorC, hashSeed(`${chapter.id}:nebula`));
  const detailTexture = createDetailTexture(THREE, hashSeed(`${chapter.id}:surface-detail`));

  const coreGroup = new THREE.Group();
  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#081019"),
    map: nebulaTexture,
    bumpMap: detailTexture,
    roughnessMap: detailTexture,
    bumpScale: 0.028,
    emissive: colorA,
    emissiveIntensity: 0.32,
    roughness: 0.18,
    metalness: 0.42,
    clearcoat: 0.62,
    clearcoatRoughness: 0.16,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 96, 64), coreMaterial);
  coreGroup.add(core);

  const referenceSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.36, 96, 64),
    new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  coreGroup.add(referenceSphere);

  const motionTexture = nebulaTexture.clone();
  motionTexture.needsUpdate = true;
  const motionSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.39, 96, 64),
    new THREE.MeshBasicMaterial({
      map: motionTexture,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  coreGroup.add(motionSphere);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.52, 64, 44),
    material(THREE, colorA, 0.08)
  );
  atmosphere.material.side = THREE.BackSide;
  coreGroup.add(atmosphere);

  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.72, 48, 32),
    material(THREE, colorB, 0.055)
  );
  innerGlow.material.side = THREE.BackSide;
  coreGroup.add(innerGlow);

  const scanRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.66, 0.006, 8, 220),
    material(THREE, colorA, 0.12)
  );
  scanRing.rotation.x = Math.PI * 0.5;
  coreGroup.add(scanRing);

  const surfaceCount = chapter.scene?.surfaceDots || 420;
  const surfacePositions = new Float32Array(surfaceCount * 3);
  const surfaceColors = new Float32Array(surfaceCount * 3);
  const palette = [colorA, colorB, colorC, new THREE.Color("#8b5cff"), new THREE.Color("#44ffbb")];
  for (let i = 0; i < surfaceCount; i += 1) {
    const cluster = i % 4;
    const baseTheta = [-0.28, 0.34, 2.84, -2.12][cluster];
    const baseY = [-0.52, 0.34, -0.05, 0.68][cluster];
    const theta = baseTheta + (random() - 0.5) * 1.1;
    const y = baseY + (random() - 0.5) * 0.5;
    const radiusAtY = Math.sqrt(Math.max(0.05, 1 - Math.min(0.96, y * y)));
    const radius = 1.48 + Math.pow(random(), 1.8) * 0.42;
    surfacePositions[i * 3] = Math.cos(theta) * radius * radiusAtY;
    surfacePositions[i * 3 + 1] = y * 1.18;
    surfacePositions[i * 3 + 2] = Math.sin(theta) * radius * radiusAtY * 0.82;
    const color = palette[(cluster + i) % palette.length];
    surfaceColors[i * 3] = color.r;
    surfaceColors[i * 3 + 1] = color.g;
    surfaceColors[i * 3 + 2] = color.b;
  }
  const surfaceGeometry = new THREE.BufferGeometry();
  surfaceGeometry.setAttribute("position", new THREE.BufferAttribute(surfacePositions, 3));
  surfaceGeometry.setAttribute("color", new THREE.BufferAttribute(surfaceColors, 3));
  const surfaceDots = new THREE.Points(surfaceGeometry, new THREE.PointsMaterial({
    size: 0.026,
    vertexColors: true,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  coreGroup.add(surfaceDots);

  const closeDetailCount = chapter.scene?.closeDetailParticles || 720;
  const closePositions = new Float32Array(closeDetailCount * 3);
  const closeColors = new Float32Array(closeDetailCount * 3);
  for (let i = 0; i < closeDetailCount; i += 1) {
    const theta = -0.9 + random() * 1.8;
    const y = -0.78 + random() * 1.56;
    const radiusAtY = Math.sqrt(Math.max(0.08, 1 - Math.min(0.92, y * y)));
    const radius = 1.61 + Math.pow(random(), 2.2) * 0.12;
    closePositions[i * 3] = Math.cos(theta) * radius * radiusAtY;
    closePositions[i * 3 + 1] = y;
    closePositions[i * 3 + 2] = Math.sin(theta) * radius * radiusAtY + 0.18;
    const color = palette[(i + Math.floor(i / 11)) % palette.length];
    closeColors[i * 3] = color.r;
    closeColors[i * 3 + 1] = color.g;
    closeColors[i * 3 + 2] = color.b;
  }
  const closeGeometry = new THREE.BufferGeometry();
  closeGeometry.setAttribute("position", new THREE.BufferAttribute(closePositions, 3));
  closeGeometry.setAttribute("color", new THREE.BufferAttribute(closeColors, 3));
  const closeSurface = new THREE.Points(closeGeometry, new THREE.PointsMaterial({
    size: 0.012,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  coreGroup.add(closeSurface);

  const lensRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.004, 8, 240),
    material(THREE, colorB, 0)
  );
  lensRing.rotation.x = Math.PI * 0.5;
  coreGroup.add(lensRing);

  const filamentGroup = new THREE.Group();
  for (let i = 0; i < 26; i += 1) {
    const points = [];
    const start = random() * Math.PI * 2;
    const latitude = -0.7 + random() * 1.4;
    const arc = 0.65 + random() * 1.6;
    for (let step = 0; step < 28; step += 1) {
      const t = step / 27;
      const theta = start + t * arc;
      const y = latitude + Math.sin(t * Math.PI + i) * 0.16;
      const r = 1.56 + Math.sin(t * Math.PI) * (0.08 + random() * 0.08);
      points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r * 0.78));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: i % 3 === 0 ? colorB : i % 3 === 1 ? colorA : colorC,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    filamentGroup.add(line);
  }
  coreGroup.add(filamentGroup);

  const haloCount = chapter.scene?.haloParticles || 980;
  const haloPositions = new Float32Array(haloCount * 3);
  const haloColors = new Float32Array(haloCount * 3);
  for (let i = 0; i < haloCount; i += 1) {
    const theta = random() * Math.PI * 2;
    const radius = 1.95 + Math.pow(random(), 1.6) * 2.65;
    const band = (random() - 0.5) * 1.55;
    haloPositions[i * 3] = Math.cos(theta) * radius;
    haloPositions[i * 3 + 1] = band + Math.sin(theta * 1.7) * 0.34;
    haloPositions[i * 3 + 2] = Math.sin(theta) * radius * (0.44 + random() * 0.25);
    const color = palette[i % palette.length];
    haloColors[i * 3] = color.r;
    haloColors[i * 3 + 1] = color.g;
    haloColors[i * 3 + 2] = color.b;
  }
  const haloGeometry = new THREE.BufferGeometry();
  haloGeometry.setAttribute("position", new THREE.BufferAttribute(haloPositions, 3));
  haloGeometry.setAttribute("color", new THREE.BufferAttribute(haloColors, 3));
  const sphereParticleHalo = new THREE.Points(haloGeometry, new THREE.PointsMaterial({
    size: 0.021,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  root.add(sphereParticleHalo);

  const streamGroup = new THREE.Group();
  const streamMaterial = new THREE.LineBasicMaterial({
    color: colorA,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  for (let row = -5; row <= 5; row += 1) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-5.2, row * 0.34, -1.9),
      new THREE.Vector3(5.2, row * 0.34, -1.9)
    ]);
    streamGroup.add(new THREE.Line(geometry, streamMaterial.clone()));
  }
  root.add(streamGroup);

  const moduleGroup = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.94 + (i % 2) * 0.28, 0.13, 0.48),
      new THREE.MeshPhysicalMaterial({
        color: i % 2 ? colorB : colorA,
        emissive: i % 2 ? colorB : colorA,
        emissiveIntensity: 0.22,
        roughness: 0.26,
        metalness: 0.16,
        transparent: true,
        opacity: 0.24,
        depthWrite: false
      })
    );
    mesh.position.set(i % 2 === 0 ? -1.95 : 1.95, 1.05 - Math.floor(i / 2) * 0.82, -1.35);
    moduleGroup.add(mesh);
  }
  root.add(moduleGroup);

  const portalGroup = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.28 + i * 0.3, 0.0065, 8, 180),
      material(THREE, i % 2 ? colorB : colorA, 0.11 + i * 0.016)
    );
    ring.position.z = -0.26 * i;
    portalGroup.add(ring);
  }
  root.add(portalGroup);

  coreGroup.position.z = -0.35;
  root.add(coreGroup);
  group.add(root);
  group.position.set(0.18, 0.02, -2.2);

  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time, progress, zoom = 0 }) {
      group.visible = phase > 0.001;
      const energy = Math.sin(phase * Math.PI);
      const zoomEase = zoom * zoom * (3 - 2 * zoom);
      const interfacePhase = local;
      const modulePhase = Math.max(0, Math.sin(Math.max(0, local - 0.38) / 0.38 * Math.PI));
      const portalPhase = Math.max(0, (local - 0.76) / 0.24);
      const pulse = Math.sin(time * 1.2);

      group.rotation.y = progress * 0.85 + pointer.x * (0.08 + zoomEase * 0.08);
      group.rotation.x = -pointer.y * (0.04 + zoomEase * 0.06);
      group.position.z = -2.2 - local * 0.55 + zoomEase * 0.48;
      group.position.x = 0.18 - pointer.x * zoomEase * 0.16;
      group.position.y = 0.02 + pointer.y * zoomEase * 0.12;
      root.rotation.y = local * 0.62 + time * 0.02;

      core.rotation.x = Math.sin(time * 0.32) * 0.18 + pointer.y * 0.08;
      core.rotation.y = time * 0.48 + local * 1.18 + pointer.x * 0.14;
      referenceSphere.rotation.y = -time * 0.16 + local * 0.25;
      motionSphere.rotation.y = time * 0.22 + local * 0.55;
      atmosphere.rotation.y = time * 0.62 + local * 0.74;
      atmosphere.rotation.x = 0.16 + Math.sin(time * 0.3) * 0.08;
      motionTexture.offset.x = (time * 0.035 + local * 0.18) % 1;
      motionTexture.offset.y = Math.sin(time * 0.25) * 0.025;

      detailTexture.offset.x = (time * 0.012 + pointer.x * 0.02) % 1;
      detailTexture.offset.y = (time * 0.008 - pointer.y * 0.02) % 1;

      const coreScale = 1.08 + energy * 0.24 - interfacePhase * 0.08 + portalPhase * 0.1 + zoomEase * 0.2 + pulse * 0.012;
      coreGroup.scale.setScalar(coreScale);
      referenceSphere.scale.setScalar(1.02 + pulse * 0.012 + interfacePhase * 0.025);
      motionSphere.scale.setScalar(1.03 + pulse * 0.018 + interfacePhase * 0.035);
      coreMaterial.bumpScale = 0.024 + zoomEase * 0.06;
      coreMaterial.roughness = 0.2 - zoomEase * 0.07;
      coreMaterial.metalness = 0.38 + zoomEase * 0.18;
      coreMaterial.emissiveIntensity = 0.28 + energy * 0.16 + zoomEase * 0.22;
      coreMaterial.opacity = (0.42 + Math.abs(pulse) * 0.06 + energy * 0.24 + zoomEase * 0.08) * (1 - portalPhase * 0.18);
      referenceSphere.material.opacity = (0.34 + Math.abs(pulse) * 0.08 + energy * 0.2) * (1 - portalPhase * 0.12);
      motionSphere.material.opacity = (0.16 + Math.abs(pulse) * 0.08 + interfacePhase * 0.12) * energy;
      atmosphere.material.opacity = (0.05 + Math.abs(pulse) * 0.028 + interfacePhase * 0.055) * energy;
      innerGlow.scale.setScalar(1 + pulse * 0.08 + interfacePhase * 0.1);
      innerGlow.material.opacity = (0.035 + Math.abs(pulse) * 0.035 + interfacePhase * 0.05) * energy;
      scanRing.rotation.z = time * 0.18;
      scanRing.material.opacity = (0.028 + Math.abs(pulse) * 0.04) * energy;
      closeSurface.material.opacity = zoomEase * (0.12 + energy * 0.34);
      closeSurface.material.size = 0.01 + zoomEase * 0.018;
      closeSurface.rotation.y = time * 0.34 + pointer.x * 0.06;
      lensRing.scale.setScalar(1 + zoomEase * 0.16 + pulse * 0.02);
      lensRing.material.opacity = zoomEase * energy * 0.16;

      filamentGroup.rotation.y = -time * 0.14 + pointer.x * 0.04;
      filamentGroup.rotation.x = Math.sin(time * 0.14) * 0.05 + pointer.y * 0.035;
      filamentGroup.children.forEach((line, i) => {
        line.material.opacity = (0.06 + (i % 5) * 0.018 + interfacePhase * 0.05) * energy;
      });
      surfaceDots.rotation.y = time * 0.42 + local * 0.85;
      surfaceDots.rotation.x = Math.sin(time * 0.24) * 0.12 + pointer.y * 0.04;
      surfaceDots.material.opacity = (0.34 + Math.abs(pulse) * 0.1 + modulePhase * 0.08) * energy;
      sphereParticleHalo.rotation.y = -0.22 + local * 0.34 + pointer.x * 0.05;
      sphereParticleHalo.rotation.x = -0.08 + Math.sin(time * 0.18) * 0.06 + pointer.y * 0.04;
      sphereParticleHalo.rotation.z = -time * 0.19;
      sphereParticleHalo.material.opacity = (0.42 + Math.abs(pulse) * 0.18 + modulePhase * 0.14) * energy;
      sphereParticleHalo.material.size = 0.016 + modulePhase * 0.006 + portalPhase * 0.004;

      streamGroup.position.z = -2.25 + interfacePhase * 1.6;
      streamGroup.position.x = -0.72 + interfacePhase * 0.86;
      streamGroup.rotation.z = -0.16 + local * 0.32;
      streamGroup.children.forEach((line, i) => {
        line.material.opacity = interfacePhase * (0.04 + (i % 3) * 0.018) * (1 - portalPhase * 0.7) * energy;
        line.position.x = Math.sin(time * 0.52 + i) * 0.18;
      });

      moduleGroup.visible = modulePhase > 0.02;
      moduleGroup.position.z = -0.9 + modulePhase * 0.66;
      moduleGroup.rotation.y = -0.22 + pointer.x * 0.08;
      moduleGroup.children.forEach((mesh, i) => {
        const focus = i === Math.floor(local * 10) % moduleGroup.children.length;
        mesh.material.opacity = modulePhase * (focus ? 0.62 : 0.24);
        mesh.scale.setScalar(focus ? 1.22 : 1);
        mesh.position.z = -1.35 + modulePhase * 0.5 + (focus ? 0.2 : 0);
        mesh.rotation.y = focus ? Math.sin(time * 1.4) * 0.15 : 0;
      });

      portalGroup.visible = portalPhase > 0.02;
      portalGroup.scale.setScalar(0.54 + portalPhase * 1.35);
      portalGroup.rotation.z = time * 0.12;
      portalGroup.children.forEach((ring, i) => {
        ring.material.opacity = portalPhase * energy * (0.04 + i * 0.024);
        ring.rotation.z = time * 0.07 * (i + 1);
      });
    }
  };
}

function loadGltfSubjectModel(THREE, modelUrl) {
  return import("three/addons/loaders/GLTFLoader.js").then(({ GLTFLoader }) => new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(modelUrl, resolve, undefined, reject);
  }));
}

function createBuildingMaterial(THREE, color, options = {}) {
  const material = new THREE.MeshStandardMaterial({
    color,
    map: options.map || null,
    bumpMap: options.bumpMap || null,
    roughnessMap: options.roughnessMap || null,
    bumpScale: options.bumpScale ?? 0,
    emissive: options.emissive || color,
    emissiveIntensity: options.emissiveIntensity ?? 0.06,
    roughness: options.roughness ?? 0.42,
    metalness: options.metalness ?? 0.18,
    transparent: options.transparent ?? true,
    opacity: options.opacity ?? 0.94
  });
  if (options.normalScale && material.normalScale) material.normalScale.setScalar(options.normalScale);
  return material;
}

function addWindowBand(THREE, group, width, zDepth, y, color, opacity = 0.72) {
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const count = 5;
  for (let i = 0; i < count; i += 1) {
    const x = (i - (count - 1) / 2) * (width / count) * 0.72;
    const front = new THREE.Mesh(new THREE.BoxGeometry(width * 0.08, 0.055, 0.012), mat.clone());
    front.position.set(x, y, zDepth / 2 + 0.012);
    group.add(front);
    const back = front.clone();
    back.position.z = -zDepth / 2 - 0.012;
    group.add(back);
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.055, width * 0.07), mat.clone());
    left.position.set(-width / 2 - 0.012, y, x * 0.72);
    group.add(left);
    const right = left.clone();
    right.position.x = width / 2 + 0.012;
    group.add(right);
  }
}

function addUpturnedRoofCorners(THREE, group, width, depth, y, roofColor, goldColor) {
  const cornerMat = material(THREE, roofColor, 0.42);
  const goldMat = material(THREE, goldColor, 0.5);
  const corners = [
    [-1, -1], [1, -1], [-1, 1], [1, 1]
  ];
  corners.forEach(([sx, sz], i) => {
    const corner = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.036, 0.08), cornerMat.clone());
    corner.position.set(sx * width * 0.47, y + 0.04, sz * depth * 0.47);
    corner.rotation.set(0, sx * sz * 0.35, sx * 0.3);
    group.add(corner);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), goldMat.clone());
    bead.position.set(sx * width * 0.55, y + 0.085, sz * depth * 0.55);
    group.add(bead);
    bead.userData.sparkIndex = i;
  });
}

function addRoofTileLines(THREE, group, width, depth, y, roofColor, goldColor) {
  const tileMat = new THREE.MeshBasicMaterial({
    color: roofColor,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ridgeMat = createBuildingMaterial(THREE, goldColor, { emissive: goldColor, emissiveIntensity: 0.22, roughness: 0.28, metalness: 0.5 });
  for (let i = -5; i <= 5; i += 1) {
    const x = i * width * 0.086;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.012, depth * 0.94), tileMat.clone());
    strip.position.set(x, y + 0.036, 0);
    group.add(strip);
  }
  for (let i = -3; i <= 3; i += 1) {
    const z = i * depth * 0.12;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.011, 0.008), tileMat.clone());
    strip.position.set(0, y + 0.04, z);
    group.add(strip);
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(width * 0.7, 0.026, 0.034), ridgeMat);
  ridge.position.set(0, y + 0.105, 0);
  group.add(ridge);
}

function addColumnArcade(THREE, group, width, depth, y, height, columnMat, goldMat) {
  const count = 6;
  const capGeo = new THREE.BoxGeometry(0.07, 0.022, 0.07);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < count; i += 1) {
      const x = (i - (count - 1) / 2) * width * 0.13;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, height * 0.92, 14), columnMat.clone());
      col.position.set(x, y, side * depth * 0.37);
      group.add(col);
      const capTop = new THREE.Mesh(capGeo, goldMat.clone());
      capTop.position.set(x, y + height * 0.46, side * depth * 0.37);
      group.add(capTop);
      const capBottom = capTop.clone();
      capBottom.position.y = y - height * 0.46;
      group.add(capBottom);
    }
  }
}

function addBalustrade(THREE, group, width, depth, y, goldMat) {
  const railMat = goldMat.clone();
  const frontBack = new THREE.BoxGeometry(width * 0.86, 0.018, 0.018);
  const sideRail = new THREE.BoxGeometry(0.018, 0.018, depth * 0.74);
  for (let side = -1; side <= 1; side += 2) {
    const rail = new THREE.Mesh(frontBack, railMat.clone());
    rail.position.set(0, y, side * depth * 0.42);
    group.add(rail);
    const sidePiece = new THREE.Mesh(sideRail, railMat.clone());
    sidePiece.position.set(side * width * 0.43, y, 0);
    group.add(sidePiece);
  }
  for (let i = -4; i <= 4; i += 1) {
    const x = i * width * 0.095;
    for (let side = -1; side <= 1; side += 2) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.08, 0.014), railMat.clone());
      post.position.set(x, y - 0.035, side * depth * 0.42);
      group.add(post);
    }
  }
}

function addWindowLattice(THREE, group, width, depth, y, color, trimColor) {
  const glassMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const trimMat = createBuildingMaterial(THREE, trimColor, { emissive: trimColor, emissiveIntensity: 0.11, roughness: 0.36, metalness: 0.28 });
  const count = 6;
  const paneW = width * 0.075;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < count; i += 1) {
      const x = (i - (count - 1) / 2) * width * 0.102;
      const pane = new THREE.Mesh(new THREE.BoxGeometry(paneW, 0.068, 0.012), glassMat.clone());
      pane.position.set(x, y, side * (depth * 0.37 + 0.014));
      group.add(pane);
      const top = new THREE.Mesh(new THREE.BoxGeometry(paneW + 0.022, 0.008, 0.016), trimMat.clone());
      top.position.set(x, y + 0.042, side * (depth * 0.37 + 0.018));
      group.add(top);
      const bottom = top.clone();
      bottom.position.y = y - 0.042;
      group.add(bottom);
      const mid = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.074, 0.017), trimMat.clone());
      mid.position.set(x, y, side * (depth * 0.37 + 0.02));
      group.add(mid);
    }
  }
}

function createYellowCraneTowerProcedural(THREE, scene, config, colorA, colorB) {
  const tower = new THREE.Group();
  tower.userData.realismMode = "architectural-procedural-v2";
  const wallDetail = createDetailTexture(THREE, hashSeed(`${scene.landmark || "subject"}:wall-plaster`));
  const roofDetail = createDetailTexture(THREE, hashSeed(`${scene.landmark || "subject"}:roof-tiles`));
  const stoneDetail = createDetailTexture(THREE, hashSeed(`${scene.landmark || "subject"}:stone-base`));
  const roofTileColor = scene.roofTileColor || scene.roofColor || "#9a672d";
  const eaveShadowColor = scene.roofEdgeColor || "#173932";
  const wallMat = createBuildingMaterial(THREE, scene.wallColor || "#c9ad7a", { bumpMap: wallDetail, roughnessMap: wallDetail, bumpScale: 0.018, emissive: "#5c3d18", emissiveIntensity: 0.05, roughness: 0.64, metalness: 0.06 });
  const roofMat = createBuildingMaterial(THREE, roofTileColor, { bumpMap: roofDetail, roughnessMap: roofDetail, bumpScale: 0.026, emissive: "#8a4f1d", emissiveIntensity: 0.1, roughness: 0.5, metalness: 0.18 });
  const eaveMat = createBuildingMaterial(THREE, eaveShadowColor, { emissive: "#06231f", emissiveIntensity: 0.12, roughness: 0.42, metalness: 0.22 });
  const columnMat = createBuildingMaterial(THREE, scene.columnColor || "#8d2420", { emissive: "#42100d", emissiveIntensity: 0.08, roughness: 0.46, metalness: 0.16 });
  const goldMat = createBuildingMaterial(THREE, scene.goldColor || "#f0c46c", { emissive: "#f7b65f", emissiveIntensity: 0.18, roughness: 0.24, metalness: 0.42 });
  const baseMat = createBuildingMaterial(THREE, scene.stoneColor || "#5f6667", { bumpMap: stoneDetail, roughnessMap: stoneDetail, bumpScale: 0.02, emissive: "#1a2022", emissiveIntensity: 0.04, roughness: 0.82, metalness: 0.04 });

  for (let i = 0; i < 5; i += 1) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.74 - i * 0.22, 0.06, 1.92 - i * 0.13), baseMat.clone());
    step.position.y = -1.36 + i * 0.062;
    step.position.z = 0.04 - i * 0.01;
    tower.add(step);
  }
  const lower = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.18, 1.24), baseMat.clone());
  lower.position.y = -1.02;
  tower.add(lower);

  const levels = scene.levels || 5;
  for (let level = 0; level < levels; level += 1) {
    const t = level / Math.max(1, levels - 1);
    const width = 1.96 - t * 0.72;
    const depth = 1.2 - t * 0.44;
    const bodyHeight = 0.31 - t * 0.014;
    const y = -0.78 + level * 0.42;

    const body = new THREE.Mesh(new THREE.BoxGeometry(width * 0.76, bodyHeight, depth * 0.72), wallMat.clone());
    body.position.y = y;
    tower.add(body);
    const shadowPanel = new THREE.Mesh(new THREE.BoxGeometry(width * 0.78, bodyHeight * 0.96, 0.018), new THREE.MeshBasicMaterial({
      color: "#0b1412",
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    }));
    shadowPanel.position.set(0, y, -depth * 0.37);
    tower.add(shadowPanel);

    const balcony = new THREE.Mesh(new THREE.BoxGeometry(width * 0.96, 0.045, depth * 0.92), goldMat.clone());
    balcony.position.y = y - bodyHeight * 0.42;
    tower.add(balcony);
    addBalustrade(THREE, tower, width, depth, y - bodyHeight * 0.25, goldMat);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.75, 0.24 - t * 0.01, 4), roofMat.clone());
    roof.rotation.y = Math.PI / 4;
    roof.scale.z = depth / width;
    roof.position.y = y + bodyHeight * 0.62;
    tower.add(roof);

    const eave = new THREE.Mesh(new THREE.BoxGeometry(width * 1.18, 0.044, depth * 1.14), eaveMat.clone());
    eave.position.y = y + bodyHeight * 0.3;
    tower.add(eave);
    const tileLip = new THREE.Mesh(new THREE.BoxGeometry(width * 1.06, 0.026, depth * 1.02), roofMat.clone());
    tileLip.position.y = y + bodyHeight * 0.36;
    tower.add(tileLip);
    addRoofTileLines(THREE, tower, width, depth, y + bodyHeight * 0.37, roofTileColor, scene.goldColor || "#f0c46c");
    addUpturnedRoofCorners(THREE, tower, width, depth, y + bodyHeight * 0.38, eaveShadowColor, scene.goldColor || "#f0c46c");

    const columnInsetX = width * 0.34;
    const columnInsetZ = depth * 0.28;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, bodyHeight * 0.9, 12), columnMat.clone());
      col.position.set(sx * columnInsetX, y, sz * columnInsetZ);
      tower.add(col);
    });
    addColumnArcade(THREE, tower, width, depth, y - bodyHeight * 0.03, bodyHeight * 0.86, columnMat, goldMat);
    addWindowBand(THREE, tower, width * 0.56, depth * 0.52, y + 0.02, scene.windowGlow || colorB, 0.5 + t * 0.12);
    addWindowLattice(THREE, tower, width * 0.72, depth * 0.72, y + 0.02, scene.windowGlow || colorB, scene.goldColor || "#f0c46c");
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.32, 16), goldMat.clone());
  neck.position.y = 1.32;
  tower.add(neck);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), goldMat.clone());
  finial.position.y = 1.52;
  tower.add(finial);
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.36, 16), goldMat.clone());
  needle.position.y = 1.76;
  tower.add(needle);

  const riverMat = new THREE.MeshBasicMaterial({
    color: scene.riverColor || colorA,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const river = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.1, 16, 4), riverMat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, -1.32, 0.12);
  tower.add(river);

  const ringMat = new THREE.LineBasicMaterial({ color: colorA, transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 5; i += 1) {
    const curve = new THREE.EllipseCurve(0, 0, 1.2 + i * 0.32, 0.28 + i * 0.08, 0, Math.PI * 2);
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(curve.getPoints(150)), ringMat.clone());
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.25 + i * 0.008;
    ring.position.z = -0.06 - i * 0.05;
    tower.add(ring);
  }

  return tower;
}

function normalizeRealismImageSources(scene) {
  const buckets = [scene?.realismImages, scene?.referenceImages, scene?.canvaAssets, scene?.photoSet, scene?.photos];
  const normalized = [];
  buckets.forEach((bucket) => {
    if (!bucket) return;
    const list = Array.isArray(bucket) ? bucket : Array.isArray(bucket.images) ? bucket.images : Array.isArray(bucket.exports) ? bucket.exports : [];
    list.forEach((item) => {
      if (typeof item === "string") normalized.push({ src: item });
      else if (item && typeof item === "object") {
        const src = item.src || item.url || item.path || item.asset;
        if (src) normalized.push({ ...item, src });
      }
    });
  });
  return normalized;
}

function createPhotoDepthShader(THREE, texture, colorA, colorB, index) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uZoom: { value: 0 },
      uLayer: { value: index + 1 },
      uColorA: { value: colorA },
      uColorB: { value: colorB },
      uOpacity: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPhase;
      uniform float uZoom;
      uniform float uLayer;
      varying vec2 vUv;
      varying float vDepthShade;
      void main() {
        vUv = uv;
        vec3 p = position;
        float horizontal = (uv.x - 0.5) * 2.0;
        float vertical = (uv.y - 0.5) * 2.0;
        float bend = horizontal * horizontal * (0.045 + uZoom * 0.035);
        p.z += bend + sin((uv.y + uLayer * 0.13) * 8.0 + uTime * 0.7) * 0.012 * uPhase;
        p.x += vertical * horizontal * 0.018 * uPhase;
        vDepthShade = 1.0 - abs(horizontal) * 0.18 - abs(vertical) * 0.08;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uPhase;
      uniform float uZoom;
      uniform float uOpacity;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      varying float vDepthShade;
      void main() {
        vec4 tex = texture2D(uTexture, vUv);
        float edgeX = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x);
        float edgeY = smoothstep(0.0, 0.10, vUv.y) * smoothstep(0.0, 0.10, 1.0 - vUv.y);
        float frame = min(edgeX, edgeY);
        float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        vec3 grade = mix(uColorA, uColorB, smoothstep(0.18, 0.92, luma));
        vec3 color = mix(tex.rgb * (1.04 + uZoom * 0.12), tex.rgb + grade * 0.12, 0.22);
        color *= 0.82 + vDepthShade * 0.28;
        float alpha = tex.a * frame * uOpacity * (0.58 + uPhase * 0.45 + uZoom * 0.24);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

function createPhotoCutoutShader(THREE, texture, colorA, colorB) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uZoom: { value: 0 },
      uColorA: { value: colorA },
      uColorB: { value: colorB }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uZoom;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        float x = (uv.x - 0.5) * 2.0;
        p.z += x * x * (0.035 + uZoom * 0.025);
        p.y += sin((uv.y * 6.0 + uTime * 0.25)) * 0.006;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uOpacity;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      void main() {
        vec4 tex = texture2D(uTexture, vUv);
        float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        float maxRG = max(tex.r, tex.g);
        float sky = smoothstep(0.05, 0.22, tex.b - maxRG) * smoothstep(0.52, 0.78, luma) * smoothstep(0.22, 0.58, vUv.y);
        float foliage = smoothstep(0.04, 0.18, tex.g - tex.r) * smoothstep(0.08, 0.38, 1.0 - vUv.y);
        float paperEdge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(0.0, 0.06, 1.0 - vUv.x) * smoothstep(0.0, 0.05, vUv.y) * smoothstep(0.0, 0.05, 1.0 - vUv.y);
        float subject = 1.0 - clamp(sky * 0.96 + foliage * 0.76, 0.0, 0.98);
        vec3 grade = mix(uColorB, uColorA, smoothstep(0.25, 0.82, luma));
        vec3 color = mix(tex.rgb * 1.1, tex.rgb + grade * 0.08, 0.18);
        gl_FragColor = vec4(color, tex.a * paperEdge * subject * uOpacity);
      }
    `
  });
}

function createImageDepthRotator(THREE, scene, colorA, colorB, fallbackSeed) {
  const images = normalizeRealismImageSources(scene);
  const group = new THREE.Group();
  const loader = images.length && typeof document !== "undefined" ? new THREE.TextureLoader() : null;
  if (loader?.setCrossOrigin) loader.setCrossOrigin("anonymous");
  const cards = [];
  const total = Math.max(images.length, scene?.imageLayers || 0, 3);
  const radius = scene?.imageOrbitRadius || 1.78;
  const fallbackTexture = createInterfaceTexture(THREE, colorA, colorB, fallbackSeed);
  let featuredPhoto = null;
  if (images.length) {
    const source = images[0];
    const height = source.featuredHeight || 1.68;
    const width = height * (source.aspect || 0.75);
    const material = createPhotoCutoutShader(THREE, fallbackTexture, colorA, colorB);
    featuredPhoto = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 32, 18), material);
    featuredPhoto.position.set(-0.5, 0.06, -0.82);
    featuredPhoto.rotation.y = 0.2;
    featuredPhoto.rotation.x = -0.04;
    featuredPhoto.name = "real-photo-model-follow-layer";
    featuredPhoto.userData.source = source.src;
    featuredPhoto.userData.followModel = scene?.photoFollowModel !== false;
    featuredPhoto.userData.role = "featured-real-photo";
    group.add(featuredPhoto);
    const frame = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-width / 2, -height / 2, 0.012),
        new THREE.Vector3(width / 2, -height / 2, 0.012),
        new THREE.Vector3(width / 2, height / 2, 0.012),
        new THREE.Vector3(-width / 2, height / 2, 0.012)
      ]),
      new THREE.LineBasicMaterial({ color: colorB, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    featuredPhoto.add(frame);
    featuredPhoto.userData.frame = frame;
    if (source.src && loader) {
      loader.load(source.src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = source.anisotropy || 8;
        texture.needsUpdate = true;
        material.uniforms.uTexture.value = texture;
      }, undefined, () => {
        featuredPhoto.userData.loadFailed = true;
      });
    }
  }

  for (let i = 0; i < total; i += 1) {
    const item = images[i % Math.max(1, images.length)] || {};
    const aspect = item.aspect || scene?.imageAspect || 1.58;
    const height = item.height || scene?.imageHeight || 0.82;
    const width = height * aspect;
    const shader = createPhotoDepthShader(THREE, fallbackTexture, colorA, colorB, i);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 48, 24), shader);
    const angle = item.angle ?? ((i / total) * Math.PI * 2 + Math.PI * 0.16);
    mesh.position.set(Math.cos(angle) * radius, -0.08 + (i - (total - 1) / 2) * 0.06, Math.sin(angle) * radius * 0.32 - 0.22);
    mesh.rotation.y = -angle + Math.PI * 0.5;
    mesh.rotation.x = -0.04 + (i % 2) * 0.035;
    mesh.userData.baseAngle = angle;
    mesh.userData.radius = radius + (i % 2) * 0.18;
    mesh.userData.depthOffset = i * 0.08;
    mesh.userData.source = item.src || "generated-fallback";
    cards.push(mesh);
    group.add(mesh);

    if (item.src && loader) {
      loader.load(item.src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = item.anisotropy || 8;
        texture.needsUpdate = true;
        shader.uniforms.uTexture.value = texture;
      }, undefined, () => {
        mesh.userData.loadFailed = true;
      });
    }
  }

  const reflection = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.0, 20, 6),
    new THREE.MeshBasicMaterial({
      color: colorA,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  reflection.rotation.x = -Math.PI / 2;
  reflection.position.y = -1.28;
  reflection.position.z = 0.18;
  group.add(reflection);

  return {
    group,
    cards,
    featuredPhoto,
    update({ phase, local, pointer, zoom, time }) {
      const energy = Math.sin(Math.min(1, phase) * Math.PI);
      const rotateSpeed = scene?.imageRotateSpeed ?? 0.12;
      group.visible = phase > 0.001;
      group.rotation.y = time * rotateSpeed + pointer.x * 0.08 + local * 0.28;
      group.position.z = -0.1 + zoom * 0.18;
      if (featuredPhoto) {
        const followsModel = featuredPhoto.userData.followModel === true;
        featuredPhoto.visible = phase > 0.001;
        if (!followsModel) {
          featuredPhoto.position.x = -0.54 + pointer.x * 0.08 + zoom * 0.18;
          featuredPhoto.position.y = 0.02 + Math.sin(time * 0.22) * 0.018;
          featuredPhoto.position.z = -0.86 - zoom * 0.16;
          featuredPhoto.rotation.y = 0.22 + pointer.x * 0.08;
          featuredPhoto.scale.setScalar(1.04 + zoom * 0.16);
        }
        featuredPhoto.material.uniforms.uTime.value = time;
        featuredPhoto.material.uniforms.uZoom.value = zoom;
        featuredPhoto.material.uniforms.uOpacity.value = Math.min(0.68, 0.28 + energy * 0.28 + zoom * 0.12);
        if (featuredPhoto.userData.frame) featuredPhoto.userData.frame.material.opacity = Math.min(0.42, 0.12 + energy * 0.18 + zoom * 0.08);
      }
      cards.forEach((mesh, i) => {
        const angle = mesh.userData.baseAngle + time * rotateSpeed * (0.6 + i * 0.04) + pointer.x * 0.14;
        const radiusNow = mesh.userData.radius - zoom * 0.42;
        mesh.position.x = Math.cos(angle) * radiusNow;
        mesh.position.z = Math.sin(angle) * radiusNow * 0.34 - 0.26 - mesh.userData.depthOffset * 0.08;
        mesh.position.y = -0.12 + Math.sin(time * 0.28 + i) * 0.025 + (i - (cards.length - 1) / 2) * 0.055;
        mesh.rotation.y = -angle + Math.PI * 0.5 + pointer.x * 0.06;
        mesh.rotation.x = -0.05 + pointer.y * 0.04;
        mesh.material.uniforms.uTime.value = time;
        mesh.material.uniforms.uPhase.value = phase;
        mesh.material.uniforms.uZoom.value = zoom;
        mesh.material.uniforms.uOpacity.value = Math.min(0.86, 0.18 + energy * 0.5 + zoom * 0.22);
      });
      reflection.material.opacity = 0.035 + energy * 0.06 + zoom * 0.04;
    }
  };
}
function createSubjectParticleField(THREE, count, colorA, colorB, seed) {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const cA = new THREE.Color(colorA);
  const cB = new THREE.Color(colorB);
  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 1.2 + random() * 2.35;
    const height = -1.2 + random() * 2.9;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius * 0.36 - 1.2 - random() * 0.8;
    const mixed = cA.clone().lerp(cB, random());
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
}

function createResearchedSubjectHero(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const root = new THREE.Group();
  const scene = chapter.scene || {};
  const subject = scene.subject || {};
  const colorA = new THREE.Color(scene.color || config.theme?.color || "#76d8ff");
  const colorB = new THREE.Color(scene.accent || config.theme?.accent || "#fff0b8");
  const modelUrl = scene.modelUrl || scene.model;
  const fallbackAnchor = new THREE.Group();
  const modelAnchor = new THREE.Group();
  const modelPhotoAnchor = new THREE.Group();
  modelPhotoAnchor.name = "model-follow-photo-anchor";
  const loaded = { ready: false, mixer: null };
  const photoRotator = createImageDepthRotator(THREE, scene, colorA, colorB, hashSeed(`${chapter.id}:realism-images`));

  const isYellowCrane = /yellow-crane|黄鹤楼|wuhan/i.test(`${subject.name || ""} ${scene.landmark || ""} ${scene.location || ""}`);
  const procedural = isYellowCrane || scene.architecture === "tiered-pavilion" || scene.subjectType === "landmark" || scene.subjectType === "architecture";
  const fallback = procedural
    ? createYellowCraneTowerProcedural(THREE, scene, config, colorA, colorB)
    : createProductOrbit(THREE, chapter, index, config).object;
  fallbackAnchor.add(fallback);
  if (photoRotator.featuredPhoto && scene.photoFollowModel !== false) {
    const photo = photoRotator.featuredPhoto;
    photoRotator.group.remove(photo);
    photo.userData.followModel = true;
    photo.userData.followTarget = "subject-model-anchor";
    photo.position.set(scene.photoOffsetX ?? -0.16, scene.photoOffsetY ?? 0.03, scene.photoOffsetZ ?? -0.7);
    photo.rotation.set(scene.photoRotationX ?? -0.035, scene.photoRotationY ?? 0.05, scene.photoRotationZ ?? 0);
    photo.scale.setScalar(scene.photoScale ?? 1.02);
    modelPhotoAnchor.add(photo);
  }
  root.add(fallbackAnchor);
  root.add(modelAnchor);
  root.add(modelPhotoAnchor);
  root.add(photoRotator.group);

  if (modelUrl) {
    loadGltfSubjectModel(THREE, modelUrl).then((gltf) => {
      const model = gltf.scene || gltf.scenes?.[0];
      if (!model) return;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      model.position.sub(center);
      model.scale.setScalar((scene.modelScale || 2.25) / maxAxis);
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.castShadow = false;
          child.receiveShadow = false;
          child.material.transparent = child.material.transparent || scene.modelOpacity < 1;
          if (scene.modelOpacity) child.material.opacity = scene.modelOpacity;
          if (child.material.emissive && !scene.keepModelLighting) child.material.emissive.lerp(colorA, 0.08);
        }
      });
      modelAnchor.add(model);
      loaded.ready = true;
      if (gltf.animations?.length) loaded.mixer = new THREE.AnimationMixer(model);
      if (loaded.mixer) gltf.animations.slice(0, 2).forEach((clip) => loaded.mixer.clipAction(clip).play());
    }).catch((error) => {
      console.warn(`[cinematic-site] Could not load researched 3D subject model: ${modelUrl}`, error);
    });
  }

  const particles = createSubjectParticleField(THREE, scene.particles || 520, colorA, colorB, hashSeed(`${chapter.id}:subject-particles`));
  root.add(particles);

  const scanRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.84, 0.006, 8, 180),
    material(THREE, colorA, 0.2)
  );
  scanRing.rotation.x = Math.PI * 0.5;
  scanRing.position.y = -0.68;
  root.add(scanRing);

  group.add(root);
  group.position.set(0.18, -0.08, -2.62);
  root.scale.setScalar(scene.scale || 1.08);

  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, zoom, time }) {
      const energy = Math.sin(Math.min(1, phase) * Math.PI);
      const zoomEase = zoom || 0;
      group.visible = phase > 0.001;
      group.position.x = 0.12 + pointer.x * 0.06;
      group.position.y = -0.12 - zoomEase * 0.12 + Math.sin(time * 0.42) * 0.018;
      group.position.z = -2.72 + zoomEase * 1.08 - local * 0.38;
      root.scale.setScalar((scene.scale || 1.08) * (0.78 + energy * 0.24 + zoomEase * 0.34));
      root.rotation.y = -0.24 + time * 0.075 + pointer.x * (0.18 + zoomEase * 0.12) + local * 0.32;
      root.rotation.x = -0.08 + pointer.y * 0.08 - zoomEase * 0.035;
      fallbackAnchor.visible = !loaded.ready || scene.showProceduralReference === true;
      fallbackAnchor.traverse((child) => {
        if (child.material && "opacity" in child.material) {
          const base = child.isLine ? 0.24 : child.isPoints ? 0.52 : 0.9;
          child.material.opacity = Math.min(base, (loaded.ready ? 0.22 : base) * (0.22 + energy * 0.9));
        }
      });
      modelAnchor.visible = loaded.ready;
      modelAnchor.rotation.y = Math.sin(time * 0.16) * 0.04;
      modelPhotoAnchor.visible = phase > 0.001 && Boolean(photoRotator.featuredPhoto);
      modelPhotoAnchor.rotation.y = loaded.ready ? modelAnchor.rotation.y : 0;
      if (loaded.mixer) loaded.mixer.update(0.016);
      photoRotator.update({ phase, local, pointer, zoom: zoomEase, time });
      particles.rotation.y = -time * 0.08 + pointer.x * 0.08;
      particles.material.opacity = (0.25 + energy * 0.44 + zoomEase * 0.18) * (loaded.ready ? 0.78 : 1);
      scanRing.scale.setScalar(0.86 + energy * 0.12 + zoomEase * 0.28);
      scanRing.rotation.z = time * 0.36;
      scanRing.material.opacity = 0.1 + energy * 0.16 + zoomEase * 0.12;
    }
  };
}
function createParticleField(THREE, chapter, index, config) {
  const count = chapter.scene?.density === "high" ? 860 : chapter.scene?.density === "low" ? 300 : 560;
  const random = seededRandom(hashSeed(`${chapter.id}:${index}:particle-field`));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorA = new THREE.Color(config.theme?.color || "#8cecff");
  const colorB = new THREE.Color(config.theme?.accent || "#ffd08a");
  for (let i = 0; i < count; i += 1) {
    const r = 3 + random() * 9;
    const theta = random() * Math.PI * 2;
    positions[i * 3] = 2.15 + Math.cos(theta) * r * 0.42;
    positions[i * 3 + 1] = (random() - 0.5) * 5;
    positions[i * 3 + 2] = Math.sin(theta) * r - 2 - random() * 8;
    const mixed = colorA.clone().lerp(colorB, random() * 0.6);
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const group = new THREE.Group();
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  points.position.x = 0.82 + index * 0.2;
  group.add(points);
  const ringMaterial = new THREE.LineBasicMaterial({
    color: config.theme?.color || "#8cecff",
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  for (let i = 0; i < 4; i += 1) {
    const curve = new THREE.EllipseCurve(0, 0, 0.72 + i * 0.36, 0.72 + i * 0.36, 0, Math.PI * 2);
    const ringGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160));
    const ring = new THREE.LineLoop(ringGeometry, ringMaterial.clone());
    ring.position.set(1.72, 0, -2.35 - i * 0.18);
    ring.rotation.z = i * 0.08;
    group.add(ring);
  }
  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      points.material.opacity = 0.14 + Math.sin(phase * Math.PI) * 0.58;
      points.rotation.y = time * 0.035 + local * 0.7 + pointer.x * 0.08;
      points.rotation.x = pointer.y * 0.05;
      points.position.z = -local * 2.6;
      points.scale.setScalar(0.92 + local * 0.16);
      group.children.forEach((child, childIndex) => {
        if (child.isLineLoop) {
          child.material.opacity = Math.max(0.12, Math.sin(phase * Math.PI) * (0.16 + childIndex * 0.035));
          child.rotation.z = time * (0.025 + childIndex * 0.006) + local * 0.4;
          child.scale.setScalar(0.92 + local * 0.18);
        }
      });
    }
  };
}

function createDepthComposite(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const colorA = new THREE.Color(config.theme?.color || "#8cecff");
  const colorB = new THREE.Color(config.theme?.accent || "#ffd08a");
  const mediaSources = normalizeMediaSources(chapter.scene);
  const textureLoader = mediaSources.length ? new THREE.TextureLoader() : null;
  const panels = [];
  const beams = [];
  const panelCount = chapter.scene?.panels || 5;
  for (let i = 0; i < panelCount; i += 1) {
    const fallbackTexture = createInterfaceTexture(THREE, colorA, colorB, hashSeed(`${chapter.id}:${index}:media:${i}`));
    const shader = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: 0 },
        uLayer: { value: i + 1 },
        uColorA: { value: colorA },
        uColorB: { value: colorB },
        uTexture: { value: fallbackTexture },
        uHasTexture: { value: mediaSources.length ? 0 : 0.48 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPhase;
        uniform float uLayer;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z += sin((p.x * 4.0 + p.y * 2.0 + uTime * 0.8 + uLayer) ) * 0.045 * uPhase;
          p.x += sin((p.y + uLayer) * 3.0 + uTime * 0.32) * 0.018 * uPhase;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uPhase;
        uniform float uLayer;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform sampler2D uTexture;
        uniform float uHasTexture;
        varying vec2 vUv;
        void main() {
          float d = distance(vUv, vec2(0.54, 0.48));
          float focus = 1.0 - smoothstep(0.18, 0.74, d);
          float edgeDistance = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
          float edge = 1.0 - smoothstep(0.0, 0.045, edgeDistance);
          float scan = smoothstep(0.028, 0.0, abs(fract(vUv.y * 18.0 + uTime * 0.06 + uLayer * 0.09) - 0.5));
          float gridX = smoothstep(0.982, 1.0, abs(sin((vUv.x + uLayer * 0.03) * 42.0)));
          float gridY = smoothstep(0.986, 1.0, abs(sin((vUv.y + uLayer * 0.05) * 26.0)));
          vec4 media = texture2D(uTexture, vUv);
          float mediaLuma = dot(media.rgb, vec3(0.299, 0.587, 0.114));
          vec3 color = mix(uColorA, uColorB, vUv.x * 0.72 + scan * 0.16 + uLayer * 0.035);
          color = mix(color, media.rgb * (1.85 + focus * 0.72), uHasTexture * 0.82);
          float alpha = (0.055 + focus * 0.105 + edge * 0.32 + (gridX + gridY) * 0.035 + scan * 0.06 + mediaLuma * uHasTexture * 0.86) * sin(uPhase * 3.1415926);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    const mediaSource = mediaSources[i % Math.max(1, mediaSources.length)];
    if (mediaSource && textureLoader) {
      textureLoader.load(mediaSource, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        shader.uniforms.uTexture.value = texture;
        shader.uniforms.uHasTexture.value = 1;
      });
    }
    const width = 1.72 + (i % 2) * 0.28;
    const height = 0.92 + (i % 3) * 0.16;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 56, 28), shader);
    mesh.position.set(0.92 + i * 0.2, (i - (panelCount - 1) / 2) * 0.22, -2.35 - i * 0.34);
    mesh.rotation.set(-0.04 + i * 0.018, -0.48 + i * 0.052, -0.07 + i * 0.035);
    panels.push(mesh);
    group.add(mesh);
  }

  for (let i = 0; i < 4; i += 1) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.65, -0.76 + i * 0.28, -2.2 - i * 0.2),
      new THREE.Vector3(1.45, -0.18 + i * 0.12, -3.0 - i * 0.22),
      new THREE.Vector3(2.55, 0.3 - i * 0.18, -3.55 - i * 0.28)
    ]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 72, 0.008 + i * 0.0015, 8, false),
      material(THREE, i % 2 ? colorB : colorA, 0.24)
    );
    beams.push(tube);
    group.add(tube);
  }

  const random = seededRandom(hashSeed(`${chapter.id}:${index}:depth-composite`));
  const particleCount = chapter.scene?.particles || 260;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3] = 1.35 + random() * 3.2;
    positions[i * 3 + 1] = (random() - 0.5) * 2.7;
    positions[i * 3 + 2] = -2.1 - random() * 4.8;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMaterial = new THREE.PointsMaterial({
    color: colorA,
    size: 0.026,
    transparent: true,
    opacity: 0.42,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);
  group.position.set(0.82, 0, 0);

  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      group.rotation.y = -0.1 + pointer.x * 0.08 + local * 0.18;
      group.rotation.x = pointer.y * 0.04;
      group.position.z = -local * 0.95;
      panels.forEach((mesh, i) => {
        mesh.material.uniforms.uTime.value = time;
        mesh.material.uniforms.uPhase.value = phase;
        mesh.position.x = 0.92 + i * 0.2 + local * 0.18;
        mesh.position.y += Math.sin(time * 0.34 + i) * 0.0008;
      });
      beams.forEach((beam, i) => {
        beam.material.opacity = Math.sin(phase * Math.PI) * (0.14 + i * 0.045);
        beam.rotation.z = Math.sin(time * 0.16 + i) * 0.035 + local * 0.08;
      });
      particles.material.opacity = Math.sin(phase * Math.PI) * 0.34;
      particles.rotation.y = time * 0.025 + local * 0.3;
    }
  };
}

function createVideoComposite(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const colorA = new THREE.Color(config.theme?.color || "#8cecff");
  const colorB = new THREE.Color(config.theme?.accent || "#ffd08a");
  const fallbackTexture = createInterfaceTexture(THREE, colorA, colorB, hashSeed(`${chapter.id}:${index}:video-fallback`));
  const scene = chapter.scene || {};
  const videoSource = scene.video || scene.src || "";
  const posterSource = scene.poster || normalizeMediaSources(scene)[0] || "/media/interface-overview.svg";
  let video = null;
  let videoReady = false;
  const textureLoader = new THREE.TextureLoader();

  const shader = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uLocal: { value: 0 },
      uTexture: { value: fallbackTexture },
      uColorA: { value: colorA },
      uColorB: { value: colorB },
      uHasVideo: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPhase;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        p.z += sin((p.x * 3.2 + p.y * 2.4 + uTime * 0.8)) * 0.05 * uPhase;
        p.y += sin((p.x + uTime * 0.22) * 2.0) * 0.018 * uPhase;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uPhase;
      uniform float uLocal;
      uniform sampler2D uTexture;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uHasVideo;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        float wave = sin((uv.y + uTime * 0.035) * 22.0) * 0.004 * uPhase;
        uv.x += wave;
        vec4 media = texture2D(uTexture, uv);
        float luma = dot(media.rgb, vec3(0.299, 0.587, 0.114));
        float d = distance(vUv, vec2(0.54, 0.48));
        float focus = 1.0 - smoothstep(0.2, 0.8, d);
        float scan = smoothstep(0.024, 0.0, abs(fract(vUv.y * 28.0 + uTime * 0.08) - 0.5));
        float edgeDistance = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float edge = 1.0 - smoothstep(0.0, 0.04, edgeDistance);
        vec3 tint = mix(uColorA, uColorB, vUv.x + scan * 0.14);
        vec3 color = mix(tint * (0.18 + focus * 0.35), media.rgb * (1.28 + focus * 0.45), 0.72 + uHasVideo * 0.18);
        color += tint * (scan * 0.12 + edge * 0.18 + uLocal * 0.04);
        float alpha = (0.18 + focus * 0.3 + luma * 0.62 + scan * 0.08 + edge * 0.28) * sin(uPhase * 3.1415926);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });

  textureLoader.load(posterSource, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    shader.uniforms.uTexture.value = texture;
  });

  if (videoSource && typeof document !== "undefined") {
    video = document.createElement("video");
    video.src = videoSource;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.addEventListener("loadeddata", () => {
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      shader.uniforms.uTexture.value = texture;
      shader.uniforms.uHasVideo.value = 1;
      videoReady = true;
    }, { once: true });
    video.play().catch(() => {
      videoReady = false;
    });
  }

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.65, 1.48, 72, 36), shader);
  plane.position.set(1.78, 0.02, -2.85);
  plane.rotation.set(-0.03, -0.34, -0.025);
  group.add(plane);

  const frameMaterial = new THREE.LineBasicMaterial({
    color: config.theme?.accent || "#ffd08a",
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const frame = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1.42, -0.82, -2.82),
    new THREE.Vector3(1.42, -0.82, -2.82),
    new THREE.Vector3(1.42, 0.82, -2.82),
    new THREE.Vector3(-1.42, 0.82, -2.82)
  ]), frameMaterial);
  frame.position.x = 1.78;
  group.add(frame);

  const random = seededRandom(hashSeed(`${chapter.id}:${index}:video-dust`));
  const count = scene.particles || 180;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = 0.9 + random() * 2.8;
    positions[i * 3 + 1] = (random() - 0.5) * 2.1;
    positions[i * 3 + 2] = -2.1 - random() * 3.4;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    color: config.theme?.color || "#8cecff",
    size: 0.022,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  group.add(dust);

  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      shader.uniforms.uTime.value = time;
      shader.uniforms.uPhase.value = phase;
      shader.uniforms.uLocal.value = local;
      if (video && videoReady && video.duration && scene.scrub !== false) {
        const targetTime = Math.min(video.duration - 0.04, Math.max(0, local * video.duration));
        if (Math.abs(video.currentTime - targetTime) > 0.08) video.currentTime = targetTime;
      }
      group.rotation.y = pointer.x * 0.07 + local * 0.16;
      group.rotation.x = pointer.y * 0.035;
      group.position.z = -local * 0.85;
      plane.scale.setScalar(0.92 + Math.sin(phase * Math.PI) * 0.12);
      frame.material.opacity = Math.sin(phase * Math.PI) * 0.24;
      dust.material.opacity = Math.sin(phase * Math.PI) * 0.28;
      dust.rotation.y = time * 0.025 + local * 0.28;
    }
  };
}

function createModularInterface(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const count = chapter.scene?.modules || 8;
  const boxMaterial = material(THREE, config.theme?.color || "#8cecff", 0.28);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: config.theme?.accent || "#ffd08a",
    transparent: true,
    opacity: 0.42
  });
  for (let i = 0; i < count; i += 1) {
    const width = 0.7 + (i % 3) * 0.3;
    const height = 0.32 + (i % 2) * 0.16;
    const geometry = new THREE.BoxGeometry(width, height, 0.035);
    const mesh = new THREE.Mesh(geometry, boxMaterial.clone());
    mesh.position.set((i % 4 - 1.5) * 1.2, (Math.floor(i / 4) - 0.5) * 0.8, -2 - (i % 3) * 0.35);
    group.add(mesh);
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2.2, -0.85, -2.6),
    new THREE.Vector3(2.2, -0.85, -2.6),
    new THREE.Vector3(2.2, 0.85, -2.6),
    new THREE.Vector3(-2.2, 0.85, -2.6),
    new THREE.Vector3(-2.2, -0.85, -2.6)
  ]);
  group.add(new THREE.Line(lineGeometry, lineMaterial));
  group.position.x = 3.05;
  group.position.y = -0.1;
  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      group.children.forEach((child, childIndex) => {
        if (child.material) child.material.opacity = Math.sin(phase * Math.PI) * (child.isLine ? 0.36 : 0.27);
        child.position.z += Math.sin(time + childIndex) * 0.0008;
      });
      group.rotation.y = -0.22 + pointer.x * 0.14 + local * 0.24;
      group.rotation.x = pointer.y * 0.06;
      group.scale.setScalar(0.84 + phase * 0.22);
    }
  };
}

function createPortalTransition(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const ringMaterial = material(THREE, config.theme?.accent || "#ffd08a", 0.42);
  const rings = chapter.scene?.rings || 7;
  for (let i = 0; i < rings; i += 1) {
    const geometry = new THREE.TorusGeometry(0.55 + i * 0.22, 0.008, 8, 96);
    const ring = new THREE.Mesh(geometry, ringMaterial.clone());
    ring.position.z = -2 - i * 0.4;
    group.add(ring);
  }
  group.position.x = 1.25;
  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      group.children.forEach((ring, i) => {
        ring.material.opacity = Math.sin(phase * Math.PI) * (0.18 + i * 0.035);
        ring.rotation.z = time * (0.08 + i * 0.01) + local * Math.PI;
        ring.scale.setScalar(0.72 + local * 0.75 + i * 0.02);
      });
      group.rotation.x = pointer.y * 0.07;
      group.rotation.y = pointer.x * 0.09;
    }
  };
}

function createLightRibbon(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const color = config.theme?.color || "#8cecff";
  const count = chapter.scene?.count || 5;
  for (let i = 0; i < count; i += 1) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.4, -0.5 + i * 0.18, -2.5),
      new THREE.Vector3(-0.6, 0.5 - i * 0.08, -3.2),
      new THREE.Vector3(0.8, -0.2 + i * 0.12, -2.8),
      new THREE.Vector3(2.4, 0.35 - i * 0.1, -3.5)
    ]);
    const geometry = new THREE.TubeGeometry(curve, 80, 0.01, 8, false);
    const mesh = new THREE.Mesh(geometry, material(THREE, color, 0.28));
    group.add(mesh);
  }
  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      group.children.forEach((child, i) => {
        child.material.opacity = Math.sin(phase * Math.PI) * (0.22 + i * 0.04);
      });
      group.rotation.z = Math.sin(time * 0.15) * 0.08 + pointer.x * 0.08;
      group.position.z = -local * 1.2;
    }
  };
}

function createDistortedMediaPlane(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const colorA = new THREE.Color(config.theme?.color || "#8cecff");
  const colorB = new THREE.Color(config.theme?.accent || "#ffd08a");
  const planeCount = chapter.scene?.planes || 3;
  for (let i = 0; i < planeCount; i += 1) {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: 0 },
        uColorA: { value: colorA },
        uColorB: { value: colorB },
        uIndex: { value: i + 1 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPhase;
        uniform float uIndex;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z += sin((p.x + uIndex) * 5.0 + uTime * 1.3) * 0.08 * uPhase;
          p.y += sin((p.x + p.y) * 3.0 + uTime) * 0.04 * uPhase;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uPhase;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec2 vUv;
        void main() {
          float frame = smoothstep(0.0, 0.03, vUv.x) * smoothstep(0.0, 0.03, vUv.y)
            * smoothstep(0.0, 0.03, 1.0 - vUv.x) * smoothstep(0.0, 0.03, 1.0 - vUv.y);
          float scan = smoothstep(0.02, 0.0, abs(fract(vUv.y * 18.0 + uPhase * 1.2) - 0.5));
          vec3 color = mix(uColorA, uColorB, vUv.x + scan * 0.2);
          float alpha = (0.08 + scan * 0.16 + (1.0 - frame) * 0.35) * sin(uPhase * 3.1415926);
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.86, 48, 24), material);
    mesh.position.set(0.95 + i * 0.22, (i - 1) * 0.46, -2.45 - i * 0.42);
    mesh.rotation.set(-0.08 + i * 0.04, -0.42 + i * 0.08, 0.02 - i * 0.04);
    group.add(mesh);
  }
  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      group.rotation.y = pointer.x * 0.1 + local * 0.18;
      group.rotation.x = pointer.y * 0.05;
      group.children.forEach((mesh, i) => {
        mesh.material.uniforms.uTime.value = time;
        mesh.material.uniforms.uPhase.value = phase;
        mesh.position.x = 1.24 + i * 0.28 + local * 0.25;
      });
    }
  };
}

function createGalleryScrollSync(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const items = chapter.scene?.items || 6;
  const colorA = config.theme?.color || "#8cecff";
  const colorB = config.theme?.accent || "#ffd08a";
  for (let i = 0; i < items; i += 1) {
    const mat = material(THREE, i % 2 ? colorB : colorA, 0.18);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.52, 0.024), mat);
    mesh.position.set((i - (items - 1) / 2) * 0.58, Math.sin(i * 0.8) * 0.42, -2.2 - i * 0.18);
    mesh.rotation.set(0, -0.36 + i * 0.05, 0.05 * (i - items / 2));
    group.add(mesh);
  }
  const railGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2.4, -0.72, -2.8),
    new THREE.Vector3(2.4, 0.72, -3.1)
  ]);
  group.add(new THREE.Line(railGeometry, new THREE.LineBasicMaterial({
    color: colorA,
    transparent: true,
    opacity: 0.28
  })));
  group.position.x = 0.8;
  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      group.position.x = 1.1 - local * 1.25;
      group.rotation.y = pointer.x * 0.08;
      group.children.forEach((child, i) => {
        if (child.material) child.material.opacity = Math.sin(phase * Math.PI) * (child.isLine ? 0.26 : 0.16 + i * 0.015);
        child.position.y += Math.sin(time * 0.6 + i) * 0.0009;
      });
    }
  };
}

function createProductOrbit(THREE, chapter, index, config) {
  const group = new THREE.Group();
  const colorA = config.theme?.color || "#8cecff";
  const colorB = config.theme?.accent || "#ffd08a";
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.72, 2),
    new THREE.MeshStandardMaterial({
      color: colorA,
      emissive: colorA,
      emissiveIntensity: 0.42,
      roughness: 0.28,
      metalness: 0.62,
      transparent: true,
      opacity: 0.86
    })
  );
  group.add(core);
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.98 + i * 0.18, 0.006, 8, 120),
      material(THREE, i % 2 ? colorB : colorA, 0.3)
    );
    ring.rotation.set(Math.PI * (0.35 + i * 0.08), Math.PI * (0.18 + i * 0.1), 0);
    group.add(ring);
  }
  for (let i = 0; i < 8; i += 1) {
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), material(THREE, i % 2 ? colorB : colorA, 0.7));
    satellite.userData.angle = (i / 8) * Math.PI * 2;
    satellite.userData.radius = 1.25 + (i % 3) * 0.14;
    group.add(satellite);
  }
  group.position.set(1.15, 0, -2.8);
  return {
    id: chapter.id,
    object: group,
    update({ phase, local, pointer, time }) {
      group.visible = phase > 0.001;
      group.scale.setScalar(0.62 + Math.sin(phase * Math.PI) * 0.42);
      group.rotation.y = time * 0.22 + local * 0.9 + pointer.x * 0.18;
      group.rotation.x = -0.18 + pointer.y * 0.12;
      core.material.opacity = 0.2 + Math.sin(phase * Math.PI) * 0.72;
      group.children.forEach((child, i) => {
        if (child.userData.radius) {
          const angle = child.userData.angle + time * (0.4 + i * 0.02);
          child.position.set(Math.cos(angle) * child.userData.radius, Math.sin(angle * 0.7) * 0.32, Math.sin(angle) * child.userData.radius * 0.42);
        } else if (child.material && child !== core) {
          child.material.opacity = Math.sin(phase * Math.PI) * 0.34;
        }
      });
    }
  };
}



