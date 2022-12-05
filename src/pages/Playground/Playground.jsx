import React, {useEffect, useRef} from 'react';
import styled from 'styled-components';
import {nanoid} from 'nanoid';

import {useStore} from 'state/store';
import {Direction, generate} from 'libs/generate';
import {Data} from 'libs/utils';
import ThreeDrawer from 'libs/drawers/ThreeDrawer';
import PageTransition from 'components/PageTransition';
import {ContentContainer, PageContainer} from 'components/Containers';
import Loader from 'components/Loader';
import Caption from 'components/Caption';

export default function Playground() {
  const seed = useStore(state => state.seed);
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
  const threeDrawerRef = useRef();

  const onDraw = args => {
    try {
      const dungeon = generate({
        ...args,
        rooms: Data.loadRooms(),
      });
      threeDrawerRef.current.drawDungeon(dungeon);
    } catch (error) {
      console.error(error.message);
      threeDrawerRef.current.clear();
    }
  };

  const onGenerate = () => {
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

  const generateDungeon = (seed, direction, parentSeed) => {
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
      rooms: Data.loadRooms(),
    };
    const dungeon = generate(args);

    //Update parent seed
    switch (direction) {
      case Direction.up:
        dungeon.nearSeeds[Direction.down] = parentSeed;
        break;
      case Direction.right:
        dungeon.nearSeeds[Direction.left] = parentSeed;
        break;
      case Direction.down:
        dungeon.nearSeeds[Direction.up] = parentSeed;
        break;
      case Direction.left:
        dungeon.nearSeeds[Direction.right] = parentSeed;
        break;
      default:
        break;
    }

    return dungeon;
  };

  //
  // Three drawer's Store Interface to only set store state
  //
  const storeInterface = {
    loaderVisible,
    setLoaderVisible,
    generateDungeon,
  };

  //
  // Create and dispose three drawer
  //
  useEffect(() => {
    threeDrawerRef.current = new ThreeDrawer(canvasHolderRef.current, storeInterface);
    threeDrawerRef.current.setActivePlayer(true);
    threeDrawerRef.current.setFreeCamera(false);

    onGenerate();

    return () => {
      threeDrawerRef.current.dispose();
    };
  }, []);

  return (
    <PageTransition>
      <PageContainer>
        <ContentContainer>
          <Loader visible={loaderVisible} label="Loading assets" />
          <CanvasHolder ref={canvasHolderRef} />
          <Caption />
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
    background-color: #422a34;
  }
  > div {
    position: absolute !important;
  }
`;
