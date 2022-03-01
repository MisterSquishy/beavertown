import { Player } from ".";
import { ChatPostMessageArguments, WebClient } from "@slack/web-api";

const client = new WebClient(process.env.SLACK_BOT_TOKEN);

const hype = [
  "it's lit af",
  "party's just gettin started",
  "things are crazy rn",
  "don't you dare miss this",
  "everyone's talking about it",
  "don't get fomo",
  "go nuts",
  "the team needs u",
  "🦫🦫🦫",
  "let's fucking go"
]
const getHype = (): string => {
  return hype[Math.min(Math.floor(Math.random() * hype.length), hype.length - 1)]
}

export const postMessage = async (newPlayers: Player[], leftPlayers: Player[]) => {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `beavertown poppin off`,
      }
    },
  ];

  if (newPlayers.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: newPlayers.map(player => player.name).join(", ") + " just joined",
      }
    });
  }

  if (leftPlayers.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: leftPlayers.map(player => player.name).join(", ") + " dipped",
      }
    });
  }

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${getHype()}, <https://app.gather.town/app/PQR3oEaLR3HhjuWh/stunning-beaver|roll thru>`,
    }
  });

  const payload: ChatPostMessageArguments = {
    channel: process.env.SLACK_CHANNEL_ID ?? "",
    text: `Update from beavertown:\n${newPlayers.length > 0 ? `${newPlayers.length} new ${newPlayers.length > 1 ? 'people' : 'person'}` : ''}\n${leftPlayers.length > 0 ? `${leftPlayers.length} ${leftPlayers.length > 1 ? 'people' : 'person'} bailed` : ''}`,
    blocks,
    unfurl_links: false,
  }
  const resp = await client.chat.postMessage(payload)
  console.log({ resp })
}