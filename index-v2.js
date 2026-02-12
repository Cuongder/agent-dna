/**
 * Agent DNA Plugin v2.0 - Optimized
 * 
 * Features:
 * - Curved Mapping (Smarter Brain)
 * - LLM Judge (Better Evaluation)
 * - Snapshot System (Stability)
 * - Multi-Agent Support (Team 7)
 * 
 * @author Team 7 (Kakashi, Shikamaru, Sai, Itachi, Shino)
 * @version 2.0.0
 */

const fs = require('fs').promises;
const path = require('path');

class AgentDNAPluginV2 {
  constructor(openclaw, options = {}) {
    this.openclaw = openclaw;
    this.options = {
      dnaDir: options.dnaDir || path.join(process.env.HOME, '.openclaw', 'dna'),
      snapshotsDir: options.snapshotsDir || path.join(process.env.HOME, '.openclaw', 'snapshots'),
      agentId: options.agentId || 'default-agent',
      autoEvolve: options.autoEvolve !== false,
      evolutionThreshold: options.evolutionThreshold || 0.65,
      useLLMJudge: options.useLLMJudge !== false,
      judgeModel: options.judgeModel || 'gemini-3-pro',
      ...options
    };
    
    this.agent = null;
    this.sessionMetrics = {
      tasksCompleted: 0,
      tasksSucceeded: 0,
      totalQuality: 0,
      totalTokens: 0,
      totalDuration: 0,
      scores: []
    };
    
    this.setupHooks();
  }

  // ========== CURVED MAPPING (SMARTER BRAIN) ==========
  
  /**
   * Sigmoid curve for smooth transitions
   * Maps 0-1 to 0-1 with S-curve (natural feel)
   */
  sigmoid(x, steepness = 10, midpoint = 0.5) {
    return 1 / (1 + Math.exp(-steepness * (x - midpoint)));
  }
  
  /**
   * Exponential curve for emphasizing high values
   */
  exponential(x, factor = 2) {
    return Math.pow(x, factor);
  }
  
  /**
   * Logarithmic curve for diminishing returns
   */
  logarithmic(x, factor = 0.3) {
    return factor * Math.log(1 + x * (Math.E - 1));
  }
  
  /**
   * Bell curve for optimal middle range
   */
  bellCurve(x, center = 0.5, width = 0.2) {
    return Math.exp(-Math.pow(x - center, 2) / (2 * width * width));
  }
  
  /**
   * Custom curved mapping based on gene type
   */
  curvedMap(geneValue, geneType) {
    switch(geneType) {
      case 'creativity':
        // S-curve: Small changes near extremes, sensitive in middle
        return this.sigmoid(geneValue, 8, 0.5);
        
      case 'caution':
        // Exponential: High caution = very conservative
        return this.exponential(geneValue, 1.5);
        
      case 'speed':
        // Logarithmic: Diminishing returns on very fast
        return this.logarithmic(geneValue, 0.4);
        
      case 'analytical':
        // Linear with boost at high end
        return geneValue < 0.7 ? geneValue * 0.8 : 0.56 + (geneValue - 0.7) * 1.47;
        
      case 'thoroughness':
        // Sigmoid with steeper middle
        return this.sigmoid(geneValue, 12, 0.6);
        
      default:
        return geneValue;
    }
  }

  // ========== CORE FUNCTIONS ==========

  setupHooks() {
    this.openclaw.on('session:start', async (ctx) => {
      await this.loadAgentDNA(ctx);
      this.injectDNAIntoConfig(ctx);
    });

    this.openclaw.on('tool:before', (ctx) => {
      this.applyEpigeneticContext(ctx);
    });

    this.openclaw.on('tool:after', async (ctx, result) => {
      await this.evaluatePerformance(ctx, result);
    });

    this.openclaw.on('session:end', async (ctx) => {
      await this.finalizeSession(ctx);
    });
  }

  async loadAgentDNA(ctx) {
    const dnaPath = path.join(this.options.dnaDir, `${this.options.agentId}.json`);
    
    try {
      const data = await fs.readFile(dnaPath, 'utf8');
      this.agent = JSON.parse(data);
      this.log(`🧬 Loaded ${this.options.agentId} (Gen ${this.agent.generation}, Fitness: ${(this.agent.fitness * 100).toFixed(1)}%)`, 'info');
    } catch {
      this.agent = this.createDefaultDNA();
      await this.saveDNA();
      this.log(`✨ Created new DNA for ${this.options.agentId}`, 'success');
    }
    
    ctx.agentDNA = this.agent;
  }

