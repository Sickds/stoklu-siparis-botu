const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ürün-ekle')
        .setDescription('Yeni ürün ekler')
        .addStringOption(option =>
            option.setName('ürün-kodu')
                .setDescription('Ürün kodu')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('ad')
                .setDescription('Ürün adı')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('fiyat')
                .setDescription('Ürün fiyatı')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('gorsel')
                .setDescription('Ürün görseli (resim dosyası)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('açıklama')
                .setDescription('Ürün açıklaması')
                .setRequired(false)),

    async execute(interaction) {
        if (interaction.user.id !== config.ownerID) {
            return await interaction.reply({ 
                content: '❌ Bu komutu sadece bot sahibi kullanabilir!', 
                flags: 64 
            });
        }

        const urunKodu = interaction.options.getString('ürün-kodu');
        const ad = interaction.options.getString('ad');
        const fiyat = interaction.options.getNumber('fiyat');
        const gorselAttachment = interaction.options.getAttachment('gorsel');
        const aciklama = interaction.options.getString('açıklama') || 'Açıklama bulunmuyor.';

        let gorselUrl = 'https://via.placeholder.com/400x300/00ff00/ffffff?text=Ürün+Görseli';
        
        if (gorselAttachment) {
            const izinliTurler = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!izinliTurler.includes(gorselAttachment.contentType)) {
                return await interaction.reply({
                    content: '❌ Sadece resim dosyaları kabul edilir! (JPEG, PNG, GIF, WebP)',
                    flags: 64
                });
            }

            if (gorselAttachment.size > 8 * 1024 * 1024) {
                return await interaction.reply({
                    content: '❌ Dosya boyutu çok büyük! Maksimum 8MB olmalı.',
                    flags: 64
                });
            }

            gorselUrl = gorselAttachment.url;
        }

        const mevcutUrun = db.get(`urunler.${urunKodu}`);
        if (mevcutUrun) {
            return await interaction.reply({ 
                content: '❌ Bu ürün kodu zaten kullanılıyor!', 
                flags: 64 
            });
        }

        const yeniUrun = {
            kod: urunKodu,
            ad: ad,
            fiyat: fiyat,
            gorsel: gorselUrl,
            aciklama: aciklama,
            eklenmeTarihi: new Date().toLocaleDateString('tr-TR'),
            ekleyen: interaction.user.id
        };

        db.set(`urunler.${urunKodu}`, yeniUrun);

        const basariEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Ürün Başarıyla Eklendi!')
            .setDescription(`**${ad}** ürünü veritabanına kaydedildi.`)
            .addFields(
                {
                    name: '🏷️ Ürün Kodu',
                    value: `**${urunKodu}**`,
                    inline: true
                },
                {
                    name: '💰 Fiyat',
                    value: `**${fiyat}₺**`,
                    inline: true
                },
                {
                    name: '📅 Eklenme Tarihi',
                    value: `**${new Date().toLocaleDateString('tr-TR')}**`,
                    inline: true
                },
                {
                    name: '📝 Açıklama',
                    value: aciklama.length > 100 ? aciklama.substring(0, 100) + '...' : aciklama
                }
            )
            .setImage(gorselUrl)
            .setFooter({ text: config.embedFooter })
            .setTimestamp();

        await interaction.reply({
            embeds: [basariEmbed],
            flags: 64
        });
    }
};
