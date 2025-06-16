import React from 'react';

type RoomFormProps = {
  roomId: string;
  setRoomId: (id: string) => void;
  username: string;
  setUsername: (name: string) => void;
  handleJoin: (e: React.FormEvent) => void;
  handleCreate: (e: React.FormEvent) => void;
};

const RoomForm: React.FC<RoomFormProps> = ({
  roomId,
  setRoomId,
  username,
  setUsername,
  handleJoin,
  handleCreate,
}) => {
  return (
    <div className="room-form-container">
      <form className="home-form">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          className="home-input"
        />
        
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="home-input"
        />
        
        <button 
          className="continue-button"
          onClick={handleJoin}
          type="submit"
        >
          Join Room
        </button>
        <button 
          className="continue-button"
          onClick={handleCreate} 
          type="button"
        >
          Create Room
        </button>
      </form>
    </div>
  );
};

export default RoomForm; 