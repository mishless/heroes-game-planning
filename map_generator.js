module.exports = {
  generate: function (height, width, blockedCells, numberOfMonstersPerType) {
    var finalGrid = [];
    var problem = "(define (problem hero-problem) \n(:domain heroes-world) \n(:objects ";
    var numberOfCells = height*width;
    // Generate indexes for blocked cells
    var indexesOfBlockedCells = []
    for (var i = 0; i < blockedCells; i++) {
      do {
        var newBlockIndex = Math.floor(Math.random() * numberOfCells);
      } while (indexesOfBlockedCells.indexOf(newBlockIndex) >= 0);
      indexesOfBlockedCells[i] = newBlockIndex;
      finalGrid[newBlockIndex] = "B";
    }
    // Generate indexes for possible locations
    var possibleLocations = []
    for (var i = 0; i < numberOfCells; i++) {
      if (indexesOfBlockedCells.indexOf(i) < 0) {
        possibleLocations.push("p" + i);
        problem += "p" + i + " ";
      }
    }
    problem += " - location \nh - hero \n";
    // Generate random positions for monsters
    var monsterIndexes = [];
    var weaponIndexes = [];
    for (var i = 0; i < numberOfMonstersPerType.length; i++) {
      monsterIndexes.push([]);
      for (var j = 0; j < numberOfMonstersPerType[i]; j++) {
        problem += "m" + i + j + " ";
        var newMonsterIndex = Math.floor(Math.random() * possibleLocations.length);
        monsterIndexes[i].push(possibleLocations[newMonsterIndex]);
        finalGrid[possibleLocations[newMonsterIndex].substring(1)] = "M" + i + j;
        possibleLocations.splice(newMonsterIndex, 1);
      }
      var newWeaponIndex = Math.floor(Math.random() * possibleLocations.length);
      weaponIndexes.push(possibleLocations[newWeaponIndex]);
      finalGrid[possibleLocations[newWeaponIndex].substring(1)] = "W" + i;
      possibleLocations.splice(newWeaponIndex, 1);
      problem += " - m" + i + " \n";
      problem += "w" + i + " - w" + i + " \n";
    }
    problem += ") \n(:init (at h " + possibleLocations[0] + ") ";
    finalGrid[possibleLocations[0].substring(1)] = "H";
    for (var i = 0; i < monsterIndexes.length; i++) {
      for (var j = 0; j < monsterIndexes[i].length; j++) {
        problem += "(at m" + i + j + " " + monsterIndexes[i][j] + ") (guarded " + monsterIndexes[i][j] + ") \n";
      }
      problem += "(at w" + i + " " + weaponIndexes[i] + ") \n";
    }
    // Generate connections grid
    grid = [];
    var element = 0;
    for (var i = 0; i < height; i++) {
      grid.push([]);
      for (var j = 0; j < width; j++) {
        if (indexesOfBlockedCells.indexOf(element) >= 0) {
          grid[i].push(null);
        } else {
          grid[i].push(element);
        }
        element++;
      }
    }
    // Generate adjecents
    adjecents = []
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        if (grid[i][j] === null) {
          continue;
        } else {
          if (i - 1 >= 0 && grid[i-1][j] !== null) {
            problem += "(adjacent p" + grid[i][j] + " p" + grid[i-1][j] + ") \n";
          }
          if (i + 1 < height && grid[i+1][j] !== null) {
              problem += "(adjacent p" + grid[i][j] + " p" + grid[i+1][j] + ") \n";
          }
          if (j - 1 >= 0 && grid[i][j-1] !== null) {
            problem += "(adjacent p" + grid[i][j] + " p" + grid[i][j-1] + ") \n";
          }
          if (j + 1 < width && grid[i][j+1] !== null) {
            problem += "(adjacent p" + grid[i][j] + " p" + grid[i][j+1] + ") \n";
          }
        }
      }
    }
    problem += ") (:goal (and ";for (var i = 0; i < monsterIndexes.length; i++) {
      for (var j = 0; j < monsterIndexes[i].length; j++) {
        problem += "(has-castle "+ monsterIndexes[i][j] + ") ";
      }
    }
    problem += ")))"

    for (var i = 0; i < width*height; i++) {
      if (finalGrid[i] === undefined) {
        process.stdout.write("\tp"+i+"\t");
      } else {
        process.stdout.write("\t" + finalGrid[i] + "\t");
      }
      if (i % width == width - 1) {
        process.stdout.write("\n")
      }
    }
    return problem;
  }
};
