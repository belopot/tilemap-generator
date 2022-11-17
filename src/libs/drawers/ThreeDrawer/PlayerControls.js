import * as THREE from 'three';

export class PlayerControls {
  constructor(player) {
    this.player = player;

    // API

    this.enabled = true;

    this.center = new THREE.Vector3(
      player.position.x,
      player.position.y,
      player.position.z,
    );

    this.moveSpeed = 0.2;
    this.turnSpeed = 0.1;

    this.userZoom = true;
    this.userZoomSpeed = 1.0;

    this.userRotate = true;
    this.userRotateSpeed = 1.5;

    this.autoRotate = false;
    this.autoRotateSpeed = 0.1;
    this.YAutoRotation = false;

    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;

    this.minDistance = 0;
    this.maxDistance = Infinity;

    // internals

    var scope = this;

    var PIXELS_PER_ROUND = 1800;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var zoomStart = new THREE.Vector2();
    var zoomEnd = new THREE.Vector2();
    var zoomDelta = new THREE.Vector2();

    var lastPosition = new THREE.Vector3(
      player.position.x,
      player.position.y,
      player.position.z,
    );
    var playerIsMoving = false;

    var keyState = {};
    var STATE = {NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2};
    var state = STATE.NONE;

    // events

    this.rotateLeft = function (angle) {
      if (angle === undefined) {
        angle = getAutoRotationAngle();
      }
    };

    this.rotateRight = function (angle) {
      if (angle === undefined) {
        angle = getAutoRotationAngle();
      }
    };

    this.rotateUp = function (angle) {
      if (angle === undefined) {
        angle = getAutoRotationAngle();
      }
    };

    this.rotateDown = function (angle) {
      if (angle === undefined) {
        angle = getAutoRotationAngle();
      }
    };

    this.zoomIn = function (zoomScale) {
      if (zoomScale === undefined) {
        zoomScale = getZoomScale();
      }
    };

    this.zoomOut = function (zoomScale) {
      if (zoomScale === undefined) {
        zoomScale = getZoomScale();
      }
    };

    this.update = function () {
      this.checkKeyStates();

      this.center = this.player.position;

      if (state === STATE.NONE && playerIsMoving) {
        this.autoRotate = true;
      } else {
        this.autoRotate = false;
      }

      if (lastPosition.distanceTo(this.player.position) > 0) {
        lastPosition.copy(this.player.position);
      } else if (lastPosition.distanceTo(this.player.position) == 0) {
        playerIsMoving = false;
      }
    };

    this.checkKeyStates = function () {
      if (keyState[38] || keyState[87]) {
        // up arrow or 'w' - move forward

        this.player.position.x -=
          this.moveSpeed * Math.sin(this.player.rotation.y);
        this.player.position.z -=
          this.moveSpeed * Math.cos(this.player.rotation.y);
      }

      if (keyState[40] || keyState[83]) {
        // down arrow or 's' - move backward
        playerIsMoving = true;

        this.player.position.x +=
          this.moveSpeed * Math.sin(this.player.rotation.y);
        this.player.position.z +=
          this.moveSpeed * Math.cos(this.player.rotation.y);
      }

      if (keyState[37] || keyState[65]) {
        // left arrow or 'a' - rotate left
        playerIsMoving = true;

        this.player.rotation.y += this.turnSpeed;
      }

      if (keyState[39] || keyState[68]) {
        // right arrow or 'd' - rotate right
        playerIsMoving = true;

        this.player.rotation.y -= this.turnSpeed;
      }
      if (keyState[81]) {
        // 'q' - strafe left
        playerIsMoving = true;

        this.player.position.x -=
          this.moveSpeed * Math.cos(this.player.rotation.y);
        this.player.position.z +=
          this.moveSpeed * Math.sin(this.player.rotation.y);
      }

      if (keyState[69]) {
        // 'e' - strage right
        playerIsMoving = true;

        this.player.position.x +=
          this.moveSpeed * Math.cos(this.player.rotation.y);
        this.player.position.z -=
          this.moveSpeed * Math.sin(this.player.rotation.y);
      }
    };

    function getAutoRotationAngle() {
      return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed;
    }

    function getZoomScale() {
      return Math.pow(0.95, scope.userZoomSpeed);
    }

    function onMouseDown(event) {
      if (scope.enabled === false) return;
      if (scope.userRotate === false) return;

      event.preventDefault();

      if (event.button === 0) {
        state = STATE.ROTATE;

        rotateStart.set(event.clientX, event.clientY);
      } else if (event.button === 1) {
        state = STATE.ZOOM;

        zoomStart.set(event.clientX, event.clientY);
      }

      document.addEventListener('mousemove', onMouseMove, false);
      document.addEventListener('mouseup', onMouseUp, false);
    }

    function onMouseMove(event) {
      if (scope.enabled === false) return;

      event.preventDefault();

      if (state === STATE.ROTATE) {
        rotateEnd.set(event.clientX, event.clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart);

        scope.rotateLeft(
          ((2 * Math.PI * rotateDelta.x) / PIXELS_PER_ROUND) *
            scope.userRotateSpeed,
        );
        scope.rotateUp(
          ((2 * Math.PI * rotateDelta.y) / PIXELS_PER_ROUND) *
            scope.userRotateSpeed,
        );

        rotateStart.copy(rotateEnd);
      } else if (state === STATE.ZOOM) {
        zoomEnd.set(event.clientX, event.clientY);
        zoomDelta.subVectors(zoomEnd, zoomStart);

        if (zoomDelta.y > 0) {
          scope.zoomIn();
        } else {
          scope.zoomOut();
        }

        zoomStart.copy(zoomEnd);
      }
    }

    function onMouseUp(event) {
      if (scope.enabled === false) return;
      if (scope.userRotate === false) return;

      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);

      state = STATE.NONE;
    }

    function onMouseWheel(event) {
      if (scope.enabled === false) return;
      if (scope.userRotate === false) return;

      var delta = 0;

      if (event.wheelDelta) {
        //WebKit / Opera / Explorer 9

        delta = event.wheelDelta;
      } else if (event.detail) {
        // Firefox

        delta = -event.detail;
      }

      if (delta > 0) {
        scope.zoomOut();
      } else {
        scope.zoomIn();
      }
    }

    function onKeyDown(event) {
      event = event || window.event;

      keyState[event.keyCode || event.which] = true;
    }

    function onKeyUp(event) {
      event = event || window.event;

      keyState[event.keyCode || event.which] = false;
    }

    document.addEventListener(
      'contextmenu',
      function (event) {
        event.preventDefault();
      },
      false,
    );
    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mousewheel', onMouseWheel, false);
    document.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
  }
}
