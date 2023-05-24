import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    userMention,
} from 'discord.js';
import { Config, IConfig } from '../database/Config';
import { Deck, IDeck } from '../database/Deck';
import { IMatch, Match } from '../database/Match';
import { IProfile, Profile } from '../database/Profile';
import { ISeason, Season } from '../database/Season';
import { Command } from '../types/Command';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Displays your profile information.'),

    async execute(interaction: ChatInputCommandInteraction) {
        // User profile
        const profile: IProfile = await Profile.findOneAndUpdate(
            { _id: interaction.user.id },
            { _id: interaction.user.id },
            { new: true, upsert: true }
        );

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle('Profile Information')
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(
                `This is the statistics for ${userMention(
                    interaction.user.id
                )}, both overall and for this season.`
            )
            .setColor('Blue');

        // Current deck
        const deck: IDeck | null = profile.currentDeck
            ? await Deck.findOne({ _id: profile.currentDeck })
            : null;

        const deckText = deck
            ? deck.deckList
                ? `[${deck.name}](${deck.deckList})`
                : deck.name
            : 'No deck selected.';

        embed.addFields({ name: 'Current Deck', value: deckText });

        // Match statistics
        const matches: IMatch[] = await Match.find({
            'players.userId': interaction.user.id,
            $nor: [{ 'players.confirmed': false }],
        });

        const wins = matches.filter(
            (match) => match.winnerUserId === interaction.user.id
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
        const season: ISeason | null = await Season.findOne({
            endDate: { $exists: false },
        });

        if (season) {
            const seasonMatches = matches.filter((match) =>
                match.season.equals(season._id)
            );

            const seasonWins = seasonMatches.filter(
                (match) => match.winnerUserId === interaction.user.id
            ).length;

            const seasonLosses = seasonMatches.length - seasonWins;

            matchesPlayedText += ` (${seasonMatches.length} this season)`;
            matchesWonText += ` (${seasonWins} this season)`;
            matchesLostText += ` (${seasonLosses} this season)`;
            winRateText += ` (${Math.floor(
                (seasonWins / (seasonMatches.length || 1)) * 100
            )}% this season)`;

            const config: IConfig = await Config.findOneAndUpdate(
                {},
                {},
                { new: true, upsert: true }
            );

            const points =
                wins * config.pointsGained - losses * config.pointsLost;

            const pointsText = `You have ${config.basePoints + points} points.`;

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
