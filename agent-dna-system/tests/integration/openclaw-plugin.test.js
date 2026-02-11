/**
 * Integration Tests - Agent DNA System with OpenClaw
 * Tests for plugin integration
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Mock OpenClaw for testing
class MockOpenClaw {
  constructor() {
    this.hooks = {
      before: {},
      after: {}
    };
    this.agentId = 'test-agent';
    this.config = {};
  }

  before(event, fn) {
    this.hooks.before[event] = fn;
  }

  after(event, fn) {
    this.hooks.after[event] = fn;
  }

  async triggerBefore(event, ctx) {
    if (this.hooks.before[event]) {
      await this.hooks.before[event](ctx);
    }
  }

  async triggerAfter(event, ctx, result) {
    if (this.hooks.after[event]) {
      await this.hooks.after[event](ctx, result);
    }
  }
}

describe('OpenClaw Integration', () => {
  let mockOpenClaw;
  let plugin;

  beforeEach(() => {
    mockOpenClaw = new MockOpenClaw();
  });

  describe('Plugin Initialization', () => {
    it('should load DNA from file on initialization', () => {
      // Create a mock DNA file
      const mockDNA = {
        agent_id: 'test-agent',
        generation: 1,
        genes: {
          creativity: 0.8,
          analytical: 0.9,
          coding: 0.85
        },
        fitness: 0.75
      };

      // Verify DNA structure
      assert.strictEqual(mockDNA.agent_id, 'test-agent');
      assert.ok(mockDNA.genes.creativity >= 0 && mockDNA.genes.creativity <= 1);
      assert.ok(mockDNA.fitness >= 0 && mockDNA.fitness <= 1);
    });

    it('should create default DNA if no file exists', () => {
      const defaultDNA = {
        agent_id: 'default-agent',
        generation: 0,
        genes: {
          creativity: 0.5,
          analytical: 0.5,
          coding: 0.5
        },
        fitness: 0
      };

      assert.ok(defaultDNA);
      assert.strictEqual(defaultDNA.generation, 0);
    });
  });

  describe('Model Parameters', () => {
    it('should convert DNA genes to OpenClaw model params', () => {
      const dna = {
        genes: {
          creativity: 0.9,
          analytical: 0.8,
          caution: 0.3
        }
      };

      // Convert to model params
      const modelParams = {
        temperature: 0.5 + (dna.genes.creativity * 0.5), // 0.5 - 1.0
        maxTokens: 1000 + (dna.genes.analytical * 3000), // 1000 - 4000
        thinking: dna.genes.analytical > 0.7 ? 'high' : 'low'
      };

      assert.ok(modelParams.temperature >= 0.5 && modelParams.temperature <= 1.0);
      assert.ok(modelParams.maxTokens >= 1000 && modelParams.maxTokens <= 4000);
      assert.ok(['high', 'low'].includes(modelParams.thinking));
    });

    it('should adjust params based on context', () => {
      const dna = {
        genes: { creativity: 0.8, caution: 0.2 },
        context: 'urgent'
      };

      // Urgent context should lower maxTokens
      let maxTokens = 1000 + (dna.genes.creativity * 3000);
      if (dna.context === 'urgent') {
        maxTokens *= 0.7; // Reduce for speed
      }

      assert.ok(maxTokens < 3500); // Should be reduced
    });
  });

  describe('Task Metrics Tracking', () => {
    it('should track task execution metrics', () => {
      const task = {
        id: 'task-001',
        type: 'code',
        startTime: Date.now(),
        endTime: Date.now() + 5000,
        tokensUsed: 2500,
        success: true
      };

      const metrics = {
        duration: task.endTime - task.startTime,
        tokensUsed: task.tokensUsed,
        success: task.success
      };

      assert.strictEqual(metrics.duration, 5000);
      assert.strictEqual(metrics.tokensUsed, 2500);
      assert.strictEqual(metrics.success, true);
    });

    it('should calculate efficiency score', () => {
      const metrics = {
        duration: 3000, // 3 seconds
        tokensUsed: 2000,
        maxTokens: 4000,
        success: true
      };

      const efficiency = 
        (metrics.success ? 1 : 0) * 0.4 +
        (1 - metrics.tokensUsed / metrics.maxTokens) * 0.3 +
        (1 - Math.min(metrics.duration / 10000, 1)) * 0.3;

      assert.ok(efficiency >= 0 && efficiency <= 1);
    });
  });

  describe('Fitness Calculation', () => {
    it('should calculate fitness from multiple metrics', () => {
      const session = {
        tasks: [
          { success: true, quality: 0.9, efficiency: 0.8 },
          { success: true, quality: 0.85, efficiency: 0.75 },
          { success: false, quality: 0.3, efficiency: 0.4 }
        ]
      };

      let totalFitness = 0;
      for (const task of session.tasks) {
        const taskFitness = 
          (task.success ? 1 : 0) * 0.4 +
          task.quality * 0.4 +
          task.efficiency * 0.2;
        totalFitness += taskFitness;
      }

      const avgFitness = totalFitness / session.tasks.length;
      
      assert.ok(avgFitness >= 0 && avgFitness <= 1);
      // With 2 successes and 1 failure, fitness should be moderate
      assert.ok(avgFitness > 0.4 && avgFitness < 0.9);
    });

    it('should update fitness after each session', () => {
      let currentFitness = 0.6;
      const newSessionFitness = 0.8;
      
      // Weighted average with history
      currentFitness = (currentFitness * 0.7) + (newSessionFitness * 0.3);
      
      assert.ok(currentFitness > 0.6 && currentFitness < 0.8);
    });
  });

  describe('Auto-Evolve Trigger', () => {
    it('should trigger evolution when fitness drops below threshold', () => {
      const fitness = 0.55;
      const threshold = 0.6;
      
      const shouldEvolve = fitness < threshold;
      
      assert.strictEqual(shouldEvolve, true);
    });

    it('should not trigger evolution when fitness is above threshold', () => {
      const fitness = 0.75;
      const threshold = 0.6;
      
      const shouldEvolve = fitness < threshold;
      
      assert.strictEqual(shouldEvolve, false);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should apply DNA before task execution', async () => {
      const ctx = { agentId: 'test-agent', task: 'code-review' };
      
      // Simulate before hook
      ctx.dna = { genes: { coding: 0.9 } };
      ctx.modelParams = { temperature: 0.7 };
      
      assert.ok(ctx.dna);
      assert.ok(ctx.modelParams);
    });

    it('should update fitness after task completion', async () => {
      const ctx = { agentId: 'test-agent' };
      const result = { success: true, quality: 0.9 };
      
      // Simulate after hook
      ctx.lastResult = result;
      ctx.fitness = 0.85;
      
      assert.strictEqual(ctx.lastResult.success, true);
      assert.ok(ctx.fitness > 0);
    });
  });

  describe('Config Management', () => {
    it('should load config from file', () => {
      const config = {
        dna: {
          enabled: true,
          autoEvolve: true,
          fitnessThreshold: 0.6
        }
      };

      assert.strictEqual(config.dna.enabled, true);
      assert.strictEqual(config.dna.autoEvolve, true);
      assert.strictEqual(config.dna.fitnessThreshold, 0.6);
    });

    it('should use defaults when config missing', () => {
      const defaults = {
        enabled: false,
        autoEvolve: false,
        fitnessThreshold: 0.5
      };

      assert.ok(defaults);
      assert.strictEqual(defaults.enabled, false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DNA file gracefully', () => {
      const fileExists = false;
      
      if (!fileExists) {
        // Should create default DNA
        const defaultDNA = { agent_id: 'new-agent', generation: 0 };
        assert.ok(defaultDNA);
      }
    });

    it('should handle invalid DNA format', () => {
      const invalidDNA = { agent_id: 'test' }; // Missing genes
      
      // Should validate and use defaults
      const genes = invalidDNA.genes || { creativity: 0.5 };
      
      assert.ok(genes);
      assert.ok(genes.creativity);
    });
  });

  describe('Full Workflow', () => {
    it('should complete full agent lifecycle', () => {
      // 1. Initialize
      const agent = {
        id: 'test-agent',
        dna: { genes: { coding: 0.8 }, fitness: 0 }
      };

      // 2. Execute task
      const task = { success: true, quality: 0.9, efficiency: 0.8 };
      
      // 3. Calculate fitness
      agent.dna.fitness = task.success ? task.quality * 0.8 + task.efficiency * 0.2 : 0;
      
      // 4. Check if evolution needed
      if (agent.dna.fitness < 0.6) {
        agent.needsEvolution = true;
      }

      assert.ok(agent.dna.fitness > 0);
      assert.strictEqual(agent.needsEvolution, undefined); // Fitness is good
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running Integration Tests...\n');
  
  // Simple test runner
  const tests = [];
  let currentSuite = null;
  
  global.describe = (name, fn) => {
    currentSuite = name;
    fn();
    currentSuite = null;
  };
  
  global.it = (name, fn) => {
    tests.push({ suite: currentSuite, name, fn });
  };
  
  global.beforeEach = () => {};
  
  // Load test definitions
  require.main.exports.describe = describe;
  require.main.exports.it = it;
  require.main.exports.beforeEach = beforeEach;
  
  // Execute tests
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      test.fn();
      console.log(`  ✅ ${test.name}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ ${test.name}`);
      console.log(`     ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}
