import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HOUSE_POSITIONS } from './NeighborhoodScene';

// Target Camera Waypoints per Stage
const STAGE_WAYPOINTS = [
  // STAGE A: Producer Solar Rooftop Focus
  {
    progress: 0.0,
    camPos: new THREE.Vector3(-11.5, 7.5, 7.5),
    lookTarget: new THREE.Vector3(-7.5, 1.8, -1.5),
  },
  // STAGE B: Line Energization / Tracking Shot
  {
    progress: 0.33,
    camPos: new THREE.Vector3(-1.0, 9.5, 13.5),
    lookTarget: new THREE.Vector3(0.0, 2.0, -2.0),
  },
  // STAGE C: Consumer 1 EV Arrival / Match Focus
  {
    progress: 0.66,
    camPos: new THREE.Vector3(10.5, 7.0, 8.0),
    lookTarget: new THREE.Vector3(7.5, 1.6, -1.0),
  },
  // STAGE D: Grand Isometric Microgrid Equilibrium
  {
    progress: 1.0,
    camPos: new THREE.Vector3(0.0, 16.5, 18.5),
    lookTarget: new THREE.Vector3(0.0, 0.5, 0.0),
  },
];

// Focus targets when user clicks a specific node
const NODE_FOCUS_TARGETS = {
  producer: {
    camPos: new THREE.Vector3(-11.5, 6.5, 6.5),
    lookTarget: new THREE.Vector3(-7.5, 1.6, -1.5),
  },
  substation: {
    camPos: new THREE.Vector3(0.0, 8.0, 3.5),
    lookTarget: new THREE.Vector3(0.0, 2.0, -4.5),
  },
  consumer1: {
    camPos: new THREE.Vector3(10.5, 6.0, 6.5),
    lookTarget: new THREE.Vector3(7.5, 1.5, -1.0),
  },
  consumer2: {
    camPos: new THREE.Vector3(6.5, 6.5, 12.0),
    lookTarget: new THREE.Vector3(3.5, 1.5, 5.5),
  },
};

export default function CameraController({
  scrollProgress = 0,
  selectedNode = null,
  reducedMotion = false,
  isPaused = false,
}) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(-7.5, 1.8, -1.5));
  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    // 1. Determine target position and lookAt
    if (selectedNode && NODE_FOCUS_TARGETS[selectedNode]) {
      const focus = NODE_FOCUS_TARGETS[selectedNode];
      targetCamPos.current.copy(focus.camPos);
      targetLookAt.current.copy(focus.lookTarget);
    } else {
      // Interpolate between STAGE_WAYPOINTS based on scrollProgress
      const p = Math.max(0, Math.min(1, scrollProgress));

      if (p <= 0.33) {
        const t = p / 0.33;
        targetCamPos.current.lerpVectors(STAGE_WAYPOINTS[0].camPos, STAGE_WAYPOINTS[1].camPos, t);
        targetLookAt.current.lerpVectors(STAGE_WAYPOINTS[0].lookTarget, STAGE_WAYPOINTS[1].lookTarget, t);
      } else if (p <= 0.66) {
        const t = (p - 0.33) / 0.33;
        targetCamPos.current.lerpVectors(STAGE_WAYPOINTS[1].camPos, STAGE_WAYPOINTS[2].camPos, t);
        targetLookAt.current.lerpVectors(STAGE_WAYPOINTS[1].lookTarget, STAGE_WAYPOINTS[2].lookTarget, t);
      } else {
        const t = (p - 0.66) / 0.34;
        targetCamPos.current.lerpVectors(STAGE_WAYPOINTS[2].camPos, STAGE_WAYPOINTS[3].camPos, t);
        targetLookAt.current.lerpVectors(STAGE_WAYPOINTS[2].lookTarget, STAGE_WAYPOINTS[3].lookTarget, t);
      }
    }

    // 2. Smoothly damp camera toward target with responsive tracking
    const lerpSpeed = reducedMotion ? 1.0 : Math.min(1, delta * 12.0);

    camera.position.lerp(targetCamPos.current, lerpSpeed);
    currentLookAt.current.lerp(targetLookAt.current, lerpSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
