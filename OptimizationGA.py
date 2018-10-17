import numpy as np
import random as rnd
import math
import time

actions = [0, 1, 2, 3] #up, right, down, left

empty = '.'
obstacle = 'XX'
generalContent = [empty, obstacle]

numberOfSwords = 3
numberOfMonsters = numberOfSwords
total = range(1, numberOfSwords + 1)
swords = ['S' + str(x) for x in total]
monsters = ['M' + str(x) for x in total]
swords = swords[::-1]
monsters = monsters[::-1]

def generateGrid(gridSize, numberOfObstacles, flag = "Monsters"):
  # generate a grid given grid size, number of obstacles and pre-defined lists of swords and monsters
  swordList = list(np.copy(swords))
  monsterList = list(np.copy(monsters))
  grid =  np.full((gridSize + 2, gridSize + 2), '....')
  for i in range(len(grid)):
    for j in range(len(grid)):
      grid[i][j] = str(i) + str(j)
  grid[0] = np.full(gridSize + 2, obstacle)
  grid[gridSize + 1] = np.full(gridSize + 2, obstacle)
  for j in range(0, gridSize + 2):
    grid[j][0] = obstacle
    grid[j][gridSize + 1] = obstacle
    
  grid[1, 1] = 'ME' # hero
  
  freePositions = [] 
  #create list of (x,y) where we can put swords/monsters
  for x in range(1, gridSize + 1):
    for y in range(1, gridSize + 1):
      if (grid[x][y] != obstacle and (x == 1 and y == 1) == False):
        freePositions.append((x, y))
  rnd.shuffle(freePositions)

  # put down all the weapons
  for i in range(numberOfSwords):
    if len(freePositions) == 0:
      break
    (x, y) = freePositions.pop()
    grid[x][y] = swordList.pop()

  # put down all the monsters
  for i in range(numberOfMonsters):
      if len(freePositions) == 0:
          break
          (x, y) = freePositions.pop()
          grid[x][y] = monsterList.pop()
    
  # put down obstaclesNum obstacles
  for i in range(numberOfObstacles):
    if len(freePositions) == 0:
      break
    (x, y) = freePositions.pop()
    grid[x][y] = obstacle
  return grid

def gridToGraph(grid):
# generates a graph, given a grid
  width = len(grid) - 1
  height = len(grid) - 1
  graphOfGrid = []
  for x in range(1, len(grid) - 1):
    for y in range(1, len(grid) - 1): 
      if grid[x, y] != obstacle:
        index = rowColumnToIndex(x, y, width) 
        neighbouringCells = [rowColumnToIndex(x - 1, y, width) , rowColumnToIndex(x + 1, y, width), rowColumnToIndex(x, y - 1,width), rowColumnToIndex(x, y + 1,width)]
        valuesAtNbhCells = [grid[x-1,y], grid[x+1,y], grid[x,y-1], grid[x,y+1]]
        validNbh = []
        for k in range(len(valuesAtNbhCells)):
          if valuesAtNbhCells[k] != obstacle:     
              validNbh.append(neighbouringCells[k])
        if len(validNbh) != 0:
          graphOfGrid.append(validNbh)
        else:
          graphOfGrid.append(None)
      else:
        graphOfGrid.append(None)
  return graphOfGrid

def rowColumnToIndex(x, y, width):
  return y + x*(width - 1) - width

def shortestPath(graphOfGrid, start, end, currPath=[]):
# computes the shortest paths between two nodes
  currPath = currPath + [start]
  if start == end:
      return currPath
  if not start in graphOfGrid:
      return None
  currShortest = None
  for element in graphOfGrid[start]:
      if element not in currPath:
          path2 = shortestPath(graphOfGrid, element, end, currPath)
          if path2:
              if not currShortest or len(path2) < len(currShortest):
                  currShortest = path2
  return currShortest

def floydWarshall(graphOfGrid):
# finds shortest paths between all pairs in the graph
  dist = np.full((len(graphOfGrid), len(graphOfGrid)), math.inf)
  for k1 in range(len(graphOfGrid)):
    if graphOfGrid[k1] != None:
      for k2 in graphOfGrid[k1]:
        dist[k1][k2] = 1
  for v in range(len(graphOfGrid)):
    dist[v][v] = 0
  for k in range(len(graphOfGrid)):
    for i in range(len(graphOfGrid)):
      for j in range(len(graphOfGrid)):
        if dist[i][j] > dist[i][k] + dist[k][j]:
          dist[i][j] = dist[i][k] + dist[k][j]
  return dist

