import mocha from 'mocha';
import should from 'should/as-function';

import Thing from '../src/Thing';

describe('Thing interface', () => { 
  
  // Direct Object (a -> b)
  // which is bigger, a grape or a grapefruit? 
  it('grapefruit is bigger than grape', (done) => {
    let grape = new Thing("grape");
    let grapefruit = new Thing("grapefruit");
    grapefruit.bigger(grape);

    should(Thing.bigger(grape, grapefruit)).eql(false);
    should(Thing.bigger(grapefruit, grape)).eql(true);

    done();
  });

  // Indirect Object (a -> b <-> c <- d)
  // We assert that `ant` is bigger than `anteater` because `mammal` is bigger than `insect`
  it('which is bigger an ant or anteater', (done) => {
    let ant = new Thing("ant");
    let anteater = new Thing("anteater");
    let insect = new Thing('insect');
    let mammal = new Thing('mammal');
    ant.isA(insect);
    anteater.isA(mammal);
    mammal.bigger(insect)
  
    should(Thing.bigger(mammal, insect)).eql(true);
    should(Thing.bigger(insect, mammal)).eql(false);
    should(Thing.bigger(anteater, ant)).eql(true);
    should(Thing.bigger(ant, anteater)).eql(false);
    should(Thing.bigger(mammal, ant)).eql(true);
    should(Thing.bigger(insect, anteater)).eql(false);

    done();
  });

  // We can also assign an absolute value `size` to an object and use the same `bigger` relation.
  it('which is bigger a car or train', (done) => {
    let car = new Thing("car");
    let train = new Thing("train");
    car.size(10);
    train.size(1000);

    should(Thing.bigger(train, car)).eql(true);
    should(Thing.bigger(car, train)).eql(false);

    done();
  });
  
  it('which is bigger a cat or dog', (done) => {
    let cat = new Thing("cat");
    let siamese_cats = new Thing("siamese");
    siamese_cats.isA(cat);

    let dog = new Thing("dog");
    let golden_retriever = new Thing("golden_retriever");
    golden_retriever.isA(dog);

    dog.size(10);
    cat.size(5);

    should(Thing.bigger(dog, cat)).eql(true);
    should(Thing.bigger(golden_retriever, siamese_cats)).eql(true);

    should(Thing.smaller(cat, dog)).eql(true);
    should(Thing.smaller(siamese_cats, golden_retriever)).eql(true);

    // Lets create a REALLY big cat
    siamese_cats.size(30);
    should(Thing.bigger(siamese_cats, golden_retriever)).eql(true);
    
    // Here the big cat should propigate to the `cat`
    should(Thing.bigger(cat, dog)).eql(true);
    should(Thing.bigger(dog, cat)).eql(false);

    // The smallest cat is still smaller than the dog
    should(Thing.smaller(cat, dog)).eql(true);
    done();
  });

  it('bigger and smaller are inverse', (done) => {
    let a = new Thing("a");
    let b = new Thing("b");
    let c = new Thing("c");

    a.bigger(b);
    c.smaller(b)
    // size should be
    // c -> b -> a
    should(Thing.bigger(a, b)).eql(true);
    should(Thing.bigger(b, c)).eql(true);
    should(Thing.bigger(a, c)).eql(true);

    should(Thing.smaller(c, b)).eql(true);
    should(Thing.smaller(b, a)).eql(true);
    should(Thing.smaller(c, a)).eql(true);

    done();
  });

  // `size` is a getter and setter
  it('property should return its abs value', (done) => {
    let siamese_cats = new Thing("siamese");
    siamese_cats.size(10);
    should(siamese_cats.size()).eql(10);
    done();
  });

  describe('Relative trans properties', () => {
    let a = new Thing("a");
    let b = new Thing("b");
    let c = new Thing("c");

    a.smaller(b, 10);
    a.smaller(c, 20);

    // size should be
    // a -> b 10
    // a -> c 20

    // We can also compare sizes and apply an offset.
    it('two relative properties', (done) => {
      should(Thing.smaller(a, c)).eql(true);
      should(Thing.smaller(a, b)).eql(true);

      // With this new info we can work out the value of `a`
      c.size(40);

      // size should be
      // a -> c 20 (40 - 20) = 20
      // a -> b 10 (20 - 10) = 10
      // c = 40, a = 20, b = 10

      should(c.size()).eql(40);
      should(a.size()).eql(20);
      should(b.size()).eql(10);

      done();
    });

  });

  it('which is older relative to thing', (done) => {
    let barn = new Thing("barn");
    let house = new Thing("house");
    let church = new Thing("church");
    
    barn.older(house, 50);
    church.younger(house, 20);
    
    should(Thing.older(barn, house)).eql(true);

    house.age(50);
    should(barn.age()).eql(100);

    done();
  });

  it('What is the color of the sky?', (done) => {

    let white = new Thing('white');
    let blue = new Thing('blue');
    let color = new Thing('color');
  
    white.isA(color);
    blue.isA(color);
  
    let sky = new Thing('sky');
    sky.isA(blue)

    // Is blue a color
    should(Thing.isA(blue, color)).eql(true);
    should(Thing.isA(color, blue)).eql(false);
    should(Thing.find(sky, color)).eql(blue);
    should(Thing.find(color, sky)).eql(blue);
    done();
  });

  it('What is the color of the red sea?', (done) => {

    // Lets stretch this out.
    let redsea = new Thing('red sea');
    let sea = new Thing('sea');
    let water = new Thing('water');

    redsea.isA(sea);
    sea.isA(water);
    
    let blue = new Thing('blue');
    let color = new Thing('color');

    blue.isA(color);

    // Lastly
    water.isA(blue);

    // Is blue a color
    should(Thing.isA(water, blue)).eql(true);
    should(Thing.find(redsea, color)).eql(blue);
    done();
  });

  // What would I use a hammer for?
  it('What would I use a hammer for?', (done) => {
    let hammer = new Thing('hammer');
    let nail = new Thing('nail');
    hammer.usedFor(nail);

    should(hammer.usedFor()).eql(nail);
    done();
  });

  // What would I use to put a nail into a wall? 
  // For this we need to look at an inverse_usedfor
  it('What would I use to put a nail into a wall?', (done) => {
    let hammer = new Thing('hammer');
    let nail = new Thing('nail');
    hammer.usedFor(nail);
    should(nail._inverse_usedfor[0]).eql(hammer);
    done();
  });

  it('Thing #what method', (done) => {
    let hammer = new Thing('hammer');
    let tool = new Thing('tool');

    should(hammer.what()).eql("I don't know what hammer is.");
    
    hammer.isA(tool);
    should(hammer.what()).eql("A hammer is a tool.");
    
    hammer.usedFor("nailing");
    should(hammer.what()).eql("A hammer is a tool, used for nailing.");

    let srewdriver = new Thing('srewdriver', tool);
    should(hammer.what()).eql("A hammer is a tool much like a srewdriver, used for nailing.");

    done();
  });

});
