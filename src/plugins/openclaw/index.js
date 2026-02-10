/**
 * OpenClaw DNA Plugin
 * Tích hợp Agent DNA System với OpenClaw
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.2.0
 */

const { Genome } = require('../../genome');
const presets = require('../../presets');
const evolution = require('../../evolution');
const { calculateFitness } = require('./fitness-calculator');
const { dnaToModelParams } = require('./model-adapter');
const { loadConfig, saveConfig } = require('./config');

class OpenClawDNAPlugin {
  constructor(options = {}) {
    this.options = {
      autoEvolve: true,
      evolutionThreshold: 0.6,  // Fitness < 0.6 thì evolve
      trackMetrics: true,
      ...options
    };
    
    this.agents = new Map();  // agentId -> Genome
    this.taskHistory = [];    // Lưu history để calculate fitness
  }

  /**
   * Initialize plugin với OpenClaw instance
   */
  init(openclaw) {
    this.openclaw = openclaw;
    this.setupHooks();
    console.log('✅ Agent DNA Plugin initialized');
  }

  /**
   * Setup lifecycle hooks
   */
  setupHooks() {
    // Hook 1: Before session start - Load DNA
    this.openclaw.on('session:start', (ctx) => {
      this.loadAgentDNA(ctx.agentId);
      this.applyDNAtoContext(ctx);
    });

    // Hook 2: Before tool execution - Apply DNA params
    this.openclaw.on('tool:before', (ctx) => {
      this.applyModelParams(ctx);
    });

    // Hook 3: After tool execution - Track metrics
    this.openclaw.on('tool:after', (ctx, result) => {
      this.trackTaskMetrics(ctx, result);
    });

    // Hook 4: After session end - Evaluate & Evolve
    this.openclaw.on('session:end', (ctx) => {
      this.evaluateAndEvolve(ctx.agentId);
    });
  }

  /**
   * Load hoặc create DNA cho agent
   */
  loadAgentDNA(agentId) {
    if (this.agents.has(agentId)) {
      return this.agents.get(agentId);
    }

    // Try load từ file
    const dna = loadConfig(agentId);
    
    if (dna) {
      const genome = Genome.fromJSON(dna);
      this.agents.set(agentId, genome);
      console.log(`🧬 Loaded DNA for ${agentId} (gen ${genome.generation})`);
      return genome;
    }

    // Create new DNA từ preset
    const newDNA = this.createDefaultDNA(agentId);
    this.agents.set(agentId, newDNA);
    console.log(`🧬 Created new DNA for ${agentId}`);
    return newDNA;
  }

  /**
   * Create default DNA dựa trên agent type
   */
  createDefaultDNA(agentId) {
    // Detect type từ tên agent
    if (agentId.includes('kakashi') || agentId.includes('leader')) {
      return presets.createLeaderDNA(agentId, 1);
    } else if (agentId.includes('shika') || agentId.includes('research')) {
      return presets.createResearcherDNA(agentId, 1);
    } else if (agentId.includes('dev') || agentId.includes('code')) {
      return presets.createDeveloperDNA(agentId, 1);
    }
    
    return presets.createLeaderDNA(agentId, 1);
  }

  /**
   * Apply DNA vào context
   */
  applyDNAtoContext(ctx) {
    const dna = this.agents.get(ctx.agentId);
    if (!dna) return;

    ctx.dna = dna;
    ctx.dnaStats = {
      generation: dna.generation,
      fitness: dna.fitness,
      tasksCompleted: dna.tasksCompleted
    };
  }

  /**
   * Convert DNA thành OpenClaw model parameters
   */
  applyModelParams(ctx) {
    const dna = this.agents.get(ctx.agentId);
    if (!dna) return;

    const params = dnaToModelParams(dna);
    
    // Apply vào context
    ctx.modelParams = {
      ...ctx.modelParams,
      ...params
    };

    // Log nếu debug mode
    if (this.options.debug) {
      console.log('🔧 DNA Params applied:', params);
    }
  }

