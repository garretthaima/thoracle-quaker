import { ChatInputCommandInteraction } from 'discord.js';
import { registerGlobalCommands, registerGuildCommands } from '../commands';
import { ADMIN_USER_IDS } from '../env';
import { Command, newCommand, newSubcommand } from '../types/Command';

const command = newCommand().setName('admin').setDescription('Admin commands.');

const adminUpdate = newSubcommand()
    .setName('update')
    .setDescription('Updates the slash commands.')
    .addBooleanOption((option) =>
        option
            .setName('global')
            .setDescription('Updates slash commands globally.')
            .setRequired(true)
    );

export = <Command>{
    data: command.addSubcommand(adminUpdate),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!ADMIN_USER_IDS.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'You do not have permission to do this.',
                ephemeral: true,
            });
        }

        switch (interaction.options.getSubcommand()) {
            case 'update':
                await handleUpdate(
                    interaction,
                    interaction.options.getBoolean('global', true)
                );
                break;
        }
    },
};

async function handleUpdate(
    interaction: ChatInputCommandInteraction,
    isGlobal: boolean
) {
    if (isGlobal) {
        await registerGlobalCommands();
    } else {
        await registerGuildCommands();
    }

    await interaction.reply({
        content: 'The bot commands have been reloaded.',
        ephemeral: true,
    });
}
