import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {
  MonsterTypes,
  PropTypes,
  RoomTypes,
  TileLayers,
  TileTypes,
} from 'libs/generate/types';
import {useRooms} from 'hooks/rooms';

/**
 * The selected room base parameters.
 */
export function RoomSidebar(props) {
  const {room, onUpdate} = props;
  const [oldId, setOldId] = useState(room.id); // Keep a ref to the old id since ids can be changed
  const [id, setId] = useState(room.id);
  const [type, setType] = useState(room.type);
  const [width, setWidth] = useState(room.width);
  const [height, setHeight] = useState(room.height);
  const {
    selectedLayer,
    selectedTile,
    debug,
    selectLayer,
    selectTile,
    setDebug,
  } = useRooms();

  /** When the room is updated we reset all the fields */
  useEffect(() => {
    setOldId(room.id);
    setId(room.id);
    setType(room.type);
    setWidth(room.width);
    setHeight(room.height);
  }, [room.id]);

  useEffect(() => {
    if (
      room.id !== id ||
      room.type !== type ||
      room.width !== width ||
      room.height !== height
    ) {
      onUpdate(
        {
          id,
          type,
          width,
          height,
        },
        oldId,
      );
    }
  }, [id, type, width, height]);

  return (
    <Holder>
      {/* Params */}
      <div
        style={{
          padding: 16,
        }}
      >
        <p>Params</p>

        {/* Id */}
        <p>Id:</p>
        <input
          style={{width: '100%'}}
          type="text"
          value={id}
          onChange={event => setId(event.target.value)}
        />

        {/* Type */}
        <p>Type:</p>
        <select
          style={{width: '100%'}}
          value={type}
          onChange={event => setType(event.target.value)}
        >
          {RoomTypes.map(roomType => (
            <option key={roomType} value={roomType}>
              {roomType}
            </option>
          ))}
        </select>

        {/* Width */}
        <p>Width:</p>
        <input
          style={{width: '100%'}}
          type="number"
          value={width}
          onChange={event => setWidth(Number.parseInt(event.target.value))}
        />

        {/* Height */}
        <p>Height:</p>
        <input
          style={{width: '100%'}}
          type="number"
          value={height}
          onChange={event => setHeight(Number.parseInt(event.target.value))}
        />
      </div>

      {/* Layers */}
      <div
        style={{
          padding: 16,
        }}
      >
        <p>Layer</p>

        {/* Layer */}
        <p>Selected layer:</p>
        <select
          value={selectedLayer}
          onChange={event => selectLayer(event.target.value)}
        >
          {TileLayers.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Tile */}
        <p>Selected tile:</p>
        <select
          value={selectedTile}
          onChange={event => selectTile(event.target.value)}
        >
          {getTilesForLayer(selectedLayer).map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Debug */}
      <div
        style={{
          padding: 16,
        }}
      >
        <p>Debug</p>

        <label>
          <input
            type="checkbox"
            style={{marginRight: 8}}
            checked={debug}
            onChange={event => setDebug(event.target.checked)}
          />
          Show grid?
        </label>
      </div>
    </Holder>
  );
}

const Holder = styled.div`
  width: 15em;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-y: auto;
`;

/**
 * Return a list of tiles given a layer.
 */
function getTilesForLayer(layer) {
  switch (layer) {
    case 'tiles':
      return TileTypes;
    case 'props':
      return PropTypes;
    case 'monsters':
      return MonsterTypes;
  }
}
