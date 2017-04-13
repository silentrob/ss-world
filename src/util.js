import _ from 'lodash';

const DESC = Symbol('Desc'); // high to low
const ASC = Symbol('Asc'); // low to high

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
        if (_.isArray(queued_item[prop_name])) {
          for (var i = 0; i < queued_item[prop_name].length; i++) {
            // If the queued item is an array, it has an offset.
            if(_.isArray(queued_item[prop_name][i])) {
              queue.push(queued_item[prop_name][i][0]);
            } else {
              queue.push(queued_item[prop_name][i]);
            }
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

export {walk_graph, walk_graph2};
