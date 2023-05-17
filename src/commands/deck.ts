import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import {
    Deck,
    IDeck,
    IMatch,
    IProfile,
    ISeason,
    Match,
    Profile,
    Season,
} from '../database';
import { Command } from '../types/Command';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('deck')
        .setDescription('Manages your decks.')
        .addSubcommand((command) =>
            command
                .setName('use')
                .setDescription('Sets your current deck.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('Name of the deck.')
                        .setMaxLength(64)
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName('deck-list')
                        .setDescription('URL for the decklist.')
                        .setMaxLength(256)
                        .setRequired(true)
                )
        )
        .addSubcommand((command) =>
            command
                .setName('stats')
                .setDescription('Displays your deck statistics.')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('The deck to check the stats of.')
                )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'use':
                await handleUse(
                    interaction,
                    interaction.options.getString('name', true),
                    interaction.options.getString('deck-list', true)
                );
                break;

            case 'stats':
                await handleStats(
                    interaction,
                    interaction.options.getString('name') ?? null
                );
                break;
        }
    },
};

async function handleUse(
    interaction: ChatInputCommandInteraction,
    name: string,
    deckList: string
) {
    const existingDecks = await Deck.count({ userId: interaction.user.id });

    if (existingDecks >= 50) {
        return await interaction.reply({
            content: 'You have reached the deck limit.',
            ephemeral: true,
        });
    }

    const deck: IDeck = await Deck.findOneAndUpdate(
        {
            userId: interaction.user.id,
            $or: [{ name }, { deckList }],
        },
        { $set: { userId: interaction.user.id, name, deckList } },
        { new: true, upsert: true }
    );

    await Profile.findOneAndUpdate(
        { _id: interaction.user.id },
        { $set: { currentDeck: deck._id } },
        { upsert: true }
    );

    await interaction.reply({
        content: 'The deck is now in use.',
        ephemeral: true,
    });
}

async function handleStats(
    interaction: ChatInputCommandInteraction,
    name: string | null
) {
    // User profile
    const profile: IProfile = await Profile.findOneAndUpdate(
        { _id: interaction.user.id },
        { _id: interaction.user.id },
        { new: true, upsert: true }
    );

    // Current deck
    const deck: IDeck | null =
        name === null
            ? profile.currentDeck
                ? await Deck.findOne({ _id: profile.currentDeck })
                : null
            : await Deck.findOne({ userId: interaction.user.id, name });

    if (!deck) {
        return await interaction.reply({
            content:
                name === null
                    ? 'No deck is currently selected.'
                    : 'There is no deck with that name.',
            ephemeral: true,
        });
    }

    // Create embed
    const embed = new EmbedBuilder()
        .setTitle(`Deck Statistics - ${deck.name}`)
        .setURL(deck.deckList)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(
            `This is the statistics for [${deck.name}](${deck.deckList}), both overall and for this season.`
        )
        .setColor('Blue');

    // Match statistics
    const matches: IMatch[] = await Match.find({
        players: {
            $elemMatch: { userId: interaction.user.id, deck: deck._id },
        },
        $nor: [{ 'players.confirmed': false }],
    });

    const wins = matches.filter(
        (match) => match.winnerUserId === interaction.user.id
    ).length;

    const losses = matches.length - wins;

    let matchesPlayedText = `You played this deck in ${matches.length} game${
        matches.length === 1 ? '' : 's'
    }`;

    let matchesWonText = `You won with this deck in ${wins} game${
        wins === 1 ? '' : 's'
    }`;

    let matchesLostText = `You lost with this deck in ${losses} game${
        losses === 1 ? '' : 's'
    }`;

    let winRateText = `You have a ${Math.floor(
        (wins / (matches.length || 1)) * 100
    )}% winrate with this deck`;

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
}
