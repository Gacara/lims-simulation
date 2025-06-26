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
      width: 20,
      height: 20,
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
          position: [10, 10, 10],
          fov: 50,
        }}
        shadows
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<SceneLoading />}>
          {/* Lighting setup */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          
          {/* Laboratory environment */}
          <Laboratory laboratory={lab} />
          
          {/* Grid helper */}
          <Grid 
            args={[20, 20]} 
            cellSize={1} 
            cellThickness={0.5}
            cellColor="#d1d5db"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9ca3af"
            fadeDistance={25}
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
            maxDistance={25}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}