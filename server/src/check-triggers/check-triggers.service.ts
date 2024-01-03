import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MailingService } from '../mailing/mailing.service';
import { TimeService } from '../time/time.service';
import { selectRows } from '../db/db.selectData';
import { PokemonService } from '../pokemon/pokemon.service';
import { NbaService } from 'src/nba/nba.service';
import { ChuckService } from 'src/chuck/chuck.service';
import { CoingekoService } from 'src/coingeko/coingeko.service';
import { UpdateData } from 'src/db/db.updateData';
import { GithubService } from 'src/github/github.service';
@Injectable()
export class CheckTriggersService {
  triggers = [this.checkTime, this.checkGithubNotification];
  reactions = [
    this.launchEmail,
    this.launchRandomPokemon,
    this.launchRandomPokemonFromGen,
    this.launchRandomPotion,
    this.launchRandomNbaPlayer,
    this.launchRandomNbaTeam,
    this.launchRandomNbaGame,
    this.launchRandomToken,
    this.launchRandomChuckNorrisDevJoke,
    this.launchRandomChuckNorrisReligionJoke,
    this.launchRandomChuckNorrisPoliticalJoke,
  ];
  constructor(
    private readonly mailingService: MailingService,
    private readonly timeService: TimeService,
    private readonly pokemonService: PokemonService,
    private readonly nbaService: NbaService,
    private readonly chuckService: ChuckService,
    private readonly coingekoService: CoingekoService,
    private readonly githubService: GithubService,
  ) {}

  @Cron('0 */1 * * * *')
  async handleCron() {
    Logger.log('Called every 10 s');
    try {
      this.triggers.forEach(async function (trigger) {
        const ListTimeTrigger = await trigger.call(this);
        if (ListTimeTrigger.length !== 0) {
          this.reactions.forEach(async function (reaction) {
            await reaction.call(this, ListTimeTrigger);
          }, this);
        }
      }, this);
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in handleCron:', error);
    }
  }
  async checkGithubNotification(): Promise<number[]> {
    try {
      const ListGithubTrigger: number[] =
        await this.githubService.fetchNotifications();

      return ListGithubTrigger;
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in checkGithubNotification:', error);
    }
  }

  formatDateTime(dateTimeStr: string): string {
    const dateObj = new Date(dateTimeStr);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  }

