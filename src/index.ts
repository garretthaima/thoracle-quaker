import { Client, IntentsBitField } from 'discord.js';
import sourceMaps from 'source-map-support';
import { TOKEN } from './env';

sourceMaps.install();

// Initialize Discord API client
export const client = new Client({
    intents: [IntentsBitField.Flags.Guilds],
});

// Register events
require('./events');

// Login to the bot account
client.login(TOKEN);
