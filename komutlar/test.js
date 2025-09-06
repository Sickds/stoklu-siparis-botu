const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test komutu - flags: 64 özelliğini test eder'),

    async execute(interaction) {
        if (interaction.user.id !== config.ownerID) {
            return await interaction.reply({ 
                content: '❌ Bu komutu sadece bot sahibi kullanabilir!', 
                flags: 64 
            });
        }

        const testEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🧪 Test Komutu')
            .setDescription('Bu bir test komutudur!')
            .addFields(
                {
                    name: '✅ Başarılı',
                    value: 'Komut çalışıyor!',
                    inline: true
                },
                {
                    name: '🔒 Güvenli',
                    value: 'Sadece bot sahibi kullanabilir!',
                    inline: true
                },
                {
                    name: '📝 Açıklama',
                    value: 'Bu mesaj sadece senin tarafından görülebilir (flags: 64)'
                }
            )
            .setFooter({ 
                text: `${interaction.guild.name} • Test`,
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [testEmbed],
            flags: 64
        });
    }
};
