const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../config.js');

async function slashKomutYukle(client) {
    const komutlarKlasoru = path.join(__dirname, '..', 'komutlar');
    
    if (!fs.existsSync(komutlarKlasoru)) {
        console.log('Komutlar klasörü bulunamadı!');
        return;
    }

    const komutDosyalari = fs.readdirSync(komutlarKlasoru).filter(file => file.endsWith('.js'));
    const commands = [];

    for (const dosya of komutDosyalari) {
        const komut = require(path.join(komutlarKlasoru, dosya));
        
        if (komut.data) {
            client.commands.set(komut.data.name, komut);
            commands.push(komut.data.toJSON());
            console.log(`✅ ${komut.data.name} slash komutu yüklendi!`);
        }
    }

    // Global slash komutları kaydet
    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log('⚠️  Global slash komutları kaydediliyor...');
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log('✅ Global slash komutları başarıyla kaydedildi!');
    } catch (error) {
        console.error('❌ Slash komutları kaydedilirken hata oluştu:', error);
    }
}

module.exports = slashKomutYukle;
