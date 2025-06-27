import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Laboratory } from './Laboratory';
import { useGameStore } from '../../stores/gameStore';
import * as THREE from 'three';

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

// Component to constrain camera within laboratory bounds
function CameraConstraints() {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  
  // Laboratory bounds (matching the walls in Laboratory.tsx) - more restrictive
  const bounds = {
    minX: -16,
    maxX: 16,
    minZ: -16,
    maxZ: 16,
    minY: 2,
    maxY: 16
  };

  useFrame(() => {
    if (controlsRef.current) {
      const target = controlsRef.current.target;
      
      // Constrain target within bounds
      target.x = THREE.MathUtils.clamp(target.x, bounds.minX, bounds.maxX);
      target.z = THREE.MathUtils.clamp(target.z, bounds.minZ, bounds.maxZ);
      target.y = THREE.MathUtils.clamp(target.y, bounds.minY, bounds.maxY);
      
      // Calculate safe distance from walls
      const distanceToWallX = Math.min(target.x - bounds.minX, bounds.maxX - target.x);
      const distanceToWallZ = Math.min(target.z - bounds.minZ, bounds.maxZ - target.z);
      
      // Calculate max distance with safety margin
      const safetyMargin = 3; // Distance from wall to stay safe
      const maxDistanceFromWalls = Math.min(distanceToWallX, distanceToWallZ) + safetyMargin;
      const absoluteMaxDistance = 20; // Never exceed this distance
      const maxDistance = Math.min(maxDistanceFromWalls, absoluteMaxDistance);
      
      // Get current distance and direction
      const currentDistance = camera.position.distanceTo(target);
      
      // If camera is too far, bring it back
      if (currentDistance > maxDistance) {
        const direction = new THREE.Vector3().subVectors(camera.position, target).normalize();
        camera.position.copy(target).add(direction.multiplyScalar(maxDistance));
      }
      
      // Additional check: ensure camera stays within absolute bounds
      const cameraBounds = {
        minX: bounds.minX - 2,
        maxX: bounds.maxX + 2,
        minZ: bounds.minZ - 2,
        maxZ: bounds.maxZ + 2,
        minY: bounds.minY,
        maxY: bounds.maxY + 2
      };
      
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, cameraBounds.minX, cameraBounds.maxX);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, cameraBounds.minZ, cameraBounds.maxZ);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, cameraBounds.minY, cameraBounds.maxY);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={20}
      maxPolarAngle={Math.PI / 2.1}
      minPolarAngle={Math.PI / 6}
      target={[0, 0, 0]}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.8}
      panSpeed={0.8}
      zoomSpeed={1.2}
    />
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
          
          {/* Camera controls with constraints */}
          <CameraConstraints />
        </Suspense>
      </Canvas>
    </div>
  );
}