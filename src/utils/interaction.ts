import { Interaction } from 'discord.js';

export async function handleError(
    error: any,
    interaction: Interaction
): Promise<void> {
    console.error(error);

    if (!interaction.isRepliable()) return;

    if (interaction.replied || interaction.deferred) {
        await interaction
            .followUp({
                content:
                    'An error occurred while executing this command: ' + error,
                ephemeral: true,
            })
            .catch(console.error.bind(console));
    } else {
        await interaction
            .reply({
                content:
                    'An error occurred while executing this command: ' + error,
                ephemeral: true,
            })
            .catch(console.error.bind(console));
    }
}
