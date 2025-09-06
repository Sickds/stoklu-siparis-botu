module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`${interaction.commandName} komutu bulunamadı.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                
                const errorMessage = 'Komut çalıştırılırken bir hata oluştu!';
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMessage, flags: 64 });
                } else {
                    await interaction.reply({ content: errorMessage, flags: 64 });
                }
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId.startsWith('urun_')) {
                const urunKodu = interaction.customId.replace('urun_', '');
                const db = require('../fonksiyonlar/database.js');
                
                const urun = db.get(`urunler.${urunKodu}`);
                if (urun) {
                    await interaction.reply({ 
                        content: `📦 **${urun.ad}** ürünü seçildi!\n\n💰 Fiyat: **${urun.fiyat}₺**\n🏷️ Kod: **${urun.kod}**`, 
                        flags: 64 
                    });
                }
            }
        }
    }
};
