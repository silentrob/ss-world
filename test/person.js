import {Person} from '../src/Person';
import mocha from 'mocha';
import should from 'should/as-function';

describe('Person interface', () => { 

  it("Basics", (done) => {
    const john = new Person("John", null, "male");
    const jane = john.mom('Jane');
    should(john.mom('Jane').gender).eql("female");

    // Parents should be older than children
    should(Person.older(jane, john)).eql(true);
    should(jane.son()).eql(john);
    
    done();    
  });


  it("Who Interface - absolute", (done) => {
    const john = new Person("John");
    const mary = new Person("mary");

    const jack = john.brother('jack');
    const mark = john.dad('mark');

    const albert = new Person("Albert Einstein");
    albert.career = "Scientist";

    should(albert.who()).eql("Scientist");
    done();    
  });

  it("Who Interface - relative", (done) => {
    // Who is John (in relation to jack)
    const john = new Person("John");
    const jack = john.son('jack');
    const mark = jack.son('mark');
    
    const albert = new Person("Albert Einstein");
    albert.career = "Scientist";

    should(john.who(mark)).eql("grand-son");
    should(albert.who()).eql("Scientist");

    done();    
  });

  it("Person age - relative", (done) => {
    var john = new Person("John");
    var mary = new Person("Mary");
    var jane = new Person("Jane");

    // John is 30
    john.age(30);

    should(john.age()).eql(30);

    // Mary is 5 years older than John
    mary.older(john, 5);

    // Jane is 2 years younger than mary
    jane.older(john, 8);

    should(Person.older(mary, john)).eql(true);
    should(Person.older(mary, jane)).eql(false);

    // TODO - See why this is false
    // should(Person.older(jane, mary)).eql(true);

    should(mary.age()).eql(35);
    should(jane.age()).eql(38);

    done();
  });
});

