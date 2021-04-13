const Discord = require('discord.js');

const bot = new Discord.Client();


const mongoose = require('mongoose');
mongoose.connect('', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false 
}).then(console.log('Connected to mongo!'))



const { token } = require('./config.json');

const { readdirSync, read } = require('fs');
const ms = require('ms');

const { join } = require('path');


const config = require('./config.json');
bot.config = config;


bot.commands = new Discord.Collection();
const commandFolders = readdirSync('./commands');
const Timeout = new Discord.Collection();


const prefix = '.';
//this prefix can be what ever you want ;)


bot.on('ready', () => {
    console.log("Ready!")
})

//------------------------------------------------------------------------------
for (const folder of commandFolders) {
    const commandFiles = readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        bot.commands.set(command.name, command);
    }
}


bot.on("error", console.error);


//------------------------------------------------------------------------------
bot.on("message", async (message) => {

    if(message.author.bot) return;
    if(message.channel.type === 'dm') return; //optional#


    if(message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);

        const commandName = args.shift().toLowerCase();

        const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if(!command) return;

        if (command) {
            if(command.cooldown) {
                if(Timeout.has(`${command.name}${message.author.id}`)) return message.channel.send(`Please Wait \`${ms(Timeout.get(`${command.name}${message.author.id}`) - Date.now(), {long: true})}\` Before using this command again!`);
                command.run(bot, message, args)
                Timeout.set(`${command.name}${message.author.id}`, Date.now() + command.cooldown)
                setTimeout(() => {
                    Timeout.delete(`${command.name}${message.author.id}`)
                }, command.cooldown)
            } else command.run(bot, message, args);
        }
    }
})


//--------------------------------------------------------------------------------------------------------------------\\
const WelcomeSchema = require('./Schema/welcome-schema');

bot.on("guildMemberAdd", async (member, guild) => {
    WelcomeSchema.findOne({ guildId: member.guild.id }, async (err, data) => {
        if(!data) return;

        const user = member.user;
        const channel = member.guild.channels.cache.get(data.channelId);

        channel.send(`Welcome ${user}!`)
    })
})



//--------------------------------------------------------------------------------------------------------------------\\
bot.on("guildMemberAdd", async (member) => {
    console.log(member.user.tag); 
})

bot.login(token);