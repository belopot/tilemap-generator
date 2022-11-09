import React, {
  createContext,
  useState,
  useMemo,
  useContext,
  useEffect,
} from 'react';
import {RoomTypes} from 'libs/generate/types';
import {createTilemap} from 'libs/generate/utils';
import {Data, Download} from 'libs/utils';

export const RoomsFilters = [...RoomTypes, 'all'];
export const RoomsContext = createContext({
  rooms: [],
  roomsFilter: 'all',
  selectedRoomId: null,
  selectedLayer: 'tiles',
  selectedTile: '',
  debug: false,
  addRoom: () => {},
  updateRoom: () => {},
  removeRoom: () => {},
  selectRoom: () => {},
  selectLayer: () => {},
  selectTile: () => {},
  filterRooms: () => {},
  saveRooms: () => {},
  loadRooms: () => {},
  setDebug: () => {},
});

export function CollectionsProvider(props) {
  const {children} = props;
  const [rooms, setRooms] = useState([]);
  const [roomsFilter, setRoomsFilter] = useState('all');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState('tiles');
  const [selectedTile, setSelectedTile] = useState('');
  const [debug, setDebug] = useState(true);

  /** Add a room */
  const addRoom = () => {
    const id = String(Date.now());
    setRooms(prev => {
      const updatedRooms = [...prev];
      updatedRooms.push({
        id,
        width: 8,
        height: 8,
        type: roomsFilter === 'all' ? 'monsters' : roomsFilter,
        layers: {
          tiles: createTilemap(8, 8, 0),
          props: createTilemap(8, 8, 0),
          monsters: createTilemap(8, 8, 0),
        },
      });

      Data.saveRooms(updatedRooms);

      return updatedRooms;
    });
    setSelectedRoomId(id);
  };

  /** Update a room */
  const updateRoom = (updated, oldRoomId) => {
    setRooms(prev => {
      const index = prev.findIndex(item => item.id === oldRoomId);
      const updatedRooms = [...prev];
      updatedRooms[index] = {
        ...updatedRooms[index],
        ...updated,
      };

      Data.saveRooms(updatedRooms);

      return updatedRooms;
    });
    setSelectedRoomId(updated.id);
  };

  /** Remove a room */
  const removeRoom = roomId => {
    setRooms(prev => {
      const updatedRooms = [...prev];

      const index = prev.findIndex(item => item.id === roomId);
      if (index !== -1) {
        updatedRooms.splice(index, 1);
      }

      Data.saveRooms(updatedRooms);

      return updatedRooms;
    });
  };

  /** Select a room */
  const selectRoom = roomId => {
    setSelectedRoomId(roomId);
    setSelectedLayer('tiles');
  };

  /** Select a tile layer in the room */
  const selectLayer = layer => {
    setSelectedLayer(layer);
  };

  /** Select a tile in the layer */
  const selectTile = tileName => {
    setSelectedTile(tileName);
  };

  /** Filter rooms on their type */
  const filterRooms = type => {
    setRoomsFilter(type);
  };

  /** Save and download a JSON representation of the rooms */
  const saveRooms = () => {
    Download.downloadJSON(rooms, 'rooms.json');
  };

  /** Load and populate using a JSON representation of the rooms  */
  const loadRooms = loadedRooms => {
    setRooms(loadedRooms);
    setSelectedRoomId(null);
    setRoomsFilter('all');
    Data.saveRooms(loadedRooms);
  };

  // When updating the selected layer, update the selected tile accordingly
  useEffect(() => {
    switch (selectedLayer) {
      case 'tiles':
        setSelectedTile('Wall');
        break;
      case 'props':
        setSelectedTile('Peak');
        break;
      case 'monsters':
        setSelectedTile('Bandit');
        break;
    }
  }, [selectedLayer]);

  // Load rooms from localstorage when initialized
  useEffect(() => {
    loadRooms(Data.loadRooms());
  }, []);

  // Filter and sort rooms
  const filtered = useMemo(() => {
    const sorted = rooms.sort((a, b) => a.id.localeCompare(b.id));
    const filtered = sorted.filter(
      item => roomsFilter === 'all' || item.type === roomsFilter,
    );

    return filtered;
  }, [rooms, roomsFilter]);

  const value = useMemo(() => {
    return {
      rooms: filtered,
      roomsFilter,
      selectedRoomId,
      selectedLayer,
      selectedTile,
      debug,
      addRoom,
      updateRoom,
      removeRoom,
      selectRoom,
      selectLayer,
      selectTile,
      filterRooms,
      saveRooms,
      loadRooms,
      setDebug,
    };
  }, [rooms, roomsFilter, selectedRoomId, selectedLayer, selectedTile, debug]);

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
}

export function useRooms() {
  return useContext(RoomsContext);
}
