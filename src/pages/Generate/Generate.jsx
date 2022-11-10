import React, {useEffect, useRef} from 'react';
import styled from 'styled-components';
import {nanoid} from 'nanoid';
import {useMeasure} from 'react-use';

import {useStore} from 'state/store';
import {generate} from 'libs/generate';
import {Data, Download} from 'libs/utils';
import ThreeDrawer from 'libs/drawers/ThreeDrawer';
import PageTransition from 'components/PageTransition';
import {
  ContentContainer,
  PageContainer,
  SidebarContainer,
} from 'components/Containers';
import Loader from 'components/Loader';
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
  const loaderVisible = useStore(state => state.loaderVisible);
  const setLoaderVisible = useStore(state => state.setLoaderVisible);

  const canvasHolderRef = useRef();
  const dungeonRef = useRef();
  const seedRef = useRef();
  const threeDrawerRef = useRef();

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

      threeDrawerRef.current.drawAll(dungeon, {
        debug: args.debug,
        unitWidthInPixels: args.tileWidth,
      });
    } catch (error) {
      console.error(error.message);
      threeDrawerRef.current.clear();
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

  //
  // Create and dispose three drawer
  //
  useEffect(() => {
    threeDrawerRef.current = new ThreeDrawer(
      canvasHolderRef.current,
      storeInterface,
    );

    return () => {
      if (threeDrawerRef.current) {
        threeDrawerRef.current.dispose();
      }
    };
  }, []);

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
          <Sidebar onGenerate={onGenerate} onDownload={onDownload} />
        </SidebarContainer>
        <ContentContainer>
          <Loader visible={loaderVisible} label="Loading assets" />
          <CanvasHolder ref={canvasHolderRef} />
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
