import * as React from 'react';
import {useRooms} from 'hooks/rooms';
import {RoomContent} from './RoomContent';
import {RoomEmpty} from './RoomEmpty';

/**
 * The currently selected room.
 */
export default function Room() {
  const {rooms, selectedRoomId, updateRoom} = useRooms();

  const room = rooms.find(item => item.id === selectedRoomId);
  if (!room) {
    return <RoomEmpty />;
  }

  /** When a tile is updated in a layer */
  const onTileUpdate = (layer, x, y, value) => {
    const updated = {
      ...room,
    };

    updated.layers[layer][y][x] = value;
    updateRoom(updated, room.id);
  };

  return (
    <div>
      <RoomContent room={room} onUpdate={onTileUpdate} />
    </div>
  );
}
