import React from 'react';
import styled from 'styled-components';
import {InputNumber} from 'primereact/inputnumber';
import {useStore} from 'state/store';
import {Checkbox} from 'primereact/checkbox';
import {Button} from 'primereact/button';
import FileInput from 'components/FileInput';

export default function Sidebar({onGenerate, onDownload, onLoad, onClear}) {
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
    <Holder className="formgrid grid">
      <div className="field col-12">
        <Button
          className="w-full"
          label="Generate"
          aria-label="Generate"
          onClick={onGenerate}
        />
      </div>
      <div className="field col-12">
        <FileInput className="w-full" onChange={onLoad} placeholder="Load" />
      </div>
      <div className="field col-12">
        <Button
          className="w-full"
          label="Clear"
          aria-label="Clear"
          onClick={onClear}
        />
      </div>
      <div className="field col-12">
        <Button
          className="w-full"
          label="Export to json"
          aria-label="Export to json"
          onClick={onDownload}
        />
      </div>
      <div className="mt-4 field col-12">
        <label htmlFor="map_width">Map width</label>
        <InputNumber
          id="map_width"
          className="w-full p-inputtext-sm"
          value={mapWidth}
          onValueChange={e => setMapWidth(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="map_height">Map height</label>
        <InputNumber
          id="map_height"
          className="w-full p-inputtext-sm"
          value={mapHeight}
          onValueChange={e => setMapHeight(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="map_gutter">Map gutter</label>
        <InputNumber
          id="map_gutter"
          className="w-full p-inputtext-sm"
          value={mapGutterWidth}
          onValueChange={e => setMapGutterWidth(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="iterations">Iterations</label>
        <InputNumber
          id="iterations"
          className="w-full p-inputtext-sm"
          value={iterations}
          onValueChange={e => setIterations(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="con_split_retries">Container split retries</label>
        <InputNumber
          id="con_split_retries"
          className="w-full p-inputtext-sm"
          value={containerSplitRetries}
          onValueChange={e => setContainerSplitRetries(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="con_size_ratio">Container size ratio</label>
        <InputNumber
          id="con_size_ratio"
          className="w-full p-inputtext-sm"
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
          id="con_min_size"
          className="w-full p-inputtext-sm"
          value={containerMinimumSize}
          onValueChange={e => setContainerMinimumSize(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="corridor_width">Corridor width</label>
        <InputNumber
          id="corridor_width"
          className="w-full p-inputtext-sm"
          value={corridorWidth}
          onValueChange={e => setCorridorWidth(e.value)}
        />
      </div>
      <div className="field col-12">
        <label htmlFor="tile_width">Tile width</label>
        <InputNumber
          id="tile_width"
          className="w-full p-inputtext-sm"
          value={tileWidth}
          onValueChange={e => setTileWidth(e.value)}
        />
      </div>
      <div className="field-checkbox col-12">
        <Checkbox
          id="debug"
          checked={debug}
          onChange={e => setDebug(e.checked)}
        />
        <label htmlFor="debug">Debug</label>
      </div>
    </Holder>
  );
}

const Holder = styled.div``;
