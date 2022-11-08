import React from 'react';
import styled from 'styled-components';
import {Button} from 'primereact/button';
import {Dropdown} from 'primereact/dropdown';

import {RoomsFilters, useRooms} from 'hooks/rooms';

const Options = [];
RoomsFilters.map(filter =>
  Options.push({
    label: filter,
    value: filter,
  }),
);

export default function RoomsListHeader() {
  const {roomsFilter, filterRooms, addRoom} = useRooms();

  return (
    <Holder>
      <Button
        className="w-full"
        label="Add room"
        aria-label="Add room"
        onClick={addRoom}
      />
      <Dropdown
        value={roomsFilter}
        options={Options}
        onChange={e => {
          filterRooms(e.value);
        }}
        optionLabel="label"
        optionValue="value"
        placeholder="Filter rooms"
      />
    </Holder>
  );
}

const Holder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
`;
