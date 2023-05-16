import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Deck, Profile } from '../database';
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
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        switch (interaction.options.getSubcommand()) {
            case 'use':
                handleUse(
                    interaction,
                    interaction.options.getString('name', true),
                    interaction.options.getString('deck-list', true)
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
    const existingDecks = await Deck.count({ player: interaction.user.id });

    if (existingDecks >= 50) {
        return await interaction.reply({
            content: 'You have reached the deck limit.',
            ephemeral: true,
        });
    }

    const deck = await Deck.findOneAndUpdate(
        {
            player: interaction.user.id,
            $or: [{ name }, { deckList }],
        },
        { $set: { player: interaction.user.id, name, deckList } },
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
