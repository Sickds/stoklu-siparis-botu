const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ürün-liste')
        .setDescription('Tüm ürünleri listeler'),

    async execute(interaction) {
        // Owner kontrolü
        if (interaction.user.id !== config.ownerID) {
            return await interaction.reply({ 
                content: '❌ Bu komutu sadece bot sahibi kullanabilir!', 
                flags: 64 
            });
        }

        const urunler = db.get('urunler');
        
        if (!urunler || Object.keys(urunler).length === 0) {
            return await interaction.reply({ 
                content: '❌ Henüz hiç ürün eklenmemiş!', 
                flags: 64 
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('📦 Ürün Listesi')
            .setDescription('Mevcut tüm ürünler:')
            .setFooter({ text: config.embedFooter })
            .setTimestamp();

        let urunListesi = '';
        let sayac = 1;

        for (const [kod, urun] of Object.entries(urunler)) {
            urunListesi += `**${sayac}.** 🏷️ **${kod}** - ${urun.ad} - 💰 **${urun.fiyat}₺**\n`;
            sayac++;
        }

        embed.setDescription(urunListesi);

        await interaction.reply({ 
            embeds: [embed], 
            flags: 64 
        });
    }
};
