import {Person} from '../src/Person';

// const john = new Person("John");
// const mary = new Person("mary");

// const jack = john.brother('jack');
// const mark = john.dad('mark');


// const albert = new Person("Albert Einstein");
// albert.career = "Scientist";
// console.log(albert.who());
// Scientist

// Who is John (in relation to jack)
// const john = new Person("John");
// const jack = john.son('jack');
// const mark = jack.son('mark');
// console.log(john.who(mark));
// grand-son

// console.log(albert.who(jack));
// Scientist

// console.log(john.who());

// var john = new Person("John");
// var mary = new Person("Mary");
// var jane = new Person("Jane");

// // John is 30
// john.age(30);

// // Mary is 5 years older than John
// mary.age(john, +5);

// // Jane is 2 years younger than mary
// jane.age(john, 8);

// // Who is older jane or john
// console.log(Person.transitive([mary, jane], 'age', HIGH));

// Truly relative things
// mary is older than john
// mary is older than jane
// mary.age(john, GREATER);
// mary.age(jane, GREATER);
// Person.transitive([mary, john], 'age', HIGH)
// Here we know [mary, john] && [mary, jane]

// Jane is younger than john
// jane.age(john, LESSER);
// console.log(mary);

// Person.transitive([mary, john], 'age', HIGH)
// john is older than jane
// john.age(jane, GREATER);
// who is older mary or jane
// console.log(Person.transitive([mary, jane], 'age', HIGH));

// Lets get to a place we can go back and forth bewteen relative and abs.
