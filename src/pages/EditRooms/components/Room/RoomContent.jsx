import React, {useRef, useEffect} from 'react';
import styled from 'styled-components';

import {MonsterType, PropType, TileType} from 'libs/generate/types';
import {EditorPixiDrawer} from 'libs/drawers/EditorPixiDrawer';
import {useRooms} from 'hooks/rooms';

/**
 * The selected room tiles editor.
 */
export function RoomContent(props) {
  const {room, onUpdate} = props;
  const canvasRef = useRef();
  const canvasDrawer = useRef();
  const {selectedLayer, selectedTile, debug} = useRooms();

  const onTileClick = (x, y) => {
    const layer = room.layers[selectedLayer];
    if (x >= room.width || y >= room.height) {
      return;
    }

    const tileId = layer[y][x];
    const newTileId = getTileIdFromName(selectedLayer, selectedTile);
    onUpdate(selectedLayer, x, y, tileId !== 0 && tileId === newTileId ? 0 : newTileId);
  };

  // Initialize the canvas drawer
  useEffect(() => {
    if (!canvasDrawer.current) {
      canvasDrawer.current = new EditorPixiDrawer(canvasRef.current);
    }

    canvasDrawer.current.onTileClick = onTileClick;
  }, [canvasRef, room, selectedLayer, selectedTile]);

  // Update drawer when room changes
  useEffect(() => {
    canvasDrawer.current.drawLayers(room.layers, {
      selectedLayer,
      debug,
    });
  }, [room, selectedLayer, debug]);

  return (
    <Holder>
      <div ref={canvasRef} />
    </Holder>
  );
}

const Holder = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  overflow: auto;
`;

/**
 * Return a tile's id given a layer and its name.
 */
function getTileIdFromName(layer, tileName) {
  switch (layer) {
    case 'tiles':
      return TileType[tileName];
    case 'props':
      return PropType[tileName];
    case 'monsters':
      return MonsterType[tileName];
  }
}
