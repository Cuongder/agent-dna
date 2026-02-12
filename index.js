/**
 * OpenClaw Agent DNA Plugin
 * 
 * OpenClaw = Body (Framework)
 * Agent DNA = Soul (Evolution)
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
    // SESSION START - Load DNA and inject into config
    this.openclaw.on('session:start', async (ctx) => {
      await this.loadAgentDNA(ctx);
      this.injectDNAIntoConfig(ctx);
      this.log('🧬 DNA injected into session', 'info');
    });

    // BEFORE TOOL - Apply epigenetic context
    this.openclaw.on('tool:before', (ctx) => {
      this.applyEpigeneticContext(ctx);
    });

    // AFTER TOOL - Evaluate and learn
    this.openclaw.on('tool:after', async (ctx, result) => {
      await this.evaluatePerformance(ctx, result);
    });

    // SESSION END - Evolve and save
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
      const data = await fs.readFile(dnaPath, 'utf8');
      this.agent = JSON.parse(data);
      this.log(`🧬 Loaded DNA for ${this.options.agentId} (Gen ${this.agent.generation})`, 'info');
    } catch {
      this.agent = this.createDefaultDNA();
      await this.saveDNA();
      this.log(`✨ Created new DNA for ${this.options.agentId}`, 'success');
    }
    
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
        creativity: { value: 0.7, mutable: true, description: 'Novelty seeking' },
        analytical: { value: 0.7, mutable: true, description: 'Logical reasoning' },
        caution: { value: 0.6, mutable: true, description: 'Risk assessment' },
        speed: { value: 0.6, mutable: true, description: 'Processing speed' },
        thoroughness: { value: 0.7, mutable: true, description: 'Completeness' }
      },
      skills: {
        coding: { value: 0.7, mutable: true },
        reasoning: { value: 0.7, mutable: true },
        communication: { value: 0.7, mutable: true }
      },
      learning: {
        adaptationRate: { value: 0.3, mutable: true },
        memoryRetention: { value: 0.7, mutable: true }
      },
      epigenetics: {
        currentContext: null,
        temporaryModifiers: {}
      }
    };
  }

  /**
   * INJECT DNA INTO LLM CONFIG
   * Translates genes to LLM parameters
   */
  injectDNAIntoConfig(ctx) {
    if (!this.agent) return;

    const genes = this.agent.cognitive;
    
    ctx.llmConfig = {
      temperature: 0.1 + (genes.creativity.value * 0.9),
      maxTokens: 500 + Math.floor(genes.thoroughness.value * 7500),
      thinking: genes.analytical.value > 0.7 ? 'high' : 'low',
      model: this.selectModel(genes.caution.value),
      timeout: 30000 + Math.floor((1 - genes.speed.value) * 270000),
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
    if (cautionValue > 0.8) return 'gemini-3-pro';
    if (cautionValue > 0.5) return 'gemini-3-flash';
    return 'gemini-3-flash-lite';
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

    if (promptLower.includes('code') || promptLower.includes('function') || promptLower.includes('api')) {
      contextType = 'coding';
      modifiers.caution = 0.9;
      modifiers.thoroughness = 0.9;
      modifiers.creativity = 0.5;
    } 
    else if (promptLower.includes('creative') || promptLower.includes('write') || promptLower.includes('story')) {
      contextType = 'creative';
      modifiers.creativity = 0.95;
      modifiers.analytical = 0.4;
    }
    else if (promptLower.includes('urgent') || promptLower.includes('quick')) {
      contextType = 'urgent';
      modifiers.speed = 0.95;
      modifiers.caution = 0.3;
      modifiers.thoroughness = 0.4;
    }
    else if (promptLower.includes('analyze') || promptLower.includes('research')) {
      contextType = 'research';
      modifiers.analytical = 0.95;
      modifiers.thoroughness = 0.9;
    }

    this.agent.epigenetics.currentContext = contextType;
    this.agent.epigenetics.temporaryModifiers = modifiers;
    
    if (ctx.llmConfig) {
      if (modifiers.caution) ctx.llmConfig.model = this.selectModel(modifiers.caution);
      if (modifiers.creativity) ctx.llmConfig.temperature = 0.1 + (modifiers.creativity * 0.9);
      if (modifiers.thoroughness) ctx.llmConfig.maxTokens = 500 + Math.floor(modifiers.thoroughness * 7500);
    }

    if (contextType !== 'general') {
      this.log(`🎭 Context: ${contextType}`, 'info');
    }
  }

  /**
   * EVALUATE PERFORMANCE
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

    let qualityScore = 0.5;

    if (metrics.success) {
      qualityScore += 0.3;
      if (metrics.duration > 1000 && metrics.duration < 30000) qualityScore += 0.1;
      if (metrics.outputLength > 100) qualityScore += 0.05;
      if (metrics.outputLength > 500) qualityScore += 0.05;
      
      const output = result.output || '';
      if (output.includes('```')) qualityScore += 0.05;
      if (output.includes('##') || output.includes('1.')) qualityScore += 0.05;
    } else {
      qualityScore -= 0.3;
    }

    qualityScore = Math.max(0, Math.min(1, qualityScore));
    metrics.quality = qualityScore;

    this.sessionMetrics.tasksCompleted++;
    if (metrics.success) this.sessionMetrics.tasksSucceeded++;
    this.sessionMetrics.totalQuality += qualityScore;
    this.sessionMetrics.totalTokens += metrics.tokensUsed;
    this.sessionMetrics.totalDuration += metrics.duration;

    const currentFitness = this.agent.fitness || 0.5;
    const adaptationRate = this.agent.learning?.adaptationRate?.value || 0.3;
    this.agent.fitness = currentFitness * (1 - adaptationRate) + qualityScore * adaptationRate;

    this.adjustGenes(metrics);

    this.log(
      `${metrics.success ? '✅' : '❌'} ${metrics.success ? 'Success' : 'Failed'} ` +
      `(Q:${(qualityScore * 100).toFixed(0)}% F:${(this.agent.fitness * 100).toFixed(1)}%)`,
      metrics.success ? 'success' : 'error'
    );

    await this.saveDNA();
  }

  /**
   * Adjust genes based on performance
   */
  adjustGenes(metrics) {
    const genes = this.agent.cognitive;
    const learningRate = this.agent.learning?.adaptationRate?.value || 0.1;

    if (metrics.success && metrics.quality > 0.8) {
      if (genes.speed.value < 0.9) {
        genes.speed.value = Math.min(1, genes.speed.value + learningRate * 0.5);
      }
    } else if (!metrics.success) {
      genes.caution.value = Math.min(1, genes.caution.value + learningRate);
      genes.analytical.value = Math.min(1, genes.analytical.value + learningRate * 0.5);
      genes.creativity.value = Math.max(0.1, genes.creativity.value - learningRate * 0.3);
    }
    
    if (metrics.duration > 60000) {
      genes.speed.value = Math.min(1, genes.speed.value + learningRate * 0.3);
      genes.thoroughness.value = Math.max(0.1, genes.thoroughness.value - learningRate * 0.2);
    }
  }

  /**
   * FINALIZE SESSION
   */
  async finalizeSession(ctx) {
    if (!this.agent) return;

    const successRate = this.sessionMetrics.tasksCompleted > 0 
      ? this.sessionMetrics.tasksSucceeded / this.sessionMetrics.tasksCompleted 
      : 0;

    this.log(`📊 Session: ${this.sessionMetrics.tasksCompleted} tasks, ${(successRate * 100).toFixed(0)}% success`, 'info');

    if (this.options.autoEvolve && this.agent.fitness < this.options.evolutionThreshold) {
      await this.evolveAgent();
    }

    this.agent.epigenetics = { currentContext: null, temporaryModifiers: {} };
    await this.saveDNA();
    this.log('💾 DNA saved', 'info');
  }

  /**
   * EVOLVE AGENT
   */
  async evolveAgent() {
    const genes = this.agent.cognitive;
    
    Object.keys(genes).forEach(geneName => {
      const gene = genes[geneName];
      if (gene.mutable) {
        const mutation = (Math.random() - 0.5) * 0.2;
        gene.value = Math.max(0.1, Math.min(1, gene.value + mutation));
      }
    });

    this.agent.generation++;
    this.agent.lastEvolved = new Date().toISOString();
    
    this.log(`🧬🔄 Evolved to Gen ${this.agent.generation}!`, 'success');
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
   * Logger
   */
  log(message, type = 'info') {
    const prefix = '[AgentDNA]';
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (this.openclaw?.emit) {
      this.openclaw.emit('dna:log', { message, type, timestamp });
    }
  }
}

module.exports = AgentDNAPlugin;
