import React from 'react';
import GenerateDungeon from 'pages/GenerateDungeon';
import EditRooms from 'pages/EditRooms';
import EditDungeon from 'pages/EditDungeon';
import ExtendDungeon from 'pages/ExtendDungeon';
import Playground from 'pages/Playground';

export const PrimaryRoutes = [
  {
    path: '/',
    title: 'Playground',
    component: <Playground />,
  },
  {
    path: '/generate-dungeon',
    title: 'Generate dungeon',
    component: <GenerateDungeon />,
  },
  {
    path: '/extend-dungeon',
    title: 'Extend dungeon',
    component: <ExtendDungeon />,
  },
  {
    path: '/edit-dungeon',
    title: 'Edit dungeon',
    component: <EditDungeon />,
  },
  {
    path: '/edit-rooms',
    title: 'Edit rooms',
    component: <EditRooms />,
  },
];
