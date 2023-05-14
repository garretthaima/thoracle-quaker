import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { CommandClient } from './types/CommandClient';

// Read environment variables
dotenv.config();

const TOKEN = process.env.TOKEN!;
if (!TOKEN) throw new Error('Missing `TOKEN` environment variable.');

const CLIENT_ID = process.env.CLIENT_ID!;
if (!CLIENT_ID) throw new Error('Missing `CLIENT_ID` environment variable.');

const GUILD_ID = process.env.GUILD_ID!;
if (!GUILD_ID) throw new Error('Missing `GUILD_ID` environment variable.');

// Initialize Discord API client
export const client = new CommandClient({ intents: [] });

// Load the command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
}

// Register the slash commands
const rest = new REST({ version: '10' }).setToken(TOKEN);
rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: [...client.commands.values()].map((command) => command.data.toJSON()),
});
