import _ from 'lodash';
import {walk_graph, walk_graph2} from './util';

const DESC = Symbol('Desc'); // high to low
const ASC = Symbol('Asc'); // low to high

const transitive_properties = [
  ['bigger', 'smaller', 'size'],
  ['older', 'younger', 'age']
];

class Thing {
  constructor(name, isa = null) {
    this.id = "T" + Math.random().toString(36).substr(2, 5).toUpperCase();
    this._name = name || null;

    this._isa = [];
    this._inverse_isa = [];

    this._usedfor = [];
    this._inverse_usedfor = [];

    if (isa) {
      this.isA(isa);
    }

    transitive_properties.forEach((method_prop) => {
      let forward = method_prop[0];
      let reverse = method_prop[1];

      if (!this['_' + forward]) this['_' + forward] = [];
      if (!this['_' + reverse]) this['_' + reverse] = [];

      this[forward] = function(item, offset = 0) {
        item = (_.isString(item)) ? new Thing(item) : item;
        this['_' + forward].push([item, offset]);
        item['_' + reverse].push(this);
      }

      this[reverse] = function(item, offset = 0) {
        item = (_.isString(item)) ? new Thing(item) : item;
        this['_' + reverse].push([item, offset * -1]);
        item['_' + forward].push(this);
      }

      // Absolute Value function prop
      if (method_prop[2]) {
        let abs_value = method_prop[2];
        this[abs_value] = function(item) {
          if (arguments.length === 0) {
            if (!this['_' + abs_value]) {
              return walk_graph2(this, ['_' + forward, '_' + reverse], abs_value);
            } else {
              return this['_' + abs_value];  
            }
            
          } else {
            this['_' + abs_value] = parseInt(item);  
          }
        }
      }
    });
  }

  isA(thing) {
    if (arguments.length == 0) {
      return this._isa[0];
    }

    if (_.isString(thing)) {
      thing = new Thing(thing);
    }

    this._isa.push(thing);
    thing._inverse_isa.push(this);
  }

  usedFor(thing) {
    if (arguments.length == 0) {
      return this._usedfor[0];
    }

    if (_.isString(thing)) {
      thing = new Thing(thing);
    }

    this._usedfor.push(thing);
    thing._inverse_usedfor.push(this);
  }

  name(name) {
    if (arguments.length === 1) {
      this._name = name;
    } else {
      return this._name;
    }
  }

  what() {
    let isa = _.sample(this._isa);
    let use = _.sample(this._usedfor);
    let syn;
    let use_clasue = '';
    let self = this;
    if (isa) {
      syn = _.filter(isa._inverse_isa, function(i){ return i.id != self.id; })[0]; 
    }

    if (!isa && !use) {
      return `I don't know what ${this._name} is.`;
    } else {
      let isa_clause = (isa) ? ` is a ${isa._name}` : '';
      let sym_clause = (syn) ? ` much like a ${syn._name}` : '';
      if (use) {
        use_clasue = (syn || isa) ? `, used for ${use._name}` : ` is used for ${use._name}`; 
      }
      return `A ${this._name}${isa_clause}${sym_clause}${use_clasue}.`;
    }
  }

  static isA(thing1, thing2) {
    const traversal_props = ['_isa'];
    return walk_graph(thing1, thing2, traversal_props)[0];
  }

  // sky, color => blue
  // thing1 -> thingN -> thingX <- thing2
  static find(thing1, thing2) {
    const traversal_props = ['_isa', '_inverse_isa'];
    let results = walk_graph(thing1, thing2, traversal_props);

    if (results[0]) {
      return results[1].slice(-2, -1)[0];
    } else {
      return null;
    }
  }
}

transitive_properties.forEach((method_prop) => {
  let forward = method_prop[0];
  let reverse = method_prop[1];
  let abs_prop = method_prop[2];

  Thing[forward] = function(thing1, thing2) {
    const traversal_props = ['_isa', '_inverse_isa'];
    traversal_props.push('_' + forward);
    let ret = walk_graph(thing1, thing2, traversal_props, abs_prop, ASC);
    console.log(ret);
    let out = ret[0]

    // There is no direct path from thing1 to thing2
    // But we have a absolute value, so lets see if we can get a value from thing2
    if (out === false && ret[2]) {
      let ret_abs = walk_graph(thing2, thing1, traversal_props, abs_prop, ASC);
      if (ret_abs[2]) {
        return ret[2] > ret_abs[2];
      }
    }

    return out;
  }

  Thing[reverse] = function(thing1, thing2) {
      const traversal_props = ['_isa', '_inverse_isa'];
      traversal_props.push('_' + reverse);
      let ret = walk_graph(thing1, thing2, traversal_props, abs_prop, DESC);
      let out = ret[0]

      // There is no direct path from thing1 to thing2
      // But we have a absolute value, so lets see if we can get a value from thing2
      if (out === false && ret[2]) {
        let ret_abs = walk_graph(thing2, thing1, traversal_props, abs_prop, DESC);
        if (ret_abs[2]) {
          return ret[2] < ret_abs[2];
        }
      }

      return out;
  }
});

export default Thing;
