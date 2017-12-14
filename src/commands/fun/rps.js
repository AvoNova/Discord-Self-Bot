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
	commando = require('discord.js-commando'),
	random = require('node-random');

module.exports = class rpsCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'rps',
			'group': 'fun',
			'aliases': ['rockpaperscissors'],
			'memberName': 'rps',
			'description': 'Play Rock Paper Scissors against random.org randomization',
			'examples': ['rps {hand}', 'rps Rock'],
			'guildOnly': false,

			'args': [
				{
					'key': 'hand',
					'prompt': 'Play Rock, Paper or Scissors?',
					'type': 'string',
					'label': 'What hand to play',
					'default': 'rock'
				}
			]
		});
	}

	run (msg, args) {
		random.integers({
			'number': 1,
			'minimum': 1,
			'maximum': 3
		}, (error, data) => {
			if (!error) {
				const rpsEmbed = new Discord.MessageEmbed();

				let resString = 'init';

				if (args.hand === 'rock' && data === 1) {
					resString = 'It\'s a draw 😶! Both picked 🗿';
				} else if (args.hand === 'rock' && data === 2) {
					resString = 'I won 😃! My 📜 covered your 🗿';
				} else if (args.hand === 'rock' && data === 3) {
					resString = ' I lost 😞! Your 🗿 smashed my ️️️✂️ to pieces';
				} else 	if (args.hand === 'paper' && data === 1) {
					resString = 'I lost 😞! Your 📜 covered my 🗿';
				} else if (args.hand === 'paper' && data === 2) {
					resString = 'It\'s a draw 😶! Both picked 📜';
				} else if (args.hand === 'paper' && data === 3) {
					resString = 'I won 😃! My ✂️ cut your 📜 to shreds';
				} else 	if (args.hand === 'scissor' && data === 1) {
					resString = 'I won 😃! My 🗿 smashed your ✂️ to pieces';
				} else if (args.hand === 'scissor' && data === 2) {
					resString = 'I lost 😞! Your ✂️ cut my 📜 to shreds';
				} else if (args.hand === 'scissor' && data === 3) {
					resString = 'It\'s a draw 😶! Both picked ✂️';
				} 

				rpsEmbed
					.setColor(msg.member !== null ? msg.member.displayHexColor : '#FF0000')
					.setTitle('Rock Paper Scissors')
					.setDescription(resString);

				return msg.embed(rpsEmbed);
			}

			return msg.reply('an error occured getting a random result and I\'m not going to rig this game.');
		});
	}
};