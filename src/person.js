import _ from 'lodash';
import Thing from './thing'

const GREATER = Symbol('Greater');
const LESSER = Symbol('Lesser');

const DESC = Symbol('Desc'); // high to low
const ASC = Symbol('Asc'); // low to high


class Person extends Thing {
  constructor(name, isa, gender = null) {
    super(name, isa);
    
    name = name || Math.random().toString(36).substr(2, 5);
    this.id = name.toLowerCase().replace(" ", "_");
    this.name = name || null;
    this.gender = gender;
    this._age = [];

    // Relations
    this.parents = [];
    this.children = [];

    // Things that the person owns or has
    this._possessions = [];
    
    // Things that the person likes or desires
    this._likes = [];
  }

  mom(p) {
    if (arguments.length === 1) {
      return this._createParent(p, "female");
    } else {
      return _.filter(this.parents, (p) => { return p.gender === "female"})[0]
    }
  }

  dad(p) {
    if (arguments.length === 1) {
      return this._createParent(p, "male");
    } else {
      return _.filter(this.parents, (p) => { return p.gender === "male"})[0]
    }
  }

  son(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      return this._createChild(p, "male");
    } else {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.children, (p) => { return p.gender === "male"})[index]
    }
  }

  sons() {
    return _.filter(this.children, (p) => { return p.gender === "male"});
  }

  daughter(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      return this._createChild(p, "female");
    } else {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.children, (p) => { return p.gender === "female"})[index]
    }
  }

  daughters() {
    return _.filter(this.children, (p) => { return p.gender === "female"});
  }

  sibling(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      const parent = this._findOrCreateParent();
      const child = _.isString(p) ? new Person(p) : p;
      child.parents.push(parent);
      parent.children.push(child);
    } else if (this.parents.length !== 0 && this.parents[0].children) {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.parents[0].children, (c) => {return c.name !== this.name})[index];
    }
  }

  siblings() {
    if (this.parents.length !== 0 && this.parents[0].children) {
      return _.filter(this.parents[0].children, (c) => {return c.name !== this.name})
    }
  }

  brother(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      const parent = this._findOrCreateParent();
      const child = _.isString(p) ? new Person(p) : p;
      child.gender = "male";
      child.parents.push(parent);
      parent.children.push(child);
      return child;
    } else if (this.parents.length !== 0 && this.parents[0].children) {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.siblings(), (c) => { return c.gender === "male"})[index]
    }
  }

  sister(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      const parent = this._findOrCreateParent();
      const child = _.isString(p) ? new Person(p) : p;
      child.gender = "female";
      child.parents.push(parent);
      parent.children.push(child);
      return child;
    } else if (this.parents.length !== 0 && this.parents[0].children) {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.siblings(), (c) => { return c.gender === "female"})[index]
    }
  }

  owns(thing) {
    if (arguments.length === 1 && !_.isString(thing)) {
      this._possessions.push(thing);
    } else {
      this._possessions.push(new Thing(thing));
    }
  }

  likes(person_or_thing) {
    if (arguments.length === 1 && !_.isString(person_or_thing)) {
      person_or_thing.created_at = new Date();
      this._likes.push(person_or_thing);
    } else if (arguments.length === 1){
      this._likes.push(new Thing(person_or_thing));
    } else {
      return this._likes;
    }
  }

  friends() {
    return _.filter(this._likes, function(x) { return x instanceof Person });
  }

  // Who is a handy way to resolve questions about who someone is.
  who(person) {
    let grand = function(rel) {
      return rel[0][0] == rel[1][0];
    }

    let chk = function(rel) {
      let ret = "";
      if (rel[0] === "parent") {
        ret = "parent";
        if (rel[1].gender === "male") {
          ret = "dad";
        } else if (rel[1].gender === "female") {
          ret = "mom";
        }
      }

      if (rel[0] === "child") {
        ret = "child";
        if (rel[1].gender === "male") {
          ret = "son";
        } else if (rel[1].gender === "female") {
          ret = "daughter";
        }
      }
      return ret;
    }

    if (person) {
      let result = this.find(person);
      if (result.length === 2) {
        return chk(result[1]);
      } else if (result.length === 3) {
        // parent -> parent (grand dad/son),  parent / child => sibling, 
        if (grand([result[1], result[2]])) {
          return "grand-" + chk(result[2]);
        } else {
          let ret = "sibling";
          if (result[2][1].gender === "male") {
            ret = "brother";
          } else if (result[2][1].gender === "female") {
            ret = "sister";
          }
          return ret;
        }
      }
    }

    return this.career;
  }

  /**
   * Helpers for creating relationships
   */

  // Here we create the node and add the relationship back
  // `this` is the `parent`
  _createChild(p, gender = null) {
    const child = _.isString(p) ? new Person(p) : p;
    child.gender = gender;
    child.parents.push(this);
    this.children.push(child);
    this.age(child, GREATER);
    return child;
  }

  _createParent(p, gender = null) {
    const parent = _.isString(p) ? new Person(p) : p;
    parent.gender = gender;
    // copy all children over.
    _.merge(parent.children, this.siblings());
    parent.children.push(this);
    this.parents.push(parent);
    this.age(parent, LESSER);
    return parent;
  }

  // for siblibgs we need to look up and back
  _findOrCreateParent() {
    let parent;
    if (this.parents.length !== 0) {
      parent = this.parents[0];
    } else {
      parent = new Person();
      this.parents.push(parent);
      parent.children.push(this);
    }
    return parent;
  }

  // Setter / Getter for age.
  // age() => gets age
  // age(number) => sets age
  // age(person) => uses age from person
  // age(person, offset) => relative age based on someone else.
  // age(person, GREATER|LESSER) => relative age based on someone else.
  age(person_or_value, offset = 0) {
    if (arguments.length === 0) {
      // if (this._age && this._age[0] && _.isSymbol(this._age[1])) {

      // if (this._age[0] instanceof Person) {
      //   return this._age[0].age() + this._age[1];
      // } else {

        return this._age[0][0] + this._age[0][1];
      // }
    } else {
      // Setting Age
      this._age.push([person_or_value, offset]);
      if (_.isSymbol(offset)) {
        // if (_.find(this._age, function(o) { return o[0] === person_or_value; })[0] !== person_or_value) {
        if (person_or_value._age.length === 0) {
          // Set the inverse
          person_or_value.age(this, Person.inverse(offset));
        }
      }
      
    }
  }

  find(p) {
    let queue=[['start', this]];
    let n;
    let visited = [];
    let result = [];
    let match = false;

    while(queue.length > 0) {
      let x = queue.shift();
      n = x[1];
      result.push(x);

      if (p.id == n.id) {
        match = true;
        break;
      }

      if (!visited[n.id]) {
        visited[n.id] = true;

        for (var i = 0; i < n.children.length; i++) {
           queue.push(['child', n.children[i]]);
        }

        for (var i = 0; i < n.parents.length; i++) {
           queue.push(['parent', n.parents[i]]);
        }
      } else {
        result.pop();
      }

    }
    return (match) ? result : [];
  }

  static inverse(sym) {
    return sym === GREATER ? LESSER : GREATER;
  }
  // transitive property
  // people, array of Persons
  // property is the method to call (age) is the only one supported
  // direction DESC / ASC
  // return the first element and first person [[person, property], ...]
  static transitive(people, property, direction = DESC) {
    // Which person is the OLDEST
    let dir = (direction === DESC) ? GREATER : LESSER;

    var topologicalSortHelper = function topologicalSortHelper(node, visited, temp, result) {
      temp[node.id] = true;
      var neighbors = _.filter(node[property], function(i) {
        return (i[1] === dir);
      });
      
      console.log(neighbors.length);

      for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i][0];
        if (temp[n.id]) {
          throw new Error(`We encounteted a cycle in '${property}' property. IE: A -> B -> A`);
        }
        if (!visited[n.id]) {
          topologicalSortHelper(n, visited, temp, result);
        }
      }
      temp[node.id] = false;
      visited[node.id] = true;
      result.push(node);
    }

    var result = [];
    var visited = [];
    var temp = [];
    for (var i = 0; i < people.length; i++) {
      var node = people[i];
      if (!visited[node.id] && !temp[node.id]) {
        topologicalSortHelper(node, visited, temp, result);
      }
    }

    return result.filter(function(p) {
      return _.includes(people, p)
    }).reverse();
  }
}

export {
  Person,
  GREATER,
  LESSER,
  DESC,
  ASC,  
};
