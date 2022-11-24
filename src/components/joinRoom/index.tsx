/* eslint-disable @typescript-eslint/no-unused-vars */
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
    <section className="hero is-fullheight is-fullwidth">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-4">
              <form onSubmit={joinRoom} className="box">
                <h4 className="title is-4">Enter Room ID to Join the Game</h4>
                <div className="field">
                  <div className="field">
                    <input className="input" placeholder="Username" />
                  </div>
                  <input
                    className="input"
                    placeholder="Room ID"
                    value={roomName}
                    onChange={handleRoomNameChange}
                    required
                  />
                </div>
                <div className="field mt-5">
                  <button
                    className="button is-dark is-fullwidth"
                    type="submit"
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Joing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
