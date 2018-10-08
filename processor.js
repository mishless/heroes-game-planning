var strips = require('strips');
var mapGenerator = require('./map_generator')
var fs = require('fs');
// Load the domain and problem.

problem = mapGenerator.generate(5, 6, 2, [1]);
fs.writeFile("./hero_problem.pddl", problem, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});

strips.load('./hero_domain_final.pddl', './hero_problem.pddl', function(domain, problem) {
    // Run the problem against the domain, using depth-first-search.
    var solutions = strips.solve(domain, problem, isDepthFirstSearch = false);
    // Display each solution.
    for (var i in solutions) {
        var solution = solutions[i];
        console.log('- Solution found in ' + solution.steps + ' steps!');
        for (var i = 0; i < solution.path.length; i++) {
            console.log((i + 1) + '. ' + solution.path[i]);
        }
    }
});
