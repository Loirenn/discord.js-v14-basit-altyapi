module.exports = {
    name: 'interactionCreate',
    run: async (client, interaction) => {
        try {
            if (!interaction.isCommand()) return;
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            await command.run(client, interaction);
        } catch (err) {
            console.error(err);
        };
    }
};