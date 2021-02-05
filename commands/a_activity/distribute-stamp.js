const discordServices = require('../../discord-services');
const PermissionCommand = require('../../classes/permission-command');
const Activity = require('../../classes/activity');
const ActivityManager = require('../../classes/activity-manager');

module.exports = class DistributeStamp extends PermissionCommand {
    constructor(client) {
        super(client, {
            name: 'distribute-stamp',
            group: 'a_activity',
            memberName: 'gives stamps',
            description: 'gives a stamp to everyone who reacted within the time-frame, if targetChannelKey not give, it will send it to the message channel.',
            args: [
                {
                    key: 'timeLimit',
                    prompt: 'How many seconds will the reactions be open for',
                    type: 'integer',
                    default: discordServices.stampCollectTime,
                },
            ],
        },
        {
            roleID: discordServices.roleIDs.staffRole,
            roleMessage: 'Hey there, the command !contests is only available to Staff!',
        });
    }

    /**
     * Command code.
     * @param {Message} message 
     * @param {Activity} activity 
     */
    async runCommand(message, activity, {timeLimit}) {
        ActivityManager.distributeStamp(activity, timeLimit);
    }
};