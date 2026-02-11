/**
 * Epigenetics Tests - Agent DNA System
 * Tests for Epigenome and EpigeneticMarker classes
 */

const assert = require('assert');
const { Epigenome, EpigeneticMarker } = require('../../src/epigenetics');
const { BEGINNER_CONTEXT, EXPERT_CONTEXT, URGENT_CONTEXT } = require('../../src/epigenetics/contexts');

describe('Epigenetics', () => {
  
  describe('EpigeneticMarker', () => {
    it('should create a marker with default values', () => {
      const marker = new EpigeneticMarker('creativity');
      assert.strictEqual(marker.geneName, 'creativity');
      assert.strictEqual(marker.active, true);
      assert.strictEqual(marker.methylationLevel, 0);
    });

    it('should toggle gene activation', () => {
      const marker = new EpigeneticMarker('patience');
      assert.strictEqual(marker.active, true);
      
      marker.deactivate();
      assert.strictEqual(marker.active, false);
      
      marker.activate();
      assert.strictEqual(marker.active, true);
    });

    it('should apply methylation', () => {
      const marker = new EpigeneticMarker('caution');
      marker.applyMethylation(0.5);
      assert.strictEqual(marker.methylationLevel, 0.5);
      assert.strictEqual(marker.getEffectiveValue(0.8), 0.4); // 0.8 * 0.5
    });

    it('should apply acetylation', () => {
      const marker = new EpigeneticMarker('creativity');
      marker.applyAcetylation(1.5);
      assert.strictEqual(marker.acetylationLevel, 1.5);
      assert.strictEqual(marker.getEffectiveValue(0.6), 0.9); // 0.6 * 1.5
    });
  });

  describe('Epigenome', () => {
    let epigenome;

    beforeEach(() => {
      epigenome = new Epigenome();
    });

    it('should initialize with default markers', () => {
      assert.ok(epigenome.markers instanceof Map);
      assert.strictEqual(epigenome.currentContext, null);
    });

    it('should add and get markers', () => {
      epigenome.addMarker('creativity', { active: true, methylation: 0.2 });
      const marker = epigenome.getMarker('creativity');
      
      assert.ok(marker instanceof EpigeneticMarker);
      assert.strictEqual(marker.geneName, 'creativity');
      assert.strictEqual(marker.methylationLevel, 0.2);
    });

    it('should set and switch contexts', () => {
      epigenome.setContext('beginner', BEGINNER_CONTEXT);
      assert.strictEqual(epigenome.currentContext, 'beginner');
      
      epigenome.setContext('expert', EXPERT_CONTEXT);
      assert.strictEqual(epigenome.currentContext, 'expert');
    });

    it('should apply context-specific marker modifications', () => {
      epigenome.setContext('beginner', BEGINNER_CONTEXT);
      
      // BEGINNER context should activate patience marker
      const patienceMarker = epigenome.getMarker('patience');
      if (BEGINNER_CONTEXT.patience) {
        assert.strictEqual(patienceMarker.active, BEGINNER_CONTEXT.patience.active);
      }
    });

    it('should calculate effective gene values with context', () => {
      epigenome.addMarker('coding', { active: true, methylation: 0.8 });
      epigenome.setContext('expert', EXPERT_CONTEXT);
      
      const baseValue = 0.9;
      const effectiveValue = epigenome.getEffectiveGeneValue('coding', baseValue);
      
      // Should be modified by both methylation and context
      assert.ok(effectiveValue <= baseValue);
      assert.ok(effectiveValue >= 0);
    });

    it('should reset to default state', () => {
      epigenome.setContext('urgent', URGENT_CONTEXT);
      epigenome.addMarker('creativity', { active: false, methylation: 0.5 });
      
      epigenome.reset();
      
      assert.strictEqual(epigenome.currentContext, null);
      // Markers should be cleared or reset to defaults
      assert.strictEqual(epigenome.markers.size, 0);
    });

    it('should export and import epigenome state', () => {
      epigenome.setContext('beginner', BEGINNER_CONTEXT);
      epigenome.addMarker('patience', { active: true, methylation: 0.3 });
      
      const exported = epigenome.export();
      
      assert.ok(exported.context);
      assert.ok(exported.markers);
      assert.strictEqual(exported.context, 'beginner');
      
      // Test import
      const newEpigenome = new Epigenome();
      newEpigenome.import(exported);
      
      assert.strictEqual(newEpigenome.currentContext, 'beginner');
      assert.ok(newEpigenome.getMarker('patience'));
    });

    it('should inherit markers from parent', () => {
      epigenome.setContext('expert', EXPERT_CONTEXT);
      epigenome.addMarker('coding', { active: true, methylation: 0.7 });
      
      const childEpigenome = epigenome.inherit();
      
      assert.ok(childEpigenome.getMarker('coding'));
      assert.strictEqual(childEpigenome.currentContext, 'expert');
    });
  });

  describe('Context Detection', () => {
    it('should auto-detect beginner context from task description', () => {
      const task = "Explain this to me like I'm new to programming";
      const detected = Epigenome.detectContext(task);
      
      assert.ok(['beginner', 'tutorial'].includes(detected));
    });

    it('should auto-detect urgent context from keywords', () => {
      const task = "URGENT: Production server is down!";
      const detected = Epigenome.detectContext(task);
      
      assert.strictEqual(detected, 'urgent');
    });

    it('should auto-detect research context', () => {
      const task = "Research the latest AI trends and provide analysis";
      const detected = Epigenome.detectContext(task);
      
      assert.ok(['research', 'analytical'].includes(detected));
    });
  });

  describe('Context Presets', () => {
    it('should have all required context presets', () => {
      const contexts = require('../../src/epigenetics/contexts');
      
      assert.ok(contexts.BEGINNER_CONTEXT);
      assert.ok(contexts.EXPERT_CONTEXT);
      assert.ok(contexts.URGENT_CONTEXT);
      assert.ok(contexts.RESEARCH_CONTEXT);
      assert.ok(contexts.PRODUCTION_CONTEXT);
      assert.ok(contexts.CODE_REVIEW_CONTEXT);
      assert.ok(contexts.BRAINSTORM_CONTEXT);
    });

    it('BEGINNER context should boost patience and reduce complexity', () => {
      const { BEGINNER_CONTEXT } = require('../../src/epigenetics/contexts');
      
      assert.ok(BEGINNER_CONTEXT.patience?.active === true || BEGINNER_CONTEXT.patience > 0.7);
      assert.ok(BEGINNER_CONTEXT.caution?.active === true || BEGINNER_CONTEXT.caution > 0.6);
    });

    it('URGENT context should prioritize speed', () => {
      const { URGENT_CONTEXT } = require('../../src/epigenetics/contexts');
      
      assert.ok(URGENT_CONTEXT.caution?.active === false || URGENT_CONTEXT.caution < 0.3);
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running Epigenetics Tests...\n');
  
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
  
  global.beforeEach = (fn) => {
    // Store for later
  };
  
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
