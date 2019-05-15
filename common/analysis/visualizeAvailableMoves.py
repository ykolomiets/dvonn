import json
import numpy as np
import matplotlib.pyplot as plt

with open('availableMoves.json') as json_file:
    data = json.load(json_file)
    availableMovesPerIteration = np.zeros((50, 100000), dtype=int)
    currentPositions = np.zeros(50, dtype=int)
    for i in range(len(data)):
        for step in range(len(data[i])):
            availableMovesPerIteration[step][
                currentPositions[step]] = data[i][step]
            currentPositions[step] += 1
    x = np.arange(50, dtype=int)
    y = availableMovesPerIteration.mean(axis=1)
    plt.plot(x, y)
    plt.scatter(x, y)
    plt.show()
    print('End')
