export default {
  concepts: [
    {name: "scientist", isa: "occupation"},
    {name: "inventor", isa: "occupation"},
    {name: "physicist", isa: "scientist"},
    {name: "electrical engineer", isa: "scientist"},
    {name: "computer scientist", isa: "scientist"},
    {name: "astrophysicist", isa: "scientist"},
    {name: "biologist", isa: "scientist"},
    {name: "biochemist", isa: "scientist"},
    {name: "molecular biologist", isa: "scientist"},
    {name: "rocket scientist", isa: "scientist"},
    {name: "psychologist", isa: "scientist"},
    {name: "zoologist", isa: "scientist"},
    {name: "seismologist", isa: "scientist"},
    {name: "chemist", isa: "scientist"},
    {name: "astronomer", isa: "scientist"},
    {name: "bacteriologist", isa: "scientist"},
  ],

  things: [
    {name:"coffee", isa: "drink"},
    {name:"tea", isa: "drink"},
    {name:"lemonade", isa: "drink"},

    {name: "green", isa: "color"},
    {name: "red", isa: "color"},
    {name: "blue", isa: "color"}
  ],

  people: [
    {name: "Albert Einstein", career: "physicist", gender: "male" },
    {name: "Bill", career: "physicist", gender: "male", age: 50 },
    {name: "Jane", career: "physicist", gender: "female" },
    {name: "Brit", gender: "female", age: 30, likes: ['green', 'chocolate'], dad: "Bill", mom: "Jane"}
  ],

  // bot: [
  //   {
  //     name: "Brit", gender: "female", age: 30, likes: [
  //       'green', 'chocolate'
  //     ]
  //   }
  // ]
}

