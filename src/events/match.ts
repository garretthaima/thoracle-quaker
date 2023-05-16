import {
    ButtonInteraction,
    Message,
    channelMention,
    userMention,
} from 'discord.js';
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

    await match.save();

    await button.reply('You have confirmed the match.');

    const channel = client.channels.cache.get(match.channelId);

    if (channel?.isTextBased()) {
        let message: Message | null = null;

        try {
            message = await channel.messages.fetch(match.messageId);
        } catch {}

        if (!message) return;

        const embed = message.embeds[0];
        const field = embed.fields[embed.fields.length - 1];

        const confirmedPlayers = match.players.filter(
            (player) => player.confirmed
        );

        if (confirmedPlayers.length === match.players.length) {
            await message.delete();
        } else {
            field.value = confirmedPlayers
                .map((player) => userMention(player.userId))
                .join(', ');

            await message.edit({
                embeds: [embed],
            });
        }
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
        });
    }

    const channel = client.channels.cache.get(match.channelId);

    if (channel?.isTextBased()) {
        let message: Message | null = null;

        try {
            message = await channel.messages.fetch(match.messageId);
        } catch {}

        if (!message) return;

        const thread = await message.startThread({ name: 'Match Dispute' });

        match.disputeThreadId = thread.id;

        await match.save();

        for (const player of match.players) {
            await thread.members.add(player.userId).catch(() => {});
        }

        await thread.send(
            `${userMention(
                button.user.id
            )} please explain your reasoning for disputing this match, so that it can be resolved.`
        );
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
            channel.messages.delete(match.messageId).catch(() => {});
        }
    }
}
