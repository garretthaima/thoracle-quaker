import { ButtonInteraction, channelMention, userMention } from 'discord.js';
import { client } from '..';
import { IMatch } from '../database';

export async function handleConfirmMatch(
    button: ButtonInteraction,
    match: IMatch
) {
    const matchPlayer = match.players.find(
        (player) => player.userId === button.user.id
    );

    if (!matchPlayer) {
        return await button.reply({
            content: 'You are not part of this match.',
            ephemeral: true,
        });
    }

    if (matchPlayer.confirmed) {
        return await button.reply({
            content: 'You have already confirmed this match.',
            ephemeral: true,
        });
    }

    matchPlayer.confirmed = true;

    match.confirmedAt = new Date();

    await match.save();

    const confirmedPlayers = match.players.filter((player) => player.confirmed);

    if (confirmedPlayers.length === match.players.length) {
        await button.reply({
            content: `${match.players
                .map((player) => userMention(player.userId))
                .join(', ')},\nThe match has been confirmed.`,
        });
    } else {
        await button.reply({
            content: 'You have confirmed the match.',
            ephemeral: true,
        });
    }

    const channel = client.channels.cache.get(match.channelId);

    if (channel?.isTextBased()) {
        const message = await channel.messages
            .fetch(match.messageId)
            .catch(() => null);
        if (!message) return;

        const embed = message.embeds[0];
        const field = embed.fields[embed.fields.length - 1];

        field.value = `The following players have confirmed the match: ${confirmedPlayers
            .map((player) => userMention(player.userId))
            .join(', ')}.`;

        await message.edit({
            embeds: [embed],
            components:
                confirmedPlayers.length === match.players.length
                    ? []
                    : undefined,
        });
    }
}

export async function handleDisputeMatch(
    button: ButtonInteraction,
    match: IMatch
) {
    const matchPlayer = match.players.find(
        (player) => player.userId === button.user.id
    );

    if (!matchPlayer) {
        return await button.reply({
            content: 'You are not part of this match.',
            ephemeral: true,
        });
    }

    if (match.disputeThreadId) {
        return await button.reply({
            content: `This match has already been disputed in ${channelMention(
                match.disputeThreadId
            )}.`,
            ephemeral: true,
        });
    }

    const channel = client.channels.cache.get(match.channelId);

    if (channel?.isTextBased()) {
        const message = await channel.messages
            .fetch(match.messageId)
            .catch(() => null);

        if (!message) {
            return await button.reply({
                content: 'The message could not be found.',
                ephemeral: true,
            });
        }

        const thread = await message.startThread({ name: 'Match Dispute' });

        match.disputeThreadId = thread.id;

        await match.save();

        for (const player of match.players) {
            await thread.members.add(player.userId).catch(() => null);
        }

        await thread.send(
            `${userMention(
                button.user.id
            )} please explain your reasoning for disputing this match, so that it can be resolved.`
        );

        await button.reply({
            content: 'The match dispute thread has been created.',
            ephemeral: true,
        });
    }
}

export async function handleCancelMatch(
    button: ButtonInteraction,
    match: IMatch
) {
    if (button.user.id === match.winnerUserId) {
        await match.deleteOne();

        const channel = client.channels.cache.get(match.channelId);

        if (channel?.isTextBased()) {
            channel.messages.delete(match.messageId).catch(() => null);
        }

        const disputeChannel = client.channels.cache.get(match.disputeThreadId);
        await disputeChannel?.delete();
    }

    await button.reply({
        content: 'The match has been cancelled.',
        ephemeral: true,
    });
}
