const strips = require("strips");
const mapGenerator = require("./map_generator");
const GA = require("./ga");
const FF = require("./fitness_function");
const fs = require("fs");
const config = require("./config.json");
let fitnessFunction = require('./fitness_function.js');

const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

// Load the domain and problem.
/*
const PROBLEM = mapGenerator.generate(config.grid_col_row, config.grid_col_row, 3, [1, 1, 1, 1, 1]);

fs.writeFile("./hero_problem.pddl" , PROBLEM, err => {
  if (err) {
    return console.log(err);
  }
  console.log("The file was saved!");
});*/

let results = {};

const runLoader = async () => {
for (let p=0; p<5; p++) {
  results[p] = {};
  await new Promise(resolve => strips.load(
    "./Maps/hero_domain_3_by_3_1_monster.pddl",
    "./Maps/hero_problem_3_by_3_1_block_1_monster_"+p+".pddl",
    (domain, problem) => {
      // Get encoding for GA
      var mapping = GA.encode(domain, problem);
      // Generate initial population
      var initialPopulation = GA.generateIntialPopulation(
        domain,
        problem,
        strips.applicableActions,
        mapping,
        config.chromosome_size,
        config.population_size
      );
      if (initialPopulation.length < 0) {
        console.log("Invalid grid generated - no valid first move.");
      }
      let times = [];
      let lengths = [];
      for (let j = 0; j<5; j++) {
        var start = new Date().getTime();
        for (let i=0; i<config.generations; i++) {
          initialPopulation = GA.generateNewPopulation(initialPopulation, domain, mapping, problem.states[0], problem.states[1]);
          let test = GA.getTheFittest(initialPopulation, domain, mapping, problem.states[0], problem.states[1]);
          //console.log("----------------------------------------");
          //console.log(test.individual);
          //GA.printFitness(test.individual, domain, mapping, problem.states[0], problem.states[1]);
          let collisionsAtEndObject = fitnessFunction.getCountCollisionsAtTheEnd(domain, mapping, test.individual, problem.states[0], problem.states[1]);
          let collisionsAtEnd = collisionsAtEndObject.goalPreconditions;
          let length = collisionsAtEndObject.length;
          //console.log(collisionsAtEnd);
          if (collisionsAtEnd === 1 && results[length] === undefined) {
              var end = new Date().getTime();
              results[p][length + 1] = {"length": length + 1, "iteration": i, "time": end - start, "path": test.individual, "fitness": test.bestFitness};
          }
          //console.log(test.bestFitness);
          //console.log("----------------------------------------");
          if (i % 10 === 0) {
            GA.cleanLoops(initialPopulation);
          }
          var end = new Date().getTime();
          //console.log("Time (ms): "+(end - start));
        }
        times.push(end);
        let bestPath = Infinity;
        for (let result in results[p]) {
          if (results[p][result].length < bestPath) {
            bestPath = results[p][result].length;
          }
        }
        lengths.push(bestPath);
      }
      console.log("For map 3 by 3 with 1 monster # " + p + ": Average length of " + average(lengths) + " and average time of " + average(times));
      if (p === 4) {
        for (let i = 0; i<5; i++) {
          console.log("Map # " + i + ": " + JSON.stringify(results[i]));
        }
      }
        resolve()
    }))
}
}

runLoader();