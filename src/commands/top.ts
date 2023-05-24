import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { fetchConfig } from '../database/Config';
import { ISeason, Season } from '../database/Season';
import { Command } from '../types/Command';
import { leaderboardFields } from '../utils/leaderboard';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Displays the season leaderboard.')
        .addStringOption((option) =>
            option.setName('season').setDescription('Name of the season.')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString('season');

        const season: ISeason | null = await Season.findOne(
            name === null
                ? { guildId: interaction.guildId!, endDate: { $exists: false } }
                : { guildId: interaction.guildId!, name }
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

        const config = await fetchConfig(interaction.guildId!);

        const fields = await leaderboardFields(config, season);

        const embed = new EmbedBuilder()
            .setTitle(`Season Leaderboard - ${season.name}`)
            .setDescription(
                fields.length
                    ? 'These are the standings for the season.'
                    : 'Not enough matches have been logged yet.'
            )
            .setColor('Blue')
            .addFields(fields);

        await interaction.reply({ embeds: [embed] });
    },
};
