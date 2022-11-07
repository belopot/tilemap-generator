import * as React from 'react';
import {useRooms} from 'hooks/rooms';
import {RoomContent} from './RoomContent';
import {RoomEmpty} from './RoomEmpty';
import {resizeTileMap} from 'libs/generate';
import {RoomSidebar} from './RoomSidebar';

/**
 * The currently selected room.
 */
export default function Room() {
  const {rooms, selectedRoomId, updateRoom} = useRooms();

  const room = rooms.find(item => item.id === selectedRoomId);
  if (!room) {
    return <RoomEmpty />;
  }

  /** When a room's details are updated */
  const onDetailsUpdate = (params, oldRoomId) => {
    const updated = {
      ...room,
      ...params,
    };

    // If size of the map was changed, we want to update the corresponding layers
    if (params.width !== room.width || params.height !== room.height) {
      updated.layers.tiles = resizeTileMap(
        updated.layers.tiles,
        params.width,
        params.height,
      );
      updated.layers.props = resizeTileMap(
        updated.layers.props,
        params.width,
        params.height,
      );
      updated.layers.monsters = resizeTileMap(
        updated.layers.monsters,
        params.width,
        params.height,
      );
    }

    updateRoom(updated, oldRoomId);
  };

  /** When a tile is updated in a layer */
  const onTileUpdate = (layer, x, y, value) => {
    const updated = {
      ...room,
    };

    updated.layers[layer][y][x] = value;
    updateRoom(updated, room.id);
  };

  return (
    <>
      <RoomSidebar room={room} onUpdate={onDetailsUpdate} />
      <RoomContent room={room} onUpdate={onTileUpdate} />
    </>
  );
}
