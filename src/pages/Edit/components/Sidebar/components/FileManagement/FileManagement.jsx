import React from 'react';
import {useRooms} from 'hooks/rooms';

export default function FileManagement() {
  const {saveRooms, loadRooms} = useRooms();

  const onFileChange = event => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.addEventListener('load', event => {
      const rawJSON = event.target.result;
      const parsedJSON = JSON.parse(rawJSON);
      loadRooms(parsedJSON);
    });
    reader.readAsText(file);
  };

  return (
    <div className="p-fluid grid formgrid">
      <div className="field col-12">
        <p>Load rooms</p>
        <input type="file" accept="application/json" onChange={onFileChange} />
      </div>
      <div className="field col-12">
        <p>Save rooms</p>
        <input type="button" value="Save file" onClick={saveRooms} />
      </div>
    </div>
  );
}
