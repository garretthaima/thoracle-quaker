import {
    CommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

export function newCommand() {
    return new SlashCommandBuilder();
}

export function newSubcommand() {
    return new SlashCommandSubcommandBuilder();
}
