const slashKomutYukle = require('../fonksiyonlar/slashKomutYukleyici.js');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        console.log(`✅ ${client.user.tag} olarak giriş yapıldı!`);
        console.log(`📊 ${client.guilds.cache.size} sunucuda aktif!`);
        console.log(`👥 ${client.users.cache.size} kullanıcıya hizmet veriliyor!`);
        
        await slashKomutYukle(client);
    }
};
