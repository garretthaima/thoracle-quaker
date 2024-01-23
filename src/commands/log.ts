import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
    userMention,
} from 'discord.js';
import { Types } from 'mongoose';
import { Deck, IDeck } from '../database/Deck';
import { Match } from '../database/Match';
import { fetchProfile } from '../database/Profile';
import { ISeason, Season } from '../database/Season';
import { Command, newCommand } from '../types/Command';

const command = newCommand()
    .setName('log')
    .setDescription('Logs a match with you as the winner.')
    .addUserOption((option) =>
        option
            .setName('player-1')
            .setDescription('First player other than winner.')
            .setRequired(true)
    )
    .addUserOption((option) =>
        option
            .setName('player-2')
            .setDescription('Second player other than winner.')
            .setRequired(true)
    )
    .addUserOption((option) =>
        option
            .setName('player-3')
            .setDescription('Third player other than winner.')
            .setRequired(false)
    );

export = <Command>{
    data: command,

    async execute(interaction: ChatInputCommandInteraction) {
        const season: ISeason | null = await Season.findOne({
            guildId: interaction.guildId!,
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
            fetchProfile(interaction.guildId!, userId)
        );
        const profiles = await Promise.all(profilePromises);

        const deckPromises = profiles.map((profile) =>
            profile.currentDeck
                ? Deck.findOne<IDeck>({ _id: profile.currentDeck })
                : null
        );
        const decks = await Promise.all(deckPromises);

        const matchId = new Types.ObjectId();

        const embed = new EmbedBuilder()
            .setTitle('Match Confirmation')
            .setDescription(
                'Click below to confirm whether or not the match between these players is correct.'
            )
            .setFooter({
                text: `Match Id: (${matchId.toString()})`,
            })
            .setColor('Blue');

        const playerText = profiles
            .map((profile) => userMention(profile.userId))
            .join('\n');

        const deckText = decks
            .map((deck) =>
                deck
                    ? deck.deckList
                        ? `[${deck.name}](${deck.deckList})`
                        : deck.name
                    : 'Not specified'
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

        const match = new Match({
            guildId: interaction.guildId!,
            channelId: interaction.channelId,
            messageId: message.id,
            winnerUserId: interaction.user.id,
            season: season._id,
            players: profiles.map((profile) => ({
                userId: profile.userId,
                deck: profile.currentDeck,
            })),
        });

        match._id = matchId;
        await match.save();
    },
};
