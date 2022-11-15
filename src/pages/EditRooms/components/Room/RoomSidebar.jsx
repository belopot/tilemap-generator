import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {InputText} from 'primereact/inputtext';
import {InputNumber} from 'primereact/inputnumber';
import {Checkbox} from 'primereact/checkbox';
import {Divider} from 'primereact/divider';
import {Dropdown} from 'primereact/dropdown';

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
            className="w-full"
            value={id}
            onChange={e => setId(e.target.value)}
          />
        </div>
        {/* Type */}
        <div className="field col-12">
          <label htmlFor="">Type:</label>
          <Dropdown
            className="w-full"
            value={type}
            options={RoomTypes}
            onChange={e => {
              setType(e.value);
            }}
            placeholder="Select a type"
          />
        </div>
        {/* Width */}
        <div className="field col-12">
          <label htmlFor="">Width</label>
          <InputNumber
            className="w-full"
            value={width}
            onValueChange={e => setWidth(e.value)}
          />
        </div>
        {/* Height */}
        <div className="field col-12">
          <label htmlFor="">Height</label>
          <InputNumber
            className="w-full"
            value={height}
            onValueChange={e => setHeight(e.value)}
          />
        </div>
        <Divider />
        {/* Layer */}
        <div className="field col-12">
          <label htmlFor="">Layer</label>
          <Dropdown
            className="w-full"
            value={selectedLayer}
            options={TileLayers}
            onChange={e => {
              selectLayer(e.value);
            }}
            placeholder="Select a layer"
          />
        </div>
        {/* Tile */}
        <div className="field col-12">
          <label htmlFor="">Tile</label>
          <Dropdown
            className="w-full"
            value={selectedTile}
            options={getTilesForLayer(selectedLayer)}
            onChange={e => {
              selectTile(e.value);
            }}
            placeholder="Select a tile"
          />
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
  width: 18em;
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
