import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Coordinate positions for key neighborhood landmarks
export const HOUSE_POSITIONS = {
  producer: [-7.5, 0, -1.5],   // Hebbal Solar Prosumer
  substation: [0, 0, -4.5],    // Central BESCOM 11kV Substation
  consumer1: [7.5, 0, -1.0],   // Ananya Reddy EV Fast Charge Home
  consumer2: [3.5, 0, 5.5],    // Indiranagar Co-op Household
};

// Catenary power line waypoints
const POWER_LINE_POINTS_A = [
  new THREE.Vector3(-7.5, 3.2, -1.5), // Producer roof outlet
  new THREE.Vector3(-4.5, 4.0, -3.0), // Utility Pole 1
  new THREE.Vector3(0.0, 4.2, -4.5),  // Substation Bus
  new THREE.Vector3(4.5, 4.0, -3.0),  // Utility Pole 2
  new THREE.Vector3(7.5, 3.0, -1.0),  // Consumer 1 Service Drop
];

const POWER_LINE_POINTS_B = [
  new THREE.Vector3(0.0, 4.2, -4.5),  // Substation Bus
  new THREE.Vector3(1.8, 3.8, 0.5),   // Utility Pole 3
  new THREE.Vector3(3.5, 2.8, 5.5),   // Consumer 2 Service Drop
];

/**
 * Real Photorealistic 3D House loaded from /real-house.glb
 */
