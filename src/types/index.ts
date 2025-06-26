// Core game types and Firebase data models

export interface User {
  id: string;
  email: string;
  displayName: string;
  laboratoryId: string;
  createdAt: Date;
  lastLogin: Date;
  level: number;
  experience: number;
  budget: number;
}

export interface Laboratory {
  id: string;
  ownerId: string;
  name: string;
  level: number;
  layout: LabLayout;
  equipment: Equipment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LabLayout {
  width: number;
  height: number;
  objects: LabObject[];
}

export interface LabObject {
  id: string;
  type: 'equipment' | 'furniture' | 'decoration';
  equipmentId?: string;
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  brand: string;
  model: string;
  purchasePrice: number;
  maintenanceCost: number;
  capabilities: AnalyticalCapability[];
  status: EquipmentStatus;
  configuration: EquipmentConfig;
  purchasedAt: Date;
  lastMaintenance: Date;
}

export type EquipmentType = 
  | 'GC' 
  | 'GC-MS' 
  | 'GCxGC-MS' 
  | 'HPLC' 
  | 'LC-MS' 
  | 'UV-VIS' 
  | 'FTIR' 
  | 'NMR' 
  | 'XRD' 
  | 'SEM' 
  | 'balance' 
  | 'centrifuge' 
  | 'oven' 
  | 'freezer';

export type EquipmentStatus = 'operational' | 'maintenance' | 'broken' | 'upgrading';

export interface AnalyticalCapability {
  technique: string;
  matrices: MatrixType[];
  detectionLimit: number;
  accuracy: number;
  precision: number;
  analysisTime: number; // in minutes
}

export type MatrixType = 'solid' | 'liquid' | 'gas' | 'biological' | 'environmental';

export interface EquipmentConfig {
  [key: string]: unknown;
  // Equipment-specific configuration parameters
  temperature?: number;
  pressure?: number;
  flowRate?: number;
  injectionVolume?: number;
  columnType?: string;
  detectorSettings?: DetectorSettings;
}

export interface DetectorSettings {
  sensitivity: number;
  range: [number, number];
  mode: string;
}

export interface Sample {
  id: string;
  qrCode: string;
  name: string;
  description: string;
  matrix: MatrixType;
  origin: string;
  collectedAt: Date;
  submittedBy: string;
  status: SampleStatus;
  preparationSteps: PreparationStep[];
  analyses: Analysis[];
  createdAt: Date;
  updatedAt: Date;
}

export type SampleStatus = 
  | 'received' 
  | 'preparation' 
  | 'analysis' 
  | 'completed' 
  | 'archived' 
  | 'rejected';

export interface PreparationStep {
  id: string;
  name: string;
  description: string;
  equipmentRequired: string[];
  parameters: { [key: string]: unknown };
  completedAt?: Date;
  completedBy?: string;
}

export interface Analysis {
  id: string;
  sampleId: string;
  equipmentId: string;
  method: AnalyticalMethod;
  parameters: AnalysisParameters;
  results: AnalysisResult[];
  status: AnalysisStatus;
  startedAt: Date;
  completedAt?: Date;
  analyzedBy: string;
}

export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AnalyticalMethod {
  id: string;
  name: string;
  technique: string;
  targetCompounds: string[];
  matrixCompatibility: MatrixType[];
  preparationRequired: string[];
  estimatedTime: number;
}

export interface AnalysisParameters {
  [key: string]: unknown;
  runTime?: number;
  temperature?: number;
  injectionVolume?: number;
  detectorMode?: string;
}

export interface AnalysisResult {
  compound: string;
  concentration: number;
  unit: string;
  detectionLimit: number;
  uncertainty: number;
  peakArea?: number;
  retentionTime?: number;
  confirmed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  client: string;
  difficulty: MissionDifficulty;
  objectives: MissionObjective[];
  rewards: MissionReward;
  deadline: Date;
  status: MissionStatus;
  requiredEquipment: EquipmentType[];
  sampleProvided: Sample;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}

export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type MissionStatus = 'available' | 'accepted' | 'in_progress' | 'completed' | 'failed' | 'expired';

export interface MissionObjective {
  id: string;
  description: string;
  targetCompound: string;
  requiredAccuracy: number;
  completed: boolean;
  result?: AnalysisResult;
}

export interface MissionReward {
  money: number;
  experience: number;
  equipment?: Equipment;
  unlocks?: string[];
}

export interface Player {
  id: string;
  position: Vector3D;
  rotation: number;
  isMoving: boolean;
  currentRoom: string;
  interactionTarget?: string;
}

export interface GameState {
  player: Player;
  currentLaboratory: Laboratory | null;
  activeMissions: Mission[];
  inventory: InventoryItem[];
  currentSample?: Sample;
  ui: UIState;
}

export interface InventoryItem {
  id: string;
  type: 'sample' | 'reagent' | 'consumable' | 'tool';
  name: string;
  quantity: number;
  properties: { [key: string]: unknown };
}

export interface UIState {
  showLIMS: boolean;
  showInventory: boolean;
  showMissions: boolean;
  activeEquipmentInterface?: string;
  showQRScanner: boolean;
  notifications: GameNotification[];
}

export interface GameNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Input and control types
export interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  inventory: boolean;
  menu: boolean;
}

// Firebase collection names
export interface FirebaseCollections {
  users: 'users';
  laboratories: 'laboratories';
  samples: 'samples';
  missions: 'missions';
  analyses: 'analyses';
  equipment: 'equipment';
}