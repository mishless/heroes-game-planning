var strips = require('strips');
var mapGenerator = require('./map_generator')
var fs = require('fs');
// strips.verbose = true;

// Load the domain and problem.
/*
problem = mapGenerator.generate(5, 5, 4, [1, 1, 1, 1, 1]);
fs.writeFile("./hero_problem.pddl", problem, function(err) {
    if(err) {
        return console.log(err);
    }
});*/

var start = new Date().getTime();
strips.load('../Maps/hero_domain_5_by_5_3_monsters.pddl', '../Maps/hero_problem_5_by_5_3_blocks_3_monsters_1.pddl', function(domain, problem) {
    var solutions = strips.solve(domain, problem, isDepthFirstSearch = true);
    var solution = solutions[0];
    if (solution === undefined){
        console.log("No possible solution for this grid.");
    }
    else{
        console.log('- Solution found in ' + solution.steps + ' steps!');
        for (var i = 0; i < solution.path.length; i++) {
            console.log((i + 1) + '. ' + solution.path[i]);
        }
        var end = new Date().getTime();
        console.log("time (ms): "+(end-start));
    }
});

