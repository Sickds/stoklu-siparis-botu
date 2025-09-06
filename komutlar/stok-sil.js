const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stok-sil')
        .setDescription('Ürün stoklarını siler')
        .addStringOption(option =>
            option.setName('ürün-kodu')
                .setDescription('Stok silinecek ürünün kodu')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('silme-türü')
                .setDescription('Silme türü')
                .addChoices(
                    { name: 'Tüm stokları kaldır', value: 'tüm' },
                    { name: 'Belirli stoku kaldır', value: 'belirli' }
                )
                .setRequired(true))
        .addStringOption(option =>
            option.setName('stok-değeri')
                .setDescription('Silinecek stok değeri (örn: testuser3:password789)')
                .setRequired(false)),

    async execute(interaction) {
        // Owner kontrolü
        if (interaction.user.id !== config.ownerID) {
            return await interaction.reply({ 
                content: '❌ Bu komutu sadece bot sahibi kullanabilir!', 
                flags: 64 
            });
        }

        const urunKodu = interaction.options.getString('ürün-kodu');
        const silmeTuru = interaction.options.getString('silme-türü');
        const stokDegeri = interaction.options.getString('stok-değeri');

        // Ürün kontrolü
        const urun = db.get(`urunler.${urunKodu}`);
        if (!urun) {
            return await interaction.reply({ 
                content: '❌ Bu ürün kodu bulunamadı!', 
                flags: 64 
            });
        }

        // Stok dosyası kontrolü
        const stokDosyaYolu = path.join(__dirname, '..', 'stok', `${urunKodu}.txt`);
        if (!fs.existsSync(stokDosyaYolu)) {
            return await interaction.reply({ 
                content: '❌ Bu ürün için stok dosyası bulunamadı!', 
                flags: 64 
            });
        }

        try {
            // Stok dosyasını oku
            const stokIcerigi = fs.readFileSync(stokDosyaYolu, 'utf8');
            const stokSatirlari = stokIcerigi.trim().split('\n').filter(satir => satir.trim());

            if (stokSatirlari.length === 0) {
                return await interaction.reply({ 
                    content: '❌ Stok dosyası zaten boş!', 
                    flags: 64 
                });
            }

            let yeniStoklar = '';
            let silinenSayisi = 0;

            if (silmeTuru === 'tüm') {
                // Tüm stokları sil
                silinenSayisi = stokSatirlari.length;
                yeniStoklar = '';
            } else if (silmeTuru === 'belirli') {
                // Belirli stoku sil
                if (!stokDegeri) {
                    return await interaction.reply({ 
                        content: '❌ Belirli stok silmek için stok değeri belirtmelisiniz!', 
                        flags: 64 
                    });
                }

                const yeniSatirlar = stokSatirlari.filter(satir => satir.trim() !== stokDegeri.trim());
                silinenSayisi = stokSatirlari.length - yeniSatirlar.length;
                yeniStoklar = yeniSatirlar.join('\n');

                if (silinenSayisi === 0) {
                    return await interaction.reply({ 
                        content: `❌ \`${stokDegeri}\` stoku bulunamadı!`, 
                        flags: 64 
                    });
                }
            }

            // Dosyayı güncelle
            fs.writeFileSync(stokDosyaYolu, yeniStoklar);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🗑️ Stok Silme İşlemi')
                .setDescription(`**${urun.ad}** ürününden stok silindi!`)
                .addFields(
                    { 
                        name: '🏷️ Ürün Kodu', 
                        value: `**${urunKodu}**`, 
                        inline: true 
                    },
                    { 
                        name: '🗑️ Silinen Stok', 
                        value: `**${silinenSayisi}** adet`, 
                        inline: true 
                    },
                    { 
                        name: '📦 Kalan Stok', 
                        value: `**${yeniStoklar.split('\n').filter(s => s.trim()).length}** adet`, 
                        inline: true 
                    }
                )
                .setFooter({ text: config.embedFooter })
                .setTimestamp();

            if (silmeTuru === 'belirli') {
                embed.addFields({
                    name: '🎯 Silinen Stok',
                    value: `\`${stokDegeri}\``
                });
            }

            await interaction.reply({ 
                embeds: [embed], 
                flags: 64 
            });

        } catch (error) {
            console.error('Stok silme hatası:', error);
            await interaction.reply({ 
                content: '❌ Stok silinirken bir hata oluştu!', 
                flags: 64 
            });
        }
    }
};
