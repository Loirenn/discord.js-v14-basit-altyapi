const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ping',
    description: `Gecikme değerlerini öğrenin.`,
    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('BLUE')
                    .setTitle('Pong!')
                    .setDescription(`${client.ws.ping}ms`)
                    .setTimestamp()
            ]
        })
    }
};