def initialValidRandomPath(grid):
# generates a random valid individual
  flag = False
  while flag == False:
    alreadyTried = False
    gridTemp = grid
    initial = ['ME']
    swordList = list(np.copy(swords))
    monsterList = list(np.copy(monsters))
    itemList = []
    itemList += swordList
    nonValid = {}
    graphOfGridTemp = graphOfGrid
    distancesTemp = distances
    indicesOfStatesTemp = indicesOfStates

    while len(itemList) > 0:
        initial.append(itemList.pop(rnd.randrange(len(itemList))))

        if "".join(initial) in nonValid:
            # print("already tried")
            itemList.append(initial.pop())
            continue
      
        if checkIfValid(initial, graphOfGridTemp, distancesTemp, indicesOfStatesTemp) == False:
            nonValid["".join(initial)] = 1
            itemList += initial[-1:]
            initial = initial[:-1]
            continue
        else:
            if initial[-1:][0][0] == "S":
              idxReveal = monsterCo["M" + str(initial[-1:][0][1])]
              itemList.append("M" + str(initial[-1:][0][1]))
              gridTemp[idxReveal[0]][idxReveal[1]] = "M" + str(initial[-1:][0][1])
              graphOfGridTemp = gridToGraph(gridTemp)
              distancesTemp = floydWarshall(graphOfGridTemp)    

    flag = checkIfValid(initial, graphOfGridTemp, distancesTemp, indicesOfStatesTemp)

    
        
  return initial
  
def checkIfValid(initial, graphOfGrid, distances, indicesOfStates):
# checks if the path initial is valid
  for i in range(len(initial) - 1):
    if distances[indicesOfStates[initial[i]]][indicesOfStates[initial[i+1]]] == math.inf:
      return False
    if checkIfValidWhenCarryingMoreSwords(initial) == False:
      return False
  return True  

def checkIfValidWhenCarryingMoreSwords(initial):
# checks if sword is picked up before killing a monster
  for i in range(len(initial)):
    if initial[i][0] == 'M':
      monster_type = initial[i][1]
    for j in range(i + 1, len(initial)):
      if initial[j][0] == 'S':
        if initial[j][1] == monster_type:
          return False
  return True    
    
def indicesOfStatesF(grid):
# creates a dictionary with keys (the hero, swords, monsters and empty states) and values (indexes)
  width = len(grid) - 1 
  indicesSM = {}
  for x in range(1, len(grid) - 1):
    for y in range(1, len(grid[x]) - 1):
      indicesSM[str(grid[x, y])] = rowColumnToIndex(x, y, width)       
  return indicesSM

def cost(initial):
# the fitness function: calculates the distance in terms of path length
  cost = 0
  for k in range(len(initial) - 1):
    cost += distancesOrg[indicesOfStates[initial[k]]][indicesOfStates[initial[k + 1]]]
  return cost

def randomIndividuals():
# create a population with random valid individuals
  individuals = []
  for i in range(populationSize):
    individuals.append(initialValidRandomPath(grid))
  return individuals

def fitnessPopulation(population):
# compute the fitnesses for all individuals in a population
  popFit = []
  nonScaled = []
  for individual in population:
    fitness = -cost(individual)
    popFit.append(fitness)
    nonScaled.append(fitness)
  popFit = [(x+(max(popFit)-x)+(min(popFit)-x)) for x in popFit]
  popFit = [x/sum(popFit) for x in popFit]
  fitnessOfTheBest = np.max(nonScaled)
  bestInThisGeneration = population[np.argmax(nonScaled)]
  return popFit, bestInThisGeneration, fitnessOfTheBest, nonScaled

