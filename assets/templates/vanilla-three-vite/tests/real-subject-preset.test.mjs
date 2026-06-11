import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../public/vendor/three.module.min.js";
import { createPresetObjects } from "../src/cinematic/presets/presetRegistry.js";

function findObjectByName(object, name) {
  let match = null;
  object.traverse((child) => {
    if (!match && child.name === name) match = child;
  });
  return match;
}

test("researched subject keeps the real featured photo on the model-follow anchor", () => {
  const config = {
    theme: { color: "#66e8ff", accent: "#f4c86a" },
    chapters: [{
      id: "hero",
      range: [0, 1],
      copy: { title: "Hero" },
      scene: {
        preset: "researched-3d-subject",
        subjectType: "landmark",
        landmark: "yellow-crane-tower",
        photoFollowModel: true,
        photoOffsetX: -0.16,
        realismImages: [{
          src: "/media/canva/yellow-crane-tower-photo.jpg",
          role: "real-front-photo",
          aspect: 0.75
        }]
      }
    }]
  };

  const [preset] = createPresetObjects(THREE, config);
  const photo = findObjectByName(preset.object, "real-photo-model-follow-layer");

  assert.ok(photo, "featured photo mesh exists");
  assert.equal(photo.userData.followModel, true);
  assert.equal(photo.userData.followTarget, "subject-model-anchor");
  assert.equal(photo.parent?.name, "model-follow-photo-anchor");

  const initialX = photo.position.x;
  const initialY = photo.position.y;
  const initialZ = photo.position.z;
  preset.update({
    phase: 1,
    local: 0.35,
    pointer: { x: 0.8, y: -0.4 },
    zoom: 0.75,
    time: 3.2
  });

  assert.equal(photo.position.x, initialX);
  assert.equal(photo.position.y, initialY);
  assert.equal(photo.position.z, initialZ);
});
