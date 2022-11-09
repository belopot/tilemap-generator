import React, {useEffect, useRef, useState} from 'react';
import {nanoid} from 'nanoid';

import {useStore} from 'state/store';
import {DungeonPixiDrawer} from 'libs/drawers/DungeonPixiDrawer';
import {generate} from 'libs/generate';
import {Data, Download} from 'libs/utils';
import PageTransition from 'components/PageTransition';
import {
  ContentContainer,
  PageContainer,
  SidebarContainer,
} from 'components/Containers';
import Sidebar from './components/Sidebar';

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

  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const onDraw = args => {
    try {
      const dungeon = generate({
        ...args,
        rooms: Data.loadRooms(),
      });
      dungeonRef.current = dungeon;

      canvasDrawerRef.current.drawAll(dungeon, {
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

    onDraw(args);
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

      onDraw(args);
    }
  };

  useEffect(() => {
    canvasDrawerRef.current = new DungeonPixiDrawer(canvasRef.current);
  }, []);

  useEffect(() => {
    onDebug();
  }, [debug]);

  return (
    <PageTransition>
      <PageContainer>
        <SidebarContainer>
          <Sidebar onGenerate={onGenerate} onDownload={onDownload} />
        </SidebarContainer>
        <ContentContainer>
          <div
            ref={canvasRef}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
            }}
          ></div>
        </ContentContainer>
      </PageContainer>
    </PageTransition>
  );
}
