import _ from 'lodash';
import Thing from './thing'
import {walk_graph, walk_graph2, walk_graph3} from './util';

class Person extends Thing {
  constructor(name, isa, gender = null) {
    super(name, isa);
    
    this.id = this.id = "P" + Math.random().toString(36).substr(2, 5).toUpperCase();
    this._name = name || null;
    this._gender = gender;

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
      return _.filter(this.parents, (p) => { return p._gender === "female"})[0]
    }
  }

  dad(p) {
    if (arguments.length === 1) {
      return this._createParent(p, "male");
    } else {
      return _.filter(this.parents, (p) => { return p._gender === "male"})[0]
    }
  }

  // Returns a human readable form of parents
  // Fixme: 3 parents?
  whoParents() {
    let plist = this.parents.map((p) => {return p._name});
    if (plist.length === 2) {
      return plist.join(" and ");
    } else {
      return plist.join("");
    }
  }


  son(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      return this._createChild(p, "male");
    } else {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.children, (p) => { return p._gender === "male"})[index]
    }
  }

  sons() {
    return _.filter(this.children, (p) => { return p._gender === "male"});
  }

  daughter(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      return this._createChild(p, "female");
    } else {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.children, (p) => { return p._gender === "female"})[index]
    }
  }

  daughters() {
    return _.filter(this.children, (p) => { return p._gender === "female"});
  }

  sibling(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      const parent = this._findOrCreateParent();
      const child = _.isString(p) ? new Person(p) : p;
      child.parents.push(parent);
      parent.children.push(child);
    } else if (this.parents.length !== 0 && this.parents[0].children) {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.parents[0].children, (c) => {return c._name !== this._name})[index];
    }
  }

  siblings() {
    if (this.parents.length !== 0 && this.parents[0].children) {
      return _.filter(this.parents[0].children, (c) => {return c._name !== this._name})
    }
  }

  brother(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      const parent = this._findOrCreateParent();
      const child = _.isString(p) ? new Person(p) : p;
      child._gender = "male";
      child.parents.push(parent);
      parent.children.push(child);
      return child;
    } else if (this.parents.length !== 0 && this.parents[0].children) {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.siblings(), (c) => { return c._gender === "male"})[index]
    }
  }

  sister(p) {
    if (arguments.length === 1 && !_.isNumber(p)) {
      const parent = this._findOrCreateParent();
      const child = _.isString(p) ? new Person(p) : p;
      child._gender = "female";
      child.parents.push(parent);
      parent.children.push(child);
      return child;
    } else if (this.parents.length !== 0 && this.parents[0].children) {
      const index = _.isNumber(p) ? p : 0;
      return _.filter(this.siblings(), (c) => { return c._gender === "female"})[index]
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

  // This will find the item in the list of likes, but also includes 
  // transitive properties.
  likesFind(person_or_thing) {
    const traversal_props = ['_isa', '_inverse_isa', '_likes'];
    let results = walk_graph(this, person_or_thing, traversal_props);

    if (results[0]) {
      if (results[1].length === 2) {
        // A -> B
        return [true, results[1].pop()];
      } else {
        // A -> N -> B <- C
        return [true, results[1].slice(-2, -1)[0]];
      }
    } else {
      return [false, null];
    }
  }


  friends() {
    return _.filter(this._likes, function(x) { return x instanceof Person });
  }

  gender(gender) {
    if (arguments.length === 1) {
      return this._gender = gender;
    } else {
      return this._gender;  
    }
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
        if (rel[1]._gender === "male") {
          ret = "dad";
        } else if (rel[1]._gender === "female") {
          ret = "mom";
        }
      }

      if (rel[0] === "child") {
        ret = "child";
        if (rel[1]._gender === "male") {
          ret = "son";
        } else if (rel[1]._gender === "female") {
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
          if (result[2][1]._gender === "male") {
            ret = "brother";
          } else if (result[2][1]._gender === "female") {
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
    child._gender = gender;
    child.parents.push(this);
    this.children.push(child);
    this.older(child);
    return child;
  }

  _createParent(p, gender = null) {
    const parent = _.isString(p) ? new Person(p) : p;
    parent._gender = gender;
    // copy all children over.
    _.merge(parent.children, this.siblings());
    parent.children.push(this);
    this.parents.push(parent);
    this.younger(parent);
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
}

export {
  Person
};
