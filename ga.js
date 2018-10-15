let config = require("./config.json");
let fitnessFunction = require('./fitness_function.js');
let strips = require('strips');
const seedrandom = require('seedrandom');
const rng = seedrandom();

let fitnesses = {};
var firstConflict = {};

// This is how you deep clone in JavaScript
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

let newRandomValidAction = function(domain, mapping, chromosome, initialState) {
  var state = cloneObject(initialState);
  var action;
  var parameters;
  for (let j = 0; j < chromosome.length; j++) {
    let newGene = getGeneValidActionFromState(
      domain,
      state,
      strips.applicableActions
    );
    action = newGene[0];
    parameters = newGene[1];
    const actualParameters = fitnessFunction.getActualParameters(mapping.actions[action].parameters, parameters);
    state = fitnessFunction.updateCurrentState({
       domainActions: domain.actions,
       currentAction: action,
       actualParameters,
       currentState: state
    });
  }
  let newGene = getGeneValidActionFromState(
    domain,
    state,
    strips.applicableActions
  );
  action = newGene[0];
  parameters = newGene[1];
  return [action, parameters];
};

let cleanLoops = function(generation) {
  let lastGene
  let restart;
  do {
    restart = false;
    loop1:
      for (var j = 0; j<generation.length; j++) {
        let chromosome = generation[j];
        let wasLastMove = false;
        let lastMoveEnd = undefined;
        let stack = [];
        for (var i = 0; i < chromosome.length; i++) {
          if (chromosome[i][0] === 'move') {
            if (!wasLastMove) {
              wasLastMove = true;
              lastMoveEnd = chromosome[i][1][2];
              stack.push(chromosome[i][1][1]);
            } else {
              // last actions was move....
              if (lastMoveEnd === chromosome[i][1][1]) {
                stack.push(chromosome[i][1][1]);
                let index = stack.indexOf(chromosome[i][1][2]);
                if (index >= 0) {
                  chromosome.splice(i - stack.length + index + 1, stack.length - index);
                  restart = true;
                  break loop1;
                }
              } else {
                stack = []
              }
              lastMoveEnd = chromosome[i][1][2];
            }
          } else {
            wasLastMove = false;
            lastMoveEnd = undefined;
            stack = []
          }
        }
      }
  } while(restart === true);
};

