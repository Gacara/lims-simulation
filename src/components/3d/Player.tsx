import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore, useControlsStore } from '../../stores/gameStore';
import * as THREE from 'three';

interface PlayerProps {
  position?: [number, number, number];
}

export function Player({ position = [0, 0.5, 0] }: PlayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { controls } = useControlsStore();
  const { updatePlayerPosition, updatePlayerRotation, setPlayerMoving } = useGameStore();
  const { camera } = useThree();
  
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const cameraDirection = useRef(new THREE.Vector3());
  const cameraRight = useRef(new THREE.Vector3());
  const moveSpeed = 5.0;
  const rotationSpeed = 0.1;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Reset movement state
    let isMoving = false;
    
    // Get camera's forward and right vectors (on the XZ plane)
    camera.getWorldDirection(cameraDirection.current);
    cameraDirection.current.y = 0; // Keep movement on the ground plane
    cameraDirection.current.normalize();
    
    // Calculate right vector from camera forward vector
    cameraRight.current.crossVectors(cameraDirection.current, new THREE.Vector3(0, 1, 0));
    cameraRight.current.normalize();
    
    // Calculate movement direction relative to camera
    direction.current.set(0, 0, 0);
    
    if (controls.forward) {
      direction.current.add(cameraDirection.current);
      isMoving = true;
    }
    if (controls.backward) {
      direction.current.sub(cameraDirection.current);
      isMoving = true;
    }
    if (controls.left) {
      direction.current.sub(cameraRight.current);
      isMoving = true;
    }
    if (controls.right) {
      direction.current.add(cameraRight.current);
      isMoving = true;
    }

    // Normalize direction for consistent speed in all directions
    if (isMoving) {
      direction.current.normalize();
      
      // Apply movement
      velocity.current.copy(direction.current).multiplyScalar(moveSpeed * delta);
      meshRef.current.position.add(velocity.current);
      
      // Rotate player to face movement direction
      if (direction.current.length() > 0) {
        const targetRotation = Math.atan2(direction.current.x, direction.current.z);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          targetRotation,
          rotationSpeed
        );
        updatePlayerRotation(meshRef.current.rotation.y);
      }
      
      // Update player position in store
      updatePlayerPosition({
        x: meshRef.current.position.x,
        y: meshRef.current.position.y,
        z: meshRef.current.position.z,
      });
    }
    
    // Update moving state
    setPlayerMoving(isMoving);

    // Simple head bobbing animation when moving
    if (isMoving) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 8) * 0.05;
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        position[1],
        0.1
      );
    }
  });

  return (
    <group>
      {/* Player capsule/character representation */}
      <mesh ref={meshRef} castShadow>
        <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      
      {/* Simple "face" indicator */}
      <mesh position={[0, 0.3, -0.4]} castShadow>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}