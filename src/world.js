/**
 * We need some concept of the world which consists of things, people and locations.
 */

import Thing from './thing';
import {Person} from './person';
import _ from 'lodash';

const PERSON = Symbol('Person');
const LOCATION = Symbol('Location');
const THING = Symbol('Thing');


class World {
  constructor() {
    this.radius = 6371;
    this.time = new Date();

    this.entities = {};
  }

  load(data) {
    for (let i = 0; i < data.things.length; i++) {
      let thing = data.things[i];
      let t = new Thing(thing.name, thing.isa);
      this.create_entity(t, THING);
      this.create_entity(thing.isa, THING);
    }

    for (let i = 0; i < data.people.length; i++) {
      let person = data.people[i];
      let p = new Person(person.name);
      for(let prop in person) {
        if (prop !== "name") {
          p[prop] = person[prop];
        }
      }
      
      this.create_entity(p, PERSON);
    }
  }

  create_entity(name, type) {

    let entity;

    if (type === PERSON) {
      entity = (_.isString(name)) ? new Person(name) : name;
      this.entities[entity.id] = entity;
    } else if (type === THING) {
      entity = (_.isString(name)) ? new Thing(name) : name;
      this.entities[entity.id] = entity;
    } else if (type === LOCATION) {
      entity = new Thing(name);
      this.entities[entity.id] = entity;
    }
    return this.entities[entity.id];
  }

  find(name) {
    const id = name.toLowerCase().replace(" ", "_");
    if (this.entities[id]) {
      return this.entities[id];
    } else {
      // TODO find by name
    }
  }

}

export {World, PERSON, LOCATION, THING};
