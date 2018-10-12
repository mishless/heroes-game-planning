let config = require("./config.json");
let fitnessFunction = require('./fitness_function.js');
let strips = require('strips');

let fitnesses = {};

// This is how you deep clone in JavaScript :D
const cloneObject = object => JSON.parse(JSON.stringify(object));

let newRandomAction = function(mapping) {
  // generate new random action
  let randomActionKey = randomProperty(mapping.actions);
  let randomAction = mapping.actions[randomActionKey];
  let randomParameterInstances = [];
  for (let parameter in randomAction.parameters) {
    let parameterType = randomAction.parameters[parameter];
    let randomParameterInstanceKey = randomProperty(
      mapping.instances[parameterType]
    );
    randomParameterInstances.push(
      mapping.instances[parameterType][randomParameterInstanceKey]
    );
  }
  return [randomActionKey, randomParameterInstances];
};

let getGeneValidActionFromState = function(domain, state, getValidActions) {
  let validActions = getValidActions(domain, state);
  if (validActions.length > 0) {
    let randomValidAction = Math.floor(Math.random() * validActions.length);
    let randomValidActionParameters = [];
    for (let parameter in validActions[randomValidAction].map) {
      randomValidActionParameters.push(
        validActions[randomValidAction].map[parameter]
      );
    }
    return [validActions[randomValidAction].action, randomValidActionParameters];
  }
  return null;
};

let randomProperty = function(obj) {
  const keys = Object.keys(obj);
  return keys[(keys.length * Math.random()) << 0];
};

let selectBest10 = function(population, domain, mapping, initialState, goalState) {
  let best10 = [];
  let copyOfPopulation = cloneObject(population);

  for (let i = 0; i < 10; i++) {
    let bestIndividual = copyOfPopulation[0];
    let bestFitness = getFitness(bestIndividual, domain, mapping, initialState, goalState);
    for (let i = 1; i < copyOfPopulation.length; i++) {
      const individual = copyOfPopulation[i];
      const fitness = getFitness(individual, domain, mapping, initialState, goalState);

      if (fitness < bestFitness) {
        bestIndividual = individual;
        bestFitness = fitness;
      }
    }
    best10.push(bestIndividual);
    copyOfPopulation.splice(copyOfPopulation.indexOf(bestIndividual), 1);
  }
  return best10;
};


let select = function(population, domain, mapping, initialState, goalState) {
  // select the best individual in a tournament of size N
  const N = config.tournament_size;

  let bestIndividual =
    population[Math.floor(Math.random() * population.length)];
  let bestFitness = getFitness(bestIndividual, domain, mapping, initialState, goalState);

  for (let i = 0; i < N; i++) {
    const individual =
      population[Math.floor(Math.random() * population.length)];
    const fitness = getFitness(individual, domain, mapping, initialState, goalState);

    if (fitness < bestFitness) {
      bestIndividual = individual;
      bestFitness = fitness;
    }
  }
  return bestIndividual;
};

let mutate = function(mapping, chromosome) {
  const growthProb = config.mutation_growth_prob;
  const shrinkProb = config.mutation_shrink_prob;
  const swapProb = config.mutation_swap_prob;
  const replaceProb = config.mutation_replace_prob;
  const paramProb = config.mutation_param_prob;
  // maybe add heuristic mutation?
  if (Math.random() <= growthProb) {
    // generate random index to add action to
    var index = Math.floor(Math.random() * chromosome.length);
    // insert the random action into the chromosome
    chromosome.splice(index, 0, newRandomAction(mapping));
  }

  if (Math.random() <= shrinkProb && chromosome.length > 3) {
    // generate random index to remove action from
    var index = Math.floor(Math.random() * chromosome.length);
    // remove action at specified index
    chromosome.splice(index, 1);
  }

  if (Math.random() <= swapProb) {
    // generate random indices to swap
    const index_1 = Math.floor(Math.random() * chromosome.length);
    const index_2 = Math.floor(Math.random() * chromosome.length);
    // swap the actions
    const action_1 = chromosome[index_1];
    const action_2 = chromosome[index_2];
    chromosome[index_1] = action_2;
    chromosome[index_2] = action_1;
  }

  if (Math.random() <= replaceProb) {
    // generate random index to replace
    var index = Math.floor(Math.random() * chromosome.length);
    // replace the action at index with new random action
    chromosome[index] = newRandomAction(mapping);
  }

  if (Math.random() <= paramProb) {
    // generate random index to mutate
    const actionIndex = Math.floor(Math.random() * chromosome.length);
    // get parameters of action
    const parameterInstances = chromosome[actionIndex][1];
    // generate random index of parameter
    const action = chromosome[actionIndex][0];
    const randomParameter = Math.floor(Math.random() * parameterInstances.length);
    // get a new property of the same type
    const positionalArgument =  Object.keys(mapping.actions[action].parameters)[randomParameter];
    const paramType = mapping.actions[action].parameters[positionalArgument];

    const randomInstance = Math.floor(Math.random() * mapping.instances[paramType].length);
    const newInstance = mapping.instances[paramType][randomInstance];
    // replace the old property with the new property
    chromosome[actionIndex][1][randomParameter] = newInstance;
  }
  return chromosome;
};

