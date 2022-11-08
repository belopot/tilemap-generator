import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {InputText} from 'primereact/inputtext';
import {InputNumber} from 'primereact/inputnumber';
import {Checkbox} from 'primereact/checkbox';
import {Divider} from 'primereact/divider';

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
      <div className="formgrid grid">
        {/* Id */}
        <div className="field col-12">
          <label htmlFor="">Id:</label>
          <InputText
            className="w-full p-inputtext-sm"
            value={id}
            onChange={e => setId(e.target.value)}
          />
        </div>
        {/* Type */}
        <div className="field col-12">
          <label htmlFor="">Type:</label>
          <select
            className="w-full"
            value={type}
            onChange={event => setType(event.target.value)}
          >
            {RoomTypes.map(roomType => (
              <option key={roomType} value={roomType}>
                {roomType}
              </option>
            ))}
          </select>
        </div>
        {/* Width */}
        <div className="field col-12">
          <label htmlFor="width">Width</label>
          <InputNumber
            id="width"
            className="w-full p-inputtext-sm"
            value={width}
            onValueChange={e => setWidth(e.value)}
          />
        </div>
        {/* Height */}
        <div className="field col-12">
          <label htmlFor="height">Height</label>
          <InputNumber
            id="height"
            className="w-full p-inputtext-sm"
            value={height}
            onValueChange={e => setHeight(e.value)}
          />
        </div>
        <Divider />
        {/* Selected layer */}
        <div className="field col-12">
          <label htmlFor="">Selected layer</label>
          <select
            className="w-full"
            value={selectedLayer}
            onChange={event => selectLayer(event.target.value)}
          >
            {TileLayers.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        {/* Selected tile */}
        <div className="field col-12">
          <label htmlFor="">Selected tile</label>
          <select
            className="w-full"
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
        <Divider />
        {/* Debug */}
        <div className="field-checkbox col-12">
          <Checkbox
            id="debug"
            checked={debug}
            onChange={e => setDebug(e.checked)}
          />
          <label htmlFor="debug">Debug</label>
        </div>
      </div>
    </Holder>
  );
}

const Holder = styled.div`
  width: 15em;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  padding: 1em;
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