let getGeneValidActionFromState = function(domain, state, getValidActions) {
  let validActions = getValidActions(domain, state);
  if (validActions.length > 0) {
    let randomValidAction = Math.floor(rng() * validActions.length);
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
  return keys[(keys.length * rng()) << 0];
};

let selectBest = function(population, domain, mapping, initialState, goalState) {
  let best = [];
  let copyOfPopulation = cloneObject(population);

  for (let i = 0; i < config.select_best_chromosomes; i++) {
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
    best.push(bestIndividual);
    copyOfPopulation.splice(copyOfPopulation.indexOf(bestIndividual), 1);
  }
  return best;
};


let select = function(population, domain, mapping, initialState, goalState) {
  // select the best individual in a tournament of size N
  const N = config.tournament_size;

  let bestIndividual =
    population[Math.floor(rng() * population.length)];
  let bestFitness = getFitness(bestIndividual, domain, mapping, initialState, goalState);

  for (let i = 0; i < N; i++) {
    const individual =
      population[Math.floor(rng() * population.length)];
    const fitness = getFitness(individual, domain, mapping, initialState, goalState);

    if (fitness < bestFitness) {
      bestIndividual = individual;
      bestFitness = fitness;
    }
  }
  return bestIndividual;
};

let mutate = function(mapping, chromosome, domain, initialState, goalState) {
  const growthProb = config.mutation_growth_prob;
  const shrinkProb = config.mutation_shrink_prob;
  const swapProb = config.mutation_swap_prob;
  const replaceProb = config.mutation_replace_prob;
  const paramProb = config.mutation_param_prob;
  // maybe add heuristic mutation?
  if (rng() <= growthProb) {
    // generate random index to add action to
    var index;
    let sizeBeforeConflict;
    let chromosomeKey = JSON.stringify(chromosome);
    if (chromosomeKey in firstConflict) {
      sizeBeforeConflict = firstConflict[chromosomeKey];
    } else {
      firstConflict[chromosomeKey]= fitnessFunction.getSizeBeforeConflict(domain, mapping, chromosome, initialState);
      sizeBeforeConflict = firstConflict[chromosomeKey];
    }
    let newAction = 0;
    if (rng() < config.mutate_from_conflict_prob && sizeBeforeConflict < chromosome.length) {
      index = sizeBeforeConflict;
      if (rng() < config.generate_random_valid_move) {
        var copyOfChromosome = cloneObject(chromosome);
        copyOfChromosome.splice(index);
        newAction = newRandomValidAction(domain, mapping, copyOfChromosome, initialState);
      } else {
        newAction = newRandomAction(mapping);
      }
    } else {
      index = Math.floor(rng() * chromosome.length);
      newAction = newRandomAction(mapping);
    }
    // insert the random action into the chromosome
    let copyOfChromosome = cloneObject(chromosome);
    copyOfChromosome.splice(index, 0, newAction);

    let copyOfChromosomeFitness;
    let chromosomeFitness;
    let copyOfChromosomeKey = JSON.stringify(chromosome);
    chromosomeKey = JSON.stringify(chromosome);
    if (copyOfChromosomeKey in fitnesses) {
        copyOfChromosomeFitness = fitnesses[copyOfChromosomeKey];
    } else {
      copyOfChromosomeFitness= getFitness(copyOfChromosome, domain, mapping, initialState, goalState);
      fitnesses[copyOfChromosomeKey] = copyOfChromosomeFitness;
    }
    if (chromosomeKey in fitnesses) {
        chromosomeFitness = fitnesses[chromosomeKey];
    } else {
      chromosomeFitness= getFitness(chromosome, domain, mapping, initialState, goalState);
      fitnesses[chromosomeKey] = chromosomeFitness;
    }
    // if the mutated individual is worse than the partent with elisitst probability keep the parent
    if (copyOfChromosomeFitness < chromosomeFitness) {
      chromosome = copyOfChromosome;
    } else {
      if (rng() > config.elitist_mutate_prob) {
        chromosome = copyOfChromosome;
      }
    }
  }

  if (rng() <= shrinkProb && chromosome.length > 3) {
    // generate random index to remove action from
    var index;
    let sizeBeforeConflict;
    let chromosomeKey = JSON.stringify(chromosome);
    if (chromosomeKey in firstConflict) {
      sizeBeforeConflict = firstConflict[chromosomeKey];
    } else {
      firstConflict[chromosomeKey]= fitnessFunction.getSizeBeforeConflict(domain, mapping, chromosome, initialState);
      sizeBeforeConflict = firstConflict[chromosomeKey];
    }
    if (rng() < config.mutate_from_conflict_prob && sizeBeforeConflict < chromosome.length) {
      index = sizeBeforeConflict;
    } else {
      index = Math.floor(rng() * chromosome.length);
    }
    // remove action at specified index
    let copyOfChromosome = cloneObject(chromosome);
    copyOfChromosome.splice(index, 1);
    let childChromosomeFitness;
    let parentFitness;
    let key = JSON.stringify(copyOfChromosome);
    chromosomeKey = JSON.stringify(chromosome);
    if (key in fitnesses) {
      childChromosomeFitness = fitnesses[key];
    } else {
      childChromosomeFitness = getFitness(copyOfChromosome, domain, mapping, initialState, goalState);
      fitnesses[key] = childChromosomeFitness;
    }
    if (chromosomeKey in fitnesses) {
      parentFitness = fitnesses[chromosomeKey];
    } else {
      parentFitness = getFitness(chromosome, domain, mapping, initialState, goalState);
      fitnesses[chromosomeKey] = parentFitness;
    }
    if (childChromosomeFitness < parentFitness) {
      chromosome = copyOfChromosome;
    } else {
      if (rng() > config.elitist_mutate_prob) {
        chromosome = copyOfChromosome;
      }
    }
  }

  if (rng() <= swapProb) {
    // generate random indices to swap
    var index_1;
    let sizeBeforeConflict;
    let chromosomeKey = JSON.stringify(chromosome);
    if (chromosomeKey in firstConflict) {
      sizeBeforeConflict = firstConflict[chromosomeKey];
    } else {
      firstConflict[chromosomeKey]= fitnessFunction.getSizeBeforeConflict(domain, mapping, chromosome, initialState);
      sizeBeforeConflict = firstConflict[chromosomeKey];
    }
    if (rng() < config.mutate_from_conflict_prob && sizeBeforeConflict < chromosome.length) {
      index_1 = sizeBeforeConflict;
    } else {
      index_1 = Math.floor(rng() * chromosome.length);
    }
    const index_2 = Math.floor(rng() * chromosome.length);
    // swap the actions
    const action_1 = chromosome[index_1];
    const action_2 = chromosome[index_2];
    chromosome[index_1] = action_2;
    chromosome[index_2] = action_1;
  }

  if (rng() <= replaceProb) {
    // generate random index to replace
    var index;
    let sizeBeforeConflict;
    let chromosomeKey = JSON.stringify(chromosome);
    if (chromosomeKey in firstConflict) {
      sizeBeforeConflict = firstConflict[chromosomeKey];
    } else {
      firstConflict[chromosomeKey]= fitnessFunction.getSizeBeforeConflict(domain, mapping, chromosome, initialState);
      sizeBeforeConflict = firstConflict[chromosomeKey];
    }
    let newAction;
    if (rng() < config.mutate_from_conflict_prob && sizeBeforeConflict < chromosome.length) {
      index = sizeBeforeConflict;
      if (rng() < config.generate_random_valid_move) {
        var copyOfChromosome = cloneObject(chromosome);
        copyOfChromosome.splice(index);
        newAction = newRandomValidAction(domain, mapping, copyOfChromosome, initialState);
      } else {
        newAction = newRandomAction(mapping);
      }
    } else {
      index = Math.floor(rng() * chromosome.length);
      newAction = newRandomAction(mapping);
    }
    chromosome[index] = newAction;
  }

  if (rng() <= paramProb) {
    // generate random index to mutate
    let actionIndex;
    let sizeBeforeConflict;
    let chromosomeKey = JSON.stringify(chromosome);
    if (chromosomeKey in firstConflict) {
      sizeBeforeConflict = firstConflict[chromosomeKey];
    } else {
      firstConflict[chromosomeKey]= fitnessFunction.getSizeBeforeConflict(domain, mapping, chromosome, initialState);
      sizeBeforeConflict = firstConflict[chromosomeKey];
    }
    if (rng() < config.mutate_from_conflict_prob && sizeBeforeConflict < chromosome.length) {
      actionIndex = sizeBeforeConflict;
    } else {
      actionIndex = Math.floor(rng() * chromosome.length);
    }
    //console.log(chromosome.length);
    do {
      // get parameters of action
      const parameterInstances = chromosome[actionIndex][1];
      // generate random index of parameter
      const action = chromosome[actionIndex][0];
      const randomParameter = Math.floor(rng() * parameterInstances.length);
      // get a new property of the same type
      const positionalArgument =  Object.keys(mapping.actions[action].parameters)[randomParameter];
      const paramType = mapping.actions[action].parameters[positionalArgument];

      const randomInstance = Math.floor(rng() * mapping.instances[paramType].length);
      const newInstance = mapping.instances[paramType][randomInstance];
      // replace the old property with the new property
      chromosome[actionIndex][1][randomParameter] = newInstance;
    } while (rng() < config.mutate_more_than_one_parameter)
  }
  return chromosome;
};

let crossover = function(chromosome_1, chromosome_2, domain, mapping, initialState) {
  let copyOfFirstChromosome = cloneObject(chromosome_1);
  let copyOfSecondChromosome = cloneObject(chromosome_2);

  let shorterChromosome = copyOfFirstChromosome.length < copyOfSecondChromosome.length ? copyOfFirstChromosome : copyOfSecondChromosome;
  var index = 0;

  if (rng() < config.crossover_from_conflict_prob) {
    index = fitnessFunction.getIndexBestCut(domain, mapping, shorterChromosome, initialState) - 1;
  } else {
    index = Math.floor(rng() * shorterChromosome.length);
  }

  const lastPartChromosome1 = copyOfFirstChromosome.splice(index);
  const lastPartChromosome2 = copyOfSecondChromosome.splice(index);
  const newChromosome_1 = copyOfFirstChromosome.concat(lastPartChromosome2);
  const newChromosome_2 = copyOfSecondChromosome.concat(lastPartChromosome1);

  return [newChromosome_1, newChromosome_2];
};

let getFitness = function(chromosome, domain, mapping, initialState, goalState) {
  var chromosomeKey = JSON.stringify(chromosome);
  if (chromosomeKey in fitnesses) {
    var fitness = fitnesses[chromosomeKey];
  } else {
    let result = fitnessFunction.getNumberOfPreconditionsNotSatisfied(domain, mapping, chromosome, initialState);
    let numberOfPreconditionsNotSatisfied = result.preconditions;
    let numberOfInvalidActions = result.actions;
    let sizeBeforeConflict;
    if (chromosomeKey in firstConflict) {
      sizeBeforeConflict = firstConflict[chromosomeKey];
    } else {
      firstConflict[chromosomeKey]= fitnessFunction.getSizeBeforeConflict(domain, mapping, chromosome, initialState);
      sizeBeforeConflict = firstConflict[chromosomeKey];
    }
    let chromosomeSize = fitnessFunction.getChromosozeSize(chromosome, config.maximum_size_that_will_be_considered_in_pound);
    let getBestSequenceSize = 0;
    if (config.best_subseq_pound > 0) {
      getBestSequenceSize = fitnessFunction.getBestSequenceSize(domain, mapping, chromosome, initialState);
    }
    let collisionsAtEnd = 0;
    if (numberOfInvalidActions == 0) {
      collisionsAtEnd = fitnessFunction.getCountCollisionsAtTheEnd(domain, mapping, chromosome, initialState, goalState);
    }
    let differentActions = fitnessFunction.getDifferentActions(domain, mapping, chromosome, initialState);
    let sameMoves = 0;
    if (config.repeating_actions_pound > 0) {
        sameMoves = fitnessFunction.countSameMoves(chromosome);
    }
    let differentQuarters = 0;
    if (config.different_quarters_pound > 0) {
        differentQuarters = fitnessFunction.getDifferentQuarters(chromosome);
    }
    let maxTimeQuarter = 0;
    if (config.max_time_quarters_pound > 0) {
        maxTimeQuarter = fitnessFunction.getMaxTimesQuarter(chromosome);
    }
    var fitness = config.conflict_preconditions_pound * numberOfPreconditionsNotSatisfied +
                  config.conflict_actions_pound * numberOfInvalidActions +
                  config.first_conflict_position_pound * sizeBeforeConflict +
                  config.chrom_size_pound * chromosomeSize +
                  config.best_subseq_pound * getBestSequenceSize +
                  config.collision_final_action_pound * collisionsAtEnd+
                  config.different_actions_pound * differentActions +
                  config.repeating_actions_pound * sameMoves +
                  config.different_quarters_pound * differentQuarters+
                  config.max_time_quarters_pound * maxTimeQuarter;
    fitnesses[chromosomeKey] = fitness;
  }
  return fitness;
};

let getFitnessValue = function(chromosome, domain, mapping, initialState, goalState) {
  var chromosomeKey = JSON.stringify(chromosome);
  if (chromosomeKey in fitnesses) {
    var fitness = fitnesses[chromosomeKey];
  }
  return fitness;
};

let printFitness = function(chromosome, domain, mapping, initialState, goalState) {
    var chromosomeKey = JSON.stringify(chromosome);

      let result = fitnessFunction.getNumberOfPreconditionsNotSatisfied(domain, mapping, chromosome, initialState);
      let numberOfPreconditionsNotSatisfied = result.preconditions;
      let numberOfInvalidActions = result.actions;
      let sizeBeforeConflict;
      if (chromosomeKey in firstConflict) {
        sizeBeforeConflict = firstConflict[chromosomeKey];
      } else {
        firstConflict[chromosomeKey]= fitnessFunction.getSizeBeforeConflict(domain, mapping, chromosome, initialState);
        sizeBeforeConflict = firstConflict[chromosomeKey];
      }
      let chromosomeSize = fitnessFunction.getChromosozeSize(chromosome, config.maximum_size_that_will_be_considered_in_pound);
      let getBestSequenceSize = 0;
      if (config.best_subseq_pound > 0) {
        getBestSequenceSize = fitnessFunction.getBestSequenceSize(domain, mapping, chromosome, initialState);
      }
      let collisionsAtEnd = 0;
      if (numberOfInvalidActions == 0) {
        collisionsAtEnd = fitnessFunction.getCountCollisionsAtTheEnd(domain, mapping, chromosome, initialState, goalState);
      }
      let differentActions = fitnessFunction.getDifferentActions(domain, mapping, chromosome, initialState);
      let sameMoves = 0;
      if (config.repeating_actions_pound > 0) {
          sameMoves = fitnessFunction.countSameMoves(chromosome);
      }
      let differentQuarters = 0;
      if (config.different_quarters_pound > 0) {
          differentQuarters = fitnessFunction.getDifferentQuarters(chromosome);
      }
      let maxTimeQuarter = 0;
      if (config.max_time_quarters_pound > 0) {
          maxTimeQuarter = fitnessFunction.getMaxTimesQuarter(chromosome);
      }
      var fitness = config.conflict_preconditions_pound * numberOfPreconditionsNotSatisfied +
                    config.conflict_actions_pound * numberOfInvalidActions +
                    config.first_conflict_position_pound * sizeBeforeConflict +
                    config.chrom_size_pound * chromosomeSize +
                    config.best_subseq_pound * getBestSequenceSize +
                    config.collision_final_action_pound * collisionsAtEnd+
                    config.different_actions_pound * differentActions +
                    config.repeating_actions_pound * sameMoves +
                    config.different_quarters_pound * differentQuarters+
                    config.max_time_quarters_pound * maxTimeQuarter;
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
    const newPopulation = selectBest(currentPopulation, domain, mapping, initialState, goalState);
    const populationSize = config.population_size;
    for (let i = 0; i < (populationSize - config.select_best_chromosomes) / 2; i++) {
      var individual_1 = cloneObject(select(currentPopulation, domain, mapping, initialState, goalState));
      var individual_2 = cloneObject(select(currentPopulation, domain, mapping, initialState, goalState));

      if (rng() > config.crossover_prob) {
        const children = crossover(individual_1, individual_2, domain, mapping, initialState);
        var child_1 = children[0];
        var child_2 = children[1];
        if (Math.random > config.cross_and_mutate_prob) {
          child_1 = mutate(mapping, child_1, domain, initialState, goalState);
        }
        if (Math.random > config.cross_and_mutate_prob) {
          child_2 = mutate(mapping, child_2, domain, initialState, goalState);
        }
        let child_1_fitness;
        let child_2_fitness;
        let parent_1_fitness;
        let parent_2_fitness;
        let child_1_key = JSON.stringify(child_1);
        let child_2_key = JSON.stringify(child_2);
        let parent_1_key = JSON.stringify(individual_1);
        let parent_2_key = JSON.stringify(individual_2);
        if (child_1_key in fitnesses) {
          child_1_fitness = fitnesses[child_1_key];
        } else {
          child_1_fitness = getFitness(child_1, domain, mapping, initialState, goalState);
          fitnesses[child_1_key] = child_1_fitness;
        }
        if (child_2_key in fitnesses) {
          child_2_fitness = fitnesses[child_2_key];
        } else {
          child_2_fitness = getFitness(child_2, domain, mapping, initialState, goalState);
          fitnesses[child_2_key] = child_2_fitness;
        }
        if (parent_1_key in fitnesses) {
          parent_1_fitness = fitnesses[parent_1_key];
        } else {
          parent_1_fitness = getFitness(individual_1, domain, mapping, initialState, goalState);
          fitnesses[parent_1_key] = parent_1_fitness;
        }
        if (parent_2_key in fitnesses) {
          parent_2_fitness = fitnesses[parent_2_key];
        } else {
          parent_2_fitness = getFitness(individual_2, domain, mapping, initialState, goalState);
          fitnesses[parent_2_key] = parent_2_fitness;
        }

        if (child_1_fitness < parent_1_fitness &&
            child_1_fitness < parent_2_fitness) {
            newPopulation.push(child_1);
        } else {
          // the child was worse than both parents so add the better parent
          if (rng() < config.elitist_prob) {
            if (parent_1_fitness < parent_2_fitness) {
              newPopulation.push(individual_1);
            } else {
              newPopulation.push(individual_2);
            }
          } else {
            newPopulation.push(child_1);
          }
        }

        if (child_2_fitness < parent_1_fitness &&
            child_2_fitness < parent_2_fitness) {
          newPopulation.push(child_2);
        } else {
          // the child was worse than both parents so add the better parent
          if (rng() < config.elitist_prob) {
            if (parent_1_fitness < parent_2_fitness) {
              newPopulation.push(individual_1);
            } else {
              newPopulation.push(individual_2);
            }
          } else {
            newPopulation.push(child_2);
          }
        }

      } else {
        newPopulation.push(mutate(mapping, individual_1, domain, initialState, goalState));
        newPopulation.push(mutate(mapping, individual_2, domain, initialState, goalState));
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
  },
  getTheWorst: function(currentPopulation, domain, mapping, initialState, goalState) {
    let worstFitness = -Infinity;
    let individual;
    for (var i = 0; i<currentPopulation.length; i++) {
      let currentFitness = getFitness(currentPopulation[i], domain, mapping, initialState, goalState);
      if (worstFitness < currentFitness) {
        worstFitness = currentFitness;
        individual = currentPopulation[i];
      }
    }
    return {individual, worstFitness};
  },
  printFitness: function(chromosome, domain, mapping, initialState, goalState) {
    printFitness(chromosome, domain, mapping, initialState, goalState);
  },
  cleanLoops: function(generation) {
    cleanLoops(generation);
  }
};
