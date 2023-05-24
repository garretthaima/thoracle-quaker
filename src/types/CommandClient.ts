import { Client, ClientOptions, Collection } from 'discord.js';
import { handleError } from '../utils/interaction';
import { Command } from './Command';

export class CommandClient extends Client {
    public commands: Collection<string, Command>;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();

        this.on('interactionCreate', async (interaction): Promise<any> => {
            if (!interaction.isChatInputCommand()) return;

            if (!interaction.guildId) {
                return await interaction.reply({
                    content: 'This command cannot be run in direct messages.',
                    ephemeral: true,
                });
            }

            const command = this.commands.get(interaction.commandName);

            try {
                await command?.execute(interaction);
            } catch (error) {
                handleError(error, interaction);
            }
        });
    }
}
