const strips = require('strips');
const mapGenerator = require('./map_generator');
const fs = require('fs');
// Load the domain and problem.

const a = [1, 2, 3, 4]
const [b, c] = a;
let problem = mapGenerator.generate(5, 6, 9, [1, 2]);
fs.writeFile("./hero_problem.pddl", problem, err => {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});

strips.load('./hero_domain_final.pddl', './hero_problem.pddl', (domain, problem) => {
    // Run the problem against the domain, using depth-first-search.
    const solutions = strips.solve(domain, problem, cost);
    // Display each solution.
    for (let i in solutions) {
        const solution = solutions[i];
        console.log(`- Solution found in ${solution.steps} steps!`);
        for (let j = 0; j < solution.path.length; j++) {
            console.log(`${j + 1}. ${solution.path[j]}`);
        }
    }
});

function cost(state) {
  let cost = 100;
  for (let i in state.actions) {
    const action = state.actions[i].action;

    if (action === "has-castle") {
      cost -= 20;
    } else if (action.indexOf("has-") !== -1) {
      cost -= 10;
    }
  }
  return cost;
}
