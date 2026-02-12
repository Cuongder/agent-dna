/**
 * Swarm System Tests
 * Tests for consensus and voting modules
 * 
 * @author Team 7 (Shika)
 * @version 0.4.0
 */

const assert = require('assert');
const { ConsensusEngine, ConflictResolver } = require('../../src/swarm/consensus');
const { VoteSession, VoteManager, SwarmVoting } = require('../../src/swarm/voting');

describe('Swarm System', () => {
  
  describe('ConsensusEngine', () => {
    let engine;

    beforeEach(() => {
      engine = new ConsensusEngine({
        strategy: 'weighted_voting',
        threshold: 0.6,
        minAgents: 3
      });
    });

    it('should require minimum number of agents', () => {
      const responses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option1' }
      ];

      const result = engine.calculateConsensus(responses);
      
      assert.strictEqual(result.reached, false);
      assert.ok(result.reason.includes('Insufficient'));
    });

    it('should calculate weighted voting correctly', () => {
      engine.setAgentWeight('a1', 2.0);
      engine.setAgentWeight('a2', 1.0);
      engine.setAgentWeight('a3', 1.0);

      const responses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option2' },
        { agentId: 'a3', vote: 'option2' }
      ];

      const result = engine.calculateConsensus(responses);
      
      // option1: 2.0, option2: 2.0 -> tie, but option1 listed first
      assert.ok(result.result === 'option1' || result.result === 'option2');
      assert.ok(result.confidence > 0);
    });

    it('should reach consensus when threshold met', () => {
      const responses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option1' },
        { agentId: 'a3', vote: 'option1' }
      ];

      const result = engine.calculateConsensus(responses);
      
      assert.strictEqual(result.reached, true);
      assert.strictEqual(result.result, 'option1');
      assert.strictEqual(result.confidence, 1.0);
    });

    it('should fail consensus when threshold not met', () => {
      const responses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option2' },
        { agentId: 'a3', vote: 'option3' }
      ];

      const result = engine.calculateConsensus(responses);
      
      // No clear majority, confidence < 0.6
      assert.strictEqual(result.reached, false);
    });

    it('should handle majority voting strategy', () => {
      engine.strategy = 'majority';
      
      const responses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option1' },
        { agentId: 'a3', vote: 'option2' }
      ];

      const result = engine.calculateConsensus(responses);
      
      assert.strictEqual(result.result, 'option1');
      assert.strictEqual(result.strategy, 'majority');
    });

    it('should handle unanimous voting strategy', () => {
      engine.strategy = 'unanimous';
      
      // All agree
      const agreeResponses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option1' },
        { agentId: 'a3', vote: 'option1' }
      ];

      const agreeResult = engine.calculateConsensus(agreeResponses);
      assert.strictEqual(agreeResult.reached, true);

      // Not all agree
      const disagreeResponses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option2' },
        { agentId: 'a3', vote: 'option1' }
      ];

      const disagreeResult = engine.calculateConsensus(disagreeResponses);
      assert.strictEqual(disagreeResult.reached, false);
    });

    it('should handle borda count strategy', () => {
      engine.strategy = 'borda_count';
      
      const responses = [
        { agentId: 'a1', rankings: ['option1', 'option2', 'option3'] },
        { agentId: 'a2', rankings: ['option1', 'option3', 'option2'] },
        { agentId: 'a3', rankings: ['option2', 'option1', 'option3'] }
      ];

      const result = engine.calculateConsensus(responses);
      
      assert.ok(result.scores);
      assert.ok(result.result);
      assert.strictEqual(result.strategy, 'borda_count');
    });

    it('should normalize different vote types', () => {
      const stringVote = engine.normalizeVote('option1');
      const numberVote = engine.normalizeVote(123);
      const objectVote = engine.normalizeVote({ key: 'value' });

      assert.strictEqual(stringVote, 'option1');
      assert.strictEqual(numberVote, '123');
      assert.strictEqual(objectVote, '{"key":"value"}');
    });

    it('should evaluate consensus quality', () => {
      const consensusResult = {
        confidence: 0.8,
        distribution: { option1: 4, option2: 1 }
      };

      const quality = engine.evaluateQuality(consensusResult);
      
      assert.ok(quality.quality >= 0);
      assert.ok(quality.quality <= 1);
      assert.ok(quality.confidence >= 0);
      assert.ok(['strong', 'moderate', 'weak'].includes(quality.consensusStrength));
    });

    it('should export and import state', () => {
      engine.setAgentWeight('a1', 2.5);
      
      const exported = engine.export();
      
      assert.strictEqual(exported.strategy, 'weighted_voting');
      assert.strictEqual(exported.threshold, 0.6);
      assert.strictEqual(exported.weights.a1, 2.5);

      const newEngine = new ConsensusEngine();
      newEngine.import(exported);
      
      assert.strictEqual(newEngine.strategy, 'weighted_voting');
      assert.strictEqual(newEngine.weights.get('a1'), 2.5);
    });
  });

  describe('ConflictResolver', () => {
    let resolver;

    beforeEach(() => {
      resolver = new ConflictResolver({
        fallbackStrategy: 'highest_confidence'
      });
    });

    it('should return resolved when consensus reached', () => {
      const responses = [
        { agentId: 'a1', vote: 'option1' }
      ];
      
      const consensusResult = {
        reached: true,
        result: 'option1',
        confidence: 0.9
      };

      const result = resolver.resolve(responses, consensusResult);
      
      assert.strictEqual(result.resolved, true);
      assert.strictEqual(result.method, 'consensus');
    });

    it('should resolve by highest confidence', () => {
      const responses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option2' }
      ];
      
      const consensusResult = {
        reached: false,
        result: 'option1',
        confidence: 0.4
      };

      const result = resolver.resolve(responses, consensusResult);
      
      assert.strictEqual(result.resolved, true);
      assert.strictEqual(result.method, 'highest_confidence');
    });

    it('should resolve by leader decision', () => {
      resolver.fallbackStrategy = 'leader_decides';
      
      const responses = [
        { agentId: 'a1', vote: 'option1', isLeader: true },
        { agentId: 'a2', vote: 'option2' }
      ];
      
      const consensusResult = { reached: false };

      const result = resolver.resolve(responses, consensusResult);
      
      assert.strictEqual(result.resolved, true);
      assert.strictEqual(result.method, 'leader_decides');
      assert.strictEqual(result.result, 'option1');
    });

    it('should resolve randomly when configured', () => {
      resolver.fallbackStrategy = 'random';
      
      const responses = [
        { agentId: 'a1', vote: 'option1' },
        { agentId: 'a2', vote: 'option2' }
      ];
      
      const consensusResult = { reached: false };

      const result = resolver.resolve(responses, consensusResult);
      
      assert.strictEqual(result.resolved, true);
      assert.strictEqual(result.method, 'random');
      assert.ok(['option1', 'option2'].includes(result.result));
    });

    it('should mark for retry when configured', () => {
      resolver.fallbackStrategy = 'retry';
      
      const responses = [];
      const consensusResult = { reached: false };

      const result = resolver.resolve(responses, consensusResult);
      
      assert.strictEqual(result.resolved, false);
      assert.strictEqual(result.method, 'retry_needed');
    });
  });

  describe('VoteSession', () => {
    let session;

    beforeEach(() => {
      session = new VoteSession({
        id: 'test-session',
        topic: 'Test Topic',
        options: ['option1', 'option2', 'option3']
      });
    });

    it('should add agents to session', () => {
      session.addAgent('a1', { weight: 1.5, role: 'voter' });
      
      assert.ok(session.agents.has('a1'));
      assert.strictEqual(session.agents.get('a1').weight, 1.5);
    });

    it('should accept valid votes', () => {
      session.addAgent('a1');
      
      const result = session.submitVote('a1', 'option1', { reason: 'test' });
      
      assert.strictEqual(result.success, true);
      assert.ok(result.timestamp);
      
      const agent = session.agents.get('a1');
      assert.strictEqual(agent.voted, true);
      assert.strictEqual(agent.vote, 'option1');
    });

    it('should reject invalid votes', () => {
      session.addAgent('a1');
      
      const result = session.submitVote('a1', 'invalid_option');
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Invalid'));
    });

    it('should reject votes from unregistered agents', () => {
      const result = session.submitVote('unknown', 'option1');
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('not registered'));
    });

    it('should reject votes when session closed', () => {
      session.addAgent('a1');
      session.close();
      
      const result = session.submitVote('a1', 'option1');
      
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('closed'));
    });

    it('should handle ranking submissions', () => {
      session.addAgent('a1');
      
      const result = session.submitRanking('a1', ['option1', 'option2', 'option3']);
      
      assert.strictEqual(result.success, true);
      
      const agent = session.agents.get('a1');
      assert.deepStrictEqual(agent.rankings, ['option1', 'option2', 'option3']);
    });

    it('should finalize and calculate results', () => {
      session.addAgent('a1', { weight: 1.0 });
      session.addAgent('a2', { weight: 1.0 });
      session.addAgent('a3', { weight: 1.0 });
      
      session.submitVote('a1', 'option1');
      session.submitVote('a2', 'option1');
      session.submitVote('a3', 'option2');
      
      const result = session.finalize();
      
      assert.strictEqual(result.sessionId, 'test-session');
      assert.strictEqual(result.topic, 'Test Topic');
      assert.strictEqual(result.totalAgents, 3);
      assert.strictEqual(result.votedAgents, 3);
      assert.ok(result.consensus);
      assert.ok(result.finalResult);
    });

    it('should track abstentions', () => {
      session.addAgent('a1');
      session.addAgent('a2');
      session.addAgent('a3');
      
      session.submitVote('a1', 'option1');
      // a2 and a3 don't vote
      
      const result = session.finalize();
      
      assert.strictEqual(result.abstained, 2);
    });

    it('should get current status', () => {
      session.addAgent('a1');
      session.addAgent('a2');
      
      session.submitVote('a1', 'option1');
      
      const status = session.getStatus();
      
      assert.strictEqual(status.id, 'test-session');
      assert.strictEqual(status.totalAgents, 2);
      assert.strictEqual(status.votedCount, 1);
      assert.strictEqual(status.pendingCount, 1);
    });

    it('should export session data', () => {
      session.addAgent('a1', { weight: 2.0 });
      session.submitVote('a1', 'option1');
      
      const exported = session.export();
      
      assert.strictEqual(exported.id, 'test-session');
      assert.strictEqual(exported.topic, 'Test Topic');
      assert.ok(exported.agents);
      assert.ok(exported.consensusConfig);
    });
  });

  describe('VoteManager', () => {
    let manager;

    beforeEach(() => {
      manager = new VoteManager();
    });

    it('should create and store sessions', () => {
      const session = manager.createSession({ topic: 'Test' });
      
      assert.ok(session.id);
      assert.ok(manager.getSession(session.id));
      assert.strictEqual(manager.getSession(session.id).topic, 'Test');
    });

    it('should close and remove sessions', () => {
      const session = manager.createSession({ topic: 'Test' });
      
      manager.closeSession(session.id);
      
      assert.strictEqual(manager.getSession(session.id), undefined);
    });

    it('should list all sessions', () => {
      manager.createSession({ topic: 'Topic 1' });
      manager.createSession({ topic: 'Topic 2' });
      
      const sessions = manager.getAllSessions();
      
      assert.strictEqual(sessions.length, 2);
    });

    it('should find sessions by topic', () => {
      manager.createSession({ topic: 'Security Vote' });
      manager.createSession({ topic: 'Security Check' });
      manager.createSession({ topic: 'Random Topic' });
      
      const found = manager.findSessionsByTopic('Security');
      
      assert.strictEqual(found.length, 2);
    });
  });

  describe('SwarmVoting', () => {
    let swarmVoting;

    beforeEach(() => {
      swarmVoting = new SwarmVoting();
    });

    it('should create quick vote sessions', () => {
      const agents = [
        { id: 'a1', weight: 1.0 },
        { id: 'a2', weight: 1.0 }
      ];
      
      const session = swarmVoting.quickVote('Quick Test', agents, {
        options: ['yes', 'no']
      });
      
      assert.ok(session);
      assert.strictEqual(session.topic, 'Quick Test');
      assert.strictEqual(session.agents.size, 2);
    });

    it('should run simple vote end-to-end', () => {
      const votes = {
        a1: { vote: 'option1', weight: 1.0 },
        a2: { vote: 'option1', weight: 1.0 },
        a3: { vote: 'option2', weight: 1.0 }
      };
      
      const result = swarmVoting.simpleVote('Simple Test', votes);
      
      assert.ok(result);
      assert.strictEqual(result.topic, 'Simple Test');
      assert.ok(result.finalResult);
    });
  });
});

// Simple test runner
if (require.main === module) {
  console.log('Running Swarm System Tests...\n');
  
  // Minimal test runner
  const tests = [];
  let currentSuite = null;
  let currentBeforeEach = null;
  
  global.describe = (name, fn) => {
    currentSuite = name;
    fn();
    currentSuite = null;
  };
  
  global.it = (name, fn) => {
    tests.push({ suite: currentSuite, name, fn, beforeEach: currentBeforeEach });
  };
  
  global.beforeEach = (fn) => {
    currentBeforeEach = fn;
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
      if (test.beforeEach) test.beforeEach();
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
