const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stok-liste')
        .setDescription('Tüm stok dosyalarını listeler'),

    async execute(interaction) {
        // Owner kontrolü
        if (interaction.user.id !== config.ownerID) {
            return await interaction.reply({ 
                content: '❌ Bu komutu sadece bot sahibi kullanabilir!', 
                flags: 64 
            });
        }

        const stokKlasoru = path.join(__dirname, '..', 'stok');
        
        if (!fs.existsSync(stokKlasoru)) {
            return await interaction.reply({ 
                content: '❌ Henüz hiç stok dosyası oluşturulmamış!', 
                flags: 64 
            });
        }

        const dosyalar = fs.readdirSync(stokKlasoru).filter(dosya => dosya.endsWith('.txt'));
        
        if (dosyalar.length === 0) {
            return await interaction.reply({ 
                content: '❌ Henüz hiç stok dosyası oluşturulmamış!', 
                flags: 64 
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('📦 Stok Dosyaları Listesi')
            .setDescription('Mevcut tüm stok dosyaları:')
            .setFooter({ text: config.embedFooter })
            .setTimestamp();

        let stokListesi = '';
        let toplamStok = 0;

        for (const dosya of dosyalar) {
            const urunKodu = dosya.replace('.txt', '');
            const urun = db.get(`urunler.${urunKodu}`);
            const dosyaYolu = path.join(stokKlasoru, dosya);
            
            try {
                const stokIcerigi = fs.readFileSync(dosyaYolu, 'utf8');
                const stokSatirlari = stokIcerigi.trim().split('\n').filter(satir => satir.trim());
                const stokSayisi = stokSatirlari.length;
                toplamStok += stokSayisi;
                
                const urunAdi = urun ? urun.ad : 'Bilinmeyen Ürün';
                stokListesi += `**${dosya}** - ${urunAdi} - **${stokSayisi}** adet\n`;
            } catch (error) {
                stokListesi += `**${dosya}** - Hata okuma - **0** adet\n`;
            }
        }

        embed.addFields(
            { 
                name: '📊 Toplam Dosya', 
                value: `**${dosyalar.length}** dosya`, 
                inline: true 
            },
            { 
                name: '📦 Toplam Stok', 
                value: `**${toplamStok}** adet`, 
                inline: true 
            },
            { 
                name: '📋 Dosya Listesi', 
                value: stokListesi || 'Dosya bulunamadı'
            }
        );

        await interaction.reply({ 
            embeds: [embed], 
            flags: 64 
        });
    }
};
