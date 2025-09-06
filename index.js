const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.js');
const eventYukle = require('./fonksiyonlar/eventYukleyici.js');
const Oxy = require('discord.js-vsc')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

client.commands = new Collection();
const vsc = new Oxy(client);

vsc.ses({
    seskanali: config.seskanali,
    sunucu: config.sunucuId
})

eventYukle(client);
client.login(config.token);
