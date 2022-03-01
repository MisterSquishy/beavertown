import { config } from "dotenv"
config();
import { Game } from "@gathertown/gather-game-client";
import websocket from "isomorphic-ws"
import { exit } from "process";
import { fetchPlayers, savePlayers } from "./redis";
import { postMessage } from "./slack"

export interface Player {
  id: string;
  name: string;
  activelySpeaking: boolean;
}

// @ts-ignore
global.WebSocket = websocket;

const game = new Game(process.env.GATHERTOWN_SPACE_ID, () => Promise.resolve({ apiKey: process.env.GATHERTOWN_API_KEY || "" }));
game.connect();
game.subscribeToConnection((connected) => {
  if (!connected) {
    console.error("failed to connect")
  };
});

// for some reason this causes playerMoves to be sent twice for each player(?)
// only the second one has their name/other data
game.subscribeToAll();

const players: Player[] = []
game.subscribeToEvent("playerMoves", (data, context) => {
  if (context.player?.name) {
    players.push({
      id: context.playerId ?? context.player.name,
      name: context.player.name,
      activelySpeaking: !!context.player.activelySpeaking,
    })
  }
});

// wait a bit for all the socket events to come through to make sure we got the whole krew
setTimeout(async () => {
  try {
    const previousPlayers = await fetchPlayers();
    await savePlayers(players);
    const newPlayers = players.filter(player => !previousPlayers.find(prevPlayer => player.id === prevPlayer.id));
    const leftPlayers = previousPlayers.filter(prevPlayer => !players.find(player => player.id === prevPlayer.id));
    console.log({ newPlayers, leftPlayers })
    if (newPlayers.length > 0) {
      await postMessage(newPlayers, leftPlayers);
    }
  } catch(e) {
    console.error(e);
  } finally {
    exit()
  }
}, 10000);
