const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ürün-teslim')
        .setDescription('Ürün teslim eder')
        .addStringOption(option =>
            option.setName('ürün-kodu')
                .setDescription('Teslim edilecek ürünün kodu')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('teslim-yöntemi')
                .setDescription('Teslim yöntemi')
                .addChoices(
                    { name: 'DM', value: 'dm' },
                    { name: 'Kanal', value: 'kanal' }
                )
                .setRequired(true))
        .addUserOption(option =>
            option.setName('kullanıcı')
                .setDescription('Teslim edilecek kullanıcı')
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
        const teslimYontemi = interaction.options.getString('teslim-yöntemi');
        const kullanici = interaction.options.getUser('kullanıcı');

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
                content: '❌ Bu ürün için stok bulunamadı!', 
                flags: 64 
            });
        }

        try {
            // Stok dosyasını oku
            const stokIcerigi = fs.readFileSync(stokDosyaYolu, 'utf8');
            const stokSatirlari = stokIcerigi.trim().split('\n').filter(satir => satir.trim());

            if (stokSatirlari.length === 0) {
                return await interaction.reply({ 
                    content: '❌ Bu ürün için stok kalmadı!', 
                    flags: 64 
                });
            }

            // İlk stoku al
            const teslimEdilecekStok = stokSatirlari[0];
            const kalanStoklar = stokSatirlari.slice(1).join('\n');

            // Dosyayı güncelle
            fs.writeFileSync(stokDosyaYolu, kalanStoklar);

            // Teslim embed'i oluştur
            const teslimEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('📦 Ürün Teslim Edildi!')
                .setDescription(`**${urun.ad}** ürününüz teslim edildi!`)
                .addFields(
                    { 
                        name: '🏷️ Ürün Kodu', 
                        value: `**${urun.kod}**`, 
                        inline: true 
                    },
                    { 
                        name: '💰 Fiyat', 
                        value: `**${urun.fiyat}₺**`, 
                        inline: true 
                    },
                    { 
                        name: '📅 Teslim Tarihi', 
                        value: `**${new Date().toLocaleDateString('tr-TR')}**`, 
                        inline: true 
                    },
                    { 
                        name: '🔑 Stok Bilgisi', 
                        value: `\`${teslimEdilecekStok}\``
                    }
                )
                .setImage(urun.gorsel)
                .setFooter({ text: 'www.oxyinc.xyz' })
                .setTimestamp();

            // Önce interaction'ı yanıtla
            await interaction.reply({ 
                content: `🔄 **${urun.ad}** ürünü teslim ediliyor...`, 
                flags: 64 
            });

            // Teslim yöntemine göre gönder
            if (teslimYontemi === 'dm') {
                try {
                    await kullanici.send({ embeds: [teslimEmbed] });
                    await interaction.editReply({ 
                        content: `✅ **${urun.ad}** ürünü **${kullanici.tag}** kullanıcısına DM ile teslim edildi!` 
                    });
                } catch (error) {
                    await interaction.editReply({ 
                        content: `❌ DM gönderilemedi! Kullanıcının DM'leri kapalı olabilir.` 
                    });
                    return;
                }
            } else {
                await interaction.channel.send({ 
                    content: `${kullanici} ürününüz teslim edildi!`,
                    embeds: [teslimEmbed] 
                });
                await interaction.editReply({ 
                    content: `✅ **${urun.ad}** ürünü **${kullanici.tag}** kullanıcısına kanalda teslim edildi!` 
                });
            }

            // Stok uyarısı kontrolü (asenkron olarak çalıştır)
            const kalanStokSayisi = kalanStoklar.split('\n').filter(s => s.trim()).length;
            
            if (kalanStokSayisi < 10 && config.logChannelID !== 'BURAYA_LOG_KANAL_ID_YAZIN') {
                // Stok uyarısını arka planda gönder
                setTimeout(async () => {
                    try {
                        const logChannel = interaction.client.channels.cache.get(config.logChannelID);
                        if (logChannel) {
                            const uyariEmbed = new EmbedBuilder()
                                .setColor('#ff9900')
                                .setTitle('⚠️ Stok Uyarısı!')
                                .setDescription(`**${urun.ad}** ürününün stoku azalıyor!`)
                                .addFields(
                                    { 
                                        name: '🏷️ Ürün Kodu', 
                                        value: `**${urun.kod}**`, 
                                        inline: true 
                                    },
                                    { 
                                        name: '📦 Kalan Stok', 
                                        value: `**${kalanStokSayisi}** adet`, 
                                        inline: true 
                                    },
                                    { 
                                        name: '🚨 Durum', 
                                        value: '**Stok yenilenmeli!**', 
                                        inline: true 
                                    }
                                )
                                .setFooter({ text: config.embedFooter })
                                .setTimestamp();

                            const rolMention = config.stockAlertRoleID !== 'BURAYA_STOK_UYARI_ROL_ID_YAZIN' 
                                ? `<@&${config.stockAlertRoleID}>` 
                                : '';

                            await logChannel.send({ 
                                content: `${rolMention} Stok uyarısı!`,
                                embeds: [uyariEmbed] 
                            });
                        }
                    } catch (error) {
                        console.error('Stok uyarısı gönderilemedi:', error);
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('Ürün teslim hatası:', error);
            await interaction.reply({ 
                content: '❌ Ürün teslim edilirken bir hata oluştu!', 
                flags: 64 
            });
        }
    }
};
