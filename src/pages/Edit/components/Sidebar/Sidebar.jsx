import React from 'react';
import RoomsList from './components/RoomsList';
import FileManagement from './components/FileManagement';
import {Divider} from 'primereact/divider';

export default function Sidebar() {
  return (
    <div>
      <FileManagement />
      <Divider />
      <RoomsList />
    </div>
  );
}
