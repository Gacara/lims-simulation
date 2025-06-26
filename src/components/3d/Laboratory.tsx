import { Player } from './Player';
import { LabEquipment } from './LabEquipment';
import type { Laboratory as LabType } from '../../types';

interface LaboratoryProps {
  laboratory: LabType;
}

export function Laboratory({ laboratory }: LaboratoryProps) {
  return (
    <group>
      {/* Laboratory floor */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[laboratory.layout.width || 20, 0.2, laboratory.layout.height || 20]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Laboratory walls */}
      <group>
        {/* Back wall */}
        <mesh position={[0, 2.5, 10]}>
          <boxGeometry args={[20, 5, 0.2]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        
        {/* Left wall */}
        <mesh position={[-10, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 20]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        
        {/* Right wall */}
        <mesh position={[10, 2.5, 0]}>
          <boxGeometry args={[0.2, 5, 20]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
      </group>

      {/* Ceiling */}
      <mesh position={[0, 5.1, 0]}>
        <boxGeometry args={[20, 0.2, 20]} />
        <meshStandardMaterial color="#f9fafb" />
      </mesh>

      {/* Laboratory bench/table */}
      <group position={[0, 0, 3]}>
        <mesh position={[0, 0.9, 0]} receiveShadow>
          <boxGeometry args={[8, 0.1, 2]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        {/* Table legs */}
        <mesh position={[-3.5, 0.45, 0.8]}>
          <boxGeometry args={[0.1, 0.9, 0.1]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh position={[3.5, 0.45, 0.8]}>
          <boxGeometry args={[0.1, 0.9, 0.1]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh position={[-3.5, 0.45, -0.8]}>
          <boxGeometry args={[0.1, 0.9, 0.1]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        <mesh position={[3.5, 0.45, -0.8]}>
          <boxGeometry args={[0.1, 0.9, 0.1]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      </group>

      {/* Sample equipment on the lab bench */}
      <LabEquipment 
        type="balance" 
        position={[-2, 1.0, 3]} 
        id="balance-1"
      />
      
      <LabEquipment 
        type="GC-MS" 
        position={[2, 1.0, 3]} 
        id="gc-ms-1"
      />

      {/* Player character */}
      <Player position={[0, 0, -2]} />
    </group>
  );
}