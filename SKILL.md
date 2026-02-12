/**
 * OpenClaw Agent DNA Plugin
 * 
 * OpenClaw = Body (Framework)
 * Agent DNA = Soul (Evolution)
 * 
 * Lifecycle:
 * 1. session:start → Inject DNA genes into LLM config
 * 2. tool:before → Apply context-specific epigenetics  
 * 3. tool:after → Evaluate performance, update fitness
 * 4. session:end → Evolve if needed, save DNA
 * 
 * @author Team 7
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');

class AgentDNAPlugin {
  constructor(openclaw, options = {}) {
    this.openclaw = openclaw;
    this.options = {
      dnaDir: options.dnaDir || path.join(process.env.HOME, '.openclaw', 'dna'),
      agentId: options.agentId || 'default-agent',
      autoEvolve: options.autoEvolve !== false,
      evolutionThreshold: options.evolutionThreshold || 0.6,
      ...options
    };
    
    this.agent = null;
    this.sessionMetrics = {
      tasksCompleted: 0,
      tasksSucceeded: 0,
      totalQuality: 0,
      totalTokens: 0,
      totalDuration: 0
    };
    
    this.setupHooks();
  }

  /**
   * Setup OpenClaw lifecycle hooks
   */
  setupHooks() {
    // 1. SESSION START - Load DNA and inject into config
    this.openclaw.on('session:start', async (ctx) => {
      await this.loadAgentDNA(ctx);
      this.injectDNAIntoConfig(ctx);
      this.log('🧬 DNA injected into session', 'info');
    });

    // 2. BEFORE TOOL - Apply epigenetic context
    this.openclaw.on('tool:before', (ctx) => {
      this.applyEpigeneticContext(ctx);
    });

    // 3. AFTER TOOL - Evaluate and learn
    this.openclaw.on('tool:after', async (ctx, result) => {
      await this.evaluatePerformance(ctx, result);
    });

    // 4. SESSION END - Evolve and save
    this.openclaw.on('session:end', async (ctx) => {
      await this.finalizeSession(ctx);
    });
  }

  /**
   * Load agent DNA from disk or create new
   */
  async loadAgentDNA(ctx) {
    const dnaPath = path.join(this.options.dnaDir, `${this.options.agentId}.json`);
    
    try {
      // Try to load existing DNA
      const data = await fs.readFile(dnaPath, 'utf8');
      this.agent = JSON.parse(data);
      this.log(`🧬 Loaded DNA for ${this.options.agentId} (Gen ${this.agent.generation})`, 'info');
    } catch {
      // Create new DNA
      this.agent = this.createDefaultDNA();
      await this.saveDNA();
      this.log(`✨ Created new DNA for ${this.options.agentId}`, 'success');
    }
    
    // Attach to context for other plugins/tools
    ctx.agentDNA = this.agent;
  }

  /**
   * Create default DNA for new agent
   */
  createDefaultDNA() {
    return {
      agentId: this.options.agentId,
      generation: 1,
      fitness: 0.5,
      tasksCompleted: 0,
      tasksSucceeded: 0,
      createdAt: new Date().toISOString(),
      cognitive: {
        // How creative vs conservative
        creativity: { value: 0.7, mutable: true, description: 'Novelty seeking' },
        // How analytical vs intuitive  
        analytical: { value: 0.7, mutable: true, description: 'Logical reasoning' },
        // How careful vs reckless
        caution: { value: 0.6, mutable: true, description: 'Risk assessment' },
        // How fast vs thorough
        speed: { value: 0.6, mutable: true, description: 'Processing speed' },
        // Detail orientation
        thoroughness: { value: 0.7, mutable: true, description: 'Completeness' }
      },
      skills: {
        coding: { value: 0.7, mutable: true },
        reasoning: { value: 0.7, mutable: true },
        communication: { value: 0.7, mutable: true }
      },
      learning: {
        adaptationRate: { value: 0.3, mutable: true, description: 'How fast to learn from feedback' },
        memoryRetention: { value: 0.7, mutable: true, description: 'How well to remember past lessons' }
      },
      // Epigenetic markers - temporary modifications
      epigenetics: {
        currentContext: null,
        temporaryModifiers: {}
      }
    };
  }

  /**
   * INJECT DNA INTO LLM CONFIG
   * This is the core - translating genes to LLM parameters
   */
  injectDNAIntoConfig(ctx) {
    if (!this.agent) return;

    const genes = this.agent.cognitive;
    
    // Map genes to LLM config
    ctx.llmConfig = {
      // Creativity gene → Temperature (0.1 to 1.0)
      temperature: 0.1 + (genes.creativity.value * 0.9),
      
      // Thoroughness gene → Max tokens
      maxTokens: 500 + Math.floor(genes.thoroughness.value * 7500),
      
      // Analytical gene → Thinking mode
      thinking: genes.analytical.value > 0.7 ? 'high' : 'low',
      
      // Caution gene → Model selection
      model: this.selectModel(genes.caution.value),
      
      // Speed gene → Timeout
      timeout: 30000 + Math.floor((1 - genes.speed.value) * 270000),
      
      // Custom headers for tracking
      headers: {
        'X-Agent-ID': this.options.agentId,
        'X-Agent-Gen': this.agent.generation.toString(),
        'X-Agent-Fitness': this.agent.fitness.toFixed(2)
      }
    };

    this.log(`🎯 Config: temp=${ctx.llmConfig.temperature.toFixed(2)}, model=${ctx.llmConfig.model}`, 'info');
  }

  /**
   * Select model based on caution gene
   */
  selectModel(cautionValue) {
    if (cautionValue > 0.8) return 'gemini-3-pro';      // Very careful → Best model
    if (cautionValue > 0.5) return 'gemini-3-flash';    // Moderate → Fast model  
    return 'gemini-3-flash-lite';                        // Fast → Cheapest model
  }

  /**
   * APPLY EPIGENETIC CONTEXT
   * Temporary gene modifications based on task context
   */
  applyEpigeneticContext(ctx) {
    if (!this.agent) return;

    const prompt = ctx.prompt || ctx.message || '';
    const promptLower = prompt.toLowerCase();
    
    let contextType = 'general';
    const modifiers = {};

    // Detect context from prompt
    if (promptLower.includes('code') || promptLower.includes('function') || promptLower.includes('api')) {
      contextType = 'coding';
      modifiers.caution = 0.9;        // Code needs caution
      modifiers.thoroughness = 0.9;   // Code needs completeness
      modifiers.creativity = 0.5;     // Code needs less creativity
    } 
    else if (promptLower.includes('creative') || promptLower.includes('write') || promptLower.includes('story')) {
      contextType = 'creative';
      modifiers.creativity = 0.95;    // Writing needs creativity
      modifiers.analytical = 0.4;     // Writing needs less analysis
    }
    else if (promptLower.includes('urgent') || promptLower.includes('quick') || promptLower.includes('fast')) {
      contextType = 'urgent';
      modifiers.speed = 0.95;         // Fast response
      modifiers.caution = 0.3;        // Less caution for speed
      modifiers.thoroughness = 0.4;   // Less thorough for speed
    }
    else if (promptLower.includes('analyze') || promptLower.includes('research') || promptLower.includes('investigate')) {
      contextType = 'research';
      modifiers.analytical = 0.95;    // Deep analysis
      modifiers.thoroughness = 0.9;   // Thorough research
      modifiers.creativity = 0.6;     // Some creativity for insights
    }

    // Apply modifiers temporarily
    this.agent.epigenetics.currentContext = contextType;
    this.agent.epigenetics.temporaryModifiers = modifiers;
    
    // Update config with modifiers
    if (ctx.llmConfig) {
      if (modifiers.caution) ctx.llmConfig.model = this.selectModel(modifiers.caution);
      if (modifiers.creativity) ctx.llmConfig.temperature = 0.1 + (modifiers.creativity * 0.9);
      if (modifiers.thoroughness) ctx.llmConfig.maxTokens = 500 + Math.floor(modifiers.thoroughness * 7500);
    }

    if (contextType !== 'general') {
      this.log(`🎭 Context switch: ${contextType}`, 'info');
    }
  }

  /**
   * EVALUATE PERFORMANCE
   * After each tool execution, score the result
   */
  async evaluatePerformance(ctx, result) {
    if (!this.agent) return;

    const metrics = {
      success: result.success || !result.error,
      duration: result.duration || 0,
      tokensUsed: result.tokensUsed || result.usage?.totalTokens || 0,
      outputLength: result.output?.length || 0,
      hasError: !!result.error,
      timestamp: new Date().toISOString()
    };

    // Calculate quality score (0-1)
    let qualityScore = 0.5; // Base score

    if (metrics.success) {
      qualityScore += 0.3; // Success bonus
      
      // Efficiency bonus (faster is better, but not too fast)
      if (metrics.duration > 1000 && metrics.duration < 30000) {
        qualityScore += 0.1;
      }
      
      // Completeness bonus
      if (metrics.outputLength > 100) qualityScore += 0.05;
      if (metrics.outputLength > 500) qualityScore += 0.05;
      
      // Check for quality indicators in output
      const output = result.output || '';
      if (output.includes('```')) qualityScore += 0.05; // Has code blocks
      if (output.includes('##') || output.includes('1.')) qualityScore += 0.05; // Structured
    } else {
      qualityScore -= 0.3; // Error penalty
    }

    // Clamp to 0-1
    qualityScore = Math.max(0, Math.min(1, qualityScore));
    metrics.quality = qualityScore;

    // Update session metrics
    this.sessionMetrics.tasksCompleted++;
    if (metrics.success) this.sessionMetrics.tasksSucceeded++;
    this.sessionMetrics.totalQuality += qualityScore;
    this.sessionMetrics.totalTokens += metrics.tokensUsed;
    this.sessionMetrics.totalDuration += metrics.duration;

    // Update agent fitness (moving average)
    const currentFitness = this.agent.fitness || 0.5;
    const adaptationRate = this.agent.learning?.adaptationRate?.value || 0.3;
    this.agent.fitness = currentFitness * (1 - adaptationRate) + qualityScore * adaptationRate;

    // Adjust genes based on feedback (learning)
    this.adjustGenes(metrics);

    this.log(
      `${metrics.success ? '✅' : '❌'} Task ${metrics.success ? 'succeeded' : 'failed'} ` +
      `(Quality: ${(qualityScore * 100).toFixed(0)}%, Fitness: ${(this.agent.fitness * 100).toFixed(1)}%)`,
      metrics.success ? 'success' : 'error'
    );

    // Save after each task
    await this.saveDNA();
  }

  /**
   * Adjust genes based on performance feedback
   */
  adjustGenes(metrics) {
    const genes = this.agent.cognitive;
    const learningRate = this.agent.learning?.adaptationRate?.value || 0.1;

    if (metrics.success && metrics.quality > 0.8) {
      // High quality success - reinforce current approach
      if (genes.speed.value < 0.9) {
        genes.speed.value = Math.min(1, genes.speed.value + learningRate * 0.5);
      }
    } 
    else if (!metrics.success) {
      // Failure - increase caution
      genes.caution.value = Math.min(1, genes.caution.value + learningRate);
      genes.analytical.value = Math.min(1, genes.analytical.value + learningRate * 0.5);
      
      // Decrease creativity on failure (be more conservative)
      genes.creativity.value = Math.max(0.1, genes.creativity.value - learningRate * 0.3);
    }
    
    // If took too long, increase speed
    if (metrics.duration > 60000) {
      genes.speed.value = Math.min(1, genes.speed.value + learningRate * 0.3);
      genes.thoroughness.value = Math.max(0.1, genes.thoroughness.value - learningRate * 0.2);
    }
  }

  /**
   * FINALIZE SESSION
   * Evolve if needed and save DNA
   */
  async finalizeSession(ctx) {
    if (!this.agent) return;

    const successRate = this.sessionMetrics.tasksCompleted > 0 
      ? this.sessionMetrics.tasksSucceeded / this.sessionMetrics.tasksCompleted 
      : 0;

    this.log(`📊 Session complete: ${this.sessionMetrics.tasksCompleted} tasks, ${(successRate * 100).toFixed(0)}% success`, 'info');

    // Auto-evolve if fitness is low and enabled
    if (this.options.autoEvolve && this.agent.fitness < this.options.evolutionThreshold) {
      await this.evolveAgent();
    }

    // Clear epigenetic markers
    this.agent.epigenetics = {
      currentContext: null,
      temporaryModifiers: {}
    };

    await this.saveDNA();
    this.log('💾 DNA saved', 'info');
  }

  /**
   * EVOLVE AGENT
   * Create next generation with mutations
   */
  async evolveAgent() {
    const genes = this.agent.cognitive;
    
    // Apply random mutations to mutable genes
    Object.keys(genes).forEach(geneName => {
      const gene = genes[geneName];
      if (gene.mutable) {
        const mutation = (Math.random() - 0.5) * 0.2; // ±10% mutation
        gene.value = Math.max(0.1, Math.min(1, gene.value + mutation));
      }
    });

    this.agent.generation++;
    this.agent.lastEvolved = new Date().toISOString();
    
    this.log(`🧬🔄 Agent evolved to Generation ${this.agent.generation}!`, 'success');
  }

  /**
   * Save DNA to disk
   */
  async saveDNA() {
    try {
      await fs.mkdir(this.options.dnaDir, { recursive: true });
      const dnaPath = path.join(this.options.dnaDir, `${this.options.agentId}.json`);
      await fs.writeFile(dnaPath, JSON.stringify(this.agent, null, 2));
    } catch (err) {
      this.log('Failed to save DNA: ' + err.message, 'error');
    }
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      agent: this.agent,
      session: this.sessionMetrics,
      config: this.agent ? this.getCurrentConfig() : null
    };
  }

  /**
   * Get current LLM config from DNA
   */
  getCurrentConfig() {
    if (!this.agent) return null;
    
    const genes = this.agent.cognitive;
    const modifiers = this.agent.epigenetics?.temporaryModifiers || {};
    
    return {
      temperature: 0.1 + ((modifiers.creativity || genes.creativity.value) * 0.9),
      maxTokens: 500 + Math.floor((modifiers.thoroughness || genes.thoroughness.value) * 7500),
      model: this.selectModel(modifiers.caution || genes.caution.value),
      thinking: (modifiers.analytical || genes.analytical.value) > 0.7 ? 'high' : 'low'
    };
  }

  /**
   * Logger
   */
  log(message, type = 'info') {
    const prefix = '[AgentDNA]';
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    // Emit to OpenClaw if available
    if (this.openclaw?.emit) {
      this.openclaw.emit('dna:log', { message, type, timestamp });
    }
  }
}

// Export for OpenClaw plugin system
module.exports = AgentDNAPlugin;

// Auto-register if loaded by OpenClaw
if (typeof global.openclaw !== 'undefined') {
  global.openclaw.use((openclaw) => new AgentDNAPlugin(openclaw));
}
