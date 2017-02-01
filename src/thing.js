import _ from 'lodash';

const DESC = Symbol('Desc'); // high to low
const ASC = Symbol('Asc'); // low to high

const transitive_properties = [
  ['bigger', 'smaller', 'size'],
  ['older', 'younger', 'age']
];

class Thing {
  constructor(name, isa = null) {
    this.id = name.toLowerCase().replace(" ", "_");
    this.name = name || null;

    this._isa = [];
    this._inverse_isa = [];

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
    if (_.isString(thing)) {
      thing = new Thing(thing);
    }

    this._isa.push(thing);
    thing._inverse_isa.push(this);
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

// This is a BFS looking for thing2 in the tree(props) of thing1
// Props is an array of graphed nodes to search.
const walk_graph = function(thing1, thing2 = {}, props, abs_prop, dir) {
  let queue = [thing1];
  let visited = [];
  let result = [];
  let match = false;
  let abs_value = undefined;

  while(queue.length > 0) {
    let queued_item = queue.shift();
    result.push(queued_item);

    if (abs_prop && queued_item["_" + abs_prop]){
      let value = queued_item["_" + abs_prop];
      if (dir == ASC) {
        abs_value = (!abs_value || abs_value < value) ? value : abs_value;  
      } else {
        abs_value = (!abs_value || abs_value > value) ? value : abs_value;
      }
      
    } 

    if (thing2.id == queued_item.id) {
      match = true;
      break;
    }

    if (!visited[queued_item.id]) {
      visited[queued_item.id] = true;
      
      for (let n = 0; n < props.length; n++) {
        let prop_name = props[n]; // `_isa`
        for (var i = 0; i < queued_item[prop_name].length; i++) {
          // If the queued item is an array, it has an offset.
          if(_.isArray(queued_item[prop_name][i])) {
            queue.push(queued_item[prop_name][i][0]);
          } else {
            queue.push(queued_item[prop_name][i]);
          }
        }
      }
    } else {
      result.pop();
    }
  }
  return [match, result, abs_value];
}

const walk_graph2 = function(thing1, props, abs_prop) {
  let queue = [[thing1, null]];
  let visited = [];
  let result = [];
  let new_info = false;
  let prev_offset = 0;

  var queueThing = function(item) {
    let tq = (!_.isArray(item)) ? [item, null] : item;
    if (!visited[tq.id]) {
      queue.push(tq);
    }
  }

  if (thing1['_' + abs_prop]) {
    return thing1['_' + abs_prop];
  }

  while(queue.length > 0) {
    let queued_item = queue.shift();
    result.push(_.cloneDeep(queued_item));
    queued_item = queued_item[0];

    // Check for abs_prop and if we find it, walk the result tree back to a value
    if (queued_item['_' + abs_prop]) {
      result.reverse()
      let value;
      for (let j = 0; j < result.length; j++) {
        let r = result[j];
        value = r[0]['_' + abs_prop] + r[1];
        if (result[j+1]) {
          result[j+1][0]['_'+ abs_prop] = value;
        }
      }
      return value;
    }

    if (!visited[queued_item.id]) {
      visited[queued_item.id] = true;

      for (let n = 0; n < props.length; n++) {
        let prop_name = props[n]; // `_isa`
        for (var i = 0; i < queued_item[prop_name].length; i++) {
          // If the queued item is an array, it has an offset.
          // If this is an array we have an offset value
          if(_.isArray(queued_item[prop_name][i])) {
            visited[queued_item[prop_name][i][0].id] = true;
            if (result[result.length-2] && queued_item[prop_name][i][0].id == result[result.length-2][0].id) {
              result[result.length-1][1] = queued_item[prop_name][i][1];
            }
          }

          queueThing(queued_item[prop_name][i]);          
        }
      }
    } else {
      result.pop();
    }
  }
}

export default Thing;
