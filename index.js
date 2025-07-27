const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const botTokens = {
    bot1: '',
    bot2: '',
    bot3: '',
    bot4: '',
    bot5: '',
    bot5: '',
    bot6: '',
    bot7: '',
    bot8: '',
    bot9: '',
    bot10: '',
};

const guildId = '1339708198726139905';
const cooldown = 6000;
const excludeIds = ['123456789012345678', '987654321098765432'];
const botMessageTemplate = `https://discord.gg/tada rejoins vite tu me manque`;
const color = "#303434";
const jsonPath = path.join(__dirname, 'json');

async function detectBotsInGuild() {
    const workingBots = [];

    for (const [name, token] of Object.entries(botTokens)) {
        const client = new Client({ intents: [GatewayIntentBits.Guilds] });

        try {
            await client.login(token);
            const guild = await client.guilds.fetch(guildId);
            if (guild) {
                console.log(`✅ ${name} est dans le serveur.`);
                workingBots.push({ name, token });
            }
        } catch (err) {
            console.warn(`❌ ${name} non présent dans le serveur ou erreur : ${err.code === 10004 ? 'Unknown Guild' : err.message}`);
        } finally {
            client.destroy();
        }
    }

    if (workingBots.length === 0) {
        throw new Error("Aucun bot valide dans le serveur.");
    }

    return workingBots;
}

async function splitMembersAndRun() {
    try {
        const workingBots = await detectBotsInGuild();

        const fetchClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
        await fetchClient.login(workingBots[0].token);
        const guild = await fetchClient.guilds.fetch(guildId);
        const members = await guild.members.fetch();

        const botCount = workingBots.length;
        const botMembers = Array.from({ length: botCount }, () => []);

        let i = 0;
        for (const member of members.values()) {
            if (member.user.bot || excludeIds.includes(member.id)) continue;
            botMembers[i % botCount].push(member.id);
            i++;
        }

        const totalMembers = botMembers.flat().length;
        const estimatedTimeMs = totalMembers * cooldown;
        const minutes = Math.floor(estimatedTimeMs / 60000);
        const seconds = Math.floor((estimatedTimeMs % 60000) / 1000);

        console.log(`⏳ Environ ${minutes}m ${seconds}s pour DM ${totalMembers} membres.`);

        if (!fs.existsSync(jsonPath)) fs.mkdirSync(jsonPath, { recursive: true });
        botMembers.forEach((list, idx) => {
            fs.writeFileSync(path.join(jsonPath, `bot${idx + 1}.json`), JSON.stringify(list, null, 2));
        });

        fetchClient.destroy();

        workingBots.forEach(({ name, token }, index) => {
            const membersBefore = botMembers.slice(0, index).reduce((acc, arr) => acc + arr.length, 0);
            runBot(name, token, index + 1, totalMembers, membersBefore);
        });

    } catch (err) {
        console.error(`❌ ${err.message}`);
    }
}

function runBot(name, token, botNumber, totalCount, startIndex) {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.DirectMessages
        ],
        partials: ['CHANNEL']
    });

    client.once('ready', async () => {
        console.log(`🤖 ${name} connecté : ${client.user.tag}`);

        const filePath = path.join(jsonPath, `bot${botNumber}.json`);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Fichier bot${botNumber}.json introuvable`);
            client.destroy();
            return;
        }

        const memberIds = JSON.parse(fs.readFileSync(filePath));
        for (let i = 0; i < memberIds.length; i++) {
            const globalIndex = startIndex + i + 1;
            const id = memberIds[i];

            if (excludeIds.includes(id)) continue;

            try {
                const user = await client.users.fetch(id);
                console.log(`[${globalIndex}/${totalCount}] ${user.tag}`);
                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(botMessageTemplate);
                await user.send({ embeds: [embed] });
                await wait(cooldown);
            } catch (err) {
                console.error(`⚠️ Erreur avec ${id} : ${err.message}`);
            }
        }

        try {
            fs.writeFileSync(filePath, JSON.stringify([]));
            console.log(`🧹 ${filePath} vidé après exécution.`);
        } catch (err) {
            console.error(`⚠️ Erreur lors du vidage de ${filePath} : ${err.message}`);
        }

        console.log(`✅ ${name} a terminé.`);
        client.destroy();
    });

    client.login(token).catch(err => {
        console.error(`❌ Connexion échouée pour ${name} :`, err.message);
    });
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

splitMembersAndRun();
