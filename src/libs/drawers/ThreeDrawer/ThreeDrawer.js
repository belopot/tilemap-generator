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
import {ENVIRONMENT_DATA} from './Environments';
import Lights from './Lights';
import {FitCameraToSelection} from './Helpers';
import Composer from './Composer';
import {SPACE_SIZE} from './Constants';
import {TEXTURE_ASSET} from 'libs/utils/assets';
import {Direction, PropType} from 'libs/generate';

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
    this.tileSize = 0.5;
    this.dungeon = null;
    this.oldDungeon = null;

    //Loading manager
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
    this.renderer.domElement.addEventListener(
      'mousedown',
      this.onMouseDown.bind(this),
    );
    this.renderer.domElement.addEventListener(
      'mouseup',
      this.onMouseUp.bind(this),
    );
    this.renderer.domElement.addEventListener(
      'mousemove',
      this.onMouseMove.bind(this),
    );
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener(
      'resize',
      this.requestRenderIfNotRequested.bind(this),
    );

    /////////////////////////////////////////////////////////////////////////////
    //Camera Controller
    this.cameraController = new OrbitControls(
      this.camera,
      this.renderer.domElement,
    );
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
    this.cameraController.addEventListener(
      'change',
      this.requestRenderIfNotRequested.bind(this),
    );

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
    window.removeEventListener(
      'resize',
      this.requestRenderIfNotRequested.bind(this),
    );
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
      this.player.position.x -= this.tileSize;
    }
    if (event.key === 'd' || event.key === 'ArrowRight') {
      this.player.position.x += this.tileSize;
    }
    if (event.key === 'w' || event.key === 'ArrowUp') {
      this.player.position.z -= this.tileSize;
    }
    if (event.key === 's' || event.key === 'ArrowDown') {
      this.player.position.z += this.tileSize;
    }

    // Detect door
    const detectedDoor = this.getDoorPlayerArrived();
    if (detectedDoor.arrived) {
      this.player.material.color.set(0xff0000);

      // Create next dungeon
      if (this.storeInterface.generateNextDungeon) {
        const newDungeon = this.storeInterface.generateNextDungeon();
        this.drawDungeon(newDungeon);
        //
        switch (detectedDoor.direction) {
          case Direction.top:
            this.group.position.z =
              this.oldGroup.position.z - this.oldDungeon.height * this.tileSize;
            break;
          case Direction.right:
            this.group.position.x =
              this.oldGroup.position.x + this.oldDungeon.width * this.tileSize;
            break;
          case Direction.bottom:
            this.group.position.z =
              this.oldGroup.position.z + this.oldDungeon.height * this.tileSize;
            break;
          case Direction.left:
            this.group.position.x =
              this.oldGroup.position.x - this.oldDungeon.width * this.tileSize;
            break;

          default:
            break;
        }
      }

      console.log(detectedDoor);
    } else {
      this.player.material.color.set(0xffff00);
    }

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
    const needResize =
      canvasWidth !== this.canvasWidth || canvasHeight !== this.canvasHeight;
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
    const radius =
      Math.cos(THREE.MathUtils.degToRad(ENVIRONMENT_DATA[index].zenith)) *
      SPACE_SIZE;

    this.lights.sunLight.position.x =
      Math.sin(THREE.MathUtils.degToRad(orientation)) * radius;

    this.lights.sunLight.position.z =
      Math.cos(THREE.MathUtils.degToRad(orientation)) * radius;

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
    this.oldDungeon = this.dungeon;
    this.dungeon = dungeon;

    // Clear old group
    this.oldGroup.children.forEach(node => {
      node?.geometry?.dispose();
      node?.material?.dispose();
      this.oldGroup.remove(node);
    });
    this.oldGroup.children = [];

    // Move group into old group
    this.group.children.forEach(node => {
      node.parent = this.oldGroup;
    });
    this.oldGroup.position.copy(this.group.position);

    // Draw
    this.drawTiles(dungeon.layers.tiles, Textures.tilesTextures(TEXTURE_ASSET));
    this.drawProps(dungeon.layers.props, Textures.propsTextures(TEXTURE_ASSET));
    this.drawMonsters(
      dungeon.layers.monsters,
      Textures.monstersTextures(TEXTURE_ASSET),
    );

    if (isFirstDungeon) {
      // Fit camera
      FitCameraToSelection(
        this.camera,
        [this.group],
        0.75,
        this.cameraController,
      );

      // Move player to
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
          const geometry = new THREE.PlaneGeometry(
            this.tileSize,
            this.tileSize,
            1,
            1,
          );
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.position.set(x * this.tileSize, 0, y * this.tileSize);
          this.group.add(sprite);
        } else {
          const geometry = new THREE.PlaneGeometry(
            this.tileSize,
            this.tileSize,
            1,
            1,
          );
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({color: 0xff0000});
          const sprite = new THREE.Mesh(geometry, material);
          sprite.position.set(x * this.tileSize, 0, y * this.tileSize);
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
          const geometry = new THREE.PlaneGeometry(
            this.tileSize,
            this.tileSize,
            1,
            1,
          );
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.position.set(x * this.tileSize, 0, y * this.tileSize);
          this.group.add(sprite);
        } else {
          const geometry = new THREE.PlaneGeometry(
            this.tileSize,
            this.tileSize,
            1,
            1,
          );
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({color: 0x00ff00});
          const sprite = new THREE.Mesh(geometry, material);
          sprite.position.set(x * this.tileSize, 0, y * this.tileSize);
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
          const geometry = new THREE.PlaneGeometry(
            this.tileSize,
            this.tileSize,
            1,
            1,
          );
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
          });
          const sprite = new THREE.Mesh(geometry, material);
          sprite.position.set(x * this.tileSize, 0, y * this.tileSize);
          this.group.add(sprite);
        } else {
          const geometry = new THREE.PlaneGeometry(
            this.tileSize,
            this.tileSize,
            1,
            1,
          );
          geometry.rotateX(-Math.PI / 2);
          const material = new THREE.MeshStandardMaterial({color: 0x0000ff});
          const sprite = new THREE.Mesh(geometry, material);
          sprite.position.set(x * this.tileSize, 0, y * this.tileSize);
          this.group.add(sprite);
        }
      }
    }
  };

  initPlayer = tilemap => {
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === PropType.Ladder) {
          this.player.position.set(x * this.tileSize, 0, y * this.tileSize);
          break;
        }
      }
    }
  };

  getDoorPlayerArrived = () => {
    const tilemap = this.dungeon.layers.props;
    const snapSize = 0.1;
    let arrivedAtDoor = false;
    let rx = 0;
    let ry = 0;
    for (let y = 0; y < tilemap.length; y++) {
      for (let x = 0; x < tilemap[y].length; x++) {
        const id = tilemap[y][x];
        if (id === PropType.Arrow) {
          const dx = Math.abs(
            this.player.position.x -
              (this.group.position.x + x * this.tileSize),
          );
          const dy = Math.abs(
            this.player.position.z -
              (this.group.position.z + y * this.tileSize),
          );
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
    const top = Math.abs(ry - 0);
    const right = Math.abs(rx - this.dungeon.width);
    const bottom = Math.abs(ry - this.dungeon.height);
    const left = Math.abs(rx - 0);
    const min = Math.min(top, right, bottom, left);
    let dir = Direction.top;
    switch (min) {
      case top:
        dir = Direction.top;
        break;
      case right:
        dir = Direction.right;
        break;
      case bottom:
        dir = Direction.bottom;
        break;
      case left:
        dir = Direction.left;
        break;
      default:
        break;
    }

    return {arrived: arrivedAtDoor, x: rx, y: ry, direction: dir};
  };
}