  formatToHourMinute(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  async checkTime(): Promise<number[]> {
    try {
      const TimeData = await selectRows('get_city_time');
      const ListTimeTrigger: number[] = [];
      const currentTime = new Date();

      for (const user of TimeData) {
        if (user.diff === null) {
          const cityTimeStr = this.formatDateTime(
            (await this.timeService.getCurrentTimeByCity(user.city)).toString(),
          );
          const diffMilliseconds =
            new Date(cityTimeStr).getTime() - currentTime.getTime();
          const diffHours = diffMilliseconds / (1000 * 60 * 60);
          const diffHoursunit = Math.round(diffHours);
          await UpdateData(
            user.user_id,
            diffHoursunit,
            'get_city_time',
            'diff',
            user.area_id,
          );
          Logger.log('diff is null');
          continue;
        }

        // Adjust the current time with the user's time difference
        const adjustedTime = new Date(currentTime);
        Logger.log('adjustedTime is ' + this.formatToHourMinute(adjustedTime));
        Logger.log('diff is ' + user.diff);
        Logger.log('getHours is ' + adjustedTime.getHours());

        adjustedTime.setHours(adjustedTime.getHours() + Math.round(user.diff));
        Logger.log('adjustedTime is ' + this.formatToHourMinute(adjustedTime));
        Logger.log('user.time is ' + user.time);
        // Compare the adjusted time with user.time
        if (this.formatToHourMinute(adjustedTime) === user.time) {
          ListTimeTrigger.push(user.area_id);
        }
      }
      return ListTimeTrigger;
    } catch (error) {
      Logger.error('Error in checkTime:' + error);
      return [];
    }
  }

  async launchEmail(ListTimeTrigger: number[]) {
    try {
      const EmailData = await selectRows('send_email');

      for (const email of EmailData) {
        for (const area_id of ListTimeTrigger) {
          if (email.area_id > area_id && email.area_id < area_id + 1) {
            await this.mailingService.sendMail(email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchEmail:', error);
    }
  }

  async launchRandomPokemon(ListTimeTrigger: number[]) {
    try {
      const PokemonData = await selectRows('send_random_pokemon');

      for (const pokemon of PokemonData) {
        for (const area_id of ListTimeTrigger) {
          if (pokemon.area_id > area_id && pokemon.area_id < area_id + 1) {
            await this.pokemonService.sendRandomPokemon(pokemon.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomPokemon:', error);
    }
  }

  async launchRandomPokemonFromGen(ListTimeTrigger: number[]) {
    try {
      const PokemonData = await selectRows('send_random_gen_pokemon');

      for (const pokemon of PokemonData) {
        for (const area_id of ListTimeTrigger) {
          if (pokemon.area_id > area_id && pokemon.area_id < area_id + 1) {
            await this.pokemonService.sendRandomPokemonFromGen(
              pokemon.generation,
              pokemon.email,
            );
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomPokemonFromGen:', error);
    }
  }

  async launchRandomPotion(ListTimeTrigger: number[]) {
    try {
      const PotionData = await selectRows('send_random_item');

      for (const potion of PotionData) {
        for (const area_id of ListTimeTrigger) {
          if (potion.area_id > area_id && potion.area_id < area_id + 1) {
            await this.pokemonService.sendRandomItemData(potion.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomPotion:', error);
    }
  }

  async launchRandomNbaPlayer(ListTimeTrigger: number[]) {
    try {
      const NbaPlayerData = await selectRows('send_random_nba_player');

      for (const player of NbaPlayerData) {
        for (const area_id of ListTimeTrigger) {
          if (player.area_id > area_id && player.area_id < area_id + 1) {
            await this.nbaService.sendRandomNbaPlayer(player.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomNbaPlayer:', error);
    }
  }

  async launchRandomNbaTeam(ListTimeTrigger: number[]) {
    try {
      const NbaTeamData = await selectRows('send_random_nba_team');

      for (const team of NbaTeamData) {
        for (const area_id of ListTimeTrigger) {
          if (team.area_id > area_id && team.area_id < area_id + 1) {
            await this.nbaService.sendRandomNbaTeam(team.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomNbaTeam:', error);
    }
  }

  async launchRandomNbaGame(ListTimeTrigger: number[]) {
    try {
      const NbaGameData = await selectRows('send_random_nba_game');

      for (const game of NbaGameData) {
        for (const area_id of ListTimeTrigger) {
          if (game.area_id > area_id && game.area_id < area_id + 1) {
            await this.nbaService.sendRandomNbaGame(game.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomNbaGame:', error);
    }
  }

  async launchRandomToken(ListTimeTrigger: number[]) {
    try {
      const TokenData = await selectRows('send_random_token');

      for (const token of TokenData) {
        for (const area_id of ListTimeTrigger) {
          if (token.area_id > area_id && token.area_id < area_id + 1) {
            await this.coingekoService.sendRandomToken(token.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomToken:', error);
    }
  }

  async launchRandomChuckNorrisDevJoke(ListTimeTrigger: number[]) {
    try {
      const ChuckNorrisDevJokeData = await selectRows(
        'send_random_chuck_norris_dev_joke',
      );

      for (const joke of ChuckNorrisDevJokeData) {
        for (const area_id of ListTimeTrigger) {
          if (joke.area_id > area_id && joke.area_id < area_id + 1) {
            await this.chuckService.sendRandomDevJoke(joke.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomChuckNorrisDevJoke:', error);
    }
  }

  async launchRandomChuckNorrisReligionJoke(ListTimeTrigger: number[]) {
    try {
      const ChuckNorrisReligionJokeData = await selectRows(
        'send_random_chuck_norris_religion_joke',
      );

      for (const joke of ChuckNorrisReligionJokeData) {
        for (const area_id of ListTimeTrigger) {
          if (joke.area_id > area_id && joke.area_id < area_id + 1) {
            await this.chuckService.sendRandomReligionJoke(joke.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomChuckNorrisReligionJoke:', error);
    }
  }

  async launchRandomChuckNorrisPoliticalJoke(ListTimeTrigger: number[]) {
    try {
      const ChuckNorrisPoliticalJokeData = await selectRows(
        'send_random_chuck_norris_political_joke',
      );

      for (const joke of ChuckNorrisPoliticalJokeData) {
        for (const area_id of ListTimeTrigger) {
          if (joke.area_id > area_id && joke.area_id < area_id + 1) {
            await this.chuckService.sendRandomPoliticalJoke(joke.email);
          }
        }
      }
    } catch (error) {
      // Handle any errors here
      Logger.error('Error in launchRandomChuckNorrisPoliticalJoke:', error);
    }
  }
}
