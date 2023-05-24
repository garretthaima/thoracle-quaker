import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    TimestampStyles,
    time,
} from 'discord.js';
import { Match } from '../database/Match';
import { ISeason, Season } from '../database/Season';
import { Command } from '../types/Command';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('season')
        .setDescription('Manages the current season.')
        .addSubcommand((command) =>
            command
                .setName('info')
                .setDescription('Shows info about a season.')
                .addStringOption((option) =>
                    option.setName('name').setDescription('Name of the season.')
                )
        )
        .addSubcommand((command) =>
            command
                .setName('start')
                .setDescription('Starts a new season.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('Name of the season.')
                        .setRequired(true)
                )
        )
        .addSubcommand((command) =>
            command.setName('end').setDescription('Ends the current season.')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'info':
                await handleInfo(
                    interaction,
                    interaction.options.getString('name')
                );
                break;

            case 'start':
                await handleStart(
                    interaction,
                    interaction.options.getString('name', true)
                );
                break;

            case 'end':
                await handleEnd(interaction);
                break;
        }
    },
};

async function handleInfo(
    interaction: ChatInputCommandInteraction,
    name: string | null
) {
    const season: ISeason | null = await Season.findOne(
        name === null ? { endDate: { $exists: false } } : { name }
    );

    if (!season) {
        return await interaction.reply({
            content:
                name === null
                    ? 'There is no current season.'
                    : 'There is no season with that name.',
            ephemeral: true,
        });
    }

    const startDateText = time(season.startDate, TimestampStyles.LongDateTime);
    const endDateText = season.endDate
        ? time(season.endDate, TimestampStyles.LongDateTime)
        : 'The season has not ended yet.';

    const matchesPlayed = await Match.count({ season: season.id });
    const matchesPlayedText = `${matchesPlayed} game${
        matchesPlayed === 1 ? '' : 's'
    } have been played.`;

    const embed = new EmbedBuilder()
        .setTitle(`Season Information - ${season.name}`)
        .setDescription(
            season.endDate
                ? 'This is information about a previous season, rather than the current season.'
                : 'This is information about the current season.'
        )
        .setColor('Blue')
        .addFields(
            { name: 'Start Date', value: startDateText },
            { name: 'End Date', value: endDateText },
            { name: 'Matches Played', value: matchesPlayedText }
        );

    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}

async function handleStart(
    interaction: ChatInputCommandInteraction,
    name: string
) {
    if (!interaction.memberPermissions?.has('ManageGuild')) {
        return await interaction.reply({
            content: 'You do not have permission to do this.',
            ephemeral: true,
        });
    }

    const existingSeason: ISeason | null = await Season.findOne({
        $or: [{ endDate: { $exists: false } }, { name }],
    });

    if (existingSeason) {
        if (existingSeason.endDate) {
            return await interaction.reply({
                content: 'There is already a season with that name.',
                ephemeral: true,
            });
        } else {
            return await interaction.reply({
                content: 'There is already an active season.',
                ephemeral: true,
            });
        }
    }

    await Season.create({ name });

    await interaction.reply({
        content: 'The season has been started.',
        ephemeral: true,
    });
}

async function handleEnd(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has('ManageGuild')) {
        return await interaction.reply({
            content: 'You do not have permission to do this.',
            ephemeral: true,
        });
    }

    const existingSeason: ISeason | null = await Season.findOneAndUpdate(
        { endDate: { $exists: false } },
        { endDate: Date.now() }
    );

    if (!existingSeason) {
        return await interaction.reply({
            content: 'There is no current season.',
            ephemeral: true,
        });
    }

    await interaction.reply({
        content: 'The current season is now over.',
        ephemeral: true,
    });
}
