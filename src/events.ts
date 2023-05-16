import { client } from './index';

client.once('ready', () => {
    console.log(`${client.user!.tag} is now online.`);
});
