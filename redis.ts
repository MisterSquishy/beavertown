import { createClient, RedisClientType } from "@node-redis/client";
import { Player } from ".";

let client: RedisClientType
const connect = async () => {
  client = createClient({
    url: process.env.REDISCLOUD_URL
  });
  await client.connect();
  return client
}
connect()

export const fetchPlayers = async (): Promise<Player[]> => {
  const storedVal = await client.get("players") ?? "[]"
  return JSON.parse(storedVal) as Player[]
}

export const savePlayers = async (players: Player[]) => {
  await client.set("players", JSON.stringify(players))
}

export const disco = async () => {
  if (!client) {
    return
  }
  await client.disconnect()
}