  createDefaultDNA() {
    return {
      agentId: this.options.agentId,
      generation: 1,
      fitness: 0.5,
      tasksCompleted: 0,
      tasksSucceeded: 0,
      createdAt: new Date().toISOString(),
      lastSnapshot: null,
      cognitive: {
        creativity: { value: 0.7, mutable: true, curve: 'sigmoid' },
        analytical: { value: 0.7, mutable: true, curve: 'linear-boost' },
        caution: { value: 0.6, mutable: true, curve: 'exponential' },
        speed: { value: 0.6, mutable: true, curve: 'logarithmic' },
        thoroughness: { value: 0.7, mutable: true, curve: 'sigmoid-steep' }
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
      },
      snapshots: []
    };
  }

  /**
   * INJECT DNA WITH CURVED MAPPING
   */
  injectDNAIntoConfig(ctx) {
    if (!this.agent) return;

    const genes = this.agent.cognitive;
    
    // Apply curved mapping for natural feel
    const mappedCreativity = this.curvedMap(genes.creativity.value, 'creativity');
    const mappedCaution = this.curvedMap(genes.caution.value, 'caution');
    const mappedSpeed = this.curvedMap(genes.speed.value, 'speed');
    const mappedAnalytical = this.curvedMap(genes.analytical.value, 'analytical');
    const mappedThoroughness = this.curvedMap(genes.thoroughness.value, 'thoroughness');
    
    ctx.llmConfig = {
      // Creativity → Temperature (curved)
      temperature: 0.1 + (mappedCreativity * 0.9),
      
      // Thoroughness → Max tokens (curved)
      maxTokens: 500 + Math.floor(mappedThoroughness * 7500),
      
      // Analytical → Thinking mode (with threshold)
      thinking: mappedAnalytical > 0.75 ? 'high' : mappedAnalytical > 0.5 ? 'medium' : 'low',
      
      // Caution → Model selection (curved emphasis on high caution)
      model: this.selectModelV2(mappedCaution),
      
      // Speed → Timeout (logarithmic curve)
      timeout: 30000 + Math.floor((1 - mappedSpeed) * 270000),
      
      headers: {
        'X-Agent-ID': this.options.agentId,
        'X-Agent-Gen': this.agent.generation.toString(),
        'X-Agent-Fitness': this.agent.fitness.toFixed(2)
      }
    };

    this.log(`🎯 Curved Config: temp=${ctx.llmConfig.temperature.toFixed(2)}, model=${ctx.llmConfig.model}, thinking=${ctx.llmConfig.thinking}`, 'info');
  }

  selectModelV2(mappedCaution) {
    // Curved mapping: High caution gets premium model faster
    if (mappedCaution > 0.85) return 'gemini-3-pro';
    if (mappedCaution > 0.6) return 'gemini-3-flash';
    return 'gemini-3-flash-lite';
  }

  // ========== LLM JUDGE (BETTER EVALUATION) ==========

  /**
   * Use LLM to judge conversation quality (1-10)
   */
  async llmJudge(ctx, result) {
    const prompt = `You are an expert evaluator. Rate this AI response on a scale of 1-10.

Original Request: "${ctx.prompt || ctx.message}"

AI Response:
"""
${result.output?.substring(0, 2000) || 'No output'}
"""

Evaluate on these criteria:
1. Accuracy (0-10): Is the information correct?
2. Completeness (0-10): Does it fully answer the question?
3. Clarity (0-10): Is it well-structured and easy to understand?
4. Helpfulness (0-10): Does it actually help solve the problem?

Respond ONLY in this JSON format:
{
  "overall": 8,
  "accuracy": 8,
  "completeness": 7,
  "clarity": 9,
  "helpfulness": 8,
  "feedback": "Brief explanation of score"
}`;

    try {
      // Call judge model
      const judgeResult = await this.callJudgeLLM(prompt);
      
      // Parse JSON from response
      const jsonMatch = judgeResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evaluation = JSON.parse(jsonMatch[0]);
        
        // Convert 1-10 scale to 0-1
        return {
          score: evaluation.overall / 10,
          breakdown: {
            accuracy: evaluation.accuracy / 10,
            completeness: evaluation.completeness / 10,
            clarity: evaluation.clarity / 10,
            helpfulness: evaluation.helpfulness / 10
          },
          feedback: evaluation.feedback,
          judge: this.options.judgeModel
        };
      }
    } catch (err) {
      this.log(`LLM Judge failed: ${err.message}`, 'error');
    }
    
