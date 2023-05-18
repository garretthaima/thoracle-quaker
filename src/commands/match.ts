import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js';
import { IMatch, Match } from '../database';
import { Command } from '../types/Command';
import { matchListFields } from '../utils/match';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('match')
        .setDescription('Manages logged matches.')
        .addSubcommand((command) =>
            command.setName('pending').setDescription('Lists pending matches.')
        )
        .addSubcommand((command) =>
            command
                .setName('accept')
                .setDescription('Accepts a match.')
                .addStringOption((option) =>
                    option
                        .setName('match')
                        .setDescription('The match to accept.')
                        .setRequired(true)
                )
        )
        .addSubcommand((command) =>
            command
                .setName('delete')
                .setDescription('Deletes a match.')
                .addStringOption((option) =>
                    option
                        .setName('match')
                        .setDescription('The match to delete.')
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'pending':
                await handlePending(interaction);
                break;

            case 'accept':
                await handleAccept(
                    interaction,
                    interaction.options.getString('match', true)
                );
                break;

            case 'delete':
                await handleDelete(
                    interaction,
                    interaction.options.getString('match', true)
                );
                break;
        }
    },
};

async function handlePending(interaction: ChatInputCommandInteraction) {
    const matches: IMatch[] = await Match.find({ 'players.confirmed': false });

    if (!matches.length) {
        return await interaction.reply({
            content: 'There are no pending matches.',
            ephemeral: true,
        });
    }

    const fields = await matchListFields(matches.slice(0, 4));

    const embed = new EmbedBuilder()
        .setTitle('Pending Matches - Page 1')
        .setDescription('These are matches that have not been confirmed yet.')
        .setColor('Blue')
        .addFields(fields);

    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}

async function handleAccept(
    interaction: ChatInputCommandInteraction,
    id: string
) {
    const match: IMatch | null = await Match.findById(id);

    if (!match) {
        return await interaction.reply({
            content: 'There is no match with that id.',
            ephemeral: true,
        });
    }

    let confirmed = true;

    for (const player of match.players) {
        confirmed &&= player.confirmed;

        player.confirmed = true;
    }

    if (confirmed) {
        return await interaction.reply({
            content: 'That match has already been confirmed by all players.',
            ephemeral: true,
        });
    }

    await match.save();

    await interaction.reply({
        content: 'That match has been accepted.',
        ephemeral: true,
    });
}

async function handleDelete(
    interaction: ChatInputCommandInteraction,
    id: string
) {
    const match: IMatch | null = await Match.findById(id);

    if (!match) {
        return await interaction.reply({
            content: 'There is no match with that id.',
            ephemeral: true,
        });
    }

    await match.deleteOne();

    await interaction.reply({
        content: 'That match has been deleted.',
        ephemeral: true,
    });
}
