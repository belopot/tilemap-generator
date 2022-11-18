import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {nanoid} from 'nanoid';
import {useMeasure} from 'react-use';

import {useStore} from 'state/store';
import {generate} from 'libs/generate';
import {Data, Download} from 'libs/utils';
import ThreeDrawer from 'libs/drawers/ThreeDrawer';
import {DungeonPixiDrawer} from 'libs/drawers/DungeonPixiDrawer';
import PageTransition from 'components/PageTransition';
import {
  ContentContainer,
  PageContainer,
  SidebarContainer,
} from 'components/Containers';
import Loader from 'components/Loader';
import Sidebar from './components/Sidebar';

export default function GenerateDungeon() {
  const isManualSeed = useStore(state => state.isManualSeed);
  const seed = useStore(state => state.seed);
  const setSeed = useStore(state => state.setSeed);
  const mapWidth = useStore(state => state.mapWidth);
  const mapHeight = useStore(state => state.mapHeight);
  const mapGutterWidth = useStore(state => state.mapGutterWidth);
  const iterations = useStore(state => state.iterations);
  const containerMinimumSize = useStore(state => state.containerMinimumSize);
  const containerSplitRetries = useStore(state => state.containerSplitRetries);
  const containerMinimumRatio = useStore(state => state.containerMinimumRatio);
  const corridorWidth = useStore(state => state.corridorWidth);
  const tileWidth = useStore(state => state.tileWidth);
  const isThree = useStore(state => state.isThree);
  const setIsThree = useStore(state => state.setIsThree);
  const debug = useStore(state => state.debug);
  const setDebug = useStore(state => state.setDebug);
  const loaderVisible = useStore(state => state.loaderVisible);
  const setLoaderVisible = useStore(state => state.setLoaderVisible);

  const canvasHolderRef = useRef();
  const dungeonRef = useRef();
  const threeDrawerRef = useRef();
  const pixiDrawerRef = useRef();

  const [holderRef, holderMeasure] = useMeasure();

  //
  // Three drawer's Store Interface to only set store state
  //
  const storeInterface = {
    loaderVisible,
    setLoaderVisible,
  };

  const onDraw = args => {
    try {
      const dungeon = generate({
        ...args,
        rooms: Data.loadRooms(),
      });
      dungeonRef.current = dungeon;

      if (isThree) {
        threeDrawerRef.current.drawAll(dungeon, {
          debug: args.debug,
          unitWidthInPixels: args.tileWidth,
        });
      } else {
        pixiDrawerRef.current.drawAll(dungeon, {
          debug: args.debug,
          unitWidthInPixels: args.tileWidth,
        });
      }
    } catch (error) {
      console.error(error.message);
      if (isThree) {
        threeDrawerRef.current.clear();
      } else {
        pixiDrawerRef.current.clear();
      }
    }
  };

  const onGenerate = () => {
    let newSeed = seed;
    if (!isManualSeed) {
      newSeed = nanoid();
      setSeed(newSeed);
    }

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
      seed: newSeed,
      debug,
    };

    onDraw(args);
  };

  const onDownload = () => {
    if (dungeonRef.current) {
      Download.downloadJSON(dungeonRef.current, 'dungeon.json');
    }
  };

  const onLoad = event => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.addEventListener('load', event => {
      const rawJSON = event.target.result;
      const parsedJSON = JSON.parse(rawJSON);

      if (isThree) {
        threeDrawerRef.current.drawAll(parsedJSON, {
          debug: debug,
          unitWidthInPixels: tileWidth,
        });
      } else {
        pixiDrawerRef.current.drawAll(parsedJSON, {
          debug: debug,
          unitWidthInPixels: tileWidth,
        });
      }
    });
    reader.readAsText(file);
  };

  const onClear = () => {
    if (isThree) {
      threeDrawerRef.current.clear();
    } else {
      pixiDrawerRef.current.clear();
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
        seed,
        debug,
      };

      onDraw(args);
    }
  };

  //
  // Create and dispose three drawer
  //
  useEffect(() => {
    if (isThree) {
      threeDrawerRef.current = new ThreeDrawer(
        canvasHolderRef.current,
        storeInterface,
      );
    } else {
      pixiDrawerRef.current = new DungeonPixiDrawer(canvasHolderRef.current);
    }

    onGenerate();

    return () => {
      if (threeDrawerRef.current) {
        threeDrawerRef.current.dispose();
      }
      if (pixiDrawerRef.current) {
        canvasHolderRef.current.innerHTML = '';
      }
    };
  }, [isThree]);

  //
  // Resize
  //
  useEffect(() => {
    if (!threeDrawerRef.current) {
      return;
    }
    threeDrawerRef.current.requestRenderIfNotRequested();
  }, [holderMeasure]);

  //
  // Debug
  //
  useEffect(() => {
    onDebug();
  }, [debug]);

  return (
    <PageTransition>
      <PageContainer ref={holderRef}>
        <SidebarContainer>
          <Sidebar
            onGenerate={onGenerate}
            onDownload={onDownload}
            onLoad={onLoad}
            onClear={onClear}
          />
        </SidebarContainer>
        <ContentContainer>
          {isThree ? (
            <>
              <Loader visible={loaderVisible} label="Loading assets" />
              <CanvasHolder ref={canvasHolderRef} />
            </>
          ) : (
            <div
              ref={canvasHolderRef}
              style={{
                width: `${mapWidth * tileWidth}px`,
                height: `${mapHeight * tileWidth}px`,
              }}
            ></div>
          )}
        </ContentContainer>
      </PageContainer>
    </PageTransition>
  );
}

const CanvasHolder = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  > canvas {
    width: 100% !important;
    height: 100% !important;
    background-color: #2d2d2d;
  }
  > div {
    position: absolute !important;
  }
`;
