import React, {useState} from 'react';
import styled from 'styled-components';

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
      title={room.id}
      onClick={() => onClick(room.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p>{room.id}</p>
      {/* When hovered, display a delete button */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            right: 8,
          }}
          onClick={handleDelete}
        >
          🗑️
        </div>
      )}
    </Holder>
  );
}

const Holder = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.bg};
  cursor: pointer;
  transition: all 0.2s ease-out;
  padding: 0.7em 1em;
`;
