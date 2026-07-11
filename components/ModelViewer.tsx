"use client";

import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Html,
  ContactShadows,
  useAnimations,
  Center,
} from "@react-three/drei";
import { Group, Mesh, Object3D, Raycaster, Vector2 } from "three";
import { Loader2, Info, ZoomIn, ZoomOut, RotateCcw, Play, Circle } from "lucide-react";
import { ModelPart, Hotspot } from "@/types";
import PartInfoModal from "./PartInfoModal";

/* ------------------------------------------------------------------ */
/*  Hotspot sphere — clickable, with label tooltip                      */
/* ------------------------------------------------------------------ */
function HotspotMarker({
  position,
  label,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[hovered ? 0.12 : 0.08, 16, 16]} />
      <meshStandardMaterial
        color={hovered ? "#f59e0b" : "#0ea5e9"}
        emissive={hovered ? "#f59e0b" : "#0ea5e9"}
        emissiveIntensity={0.5}
        transparent
        opacity={0.9}
      />
      {hovered && (
        <Html distanceFactor={10} center>
          <div className="bg-white/95 backdrop-blur text-celebra-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-celebra-100 pointer-events-none">
            {label}
          </div>
        </Html>
      )}
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Clickable mesh wrapper — attaches onClick to named GLB meshes      */
/* ------------------------------------------------------------------ */
function ClickableMeshes({
  scene,
  parts,
  onPartClick,
}: {
  scene: Group;
  parts: ModelPart[];
  onPartClick: (part: ModelPart) => void;
}) {
  const meshMap = useMemo(() => {
    const map = new Map<string, Mesh>();
    scene.traverse((child) => {
      if ((child as Mesh).isMesh && child.name) {
        map.set(child.name, child as Mesh);
      }
    });
    return map;
  }, [scene]);

  // Wrap matching meshes with click handlers
  useEffect(() => {
    const handlers: Array<() => void> = [];

    parts.forEach((part) => {
      const mesh = meshMap.get(part.meshName);
      if (!mesh) return;

      const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPartClick(part);
      };
      const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      };
      const handlePointerOut = () => {
        document.body.style.cursor = "auto";
      };

      mesh.userData._clickable = true;
      (mesh as any).onClick = handleClick;
      (mesh as any).onPointerOver = handlePointerOver;
      (mesh as any).onPointerOut = handlePointerOut;

      handlers.push(() => {
        delete (mesh as any).onClick;
        delete (mesh as any).onPointerOver;
        delete (mesh as any).onPointerOut;
      });
    });

    return () => handlers.forEach((fn) => fn());
  }, [meshMap, parts, onPartClick]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  The actual 3D model inside the canvas                               */
/* ------------------------------------------------------------------ */
function Model({
  url,
  scale = 1.5,
  hasAnimation = false,
  parts = [],
  hotspots = [],
  onPartClick,
}: {
  url: string;
  scale?: number;
  hasAnimation?: boolean;
  parts?: ModelPart[];
  hotspots?: Hotspot[];
  onPartClick: (part: Hotspot | ModelPart) => void;
}) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (hasAnimation && names.length > 0) {
      const action = actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [hasAnimation, actions, names]);

  useFrame((state) => {
    if (group.current && !hasAnimation) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  /* Raycasting: when user clicks empty space, check if a named mesh was hit */
  const handleCanvasClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      // If a mesh with our custom handler was clicked, let it handle it
      const clickedMesh = e.object as Mesh;
      if (clickedMesh.userData._clickable && (clickedMesh as any).onClick) {
        (clickedMesh as any).onClick(e);
        return;
      }

      // Otherwise try to find a matching part by name
      let target: Object3D | null = e.object;
      while (target) {
        if ((target as Mesh).isMesh && target.name) {
          const matched = parts.find((p) => p.meshName === target!.name);
          if (matched) {
            e.stopPropagation();
            onPartClick(matched);
            return;
          }
        }
        target = target.parent;
      }
    },
    [parts, onPartClick]
  );

  return (
    <group ref={group} onClick={handleCanvasClick}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>

      {/* Attach click handlers to known named meshes */}
      {parts.length > 0 && (
        <ClickableMeshes scene={scene} parts={parts} onPartClick={onPartClick} />
      )}

      {/* Position-based hotspots for merged meshes */}
      {hotspots.map((h, i) => (
        <HotspotMarker
          key={i}
          position={h.position}
          label={h.label}
          onClick={() => onPartClick(h)}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene wrapper                                                       */
/* ------------------------------------------------------------------ */
function Scene({
  modelUrl,
  scale,
  hasAnimation,
  parts,
  hotspots,
  onPartClick,
}: {
  modelUrl: string;
  scale?: number;
  hasAnimation?: boolean;
  parts?: ModelPart[];
  hotspots?: Hotspot[];
  onPartClick: (part: Hotspot | ModelPart) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />
      <Suspense
        fallback={
          <Html center>
            <div className="flex flex-col items-center text-celebra-700">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm font-medium">Loading 3D Model...</span>
            </div>
          </Html>
        }
      >
        <Model
          url={modelUrl}
          scale={scale}
          hasAnimation={hasAnimation}
          parts={parts}
          hotspots={hotspots}
          onPartClick={onPartClick}
        />
        <Environment preset="city" />
      </Suspense>
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
      />
      <OrbitControls
        makeDefault
        autoRotate={!hasAnimation}
        autoRotateSpeed={0.8}
        minDistance={1.5}
        maxDistance={10}
        enablePan={false}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported viewer component                                           */
/* ------------------------------------------------------------------ */
export default function ModelViewer({
  modelUrl,
  scale,
  hasAnimation,
  parts,
  hotspots,
}: {
  modelUrl: string;
  scale?: number;
  hasAnimation?: boolean;
  parts?: ModelPart[];
  hotspots?: Hotspot[];
}) {
  const [showHelp, setShowHelp] = useState(true);
  const [selectedPart, setSelectedPart] = useState<Hotspot | ModelPart | null>(null);

  const handlePartClick = useCallback(
    (part: Hotspot | ModelPart) => {
      setSelectedPart(part);
    },
    []
  );

  return (
    <>
      <div className="relative w-full h-[60vh] md:h-[70vh] bg-gradient-to-br from-slate-50 to-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-200">
        <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 45 }}>
          <Scene
            modelUrl={modelUrl}
            scale={scale}
            hasAnimation={hasAnimation}
            parts={parts}
            hotspots={hotspots}
            onPartClick={handlePartClick}
          />
        </Canvas>

        {/* Overlay Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-white/90 backdrop-blur rounded-full shadow hover:bg-white transition"
            title="Toggle help"
          >
            <Info className="w-5 h-5 text-celebra-700" />
          </button>
        </div>

        {showHelp && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs text-sm text-slate-700 border border-slate-200">
            <h4 className="font-semibold text-celebra-800 mb-1 flex items-center gap-1">
              <RotateCcw className="w-4 h-4" /> 3D Controls
            </h4>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-1">
                <ZoomIn className="w-3 h-3" /> Scroll to zoom in/out
              </li>
              <li className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Click & drag to rotate
              </li>
              <li className="flex items-center gap-1">
                <ZoomOut className="w-3 h-3" /> Right-click to pan
              </li>
            </ul>
            {(parts?.length || hotspots?.length) ? (
              <p className="mt-2 text-xs text-celebra-600 font-medium">
                Click on blue spheres or model parts to learn more
              </p>
            ) : null}
            {hasAnimation && (
              <p className="mt-2 text-xs text-celebra-600 font-medium flex items-center gap-1">
                <Play className="w-3 h-3" /> This model includes animation
              </p>
            )}
          </div>
        )}

        {/* CBC Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cbc-green text-white shadow">
            CBC Aligned
          </span>
        </div>
      </div>

      {/* Part Info Modal */}
      <PartInfoModal part={selectedPart} onClose={() => setSelectedPart(null)} />
    </>
  );
}
