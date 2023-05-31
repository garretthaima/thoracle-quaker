import { ChatInputCommandInteraction } from 'discord.js';
import { Types } from 'mongoose';
import { registerGlobalCommands, registerGuildCommands } from '../commands';
import { OldConfig, OldDeck, OldMatch, OldSeason, OldUser } from '../database';
import { Config } from '../database/Config';
import { Deck, IDeck } from '../database/Deck';
import { Match } from '../database/Match';
import { Profile } from '../database/Profile';
import { ISeason, Season } from '../database/Season';
import { ADMIN_USER_IDS } from '../env';
import { Command, newCommand, newSubcommand } from '../types/Command';

const command = newCommand().setName('admin').setDescription('Admin commands.');

const adminMigrate = newSubcommand()
    .setName('migrate')
    .setDescription('Migrates old data.');

const adminUpdate = newSubcommand()
    .setName('update')
    .setDescription('Updates the slash commands.')
    .addBooleanOption((option) =>
        option
            .setName('global')
            .setDescription('Updates slash commands globally.')
            .setRequired(true)
    );

export = <Command>{
    data: command.addSubcommand(adminMigrate).addSubcommand(adminUpdate),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!ADMIN_USER_IDS.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'You do not have permission to do this.',
                ephemeral: true,
            });
        }

        switch (interaction.options.getSubcommand()) {
            case 'migrate':
                await handleMigrate(interaction);
                break;

            case 'update':
                await handleUpdate(
                    interaction,
                    interaction.options.getBoolean('global', true)
                );
                break;
        }
    },
};

async function handleMigrate(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const oldConfigs = await OldConfig.find({});
    const oldMatches = await OldMatch.find({});
    const oldSeasons = await OldSeason.find({});
    const oldUsers = await OldUser.find({});
    const oldDecks = await OldDeck.find({});

    for (const old of oldConfigs) {
        await Config.create({
            guildId: old._server,
            minimumGamesPerPlayer: old._player_threshold,
            pointsGained: old._points_gained,
            pointsLost: old._points_lost,
        });
    }

    for (const old of oldSeasons) {
        await Season.create({
            guildId: old._server,
            name: old._season_name,
            startDate: new Date(old._season_start),
            endDate:
                old._season_end === 'Not Specified'
                    ? undefined
                    : new Date(old._season_end),
        });
    }

    for (const old of oldMatches) {
        const season: ISeason | null = await Season.findOne({
            guildId: old._server,
            name: old._season,
        });

        if (!season) continue;

        const deck1: IDeck = await Deck.findOneAndUpdate(
            {
                guildId: old._server,
                userId: old._player1,
                name:
                    old._player1Deck === 'Rogue'
                        ? old._player1Rogue
                        : old._player1Deck,
                deckList:
                    old.player1Deck === 'Rogue'
                        ? undefined
                        : oldDecks.find(
                              (deck) => old._player1Deck === deck._name
                          )?._link,
            },
            {},
            { upsert: true, new: true }
        );

        const deck2: IDeck = await Deck.findOneAndUpdate(
            {
                guildId: old._server,
                userId: old._player2,
                name:
                    old._player2Deck === 'Rogue'
                        ? old._player2Rogue
                        : old._player2Deck,
                deckList:
                    old.player2Deck === 'Rogue'
                        ? undefined
                        : oldDecks.find(
                              (deck) => old._player2Deck === deck._name
                          )?._link,
            },
            {},
            { upsert: true, new: true }
        );

        const deck3: IDeck = await Deck.findOneAndUpdate(
            {
                guildId: old._server,
                userId: old._player3,
                name:
                    old._player3Deck === 'Rogue'
                        ? old._player3Rogue
                        : old._player3Deck,
                deckList:
                    old.player3Deck === 'Rogue'
                        ? undefined
                        : oldDecks.find(
                              (deck) => old._player3Deck === deck._name
                          )?._link,
            },
            {},
            { upsert: true, new: true }
        );

        const deck4: IDeck = await Deck.findOneAndUpdate(
            {
                guildId: old._server,
                userId: old._player4,
                name:
                    old._player4Deck === 'Rogue'
                        ? old._player4Rogue
                        : old._player4Deck,
                deckList:
                    old.player4Deck === 'Rogue'
                        ? undefined
                        : oldDecks.find(
                              (deck) => old._player4Deck === deck._name
                          )?._link,
            },
            {},
            { upsert: true, new: true }
        );

        const match = new Match({
            guildId: old._server,
            season: season._id,
            confirmedAt: (old._id as Types.ObjectId).getTimestamp(),
            winnerUserId: old._player1,
            players: [
                {
                    userId: old._player1,
                    confirmed: old._player1Confirmed === 'Y',
                    deck: deck1._id,
                },
                {
                    userId: old._player2,
                    confirmed: old._player2Confirmed === 'Y',
                    deck: deck2._id,
                },
                {
                    userId: old._player3,
                    confirmed: old._player3Confirmed === 'Y',
                    deck: deck3._id,
                },
                {
                    userId: old._player4,
                    confirmed: old._player4Confirmed === 'Y',
                    deck: deck4._id,
                },
            ],
        });

        match._id = old._id as Types.ObjectId;

        await match.save();
    }

    for (const old of oldUsers) {
        let currentDeck: IDeck | undefined = undefined;

        if (old._currentDeck !== 'None') {
            currentDeck =
                (await Deck.findOne(
                    {
                        guildId: old._server,
                        userId: old._mentionValue,
                        name: old._currentDeck.replace(/\| Rogue$/, ''),
                    },
                    {},
                    { upsert: true, new: true }
                )) ?? undefined;
        }

        await Profile.create({
            guildId: old._server,
            userId: old._mentionValue,
            currentDeck: currentDeck?._id,
        });
    }

    await interaction.editReply({
        content: 'The data has been migrated.',
    });
}

async function handleUpdate(
    interaction: ChatInputCommandInteraction,
    isGlobal: boolean
) {
    if (isGlobal) {
        await registerGlobalCommands();
    } else {
        await registerGuildCommands();
    }

    await interaction.reply({
        content: 'The bot commands have been reloaded.',
        ephemeral: true,
    });
}
