const { Client, Collection, IntentsBitField, REST, Routes } = require('discord.js');
const { connect, default: mongoose } = require('mongoose');
const config = require('../../config.js');
const { join } = require('path');
const glob = require('glob');
require('advanced-logs');

module.exports = class Bot extends Client {
    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildModeration,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.Guilds,
            ]
        });

        this.commands = new Collection();
        this.config = config;
    };

    async init() {
        this.start();
        this.connectDb();
        this.loadCommands();
        this.loadEvents();

        this.once('ready', () => {
            this.postCommands();
        });
    };

    async start() {
        this.login(this.config.client.token)
            .then(() => {
                console.success(`${this.user.tag} başarılı bir şekilde bağlandı.`);
            }).catch((err) => {
                console.error(`${this.user.tag} bağlanamadı. Hata: ${err}`);
            });

        return this;
    };

    async connectDb() {
        mongoose.set('strictQuery', true);
        connect(this.config.database.uri)
            .then(() => {
                console.success('Veritabanı bağlantısı başarılı.');
            }).catch((err) => {
                console.error('Veritabanı bağlantısı başarısız. Hata: ${err}');
            });

        return this;
    };

    async loadCommands() {
        glob('**/*.js', { cwd: join(__dirname, '../commands') }, async (err, files) => {
            if (err) return console.error(err);
            if (files.length === 0) return console.warn('Komutlar bulunamadı, bu kısım es geçiliyor.');

            files.forEach(async (file, i) => {
                const Command = require(`../commands/${file}`);
                console.info(`${Command.name} isimli komut başarıyla yüklendi.`)
                this.commands.set(Command.name, Command);
            });
        });

        return this;
    };

    async loadEvents() {
        glob('**/*.js', { cwd: join(__dirname, '../events') }, async (err, files) => {
            if (err) return console.error(err);
            if (files.length === 0) return console.warn('Eventler bulunamadı, bu kısım es geçiliyor.');

            files.forEach(async (file, i) => {
                const Event = await require(`../events/${file}`);
                console.info(`${Event.name} isimli event başarıyla yüklendi.`)
                this.on(Event.name, Event.run.bind(null, this));
            });
        });

        return this;
    };

    async postCommands() {
        let rest = new REST({ version: '10' }).setToken(this.config.client.token);

        await rest.put(Routes.applicationCommands(this.config.client.id), {
            body: this.commands.toJSON()
        }).catch(err => {
            console.error(err);
            process.exit(1);
        }).then(() => {
            console.info(`${this.commands.size} komut postlandı.`);
        });
    };
};