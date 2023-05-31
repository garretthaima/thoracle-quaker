import { ChatInputCommandInteraction } from 'discord.js';
import { ADMIN_USER_IDS } from '../env';
import { Command, newCommand, newSubcommand } from '../types/Command';

const command = newCommand().setName('admin').setDescription('Admin commands.');

const adminMigrate = newSubcommand()
    .setName('migrate')
    .setDescription('Migrates old data.');

const adminUpdate = newSubcommand()
    .setName('update')
    .setDescription('Updates the slash commands.');

export = <Command>{
    data: command.addSubcommand(adminMigrate).addSubcommand(adminUpdate),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!ADMIN_USER_IDS.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'You do not have permission to do this.',
                ephemeral: true,
            });
        }

        switch (interaction.options.getSubcommand()) {
            case 'migrate':
                await handleMigrate(interaction);
                break;

            case 'update':
                await handleUpdate(interaction);
                break;
        }
    },
};

async function handleMigrate(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        content: 'Test',
        ephemeral: true,
    });
}

async function handleUpdate(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        content: 'Test',
        ephemeral: true,
    });
}
