import React from 'react';
import styled from 'styled-components';

import {RoomsFilters, useRooms} from 'hooks/rooms';

export default function RoomsListHeader() {
  const {roomsFilter, filterRooms, addRoom} = useRooms();

  return (
    <Holder>
      <div>
        <p className="mb-1">Add new room</p>
        <input type="button" value="+ Add room" onClick={addRoom} />
      </div>
      <div>
        <p className="mb-1">Filter rooms</p>
        <select
          value={roomsFilter}
          onChange={event => filterRooms(event.target.value)}
        >
          {RoomsFilters.map(filter => (
            <option key={filter} value={filter}>
              {filter}
            </option>
          ))}
        </select>
      </div>
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
  > div {
    display: flex;
    flex-direction: column;
  }
`;
