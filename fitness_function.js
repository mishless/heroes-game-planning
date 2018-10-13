const strips = require("strips");
const R = require("ramda");

// This is how you deep clone in JavaScript :D
const cloneObject = object => JSON.parse(JSON.stringify(object));

let getGoalPreconditions = function(state, goalState) {
    // Returns true if the state contains the goal conditions.
    let goalPreconditions = 0;
    for (var i in goalState.actions) {
        var goalAction = goalState.actions[i];
        var operation = goalAction.operation || 'and';
        if (operation == 'and') {
            // Make sure this action exists in the state.
            for (var j in state.actions) {
                if (StripsManager.isEqual(state.actions[j], goalAction)) {
                    goalPreconditions++;
                    break;
                }
            }
        } else {
            // Make sure this action does not exist in the state.
            for (var j in state.actions) {
                if (StripsManager.isEqual(state.actions[j], goalAction)) {
                    // This is our target, so it fails the goal test.
                    goalPreconditions++;
                    break;
                }
            }
        }
    }
    // if (goalPreconditions != 0) {
    //   console.log("GOAAAAAL");
    // }
    return goalPreconditions;
};

// it gets the action to apply calculate it with the state and return STRIP apply action
const updateCurrentState = ({
    domainActions,
   currentAction,
   actualParameters,
   currentState
}) => {
    let actionToApply = domainActions.find(({
        action
    }) => action === currentAction);
    if (!actionToApply) {
        throw new Error('The action to apply doesnt exist in the domain')
    }

    actionToApply.map = actualParameters;
    let actionToApplyWithEffect = getApplicableActionInState(
        currentState,
        actionToApply
    );

    return strips.applyAction(
        actionToApplyWithEffect,
        currentState
    );
};

// actualParameters is an object which keys are [parameters] and value is the currentParameter by index
const getActualParameters = (parameters, currentParameters) => Object.keys(parameters).reduce(
    (acc, parameter, index) => ({ ...acc,
        [parameter]: currentParameters[index]
    }), {});

const getApplicableActionInState = function(state, action) {
    let resolvedAction;
    const populatedEffect = JSON.parse(JSON.stringify(action.effect));
    for (const m in action.effect) {
        var effect = action.effect[m];
        for (const n in effect.parameters) {
            const parameter = effect.parameters[n];
            const value = action.map[parameter];

            if (value) {
                // Assign this value to all instances of this parameter in the effect.
                populatedEffect[m].parameters[n] = value;
            }
            else {
                console.log(`* ERROR: Value not found for parameter ${parameter}.`);
            }
        }
    }

    resolvedAction = JSON.parse(JSON.stringify(action));
    resolvedAction.effect = populatedEffect;
    resolvedAction.map = action.map;
    return resolvedAction;
};