  /**
   * Track metrics sau mỗi task
   */
  trackTaskMetrics(ctx, result) {
    if (!this.options.trackMetrics) return;

    const metrics = {
      agentId: ctx.agentId,
      timestamp: Date.now(),
      success: result.success,
      tokensUsed: result.tokensUsed || 0,
      duration: result.duration || 0,
      toolName: result.toolName,
      quality: result.quality || 0.5  // User rating hoặc auto-evaluate
    };

    this.taskHistory.push(metrics);

    // Limit history size
    if (this.taskHistory.length > 1000) {
      this.taskHistory = this.taskHistory.slice(-500);
    }
  }

  /**
   * Evaluate fitness và evolve nếu cần
   */
  evaluateAndEvolve(agentId) {
    const dna = this.agents.get(agentId);
    if (!dna) return;

    // Get recent tasks cho agent này
    const agentTasks = this.taskHistory
      .filter(t => t.agentId === agentId)
      .slice(-20);  // Last 20 tasks

    if (agentTasks.length === 0) return;

    // Calculate fitness
    const newFitness = calculateFitness(agentTasks);
    const oldFitness = dna.fitness;
    
    dna.fitness = newFitness;
    dna.tasksCompleted += agentTasks.length;
    dna.tasksSucceeded += agentTasks.filter(t => t.success).length;

    console.log(`📊 ${agentId} fitness: ${oldFitness.toFixed(3)} → ${newFitness.toFixed(3)}`);

    // Auto-evolve nếu fitness thấp
    if (this.options.autoEvolve && newFitness < this.options.evolutionThreshold) {
      console.log(`🔄 Triggering evolution for ${agentId} (fitness < ${this.options.evolutionThreshold})`);
      this.scheduleEvolution(agentId);
    }

    // Save DNA
    this.saveAgentDNA(agentId);
  }

  /**
   * Schedule evolution cho agent
   */
  scheduleEvolution(agentId) {
    // Tìm parent tốt nhất để breed
    const candidates = Array.from(this.agents.entries())
      .filter(([id, dna]) => id !== agentId && dna.fitness > 0.5)
      .sort((a, b) => b[1].fitness - a[1].fitness);

    if (candidates.length === 0) {
      console.log(`⚠️ No suitable breeding partner for ${agentId}`);
      return;
    }

    const parentB = candidates[0][1];
    const currentDNA = this.agents.get(agentId);

    // Tạo offspring
    const children = evolution.createOffspring(
      currentDNA, 
      parentB, 
      1, 
      'best-of-both',
      currentDNA.generation + 1
    );

    const newDNA = children[0];
    newDNA.agentId = agentId;  // Giữ nguyên ID

    // Mutate slightly
    evolution.mutateGenome(newDNA, 0.1, 0.05);

    // Replace
    this.agents.set(agentId, newDNA);
    
    console.log(`✨ ${agentId} evolved to generation ${newDNA.generation}`);
    this.saveAgentDNA(agentId);
  }

  /**
   * Save DNA xuống file
   */
  saveAgentDNA(agentId) {
    const dna = this.agents.get(agentId);
    if (dna) {
      saveConfig(agentId, dna.toJSON());
    }
  }

  /**
   * Get stats cho dashboard
   */
  getStats(agentId) {
    const dna = this.agents.get(agentId);
    if (!dna) return null;

    const agentTasks = this.taskHistory.filter(t => t.agentId === agentId);

    return {
      agentId,
      generation: dna.generation,
      fitness: dna.fitness,
      tasksCompleted: dna.tasksCompleted,
      tasksSucceeded: dna.tasksSucceeded,
      successRate: dna.tasksCompleted > 0 
        ? dna.tasksSucceeded / dna.tasksCompleted 
        : 0,
      recentTasks: agentTasks.slice(-10),
      genes: {
        cognitive: Object.keys(dna.cognitive).length,
        skills: Object.keys(dna.skills).length,
        learning: Object.keys(dna.learning).length
      }
    };
  }
}

module.exports = OpenClawDNAPlugin;
