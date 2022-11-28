import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';

import {Textures} from 'libs/utils';
import {TEXTURE_ASSET} from 'libs/utils/assets';
import {Direction, PropType, TileLayer, TileType} from 'libs/generate';
import {Grid, IDAStarFinder} from 'libs/pathfinder';

import {ENVIRONMENT_DATA} from './Environments';
import Lights from './Lights';
import {FitCameraToSelection} from './Helpers';
import Composer from './Composer';
import {SPACE_SIZE, TILE_SIZE} from './Constants';

export default class ThreeDrawer {
  /**
   * @param {HTMLDivElement} canvasHolder
   * @param {Object} storeInterface
   */
  constructor(canvasHolder, storeInterface) {
    this.canvasHolder = canvasHolder;
    this.storeInterface = storeInterface;

    this.canvasWidth = canvasHolder.offsetWidth;
    this.canvasHeight = canvasHolder.offsetHeight;
    this.renderRequested = false;
    this.clock = new THREE.Clock();
    this.rayCaster = new THREE.Raycaster();
    this.envMap = null;
    this.meshes = [];
    this.mouseDownPosition = new THREE.Vector2();
    this.mouseUpPosition = new THREE.Vector2();
    this.dungeon = null;
    this.oldDungeon = null;
    this.tempDungeon = null;

    // Loading manager
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      this.storeInterface.setLoaderVisible(true);
    };
    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      if (!this.storeInterface.loaderVisible) {
        this.storeInterface.setLoaderVisible(true);
      }
    };
    this.loadingManager.onLoad = () => {
      this.setupComposer();

      setTimeout(() => {
        this.requestRenderIfNotRequested();
        this.storeInterface.setLoaderVisible(false);
      }, [1500]);
    };

    //
    // Stats
    //
    this.stats = new Stats();
    canvasHolder.appendChild(this.stats.dom);

    /////////////////////////////////////////////////////////////////////////////
    //Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    // this.scene.fog = new Fog(0xa0a0a0, SPACE_SIZE * 0.9, SPACE_SIZE)

    /////////////////////////////////////////////////////////////////////////////
    //Groups
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.oldGroup = new THREE.Group();
    this.scene.add(this.oldGroup);

    this.tempGroup = new THREE.Group();
    this.scene.add(this.tempGroup);

    /////////////////////////////////////////////////////////////////////////////
    //Lights
    this.lights = new Lights();
    this.scene.add(this.lights);

    /////////////////////////////////////////////////////////////////////////////
    //Primitives
    this.unitBox = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({color: 0xffffff}),
    );
    this.unitBox.visible = false;
    this.scene.add(this.unitBox);

    /////////////////////////////////////////////////////////////////////////////
    //Helpers
    // this.axesHelper = new AxesHelper(1);
    // this.axesHelper.position.y = 0.01;
    // this.scene.add(this.axesHelper);

    // this.gridHelper = new GridHelper(1000, 100);
    // this.gridHelper.position.y = -0.5;
    // this.scene.add(this.gridHelper);

    /////////////////////////////////////////////////////////////////////////////
    //Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.canvasWidth / this.canvasHeight,
      0.01,
      SPACE_SIZE * 1000,
    );
    this.camera.position.set(0, SPACE_SIZE, 0);
    this.camera.lookAt(0, 0, 0);

    /////////////////////////////////////////////////////////////////////////////
    //Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      stencil: false,
      depth: false,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(this.canvasWidth, this.canvasHeight, false);
    this.canvasHolder.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener('resize', this.requestRenderIfNotRequested.bind(this));

    /////////////////////////////////////////////////////////////////////////////
    //Camera Controller
    this.cameraController = new OrbitControls(this.camera, this.renderer.domElement);
    // this.cameraController.minAzimuthAngle = -180;
    // this.cameraController.maxAzimuthAngle = 180;
    this.cameraController.dampingFactor = 0.05;
    this.cameraController.screenSpacePanning = true;
    // this.cameraController.minDistance = 1
    // this.cameraController.maxDistance = 500
    // this.cameraController.minZoom = 1
    // this.cameraController.maxZoom = 500
    // this.cameraController.minPolarAngle = 1;
    // this.cameraController.maxPolarAngle = Math.PI / 1.5;
    this.cameraController.enableDamping = false;
    this.cameraController.enableZoom = true;
    this.cameraController.enableRotate = false;
    // this.cameraController.enablePan = false
    this.cameraController.addEventListener('change', this.requestRenderIfNotRequested.bind(this));

    /////////////////////////////////////////////////////////////////////////////
    //Load assets
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.rgbeLoader = new RGBELoader(this.loadingManager);
    this.objLoader = new OBJLoader(this.loadingManager);
    this.mtlLoader = new MTLLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.imageLoader = new THREE.ImageLoader(this.loadingManager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(dracoLoader);

    //
    this.loadAllTextures();

    // Player
    this.player = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.5, 0.4),
      new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: false}),
    );
    this.scene.add(this.player);
  }

  dispose() {
    this.clear();
    this.renderer.dispose();
    this.cameraController.dispose();

    this.cameraController.removeEventListener(
      'change',
      this.requestRenderIfNotRequested.bind(this),
    );
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    window.removeEventListener('resize', this.requestRenderIfNotRequested.bind(this));
    // this.canvasHolder.removeChild(this.renderer.domElement);
    this.canvasHolder.innerHTML = '';
  }

  //Install composer
  setupComposer() {
    this.composer = new Composer(this.renderer, this.scene, this.camera);
  }

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseDown(event) {
    const pickedPoint = new THREE.Vector2(
      (event.offsetX / this.canvasWidth) * 2 - 1,
      -(event.offsetY / this.canvasHeight) * 2 + 1,
    );
    this.mouseDownPosition.copy(pickedPoint);
  }

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseUp(event) {
    const pickedPoint = new THREE.Vector2(
      (event.offsetX / this.canvasWidth) * 2 - 1,
      -(event.offsetY / this.canvasHeight) * 2 + 1,
    );
    this.mouseUpPosition.copy(pickedPoint);

    this.rayCaster.setFromCamera(pickedPoint, this.camera);
    const pickedObjs = this.rayCaster.intersectObjects(this.meshes);
    if (pickedObjs.length > 0) {
      if (pickedPoint.distanceTo(this.mouseDownPosition) < 0.01) {
        if (event.which === 1) {
          //Left click
        }
      }
    }
  }

  /**
   * Event handler for mouse move event
   * @param {Object} event
   */
  onMouseMove(event) {
    const pickedPoint = new THREE.Vector2(
      (event.offsetX / this.canvasWidth) * 2 - 1,
      -(event.offsetY / this.canvasHeight) * 2 + 1,
    );

    this.rayCaster.setFromCamera(pickedPoint, this.camera);
    const pickedObjs = this.rayCaster.intersectObjects(this.meshes);
  }

  /**
   * Event handler for key down event
   * @param {Object} event
   */
  onKeyDown(event) {
    if (event.key === 'a' || event.key === 'ArrowLeft') {
      this.player.position.x -= TILE_SIZE;
    }
    if (event.key === 'd' || event.key === 'ArrowRight') {
      this.player.position.x += TILE_SIZE;
    }
    if (event.key === 'w' || event.key === 'ArrowUp') {
      this.player.position.z -= TILE_SIZE;
    }
    if (event.key === 's' || event.key === 'ArrowDown') {
      this.player.position.z += TILE_SIZE;
    }

    // Detect out door and create next chunk
    this.createNextDungeon();

    this.requestRenderIfNotRequested();
  }

  /**
   * Event handler for key up event
   * @param {Object} event
   */
  onKeyUp(event) {}

  resizeRendererToDisplaySize() {
    const canvasWidth = this.renderer.domElement.offsetWidth;
    const canvasHeight = this.renderer.domElement.offsetHeight;
    const needResize = canvasWidth !== this.canvasWidth || canvasHeight !== this.canvasHeight;
    if (needResize) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.camera.aspect = this.canvasWidth / this.canvasHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.canvasWidth, this.canvasHeight);
      if (this.composer) {
        this.composer.setSize(this.canvasWidth, this.canvasHeight);
      }
      this.requestRenderIfNotRequested();
    }
  }

  render() {
    this.renderRequested = false;
    this.resizeRendererToDisplaySize();
    this.cameraController.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
    if (this.composer) {
      this.composer.render(this.clock.getDelta());
    }
  }

  requestRenderIfNotRequested() {
    if (!this.renderRequested) {
      this.renderRequested = true;
      requestAnimationFrame(this.render.bind(this));
    }
  }

  /**
   * @param {Number} index
   * @param {Boolean} enabled
   */
  updateEnvmap(index, enabled) {
    const envTexture = ENVIRONMENT_DATA[index].hdr;
    const pg = new THREE.PMREMGenerator(this.renderer);
    this.rgbeLoader.load(envTexture, texture => {
      texture.rotation = Math.PI;
      texture.offset = new THREE.Vector2(0.5, 0);
      texture.needsUpdate = true;
      texture.updateMatrix();

      pg.compileEquirectangularShader();
      this.envMap = pg.fromEquirectangular(texture).texture;
      this.scene.environment = this.envMap;
      this.scene.background = enabled ? this.envMap : null;
      texture.dispose();
      pg.dispose();
    });
  }

  /**
   * @param {Boolean} enabled
   */
  enableEnvmap(enabled) {
    this.scene.background = enabled ? this.envMap : null;
    this.requestRenderIfNotRequested();
  }

  updateEnvOrientation(index, orientation) {
    const radius = Math.cos(THREE.MathUtils.degToRad(ENVIRONMENT_DATA[index].zenith)) * SPACE_SIZE;

    this.lights.sunLight.position.x = Math.sin(THREE.MathUtils.degToRad(orientation)) * radius;

    this.lights.sunLight.position.z = Math.cos(THREE.MathUtils.degToRad(orientation)) * radius;

    this.requestRenderIfNotRequested();
  }

  /**
   * @param {Number} brightness
   */
  updateEnvExposure(brightness) {
    if (this.renderer && this.composer) {
      this.renderer.toneMappingExposure = brightness;
      this.requestRenderIfNotRequested();
    }
  }

  /**
   * Load all textures
   */
  loadAllTextures() {
    Object.keys(TEXTURE_ASSET).forEach(key => {
      TEXTURE_ASSET[key].texture = this.textureLoader.load(
        `${TEXTURE_ASSET[key].path}${key}${TEXTURE_ASSET[key].ext}`,
      );
    });
  }

  clear() {
    // Clear
    this.group.children.forEach(node => {
      node?.geometry?.dispose();
      node?.material?.dispose();
      this.group.remove(node);
    });
    this.group.children = [];

    this.oldGroup.children.forEach(node => {
      node?.geometry?.dispose();
      node?.material?.dispose();
      this.oldGroup.remove(node);
    });
    this.oldGroup.children = [];

    // Render scene
    this.requestRenderIfNotRequested();
  }

  /**
   * @param {Object} dungeon
   */
  drawDungeon(dungeon) {
    const isFirstDungeon = this.dungeon === null;

    this.oldDungeon = JSON.parse(JSON.stringify(this.dungeon));
    this.dungeon = JSON.parse(JSON.stringify(dungeon));

    // Clear old group
    this.oldGroup.children.forEach(node => {
      node?.geometry?.dispose();
      node?.material?.dispose();
      this.oldGroup.remove(node);
    });
    this.oldGroup.children = [];

    // Move group into old group
    this.oldGroup.copy(this.group, true);

    // Clear group
    this.group.children.forEach(node => {
      node?.geometry?.dispose();
      node?.material?.dispose();
      this.group.remove(node);
    });
    this.group.children = [];

    // Draw
    this.drawTiles(dungeon.layers.tiles, Textures.tilesTextures(TEXTURE_ASSET));
    this.drawProps(dungeon.layers.props, Textures.propsTextures(TEXTURE_ASSET));
    this.drawMonsters(dungeon.layers.monsters, Textures.monstersTextures(TEXTURE_ASSET));

    if (isFirstDungeon) {
      // Fit camera
      FitCameraToSelection(this.camera, [this.group], 0.75, this.cameraController);

      // Move player to ladder position
      this.initPlayer(dungeon.layers.props);
    }

    // Render scene
    this.requestRenderIfNotRequested();
  }

  drawTiles = (tilemap, sprites) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        const texture = sprites[id];
        if (texture) {
          const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.userData = {
            x: x,
            y: y,
            type: id,
            layer: TileLayer.tiles,
          };
          sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
          this.group.add(sprite);
        }
      }
    }
  };

  drawProps = (tilemap, sprites) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === 0) {
          continue;
        }
        const texture = sprites[id];
        if (texture) {
          const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.userData = {
            x: x,
            y: y,
            type: id,
            layer: TileLayer.props,
          };
          sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
          this.group.add(sprite);
        }
      }
    }
  };

  drawMonsters = (tilemap, sprites) => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === 0) {
          continue;
        }
        const texture = sprites[id];
        if (texture) {
          const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.userData = {
            x: x,
            y: y,
            type: id,
            layer: TileLayer.monsters,
          };
          sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
          this.group.add(sprite);
        }
      }
    }
  };

  initPlayer = tilemap => {
    // Move player into Ladder position
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === PropType.Ladder) {
          this.player.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
          break;
        }
      }
    }
  };

  getDoorPlayerArrived = (dungeon, group) => {
    const tilemap = dungeon.layers.tiles;
    const snapSize = 0.1;
    let arrivedAtDoor = false;
    let rx = 0;
    let ry = 0;
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === TileType.Door) {
          const dx = Math.abs(this.player.position.x - (group.position.x + x * TILE_SIZE));
          const dy = Math.abs(this.player.position.z - (group.position.z + y * TILE_SIZE));
          if (dx < snapSize && dy < snapSize) {
            arrivedAtDoor = true;
            rx = x;
            ry = y;
            break;
          }
        }
      }
      if (arrivedAtDoor) {
        break;
      }
    }

    // detect direction of door
    const top = ry + 1;
    const right = dungeon.width - rx;
    const bottom = dungeon.height - ry;
    const left = rx + 1;
    const min = Math.min(top, right, bottom, left);
    let dir = Direction.up;
    switch (min) {
      case top:
        dir = Direction.up;
        break;
      case right:
        dir = Direction.right;
        break;
      case bottom:
        dir = Direction.down;
        break;
      case left:
        dir = Direction.left;
        break;
      default:
        break;
    }

    return {arrived: arrivedAtDoor, x: rx, y: ry, direction: dir};
  };

  createNextDungeon() {
    // Detect door in current dungeon
    let detectedDoor = this.getDoorPlayerArrived(this.dungeon, this.group);
    if (detectedDoor.arrived) {
      this.player.material.color.set(0xff0000);

      // Create next dungeon
      if (this.storeInterface.generateDungeon) {
        // Generate new dungeon
        const newDungeon = this.storeInterface.generateDungeon();

        // Draw next dungeon
        this.drawDungeon(newDungeon);

        // Move group
        this.moveGroupByDoorDirection(detectedDoor.direction);

        // Create corridor to connect two dungeons
        this.createCorridorToConnectDungeons(detectedDoor);
      }
    } else {
      this.player.material.color.set(0xffff00);

      // Detect door in old dungeon
      if (this.oldDungeon) {
        detectedDoor = this.getDoorPlayerArrived(this.oldDungeon, this.oldGroup);

        if (detectedDoor.arrived) {
          this.player.material.color.set(0xff0000);

          // Create next dungeon
          if (this.storeInterface.generateDungeon) {
            //Exchange dungeon
            this.tempDungeon = JSON.parse(JSON.stringify(this.dungeon));
            this.dungeon = JSON.parse(JSON.stringify(this.oldDungeon));
            this.oldDungeon = this.tempDungeon;

            //Exchange group
            this.tempGroup.copy(this.group, true);
            this.group.copy(this.oldGroup, true);
            this.oldGroup.copy(this.tempGroup, true);

            //Clear temp group
            this.tempGroup.children.forEach(node => {
              node?.geometry?.dispose();
              node?.material?.dispose();
              this.tempGroup.remove(node);
            });
            this.tempGroup.children = [];

            // Generate new dungeon
            const newDungeon = this.storeInterface.generateDungeon();

            // Draw next dungeon
            this.drawDungeon(newDungeon);

            // Move group
            this.moveGroupByDoorDirection(detectedDoor.direction);

            // Create corridor to connect two dungeons
            this.createCorridorToConnectDungeons(detectedDoor);
          }
        } else {
          this.player.material.color.set(0xffff00);
        }
      }
    }
  }

  moveGroupByDoorDirection(direction) {
    switch (direction) {
      case Direction.up:
        this.group.position.z = this.oldGroup.position.z - this.dungeon.height * TILE_SIZE;
        break;
      case Direction.right:
        this.group.position.x = this.oldGroup.position.x + this.dungeon.width * TILE_SIZE;
        break;
      case Direction.down:
        this.group.position.z = this.oldGroup.position.z + this.dungeon.height * TILE_SIZE;
        break;
      case Direction.left:
        this.group.position.x = this.oldGroup.position.x - this.dungeon.width * TILE_SIZE;
        break;

      default:
        break;
    }
  }

  createCorridorToConnectDungeons(detectedDoor) {
    //
    // Connected two dungeon's tiles
    //
    let mergedTiles = [];
    const doorPosition = {
      x: detectedDoor.x,
      y: detectedDoor.y,
    };
    const dungeonRect = {
      min_x: 0,
      min_y: 0,
      max_x: this.dungeon.width - 1,
      max_y: this.dungeon.height - 1,
    };
    const oldDungeonRect = {
      min_x: 0,
      min_y: 0,
      max_x: this.dungeon.width - 1,
      max_y: this.dungeon.height - 1,
    };
    switch (detectedDoor.direction) {
      case Direction.up:
        mergedTiles = [...this.dungeon.layers.tiles];
        mergedTiles = mergedTiles.concat(this.oldDungeon.layers.tiles);
        doorPosition.y = doorPosition.y + this.dungeon.height;
        oldDungeonRect.min_y = this.dungeon.height;
        oldDungeonRect.max_y = this.dungeon.height * 2 - 1;
        break;
      case Direction.right:
        mergedTiles = [...this.oldDungeon.layers.tiles];
        for (let i = 0; i < mergedTiles.length; i++) {
          mergedTiles[i] = mergedTiles[i].concat(this.dungeon.layers.tiles[i]);
        }
        dungeonRect.min_x = this.oldDungeon.width;
        dungeonRect.max_x = this.oldDungeon.width * 2 - 1;
        break;
      case Direction.down:
        mergedTiles = [...this.oldDungeon.layers.tiles];
        mergedTiles = mergedTiles.concat(this.dungeon.layers.tiles);
        dungeonRect.min_y = this.oldDungeon.height;
        dungeonRect.max_y = this.oldDungeon.height * 2 - 1;
        break;
      case Direction.left:
        mergedTiles = [...this.dungeon.layers.tiles];
        for (let i = 0; i < mergedTiles.length; i++) {
          mergedTiles[i] = mergedTiles[i].concat(this.oldDungeon.layers.tiles[i]);
        }
        doorPosition.x = doorPosition.x + this.dungeon.width;
        oldDungeonRect.min_x = this.dungeon.width;
        oldDungeonRect.max_x = this.dungeon.width * 2 - 1;
        break;
      default:
        break;
    }

    //
    // Find nearest door in dungeon
    //
    let minDistance = Number.MAX_SAFE_INTEGER;
    const nearestDoorPosition = {
      x: 0,
      y: 0,
    };
    for (let _y = dungeonRect.min_y; _y <= dungeonRect.max_y; _y++) {
      for (let _x = dungeonRect.min_x; _x <= dungeonRect.max_x; _x++) {
        if (mergedTiles[_y][_x] === TileType.Door) {
          const distance = Math.sqrt(
            (doorPosition.x - _x) * (doorPosition.x - _x) +
              (doorPosition.y - _y) * (doorPosition.y - _y),
          );
          if (minDistance > distance) {
            minDistance = distance;
            nearestDoorPosition.x = _x;
            nearestDoorPosition.y = _y;
          }
        }
      }
    }

    //
    // Find path
    //
    const gridWidth = mergedTiles[0].length;
    const gridHeight = mergedTiles.length;
    const grid = new Grid(gridWidth, gridHeight);

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if (mergedTiles[y][x] === TileType.All || mergedTiles[y][x] === TileType.Door) {
          grid.setWalkableAt(x, y, true);
        } else {
          grid.setWalkableAt(x, y, false);
        }
      }
    }

    const finder = new IDAStarFinder();
    const path = finder.findPath(
      doorPosition.x,
      doorPosition.y,
      nearestDoorPosition.x,
      nearestDoorPosition.y,
      grid,
    );

    //
    // Update tiles according to path
    //
    for (let i = 0; i < path.length; i++) {
      const nodeX = path[i][0];
      const nodeY = path[i][1];

      // Update mergedTiles
      mergedTiles[nodeY][nodeX] = TileType.Ground;

      // Update tiles
      if (
        nodeY >= dungeonRect.min_y &&
        nodeY <= dungeonRect.max_y &&
        nodeX >= dungeonRect.min_x &&
        nodeX <= dungeonRect.max_x
      ) {
        const x = nodeX - dungeonRect.min_x;
        const y = nodeY - dungeonRect.min_y;

        // Update dungeon
        this.dungeon.layers.tiles[y][x] = TileType.Ground;

        // Remove old node
        for (let c = 0; c < this.group.children.length; c++) {
          const node = this.group.children[c];
          if (
            node.userData.layer === TileLayer.tiles &&
            x === node.userData.x &&
            y === node.userData.y
          ) {
            node?.geometry?.dispose();
            node?.material?.dispose();
            this.group.remove(node);
            break;
          }
        }

        // Add new node
        const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({
          map: Textures.tilesTextures(TEXTURE_ASSET)[TileType.Ground],
          transparent: true,
        });
        const sprite = new THREE.Mesh(geometry, material);
        sprite.userData = {
          x: x,
          y: y,
          type: TileType.Ground,
          layer: TileLayer.tiles,
        };
        sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
        this.group.add(sprite);
      } else {
        const x = nodeX - oldDungeonRect.min_x;
        const y = nodeY - oldDungeonRect.min_y;

        // Update old dungeon
        this.oldDungeon.layers.tiles[y][x] = TileType.Ground;

        // Remove old node
        for (let c = 0; c < this.oldGroup.children.length; c++) {
          const node = this.oldGroup.children[c];
          if (
            node.userData.layer === TileLayer.tiles &&
            x === node.userData.x &&
            y === node.userData.y
          ) {
            node?.geometry?.dispose();
            node?.material?.dispose();
            this.oldGroup.remove(node);
            break;
          }
        }

        // Add new node
        const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE, 1, 1);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshStandardMaterial({
          map: Textures.tilesTextures(TEXTURE_ASSET)[TileType.Ground],
          transparent: true,
        });
        const sprite = new THREE.Mesh(geometry, material);
        sprite.userData = {
          x: x,
          y: y,
          type: TileType.Ground,
          layer: TileLayer.tiles,
        };
        sprite.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
        this.oldGroup.add(sprite);
      }
    }
  }
}
