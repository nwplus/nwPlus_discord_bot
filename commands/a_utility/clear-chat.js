// Discord.js commando requirements
const CustomCommand = require('../../classes/custom-command');
const discordServices = require('../../discord-services');
const Discord = require('discord.js');

// Command export
module.exports = class ClearChat extends CustomCommand {
    constructor(client) {
        super(client, {
            name: 'clearchat',
            group: 'a_utility',
            memberName: 'clear chat utility',
            description: 'Will clear up to 100 newest messages from the channel. Messages older than two weeks will not be deleted. Then will send message with available commands in the channel, if any.',
            guildOnly: true,
            args: [
                {
                    key: 'keepPinned',
                    prompt: 'if pinned messages should be kept',
                    type: 'boolean',
                    default: false,
                },
                {
                    key: 'isCommands',
                    prompt: 'should show commands in this channel?',
                    type: 'boolean',
                    default: false,
                },
            ],
        },
        {
            roleID: discordServices.adminRole,
            roleMessage: 'Hey there, the command !clearchat is only available to Admins!',
        });
    }

    async runCommand (message, {keepPinned, isCommands}) {

        if (keepPinned) {
            // other option is to get all channel messages, filter of the pined channels and pass those to bulkDelete, might be to costy?
            var messagesToDelete = await message.channel.messages.cache.filter(msg => !msg.pinned);
            await message.channel.bulkDelete(messagesToDelete, true).catch(console.error);
        } else {
            // delete messages and log to console
            await message.channel.bulkDelete(100, true).catch(console.error);
        }

        discordServices.discordLog(message.guild, "Cleared the channel: " + message.channel.name + ". By user: " + message.author.username);
        
        var commands = [];

        // only proceed if we want the commands
        if (isCommands) {
            // if in the verify channel <welcome>
            if (message.channel.id === discordServices.welcomeChannel) {
                commands = this.client.registry.findCommands('verify');
            } 
            // if in the attend channel
            else if (message.channel.id === discordServices.attendChannel) {
                commands = this.client.registry.findCommands('attend');
            } 
            // admin console
            else if (discordServices.isAdminConsole(message.channel) === true) {
                // grab all the admin command groups
                var commandGroups = this.client.registry.findGroups('a_');
                // add all the commands from the command groups
                commandGroups.forEach((value,index) => {
                    value['commands'].array().forEach((value, index) => {
                        commands.push(value);
                    })
                });
            }
            // create channel
            else if (message.channel.id === discordServices.channelcreationChannel) {
                commands = this.client.registry.findCommands('createchannel');
            }
            // any other channels will send the hacker commands
            else {
                commands = this.client.registry.findGroups('utility')[0].commands.array();
            }
            
            var length = commands.length;

            const textEmbed = new Discord.MessageEmbed()
                .setColor(discordServices.embedColor)
                .setTitle('Commands Available in this Channel')
                .setDescription('The following are all the available commands in this channel, for more information about a specific command please call !help <command_name>.')
                .setTimestamp();

            // add each command as a field to the embed
            for (var i = 0; i < length; i++) {
                var command = commands[i];
                if (command.format != null) {
                    textEmbed.addField(this.client.commandPrefix + command.name, command.description + ', arguments: ' + command.format);
                } else {
                    textEmbed.addField(this.client.commandPrefix + command.name, command.description + ', no arguments');
                }
            }

            message.channel.send(textEmbed);
        }
    }

}