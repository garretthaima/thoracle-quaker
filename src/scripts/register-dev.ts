import { registerGuildCommands } from '../commands';

registerGuildCommands().then(() => {
    console.log('Guild slash commands have been registered.');
    process.exit();
});
