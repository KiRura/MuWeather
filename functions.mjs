/* eslint-disable no-unused-vars */
import { Client, GuildMember, User, ChatInputCommandInteraction, EmbedBuilder, ChannelType } from 'discord.js'
import ping from 'ping'
import fs from 'fs'
// import { GuildQueue } from 'discord-player'
import data from './data.mjs'
// import { joinVoiceChannel } from 'discord-voip'

export default {
  async googlePing () {
    return (await ping.promise.probe('8.8.8.8')).time
  },
  /**
   * @param {Client} client
   * @returns
   */
  async fetchAdmin (client) {
    return await client.users.fetch('606093171151208448')
  },
  /**
   * @param {User} user
   */
  avatarToURL (user) {
    return user.avatarURL({ size: 4096 }) || `${user.defaultAvatarURL}?size=4096`
  },
  /**
   * @param {string} filePass
   */
  writeFile (filePass, json) {
    fs.writeFileSync(filePass, Buffer.from(JSON.stringify(json)))
  },
  /**
   * @param {Date} date
   * @param {string} lang
   */
  dateToString (date, time) {
    if (time) {
      const day = ['日', '月', '火', '水', '木', '金', '土']
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${day[date.getDay()]}) ${date.getHours()}時${date.getMinutes()}分${date.getSeconds()}秒`
    } else {
      const day = ['日', '月', '火', '水', '木', '金', '土']
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${day[date.getDay()]})`
    }
  },
  /**
   *
   * @param {GuildMember} member
   * @param {bigint} permission
   * @param {string} permissionName
   * @param {ChatInputCommandInteraction} interaction
   */
  hasThisMemberPermission (member, permission, permissionName, interaction) {
    if (!member.permissions.has(permission)) {
      const content = `あなたの権限に ${permissionName} がありません。`
      if (interaction.replied) {
        interaction.editReply(content)
      } else if (interaction.deferred) {
        interaction.followUp(content)
      } else {
        interaction.reply(content)
      }
      return false
    }
    return true
  },
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  isGuild (interaction) {
    if (!interaction.inGuild()) {
      interaction.reply({ content: 'サーバー内でのみ実行できます。', ephemeral: true })
      return false
    }
    return true
  },
  /**
   * @param {GuildQueue} queue
   * @param {ChatInputCommandInteraction} interaction
   */
  // isCorrectQueue (queue, interaction) {
  //   if (!queue && interaction.guild.members.me.voice.channel) {
  //     joinVoiceChannel({
  //       channelId: interaction.guild.members.me.voice.channel.id,
  //       guildId: interaction.guild.id,
  //       selfDeaf: true,
  //       adapterCreator: interaction.guild.voiceAdapterCreator
  //     }).destroy()
  //     interaction.reply({
  //       embeds: [new EmbedBuilder()
  //         .setTitle('以下の理由によりキューが存在しません。')
  //         .setDescription('- 再生中に再起動した\n- 何かしらのバグでキューが消えた\n自動的に切断しました。')
  //         .setColor(data.redColor)
  //       ]
  //     })
  //     return false
  //   } else if (!queue && !interaction.guild.members.me.voice.channel) {
  //     interaction.reply({
  //       embeds: [new EmbedBuilder()
  //         .setTitle('キューも無いしVCにも接続されてないよ！')
  //         .setColor(data.redColor)
  //       ],
  //       ephemeral: true
  //     })
  //     return false
  //   } else {
  //     return true
  //   }
  // },
  /**
   * @param {boolean} boolean
   * @param {ChatInputCommandInteraction} interaction
   */
  isAtaokaNumber (boolean, interaction) {
    if (boolean) {
      interaction.reply({
        embeds: [new EmbedBuilder()
          .setTitle('あたおかナンバー')
          .setDescription('指定された数値が異常です')
          .setColor(data.redColor)
        ],
        ephemeral: true
      })
      return true
    } else {
      return false
    }
  },
  /**
   * @param {number} sec
   * @returns
   */
  wait (sec) {
    return new Promise((resolve) => {
      setTimeout(resolve, sec * 1000)
    })
  },
  /**
   * @param {number} length
   * @returns
   */
  times (length) {
    const hours = ('00' + Math.floor(length / 3600)).slice(-2)
    const minutes = ('00' + Math.floor((length % 3600) / 60)).slice(-2)
    const seconds = ('00' + Math.floor((length % 3600) % 60)).slice(-2)
    if (hours !== '00') {
      return `${hours}:${minutes}:${seconds}`
    } else if (minutes !== '00') {
      return `${minutes}:${seconds}`
    } else {
      return `00:${seconds}`
    }
  },
  /**
   * @param {string} webhookName
   */
  isThread (channel) {
    if (channel.type === ChannelType.PublicThread || channel.type === ChannelType.PrivateThread || channel.type === ChannelType.AnnouncementThread) {
      return true
    } else {
      return false
    }
  },
  async findWebhooks (webhookName, channel) {
    if (this.isThread(channel)) {
      channel = channel.parent
    }
    const webhooks = await channel.fetchWebhooks()
    let webhook = webhooks.find(webhook => webhook.name === webhookName)
    if (!webhook) webhook = await channel.createWebhook(webhookName, channel.id)
    return webhook
  },
  shorterNumbers (number) {
    return new Intl.NumberFormat('ja-JP', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(number)
  }
}
