import * as React from 'react';

/**
 * A placeholder when no room is selected.
 */
export function RoomEmpty() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 250,
        bottom: 0,
        top: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Select an existing room or create a new one.
    </div>
  );
}