function RealHouseMesh({ scale = 0.35, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/real-house.glb');

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        // High-performance: disable expensive shadow passes across 658 sub-meshes
        child.castShadow = false;
        child.receiveShadow = false;
        child.matrixAutoUpdate = false;
        child.updateMatrix();
        if (child.material) {
          child.material.roughness = Math.min(0.85, child.material.roughness || 0.6);
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

class SafeModelBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('Real 3D house model fallback activated:', err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// Preload the real house model
try {
  useGLTF.preload('/real-house.glb');
} catch (e) {
  // Preload graceful fallback
}

/**
 * Solar Rooftop Array Component (Mounted on real house roof)
 */
function SolarPanels({ count = 8, activeGlow = 0 }) {
  const panelPositions = useMemo(() => {
    const list = [];
    const rows = 2;
    const cols = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        list.push([(c - 1.5) * 0.75, (r - 0.5) * 0.95, 0]);
      }
    }
    return list;
  }, []);

  return (
    <group rotation={[-0.45, 0, 0]} position={[0, 2.85, 0.5]}>
      {/* Aluminum mounting frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.2, 2.1, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Photovoltaic Cells */}
      {panelPositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Glass silicon cell */}
          <mesh>
            <boxGeometry args={[0.7, 0.9, 0.04]} />
            <meshStandardMaterial
              color="#0B1B3D"
              roughness={0.15}
              metalness={0.9}
              emissive={activeGlow > 0.1 ? '#00F2FE' : '#10B981'}
              emissiveIntensity={0.3 + activeGlow * 1.5}
            />
          </mesh>
          {/* Antireflective coating outline */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.7, 0.9, 0.04)]} />
            <lineBasicMaterial color={activeGlow > 0.3 ? '#B8FF24' : '#38BDF8'} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

/**
 * Procedural Architectural House (Instant Fallback while GLB loads)
 */
function ProceduralArchitecturalHouse({ isWarm = false }) {
  return (
    <group>
      {/* Concrete foundation pad */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[5.2, 0.3, 4.8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>

      {/* Main Residence Walls */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 2.2, 3.8]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Architectural Timber Siding */}
      <mesh position={[0, 1.4, 1.92]}>
        <boxGeometry args={[2.0, 1.8, 0.08]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>

      {/* Roof structure */}
      <mesh position={[0, 2.7, 0]} castShadow>
        <coneGeometry args={[3.2, 1.2, 4]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} />
      </mesh>

      {/* Large Glass Window */}
      <mesh position={[1.2, 1.3, 1.92]}>
        <planeGeometry args={[1.0, 0.8]} />
        <meshStandardMaterial
          color="#FEF08A"
          emissive="#F59E0B"
          emissiveIntensity={isWarm ? 1.5 : 0.4}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

/**
 * Producer Residence (Solar Prosumer Household)
 */
function ProducerHouse({ position, isSelected, onClick, scrollProgress }) {
  // Solar surplus glows intensely in Stage A (0.0 to 0.3)
  const solarSurplusIntensity = Math.min(1, Math.max(0, 1 - scrollProgress * 1.5)) + 0.2;

  return (
    <group position={position} onClick={onClick}>
      {/* Ground Stone Paver Patio */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[6.5, 0.1, 6.0]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>

      {/* Real Photorealistic House Model (with graceful architectural fallback) */}
      <SafeModelBoundary fallback={<ProceduralArchitecturalHouse isWarm={false} />}>
        <Suspense fallback={<ProceduralArchitecturalHouse isWarm={false} />}>
          <RealHouseMesh
            scale={0.34}
            position={[0, 0.45, 0]}
            rotation={[0, Math.PI / 4, 0]}
          />
        </Suspense>
      </SafeModelBoundary>

      {/* High-efficiency Rooftop Solar Panels */}
      <SolarPanels activeGlow={solarSurplusIntensity} />

      {/* Smart Inverter & Battery Storage on Exterior Wall */}
      <group position={[-2.4, 0.8, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 1.1, 0.6]} />
          <meshStandardMaterial
            color="#064E3B"
            emissive="#10B981"
            emissiveIntensity={0.8}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        {/* Pulsing Green Telemetry LED */}
        <mesh position={[-0.16, 0.3, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#B8FF24" />
        </mesh>
      </group>

      {/* Selection / Highlight Halo Ring */}
      {isSelected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.4, 3.8, 32]} />
          <meshBasicMaterial color="#B8FF24" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3D Label Badge */}
      <Html position={[0, 4.4, 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide cursor-pointer transition-all duration-300 whitespace-nowrap shadow-xl flex items-center gap-1.5 border backdrop-blur-md select-none ${
            isSelected
              ? 'bg-[#B8FF24] text-slate-950 border-[#B8FF24] ring-2 ring-[#B8FF24]/50 scale-110 font-black'
              : 'bg-slate-950/90 text-[#B8FF24] border-emerald-500/40 hover:bg-slate-900'
          }`}
          onClick={onClick}
        >
          <span className="w-2 h-2 rounded-full bg-[#B8FF24] animate-ping"></span>
          <span>PRODUCER • +4.5 kWh Surplus</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * Consumer Residence 1 (EV Fast Charge Station)
 */
function ConsumerHouse1({ position, isSelected, onClick, scrollProgress }) {
  // Illuminates brightly in Stage C (0.50 to 0.75) and stays active
  const matchIntensity = Math.min(1, Math.max(0, (scrollProgress - 0.45) * 4));

  return (
    <group position={position} onClick={onClick}>
      {/* Concrete Driveway Pad */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[6.5, 0.1, 6.0]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>

      {/* Real Photorealistic House Model for Consumer */}
      <SafeModelBoundary fallback={<ProceduralArchitecturalHouse isWarm={matchIntensity > 0.3} />}>
        <Suspense fallback={<ProceduralArchitecturalHouse isWarm={matchIntensity > 0.3} />}>
          <RealHouseMesh
            scale={0.32}
            position={[-0.4, 0.45, 0]}
            rotation={[0, -Math.PI / 3, 0]}
          />
        </Suspense>
      </SafeModelBoundary>

      {/* Attached EV Carport Structure */}
      <group position={[2.2, 0, 0]}>
        {/* Carport Glass Canopy */}
        <mesh position={[0, 2.3, 0]}>
          <boxGeometry args={[2.0, 0.08, 3.8]} />
          <meshStandardMaterial color="#0284C7" transparent opacity={0.6} roughness={0.1} />
        </mesh>

        {/* Stylized Electric Vehicle (EV) */}
        <group position={[0, 0.45, 0]}>
          {/* Car chassis */}
          <mesh castShadow>
            <boxGeometry args={[1.2, 0.55, 2.3]} />
            <meshStandardMaterial color="#0284C7" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Cabin glass */}
          <mesh position={[0, 0.38, -0.1]}>
            <boxGeometry args={[1.0, 0.42, 1.3]} />
            <meshStandardMaterial color="#0A0F1D" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Wheels */}
          {[-0.65, 0.65].map((x, xi) =>
            [-0.75, 0.75].map((z, zi) => (
              <mesh key={`${xi}-${zi}`} position={[x, -0.15, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.24, 0.24, 0.18, 16]} />
                <meshStandardMaterial color="#1E293B" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>

        {/* EV Fast Charger Pedestal */}
        <group position={[-0.6, 0.8, 1.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 1.3, 0.35]} />
            <meshStandardMaterial color="#1E293B" metalness={0.6} />
          </mesh>
          {/* Glowing Charger Screen */}
          <mesh position={[0.12, 0.25, 0]}>
            <planeGeometry args={[0.18, 0.28]} />
            <meshStandardMaterial
              color="#00F2FE"
              emissive={matchIntensity > 0.1 ? '#00F2FE' : '#0369A1'}
              emissiveIntensity={0.6 + matchIntensity * 1.8}
            />
          </mesh>
        </group>
      </group>

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.4, 3.8, 32]} />
          <meshBasicMaterial color="#00F2FE" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3D Label */}
      <Html position={[0, 4.4, 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide cursor-pointer transition-all duration-300 whitespace-nowrap shadow-xl flex items-center gap-1.5 border backdrop-blur-md select-none ${
            matchIntensity > 0.4
              ? 'bg-cyan-400 text-slate-950 border-cyan-300 ring-2 ring-cyan-400/50 scale-105 font-black'
              : isSelected
              ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 font-black'
              : 'bg-slate-950/90 text-cyan-300 border-cyan-500/40 hover:bg-slate-900'
          }`}
          onClick={onClick}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              matchIntensity > 0.4 ? 'bg-cyan-300 animate-pulse' : 'bg-amber-400'
            }`}
          ></span>
          <span>
            {matchIntensity > 0.4
              ? 'CONSUMER (MATCHED) • 4.5 kWh Influx'
              : 'CONSUMER 1 • 8.2 kWh Deficit'}
          </span>
        </div>
      </Html>
    </group>
  );
}

/**
 * Consumer Residence 2 (Indiranagar Co-op Household)
 */
function ConsumerHouse2({ position, isSelected, onClick, scrollProgress }) {
  const impactIntensity = Math.min(1, Math.max(0, (scrollProgress - 0.7) * 3.5));

  return (
    <group position={position} onClick={onClick}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[5.0, 0.1, 5.0]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>

      {/* Procedural Co-op Residence for fast background rendering */}
      <ProceduralArchitecturalHouse isWarm={impactIntensity > 0.3} />

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.1, 32]} />
          <meshBasicMaterial color="#A855F7" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3D Label */}
      <Html position={[0, 4.2, 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide cursor-pointer transition-all duration-300 whitespace-nowrap shadow-xl flex items-center gap-1.5 border backdrop-blur-md select-none ${
            impactIntensity > 0.4
              ? 'bg-purple-500 text-white border-purple-300 font-bold'
              : 'bg-slate-950/90 text-purple-300 border-purple-500/40 hover:bg-slate-900'
          }`}
          onClick={onClick}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span>CONSUMER 2 • Co-op Node</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * Central BESCOM Substation & Microgrid Bus
 */
function SubstationNode({ position, isSelected, onClick, scrollProgress }) {
  const lineEnergized = scrollProgress > 0.25;

  return (
    <group position={position} onClick={onClick}>
      {/* Concrete Pad */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[2.8, 3.0, 0.4, 24]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>

      {/* Main Industrial Transformer Enclosure */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[2.2, 2.0, 1.8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cooling Radiator Fins */}
      {[-1.0, 1.0].map((x, idx) => (
        <mesh key={idx} position={[x, 1.4, 0]}>
          <boxGeometry args={[0.3, 1.6, 1.4]} />
          <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* High-Voltage Ceramic Insulators (3 Phases) */}
      {[-0.6, 0, 0.6].map((x, idx) => (
        <group key={idx} position={[x, 2.6, 0]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.16, 0.6, 12]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial
              color="#F59E0B"
              emissive={lineEnergized ? '#10B981' : '#64748B'}
              emissiveIntensity={lineEnergized ? 1.0 : 0.2}
              metalness={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Central Lightning Arrester Mast */}
      <mesh position={[0, 3.2, -0.6]}>
        <cylinderGeometry args={[0.04, 0.08, 1.8]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
      </mesh>

      {/* 3D Label */}
      <Html position={[0, 4.4, 0]} center distanceFactor={20} zIndexRange={[100, 0]}>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide cursor-pointer transition-all duration-300 whitespace-nowrap shadow-xl flex items-center gap-1.5 border backdrop-blur-md select-none ${
            lineEnergized
              ? 'bg-sky-400 text-slate-950 border-sky-300 shadow-sky-500/30 font-black'
              : 'bg-slate-950/90 text-sky-300 border-sky-500/40 hover:bg-slate-900'
          }`}
          onClick={onClick}
        >
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <span>DISCOM HUB • 11kV Substation (50.01 Hz)</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * Utility Poles supporting the overhead microgrid lines
 */
function UtilityPole({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 4.2, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.9, 0]}>
        <boxGeometry args={[1.6, 0.12, 0.12]} />
        <meshStandardMaterial color="#64748B" roughness={0.6} />
      </mesh>
      {[-0.6, 0.6].map((x, idx) => (
        <mesh key={idx} position={[x, 4.05, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.2, 8]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Animated Catenary Power Line with Energy Flow Particles
 */
function CatenaryPowerLine({
  points,
  scrollProgress,
  stageStart = 0.2,
  stageEnd = 0.8,
  glowColor = '#B8FF24',
  particleColor = '#B8FF24',
  particleCount = 20,
}) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const lineGeometry = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.04, 8, false), [curve]);

  const activeLineProgress = Math.min(1, Math.max(0, (scrollProgress - stageStart) / (stageEnd - stageStart)));

  const particleMeshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!particleMeshRef.current) return;

    for (let i = 0; i < particleCount; i++) {
      const baseT = i / particleCount;
      const t = (baseT + scrollProgress * 3.5) % 1.0;

      if (t <= activeLineProgress + 0.05 && activeLineProgress > 0.02) {
        curve.getPointAt(t, tempVec);
        dummy.position.copy(tempVec);
        const s = 0.13 + Math.sin(t * Math.PI * 4 + scrollProgress * 10) * 0.03;
        dummy.scale.set(s, s, s);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      particleMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    particleMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={lineGeometry}>
        <meshStandardMaterial
          color="#1E293B"
          roughness={0.5}
          metalness={0.8}
          emissive={activeLineProgress > 0.05 ? glowColor : '#000000'}
          emissiveIntensity={activeLineProgress * 2.2}
        />
      </mesh>

      <instancedMesh
        ref={particleMeshRef}
        args={[null, null, particleCount]}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={particleColor} />
      </instancedMesh>
    </group>
  );
}

/**
 * Stylized Environment Terrain
 */
function EnvironmentTerrain() {
  const treePositions = useMemo(
    () => [
      [-10.5, 0, -4.5],
      [-9.0, 0, 3.5],
      [-3.0, 0, 2.5],
      [1.5, 0, -2.0],
      [9.5, 0, -4.0],
      [8.0, 0, 4.0],
      [0.0, 0, 7.5],
      [-5.5, 0, 6.0],
    ],
    []
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#070A08" roughness={0.9} metalness={0.1} />
      </mesh>

      <gridHelper
        args={[48, 24, '#152A1A', '#0D1710']}
        position={[0, 0.01, 0]}
      />

      {/* Street connecting nodes */}
      <group position={[0, 0.02, 1.8]}>
        <mesh receiveShadow>
          <boxGeometry args={[36, 0.02, 2.8]} />
          <meshStandardMaterial color="#0A0F0D" roughness={0.9} />
        </mesh>
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[(i - 4) * 3.8, 0.03, 0]}>
            <boxGeometry args={[1.6, 0.01, 0.12]} />
            <meshBasicMaterial color="#1E3A24" />
          </mesh>
        ))}
      </group>

      {/* Trees */}
      {treePositions.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.2, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.6, 0]} castShadow>
            <coneGeometry args={[0.9, 1.5, 7]} />
            <meshStandardMaterial color="#064E3B" roughness={0.7} />
          </mesh>
          <mesh position={[0, 2.3, 0]} castShadow>
            <coneGeometry args={[0.65, 1.2, 7]} />
            <meshStandardMaterial color="#047857" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Main Neighborhood 3D Scene
 */
export default function NeighborhoodScene({
  scrollProgress = 0,
  selectedNode = null,
  onSelectNode = () => {},
}) {
  const sunPosition = useMemo(() => {
    const angle = 0.4 + scrollProgress * 0.8;
    return [Math.cos(angle) * 16, Math.sin(angle) * 14 + 6, 12];
  }, [scrollProgress]);

  const sunColor = useMemo(() => {
    return scrollProgress > 0.6 ? '#F59E0B' : '#FEF08A';
  }, [scrollProgress]);

  return (
    <>
      <ambientLight intensity={0.8} color="#E2E8F0" />
      <directionalLight
        position={sunPosition}
        intensity={2.0}
        color={sunColor}
      />
      <hemisphereLight skyColor="#0284C7" groundColor="#064E3B" intensity={0.5} />

      <EnvironmentTerrain />

      <UtilityPole position={[-4.5, 0, -3.0]} />
      <UtilityPole position={[4.5, 0, -3.0]} />
      <UtilityPole position={[1.8, 0, 0.5]} />

      <ProducerHouse
        position={HOUSE_POSITIONS.producer}
        isSelected={selectedNode === 'producer' || selectedNode === 'NODE-2010'}
        onClick={() => onSelectNode('producer')}
        scrollProgress={scrollProgress}
      />

      <SubstationNode
        position={HOUSE_POSITIONS.substation}
        isSelected={selectedNode === 'substation' || selectedNode === 'NODE-4015'}
        onClick={() => onSelectNode('substation')}
        scrollProgress={scrollProgress}
      />

      <ConsumerHouse1
        position={HOUSE_POSITIONS.consumer1}
        isSelected={selectedNode === 'consumer1' || selectedNode === 'NODE-3045'}
        onClick={() => onSelectNode('consumer1')}
        scrollProgress={scrollProgress}
      />

      <ConsumerHouse2
        position={HOUSE_POSITIONS.consumer2}
        isSelected={selectedNode === 'consumer2' || selectedNode === 'NODE-6032'}
        onClick={() => onSelectNode('consumer2')}
        scrollProgress={scrollProgress}
      />

      <CatenaryPowerLine
        points={POWER_LINE_POINTS_A}
        scrollProgress={scrollProgress}
        stageStart={0.2}
        stageEnd={0.7}
        glowColor="#B8FF24"
        particleColor="#B8FF24"
        particleCount={24}
      />

      <CatenaryPowerLine
        points={POWER_LINE_POINTS_B}
        scrollProgress={scrollProgress}
        stageStart={0.65}
        stageEnd={0.95}
        glowColor="#00F2FE"
        particleColor="#00F2FE"
        particleCount={14}
      />
    </>
  );
}
