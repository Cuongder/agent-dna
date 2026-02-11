/**
 * Integration Tests for OpenClaw DNA Plugin
 * 
 * Tests the complete lifecycle of the plugin
 */

const OpenClawDNAPlugin = require('../../src/plugins/openclaw');
const { Genome } = require('../../src/genome');

describe('OpenClawDNAPlugin Integration', () => {
  let plugin;
  let mockOpenClaw;

  beforeEach(() => {
    mockOpenClaw = {
      events: {},
      on: function(event, handler) {
        this.events[event] = handler;
      },
      emit: function(event, ...args) {
        if (this.events[event]) {
          this.events[event](...args);
        }
      }
    };
    
    plugin = new OpenClawDNAPlugin({
      autoEvolve: false,
      evolutionThreshold: 0.6
    });
  });

  describe('Plugin Initialization', () => {
    test('should initialize with options', () => {
      expect(plugin.options.autoEvolve).toBe(false);
      expect(plugin.options.evolutionThreshold).toBe(0.6);
    });

    test('should setup hooks when initialized', () => {
      plugin.init(mockOpenClaw);
      
      expect(mockOpenClaw.events['session:start']).toBeDefined();
      expect(mockOpenClaw.events['tool:before']).toBeDefined();
      expect(mockOpenClaw.events['tool:after']).toBeDefined();
      expect(mockOpenClaw.events['session:end']).toBeDefined();
    });
  });

  describe('DNA Loading', () => {
    test('should create default DNA for new agent', () => {
      const dna = plugin.loadAgentDNA('test-agent');
      
      expect(dna).toBeDefined();
      expect(dna.agentId).toBe('test-agent');
      expect(dna.generation).toBe(1);
    });

    test('should detect leader type from agent name', () => {
      const dna = plugin.loadAgentDNA('kakashi-leader');
      
      expect(dna.cognitive).toBeDefined();
      expect(dna.cognitive.analytical?.value).toBeGreaterThan(0.7);
    });
  });

  describe('Model Parameter Application', () => {
    test('should convert DNA to model params', () => {
      plugin.loadAgentDNA('test-agent');
      const ctx = { agentId: 'test-agent' };
      
      plugin.applyModelParams(ctx);
      
      expect(ctx.modelParams).toBeDefined();
      expect(ctx.modelParams.temperature).toBeDefined();
      expect(ctx.modelParams.maxTokens).toBeDefined();
    });

    test('should apply temperature based on creativity', () => {
      plugin.loadAgentDNA('creative-agent');
      const ctx = { agentId: 'creative-agent' };
      
      plugin.applyModelParams(ctx);
      
      expect(ctx.modelParams.temperature).toBeGreaterThanOrEqual(0.3);
      expect(ctx.modelParams.temperature).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Task Metrics Tracking', () => {
    test('should track successful task', () => {
      plugin.trackTaskMetrics(
        { agentId: 'test-agent' },
        { success: true, tokensUsed: 1000, duration: 60 }
      );
      
      expect(plugin.taskHistory).toHaveLength(1);
      expect(plugin.taskHistory[0].success).toBe(true);
    });

    test('should track failed task', () => {
      plugin.trackTaskMetrics(
        { agentId: 'test-agent' },
        { success: false, tokensUsed: 500, duration: 30 }
      );
      
      expect(plugin.taskHistory[0].success).toBe(false);
    });
  });

  describe('Fitness Evaluation', () => {
    test('should calculate fitness from tasks', () => {
      plugin.loadAgentDNA('test-agent');
      
      // Simulate successful tasks
      plugin.trackTaskMetrics(
        { agentId: 'test-agent' },
        { success: true, tokensUsed: 1000, duration: 60, quality: 0.8 }
      );
      
      plugin.evaluateAndEvolve('test-agent');
      
      const dna = plugin.agents.get('test-agent');
      expect(dna.fitness).toBeGreaterThan(0);
      expect(dna.fitness).toBeLessThanOrEqual(1);
    });
  });
});
