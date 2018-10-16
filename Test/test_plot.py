#!/usr/bin/env python

import re
import matplotlib
import matplotlib.pyplot as plt
import numpy as np

f = open("/home/laura/Escriptori/KTH/AI/heroes-game-planning-master/Test/hero_problem_5_by_5_3_blocks_3_monsters_0_0.log", "r")
ref_num = 0
fitness = []

for num, line in enumerate(f):
    if re.match("sameMoves: ", line):
	ref_num = num + 2
    if ref_num == num:
	#fitness.append(int(line))
	try:
            fitness.append(float(line))
	except:
            print("error: "+line)

# Data for plotting
t = np.arange(0, len(fitness))

fig, ax = plt.subplots()
ax.plot(t, fitness, linewidth=0.6)

ax.set(xlabel='Generations', ylabel='Fitness',
       title='Fitness for a 5x5 grid, three blocks and three monsters')
ax.grid()

fig.savefig("/home/laura/Escriptori/KTH/AI/heroes-game-planning-master/Test/fitness_test/hero_problem_5_by_5_3_blocks_3_monsters_0_0.png")
plt.show()
