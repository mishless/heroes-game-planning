const strips = require("strips");
const mapGenerator = require("./map_generator");
const GA = require("./ga");
const FF = require("./fitness_function");
const fs = require("fs");
const config = require("./config.json");
// Load the domain and problem.

const PROBLEM = mapGenerator.generate(config.different_quarters_pound, config.different_quarters_pound, 0, [1]);

fs.writeFile("./hero_problem.pddl", PROBLEM, err => {
  if (err) {
    return console.log(err);
  }
  console.log("The file was saved!");
});

strips.load(
  "./hero_domain_easy.pddl",
  "./hero_problem.pddl",
  (domain, problem) => {
    // Get encoding for GA
    var mapping = GA.encode(domain, problem);
    //console.log(mapping.actions['move'].precondition);
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
    for (var i=0; i<initialPopulation.length; i++) {
      if (initialPopulation[i].length !== config.chromosome_size) {
        console.log("ERROR");
      }
    }
    for (let i=0; i<config.generations; i++) {
      console.log("Generation " + i);
      initialPopulation = GA.generateNewPopulation(initialPopulation, domain, mapping, problem.states[0], problem.states[1]);
      let test = GA.getTheFittest(initialPopulation, domain, mapping, problem.states[0], problem.states[1]);
      console.log(test.individual);
    }
  }
);
