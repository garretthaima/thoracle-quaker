import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
    SlashCommandBuilder,
    userMention,
} from 'discord.js';
import {
    Deck,
    IDeck,
    IProfile,
    ISeason,
    Match,
    Profile,
    Season,
} from '../database';
import { Command } from '../types/Command';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Logs a match with you as the winner.')
        .addUserOption((option) =>
            option
                .setName('player-1')
                .setDescription('The first player other than the winner.')
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('player-2')
                .setDescription('The second player other than the winner.')
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('player-3')
                .setDescription('The third player other than the winner.')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const season: ISeason | null = await Season.findOne({
            endDate: { $exists: false },
        });

        if (!season) {
            return await interaction.reply({
                content: 'There is no current season.',
                ephemeral: true,
            });
        }

        const playerIds = [
            interaction.user.id,
            interaction.options.getUser('player-1', true).id,
            interaction.options.getUser('player-2', true).id,
            interaction.options.getUser('player-3', true).id,
        ];

        if (new Set(playerIds).size !== playerIds.length) {
            return await interaction.reply({
                content: 'All players in a match must be unique.',
                ephemeral: true,
            });
        }

        const profilePromises = playerIds.map((userId) =>
            Profile.findOneAndUpdate<IProfile>(
                { _id: userId },
                { $set: { _id: userId } },
                { new: true, upsert: true }
            )
        );
        const profiles = await Promise.all(profilePromises);

        const deckPromises = profiles.map((profile) =>
            profile.currentDeck
                ? Deck.findOne<IDeck>({ _id: profile.currentDeck })
                : null
        );
        const decks = await Promise.all(deckPromises);

        const embed = new EmbedBuilder()
            .setTitle('Match Confirmation')
            .setDescription(
                'Click below to confirm whether or not the match between these players is correct.'
            )
            .setColor('Blue');

        const playerText = profiles
            .map((profile) => userMention(profile._id))
            .join('\n');

        const deckText = decks
            .map((deck) =>
                deck ? `[${deck.name}](${deck.deckList})` : 'Not specified'
            )
            .join('\n');

        embed.addFields([
            { name: 'Player', value: playerText, inline: true },
            { name: 'Deck', value: deckText, inline: true },
            { name: 'Confirmed', value: 'Nobody has confirmed this match.' },
        ]);

        const actionRow =
            new ActionRowBuilder<MessageActionRowComponentBuilder>();

        const confirmButton = new ButtonBuilder()
            .setLabel('Confirm')
            .setCustomId('confirm')
            .setStyle(ButtonStyle.Success);

        const disputeButton = new ButtonBuilder()
            .setLabel('Dispute')
            .setCustomId('dispute')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setLabel('Cancel')
            .setCustomId('cancel')
            .setStyle(ButtonStyle.Danger);

        actionRow.addComponents(confirmButton, disputeButton, cancelButton);

        await interaction.reply({
            content: playerIds.map((userId) => userMention(userId)).join(', '),
            embeds: [embed],
            components: [actionRow],
        });

        const message = await interaction.fetchReply();

        await Match.create({
            season: season._id,
            channelId: interaction.channelId,
            messageId: message.id,
            winnerUserId: interaction.user.id,
            players: profiles.map((profile) => ({
                userId: profile._id,
                deck: profile.currentDeck,
            })),
        });
    },
};
