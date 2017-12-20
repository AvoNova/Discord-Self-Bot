/*
 *   This file is part of discord-self-bot
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const Discord = require('discord.js'),
	auth = require('../../auth.json'),
	commando = require('discord.js-commando'),
	data = require('../../data.json'),
	igdbapi = require('igdb-api-node').default,
	moment = require('moment'),
	vibrant = require('node-vibrant');

module.exports = class gameCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'games',
			'group': 'search',
			'aliases': ['game', 'moby', 'igdb'],
			'memberName': 'games',
			'description': 'Finds info on a game on Mobygames',
			'examples': ['games {gameName}', 'games Tales of Berseria'],
			'guildOnly': false,

			'args': [
				{
					'key': 'game',
					'prompt': 'Please supply game title',
					'type': 'string',
					'label': 'Game to look up'
				}
			]

		});
		this.embedColor = '#FF0000';
	}

	async fetchColor (img) {

		const palette = await vibrant.from(img).getPalette();

		if (palette) {
			const pops = [],
				swatches = Object.values(palette);

			let prominentSwatch = {};

			for (const swatch in swatches) {
				if (swatches[swatch]) {
					pops.push(swatches[swatch]._population); // eslint-disable-line no-underscore-dangle
				}
			}

			const highestPop = pops.reduce((a, b) => Math.max(a, b)); // eslint-disable-line one-var

			for (const swatch in swatches) {
				if (swatches[swatch]) {
					if (swatches[swatch]._population === highestPop) { // eslint-disable-line no-underscore-dangle
						prominentSwatch = swatches[swatch];
						break;
					}
				}
			}
			this.embedColor = prominentSwatch.getHex();
		}

		return this.embedColor;
	}

	extractNames (arr) {
		let res = '';

		for (let i = 0; i < arr.length; i += 1) {
			if (i !== arr.length - 1) {
				res += `${arr[i].name}, `;
			} else {
				res += `${arr[i].name}`;
			}
		}

		return res;
	}

	async run (msg, args) {
		/* eslint-disable sort-vars*/
		const gameEmbed = new Discord.MessageEmbed(),
			igdb = igdbapi(auth.igdbAPIKey),
			gameInfo = await igdb.games({
				'search': args.game,
				'fields': ['name', 'summary', 'rating', 'developers', 'publishers', 'genres', 'release_dates', 'platforms', 'cover', 'esrb', 'pegi'],
				'limit': 1,
				'offset': 0
			}),
			developerInfo = await igdb.companies({
				'ids': gameInfo.body[0].developers.concat(gameInfo.body[0].publishers),
				'fields': ['name']
			}),
			genreInfo = await igdb.genres({
				'ids': gameInfo.body[0].genres,
				'fields': ['name']
			}),
			hexColor = gameInfo.body[0].cover ? await this.fetchColor(gameInfo.body[0].cover.url) : this.embedColor,
			platformInfo = await igdb.platforms({
				'ids': gameInfo.body[0].platforms,
				'fields': ['name']
			}),
			releaseDate = moment(gameInfo.body[0].release_dates[0].date).format('MMMM Do YYYY');
		/* eslint-enable sort-vars*/

		gameEmbed
			.setColor(hexColor)
			.setAuthor(gameInfo.body[0].name, 'https://favna.s-ul.eu/O704Q7py.png')
			.setThumbnail(gameInfo.body[0].cover.url)
			.setFooter('Info pulled from IGDB')
			.addField('Rating', Math.round(gameInfo.body[0].rating * 10) / 10, true)
			.addField('Release Date', releaseDate, true)
			.addField('Genres', this.extractNames(genreInfo.body), true)
			.addField('Platforms', this.extractNames(platformInfo.body), true)
			.addField(`${gameInfo.body[0].pegi ? 'PEGI' : 'ESRB'} rating`, gameInfo.body[0].pegi ? gameInfo.body[0].pegi.rating : gameInfo.body[0].esrb.rating, true)
			.addField('Companies', this.extractNames(developerInfo.body), true)
			.addField('Summary', gameInfo.body[0].summary, false);

		if (msg.deletable && data.deleteCommandMessages) {
			msg.delete();
		}

		return msg.embed(gameEmbed);
	}
};