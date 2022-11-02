import create from 'zustand';

export const useStore = create((set, get) => ({
  /// ////////////////////////////////////////////////////////
  // Menu
  /// ////////////////////////////////////////////////////////
  menuVisible: false,
  setMenuVisible: v => set({menuVisible: v}),
  /// ////////////////////////////////////////////////////////
  // Generate
  /// ////////////////////////////////////////////////////////
  mapWidth: 52,
  setMapWidth: v => set({mapWidth: v}),
  mapHeight: 28,
  setMapHeight: v => set({mapHeight: v}),
  mapGutterWidth: 1,
  setMapGutterWidth: v => set({mapGutterWidth: v}),
  iterations: 4,
  setIterations: v => set({iterations: v}),
  containerSplitRetries: 30,
  setContainerSplitRetries: v => set({containerSplitRetries: v}),
  containerMinimumRatio: 0.45,
  setContainerMinimumRatio: v => set({containerMinimumRatio: v}),
  containerMinimumSize: 4,
  setContainerMinimumSize: v => set({containerMinimumSize: v}),
  corridorWidth: 2,
  setCorridorWidth: v => set({corridorWidth: v}),
  tileWidth: 32,
  setTileWidth: v => set({tileWidth: v}),
  debug: true,
  setDebug: v => set({debug: v}),
}));
