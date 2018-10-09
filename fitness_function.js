module.exports = {
  number_of_conflicts: function (mapping, chromesome, currentState) {
	var not_conflicts = 0;
	var conflicts = 0;

	console.log("Current state actions: ");
	console.log(currentState.actions);
	console.log("////");
	for (i = 0; i < chromesome.length ; i++){
		var chromeAction = chromesome[i][0];
		var chromeParameters = chromesome[i][1];
		var chromePrecond = mapping.actions[chromeAction].precondition[0];

		for (var l = 0; l < chromePrecond.length; l++){
			console.log("next");
			var auxPrecond = chromePrecond[l];
			console.log(auxPrecond);
			chromePrecond[l].parameters = chromeParameters;
			console.log(chromePrecond[l]);
			auxPrecond = '';
			//console.log(chromePrecond[l]);
			if(chromePrecond[l].operation === 'not'&&(currentState.actions.indexOf(auxPrecond)<0)){
				//console.log(chromePrecond[l]);
				not_conflicts++;
			}
			else if (chromePrecond[l].operation !== 'not'&&(currentState.actions.indexOf(auxPrecond)>=0)){
				//console.log(chromePrecond[l]);
				not_conflicts++;
			}
		}
		conflicts = chromePrecond.length - not_conflicts;
		not_conflicts = 0;
		
	}
	console.log(conflicts);

	return conflicts;
	
  }
};
