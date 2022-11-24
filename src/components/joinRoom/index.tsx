import React, { useContext, useState } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";

interface IJoinRoomProps {}

export function JoinRoom(props: IJoinRoomProps) {
  const [roomName, setRoomName] = useState("");
  const [isJoining, setJoining] = useState(false);

  const { setInRoom, isInRoom } = useContext(gameContext);

  const handleRoomNameChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.value;
    setRoomName(value);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = socketService.socket;
    if (!roomName || roomName.trim() === "" || !socket) return;

    setJoining(true);

    const joined = await gameService
      .joinGameRoom(socket, roomName)
      .catch((err) => {
        alert(err);
      });

    if (joined) setInRoom(true);

    setJoining(false);
  };

  return (
    <form onSubmit={joinRoom}>
      <div>
        <h4>Enter Room ID to Join the Game</h4>
        <input
          placeholder="Room ID"
          value={roomName}
          onChange={handleRoomNameChange}
        />
        <button type="submit" disabled={isJoining}>
          {isJoining ? "Joining..." : "Joing"}
        </button>
      </div>
    </form>
  );
}
