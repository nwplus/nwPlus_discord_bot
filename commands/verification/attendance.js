// Discord.js commando requirements
const PermissionCommand = require('../../classes/permission-command');
const firebaseServices = require('../../firebase-services/firebase-services');
const Discord = require('discord.js');
const discordServices = require('../../discord-services');
const StartAttend = require('../a_start_commands/start-attend');

// Command export
module.exports = class Attendace extends PermissionCommand {
    constructor(client) {
        super(client, {
            name: 'attend',
            group: 'verification',
            memberName: 'hacker attendance',
            description: 'Will mark a hacker as attending and upgrade role to Attendee. Can only be called once!',
            guildOnly: true,
            args: [
                {
                    key: 'email',
                    prompt: 'Please provide your email address',
                    type: 'string',
                    default: '',
                },
                
            ],
        },
        {
            roleID: discordServices.hackerRole,
            roleMessage: 'Hi there, it seems you are already marked as attendee, or you do not need to be marked as attendee. Happy hacking!',
        });
    }

    /**
     * 
     * @param {Discord.Message} message 
     * @param {String} param1 
     */
    async runCommand(message, { email }) {
       // regex to validate email
       const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

       // let user know he has used the command incorrectly and exit
       if (email === '' || re.test(email.toLowerCase())) {
           discordServices.sendMessageToMember(message.author, 'You have used the verify command incorrectly! \nPlease write a valid email after the command like this: !verify email@gmail.com');
           return;
       }
        
        // call the firebase services attendhacker function
        var status = await firebaseServices.attendHacker(email);

        // embed to use
        const embed = new Discord.MessageEmbed()
            .setColor(discordServices.specialDMEmbedColor)
            .setTitle('Attendance Process');

        // Check the returned status and act accordingly!
        switch(status) {
            case firebaseServices.status.HACKER_SUCCESS:
                embed.addField('Thank you for attending nwHacks 2021', 'Happy hacking!!!');
                discordServices.addRoleToMember(message.member, discordServices.attendeeRole);
                discordServices.discordLog(message.guild, "ATTEND SUCCESS : <@" + message.author.id + "> with email: " + email + " is attending nwHacks 2021!");
                break;
            case firebaseServices.status.HACKER_IN_USE:
                embed.addField('Hi there, this email is already marked as attending', 'Have a great day!')
                break;
            case firebaseServices.status.FAILURE:
                embed.addField('ERROR 401', 'Hi there, the email you tried to attend with is not' +
                    ' in our system, please make sure your email is well typed. If you think this is an error' +
                    ' please contact us in the support channel.')
                    .setColor('#fc1403');
                discordServices.discordLog(message.guild, "ATTEND ERROR : <@" + message.author.id + "> with email: " + email + " tried to attend but I did not find his email!");
                break;
        }
        discordServices.sendMessageToMember(message.member, embed);
    }

};