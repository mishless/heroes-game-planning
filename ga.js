let config = require("./config.json");

let newRandomAction = function(mapping) {
  // generate new random action
  let randomActionKey = randomProperty(mapping.actions);
  let randomAction = mapping.actions[randomActionKey];
  let randomParameterInstances = []
  randomAction.parameters.forEach(function(parameterType) {
    let randomParameterInstanceKey = randomProperty(mapping.instances[parameterType]);
    randomParameterInstances.push(mapping.instances[parameterType][randomParameterInstanceKey]);
  });

  return [randomActionKey, randomParameterInstances];
};

let getChromosomeValidActionFromState = function(domain, state, getValidActions) {
  let validActions = getValidActions(domain, state);
  if (validActions.length > 0) {
    let randomValidAction = Math.floor((Math.random() * validActions.length));
    let randomValidActionParameters = [];
    for (parameter in validActions[randomValidAction].map) {
      randomValidActionParameters.push(validActions[randomValidAction].map[parameter]);
    }
    return [validActions[randomValidAction].action, randomValidActionParameters];
  }
  return null;
};

let randomProperty = function(obj) {
    var keys = Object.keys(obj)
    return keys[keys.length * Math.random() << 0];
};

module.exports = {
  encode: function(domain, problem) {
    actions = {};
    instances = {};
    domain.types.forEach(function(type) {
      instances[type] = [];
    });
    domain.actions.forEach(function(action) {
      actions[action.action] = {'parameters': [], 'precondition': []};
      action.parameters.forEach(function(parameter) {
         actions[action.action].parameters.push(parameter.type);
      });
      actions[action.action].precondition.push(action.precondition);
    });
    for (type in domain.values) {
      instances[type] = [];
      domain.values[type].forEach(function(object) {
        instances[type].push(object);
      });
    };
    return {
      'actions': actions,
      'instances': instances
    }
  },

  generateIntialPopulation: function (domain, problem, applicableActions, mapping, chromesomeSize, populationSize) {
    let initialState;
    problem.states.forEach(function(state) {
      if (state.name === 'init') {
        initialState = state;
      }
    });
    let population = [];
    let firstChromosome = getChromosomeValidActionFromState(domain, problem.states[0], applicableActions);
    if (firstChromosome === null) {
      console.log("There is no valid first action.");
    } else {
      population.push(firstChromosome);
      for (let i=1; i<populationSize; i++) {
        let newChromosome = [];
        for (let j=0; j<chromesomeSize; j++) {
          let randomActionKey = randomProperty(mapping.actions);
          let randomAction = mapping.actions[randomActionKey];
          let randomParameterInstances = []
          randomAction.parameters.forEach(function(parameterType) {
            let randomParameterInstanceKey = randomProperty(mapping.instances[parameterType]);
            randomParameterInstances.push(mapping.instances[parameterType][randomParameterInstanceKey]);
          });
          newChromosome.push([randomActionKey, randomParameterInstances]);
        }
        population.push(newChromosome);
      }
    }
    return population;
  },

  mutate: function(mapping, chromosome) {
    var growthProb = config.mutation_growth_prob;
    var shrinkProb = config.mutation_shrink_prob;
    var swapProb = config.mutation_swap_prob;
    var replaceProb = config.mutation_replace_prob;
    var paramProb = config.mutation_param_prob;
    // maybe add heuristic mutation?
    if (Math.random() <= growthProb) {
      // generate random index to add action to
      var index = Math.floor((Math.random() * chromosome.length));
      // insert the random action into the chromosome
      chromosome.splice(index, 0, newRandomAction(mapping));
    };

    if (Math.random() <= shrinkProb) {
      // generate random index to remove action from
      var index = Math.floor((Math.random() * chromosome.length));
      // remove action at specified index
      chromosome.splice(index, 1);
    };

    if (Math.random() <= swapProb) {
      // generate random indices to swap
      var index_1 = Math.floor((Math.random() * chromosome.length));
      var index_2 = Math.floor((Math.random() * chromosome.length));
      // swap the actions
      var action_1 = chromosome[index_1];
      var action_2 = chromosome[index_2];
      chromosome[index_1] = action_2;
      chromosome[index_2] = action_1;
    };

    if (Math.random() <= replaceProb) {
      // generate random index to replace
      var index = Math.floor((Math.random() * chromosome.length));
      // replace the action at index with new random action
      chromosome[index] = newRandomAction(mapping);
    };

    if (Math.random() <= paramProb) {
      // generate random index to mutate
      var actionIndex = Math.floor((Math.random() * chromosome.length));
      // get parameters of action
      var parameterInstances = chromosome[index][1]
      // generate random index of parameter
      var paramIndex = Math.floor((Math.random() * parameterInstances.length));
      // get a new property of the same type
      var paramType = mapping[chromosome[index][0]].parameters[paramIndex];
      var newProperty = randomProperty(mapping.instances[paramType]);
      // replace the old property with the new property
      chromosome[index][1][paramIndex] = newProperty;
    };

    return chromosome;
  },

  crossover: function(chromosome_1, chromosome_2) {
  // currently does crossover randomly, not from an invalid move
  var idx_1 = Math.floor((Math.random() * chromosome_1.length));
  var idx_2 = Math.floor((Math.random() * chromosome_2.length));

  var newChromosome_1 = chromosome_1.splice(idx_1, chromosome_1.length).concat(chromosome_2.splice(0, idx_2));
  var newChromosome_2 = chromosome_2.splice(idx_2, chromosome_2.length).concat(chromosome_1.splice(0, idx_1));

  return [newChromosome_1, newChromosome_2];
  },

  select: function(population) {
    // select the best individual in a tournament of size N
    var N = config.tournament_size;

    var bestIndividual = population[Math.floor((Math.random() * population.length))];
    var bestFitness = getFitness(bestIndividual);

    for (var i = 0; i < N; i++) {
      var individual = population[Math.floor((Math.random() * population.length))];
      var fitness = getFitness(individual);

      if (fitness > bestFitness) {
        bestIndividual = individual;
      }
    }
    return bestIndividual;
  },

  generateNewPopulation: function(currentPopulation) {
    var newPopulation = [];
    var populationSize = config.population_size;

    for (var i = 0; i < (populationSize / 2); i++) {
      var individual_1 = select(currentPopulation);
      var individual_2 = select(currentPopulation);

      if (Math.random() > config.crossover_prob) {
        var children = crossover(individual_1, individual_2);
        var child_1 = mutate(children[0]);
        var child_2 = mutate(children[1]);

        newPopulation.push(child_1);
        newPopulation.push(child_2);

      } else {
        newPopulation.push(mutate(individual_1));
        newPopulation.push(mutate(individual_2));
      }
    }
    return newPopulation;
  },

  getFitness: function(chromosome) {
    // placeholder
    return Math.random();
  }
};
