import { Client, ClientOptions, Collection } from 'discord.js';
import { handleError } from '../utils/interaction';
import { Command } from './Command';

export class CommandClient extends Client {
    public commands: Collection<string, Command>;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();

        this.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.commands.get(interaction.commandName);

            try {
                await command?.execute(interaction);
            } catch (error) {
                handleError(error, interaction);
            }
        });
    }
}
