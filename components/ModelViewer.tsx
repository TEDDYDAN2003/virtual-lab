"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Html,
  ContactShadows,
  useAnimations,
  Center,
} from "@react-three/drei";
import { Group } from "three";
import { Loader2, Info, ZoomIn, ZoomOut, RotateCcw, Play, Pause } from "lucide-react";

function Model({ url, scale = 1.5, hasAnimation = false }: { url: string; scale?: number; hasAnimation?: boolean }) {
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

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
    </group>
  );
}

function Scene({ modelUrl, scale, hasAnimation }: { modelUrl: string; scale?: number; hasAnimation?: boolean }) {
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
        <Model url={modelUrl} scale={scale} hasAnimation={hasAnimation} />
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

export default function ModelViewer({
  modelUrl,
  scale,
  hasAnimation,
}: {
  modelUrl: string;
  scale?: number;
  hasAnimation?: boolean;
}) {
  const [showHelp, setShowHelp] = useState(true);

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] bg-gradient-to-br from-slate-50 to-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 45 }}>
        <Scene modelUrl={modelUrl} scale={scale} hasAnimation={hasAnimation} />
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
  );
}
