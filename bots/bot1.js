const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const botTokens = {
    bot1: 'MTM1NTY2ODMzNzQ0Njg3OTQzNA.GQyb1x.BsiQ5E1egQD1zLN1QKLRdHZ--3y3WyWr7RN9LY',
    bot2: 'MTM1NTY2ODQxNjE0NDM0MzEyMA.GgsX_g.oAuDAhye_mVuSdc0Yr-rvhawE6nWMnxDHORkQE',
    bot3: 'MTM1NTY2ODUzOTM0MzkwMDkxNQ.GFrDze.NzpXHFAu-GO9pb06gMSquoAc2badGVCqlQ-NEs'
};

const guildId = '1346236366010454116';
const botMessageTemplate = `Coucou, Rejoins ce serveur y’a 0 règlement https://discord.gg/paname`;

const cooldown = 4000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ]
});

client.once('ready', async () => {
    console.log('Le bot principal est prêt et connecté!');

    try {
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

        const jsonPath = './json/';
        if (!fs.existsSync(jsonPath)) {
            fs.mkdirSync(jsonPath);
        }

        const createMessages = (membersArray) => {
            return membersArray.map(id => botMessageTemplate.replace('{user}', id));
        };

        fs.writeFileSync(path.join(jsonPath, 'bot1.json'), JSON.stringify(createMessages(bot1Members), null, 2));
        fs.writeFileSync(path.join(jsonPath, 'bot2.json'), JSON.stringify(createMessages(bot2Members), null, 2));
        fs.writeFileSync(path.join(jsonPath, 'bot3.json'), JSON.stringify(createMessages(bot3Members), null, 2));

        console.log('Les membres ont été répartis dans les fichiers JSON');
    } catch (error) {
        console.error('Erreur lors de la récupération des membres du serveur:', error);
    }

    client.config = {
        botMessage: botMessageTemplate,
        cooldown: cooldown
    };

    client.destroy();

    runBot('bot1.js', botTokens.bot1, client.config);
    runBot('bot2.js', botTokens.bot2, client.config);
    runBot('bot3.js', botTokens.bot3, client.config);
});

client.on('error', error => {
    console.error('Erreur de client:', error);
});

client.login(botTokens.bot1).catch(error => {
    console.error('Erreur de connexion:', error);
});

function runBot(botFile, token, config) {
    require(path.join(__dirname, 'bots', botFile))(token, config);
}