def crossover(individualOne, individualTwo, index):
# makes crossover of the two individuals, returns false if the crossover is invalid

  assert len(individualOne) == len(individualTwo)
  
  # makes the crossover
  individualTemp = [individualOne[0]] + individualOne[1:index] + individualTwo[index:]
  gridTemp = grid
  graphOfGridTemp = gridToGraph
  distancesTemp = distances
  indicesOfStatesTemp = indicesOfStates
  
  # check if the path consists of several visits to the same node  
  for i in individualTemp:
      if i != 1:
          return False

  initial = ['ME']
  itemList = []
  itemList += individualTemp[1:]
  itemList.reverse()

  while len(itemList) > 0:
      initial.append(itemList.pop())
      # reveals monster if collected sword
      if initial[-1:][0][0] == "S":
          idxReveal = monsterCo["M" + str(initial[-1:][0][1])]
          gridTemp[idxReveal[0]][idxReveal[1]] = "M" + str(initial[-1:][0][1])
      
      if checkIfValid(initial, graphOfGridTemp, distancesTemp, indicesOfStatesTemp) != True:
          return False # if the crossover does not provide a valid path some point, return false
      else:
          graphOfGridTemp = gridToGraph(gridTemp)
          distancesTemp = floydWarshall(graphOfGridTemp)

  valid = checkIfValid(initial, graphOfGridTemp, distancesTemp, indicesOfStatesTemp)

  return individualTemp

def mutate(individual):
# makes and returns a valid swap mutation of the individual

  valid = False
  while valid == False:
    
    individualTemp = individual
    idx = list(range(1,len(individualTemp)))
    rnd.shuffle(idx)
    i = idx.pop()
    j = idx.pop()
    
    # makes the swap mutation
    individualTemp[i], individualTemp[j] = individualTemp[j], individualTemp[i]
    gridTemp = grid
    graphOfGridTemp = gridToGraph
    distancesTemp = distances
    indicesOfStatesTemp = indicesOfStates

    initial = ['ME']
    itemList = []
    itemList += individualTemp[1:]
    itemList.reverse()

    while len(itemList) > 0:
        initial.append(itemList.pop())
        # reveals monster if collected sword
        if initial[-1:][0][0] == "S":
            idxReveal = monsterCo["M" + str(initial[-1:][0][1])]
            gridTemp[idxReveal[0]][idxReveal[1]] = "M" + str(initial[-1:][0][1])
        if checkIfValid(initial, graphOfGridTemp, distancesTemp, indicesOfStatesTemp) != True:
            break # if the swap mutation is not valid at some point, break and do the swap mutation again
        else:
            graphOfGridTemp = gridToGraph(gridTemp)
            distancesTemp = floydWarshall(graphOfGridTemp)
    
    valid = checkIfValid(initial, graphOfGridTemp, distancesTemp, indicesOfStatesTemp)

  return individualTemp

def createNewPopulation(population, populationFitness, grid,gridToGraph):
# creates a new population of valid individuals (paths)

  newPopulation = [] 
  forMutation = []

  sortedIndices = np.argsort(populationFitness)
  newPopulation.extend(list(np.array(population)[sortedIndices[-2:]].tolist())) #send so many best parents to the next generation
  # Roulette wheel selection
  while len(forMutation) < len(population) - len(newPopulation):
    u = rnd.random()
    cumulative_p = 0
    index = 0
    for i in populationFitness:
      if cumulative_p < u:
        cumulative_p += i
        index += 1
      else:
        break
    forMutation.append(population[index-1])
  
  forCrossover = []
  forCrossover += forMutation
    
  # makes the crossover
  for i in range(0,len(forCrossover),2):
      parent1 = forCrossover[i]
      parent2 = forCrossover[i+1]
      index = rnd.choice(range(1,len(parent1)))
      child1 = crossover(parent1,parent2,index)
      child2 = crossover(parent2,parent1,index)
      if child1 != False:
          forMutation[i] = child1
      if child2 != False:
          forMutation[i+1] = child2

  # makes the swap mutations
  while len(newPopulation) < len(population):
    mutated = mutate(forMutation[-10:][0])
    if mutated != False:
      newPopulation.append(mutated)
      forMutation.pop()
    else:
      continue

  return newPopulation

def alterGrid(grid):
# create grid where the monsters are hidden
    gridNoM =  np.full((gridSize + 2, gridSize + 2),"..")
    for i in range(len(grid)):
        for j in range(len(grid)):
            if grid[i][j][0] == "M" and grid[i][j][1] != "E":
                gridNoM[i][j] = "XX"
                monsterCo[grid[i][j]] = [i,j]
            else:
                gridNoM[i][j] = grid[i][j]
    return gridNoM

def fillGrid(gridX):
    # create grid from a list
    filledGrid =  np.full((gridSize + 2, gridSize + 2), '....')
    for i in range(len(gridX)):
        for j in range(len(gridX[0])):
            filledGrid[i,j] = gridX[i][j]
    return filledGrid

generations = 100 # how many iterations 
populationSize = 10 # how many individuals in each iteration

gridSize = 5
obstacles = 3

