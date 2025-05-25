import React from 'react';

type RoomFormProps = {
  roomId: string;
  setRoomId: (id: string) => void;
  username: string;
  setUsername: (name: string) => void;
  handleJoin: (e: React.FormEvent) => void;
  handleCreate: (e: React.FormEvent) => void;
  handleGenerateRoomId: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const RoomForm: React.FC<RoomFormProps> = ({
  roomId,
  setRoomId,
  username,
  setUsername,
  handleJoin,
  handleCreate,
  handleGenerateRoomId,
}) => {
  return (
    <>
      <form className="home-form">
        <input
          type="text"
          placeholder="Room Id"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          className="home-input"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="home-input"
        />
        <button className="home-btn join-btn" onClick={handleJoin}>Join</button>
        <button className="home-btn create-btn" onClick={handleCreate} type="button">Create Room</button>
      </form>
      <button className="generate-room-id" onClick={handleGenerateRoomId} type="button">
        Generate Unique Room Id
      </button>
    </>
  );
};

export default RoomForm; 