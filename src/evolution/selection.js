/**
 * Selection - Chọn lọc agents dựa trên fitness
 * 
 * @author Shika
 */

/**
 * Tournament Selection - Chọn ngườithắng trong tournament ngẫu nhiên
 */
function tournamentSelection(population, tournamentSize = 3) {
  const tournament = [];
  
  // Chọn ngẫu nhiên tournamentSize individuals
  for (let i = 0; i < tournamentSize; i++) {
    const randomIdx = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIdx]);
  }
  
  // Trả về ngườicó fitness cao nhất
  return tournament.reduce((best, current) => 
    current.fitness > best.fitness ? current : best
  );
}

/**
 * Roulette Wheel Selection - Chọn theo xác suất tỷ lệ với fitness
 */
function rouletteSelection(population) {
  const totalFitness = population.reduce((sum, ind) => sum + ind.fitness, 0);
  let random = Math.random() * totalFitness;
  
  for (const individual of population) {
    random -= individual.fitness;
    if (random <= 0) {
      return individual;
    }
  }
  
  return population[population.length - 1];
}

/**
 * Rank Selection - Chọn dựa trên rank (tránh dominate của super individuals)
 */
function rankSelection(population) {
  // Sort by fitness
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  
  // Assign ranks (best = highest rank)
  const totalRanks = (sorted.length * (sorted.length + 1)) / 2;
  let random = Math.random() * totalRanks;
  
  for (let i = 0; i < sorted.length; i++) {
    const rank = sorted.length - i;
    random -= rank;
    if (random <= 0) {
      return sorted[i];
    }
  }
  
  return sorted[sorted.length - 1];
}

/**
 * Elite Selection - Chọn top N individuals
 */
function eliteSelection(population, count = 2) {
  return [...population]
    .sort((a, b) => b.fitness - a.fitness)
    .slice(0, count);
}

/**
 * Truncation Selection - Loại bỏ bottom X% và chọn từ phần còn lại
 */
function truncationSelection(population, truncationRate = 0.5) {
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  const cutoffIndex = Math.floor(sorted.length * truncationRate);
  const survivors = sorted.slice(0, cutoffIndex);
  
  // Return random from survivors
  return survivors[Math.floor(Math.random() * survivors.length)];
}

/**
 * Select parents cho next generation
 */
function selectParents(population, count = 2, strategy = 'tournament') {
  const parents = [];
  
  for (let i = 0; i < count; i++) {
    let parent;
    
    switch (strategy) {
      case 'tournament':
        parent = tournamentSelection(population);
        break;
      case 'roulette':
        parent = rouletteSelection(population);
        break;
      case 'rank':
        parent = rankSelection(population);
        break;
      case 'truncation':
        parent = truncationSelection(population);
        break;
      default:
        parent = tournamentSelection(population);
    }
    
    parents.push(parent);
  }
  
  return parents;
}

/**
 * Evaluate fitness từ task results
 */
function evaluateFitness(genome, tasks) {
  if (!tasks || tasks.length === 0) {
    return genome.fitness || 0.5;
  }
  
  let totalScore = 0;
  
  for (const task of tasks) {
    // Success rate (50%)
    const successScore = task.success ? 1.0 : 0.0;
    
    // Efficiency (30%) - fewer tokens = better
    const tokenScore = Math.max(0, 1 - (task.tokensUsed / 100000));
    
    // Time bonus (20%) - faster = better
    const timeScore = Math.max(0, 1 - (task.duration / 300));
    
    const taskScore = successScore * 0.5 + tokenScore * 0.3 + timeScore * 0.2;
    totalScore += taskScore;
  }
  
  return totalScore / tasks.length;
}

module.exports = {
  tournamentSelection,
  rouletteSelection,
  rankSelection,
  eliteSelection,
  truncationSelection,
  selectParents,
  evaluateFitness
};