# rnd.seed(100)
# gridOrg = generateGrid(gridSize, obstacles)

# 7x7 7 obstacles 7 monsters
# grid1 = [['XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
#          ['XX', 'M2', 'ME', 'XX', 'M7', '15', '16', '17', 'XX'],
#          ['XX', '21', '22', '23', 'S2', 'M3', '26', 'S4', 'XX'],
#          ['XX', 'M6', '32', '33', '34', '35', 'XX', 'M4', 'XX'],
#          ['XX', '41', 'S6', '43', 'S7', 'XX', '46', 'XX', 'XX'],
#          ['XX', '51', '52', '53', '54', '55', '56', 'S1', 'XX'],
#          ['XX', '61', 'S5', 'M1', '64', 'XX', 'XX', '67', 'XX'],
#          ['XX', 'M5', 'XX', 'S3', '74', '75', '76', '77', 'XX'],
#          ['XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX']]

# Map 7: 5x5 3 obstacles 3 monsters
grid1 = [['XX','XX','XX','XX','XX','XX','XX'],
         ['XX','XX','ME','13','14','M3','XX'],
         ['XX','21','S1','23','S3','S2','XX'],
         ['XX','31','32','33','XX','35','XX'],
         ['XX','41','M1','43','XX','M2','XX'],
         ['XX','51','52','53','54','55','XX'],
         ['XX','XX','XX','XX','XX','XX','XX']]

# Map 8: 5x5 3 obstacles 3 monsters
# grid1 = [['XX','XX','XX','XX','XX','XX','XX'],
#          ['XX','ME','12','13','14','15','XX'],
#          ['XX','XX','M1','23','S2','XX','XX'],
#          ['XX','31','M3','33','34','XX','XX'],
#          ['XX','41','42','43','44','45','XX'],
#          ['XX','M2','S3','S1','54','55','XX'],
#          ['XX','XX','XX','XX','XX','XX','XX']]

# Map 9 5x5 3 block 3 monsters
# grid1 = [['XX','XX','XX','XX','XX','XX','XX'],
#          ['XX','XX','ME','13','14','15','XX'],
#          ['XX','21','M1','23','24','M2','XX'],
#          ['XX','M3','32','33','S2','XX','XX'],
#          ['XX','41','42','43','XX','45','XX'],
#          ['XX','S1','52','S3','54','55','XX'],
#          ['XX','XX','XX','XX','XX','XX','XX']]

# 3x3 1 block 2 monsters
# grid1 = [['XX','XX','XX','XX','XX'],
#          ['XX','S2','ME','M2','XX'],
#          ['XX','21','22','M1','XX'],
#          ['XX','S1','XX','33','XX'],
#          ['XX','XX','XX','XX','XX']]

gridOrg = fillGrid(grid1)
graphOfGridOrg = gridToGraph(gridOrg)
distancesOrg = floydWarshall(graphOfGridOrg)

monsterCo = {} # stores index to monsters from the initial grid

grid = alterGrid(gridOrg)
graphOfGrid = gridToGraph(grid)
distances = floydWarshall(graphOfGrid)
indicesOfStates = indicesOfStatesF(gridOrg)
print(gridOrg)
print(grid)

bestIndividuals = []
bestFitnesses = []

bestForNow = -10000000
bestOfTheBests = []
t0 = time.time()

population = randomIndividuals() # initializes the first population

# evolution takes place
for i in range(generations):
  print("Generation",i+1)
  print(" Time",(time.time() - t0)/(60*60))
  fitnesses, bestInThisGeneration, bestFitnessInThisGeneration, nonScaled = fitnessPopulation(population)
  population = createNewPopulation(population, fitnesses, grid,gridToGraph)
  
  print(" Top 2: ",cost(population[0])+numberOfSwords,cost(population[1])+numberOfSwords)
  bestFitnesses.append(-bestFitnessInThisGeneration+numberOfSwords)
  bestIndividuals.append(bestInThisGeneration)
  
  if bestFitnessInThisGeneration > bestForNow:
    bestOfTheBests.append(bestFitnessInThisGeneration)
    bestForNow = bestFitnessInThisGeneration
    print(-bestFitnessInThisGeneration)
    print(time.time() - t0)

t = time.time() - t0
print(t)

import matplotlib.pyplot as plt
plt.plot(bestFitnesses)
plt.xlabel("Generation")
plt.ylabel("Length of path")
plt.show()