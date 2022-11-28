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
  isManualSeed: true,
  setIsManualSeed: v => set({isManualSeed: v}),
  seed: 'IRQKIJRx1aTTgDnnvsI5y',
  setSeed: v => set({seed: v}),
  mapWidth: 40,
  setMapWidth: v => set({mapWidth: v}),
  mapHeight: 25,
  setMapHeight: v => set({mapHeight: v}),
  mapGutterWidth: 2,
  setMapGutterWidth: v => set({mapGutterWidth: v}),
  iterations: 9,
  setIterations: v => set({iterations: v}),
  containerSplitRetries: 30,
  setContainerSplitRetries: v => set({containerSplitRetries: v}),
  containerMinimumRatio: 0.45,
  setContainerMinimumRatio: v => set({containerMinimumRatio: v}),
  containerMinimumSize: 4,
  setContainerMinimumSize: v => set({containerMinimumSize: v}),
  corridorWidth: 4,
  setCorridorWidth: v => set({corridorWidth: v}),
  tileWidth: 32,
  setTileWidth: v => set({tileWidth: v}),
  isThree: true,
  setIsThree: v => set({isThree: v}),
  debug: true,
  setDebug: v => set({debug: v}),
  //
  loaderVisible: false,
  setLoaderVisible: v => set({loaderVisible: v}),
}));
