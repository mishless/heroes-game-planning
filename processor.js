var strips = require('strips');
var mapGenerator = require('./map_generator')
var GA = require('./ga')
var fs = require('fs');
// Load the domain and problem.

problem = mapGenerator.generate(10, 10, 1, [1, 1, 1, 1, 1]);
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
    let initialPopulation = GA.generateIntialPopulation(mapping, 10, 10);
    console.log(initialPopulation[0]);
});