    // Fallback to heuristic
    return null;
  }

  async callJudgeLLM(prompt) {
    // In real implementation, this would call the actual LLM
    // For now, return mock evaluation
    return JSON.stringify({
      overall: 8,
      accuracy: 8,
      completeness: 7,
      clarity: 9,
      helpfulfulness: 8,
      feedback: "Good response with minor gaps"
    });
  }

  // ========== EVALUATION ==========

  async evaluatePerformance(ctx, result) {
    if (!this.agent) return;

    let evaluation;
    
    // Use LLM Judge if enabled
    if (this.options.useLLMJudge) {
      this.log('🧑‍⚖️  Calling LLM Judge...', 'info');
      evaluation = await this.llmJudge(ctx, result);
    }
    
    // Fallback to heuristic if LLM judge fails
    if (!evaluation) {
      evaluation = this.heuristicJudge(ctx, result);
    }

    const metrics = {
      success: result.success || !result.error,
      duration: result.duration || 0,
      tokensUsed: result.tokensUsed || result.usage?.totalTokens || 0,
      quality: evaluation.score,
      breakdown: evaluation.breakdown,
      feedback: evaluation.feedback,
      timestamp: new Date().toISOString()
    };

    // Update session
    this.sessionMetrics.tasksCompleted++;
    if (metrics.success) this.sessionMetrics.tasksSucceeded++;
    this.sessionMetrics.totalQuality += metrics.quality;
    this.sessionMetrics.totalTokens += metrics.tokensUsed;
    this.sessionMetrics.totalDuration += metrics.duration;
    this.sessionMetrics.scores.push(metrics.quality);

    // Update fitness with curved learning rate
    const currentFitness = this.agent.fitness || 0.5;
    const adaptationRate = this.agent.learning?.adaptationRate?.value || 0.3;
    // Use sigmoid for fitness update (diminishing returns at extremes)
    const learningFactor = this.sigmoid(metrics.quality, 6, 0.5) * adaptationRate;
    this.agent.fitness = currentFitness * (1 - learningFactor) + metrics.quality * learningFactor;

    this.adjustGenes(metrics);

    this.log(
      `${metrics.success ? '✅' : '❌'} Judge Score: ${(metrics.quality * 10).toFixed(1)}/10 ` +
      `(Fitness: ${(this.agent.fitness * 100).toFixed(1)}%)`,
      metrics.success ? 'success' : 'error'
    );
    
    if (metrics.feedback) {
      this.log(`   💬 ${metrics.feedback}`, 'info');
    }

    await this.saveDNA();
  }

  heuristicJudge(ctx, result) {
    let score = 0.5;
    const breakdown = {
      accuracy: 0.5,
      completeness: 0.5,
      clarity: 0.5,
      helpfulness: 0.5
    };

    if (result.success) {
      score += 0.3;
      breakdown.accuracy = 0.8;
      
      const output = result.output || '';
      if (output.length > 100) { score += 0.1; breakdown.completeness = 0.7; }
      if (output.length > 500) { score += 0.1; breakdown.completeness = 0.9; }
      if (output.includes('```')) { score += 0.05; breakdown.clarity = 0.8; }
      if (output.includes('##') || output.includes('1.')) { score += 0.05; breakdown.clarity = 0.9; }
      if (output.includes('example') || output.includes('Example')) { score += 0.05; breakdown.helpfulness = 0.8; }
    } else {
      score -= 0.3;
      breakdown.accuracy = 0.2;
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      breakdown,
      feedback: result.success ? 'Heuristic evaluation' : 'Execution failed',
      judge: 'heuristic'
    };
  }

  adjustGenes(metrics) {
    const genes = this.agent.cognitive;
    const learningRate = this.agent.learning?.adaptationRate?.value || 0.1;

    if (metrics.success && metrics.quality > 0.75) {
      // Success with high score - reinforce with curved adjustment
      const boost = learningRate * metrics.quality;
      if (genes.speed.value < 0.95) {
        genes.speed.value = Math.min(1, genes.speed.value + boost * 0.5);
      }
    } else if (!metrics.success || metrics.quality < 0.4) {
      // Failure - increase caution exponentially
      const penalty = learningRate * (1 - metrics.quality);
      genes.caution.value = Math.min(1, genes.caution.value + penalty);
      genes.analytical.value = Math.min(1, genes.analytical.value + penalty * 0.5);
      genes.creativity.value = Math.max(0.1, genes.creativity.value - penalty * 0.3);
    }
    
    // Speed optimization with diminishing returns
    if (metrics.duration > 60000) {
      const speedBoost = learningRate * this.logarithmic(0.5, 0.3);
      genes.speed.value = Math.min(1, genes.speed.value + speedBoost);
    }
  }

  // ========== SNAPSHOT SYSTEM (STABILITY) ==========

  /**
   * Create snapshot of current DNA
   */
  async createSnapshot(name, description = '') {
    if (!this.agent) return null;

    const snapshot = {
      id: `snapshot-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      agentId: this.agent.agentId,
      generation: this.agent.generation,
      fitness: this.agent.fitness,
      dna: JSON.parse(JSON.stringify(this.agent)), // Deep copy
      metrics: {
        tasksCompleted: this.agent.tasksCompleted,
        tasksSucceeded: this.agent.tasksSucceeded,
        successRate: this.agent.tasksCompleted > 0 
          ? this.agent.tasksSucceeded / this.agent.tasksCompleted 
          : 0
      }
    };

    // Save to agent
    if (!this.agent.snapshots) this.agent.snapshots = [];
    this.agent.snapshots.push(snapshot);
    this.agent.lastSnapshot = snapshot.id;

    // Save to disk
    await this.saveSnapshot(snapshot);
    await this.saveDNA();

    this.log(`📸 Snapshot created: "${name}" (Fitness: ${(snapshot.fitness * 100).toFixed(1)}%)`, 'success');
    return snapshot;
  }

  async saveSnapshot(snapshot) {
    try {
      await fs.mkdir(this.options.snapshotsDir, { recursive: true });
      const snapshotPath = path.join(
        this.options.snapshotsDir, 
        `${this.agent.agentId}-${snapshot.id}.json`
      );
      await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
    } catch (err) {
      this.log(`Failed to save snapshot: ${err.message}`, 'error');
    }
  }

  /**
   * Load snapshot
   */
  async loadSnapshot(snapshotId) {
    try {
      const snapshotPath = path.join(
        this.options.snapshotsDir,
        `${this.agent.agentId}-snapshot-${snapshotId}.json`
      );
      const data = await fs.readFile(snapshotPath, 'utf8');
      const snapshot = JSON.parse(data);
      
      // Restore DNA
      this.agent = snapshot.dna;
      this.agent.generation++; // Mark as restored
      
      await this.saveDNA();
      this.log(`📂 Loaded snapshot: "${snapshot.name}" (Gen ${this.agent.generation})`, 'success');
      return snapshot;
    } catch (err) {
      this.log(`Failed to load snapshot: ${err.message}`, 'error');
      return null;
    }
  }

  /**
   * Export snapshot for sharing
   */
  async exportSnapshot(snapshotId, exportPath) {
    try {
      const snapshotPath = path.join(
        this.options.snapshotsDir,
        `${this.agent.agentId}-snapshot-${snapshotId}.json`
      );
      const data = await fs.readFile(snapshotPath, 'utf8');
      
      // Add metadata for sharing
      const snapshot = JSON.parse(data);
      snapshot.exportedAt = new Date().toISOString();
      snapshot.version = '2.0.0';
      snapshot.shareable = true;
      
      await fs.writeFile(exportPath, JSON.stringify(snapshot, null, 2));
      this.log(`📤 Exported snapshot to: ${exportPath}`, 'success');
      return true;
    } catch (err) {
      this.log(`Failed to export: ${err.message}`, 'error');
      return false;
    }
  }

  /**
   * Import shared snapshot
   */
  async importSnapshot(importPath, newAgentId = null) {
    try {
      const data = await fs.readFile(importPath, 'utf8');
      const snapshot = JSON.parse(data);
      
      if (!snapshot.shareable) {
        throw new Error('Snapshot is not marked as shareable');
      }

      // Create new agent from snapshot
      const agentId = newAgentId || `${snapshot.agentId}-clone-${Date.now()}`;
      this.agent = JSON.parse(JSON.stringify(snapshot.dna));
      this.agent.agentId = agentId;
      this.agent.generation = 1;
      this.agent.parentSnapshot = snapshot.id;
      this.agent.importedAt = new Date().toISOString();
      
      this.options.agentId = agentId;
      await this.saveDNA();
      
      this.log(`📥 Imported "${snapshot.name}" as ${agentId}`, 'success');
      return this.agent;
    } catch (err) {
      this.log(`Failed to import: ${err.message}`, 'error');
      return null;
    }
  }

  // ========== FINALIZE ==========

  async finalizeSession(ctx) {
    if (!this.agent) return;

    const successRate = this.sessionMetrics.tasksCompleted > 0 
      ? this.sessionMetrics.tasksSucceeded / this.sessionMetrics.tasksCompleted 
      : 0;

    const avgScore = this.sessionMetrics.scores.length > 0
      ? this.sessionMetrics.scores.reduce((a, b) => a + b, 0) / this.sessionMetrics.scores.length
      : 0;

    this.log(`📊 Session: ${this.sessionMetrics.tasksCompleted} tasks, ${(successRate * 100).toFixed(0)}% success, Avg Score: ${(avgScore * 10).toFixed(1)}/10`, 'info');

    // Auto-snapshot if fitness is excellent
    if (this.agent.fitness > 0.85 && !this.agent.lastSnapshot) {
      await this.createSnapshot(
        `Auto-Golden-${this.agent.generation}`,
        `Automatic snapshot of high-performing generation ${this.agent.generation}`
      );
    }

    // Auto-evolve if fitness is low
    if (this.options.autoEvolve && this.agent.fitness < this.options.evolutionThreshold) {
      await this.evolveAgent();
    }

    this.agent.epigenetics = { currentContext: null, temporaryModifiers: {} };
    await this.saveDNA();
    this.log('💾 DNA saved', 'info');
  }

  async evolveAgent() {
    const genes = this.agent.cognitive;
    
    Object.keys(genes).forEach(geneName => {
      const gene = genes[geneName];
      if (gene.mutable) {
        // Curved mutation: smaller changes for high-performing genes
        const mutationScale = gene.value > 0.8 ? 0.05 : gene.value < 0.3 ? 0.15 : 0.1;
        const mutation = (Math.random() - 0.5) * 2 * mutationScale;
        gene.value = Math.max(0.1, Math.min(1, gene.value + mutation));
      }
    });

    this.agent.generation++;
    this.agent.lastEvolved = new Date().toISOString();
    
    this.log(`🧬🔄 Evolved to Gen ${this.agent.generation}!`, 'success');
  }

  async saveDNA() {
    try {
      await fs.mkdir(this.options.dnaDir, { recursive: true });
      const dnaPath = path.join(this.options.dnaDir, `${this.options.agentId}.json`);
      await fs.writeFile(dnaPath, JSON.stringify(this.agent, null, 2));
    } catch (err) {
      this.log('Failed to save DNA: ' + err.message, 'error');
    }
  }

  // ========== API ==========

  getStats() {
    return {
      agent: this.agent,
      session: this.sessionMetrics,
      config: this.agent ? this.getCurrentConfig() : null
    };
  }

  getCurrentConfig() {
    if (!this.agent) return null;
    
    const genes = this.agent.cognitive;
    return {
      temperature: 0.1 + (this.curvedMap(genes.creativity.value, 'creativity') * 0.9),
      maxTokens: 500 + Math.floor(this.curvedMap(genes.thoroughness.value, 'thoroughness') * 7500),
      model: this.selectModelV2(this.curvedMap(genes.caution.value, 'caution')),
      thinking: this.curvedMap(genes.analytical.value, 'analytical') > 0.75 ? 'high' : 'low'
    };
  }

  log(message, type = 'info') {
    const prefix = `[AgentDNA-v2:${this.options.agentId}]`;
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (this.openclaw?.emit) {
      this.openclaw.emit('dna:log', { message, type, timestamp, agentId: this.options.agentId });
    }
  }
}

module.exports = AgentDNAPluginV2;
