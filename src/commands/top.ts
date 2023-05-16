import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    userMention,
} from 'discord.js';
import { Config, IConfig, IMatch, Match, Season } from '../database';
import { Command } from '../types/Command';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Displays the season leaderboard.')
        .addStringOption((option) =>
            option.setName('season').setDescription('The season to show.')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString('season');

        const season = await Season.findOne(
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

        const matches: IMatch[] = await Match.find({
            season: season._id,
            $not: { 'players.confirmed': false },
        });

        const config: IConfig = await Config.findOneAndUpdate(
            {},
            {},
            { new: true, upsert: true }
        );

        const playerStandings: Record<
            string,
            { matches: number; wins: number; losses: number; points: number }
        > = {};

        for (const match of matches) {
            for (const { userId } of match.players) {
                const standing = playerStandings[userId];

                standing.matches++;

                if (userId === match.winnerUserId) {
                    standing.wins++;
                    standing.points += config.pointsGained;
                } else {
                    standing.losses++;
                    standing.points -= config.pointsLost;
                }
            }
        }

        for (const [player, standing] of Object.entries(playerStandings)) {
            if (standing.matches < config.minimumGamesPerPlayer) {
                delete playerStandings[player];
            }
        }

        const firstPageEntries = Object.entries(playerStandings)
            .sort((a, b) => b[1].points - a[1].points)
            .slice(0, 25);

        const embed = new EmbedBuilder()
            .setTitle(`Season Leaderboard - ${season.name}`)
            .setDescription(
                firstPageEntries.length
                    ? 'These are the standings for the season.'
                    : 'Not enough matches have been logged yet.'
            )
            .setColor('Blue');

        if (firstPageEntries.length) {
            const playerText = firstPageEntries
                .map(([userId]) => userMention(userId))
                .join('\n');

            const gamesText = firstPageEntries
                .map(
                    ([_, standing]) =>
                        `${standing.matches} (${Math.floor(
                            (standing.wins / (standing.matches || 1)) * 100
                        )}% winrate)`
                )
                .join('\n');

            const pointsText = firstPageEntries
                .map(([_, standing]) =>
                    (config.basePoints + standing.points).toString()
                )
                .join('\n');

            embed.addFields([
                { name: 'Player', value: playerText, inline: true },
                { name: 'Games', value: gamesText, inline: true },
                { name: 'Points', value: pointsText, inline: true },
            ]);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
