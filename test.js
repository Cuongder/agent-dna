#!/usr/bin/env node
/**
 * Test Agent DNA Plugin with OpenClaw
 * 
 * This demonstrates how the plugin integrates with OpenClaw
 */

const AgentDNAPlugin = require('./index.js');

// Mock OpenClaw for testing
class MockOpenClaw {
  constructor() {
    this.events = {};
    this.sessionCount = 0;
    this.llmConfig = {};
  }

  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  }

  async emit(event, ...args) {
    console.log(`\n📡 Event: ${event}`);
    if (this.events[event]) {
      for (const handler of this.events[event]) {
        await handler(...args);
      }
    }
  }

  use(PluginClass, options) {
    console.log('🔌 Loading plugin:', PluginClass.name);
    this.plugin = new PluginClass(this, options);
  }
}

// Mock LLM response
async function mockLLMCall(config, prompt) {
  console.log(`   🤖 Calling LLM:`);
  console.log(`      - Model: ${config.model}`);
  console.log(`      - Temperature: ${config.temperature?.toFixed(2)}`);
  console.log(`      - Max Tokens: ${config.maxTokens}`);
  console.log(`      - Thinking: ${config.thinking}`);
  
  // Simulate processing time
  await new Promise(r => setTimeout(r, 100));
  
  // Mock response based on prompt
  let output = '';
  if (prompt.includes('code')) {
    output = '```javascript\nfunction example() {\n  return "Hello World";\n}\n```';
  } else if (prompt.includes('creative')) {
    output = 'Here is a creative story about AI...';
  } else {
    output = 'Here is my response to your question...';
  }
  
  return {
    output,
    tokensUsed: Math.floor(Math.random() * 500) + 100,
    duration: Math.floor(Math.random() * 2000) + 500
  };
}

// Simulate a full session
async function simulateSession(openclaw, userMessage, sessionId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 SIMULATING SESSION #${sessionId}`);
  console.log(`👤 User: "${userMessage}"`);
  console.log('='.repeat(60));

  const ctx = {
    sessionId,
    prompt: userMessage,
    message: userMessage,
    llmConfig: {}
  };

  // 1. Session Start
  await openclaw.emit('session:start', ctx);

  // 2. Before Tool
  await openclaw.emit('tool:before', ctx);

  // 3. Mock LLM Call
  console.log('\n   ⚙️  Executing with DNA-injected config...');
  const result = await mockLLMCall(ctx.llmConfig, userMessage);
  
  // 4. After Tool
  await openclaw.emit('tool:after', ctx, {
    success: true,
    output: result.output,
    tokensUsed: result.tokensUsed,
    duration: result.duration
  });

  // 5. Session End
  await openclaw.emit('session:end', ctx);

  console.log('\n✅ Session complete!');
}

// Main test
async function main() {
  console.log('🧬 AGENT DNA PLUGIN TEST');
  console.log('========================\n');

  // Create mock OpenClaw
  const openclaw = new MockOpenClaw();

  // Load Agent DNA Plugin
  openclaw.use(AgentDNAPlugin, {
    agentId: 'test-kakashi',
    autoEvolve: true,
    evolutionThreshold: 0.6
  });

  // Simulate multiple sessions to show evolution
  const sessions = [
    'Write a JavaScript function to calculate factorial',
    'Create a creative story about AI',
    'Write a Python API endpoint',
    'Generate a marketing slogan',
    'Debug this code error'
  ];

  for (let i = 0; i < sessions.length; i++) {
    await simulateSession(openclaw, sessions[i], i + 1);
    await new Promise(r => setTimeout(r, 500));
  }

  // Show final stats
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL AGENT STATS');
  console.log('='.repeat(60));
  
  const stats = openclaw.plugin.getStats();
  console.log(`Agent ID: ${stats.agent.agentId}`);
  console.log(`Generation: ${stats.agent.generation}`);
  console.log(`Fitness: ${(stats.agent.fitness * 100).toFixed(1)}%`);
  console.log(`Tasks Completed: ${stats.agent.tasksCompleted}`);
  console.log(`Tasks Succeeded: ${stats.agent.tasksSucceeded}`);
  console.log(`\nGenes:`);
  Object.entries(stats.agent.cognitive).forEach(([name, gene]) => {
    console.log(`  ${name}: ${(gene.value * 100).toFixed(0)}% ${gene.mutable ? '(mutable)' : ''}`);
  });

  console.log('\n✨ Test complete! Check ~/.openclaw/dna/ for saved DNA.');
}

main().catch(console.error);