let crossover = function(chromosome_1, chromosome_2, domain, mapping, initialState) {
  let copyOfFirstChromosome = cloneObject(chromosome_1);
  let copyOfSecondChromosome = cloneObject(chromosome_2);

  let shorterChromosome = copyOfFirstChromosome.length < copyOfSecondChromosome.length ? copyOfFirstChromosome : copyOfSecondChromosome;
  var index = 0;

  if (Math.random() < config.crossover_from_conflict_prob) {
    //index = fitnessFunction.getSizeBeforeConflict(domain, mapping, shorterChromosome, initialState) - 1;
    index = fitnessFunction.getIndexBestCut(domain, mapping, shorterChromosome, initialState) - 1;
  } else {
    index = Math.floor(Math.random() * shorterChromosome.length);
  }

  const lastPartChromosome1 = copyOfFirstChromosome.splice(index);
  const lastPartChromosome2 = copyOfSecondChromosome.splice(index);
  const newChromosome_1 = copyOfFirstChromosome.concat(lastPartChromosome2);
  const newChromosome_2 = copyOfSecondChromosome.concat(lastPartChromosome1);

  return [newChromosome_1, newChromosome_2];
};

let getFitness = function(chromosome, domain, mapping, initialState, goalState) {
  var chromosomeKey = JSON.stringify(chromosome)
  if (chromosomeKey in fitnesses) {
    var fitness = fitnesses[chromosomeKey];
  } else {
    let numberOfPreconditionsNotSatisfied = fitnessFunction.getNumberOfPreconditionsNotSatisfied(domain, mapping, chromosome, initialState);
    let numberOfInvalidActions = fitnessFunction.getNumberOfInvalidActions(domain, mapping, chromosome, initialState);
    let sizeBeforeConflict = fitnessFunction.getSizeBeforeConflict(domain, mapping, chromosome, initialState);
    let chromosomeSize = fitnessFunction.getChromosozeSize(chromosome);
    let getBestSequenceSize = fitnessFunction.getBestSequenceSize(domain, mapping, chromosome, initialState);
    let collisionsAtEnd = fitnessFunction.getCountCollisionsAtTheEnd(domain, mapping, chromosome, initialState, goalState);
    let differentActions = fitnessFunction.getDifferentActions(domain, mapping, chromosome, initialState);
    // console.log("-----------------------------------------------------------------------")
    // console.log(chromosome);
    // console.log("numberOfPreconditionsNotSatisfied: " + numberOfPreconditionsNotSatisfied);
    // console.log("numberOfInvalidActions: " + numberOfInvalidActions);
    // console.log("sizeBeforeConflict: " + sizeBeforeConflict);
    // console.log("chromosomeSize: " + chromosomeSize);
    // console.log("getBestSequenceSize: " + getBestSequenceSize);
    // console.log("collisionsAtEnd: " + collisionsAtEnd);
    // console.log("differentActions: " + differentActions);
    // console.log("-----------------------------------------------------------------------");
    var fitness = config.conflict_preconditions_pound * numberOfPreconditionsNotSatisfied +
                  config.conflict_actions_pound * numberOfInvalidActions +
                  config.first_conflict_position_pound * sizeBeforeConflict +
                  config.chrom_size_pound * chromosomeSize +
                  config.best_subseq_pound * getBestSequenceSize +
                  config.collision_final_action_pound * collisionsAtEnd+
                  config.different_actions_pound * differentActions;

    fitnesses[chromosomeKey] = fitness;
  }

  return fitness;
};

