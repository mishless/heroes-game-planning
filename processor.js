var strips = require('strips');
var mapGenerator = require('./map_generator')
var GA = require('./ga')
var FF = require('./fitness_function')
var fs = require('fs');
// Load the domain and problem.

problem = mapGenerator.generate(9, 9, 0, [1, 1, 1, 1, 1]);
fs.writeFile("./hero_problem.pddl", problem, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});

strips.load('./hero_domain_final.pddl', './hero_problem.pddl', function(domain, problem) {
    // Get encoding for GA
    let mapping = GA.encode(domain, problem);
    // Generate initial population
    let initialPopulation = GA.generateIntialPopulation(domain, problem, strips.applicableActions, mapping, 10, 10);
    if (initialPopulation.length < 0) {
      console.log("Invalid grid generated -no valid first move.");
    }
	 // for (var i = 0; i < initialPopulation.length; i++){
	 //     var num_conflicts = FF.getNumberOfConflicts(mapping, initialPopulation[i], problem.states[0]);
	 // }
});
