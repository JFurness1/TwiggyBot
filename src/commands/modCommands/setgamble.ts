import { Discord, Permission, SimpleCommand, SimpleCommandMessage, SimpleCommandOption } from 'discordx'
import { Prisma } from '../../../prisma/generated/prisma-client-js'
import { injectable } from 'tsyringe'
import { ORM } from '../../persistence'
import { SuperUsers } from '../../guards/RoleChecks'

@Discord()
@injectable()
class SetGamble {
  public constructor(private client: ORM) {}

  @SimpleCommand('gamblechance')
  @Permission(false)
  @Permission(SuperUsers)
  async simpleGambleChance(
    @SimpleCommandOption('gamblechance')
    gambleChance: number,
    command: SimpleCommandMessage
  ) {
    const guildId = command.message.guildId ?? '-1'
    if (!isNaN(gambleChance) && gambleChance >= 0) {
      const newChance = new Prisma.Decimal(gambleChance).toDecimalPlaces(2)
      await this.client.guildOptions
        .update({
          where: { guildId: guildId },
          data: { gambleChance: newChance },
        })
        .then((_) => command.message.channel.send(`Gamble chance is now ${newChance}`))
    } else {
      const guildOptions = await this.client.guildOptions.upsert({
        where: { guildId: guildId },
        create: { guildId: guildId },
        update: {},
      })
      command.message.channel.send(`Current gamble chance is: ${guildOptions.gambleChance.toDecimalPlaces(2)}`)
    }
  }
}
