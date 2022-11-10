import {
  ACESFilmicToneMapping,
  AxesHelper,
  Clock,
  Color,
  Fog,
  ImageLoader,
  LoadingManager,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  sRGBEncoding,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  BoxBufferGeometry,
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';

import {ENVIRONMENT_DATA} from './Environments';
import Lights from './Lights';
import {FitCameraToSelection, ShadowPlane} from './Helpers';
import Composer from './Composer';
import {MESH_HIGHLIGHT_COLOR, SPACE_SIZE} from './Constants';
import {textures} from 'libs/utils/textures';

export default class ThreeEngine {
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
    this.clock = new Clock();
    this.rayCaster = new Raycaster();
    this.envMap = null;
    this.meshes = [];
    this.candidateMesh = null;
    this.assets = {};
    this.mouseDownPosition = new Vector2();
    this.mouseUpPosition = new Vector2();

    //Loading manager
    this.loadingManager = new LoadingManager();
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

    /////////////////////////////////////////////////////////////////////////////
    //Scene
    this.scene = new Scene();
    // this.scene.background = new Color("#131313")
    // this.scene.fog = new Fog(0xa0a0a0, SPACE_SIZE * 0.9, SPACE_SIZE)

    /////////////////////////////////////////////////////////////////////////////
    //Root model
    this.rootModel = new Object3D();
    this.scene.add(this.rootModel);

    /////////////////////////////////////////////////////////////////////////////
    //Lights
    this.lights = new Lights();
    this.scene.add(this.lights);

    /////////////////////////////////////////////////////////////////////////////
    //Primitives
    this.unitBox = new Mesh(
      new BoxBufferGeometry(1, 1, 1),
      new MeshStandardMaterial({color: 0xffffff}),
    );
    this.unitBox.visible = false;
    this.scene.add(this.unitBox);

    /////////////////////////////////////////////////////////////////////////////
    //Helpers
    this.axesHelper = new AxesHelper(5);
    this.scene.add(this.axesHelper);

    /////////////////////////////////////////////////////////////////////////////
    //Camera
    this.camera = new PerspectiveCamera(
      35,
      this.canvasWidth / this.canvasHeight,
      0.01,
      SPACE_SIZE * 100,
    );
    this.camera.position.set(-SPACE_SIZE * 0.2, SPACE_SIZE, SPACE_SIZE);
    this.camera.lookAt(0, 0, 0);

    /////////////////////////////////////////////////////////////////////////////
    //Renderer
    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      stencil: false,
      depth: false,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
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
    this.cameraController.minAzimuthAngle = -180;
    this.cameraController.maxAzimuthAngle = 180;
    this.cameraController.dampingFactor = 0.05;
    this.cameraController.enableDamping = false;
    this.cameraController.screenSpacePanning = true;
    // this.cameraController.minDistance = 1
    // this.cameraController.maxDistance = 500
    // this.cameraController.minZoom = 1
    // this.cameraController.maxZoom = 500
    this.cameraController.minPolarAngle = 1;
    this.cameraController.maxPolarAngle = Math.PI / 1.5;
    this.cameraController.enableDamping = true;
    this.cameraController.enableZoom = true;
    // this.cameraController.enablePan = false
    this.cameraController.addEventListener(
      'change',
      this.requestRenderIfNotRequested.bind(this),
    );

    /////////////////////////////////////////////////////////////////////////////
    //Load assets
    this.textureLoader = new TextureLoader(this.loadingManager);
    this.rgbeLoader = new RGBELoader(this.loadingManager);
    this.objLoader = new OBJLoader(this.loadingManager);
    this.mtlLoader = new MTLLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.imageLoader = new ImageLoader(this.loadingManager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(dracoLoader);

    //
    this.loadAllTextures();
  }

  dispose() {
    this.renderer.dispose();
    this.cameraController.dispose();
    this.assets = {};
    this.rootModel.children = [];

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
    this.canvasHolder.removeChild(this.renderer.domElement);
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
    const pickedPoint = new Vector2(
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
    const pickedPoint = new Vector2(
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
    const pickedPoint = new Vector2(
      (event.offsetX / this.canvasWidth) * 2 - 1,
      -(event.offsetY / this.canvasHeight) * 2 + 1,
    );

    this.rayCaster.setFromCamera(pickedPoint, this.camera);
    const pickedObjs = this.rayCaster.intersectObjects(this.meshes);
    if (pickedObjs.length > 0) {
      this.setCandidateMesh(pickedObjs[0].object);
    } else {
      this.setCandidateMesh(null);
    }
  }

  /**
   * Event handler for key down event
   * @param {Object} event
   */
  onKeyDown(event) {}

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

  clearScene() {
    this.rootModel.children.forEach(node => {
      node.children.forEach(child => {
        child?.geometry?.dispose();
        child?.material?.dispose();
        node.remove(child);
      });
      this.rootModel.remove(node);
    });
    this.rootModel.children = [];
  }

  /**
   * @param {Number} index
   * @param {Boolean} enabled
   */
  updateEnvmap(index, enabled) {
    const envTexture = ENVIRONMENT_DATA[index].hdr;
    const pg = new PMREMGenerator(this.renderer);
    this.rgbeLoader.load(envTexture, texture => {
      texture.rotation = Math.PI;
      texture.offset = new Vector2(0.5, 0);
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
      Math.cos(MathUtils.degToRad(ENVIRONMENT_DATA[index].zenith)) * SPACE_SIZE;

    this.lights.sunLight.position.x =
      Math.sin(MathUtils.degToRad(orientation)) * radius;

    this.lights.sunLight.position.z =
      Math.cos(MathUtils.degToRad(orientation)) * radius;

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
   * @param {Mesh} mesh
   */
  setCandidateMesh(mesh) {
    //Reset color
    if (this.candidateMesh) {
      const color = new Color(this.candidateMesh.material.userData.oldColor);
      this.candidateMesh.material.color.set(color);
    }

    //Set color
    if (mesh) {
      const color = new Color(MESH_HIGHLIGHT_COLOR);
      mesh.material.color.set(color);
    }

    //Update candidate mesh
    this.candidateMesh = mesh;
    this.requestRenderIfNotRequested();
  }

  /**
   * Load all textures
   */
  loadAllTextures() {
    Object.keys(textures).forEach(key => {
      textures[key].texture = this.textureLoader.load(
        `${textures[key].path}${key}${textures[key].ext}`,
      );
    });
    //
    console.log('loaded textures');
    console.log(textures);
  }
}
