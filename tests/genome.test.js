/**
 * Tests for Genome class
 * 
 * @author Team 7
 */

const { Genome, Gene } = require('../src/genome');
const { createLeaderGenes } = require('../src/genes/cognitive');

describe('Genome', () => {
  test('should create genome with agentId', () => {
    const genome = new Genome('test-agent', 1);
    expect(genome.agentId).toBe('test-agent');
    expect(genome.generation).toBe(1);
    expect(genome.fitness).toBe(0);
  });

  test('should serialize to JSON', () => {
    const genome = new Genome('kakashi', 1);
    genome.cognitive = { creativity: new Gene('creativity', 0.8) };
    
    const json = genome.toJSON();
    expect(json.agentId).toBe('kakashi');
    expect(json.cognitive.creativity.value).toBe(0.8);
  });

  test('should calculate fitness from tasks', () => {
    const genome = new Genome('test');
    const tasks = [
      { success: true, tokensUsed: 50000, duration: 60 },
      { success: true, tokensUsed: 30000, duration: 45 }
    ];
    
    const fitness = genome.calculateFitness(tasks);
    expect(fitness).toBeGreaterThan(0);
    expect(fitness).toBeLessThanOrEqual(1);
  });
});

describe('Gene', () => {
  test('should clamp value between 0 and 1', () => {
    const gene1 = new Gene('test', 1.5);
    expect(gene1.value).toBe(1);
    
    const gene2 = new Gene('test', -0.5);
    expect(gene2.value).toBe(0);
  });

  test('should mutate with given rate', () => {
    const gene = new Gene('test', 0.5);
    const mutated = gene.mutate(1.0, 0.1); // 100% mutation rate
    
    expect(mutated.value).not.toBe(0.5);
    expect(mutated.value).toBeGreaterThanOrEqual(0);
    expect(mutated.value).toBeLessThanOrEqual(1);
  });
});
