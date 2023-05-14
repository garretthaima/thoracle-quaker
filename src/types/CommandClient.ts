import { Client, ClientOptions, Collection } from 'discord.js';
import { Command } from './Command';

export class CommandClient extends Client {
    public commands: Collection<string, Command>;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();

        this.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content:
                            'An error occurred while executing this command: ' +
                            error,
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content:
                            'An error occurred while executing this command: ' +
                            error,
                        ephemeral: true,
                    });
                }
            }
        });
    }
}