module.exports = {
    getNumberOfPreconditionsNotSatisfied: function(
        domain,
        mapping,
        chromosome,
        currentState
    ) {
        let state = cloneObject(currentState);
        let numberOfPreconditionsNotSatisfied = 0;
        let numberOfPreconditions = 0;
        //  console.log(chromosome);
        for (let i = 0; i < chromosome.length; i++) {
            let currentAction = chromosome[i][0];
            let currentParameters = chromosome[i][1];

            let preconditions = cloneObject(
                mapping.actions[currentAction].precondition[0]
            );
            let preconditionsAreSatisfied = true;

            const actualParameters = getActualParameters(mapping.actions[currentAction].parameters, currentParameters);

            preconditions.forEach(precondition => {
                // Returns a brand new precondition with only parameters changed keepin' precondition untouched
                const parameterizedPrecondition = R.set(
                    R.lensProp('parameters'),
                    precondition.parameters.map(
                        parameter => actualParameters[parameter]
                    ),
                    precondition
                );

                let preconditionIsSatisfied = strips.isPreconditionSatisfied(
                    state,
                    [parameterizedPrecondition]
                );
                numberOfPreconditions++;
                if (!preconditionIsSatisfied) {
                    numberOfPreconditionsNotSatisfied++;
                    preconditionsAreSatisfied = false;
                }
            });
            if (preconditionsAreSatisfied) {
                state = updateCurrentState({
                    domainActions: domain.actions,
                    currentAction,
                    actualParameters,
                    currentState: state,
                });
            }
        }
        return numberOfPreconditionsNotSatisfied / numberOfPreconditions;
    },
    getNumberOfInvalidActions(domain, mapping, chromosome, currentState) {
        let state = cloneObject(currentState);
        let numberOfInvalidActions = 0;
        let numberOfActions = chromosome.length;
        for (let i = 0; i < chromosome.length; i++) {
            let currentAction = chromosome[i][0];
            let currentParameters = chromosome[i][1];

            const actualParameters = getActualParameters(mapping.actions[currentAction].parameters, currentParameters);

            const preconditions = mapping.actions[currentAction].precondition[0].map(precondition => {
                const parameters = precondition.parameters.map(
                    (
                        parameter
                    ) => actualParameters[parameter]
                );
                return { ...precondition,
                    parameters
                };
            });

            const preconditionsAreSatisfied = strips.isPreconditionSatisfied(
                state,
                preconditions
            );
            //console.log(preconditions);
            if (!preconditionsAreSatisfied) {
                numberOfInvalidActions++;
            }
            if (preconditionsAreSatisfied) {
                state = updateCurrentState({
                    domainActions: domain.actions,
                    currentAction,
                    actualParameters,
                    currentState: state,
                });
            }
        }
        //console.log(numberOfInvalidActions);
        return numberOfInvalidActions / numberOfActions;
    },
    getSizeBeforeConflict(domain, mapping, chromosome, currentState) {
        var state = cloneObject(currentState);
        var sizeBeforeConflict = 0;
        for (var i = 0; i < chromosome.length; i++) {
            var currentAction = chromosome[i][0];
            var currentParameters = chromosome[i][1];

            const actualParameters = getActualParameters(mapping.actions[currentAction].parameters, currentParameters);

            const preconditions = mapping.actions[currentAction].precondition[0].map(precondition => {
                const parameters = precondition.parameters.map(
                    (parameter) => actualParameters[parameter]
                );
                return { ...precondition,
                    parameters
                };
            });

            const preconditionsAreSatisfied = strips.isPreconditionSatisfied(
                state,
                preconditions
            );
            if (!preconditionsAreSatisfied) {
      		return sizeBeforeConflict;
            } else {
		sizeBeforeConflict++;
		state = updateCurrentState({
			domainActions: domain.actions,
			currentAction,
			actualParameters,
			currentState: state,
		    });
		}
	    }
	    return sizeBeforeConflict;
	},
  getChromosozeSize(chromosome, maxSize) {
    let size = chromosome.length / maxSize
    return size > 1 ? 1 : size;
	},
  getBestSequenceSize(domain, mapping, chromosome, currentState) {
      var state = cloneObject(currentState);
      var sizeUntillConflict = 0;
      var sequenceSize = [];

      for (var i = 0; i < chromosome.length; i++) {
          var currentAction = chromosome[i][0];
          var currentParameters = chromosome[i][1];
          const actualParameters = getActualParameters(mapping.actions[currentAction].parameters, currentParameters);
          const preconditions = mapping.actions[currentAction].precondition[0].map(precondition => {
              const parameters = precondition.parameters.map(
                  (parameter) => actualParameters[parameter]
              );
              return { ...precondition,
                  parameters
              };
          });

          const preconditionsAreSatisfied = strips.isPreconditionSatisfied(
              state,
              preconditions
          );
          if (!preconditionsAreSatisfied) {
      		    sequenceSize.push(sizeUntillConflict);
			        sizeUntillConflict = 0;
          }
    	  else {
		sizeUntillConflict++;
		state = updateCurrentState({
			domainActions: domain.actions,
			currentAction,
			actualParameters,
			currentState: state,
		    });
		}
	    }
      if (sequenceSize.length === 0) {
        return 0;
      }
	    return Math.max(...sequenceSize) / chromosome.length;
	},
  countSameMoves(chromosome) {
    let sameMoves = 0;
    var  count = {};
    chromosome.forEach(function(i) { count[i] = (count[i]||0) + 1;});
    for (var element in count) {
      if (count[element] > 1){
        sameMoves += count[element];
      }
    } 
    return sameMoves / chromosome.length;
  },
  getIndexBestCut(domain, mapping, chromosome, currentState) {
      var state = cloneObject(currentState);
      var sizeUntillConflict = 0;
      var sequenceSize = [];
      var indexBestCut = 0;

      for (var i = 0; i < chromosome.length; i++) {
          var currentAction = chromosome[i][0];
          var currentParameters = chromosome[i][1];
          const actualParameters = getActualParameters(mapping.actions[currentAction].parameters, currentParameters);
          const preconditions = mapping.actions[currentAction].precondition[0].map(precondition => {
              const parameters = precondition.parameters.map(
                  (parameter) => actualParameters[parameter]
              );
              return { ...precondition,
                  parameters
              };
          });

          const preconditionsAreSatisfied = strips.isPreconditionSatisfied(
              state,
              preconditions
          );
          if (!preconditionsAreSatisfied) {
      		    sequenceSize.push(sizeUntillConflict);
			        sizeUntillConflict = 0;
          }
    	  else {
		sizeUntillConflict++;
		state = updateCurrentState({
			domainActions: domain.actions,
			currentAction,
			actualParameters,
			currentState: state,
		    });
		}
	    }

    	  for (let i = 0; i <= sequenceSize.indexOf(Math.max(...sequenceSize)); i++){
    	  	indexBestCut += sequenceSize[i];
		if (sequenceSize[i] === 0){
			indexBestCut += 1;
		}
    	  }
	  return indexBestCut;
	},
  getCountCollisionsAtTheEnd(domain, mapping, chromosome, currentState, goalState) {
    let state = cloneObject(currentState);
    for (let i = 0; i < chromosome.length; i++) {
        let currentAction = chromosome[i][0];
        let currentParameters = chromosome[i][1];
        const actualParameters = getActualParameters(mapping.actions[currentAction].parameters, currentParameters);
        const preconditions = mapping.actions[currentAction].precondition[0].map(precondition => {
            const parameters = precondition.parameters.map(
                (parameter) => actualParameters[parameter]
            );
            return { ...precondition,
                parameters
            };
        });

        const preconditionsAreSatisfied = strips.isPreconditionSatisfied(
            state,
            preconditions
        );
        if (!preconditionsAreSatisfied) {
            // Here we can add logic what to do when the preconditions are not met
        }
        if (preconditionsAreSatisfied) {
            state = updateCurrentState({
                domainActions: domain.actions,
                currentAction,
                actualParameters,
                currentState: state,
            });
        }
    }
    return getGoalPreconditions(state, goalState);
  },

  getDifferentActions(domain, mapping, chromosome, currentState) {
    let state = cloneObject(currentState);
    let different_actions = [];
    let number_dif_actions = 0;
    for (let i = 0; i < chromosome.length; i++) {
        let currentAction = chromosome[i][0];
      	if (different_actions.indexOf(currentAction)<0){
      		different_actions.push(currentAction);
      		number_dif_actions++;
      	}
    }
    return number_dif_actions;
  },
  getActualParameters: function(parameters, currentParameters) {
    return getActualParameters(parameters, currentParameters);
  },
  updateCurrentState: function(arg) {
    return updateCurrentState(arg);
  }
};
