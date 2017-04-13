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
    let self = this;
    let isa;
    let people_props = ['age', 'likes', 'mom', 'dad'];

    for (let i = 0; i < data.things.length; i++) {
      let thing = data.things[i];
      if (thing.isa) {
        isa = self.findByName(thing.isa);
        isa = (isa) ? isa : new Thing(thing.isa);
        self.createEntity(isa, THING);
      }
      
      let t = new Thing(thing.name, isa);
      this.createEntity(t, THING);
    }

    for (let i = 0; i < data.people.length; i++) {
      let person = data.people[i];

      let p = new Person(person.name);
      for(let prop in person) {

        if (prop === "name") {
          continue;
        }

        // if (prop === "gender") {
        //   p['_gender'] = person['gender'];
        //   continue;
        // }


        if (people_props.indexOf(prop) !== -1) {
          if (_.isArray(person[prop])) {
            for(let n = 0; n < person[prop].length; n++) {
              p[prop](person[prop][n]);
            }
          } else {
            if (prop === "mom" || prop === "dad") {
              p[prop](this.findByName(person[prop]));
            } else {
              p[prop](person[prop]);  
            }
            
          }
        }

      }
      this.createEntity(p, PERSON);
    }
  }

  createEntity(name, type) {

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

  findByName(name) {
    for(let entry in this.entities) {
      if (this.entities[entry]._name === name) {
        return this.entities[entry];
      }
    }
  }

}

export {World, Person, Thing};
