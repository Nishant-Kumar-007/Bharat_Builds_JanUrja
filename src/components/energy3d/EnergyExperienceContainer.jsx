import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NeighborhoodScene from './NeighborhoodScene';
import CameraController from './CameraController';
import ScrollStageOverlay from './ScrollStageOverlay';
import EnergyControls from './EnergyControls';
import HouseholdInspectorModal from './HouseholdInspectorModal';
import Fallback2DView from './Fallback2DView';
import { useApp } from '../../context/AppContext';

// Register GSAP ScrollTrigger plugin safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Utility to verify WebGL capability
function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

export default function EnergyExperienceContainer() {
  const { getActiveUserNode, offers } = useApp();
  const activeNode = getActiveUserNode();

  // Scroll Progress (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  const trackRef = useRef(null);
  const pinRef = useRef(null);

  // 1. Detect WebGL & Reduced Motion preference
  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // 2. Setup GSAP ScrollTrigger pinning and scrub synchronization
  useEffect(() => {
    if (!trackRef.current || !pinRef.current) return;

    let lastProgress = 0;
    let rafId = null;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: trackRef.current,
        pin: pinRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.1,
        fastScrollEnd: true,
        onUpdate: (self) => {
          if (isPaused) return;
          const p = Number(self.progress.toFixed(4));
          // Throttle React state updates to eliminate main-thread stuttering
          if (Math.abs(p - lastProgress) > 0.005 || p === 0 || p === 1) {
            lastProgress = p;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              setScrollProgress(p);
            });
          }
        },
      });
    }, trackRef);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [isPaused]);

  // Jump to specific narrative stage
  const handleJumpToStage = (stageIndex) => {
    if (!trackRef.current) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const trackTop = trackRect.top + scrollTop;
    const scrollDistance = trackRef.current.offsetHeight - window.innerHeight;
    const targetScroll = trackTop + (stageIndex / 3.0) * scrollDistance;

    window.scrollTo({
      top: targetScroll,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const handleResetView = () => {
    setSelectedNode(null);
  };

  return (
    <div
      ref={trackRef}
      className="relative w-full bg-[#070A08]"
      style={{ height: '320vh' }}
      id="energy-3d-experience"
    >
      {/* Pinned Experience Viewport */}
      <div
        ref={pinRef}
        className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-between"
      >
        {/* Floating Top Energy Controls */}
        <EnergyControls
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((prev) => !prev)}
          onResetView={handleResetView}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={() => setReducedMotion((prev) => !prev)}
          selectedNode={selectedNode}
          onSelectNode={(node) => setSelectedNode(node)}
        />

        {/* Narrative Story Cards Overlay */}
        <ScrollStageOverlay
          scrollProgress={scrollProgress}
          onJumpToStage={handleJumpToStage}
          activeNode={activeNode}
          activeOffer={offers?.[0]}
        />

        {/* 3D Neighborhood Canvas (or 2D Fallback) */}
        {hasWebGL ? (
          <div className="absolute inset-0 z-0">
            <Suspense
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#070A08] text-emerald-400 font-mono text-xs">
                  <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <span>INITIALIZING 3D MICROGRID TELEMETRY...</span>
                </div>
              }
            >
              <Canvas
                dpr={[1, 1.25]}
                camera={{ position: [-11.5, 7.5, 7.5], fov: 42 }}
                gl={{
                  antialias: true,
                  powerPreference: 'high-performance',
                  alpha: false,
                  stencil: false,
                  depth: true,
                  preserveDrawingBuffer: false,
                }}
                className="w-full h-full"
              >
                <color attach="background" args={['#070A08']} />
                <CameraController
                  scrollProgress={scrollProgress}
                  selectedNode={selectedNode}
                  reducedMotion={reducedMotion}
                  isPaused={isPaused}
                />
                <NeighborhoodScene
                  scrollProgress={scrollProgress}
                  selectedNode={selectedNode}
                  onSelectNode={(node) => setSelectedNode(node)}
                />
              </Canvas>
            </Suspense>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 flex items-center justify-center p-6 overflow-y-auto">
            <Fallback2DView
              scrollProgress={scrollProgress}
              onJumpToStage={handleJumpToStage}
              selectedNode={selectedNode}
              onSelectNode={(node) => setSelectedNode(node)}
            />
          </div>
        )}

        {/* Selected Household Detail Inspector */}
        <HouseholdInspectorModal
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
