import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  GameState, 
  Player, 
  Laboratory, 
  Mission, 
  Sample, 
  UIState,
  Vector3D,
  Controls 
} from '../types';

interface GameStore extends GameState {
  // Player actions
  updatePlayerPosition: (position: Vector3D) => void;
  updatePlayerRotation: (rotation: number) => void;
  setPlayerMoving: (isMoving: boolean) => void;
  setInteractionTarget: (target: string | undefined) => void;
  
  // Laboratory actions
  setCurrentLaboratory: (laboratory: Laboratory | null) => void;
  
  // Mission actions
  setActiveMissions: (missions: Mission[]) => void;
  addMission: (mission: Mission) => void;
  updateMission: (missionId: string, updates: Partial<Mission>) => void;
  
  // Sample actions
  setCurrentSample: (sample: Sample | undefined) => void;
  
  // UI actions
  toggleLIMS: () => void;
  toggleInventory: () => void;
  toggleMissions: () => void;
  setActiveEquipmentInterface: (equipmentId: string | undefined) => void;
  toggleQRScanner: () => void;
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
}

import type { GameNotification } from '../types';

const initialPlayer: Player = {
  id: 'player-1',
  position: { x: 0, y: 0, z: 0 },
  rotation: 0,
  isMoving: false,
  currentRoom: 'main-lab',
};

const initialUIState: UIState = {
  showLIMS: false,
  showInventory: false,
  showMissions: false,
  activeEquipmentInterface: undefined,
  showQRScanner: false,
  notifications: [],
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set) => ({
    // Initial state
    player: initialPlayer,
    currentLaboratory: null,
    activeMissions: [],
    inventory: [],
    currentSample: undefined,
    ui: initialUIState,

    // Player actions
    updatePlayerPosition: (position) =>
      set((state) => ({
        player: { ...state.player, position }
      })),

    updatePlayerRotation: (rotation) =>
      set((state) => ({
        player: { ...state.player, rotation }
      })),

    setPlayerMoving: (isMoving) =>
      set((state) => ({
        player: { ...state.player, isMoving }
      })),

    setInteractionTarget: (target) =>
      set((state) => ({
        player: { ...state.player, interactionTarget: target }
      })),

    // Laboratory actions
    setCurrentLaboratory: (laboratory) =>
      set({ currentLaboratory: laboratory }),

    // Mission actions
    setActiveMissions: (missions) =>
      set({ activeMissions: missions }),

    addMission: (mission) =>
      set((state) => ({
        activeMissions: [...state.activeMissions, mission]
      })),

    updateMission: (missionId, updates) =>
      set((state) => ({
        activeMissions: state.activeMissions.map((mission) =>
          mission.id === missionId ? { ...mission, ...updates } : mission
        )
      })),

    // Sample actions
    setCurrentSample: (sample) =>
      set({ currentSample: sample }),

    // UI actions
    toggleLIMS: () =>
      set((state) => ({
        ui: { ...state.ui, showLIMS: !state.ui.showLIMS }
      })),

    toggleInventory: () =>
      set((state) => ({
        ui: { ...state.ui, showInventory: !state.ui.showInventory }
      })),

    toggleMissions: () =>
      set((state) => ({
        ui: { ...state.ui, showMissions: !state.ui.showMissions }
      })),

    setActiveEquipmentInterface: (equipmentId) =>
      set((state) => ({
        ui: { ...state.ui, activeEquipmentInterface: equipmentId }
      })),

    toggleQRScanner: () =>
      set((state) => ({
        ui: { ...state.ui, showQRScanner: !state.ui.showQRScanner }
      })),

    addNotification: (notification) =>
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: [
            ...state.ui.notifications,
            {
              ...notification,
              id: `notification-${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
              read: false,
            }
          ]
        }
      })),

    markNotificationRead: (notificationId) =>
      set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        }
      })),

    clearNotifications: () =>
      set((state) => ({
        ui: { ...state.ui, notifications: [] }
      })),
  }))
);

// Controls store for handling keyboard/mouse input
interface ControlsStore {
  controls: Controls;
  updateControls: (updates: Partial<Controls>) => void;
  resetControls: () => void;
}

const initialControls: Controls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  interact: false,
  inventory: false,
  menu: false,
};

export const useControlsStore = create<ControlsStore>((set) => ({
  controls: initialControls,
  
  updateControls: (updates) =>
    set((state) => ({
      controls: { ...state.controls, ...updates }
    })),

  resetControls: () =>
    set({ controls: initialControls }),
}));