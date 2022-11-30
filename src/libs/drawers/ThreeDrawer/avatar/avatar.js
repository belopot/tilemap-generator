import * as THREE from 'three';
import {SpriteMixer} from './SpriteMixer.js';

export default class SpriteAvatar {
  constructor() {
    this.clock = new THREE.Clock();

    this.idleAction = null;
    this.walkAction = null;
    this.attackAction = null;
    this.hurtAction = null;

    this.lastAttackTime = 0;
    this.attackDelay = 1500;

    this.actions = null;

    this.actionSprite = null;

    this.meshApp = null;
  }
  makeSpriteAvatar() {
    if (!this.meshApp) {
      this.meshApp = new THREE.Object3D();
      this.meshApp.name = 'spriteAvatar';

      var texture = new THREE.TextureLoader().load('assets/avatars/boy.png');

      const vertexShader = () => {
        return `
              varying vec2 vUv;

              void main() {
                  vUv = uv;

                  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                  gl_Position = projectionMatrix * modelViewPosition;
              }
          `;
      };

      const fragmentShader = () => {
        return `
              uniform sampler2D texture;
              varying vec2 vUv;

              void main() {
                  vec4 color = texture2D(texture, vUv);
                  gl_FragColor = color;
              }
          `;
      };

      const uniforms = {
        texture: {value: texture},
      };

      const planeMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: fragmentShader(),
        vertexShader: vertexShader(),
      });

      let geometry2 = new THREE.PlaneGeometry(5, 5);

      this.spriteMixer = SpriteMixer();

      this.actionSprite = this.spriteMixer.ActionSprite(texture, 4, 4);

      //console.log(texture

      //var texture2 = texture.clone();

      const geometry = new THREE.PlaneGeometry(10, 10);
      //const material = new THREE.MeshBasicMaterial( {map: planeMaterial, side: THREE.DoubleSide} );
      const plane = new THREE.Mesh(geometry2, planeMaterial);
      //scene.add( plane );

      plane.position.y = 1;
      plane.rotation.x = Math.PI / 2;
      plane.updateMatrixWorld();

      let timeval = 150;
      this.actions = {
        walk_down: this.spriteMixer.Action(this.actionSprite, 0, 3, timeval),
        walk_left: this.spriteMixer.Action(this.actionSprite, 4, 7, timeval),
        walk_right: this.spriteMixer.Action(this.actionSprite, 8, 11, timeval),
        walk_up: this.spriteMixer.Action(this.actionSprite, 12, 15, timeval),
        currentAction: null,
      };

      this.actionSprite.scale.set(0.5, 0.5, 0.5);
      this.actionSprite.updateMatrixWorld();

      this.meshApp.add(this.actionSprite);
      this.meshApp.updateMatrixWorld();

      let offset = new THREE.Vector3(0, 0, 0); //1.25, 0.75, 0
      let avatarScale = new THREE.Vector3(0.5, 1, 1);

      //console.log(texture, "tetureeeeeeeeeeeeeee", this.meshApp, this.actionSprite);
    } else {
      //this.meshApp.parent.remove(this.meshApp);
      //this.meshApp.destroy();
      //setHaloMeshApp(null);
    }
    return this.meshApp;
  }
  updateAnimation(velocity) {
    let actionSprite = this.actionSprite;
    let actions = this.actions;

    let avatarVelocity = velocity;

    let velX = Math.round(parseFloat(avatarVelocity.x).toFixed(2));
    let velZ = Math.round(parseFloat(avatarVelocity.z).toFixed(2));

    if (velX > 0) {
      if (actionSprite.currentAction !== actions.walk_right) {
        actions.walk_right.playLoop();
      }
    } else if (velX < 0) {
      if (actionSprite.currentAction !== actions.walk_left) {
        actions.walk_left.playLoop();
      }
    } else if (velZ > 0) {
      if (actionSprite.currentAction !== actions.walk_down) {
        actions.walk_down.playLoop();
      }
    } else if (velZ < 0) {
      if (actionSprite.currentAction !== actions.walk_up) {
        actions.walk_up.playLoop();
      }
    } else {
      if (actionSprite.currentAction) {
        actionSprite.currentAction.stop();
        actionSprite.currentAction = null;
      }
    }
  }
  update(parentObj, velocity) {
    //const localPlayer = playersManager.getLocalPlayer();

    if (this.meshApp) {
      //localPlayer.avatar.app.visible = false;
      var delta = this.clock.getDelta();
      this.meshApp.position.copy(parentObj.position);
      this.meshApp.position.y = 1;
      if (this.actions) {
        this.updateAnimation(velocity);
        this.spriteMixer.update(delta);
        this.meshApp.updateMatrixWorld();
        //console.log('we updating', delta);
      }
    }
  }
  delete() {
    if (this.meshApp) {
      this.actions = null;
      this.spriteMixer = null;
      this.meshApp.parent.remove(this.meshApp);
      this.meshApp.destroy();
    }
  }
}
