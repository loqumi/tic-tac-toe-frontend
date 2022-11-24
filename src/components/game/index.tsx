import React, { useCallback, useContext, useEffect, useState } from "react";
import gameContext from "../../gameContext";
import gameService from "../../services/gameService";
import socketService from "../../services/socketService";

export type IPlayMatrix = Array<Array<string | null>>;
export interface IStartGame {
  start: boolean;
  symbol: "x" | "o";
}

export function Game() {
  const [matrix, setMatrix] = useState<IPlayMatrix>([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);

  const {
    playerSymbol,
    setPlayerSymbol,
    setPlayerTurn,
    isPlayerTurn,
    setGameStarted,
    isGameStarted,
  } = useContext(gameContext);

  const checkGameState = useCallback(
    (matrix: IPlayMatrix) => {
      for (let i = 0; i < matrix.length; i++) {
        let row = [];
        for (let j = 0; j < matrix[i].length; j++) {
          row.push(matrix[i][j]);
        }

        if (row.every((value) => value && value === playerSymbol)) {
          return [true, false];
        } else if (row.every((value) => value && value !== playerSymbol)) {
          return [false, true];
        }
      }

      for (let i = 0; i < matrix.length; i++) {
        let column = [];
        for (let j = 0; j < matrix[i].length; j++) {
          column.push(matrix[j][i]);
        }

        if (column.every((value) => value && value === playerSymbol)) {
          return [true, false];
        } else if (column.every((value) => value && value !== playerSymbol)) {
          return [false, true];
        }
      }

      if (matrix[1][1]) {
        if (matrix[0][0] === matrix[1][1] && matrix[2][2] === matrix[1][1]) {
          if (matrix[1][1] === playerSymbol) return [true, false];
          else return [false, true];
        }

        if (matrix[2][0] === matrix[1][1] && matrix[0][2] === matrix[1][1]) {
          if (matrix[1][1] === playerSymbol) return [true, false];
          else return [false, true];
        }
      }

      //Check for a tie
      if (matrix.every((m) => m.every((v) => v !== null))) {
        return [true, true];
      }

      return [false, false];
    },
    [playerSymbol]
  );

  const updateGameMatrix = (column: number, row: number, symbol: "x" | "o") => {
    const newMatrix = [...matrix];

    if (!!newMatrix[row][column]) return;

    if (newMatrix[row][column] === null || newMatrix[row][column] === "null") {
      newMatrix[row][column] = symbol;
      setMatrix(newMatrix);
    }

    if (socketService.socket) {
      gameService.updateGame(socketService.socket, newMatrix);
      const [currentPlayerWon, otherPlayerWon] = checkGameState(newMatrix);
      if (currentPlayerWon && otherPlayerWon) {
        gameService.gameWin(socketService.socket, "The Game is a TIE!");
        alert("The Game is a TIE!");
      } else if (currentPlayerWon && !otherPlayerWon) {
        gameService.gameWin(socketService.socket, "You Lost!");
        alert("You Won!");
      }

      setPlayerTurn(false);
    }
  };

  const handleGameUpdate = useCallback(() => {
    if (socketService.socket)
      gameService.onGameUpdate(socketService.socket, (newMatrix) => {
        setMatrix(newMatrix);
        checkGameState(newMatrix);
        setPlayerTurn(true);
      });
  }, [checkGameState, setPlayerTurn]);

  const handleGameStart = useCallback(() => {
    if (socketService.socket)
      gameService.onStartGame(socketService.socket, (options) => {
        setGameStarted(true);
        setPlayerSymbol(options.symbol);
        if (options.start) setPlayerTurn(true);
        else setPlayerTurn(false);
      });
  }, [setGameStarted, setPlayerSymbol, setPlayerTurn]);

  const handleGameWin = useCallback(() => {
    if (socketService.socket)
      gameService.onGameWin(socketService.socket, (message) => {
        console.log("Here", message);
        setPlayerTurn(false);
        alert(message);
      });
  }, [setPlayerTurn]);

  useEffect(() => {
    handleGameUpdate();
    handleGameStart();
    handleGameWin();
  }, [handleGameStart, handleGameUpdate, handleGameWin]);

  return (
    <section className="hero is-fullheight is-fullwidth">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered is-flex">
            <div className="columns is-flex-direction-column">
              <div className="column">
                {!isGameStarted && (
                  <h2 className="title is-7 has-text-centered">
                    Waiting for Other Player to Join to Start the Game!
                  </h2>
                )}
              </div>
              <div className="column">
                <div className="box is-relative">
                  {(!isGameStarted || !isPlayerTurn) && (
                    <div className="is-overlay is-fullheight is-fullwidth" />
                  )}
                  {matrix.map((row, rowIdx) => {
                    return (
                      <div className="columns is-centered is-flex" key={rowIdx}>
                        {row.map((column, columnIdx) => (
                          <div
                            className="column is-one-third is-clickable box has-background-dark mb-1 px-6 py-6 mr-1"
                            key={columnIdx}
                            onClick={() =>
                              updateGameMatrix(columnIdx, rowIdx, playerSymbol)
                            }
                          >
                            <div className="is-relative columns is-centered">
                              {column && column !== "null" ? (
                                <span className="is-size-5 has-text-white has-text-centered is-overlay">
                                  {column === "x" ? "X" : "O"}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div className="columns is-centered">
                  <a className="button is-dark" href="/">
                    Back
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
