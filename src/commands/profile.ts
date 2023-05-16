import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    userMention,
} from 'discord.js';
import { Config, Deck, Match, Profile, Season } from '../database';
import { Command } from '../types/Command';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Displays your profile information.'),

    async execute(interaction: ChatInputCommandInteraction) {
        const profile = await Profile.findOneAndUpdate(
            { _id: interaction.user.id },
            { _id: interaction.user.id },
            { new: true, upsert: true }
        );

        const embed = new EmbedBuilder()
            .setTitle(`Profile Information`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(
                `This is the statistics for ${userMention(
                    interaction.user.id
                )}, both total and this season.`
            )
            .setColor('Blue');

        // Current deck
        const deck = profile.currentDeck
            ? await Deck.findOne({ _id: profile.currentDeck })
            : null;

        const deckText = deck
            ? `[${deck.name}](${deck.deckList})`
            : 'No deck selected.';

        embed.addFields({ name: 'Current Deck', value: deckText });

        // Match statistics
        const matches = await Match.find({
            'players.player': interaction.user.id,
        });

        const wins = matches.filter(
            (match) => match.winner === interaction.user.id
        ).length;

        const losses = matches.length - wins;

        let matchesPlayedText = `You have played in ${matches.length} game${
            matches.length === 1 ? '' : 's'
        } total`;

        let matchesWonText = `You have won ${wins} game${
            wins === 1 ? '' : 's'
        } total`;

        let matchesLostText = `You have lost ${losses} game${
            losses === 1 ? '' : 's'
        } total`;

        let winRateText = `You have an overall ${Math.floor(
            (wins / (matches.length || 1)) * 100
        )}% winrate`;

        // Season statistics
        const season = await Season.findOne({ endDate: { $exists: false } });

        if (season) {
            const seasonMatches = matches.filter((match) =>
                match.season.equals(season._id)
            );

            const seasonWins = seasonMatches.filter(
                (match) => match.winner === interaction.user.id
            ).length;

            const seasonLosses = seasonMatches.length - seasonWins;

            matchesPlayedText += ` (${seasonMatches.length} this season)`;
            matchesWonText += ` (${seasonWins} this season)`;
            matchesLostText += ` (${seasonLosses} this season)`;
            winRateText += ` (${Math.floor(
                (seasonWins / (seasonMatches.length || 1)) * 100
            )}% this season)`;

            const config = await Config.findOneAndUpdate(
                {},
                {},
                { new: true, upsert: true }
            );

            const points =
                wins * config.pointsGained - losses * config.pointsLost;

            const pointsText = `You have ${points} points.`;

            embed.addFields({ name: 'Points', value: pointsText });
        }

        embed.addFields([
            { name: 'Matches', value: matchesPlayedText + '.' },
            { name: 'Wins', value: matchesWonText + '.' },
            { name: 'Losses', value: matchesLostText + '.' },
            { name: 'Win Rate', value: winRateText + '.' },
        ]);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
