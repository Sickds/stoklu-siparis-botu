const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun ping değerini gösterir'),
    
    async execute(interaction) {
        if (interaction.user.id !== config.ownerID) {
            return await interaction.reply({ 
                content: '❌ Bu komutu sadece bot sahibi kullanabilir!', 
                flags: 64 
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏓 Pong!')
            .setDescription(`Bot gecikmesi: **${interaction.client.ws.ping}ms**`)
            .setFooter({ text: config.embedFooter })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
