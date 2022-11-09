import React from 'react';
import {useRooms} from 'hooks/rooms';
import FileInput from 'components/FileInput';
import {Button} from 'primereact/button';

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
    <div className="formgrid grid">
      <div className="field col-12">
        <FileInput onChange={onFileChange} placeholder="Load rooms" />
      </div>
      <div className="field col-12">
        <Button
          className="w-full"
          label="Export to json"
          aria-label="Export to json"
          onClick={saveRooms}
        />
      </div>
    </div>
  );
}
