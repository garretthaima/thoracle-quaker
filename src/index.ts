import { IntentsBitField } from 'discord.js';
import sourceMaps from 'source-map-support';
import { TOKEN } from './env';
import { CommandClient } from './types/CommandClient';

sourceMaps.install();

// Initialize Discord API client
export const client = new CommandClient({
    intents: [IntentsBitField.Flags.Guilds],
});

// Register events
require('./events');

// Login to the bot account
client.login(TOKEN);
