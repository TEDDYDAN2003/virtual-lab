"use client";

import { Suspense, useRef, useState, useCallback } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Center } from "@react-three/drei";
import { Group, Mesh } from "three";
import { Loader2, Crosshair, Trash2 } from "lucide-react";

function PreviewModel({
  url,
  scale = 1,
  onSceneClick,
  hotspots,
}: {
  url: string;
  scale?: number;
  onSceneClick: (point: [number, number, number]) => void;
  hotspots: { position: [number, number, number]; label: string }[];
}) {
  const { scene } = useGLTF(url);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const point = e.point;
      onSceneClick([point.x, point.y, point.z]);
    },
    [onSceneClick]
  );

  return (
    <group onClick={handleClick}>
      <Center>
        <primitive object={scene} scale={scale} />
      </Center>
      {hotspots.map((h, i) => (
        <mesh key={i} position={h.position}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
          <Html distanceFactor={10} center>
            <div className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
              {h.label || `${i + 1}`}
            </div>
          </Html>
        </mesh>
      ))}
    </group>
  );
}

export default function AdminModelPreview({
  fileUrl,
  scale,
  hotspots,
  onAddHotspot,
  onRemoveHotspot,
  onUpdateHotspot,
}: {
  fileUrl: string;
  scale?: number;
  hotspots: { position: [number, number, number]; label: string; description: string }[];
  onAddHotspot: (pos: [number, number, number]) => void;
  onRemoveHotspot: (index: number) => void;
  onUpdateHotspot: (index: number, field: "label" | "description", value: string) => void;
}) {
  const [placing, setPlacing] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative w-full h-80 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
        <Canvas camera={{ position: [0, 1, 3], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} />
          <Suspense
            fallback={
              <Html center>
                <div className="flex flex-col items-center text-celebra-700">
                  <Loader2 className="w-6 h-6 animate-spin mb-1" />
                  <span className="text-xs font-medium">Loading preview...</span>
                </div>
              </Html>
            }
          >
            <PreviewModel
              url={fileUrl}
              scale={scale}
              onSceneClick={(pos) => {
                if (placing) {
                  onAddHotspot(pos);
                  setPlacing(false);
                }
              }}
              hotspots={hotspots}
            />
          </Suspense>
          <OrbitControls makeDefault minDistance={1} maxDistance={8} enablePan={false} />
        </Canvas>

        <div className="absolute top-3 left-3">
          <button
            onClick={() => setPlacing(!placing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors ${
              placing
                ? "bg-amber-500 text-white"
                : "bg-white/90 text-slate-700 hover:bg-white"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            {placing ? "Click model to place" : "Add Hotspot"}
          </button>
        </div>
      </div>

      {hotspots.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Hotspots ({hotspots.length})
          </p>
          {hotspots.map((h, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600">#{i + 1}</span>
                <button
                  onClick={() => onRemoveHotspot(i)}
                  className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                  title="Remove hotspot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Label (e.g. Nucleus)"
                value={h.label}
                onChange={(e) => onUpdateHotspot(i, "label", e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500"
              />
              <textarea
                placeholder="Description"
                value={h.description}
                onChange={(e) => onUpdateHotspot(i, "description", e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-celebra-500 resize-none"
              />
              <p className="text-[10px] text-slate-400">
                Position: [{h.position.map((n) => n.toFixed(2)).join(", ")}]
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
