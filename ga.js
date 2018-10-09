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
