import React from 'react';

type RoomFormProps = {
  roomId: string;
  setRoomId: (id: string) => void;
  username: string;
  setUsername: (name: string) => void;
  handleJoin: (e: React.FormEvent) => void;
  handleCreate: (e: React.FormEvent) => void;
  handleGenerateRoomId: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isJoining: boolean;
};

const RoomForm: React.FC<RoomFormProps> = ({
  roomId,
  setRoomId,
  username,
  setUsername,
  handleJoin,
  handleCreate,
  handleGenerateRoomId,
  isJoining,
}) => {
  return (
    <div className="room-form-container">
      <form className="home-form">
        {!isJoining && (
          <div className="form-group">
            <label htmlFor="roomId">Room ID</label>
            <div className="input-group">
              <input
                id="roomId"
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="home-input"
                readOnly={isJoining}
              />
              <button 
                type="button"
                className="generate-btn" 
                onClick={handleGenerateRoomId}
              >
                Generate
              </button>
            </div>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="home-input"
          />
        </div>
        <div className="button-group">
          {isJoining ? (
            <button 
              className="home-btn join-btn" 
              onClick={handleJoin}
              type="submit"
            >
              Join Room
            </button>
          ) : (
            <>
              <button 
                className="home-btn join-btn" 
                onClick={handleJoin}
                type="submit"
              >
                Join Room
              </button>
              <button 
                className="home-btn create-btn" 
                onClick={handleCreate} 
                type="button"
              >
                Create Room
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default RoomForm; 