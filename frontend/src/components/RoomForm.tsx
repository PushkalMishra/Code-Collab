import React from 'react';

type RoomFormProps = {
  roomId: string;
  setRoomId: (id: string) => void;
  username: string;
  setUsername: (name: string) => void;
  handleJoin: (e: React.FormEvent) => void;
  handleCreate: (e: React.FormEvent) => void;
  generateRoomId: () => void;
  errorMessage?: string | null;
  clearError: () => void;
};

const RoomForm: React.FC<RoomFormProps> = ({
  roomId,
  setRoomId,
  username,
  setUsername,
  handleJoin,
  handleCreate,
  generateRoomId,
  errorMessage,
  clearError,
}) => {
  const handleInputChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    if (errorMessage) {
      clearError();
    }
  };

  return (
    <div className="text-center">
      <div className="flex justify-center items-center mb-4">
        {/* Placeholder for logo */}
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h1 className="text-4xl font-bold ml-4">
          Code <span className="text-blue-500">Sync</span>
        </h1>
      </div>
      <p className="text-gray-400 mb-8">Code, Chat and Collaborate. It's All in Sync.</p>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleJoin} className="space-y-6">
        <input
          type="text"
          placeholder="Room Id"
          value={roomId}
          onChange={e => handleInputChange(setRoomId, e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => handleInputChange(setUsername, e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Join
        </button>
      </form>

      <button
        onClick={generateRoomId}
        className="mt-4 text-blue-500 hover:underline"
      >
        Generate Unique Room Id
      </button>
    </div>
  );
};

export default RoomForm; 