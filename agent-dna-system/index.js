/**
 * Agent DNA System - Main Entry Point
 * Evolution engine cho AI agents
 */

const Crossover = require('./src/evolution/crossover');
const Mutation = require('./src/evolution/mutation');
const Selection = require('./src/evolution/selection');
const DNACLITool = require('./tools/cli');

class AgentDNASystem {
  constructor(options = {}) {
    this.crossover = new Crossover(options.crossover);
    this.mutation = new Mutation(options.mutation);
    this.selection = new Selection(options.selection);
  }

  /**
   * Evolution cycle hoàn chỉnh
   */
  evolve(population, options = {}) {
    const {
      offspringCount = population.length,
      mutationRate = 0.1,
      mutationStrength = 0.1,
      eliteCount = 2
    } = options;

    // 1. Selection
    const parents = this.selection.select(population, offspringCount);
    
    // 2. Crossover (breeding)
    const offspring = [];
    for (let i = 0; i < parents.length; i += 2) {
      const parentA = parents[i];
      const parentB = parents[i + 1] || parents[0];
      const children = this.crossover.createOffspring(parentA, parentB, 2);
      offspring.push(...children);
    }

    // 3. Mutation
    const mutatedOffspring = offspring.map(child => 
      this.mutation.mutate(child, { rate: mutationRate, strength: mutationStrength })
    );

    // 4. Selection survivors
    const nextGeneration = this.selection.selectSurvivors(
      parents,
      mutatedOffspring,
      population.length
    );

    return nextGeneration;
  }

  /**
   * Create initial population
   */
  createPopulation(size, baseGenes = {}) {
    const population = [];
    for (let i = 0; i < size; i++) {
      population.push({
        agent_id: `agent-${i}-${Date.now().toString(36)}`,
        generation: 0,
        genes: this.generateRandomGenes(baseGenes),
        fitness: 0
      });
    }
    return population;
  }

  /**
   * Generate random genes
   */
  generateRandomGenes(base = {}) {
    const defaultGenes = {
      creativity: Math.random(),
      analytical: Math.random(),
      caution: Math.random(),
      curiosity: Math.random(),
      coding: Math.random(),
      research: Math.random(),
      communication: Math.random(),
      leadership: Math.random(),
      learning_rate: Math.random(),
      memory_retention: Math.random(),
      adaptation_speed: Math.random()
    };

    return { ...defaultGenes, ...base };
  }
}

module.exports = {
  AgentDNASystem,
  Crossover,
  Mutation,
  Selection,
  DNACLITool
};
