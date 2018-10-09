module.exports = {
  encode: function(domain, problem) {
    types = {};
    actions = {};
    instances = {};
    let i = 0;
    domain.types.forEach(function(type) {
      types[type] = i++;
      instances[types[type]] = [];
    });
    i = 0;
    domain.actions.forEach(function(action) {
      actions[action.action] = {'id': i++, 'parameters': []};
      action.parameters.forEach(function(parameter) {
         actions[action.action].parameters.push(types[parameter.type]);
      });
    });
    i = 0;
    for (type in domain.values) {
      domain.values[type].forEach(function(object) {
        instances[types[type]][object] = i++;
      });
    };
    return {
      'types': types,
      'actions': actions,
      'instances': instances
    }
  },
  generateIntialPopulation: function (mapping, chromesomeSize, populationSize) {
    let population = [];
    for (let i=0; i<populationSize; i++) {
      let newChromosome = [];
      for (let j=0; j<chromesomeSize; j++) {
        let randomActionIndex = Math.floor(Math.random() * Object.keys(mapping.actions).length);
        let randomAction = mapping.actions[Object.keys(mapping.actions)[randomActionIndex]];
        let randomParameterInstances = []
        randomAction.parameters.forEach(function(parameterType) {
          let randomParameterInstanceIndex = Math.floor(Math.random() * Object.keys(mapping.instances[parameterType]).length);
          randomParameterInstances.push(mapping.instances[parameterType][Object.keys(mapping.instances[parameterType])[randomParameterInstanceIndex]]);
        });
        newChromosome.push([randomAction.id, randomParameterInstances]);
      }
      population.push(newChromosome);
    }
    return population;
  }
};
