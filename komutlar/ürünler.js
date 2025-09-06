const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../fonksiyonlar/database.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ürünler')
        .setDescription('Tüm ürünleri listeler'),

    async execute(interaction) {
        const tumUrunler = db.get('urunler') || {};
        const urunListesi = Object.entries(tumUrunler);

        if (urunListesi.length === 0) {
            return await interaction.reply({
                content: '❌ Henüz hiç ürün eklenmemiş!',
                flags: 64
            });
        }

        const urunlerSayfaBasina = 3;
        const toplamSayfa = Math.ceil(urunListesi.length / urunlerSayfaBasina);
        let mevcutSayfa = 0;

        const embed = await urunSayfasiOlustur(urunListesi, mevcutSayfa, urunlerSayfaBasina, toplamSayfa, interaction);

        const butonlar = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('onceki_sayfa')
                    .setLabel('◀️ Önceki')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(mevcutSayfa === 0),
                new ButtonBuilder()
                    .setCustomId('sonraki_sayfa')
                    .setLabel('Sonraki ▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(mevcutSayfa === toplamSayfa - 1),
                new ButtonBuilder()
                    .setURL('https://discord.com/channels/1409942996941541419/1409952232660799579')
                    .setLabel('Sipariş Ver')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('📋')
            );

        await interaction.reply({
            embeds: [embed],
            components: [butonlar],
            flags: 64
        });
        
        const mesaj = await interaction.fetchReply();

        const collector = mesaj.createMessageComponentCollector({
            time: 300000,
            filter: i => i.user.id === interaction.user.id
        });

        collector.on('collect', async (i) => {

            if (i.customId === 'onceki_sayfa') {
                mevcutSayfa = Math.max(0, mevcutSayfa - 1);
            } else if (i.customId === 'sonraki_sayfa') {
                mevcutSayfa = Math.min(toplamSayfa - 1, mevcutSayfa + 1);
            }

            const yeniEmbed = await urunSayfasiOlustur(urunListesi, mevcutSayfa, urunlerSayfaBasina, toplamSayfa, interaction);

            const yeniButonlar = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('onceki_sayfa')
                        .setLabel('◀️ Önceki')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(mevcutSayfa === 0),
                    new ButtonBuilder()
                        .setCustomId('sonraki_sayfa')
                        .setLabel('Sonraki ▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(mevcutSayfa === toplamSayfa - 1),
                    new ButtonBuilder()
                        .setURL('https://discord.com/channels/1409942996941541419/1409952232660799579')
                        .setLabel('Sipariş Ver')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('📋')
                );

            await i.update({
                embeds: [yeniEmbed],
                components: [yeniButonlar]
            });
        });

        collector.on('end', () => {
            const devreDisiButonlar = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('onceki_sayfa')
                        .setLabel('◀️ Önceki')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('sonraki_sayfa')
                        .setLabel('Sonraki ▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setURL('https://discord.com/channels/1409942996941541419/1409952232660799579')
                        .setLabel('Sipariş Ver')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('📋')
                );

            mesaj.edit({
                components: [devreDisiButonlar]
            }).catch(() => {});
        });
    }
};

async function urunSayfasiOlustur(urunListesi, sayfa, urunlerSayfaBasina, toplamSayfa, interaction) {
    const baslangic = sayfa * urunlerSayfaBasina;
    const bitis = Math.min(baslangic + urunlerSayfaBasina, urunListesi.length);
    const sayfaUrunleri = urunListesi.slice(baslangic, bitis);

    const renkler = [
        '#6366f1',
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#10b981',
        '#3b82f6'
    ];
    
    const renk = renkler[sayfa % renkler.length];

    const embed = new EmbedBuilder()
        .setColor(renk)
        .setTitle('✨ Premium Ürün Kataloğu ✨')
        .setDescription(`
╔══════════════════════════════╗
᲼᲼᲼᲼᲼᲼᲼᲼᲼📊 **Toplam Ürün:** \`${urunListesi.length}\` adet
᲼᲼᲼᲼᲼᲼᲼᲼᲼📄 **Sayfa:** \`${sayfa + 1}/${toplamSayfa}\`
╚══════════════════════════════╝
        `)
        .setFooter({ 
            text: `${interaction.guild.name} • Sayfa ${sayfa + 1}/${toplamSayfa}`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

    for (let i = 0; i < sayfaUrunleri.length; i++) {
        const [kod, urun] = sayfaUrunleri[i];
        
        const siraNo = (sayfa * urunlerSayfaBasina) + i + 1;
        
        const formatlanmisFiyat = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(urun.fiyat);

        let aciklama = urun.aciklama || 'Açıklama mevcut değil';
        if (aciklama.length > 80) {
            aciklama = aciklama.substring(0, 77) + '...';
        }
        
        embed.addFields({
            name: `${siraNo}. 🏷️ ${urun.ad}`,
            value: `
\`\`\`yaml
💰 Fiyat    : ${formatlanmisFiyat}
🔖 Kod      : ${kod}
📅 Tarih    : ${urun.eklenmeTarihi}
\`\`\`
📝 **Açıklama**
> ${aciklama}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `,
            inline: false
        });
    }

    return embed;
}