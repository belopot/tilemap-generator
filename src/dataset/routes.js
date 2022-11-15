import React from 'react';
import GenerateDungeon from 'pages/GenerateDungeon';
import EditRooms from 'pages/EditRooms';
import EditDungeon from 'pages/EditDungeon';

export const PrimaryRoutes = [
  {
    path: '/',
    title: 'Generate dungeon',
    component: <GenerateDungeon />,
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
