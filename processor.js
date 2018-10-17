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
for (let p=0; p<1; p++) {
  results[p] = {};
  await new Promise(resolve => strips.load(
    "./Maps/hero_domain_5_by_5_3_monsters.pddl",
    "./Maps/hero_problem_5_by_5_3_blocks_3_monsters_"+p+".pddl",
    (domain, problem) => {
      // Get encoding for GA
      var mapping = GA.encode(domain, problem);
      let times = [];
      let lengths = [];
      for (let j = 0; j<1; j++) {
        results[p][j] = {};
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
        var start = new Date().getTime();
        for (let i=0; i<config.generations; i++) {
          initialPopulation = GA.generateNewPopulation(initialPopulation, domain, mapping, problem.states[0], problem.states[1]);
          let test = GA.getTheFittest(initialPopulation, domain, mapping, problem.states[0], problem.states[1]);
          let collisionsAtEndObject = fitnessFunction.getCountCollisionsAtTheEnd(domain, mapping, test.individual, problem.states[0], problem.states[1]);
          let collisionsAtEnd = collisionsAtEndObject.goalPreconditions;
          let length = collisionsAtEndObject.length;
          if (collisionsAtEnd === 1 && results[p][j][length + 1] === undefined) {
              let end = new Date().getTime();
              results[p][j][length + 1] = {"length": length + 1, "iteration": i, "time": end - start, "path": test.individual, "fitness": test.bestFitness};
          }
          if (i % 10 === 0) {
            GA.cleanLoops(initialPopulation);
          }
          //console.log("----------------------------------------");
          //console.log(test.individual);
          //GA.printFitness(test.individual, domain, mapping, problem.states[0], problem.states[1]);
          //console.log(test.bestFitness);
          //console.log("----------------------------------------");
        }
        let endOfIteration = new Date().getTime();
        times.push(endOfIteration - start);
        let bestPath = Infinity;
        for (let result in results[p][j]) {
          if (results[p][j][result].length < bestPath) {
            bestPath = results[p][j][result].length;
          }
        }
        if (bestPath != Infinity) {
          lengths.push(bestPath);
        }
      }
      console.log("For map 3 by 3 with 1 monster # " + p + ": Average length of " + average(lengths) + " and average time of " + average(times));
      resolve();
    }))
  }
  for (let i = 0; i<1; i++) {
    for (let j = 0; j<1; j++) {
      console.log("Map # " + i + ", iteration # " + j + ": " + JSON.stringify(results[i][j]));
    }
  }
}
runLoader();
