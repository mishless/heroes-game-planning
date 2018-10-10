const strips = require('strips');
const R = require('ramda');


let getApplicableActionInState = function(state, action) {
    var resolvedAction = null;
    var populatedEffect = JSON.parse(JSON.stringify(action.effect));
    for (var m in action.effect) {
        var effect = action.effect[m];
        for (var n in effect.parameters) {
            var parameter = effect.parameters[n];
            var value = action.map[parameter];

            if (value) {
                // Assign this value to all instances of this parameter in the effect.
                populatedEffect[m].parameters[n] = value;
            }
            else {
                console.log('* ERROR: Value not found for parameter ' + parameter + '.');
            }
        }
    }

    resolvedAction = JSON.parse(JSON.stringify(action));
    resolvedAction.effect = populatedEffect;
    resolvedAction.map = action.map;
    return resolvedAction;
}


module.exports = {
  getNumberOfPreconditionsNotSatisfied: function (domain, mapping, chromosome, currentState) {
  	var numberOfPreconditionsNotSatisfied = 0;
  	for (i = 0; i < chromosome.length ; i++) {
  		let currentAction = chromosome[i][0];
  		let currentParameters = chromosome[i][1];
      // In javascript this is how you make a deep copy of an array with nested objects :( kill me
      let preconditions = JSON.parse(JSON.stringify(mapping.actions[currentAction].precondition[0]));
      let preconditionsAreSatisfied = true;

      let actualParameters = [];
      let j = 0;
      for (parameter in mapping.actions[currentAction].parameters) {
        actualParameters[parameter] = currentParameters[j++];
      }

      preconditions.forEach(function(precondition) {
        precondition.parameters = precondition.parameters.map(function(parameter) {
          return actualParameters[parameter]
        });
        let preconditionIsSatisfied = strips.isPreconditionSatisfied(currentState, [precondition]);
        if (!preconditionIsSatisfied) {
            numberOfPreconditionsNotSatisfied++;
            preconditionsAreSatisfied = false;
        }
      });
      if (preconditionsAreSatisfied) {
        let actionToApply;
        domain.actions.forEach(function(action) {
          if (action.action === currentAction) {
            actionToApply = action;
          }
        });
        actionToApply.map = actualParameters;
        let actionToApplyWithEffect = getApplicableActionInState(currentState, actionToApply);
        currentState = strips.applyAction(actionToApplyWithEffect, currentState);
      }
  	}
    console.log(numberOfPreconditionsNotSatisfied)
  	return numberOfPreconditionsNotSatisfied;
  },
  getNumberOfInvalidActions(domain, mapping, chromosome, currentState) {
    var numberOfInvalidActions = 0;
    for (i = 0; i < chromosome.length ; i++) {
      let currentAction = chromosome[i][0];
      let currentParameters = chromosome[i][1];
      // In javascript this is how you make a deep copy of an array with nested objects :( kill me
      let preconditions = JSON.parse(JSON.stringify(mapping.actions[currentAction].precondition[0]));

      let actualParameters = [];
      let j = 0;
      for (parameter in mapping.actions[currentAction].parameters) {
        actualParameters[parameter] = currentParameters[j++];
      }

      preconditions.forEach(function(precondition) {
        precondition.parameters = precondition.parameters.map(function(parameter) {
          //console.log(parameter);
          return actualParameters[parameter];
        });
      });
      let preconditionsAreSatisfied = strips.isPreconditionSatisfied(currentState, preconditions);
      //console.log(preconditions);
      if (!preconditionsAreSatisfied) {
          numberOfInvalidActions++;
      }
      if (preconditionsAreSatisfied) {
        let actionToApply;
        domain.actions.forEach(function(action) {
          if (action.action === currentAction) {
            actionToApply = action;
          }
        });
        actionToApply.map = actualParameters;
        let actionToApplyWithEffect = getApplicableActionInState(currentState, actionToApply);
        currentState = strips.applyAction(actionToApplyWithEffect, currentState);
      }
    }
    console.log(numberOfInvalidActions)
    return numberOfInvalidActions;
  },
  getSizeBeforeConflict(chromosome) {

  },
  getChromosozeSize(chromosome) {

  },
  getBestSequenceSize(chromosome) {

  }
};
