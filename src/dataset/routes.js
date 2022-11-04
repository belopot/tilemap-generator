import React from 'react';
import Generate from 'pages/Generate';
import Edit from 'pages/Edit';

export const PrimaryRoutes = [
  {
    path: '/',
    title: 'Generate dungeon',
    component: <Generate />,
  },
  {
    path: '/edit',
    title: 'Edit rooms',
    component: <Edit />,
  },
];
