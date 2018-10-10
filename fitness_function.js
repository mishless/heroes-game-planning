const strips = require("strips");
const R = require("ramda");

const cloneObject = object => JSON.parse(JSON.stringify(object));

const getApplicableActionInState = (state, action) => {
  // We map the effects to the new parameters
  const newEffects = action.effect.map(({ operation, parameters }) => {
    const effectParameters = parameters.map(parameter => {
      const value = action.map[parameter];
      if (value) {
        return value;
      } else {
        throw new Error(`Value not found for parameter ${parameter}`);
      }
    });
    return { operation, parameters: effectParameters };
  });

  // Return the same action but with the newly calculated effect
  return { ...action, effect: newEffects };
};

module.exports = {
  getNumberOfPreconditionsNotSatisfied: function(
    domain,
    mapping,
    chromosome,
    currentState
  ) {
    let numberOfPreconditionsNotSatisfied = 0;
    for (let i = 0; i < chromosome.length; i++) {
      let currentAction = chromosome[i][0];
      let currentParameters = chromosome[i][1];

      let preconditions = cloneObject(
        mapping.actions[currentAction].precondition[0]
      );
      let preconditionsAreSatisfied = true;

      let actualParameters = [];
      let j = 0;
      for (let parameter in mapping.actions[currentAction].parameters) {
        actualParameters[parameter] = currentParameters[j++];
      }

      preconditions.forEach(precondition => {
        precondition.parameters = precondition.parameters.map(
          parameter => actualParameters[parameter]
        );
        let preconditionIsSatisfied = strips.isPreconditionSatisfied(
          currentState,
          [precondition]
        );
        if (!preconditionIsSatisfied) {
          numberOfPreconditionsNotSatisfied++;
          preconditionsAreSatisfied = false;
        }
      });
      if (preconditionsAreSatisfied) {
        let actionToApply;
        domain.actions.forEach(action => {
          if (action.action === currentAction) {
            actionToApply = action;
          }
        });
        actionToApply.map = actualParameters;
        let actionToApplyWithEffect = getApplicableActionInState(
          currentState,
          actionToApply
        );
        currentState = strips.applyAction(
          actionToApplyWithEffect,
          currentState
        );
      }
    }
    console.log(numberOfPreconditionsNotSatisfied);
    return numberOfPreconditionsNotSatisfied;
  },
  getNumberOfInvalidActions(domain, mapping, chromosome, currentState) {
    let numberOfInvalidActions = 0;
    for (let i = 0; i < chromosome.length; i++) {
      let currentAction = chromosome[i][0];
      let currentParameters = chromosome[i][1];
      let preconditions = cloneObject(
        mapping.actions[currentAction].precondition[0]
      );
      // actualParameters is an object which keys are [parameters] and value is the currentParameter by index
      const actualParameters = Object.keys(mapping.actions[currentAction].parameters).reduce(
          (acc, parameter, index) => ({ ...acc, [parameter]: currentParameters[index] })
      , {});

      preconditions = preconditions.map(precondition => {
        const parameters = precondition.parameters.map(
          (
            parameter
          ) => actualParameters[parameter]
        );
        return {...precondition, parameters};
      });
      let preconditionsAreSatisfied = strips.isPreconditionSatisfied(
        currentState,
        preconditions
      );
      //console.log(preconditions);
      if (!preconditionsAreSatisfied) {
        numberOfInvalidActions++;
      }
      if (preconditionsAreSatisfied) {
        let actionToApply;
        domain.actions.forEach(action => {
          if (action.action === currentAction) {
            actionToApply = action;
          }
        });
        actionToApply.map = actualParameters;
        let actionToApplyWithEffect = getApplicableActionInState(
          currentState,
          actionToApply
        );
        currentState = strips.applyAction(
          actionToApplyWithEffect,
          currentState
        );
      }
    }
    console.log(numberOfInvalidActions);
    return numberOfInvalidActions;
  },
  getSizeBeforeConflict(chromosome) {},
  getChromosozeSize(chromosome) {},
  getBestSequenceSize(chromosome) {}
};
