import React, {useState} from 'react';
import styled from 'styled-components';
import {Button} from 'primereact/button';

export default function RoomListItem(props) {
  const {index, room, selected, onClick, onDelete} = props;
  const [hovered, setHovered] = useState(false);

  const handleDelete = event => {
    event.preventDefault();
    onDelete(room.id);
  };

  return (
    <Holder
      bg={hovered || selected ? `rgba(0,0,0,0.2)` : 'transparent'}
      onClick={() => onClick(room.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span>{room.id}</span>
      {hovered && (
        <DeleteButton
          icon="pi pi-trash"
          className="p-button-rounded p-button-text p-button-sm"
          aria-label="Delete"
          onClick={handleDelete}
        />
      )}
    </Holder>
  );
}

const Holder = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: ${props => props.bg};
  transition: all 0.2s ease-out;
  padding: 0.8em 1em;
  border-radius: 8px;
  cursor: pointer;
`;

const DeleteButton = styled(Button)`
  position: absolute;
  top: 50%;
  right: 0.5em;
  z-index: 1;
  transform: translate(0, -50%);
`;
