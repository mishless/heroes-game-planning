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

let mutate = function(mapping, chromosome) {
  var growthProb = 0.05;
  var shrinkProb = 0.05;
  var swapProb = 0.05;
  var replaceProb = 0.05;
  var paramProb = 0.05;
  // maybe add heuristic mutation?

  if (Math.random() <= growthProb) {
    // generate random index to add action to
    var index = Math.floor((Math.random() * chromosome.length)) + 1;
    // insert the random action into the chromosome
    chromosome.splice(index, 0, newRandomAction(mapping));
  };

  if (Math.random() <= shrinkProb) {
    // generate random index to remove action from
    var index = Math.floor((Math.random() * chromosome.length)) + 1;
    // remove action at specified index
    chromosome.splice(index, 1);
  };

  if (Math.random() <= swapProb) {
    // generate random indices to swap
    var index_1 = Math.floor((Math.random() * chromosome.length)) + 1;
    var index_2 = Math.floor((Math.random() * chromosome.length)) + 1;
    // swap the actions
    var action_1 = chromosome[index_1];
    var action_2 = chromosome[index_2];
    chromosome[index_1] = action_2;
    chromosome[index_2] = action_1;
  };

  if (Math.random() <= replaceProb) {
    // generate random index to replace
    var index = Math.floor((Math.random() * chromosome.length)) + 1;
    // replace the action at index with new random action
    chromosome[index] = newRandomAction(mapping);
  };

  if (Math.random() <= paramProb) {
    // generate random index to mutate
    var actionIndex = Math.floor((Math.random() * chromosome.length)) + 1;
    // get parameters of action
    var parameterInstances = chromosome[index][1]
    // generate random index of parameter
    var paramIndex = Math.floor((Math.random() * parameterInstances.length)) + 1;
    // get a new property of the same type
    var paramType = mapping[chromosome[index][0]].parameters[paramIndex];
    var newProperty = randomProperty(mapping.instances[paramType]);
    // replace the old property with the new property
    chromosome[index][1][paramIndex] = newProperty;
  };

  return chromosome;
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
      actions[action.action] = {'parameters': []};
      action.parameters.forEach(function(parameter) {
         actions[action.action].parameters.push(parameter.type);
      });
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
  generateIntialPopulation: function (mapping, chromesomeSize, populationSize) {
    let population = [];
    for (let i=0; i<populationSize; i++) {
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
    return population;
  }
};
