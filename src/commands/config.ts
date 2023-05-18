import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js';
import { Config, IConfig } from '../database';
import { Command } from '../types/Command';

export = <Command>{
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Manages the config.')
        .addSubcommand((command) =>
            command
                .setName('minimum-games')
                .setDescription('Games required to be seen on the leaderboard.')
                .addIntegerOption((option) =>
                    option
                        .setName('amount')
                        .setDescription('The number of games.')
                )
        )
        .addSubcommand((command) =>
            command
                .setName('points-gained')
                .setDescription('Points gained after winning a match.')
                .addIntegerOption((option) =>
                    option
                        .setName('amount')
                        .setDescription('The number of points gained.')
                )
        )
        .addSubcommand((command) =>
            command
                .setName('points-lost')
                .setDescription('Points lost after losing a match.')
                .addIntegerOption((option) =>
                    option
                        .setName('amount')
                        .setDescription('The number of points lost.')
                )
        )
        .addSubcommand((command) =>
            command
                .setName('base-points')
                .setDescription('Points added to values when displayed.')
                .addIntegerOption((option) =>
                    option
                        .setName('amount')
                        .setDescription('The number of points added.')
                )
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'minimum-games':
                await handleMinimumGames(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;

            case 'points-gained':
                await handlePointsGained(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;

            case 'points-lost':
                await handlePointsLost(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;

            case 'base-points':
                await handleBasePoints(
                    interaction,
                    interaction.options.getInteger('amount')
                );
                break;
        }
    },
};

async function handleMinimumGames(
    interaction: ChatInputCommandInteraction,
    amount: number | null
) {
    if (!interaction.memberPermissions?.has('ManageGuild')) {
        return await interaction.reply({
            content: 'You do not have permission to do this.',
            ephemeral: true,
        });
    }

    const config: IConfig = await Config.findOneAndUpdate(
        {},
        { $set: { minimumGamesPerPlayer: amount ?? undefined } },
        { new: true, upsert: true }
    );

    await interaction.reply({
        content: `The minimum games per player is ${
            amount === null ? 'currently' : 'now'
        } ${config.minimumGamesPerPlayer}.`,
        ephemeral: true,
    });
}

async function handlePointsGained(
    interaction: ChatInputCommandInteraction,
    amount: number | null
) {
    if (!interaction.memberPermissions?.has('ManageGuild')) {
        return await interaction.reply({
            content: 'You do not have permission to do this.',
            ephemeral: true,
        });
    }

    const config: IConfig = await Config.findOneAndUpdate(
        {},
        { $set: { pointsGained: amount ?? undefined } },
        { new: true, upsert: true }
    );

    await interaction.reply({
        content: `The points gained per match win is ${
            amount === null ? 'currently' : 'now'
        } ${config.pointsGained}.`,
        ephemeral: true,
    });
}

async function handlePointsLost(
    interaction: ChatInputCommandInteraction,
    amount: number | null
) {
    if (!interaction.memberPermissions?.has('ManageGuild')) {
        return await interaction.reply({
            content: 'You do not have permission to do this.',
            ephemeral: true,
        });
    }

    const config: IConfig = await Config.findOneAndUpdate(
        {},
        { $set: { pointsLost: amount ?? undefined } },
        { new: true, upsert: true }
    );

    await interaction.reply({
        content: `The points lost per match loss is ${
            amount === null ? 'currently' : 'now'
        } ${config.pointsLost}.`,
        ephemeral: true,
    });
}

async function handleBasePoints(
    interaction: ChatInputCommandInteraction,
    amount: number
) {
    if (!interaction.memberPermissions?.has('ManageGuild')) {
        return await interaction.reply({
            content: 'You do not have permission to do this.',
            ephemeral: true,
        });
    }

    const config: IConfig = await Config.findOneAndUpdate(
        {},
        { $set: { basePoints: amount ?? undefined } },
        { new: true, upsert: true }
    );

    await interaction.reply({
        content: `The points added to values when displayed is ${
            amount === null ? 'currently' : 'now'
        } ${config.basePoints}.`,
        ephemeral: true,
    });
}
