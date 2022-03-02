import { Player } from "@gathertown/gather-game-client";
import { App } from "@slack/bolt";
import { ChatPostMessageArguments, WebClient } from "@slack/web-api";

const client = new WebClient(process.env.SLACK_BOT_TOKEN);
export const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const hype = [
  "it's lit af",
  "party's just gettin started",
  "things are crazy rn",
  "don't you dare miss this",
  "everyone's talking about it",
  "don't get fomo",
  "go nuts",
  "let's fucking go",
  "we're all waiting for YOU",
  "it's not a party w/o u",
]
const getHype = (): string => {
  return hype[Math.min(Math.floor(Math.random() * hype.length), hype.length - 1)]
}

const keepinItPositive = [
  "the team needs u",
  "the party's still goin strong",
  "keep the party going",
  "that means there's more space for YOU",
  "in case you were waiting for them to leave, now's the time",
]
const getKeepinItPositive = (): string => {
  return keepinItPositive[Math.min(Math.floor(Math.random() * keepinItPositive.length), keepinItPositive.length - 1)]
}

const resurrect = [
  "get a party started",
  "be the change you want to see",
  "its only empty until you join",
  "make them regret leaving",
]
const getResurrect = (): string => {
  return resurrect[Math.min(Math.floor(Math.random() * resurrect.length), resurrect.length - 1)]
}

export const postMessage = async (newPlayers: Player[], leftPlayers: Player[], allPlayers: Player[]) => {
  const allPlayerNames = allPlayers.map(player => player.name).join(", ")
  const isLit = newPlayers.length > 0
  const isDyin = leftPlayers.length > 0 && allPlayers.length > 0
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `beavertown ${newPlayers.length > 0 ? 'poppin off' : 'winding down'}`,
      }
    },
  ];

  if (newPlayers.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: newPlayers.map(player => player.name).join(", ") + (allPlayers.length > 1 ? " joined " + allPlayerNames : " is holdin it down all by them self"),
      }
    });
  }

  if (leftPlayers.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: leftPlayers.map(player => player.name).join(", ") + " dipped" + (allPlayers.length > 0 ? ", but " + allPlayerNames + " still holdin it down" : ""),
      }
    });
  }

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${isLit ? getHype() : isDyin ? getKeepinItPositive() : getResurrect()}, <https://app.gather.town/app/PQR3oEaLR3HhjuWh/stunning-beaver|roll thru>`,
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