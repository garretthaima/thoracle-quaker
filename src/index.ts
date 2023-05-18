import { IntentsBitField, REST, Routes } from 'discord.js';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import sourceMaps from 'source-map-support';
import { CLIENT_ID, DATABASE, GUILD_ID, TOKEN } from './env';
import { CommandClient } from './types/CommandClient';

sourceMaps.install();

// Connect the database
mongoose.connect(DATABASE);

// Initialize Discord API client
export const client = new CommandClient({
    intents: [IntentsBitField.Flags.Guilds],
});

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

// Register events
require('./events');

// Login to the bot account
client.login(TOKEN);
