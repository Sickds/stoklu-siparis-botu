const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ürün-göster')
        .setDescription('Ürün bilgilerini gösterir')
        .addStringOption(option =>
            option.setName('ürünkodu')
                .setDescription('Gösterilecek ürünün kodu')
                .setRequired(true)),

    async execute(interaction) {
        if (interaction.user.id !== config.ownerID) {
            return await interaction.reply({ 
                content: '❌ Bu komutu sadece bot sahibi kullanabilir!', 
                flags: 64 
            });
        }

        const urunKodu = interaction.options.getString('ürünkodu');

        const urun = db.get(`urunler.${urunKodu}`);

        if (!urun) {
            return await interaction.reply({ 
                content: '❌ Bu ürün kodu bulunamadı!', 
                flags: 64 
            });
        }

        const guild = interaction.guild;
        const guildIcon = guild.iconURL({ dynamic: true, size: 64 }) || 'https://via.placeholder.com/64/00ff00/ffffff?text=Server';
        const guildName = guild.name;

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setAuthor({
                name: guildName,
                iconURL: guildIcon
            })
            .setTitle('Oxy Services')
            .setDescription(urun.aciklama)
            .addFields(
                { 
                    name: '💰 Fiyat', 
                    value: `**${urun.fiyat}₺**`, 
                    inline: true 
                },
                { 
                    name: '🏷️ Ürün Kodu', 
                    value: `**${urun.kod}**`, 
                    inline: true 
                },
                { 
                    name: '📅 Eklenme Tarihi', 
                    value: `**${urun.eklenmeTarihi}**`, 
                    inline: true 
                }
            )
            .setImage(urun.gorsel)
            .setFooter({ 
                text: 'www.oxyinc.xyz' 
            })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setURL('https://discord.com/channels/1409942996941541419/1409952232660799579')
                    .setLabel('Sipariş Ver')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('📋')
            );

        await interaction.channel.send({
            embeds: [embed],
            components: [buttons]
        });

        await interaction.reply({ 
            content: '✅ Ürün başarıyla gösterildi!', 
            flags: 64 
        });
    }
};
