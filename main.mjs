import { Client, Collection, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import { Logger } from 'tslog'
import fs from 'fs'
import functions from './functions.mjs'
import data from './data.mjs'

const logger = new Logger({ hideLogPositionForProduction: true })
logger.info('loaded modules')
config()
const client = new Client({ intents: Object.values(GatewayIntentBits) })

const eventCommands = new Collection()
const eventFiles = fs.readdirSync('./event').filter(eventFileName => eventFileName.endsWith('.mjs'))
eventFiles.forEach(eventFileName => {
  import(`./event/${eventFileName}`)
    .then(eventCommand => {
      eventCommands.set(eventCommand.default.name, eventCommand.default)
      logger.info(`loaded ${eventFileName}`)
    })
    .catch(error => {
      logger.error(`cannot load ${eventFileName}`)
      console.error(error)
    })
})

const commands = new Collection()
const commandFiles = fs.readdirSync('./command').filter(commandFileName => commandFileName.endsWith('.mjs'))
const registCommands = []
commandFiles.forEach(commandFileName => {
  import(`./command/${commandFileName}`)
    .then(command => {
      commands.set(command.default.name, command.default)
      registCommands.push(command.default.data.toJSON())
      logger.info(`loaded ${commandFileName}`)
    })
    .catch(error => {
      logger.error(`cannot load ${commandFileName}`)
      console.error(error)
    })
})

client.once(Events.ClientReady, async (client) => {
  const command = eventCommands.get(Events.ClientReady)
  command.execute(client, registCommands)
    .catch(error => {
      logger.error('ClientReady Error')
      console.error(error)
    })
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  const embed = [
    new EmbedBuilder()
      .setTitle(interaction.command.name)
      .setAuthor({
        name: `${interaction.user.displayName} | ${interaction.user.id}`,
        iconURL: functions.avatarToURL(interaction.user)
      })
      .setColor(interaction.member?.roles?.color?.color || data.mutaoColor)
      .setFooter({
        text: interaction.guild ? `${interaction.guild.name} | ${interaction.guild.id}` : 'DM',
        iconURL: interaction.inGuild() ? interaction.guild.iconURL({ size: 4096 }) : null
      })
  ]

  const guild = await interaction.client.guilds.fetch('1074670271312711740')
  const channel = await guild.channels.fetch('1180762852357845002')

  channel.send({ embeds: embed })

  const command = commands.get(interaction.command.name)
  if (!command) return interaction.reply({ content: `${interaction.command.name}は未実装です。`, ephemeral: true })

  command.execute(interaction)
    .catch(error => {
      logger.error(`InteractionCreate (${interaction.command.name}) Error`)
      console.error(error)
      interaction.user.send(`エラーが発生しました。\n${error}`).catch(_error => {})
    })
})

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log('logged in Discord'))
  .catch(error => console.error(error))
