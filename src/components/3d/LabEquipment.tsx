import React, { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { EquipmentType } from '../../types';

interface LabEquipmentProps {
  type: EquipmentType;
  position: [number, number, number];
  id: string;
}

export function LabEquipment({ type, position, id }: LabEquipmentProps) {
  const [hovered, setHovered] = useState(false);
  const { setActiveEquipmentInterface, player } = useGameStore();

  const handleClick = () => {
    // Check if player is close enough to interact
    const distance = Math.sqrt(
      Math.pow(player.position.x - position[0], 2) +
      Math.pow(player.position.z - position[2], 2)
    );
    
    if (distance < 3) {
      setActiveEquipmentInterface(id);
    }
  };

  const getEquipmentModel = () => {
    switch (type) {
      case 'balance':
        return (
          <group>
            {/* Balance base */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.4, 0.1, 0.3]} />
              <meshStandardMaterial color="#d1d5db" />
            </mesh>
            {/* Balance platform */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.02]} />
              <meshStandardMaterial color="#9ca3af" />
            </mesh>
            {/* Display */}
            <mesh position={[0.2, 0.15, 0]}>
              <boxGeometry args={[0.1, 0.05, 0.02]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          </group>
        );
      
      case 'GC-MS':
        return (
          <group>
            {/* Main unit */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[1.2, 0.4, 0.8]} />
              <meshStandardMaterial color="#e5e7eb" />
            </mesh>
            {/* Control panel */}
            <mesh position={[0, 0.4, 0.4]}>
              <boxGeometry args={[0.8, 0.1, 0.02]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
            {/* Injection port */}
            <mesh position={[-0.3, 0.4, 0.2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
          </group>
        );
      
      default:
        return (
          <mesh>
            <boxGeometry args={[0.5, 0.3, 0.5]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        );
    }
  };

  return (
    <group 
      position={position}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {getEquipmentModel()}
      
      {/* Interaction indicator */}
      {hovered && (
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.02]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      )}
      
      {/* Equipment label */}
      <group position={[0, 0.6, 0]}>
        <mesh>
          <planeGeometry args={[1, 0.2]} />
          <meshBasicMaterial 
            color="#1f2937" 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      </group>
    </group>
  );
}