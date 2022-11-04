import React, {Fragment} from 'react';
import RoomsList from './components/RoomsList';
import FileManagement from './components/FileManagement';

export default function Sidebar() {
  return (
    <Fragment>
      <FileManagement />
      <RoomsList />
    </Fragment>
  );
}
