import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Laboratory } from './Laboratory';
import { useGameStore } from '../../stores/gameStore';

// Loading fallback for 3D components - must be 3D objects, not HTML
function SceneLoading() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
    </group>
  );
}

export function Scene() {
  const { currentLaboratory } = useGameStore();

  // Default laboratory for development
  const defaultLab = {
    id: 'lab-1',
    ownerId: 'user-1',
    name: 'Main Laboratory',
    level: 1,
    layout: {
      width: 40,
      height: 40,
      objects: []
    },
    equipment: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const lab = currentLaboratory || defaultLab;

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [10, 12, 15],
          fov: 75,
          near: 0.1,
          far: 200,
        }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<SceneLoading />}>
          {/* Lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[15, 15, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={80}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-camera-top={40}
            shadow-camera-bottom={-40}
          />
          
          {/* Laboratory environment */}
          <Laboratory laboratory={lab} />
          
          {/* Grid helper */}
          <Grid 
            args={[40, 40]} 
            cellSize={2} 
            cellThickness={0.5}
            cellColor="#d1d5db"
            sectionSize={10}
            sectionThickness={1}
            sectionColor="#9ca3af"
            fadeDistance={50}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid
          />
          
          {/* Environment lighting */}
          <Environment preset="studio" />
          
          {/* Camera controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={40}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 6}
            target={[0, 0, 0]}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.8}
            panSpeed={0.8}
            zoomSpeed={1.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}