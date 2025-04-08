const { Client } = require('discord.js');
const fs = require('fs');
const client = new Client();

const botMessage = "Salut ! Je suis un bot et je t'envoie ce message.";
const guildId = 'TON_ID_DE_SERVEUR';

const botTokens = {
    bot1: 'TON_TOKEN_BOT1',
    bot2: 'TON_TOKEN_BOT2',
    bot3: 'TON_TOKEN_BOT3'
};

client.once('ready', async () => {
    console.log('Index prêt à récupérer les membres');

    const guild = await client.guilds.fetch(guildId);
    const members = await guild.members.fetch();

    let bot1Members = [];
    let bot2Members = [];
    let bot3Members = [];

    members.forEach((member, index) => {
        if (index % 3 === 0) {
            bot1Members.push(member.id);
        } else if (index % 3 === 1) {
            bot2Members.push(member.id);
        } else {
            bot3Members.push(member.id);
        }
    });

    fs.writeFileSync('./json/bot1.json', JSON.stringify(bot1Members, null, 2));
    fs.writeFileSync('./json/bot2.json', JSON.stringify(bot2Members, null, 2));
    fs.writeFileSync('./json/bot3.json', JSON.stringify(bot3Members, null, 2));

    console.log('Les membres ont été répartis dans les fichiers JSON');
    console.log('BotMessage:', botMessage);

    client.destroy();

    require('./bot1.js')(botTokens.bot1);
    require('./bot2.js')(botTokens.bot2);
    require('./bot3.js')(botTokens.bot3);
});
