const { Client } = require('discord.js');
const fs = require('fs');

module.exports = function(token) {
    const client = new Client();

    const bot3Members = JSON.parse(fs.readFileSync('./json/bot3.json', 'utf-8'));
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
    const botMessage = config.botMessage;

    client.once('ready', async () => {
        console.log('Bot3 prêt à envoyer des messages');

        for (let memberId of bot3Members) {
            try {
                const member = await client.users.fetch(memberId);
                await member.send(botMessage);
                console.log(`Message envoyé à ${member.tag}`);
            } catch (error) {
                console.error(`Erreur avec ${memberId}:`, error);
            }
        }

        console.log('Bot3 a terminé d\'envoyer tous les messages.');
        client.destroy();
    });

    client.login(token);
};
