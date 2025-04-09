const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

module.exports = function(token, config) { 
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.MessageContent, 
        ]
    });

    const botMembers = JSON.parse(fs.readFileSync(`./json/bot2.json`, 'utf-8'));
    const botMessage = config.botMessage;
    const cooldown = config.cooldown;

    client.once('ready', async () => {
        console.log('Bot2 prêt à envoyer des messages');
        let index = 0;

        const interval = setInterval(async () => {
            if (index < botMembers.length) {
                const memberId = botMembers[index];
                try {
                    const member = await client.users.fetch(memberId);  
                    await member.send(botMessage);
                    console.log(`Message envoyé à ${member.tag}`);
                } catch (error) {
                    console.log(`Échec de l'envoi du message à ${memberId}`);
                }
                index++;
            } else {
                clearInterval(interval);
                console.log('Bot2 a terminé d\'envoyer tous les messages.');
                client.destroy();
            }
        }, cooldown);
    });

    client.login(token);
};
