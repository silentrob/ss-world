
# ss-world

This project's goal is to model a world to reason about questions in the conext of chat bots and designed to work with SuperScript.

We will start with questions sourced from real bots, Lobner screener quetions and inspired by BAbi toy tasks. And model the project around simple primitives that should be easy to grok.

## Things

For the initial prototype we can think of a thing as a `physical thing`. 
Some examples:

`let chair = new Thing('chair');`

Things can also be living but should not be people. We have a class for that.

`let dog = new Thing('dog');`

## Person

A person extends the `Thing` class and adds extra methods to describe relationships with other people, and has a concept of gender and transitive qualities built in for age. 

```
let rob = new Person('Rob');
rob.daughter('Sydney');
rob.daughter('Brodie');
```

## Ideas: 
Add Visualization tool.
http://js.cytoscape.org/demos/7e2f4d29ff7ef1a1bba5/

http://www.clres.com/semrels/umls_relation_list.html
https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model
