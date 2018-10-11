const strips = require("strips");
const mapGenerator = require("./map_generator");
const GA = require("./ga");
const FF = require("./fitness_function");
const fs = require("fs");
// Load the domain and problem.

const PROBLEM = mapGenerator.generate(9, 9, 0, [1, 1, 1, 1, 1]);

fs.writeFile("./hero_problem.pddl", PROBLEM, err => {
  if (err) {
    return console.log(err);
  }
  console.log("The file was saved!");
});

strips.load(
  "./hero_domain_final.pddl",
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
      10,
      10
    );
    if (initialPopulation.length < 0) {
      console.log("Invalid grid generated - no valid first move.");
    }
    //for (var i = 0; i < initialPopulation.length; i++){
    console.log(initialPopulation[0]);
    const num_conflicts = FF.getNumberOfPreconditionsNotSatisfied(
      domain,
      mapping,
      initialPopulation[0],
      problem.states[0]
    );
    FF.getNumberOfInvalidActions(
      domain,
      mapping,
      initialPopulation[0],
      problem.states[0]
    );
    FF.getSizeBeforeConflict(
      domain,
      mapping,
      initialPopulation[0],
      problem.states[0]
    );
    FF.getBestSequenceSize(
      domain,
      mapping,
      initialPopulation[0],
      problem.states[0]
    );

    //}
  }
);
