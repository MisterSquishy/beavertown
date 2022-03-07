import { config } from "dotenv"
config();
import { Game } from "@gathertown/gather-game-client";
import websocket from "isomorphic-ws"
import { exit } from "process";
import { app, postMessage } from "./slack"

// @ts-ignore
global.WebSocket = websocket;

const game = new Game(process.env.GATHERTOWN_SPACE_ID, () => Promise.resolve({ apiKey: process.env.GATHERTOWN_API_KEY || "" }));
game.connect();
game.subscribeToAll();
game.subscribeToConnection((connected) => {
  if (!connected) {
    console.error("failed to connect");
    game.connect();
  } else {
    console.log("connected!!!")
  }
});

game.subscribeToEvent("playerJoins", (data, context) => {
  setTimeout(() => {
    // for some reason the name isn't retrievable until l8r
    const joiner = game.getPlayer(context?.playerId ?? "")
    if (!joiner) {
      console.error('who the fuck joined', { data, context })
      return
    }
    postMessage([ joiner ], [], Object.values(game.players))
  }, 1000);
});

game.subscribeToEvent("playerExits", (data, context) => {
  const leaver = context.player
  if (!leaver) {
    console.error('who the fuck left', { data, context })
    return
  }
  postMessage([], [ leaver ], Object.values(game.players))
});

app.shortcut('check_the_gather', async ({ shortcut, ack, client }) => {
  console.log(`${shortcut.user.username} CHECKED GATHER`)
  ack();
  await client.chat.postEphemeral({
    channel: process.env.SLACK_CHANNEL_ID ?? "",
    user: shortcut.user.id,
    text: `${Object.keys(game.players).length} ${Object.keys(game.players).length === 1 ? "person" : "ppl"} are in da gather`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `beavertown got ${Object.keys(game.players).length} ${Object.keys(game.players).length === 1 ? "person" : "ppl"}`,
        }
      },
      ...Object.values(game.players).map(player => {
        const whatPlayerIsUpTo = player.activelySpeaking ? "talking abt something" :
          player.busy ? "but they busy" :
          player.goKartId.length > 0 ? "kartin like a fiend" :
          player.textStatus.length > 0 ? `saying _${player.textStatus}_` :
          player.currentDesk.length > 0 ? "gettin some desk time in" :
          player.openToConversation ? "and they lookin to chat" :
          !!player.currentArea ? `in ${player.currentArea}` :
          player.isAlone ? "all alone" :
          "going fucking bananas"
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${player.name} is here, ${whatPlayerIsUpTo}`,
          }
        }
      }),
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: '<https://app.gather.town/app/PQR3oEaLR3HhjuWh/stunning-beaver|roll thru>',
        }
      }
    ]
  })
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
