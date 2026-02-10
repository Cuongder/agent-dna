/**
 * Selection Module - Agent DNA System
 * Chọn lọc agents tốt nhất dựa trên fitness evaluation
 */

class Selection {
  constructor(options = {}) {
    this.method = options.method || 'tournament'; // 'tournament', 'roulette', 'rank', 'elite'
    this.tournamentSize = options.tournamentSize || 3;
    this.eliteCount = options.eliteCount || 2; // Số elite agents giữ lại
    this.selectionPressure = options.selectionPressure || 1.5;
  }

  /**
   * Chọn parents cho generation tiếp theo
   * @param {Array} population - Mảng các agents với fitness scores
   * @param {Number} count - Số lượng cần chọn
   * @returns {Array} Mảng agents được chọn
   */
  select(population, count) {
    // Validate population
    if (!population || population.length === 0) {
      throw new Error('Population cannot be empty');
    }

    // Ensure fitness scores exist
    const validPopulation = population.filter(agent => 
      agent.fitness !== undefined && !isNaN(agent.fitness)
    );

    if (validPopulation.length === 0) {
      throw new Error('No agents with valid fitness scores');
    }

    switch (this.method) {
      case 'tournament':
        return this.tournamentSelection(validPopulation, count);
      case 'roulette':
        return this.rouletteSelection(validPopulation, count);
      case 'rank':
        return this.rankSelection(validPopulation, count);
      case 'elite':
        return this.eliteSelection(validPopulation, count);
      default:
        throw new Error(`Unknown selection method: ${this.method}`);
    }
  }

  /**
   * Tournament Selection: Chọn ngẫu nhiên n agents, pick best
   */
  tournamentSelection(population, count) {
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      // Chọn ngẫu nhiên tournamentSize agents
      const tournament = [];
      for (let j = 0; j < this.tournamentSize; j++) {
        const randomIdx = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIdx]);
      }
      
      // Chọn agent có fitness cao nhất trong tournament
      const winner = tournament.reduce((best, current) => 
        current.fitness > best.fitness ? current : best
      );
      
      selected.push({...winner}); // Clone để tránh reference issues
    }
    
    return selected;
  }

  /**
   * Roulette Wheel Selection: Xác suất tỷ lệ với fitness
   */
  rouletteSelection(population, count) {
    const selected = [];
    
    // Tính total fitness
    const totalFitness = population.reduce((sum, agent) => sum + agent.fitness, 0);
    
    for (let i = 0; i < count; i++) {
      let spin = Math.random() * totalFitness;
      let cumulative = 0;
      
      for (const agent of population) {
        cumulative += agent.fitness;
        if (cumulative >= spin) {
          selected.push({...agent});
          break;
        }
      }
    }
    
    return selected;
  }

  /**
   * Rank Selection: Dựa trên rank thay vì fitness absolute
   */
  rankSelection(population, count) {
    // Sort by fitness
    const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
    
    // Tính rank probabilities (linear ranking)
    const n = sorted.length;
    const ranks = sorted.map((agent, idx) => ({
      ...agent,
      rank: n - idx,
      rankProb: (2 - this.selectionPressure) / n + 
                (2 * idx * (this.selectionPressure - 1)) / (n * (n - 1))
    }));
    
    // Roulette wheel trên rank
    const selected = [];
    for (let i = 0; i < count; i++) {
      let spin = Math.random();
      let cumulative = 0;
      
      for (const agent of ranks) {
        cumulative += agent.rankProb;
        if (cumulative >= spin) {
          selected.push({...agent});
          break;
        }
      }
    }
    
    return selected;
  }

  /**
   * Elite Selection: Giữ lại top performers
   */
  eliteSelection(population, count) {
    // Sort by fitness giảm dần
    const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
    
    // Lấy elite
    const elites = sorted.slice(0, this.eliteCount).map(e => ({...e}));
    
    // Phần còn lại dùng tournament
    const remaining = count - this.eliteCount;
    const nonElites = sorted.slice(this.eliteCount);
    
    if (remaining > 0 && nonElites.length > 0) {
      const tournament = new Selection({ method: 'tournament' });
      const others = tournament.select(nonElites, remaining);
      return [...elites, ...others];
    }
    
    return elites;
  }

  /**
   * Survivor Selection: Chọn ai sống sót sang generation mới
   */
  selectSurvivors(parents, offspring, populationSize) {
    // Kết hợp parents và offspring
    const combined = [...parents, ...offspring];
    
    // Sort by fitness
    const sorted = combined.sort((a, b) => b.fitness - a.fitness);
    
    // Chọn top populationSize
    return sorted.slice(0, populationSize).map(agent => ({...agent}));
  }

  /**
   * Evaluate fitness của một agent
   */
  evaluateFitness(agent, metrics = {}) {
    // Mặc định fitness dựa trên gene values
    const geneValues = Object.values(agent.genes || {});
    if (geneValues.length === 0) return 0;

    // Average của tất cả genes
    const avgFitness = geneValues.reduce((sum, val) => {
      if (typeof val === 'number') return sum + val;
      return sum;
    }, 0) / geneValues.length;

    // Thêm bonus từ metrics nếu có
    const bonus = (metrics.taskSuccess || 0) * 0.3 +
                  (metrics.userSatisfaction || 0) * 0.3 +
                  (metrics.efficiency || 0) * 0.2;

    return Math.min(1, avgFitness + bonus);
  }

  /**
   * Calculate diversity của population
   */
  calculateDiversity(population) {
    if (population.length < 2) return 0;

    const geneKeys = Object.keys(population[0].genes || {});
    let totalVariance = 0;

    for (const key of geneKeys) {
      const values = population.map(a => a.genes[key]).filter(v => typeof v === 'number');
      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        totalVariance += variance;
      }
    }

    return totalVariance / geneKeys.length;
  }

  /**
   * Statistics về population
   */
  getPopulationStats(population) {
    const fitnesses = population.map(a => a.fitness);
    const sorted = fitnesses.sort((a, b) => a - b);
    
    return {
      size: population.length,
      bestFitness: sorted[sorted.length - 1],
      worstFitness: sorted[0],
      avgFitness: fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
      medianFitness: sorted[Math.floor(sorted.length / 2)],
      diversity: this.calculateDiversity(population)
    };
  }
}

module.exports = Selection;
