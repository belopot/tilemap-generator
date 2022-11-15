import React from 'react';
import {useRooms} from 'hooks/rooms';
import RoomsListHeader from './RoomsListHeader';
import RoomListItem from './RoomListItem';

export default function RoomsList() {
  const {rooms, selectedRoomId, addRoom, selectRoom, removeRoom} = useRooms();

  return (
    <div>
      <RoomsListHeader />
      <div className="flex flex-column pt-2">
        {rooms.map((room, index) => (
          <RoomListItem
            key={room.id}
            index={index}
            room={room}
            selected={selectedRoomId === room.id}
            onClick={() => selectRoom(room.id)}
            onDelete={() => removeRoom(room.id)}
          />
        ))}
      </div>
    </div>
  );
}
