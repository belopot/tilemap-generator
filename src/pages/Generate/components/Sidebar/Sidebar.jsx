import React from 'react';
import styled from 'styled-components';
import {InputNumber} from 'primereact/inputnumber';
import {useStore} from 'state/store';
import {Checkbox} from 'primereact/checkbox';
import {Button} from 'primereact/button';

export default function Sidebar({onGenerate, onDownload}) {
  const mapWidth = useStore(state => state.mapWidth);
  const setMapWidth = useStore(state => state.setMapWidth);
  const mapHeight = useStore(state => state.mapHeight);
  const setMapHeight = useStore(state => state.setMapHeight);
  const mapGutterWidth = useStore(state => state.mapGutterWidth);
  const setMapGutterWidth = useStore(state => state.setMapGutterWidth);
  const iterations = useStore(state => state.iterations);
  const setIterations = useStore(state => state.setIterations);
  const containerMinimumSize = useStore(state => state.containerMinimumSize);
  const setContainerMinimumSize = useStore(
    state => state.setContainerMinimumSize,
  );
  const containerSplitRetries = useStore(state => state.containerSplitRetries);
  const setContainerSplitRetries = useStore(
    state => state.setContainerSplitRetries,
  );
  const containerMinimumRatio = useStore(state => state.containerMinimumRatio);
  const setContainerMinimumRatio = useStore(
    state => state.setContainerMinimumRatio,
  );
  const corridorWidth = useStore(state => state.corridorWidth);
  const setCorridorWidth = useStore(state => state.setCorridorWidth);
  const tileWidth = useStore(state => state.tileWidth);
  const setTileWidth = useStore(state => state.setTileWidth);
  const debug = useStore(state => state.debug);
  const setDebug = useStore(state => state.setDebug);

  return (
    <Holder className="p-fluid grid formgrid">
      <div className="field col-12">
        <label htmlFor="map_width">Map width</label>
        <InputNumber
          inputId="map_width"
          className="p-inputtext-sm"
          value={mapWidth}
          onValueChange={e => setMapWidth(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="map_height">Map height</label>
        <InputNumber
          inputId="map_height"
          className="p-inputtext-sm"
          value={mapHeight}
          onValueChange={e => setMapHeight(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="map_gutter">Map gutter</label>
        <InputNumber
          inputId="map_gutter"
          className="p-inputtext-sm"
          value={mapGutterWidth}
          onValueChange={e => setMapGutterWidth(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="iterations">Iterations</label>
        <InputNumber
          inputId="iterations"
          className="p-inputtext-sm"
          value={iterations}
          onValueChange={e => setIterations(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="con_split_retries">Container split retries</label>
        <InputNumber
          inputId="con_split_retries"
          className="p-inputtext-sm"
          value={containerSplitRetries}
          onValueChange={e => setContainerSplitRetries(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="con_size_ratio">Container size ratio</label>
        <InputNumber
          inputId="con_size_ratio"
          className="p-inputtext-sm"
          value={containerMinimumRatio}
          onValueChange={e => setContainerMinimumRatio(e.value)}
          mode="decimal"
          minFractionDigits={2}
          maxFractionDigits={2}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="con_min_size">Container min size</label>
        <InputNumber
          inputId="con_min_size"
          className="p-inputtext-sm"
          value={containerMinimumSize}
          onValueChange={e => setContainerMinimumSize(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="corridor_width">Corridor width</label>
        <InputNumber
          inputId="corridor_width"
          className="p-inputtext-sm"
          value={corridorWidth}
          onValueChange={e => setCorridorWidth(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="tile_width">Tile width</label>
        <InputNumber
          inputId="tile_width"
          className="p-inputtext-sm"
          value={tileWidth}
          onValueChange={e => setTileWidth(e.value)}
        />
      </div>
      <div className="field-checkbox col-12">
        <Checkbox
          inputId="debug"
          checked={debug}
          onChange={e => setDebug(e.checked)}
        />
        <label htmlFor="debug">Debug</label>
      </div>
      <Button
        className="mt-4 mb-3"
        label="Generate"
        aria-label="Generate"
        onClick={onGenerate}
      />
      <Button label="Download" aria-label="Download" onClick={onDownload} />
    </Holder>
  );
}

const Holder = styled.div``;
