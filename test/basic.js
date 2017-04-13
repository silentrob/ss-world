import {World, Person, Thing} from '../src/world';
import data from '../data/entities_sm';

// World
const w = new World();
w.load(data);

let bot = w.findByName('Brit');

// How old are you?
console.log("age", bot.age());

// Are you male or female?
console.log("gender", bot.gender());

// Are you a bot?
console.log("isa bot",  Person.isA(bot, 'bot'));

// What is your favorite color?
// console.log(bot.findLikes(w.findByName('color')));

// Who are your parents?
console.log("Parents",  bot.whoParents());

// Which do you like better chocolate or vanilla?
// What color is the red sea?
