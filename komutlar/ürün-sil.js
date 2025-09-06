const { SlashCommandBuilder } = require('discord.js');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ürün-sil')
        .setDescription('Ürün siler')
        .addStringOption(option =>
            option.setName('ürün-kodu')
                .setDescription('Silinecek ürünün kodu')
                .setRequired(true)),

    async execute(interaction) {
        // Owner kontrolü
        if (interaction.user.id !== config.ownerID) {
            return await interaction.reply({ 
                content: '❌ Bu komutu sadece bot sahibi kullanabilir!', 
                flags: 64 
            });
        }

        const urunKodu = interaction.options.getString('ürün-kodu');
        const urun = db.get(`urunler.${urunKodu}`);

        if (!urun) {
            return await interaction.reply({ 
                content: '❌ Bu ürün kodu bulunamadı!', 
                flags: 64 
            });
        }

        // Ürünü sil
        db.delete(`urunler.${urunKodu}`);

        await interaction.reply({ 
            content: `✅ **${urun.ad}** ürünü başarıyla silindi!`, 
            flags: 64 
        });
    }
};
