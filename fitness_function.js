module.exports = {
  getNumberOfConflicts: function (domain, mapping, chromesome, currentState, applyAction) {
  	var not_conflicts = 0;
  	var conflicts = 0;
  	for (i = 0; i < chromesome.length ; i++) {
  		var chromeAction = chromesome[i][0];
  		var chromeParameters = chromesome[i][1];
  		var chromePrecond = mapping.actions[chromeAction].precondition[0];
  		for (var l = 0; l < chromePrecond.length; l++){
  			//console.log("next");
  			var auxPrecond = chromePrecond[l];
  			//console.log(auxPrecond);
  			chromePrecond[l].parameters = chromeParameters;
  			//console.log(chromePrecond[l]);
  			auxPrecond = '';
  			//console.log(chromePrecond[l]);
  			if(chromePrecond[l].operation === 'not' && (currentState.actions.indexOf(auxPrecond) < 0)){
  				//console.log(chromePrecond[l]);
  				not_conflicts++;
  			}
  			else if (chromePrecond[l].operation !== 'not' && (currentState.actions.indexOf(auxPrecond) >= 0)){
  				//console.log(chromePrecond[l]);
  				not_conflicts++;
  			}
        if (not_conflicts === 0) {
          // If there are no conflicts we need to apply the action and evaluate next gene on the new state
          let actionToApply;
          domain.actions.forEach(function(action) {
            if (action.action === chromeAction) {
              actionToApply = action;
            }
          });
          actualParameters = {};
          let i = 0;
          actionToApply.parameters.forEach(function(parameter) {
            actualParameters[parameter.parameter] = chromeParameters[i];
          });
          actionToApply.map = actualParameters;
          currentState = applyAction(actionToApply, currentState);
          //console.log(currentState);
        }
  		}
  		conflicts = chromePrecond.length - not_conflicts;
  		not_conflicts = 0;
  	}
  	console.log(conflicts);
  	return conflicts;
  },
  getNumberOfInvalidActions(mapping, chromosome, currentState) {

  },
  getSizeBeforeConflict(chromosome) {

  },
  getChromosozeSize(chromosome) {

  },
  getBestSequenceSize(chromosome) {

  }
};
