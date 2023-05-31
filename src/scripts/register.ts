import { registerGlobalCommands } from '../commands';

registerGlobalCommands().then(() =>
    console.log('Global slash commands have been registered.')
);
