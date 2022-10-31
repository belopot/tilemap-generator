import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import PageTransition from 'components/PageTransition';
import Sidebar from './components/Sidebar';
import {DungeonDrawer} from 'libs/DungeonDrawer';
import {nanoid} from 'nanoid';
import {useStore} from 'state/store';
import {generate} from 'libs/generate';
import {Data, Download} from 'libs/utils';

export default function Generate() {
  const mapWidth = useStore(state => state.mapWidth);
  const mapHeight = useStore(state => state.mapHeight);
  const mapGutterWidth = useStore(state => state.mapGutterWidth);
  const iterations = useStore(state => state.iterations);
  const containerMinimumSize = useStore(state => state.containerMinimumSize);
  const containerSplitRetries = useStore(state => state.containerSplitRetries);
  const containerMinimumRatio = useStore(state => state.containerMinimumRatio);
  const corridorWidth = useStore(state => state.corridorWidth);
  const tileWidth = useStore(state => state.tileWidth);
  const debug = useStore(state => state.debug);

  const canvasRef = useRef();
  const canvasDrawerRef = useRef();
  const dungeonRef = useRef();
  const seedRef = useRef();

  const [canvasWidth, setCanvasWidth] = useState(100);
  const [canvasHeight, setCanvasHeight] = useState(100);

  const draw = args => {
    try {
      const dungeon = generate({
        ...args,
        rooms: Data.loadRooms(),
      });
      dungeonRef.current = dungeon;

      canvasDrawerRef.current.draw(dungeon, {
        debug: args.debug,
        unitWidthInPixels: args.tileWidth,
      });

      setCanvasWidth(args.mapWidth * args.tileWidth);
      setCanvasHeight(args.mapHeight * args.tileWidth);
    } catch (error) {
      console.error(error.message);
      canvasDrawerRef.current.clear();
    }
  };

  const onGenerate = () => {
    const seed = nanoid();
    seedRef.current = seed;

    const args = {
      mapWidth,
      mapHeight,
      mapGutterWidth,
      iterations,
      containerMinimumSize,
      containerMinimumRatio,
      containerSplitRetries,
      corridorWidth,
      tileWidth,
      seed,
      debug,
    };

    draw(args);
  };

  const onDownload = () => {
    if (dungeonRef.current) {
      Download.downloadJSON(dungeonRef.current, 'dungeon.json');
    }
  };

  const onDebug = () => {
    if (dungeonRef.current) {
      const args = {
        mapWidth,
        mapHeight,
        mapGutterWidth,
        iterations,
        containerMinimumSize,
        containerMinimumRatio,
        containerSplitRetries,
        corridorWidth,
        tileWidth,
        seed: seedRef.current,
        debug,
      };

      draw(args);
    }
  };

  useEffect(() => {
    canvasDrawerRef.current = new DungeonDrawer(canvasRef.current);
  }, []);

  useEffect(() => {
    onDebug();
  }, [debug]);

  console.log(canvasWidth, canvasHeight);

  return (
    <PageTransition>
      <Holder>
        <SidebarContainer>
          <Sidebar onGenerate={onGenerate} onDownload={onDownload} />
        </SidebarContainer>
        <CanvasContainer>
          <div
            ref={canvasRef}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
            }}
          ></div>
        </CanvasContainer>
      </Holder>
    </PageTransition>
  );
}

const Holder = styled.div`
  width: 100%;
  height: 100%;
  color: black;
  display: flex;
`;

const SidebarContainer = styled.div`
  min-width: 15em;
  width: 15em;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 1.5em;
`;

const CanvasContainer = styled.div`
  flex: 1 0 auto;
  height: 100%;
  overflow: auto;
  background-color: #25131a;
`;
