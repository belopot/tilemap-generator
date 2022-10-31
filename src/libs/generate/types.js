import {nanoid} from 'nanoid';

//
// Tree
//
export class TreeNode {
  left;
  right;
  leaf;

  constructor(data) {
    this.leaf = data;
  }

  /** Get the bottom-most leaves */
  get leaves() {
    const result = [];

    if (this.left && this.right) {
      result.push(...this.left.leaves, ...this.right.leaves);
    } else {
      result.push(this.leaf);
    }

    return result;
  }
}

//
// Containers
//
export class Point {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Rectangle {
  x;
  y;
  width;
  height;

  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get center() {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  get surface() {
    return this.width * this.height;
  }

  get down() {
    return this.y + this.height;
  }

  get right() {
    return this.x + this.width;
  }
}

export class Container extends Rectangle {
  id;
  room;
  corridor;

  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.id = nanoid();
  }
}

export class Room extends Rectangle {
  id;
  template;

  constructor(x, y, id, template) {
    super(x, y, template.width, template.height);

    this.id = id;
    this.template = template;
  }
}

export class Corridor extends Rectangle {
  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  get direction() {
    return this.width > this.height ? 'horizontal' : 'vertical';
  }
}

//
// Rooms
//
export const RoomTypes = ['entrance', 'monsters', 'heal', 'treasure', 'boss'];

//
// Tiles
//
export const TileDirection = {
  NorthWest: 1,
  North: 2,
  NorthEast: 4,
  West: 8,
  East: 16,
  SouthWest: 32,
  South: 64,
  SouthEast: 128,
};
export const TileType = {
  Hole: -1,
  Wall: 1,
};
export const TileTypes = ['Hole', 'Wall'];

//
// Tilemap
//
export const TileLayers = ['tiles', 'props', 'monsters'];
