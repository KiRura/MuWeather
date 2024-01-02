/* eslint-disable no-unused-vars */
import { Logger } from 'tslog'
import { ActivityType, Client, EmbedBuilder, Events } from 'discord.js'
import functions from '../functions.mjs'
import data from '../data.mjs'
const logger = new Logger({ hideLogPositionForProduction: true })

export default {
  name: Events.ClientReady,
  /**
   * @param {Client<true>} client
   * @param {[]} registCommands
   */
  async execute (client, registCommands) {
    setInterval(async () => {
      client.user.setActivity({ name: `${(await client.guilds.fetch()).size} servers・${client.users.cache.size} users・${await functions.googlePing()} ms`, type: ActivityType.Custom })
    }, 30000)

    logger.info('setting commands...')
    await client.application.commands.set(registCommands)

    // await (await (await client.guilds.fetch('1099309562781245440')).channels.fetch('1146562994688503999')).send({
    //   embeds: [
    //     new EmbedBuilder()
    //       .setTitle(`${client.user.displayName}が起動しました。`)
    //       .setFooter({ text: functions.dateToString(new Date(), true) })
    //       .setColor(data.mutaoColor)
    //   ]
    // })

    logger.info(`${client.user.displayName} ALL READY`)
  }
}
