import _ from 'lodash';

class Location {
  constructor(name) {
    // this.id = Math.random().toString(36).substr(2,7);
    this.id = name.toLowerCase().replace(" ", "_");
    this.name = name || null;

    this._isa = [];
    this._inverse_isa = [];
  }

  isA(thing) {
    if (_.isString(thing)) {
      thing = new Thing(thing);
    }

    this._isa.push(thing);
    thing._inverse_isa(this);
  }
}


export default Location;
