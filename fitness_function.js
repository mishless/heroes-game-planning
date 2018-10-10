const strips = require("strips");
const R = require("ramda");

// This is how you deep clone in JavaScript :D
const cloneObject = object => JSON.parse(JSON.stringify(object));

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

const getApplicableActionInState = (state, action) => {
    // We map the effects to the new parameters
    const newEffects = action.effect.map(({
                                              operation,
                                              parameters
                                          }) => {
        const effectParameters = parameters.map(parameter => {
            const value = action.map[parameter];
            if (value) {
                return value;
            } else {
                throw new Error(`Value not found for parameter ${parameter}`);
            }
        });
        return {
            operation,
            parameters: effectParameters
        };
    });
    // Return the same action but with the newly calculated effect
    return { ...action,
        effect: newEffects
    };
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
        console.log(numberOfPreconditionsNotSatisfied);
        return numberOfPreconditionsNotSatisfied;
    },
    getNumberOfInvalidActions(domain, mapping, chromosome, currentState) {
        let state = cloneObject(currentState);
        let numberOfInvalidActions = 0;
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
        console.log(numberOfInvalidActions);
        return numberOfInvalidActions;
    },
    getSizeBeforeConflict(chromosome) {},
    getChromosozeSize(chromosome) {},
    getBestSequenceSize(chromosome) {}
};