module.exports = {
  encode: function(domain, problem) {
    let actions = {};
    let instances = {};
    domain.types.forEach(type => {
      instances[type] = [];
    });
    domain.actions.forEach(action => {
      actions[action.action] = { parameters: [], precondition: [] };
      action.parameters.forEach(parameter => {
        actions[action.action].parameters[parameter.parameter] = parameter.type;
      });
      actions[action.action].precondition.push(action.precondition);
    });
    for (let type in domain.values) {
      instances[type] = [];
      domain.values[type].forEach(object => {
        instances[type].push(object);
      });
    }
    return {
      actions: actions,
      instances: instances
    };
  },

  generateIntialPopulation: function(
    domain,
    problem,
    applicableActions,
    mapping,
    chromesomeSize,
    populationSize
  ) {
    let initialState;
    problem.states.forEach(state => {
      if (state.name === "init") {
        initialState = state;
      }
    });
    let population = [];
    let firstGene = getGeneValidActionFromState(
      domain,
      problem.states[0],
      applicableActions
    );
    if (firstGene === null) {
      console.log("There is no valid first action.");
    } else {
      if (!config.generate_only_random_valid_moves) {
        for (let i = 0; i < populationSize; i++) {
          let newChromosome = [];
          newChromosome.push(firstGene);
          for (let j = 1; j < chromesomeSize; j++) {
            let randomActionKey = randomProperty(mapping.actions);
            let randomAction = mapping.actions[randomActionKey];
            let randomParameterInstances = [];
            for (let parameter in randomAction.parameters) {
              let parameterType = randomAction.parameters[parameter];
              let randomParameterInstanceKey = randomProperty(
                mapping.instances[parameterType]
              );
              randomParameterInstances.push(
                mapping.instances[parameterType][randomParameterInstanceKey]
              );
            }
            newChromosome.push([randomActionKey, randomParameterInstances]);
          }
          population.push(newChromosome);
        }
      } else {
        for (let i = 0; i < populationSize; i++) {
          var state = cloneObject(problem.states[0]);
          var action = firstGene[0];
          var parameters = firstGene[1];
          let newChromosome = [];
          newChromosome.push(firstGene);
          for (let j = 1; j < chromesomeSize; j++) {
            const actualParameters = fitnessFunction.getActualParameters(mapping.actions[action].parameters, parameters);
            state = fitnessFunction.updateCurrentState({
               domainActions: domain.actions,
               currentAction: action,
               actualParameters,
               currentState: state
            });
            let newGene = getGeneValidActionFromState(
              domain,
              state,
              applicableActions
            );
            newChromosome.push(newGene);
            action = newGene[0];
            parameters = newGene[1];
          }
          population.push(newChromosome);
        }
      }
    }
    return population;
  },
  generateNewPopulation: function(currentPopulation, domain, mapping, initialState, goalState) {
    const newPopulation = selectBest10(currentPopulation, domain, mapping, initialState, goalState);
    const populationSize = config.population_size;

    //console.log(selectBest10(currentPopulation, domain, mapping, initialState, goalState));

    for (let i = 0; i < (populationSize-10) / 2; i++) {
      var individual_1 = select(currentPopulation, domain, mapping, initialState, goalState);
      var individual_2 = select(currentPopulation, domain, mapping, initialState, goalState);

      if (Math.random() > config.crossover_prob) {
        const children = crossover(individual_1, individual_2, domain, mapping, initialState);
        var child_1 = children[0];
        var child_2 = children[1];
        if (Math.random > config.cross_and_mutate_prob) {
          child_1 = mutate(mapping, child_1);
        }
        if (Math.random > config.cross_and_mutate_prob) {
          child_2 = mutate(mapping, child_2);
        }

        var child_1_fitness = getFitness(child_1, domain, mapping, initialState, goalState);
        var child_2_fitness = getFitness(child_2, domain, mapping, initialState, goalState);
        var parent_1_fitness = getFitness(individual_1, domain, mapping, initialState, goalState);
        var parent_2_fitness = getFitness(individual_2, domain, mapping, initialState, goalState);

        if (child_1_fitness < parent_1_fitness &&
            child_1_fitness < parent_2_fitness &&
            Math.random() < config.elitist_prob) {
          newPopulation.push(child_1);
        } else {
          // the child was worse than both parents so add the better parent
          if (parent_1_fitness < parent_2_fitness) {
            newPopulation.push(individual_1);
          } else {
            newPopulation.push(individual_2);
          }
        }

        if (child_2_fitness < parent_1_fitness &&
            child_2_fitness < parent_2_fitness &&
            Math.random() < config.elitist_prob) {
          newPopulation.push(child_2);
        } else {
          // the child was worse than both parents so add the better parent
          if (parent_1_fitness < parent_2_fitness) {
            newPopulation.push(individual_1);
          } else {
            newPopulation.push(individual_2);
          }
        }

      } else {
        newPopulation.push(mutate(mapping, individual_1));
        newPopulation.push(mutate(mapping, individual_2));
      }
    }
    return newPopulation;
  },
  getTheFittest: function(currentPopulation, domain, mapping, initialState, goalState) {
    let bestFitness = Infinity;
    let individual;
    for (var i = 0; i<currentPopulation.length; i++) {
      let currentFitness = getFitness(currentPopulation[i], domain, mapping, initialState, goalState);
      if (bestFitness > currentFitness) {
        bestFitness = currentFitness;
        individual = currentPopulation[i];
      }
    }
    return {individual, bestFitness};
  }

};
