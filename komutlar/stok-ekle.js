const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stok-ekle')
        .setDescription('Ürün stok dosyası ekler')
        .addStringOption(option =>
            option.setName('ürün-kodu')
                .setDescription('Stok eklenecek ürünün kodu')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('stok-dosyası')
                .setDescription('Stok dosyası (txt formatında)')
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
        const attachment = interaction.options.getAttachment('stok-dosyası');

        // Dosya formatı kontrolü
        if (!attachment.name.endsWith('.txt')) {
            return await interaction.reply({ 
                content: '❌ Sadece .txt dosyaları kabul edilir!', 
                flags: 64 
            });
        }

        // Dosya boyutu kontrolü (8MB limit)
        if (attachment.size > 8 * 1024 * 1024) {
            return await interaction.reply({ 
                content: '❌ Dosya boyutu çok büyük! Maksimum 8MB olmalı.', 
                flags: 64 
            });
        }

        // Ürün kontrolü
        const urun = db.get(`urunler.${urunKodu}`);
        if (!urun) {
            return await interaction.reply({ 
                content: '❌ Bu ürün kodu bulunamadı!', 
                flags: 64 
            });
        }

        try {
            // Dosyayı indir
            console.log('Dosya indiriliyor:', attachment.url);
            const response = await fetch(attachment.url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const dosyaIcerigi = await response.text();
            console.log('Dosya içeriği alındı, uzunluk:', dosyaIcerigi.length);

            // Stok klasörünü oluştur
            const stokKlasoru = path.join(__dirname, '..', 'stok');
            if (!fs.existsSync(stokKlasoru)) {
                fs.mkdirSync(stokKlasoru, { recursive: true });
                console.log('Stok klasörü oluşturuldu:', stokKlasoru);
            }

            // Stok dosyası yolu
            const stokDosyaYolu = path.join(stokKlasoru, `${urunKodu}.txt`);

            // Mevcut stokları oku (varsa)
            let mevcutStoklar = '';
            if (fs.existsSync(stokDosyaYolu)) {
                mevcutStoklar = fs.readFileSync(stokDosyaYolu, 'utf8');
                if (mevcutStoklar && !mevcutStoklar.endsWith('\n')) {
                    mevcutStoklar += '\n';
                }
                console.log('Mevcut stoklar okundu');
            }

            // Yeni stokları ekle
            const yeniStoklar = mevcutStoklar + dosyaIcerigi;

            // Dosyaya kaydet
            fs.writeFileSync(stokDosyaYolu, yeniStoklar);
            console.log('Dosya kaydedildi:', stokDosyaYolu);

            // Stok sayısını hesapla
            const stokSatirlari = yeniStoklar.trim().split('\n').filter(satir => satir.trim());
            const stokSayisi = stokSatirlari.length;

            await interaction.reply({ 
                content: `✅ **${urun.ad}** ürününe **${stokSayisi}** adet stok eklendi!\n📁 Dosya: \`${urunKodu}.txt\``, 
                flags: 64 
            });

        } catch (error) {
            console.error('Stok ekleme hatası:', error);
            await interaction.reply({ 
                content: `❌ Stok eklenirken bir hata oluştu!\nHata: ${error.message}`, 
                flags: 64 
            });
        }
    }
};
