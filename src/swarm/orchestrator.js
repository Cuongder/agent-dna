/**
 * Swarm Orchestrator - Quản lý swarm của multiple agents
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.1.0
 */

const { Genome } = require('../genome');
const presets = require('../presets');
const { createOffspring } = require('../evolution/crossover');

/**
 * Swarm - Nhóm agents cùng làm việc
 */
class Swarm {
  constructor(config = {}) {
    this.id = config.id || `swarm-${Date.now()}`;
    this.name = config.name || 'Unnamed Swarm';
    this.agents = new Map(); // agentId -> Genome
    this.task = null;
    this.results = [];
    this.consensus = null;
    this.status = 'idle'; // idle, running, completed
    this.createdAt = new Date().toISOString();
    this.completedAt = null;
  }

  /**
   * Thêm agent vào swarm
   */
  addAgent(agent) {
    if (agent instanceof Genome) {
      this.agents.set(agent.agentId, agent);
    } else {
      // Tạo từ preset
      const genome = presets.createAgent(
        agent.type || 'leader',
        agent.id || `agent-${this.agents.size + 1}`,
        agent.generation || 1
      );
      this.agents.set(genome.agentId, genome);
    }
    return this;
  }

  /**
   * Tạo diverse swarm từ 2 parents
   */
  createDiverseSwarm(parentA, parentB, count = 5) {
    const children = createOffspring(parentA, parentB, count, 'uniform');
    
    children.forEach((child, index) => {
      child.agentId = `${this.id}-agent-${index + 1}`;
      // Add slight mutation for diversity
      child.cognitive.creativity.value += (Math.random() - 0.5) * 0.2;
      child.cognitive.caution.value += (Math.random() - 0.5) * 0.2;
      child.skills.coding.value += (Math.random() - 0.5) * 0.2;
      this.addAgent(child);
    });

    return this;
  }

  /**
   * Gán task cho swarm
   */
  assignTask(task) {
    this.task = {
      id: task.id || `task-${Date.now()}`,
      description: task.description,
      type: task.type || 'general',
      requirements: task.requirements || {},
      assignedAt: new Date().toISOString()
    };
    this.status = 'assigned';
    return this;
  }

  /**
   * Execute task với tất cả agents
   */
  async execute() {
    if (!this.task) {
      throw new Error('No task assigned to swarm');
    }

    this.status = 'running';
    this.results = [];

    const agentPromises = Array.from(this.agents.values()).map(async (agent) => {
      const result = await this.executeWithAgent(agent);
      return {
        agentId: agent.agentId,
        agent: agent,
        result: result,
        timestamp: new Date().toISOString()
      };
    });

    this.results = await Promise.all(agentPromises);
    this.status = 'completed';
    this.completedAt = new Date().toISOString();

    return this.results;
  }

  /**
   * Execute task với 1 agent (to be implemented by executor)
   */
  async executeWithAgent(agent) {
    // This will be implemented by ParallelExecutor
    // For now, return mock result
    return {
      success: true,
      output: `Result from ${agent.agentId}`,
      confidence: agent.fitness || 0.5
    };
  }

  /**
   * Lấy best result dựa trên confidence
   */
  getBestResult() {
    if (this.results.length === 0) return null;
    
    return this.results.reduce((best, current) => {
      return (current.result.confidence || 0) > (best.result.confidence || 0) 
        ? current 
        : best;
    });
  }

  /**
   * Lấy tất cả results để vote
   */
  getResultsForVoting() {
    return this.results.map(r => ({
      agentId: r.agentId,
      output: r.result.output,
      confidence: r.result.confidence,
      timestamp: r.timestamp
    }));
  }

  /**
   * Tính toán consensus từ results
   */
  calculateConsensus(votingStrategy = 'weighted') {
    if (this.results.length === 0) return null;

    const voteCount = {};
    
    this.results.forEach(r => {
      const output = r.result.output;
      const weight = votingStrategy === 'weighted' 
        ? (r.result.confidence || 0.5) 
        : 1;
      
      voteCount[output] = (voteCount[output] || 0) + weight;
    });

    // Find output with highest votes
    let winner = null;
    let maxVotes = 0;
    
    Object.entries(voteCount).forEach(([output, votes]) => {
      if (votes > maxVotes) {
        winner = output;
        maxVotes = votes;
      }
    });

    this.consensus = {
      winner: winner,
      votes: voteCount,
      totalAgents: this.agents.size,
      strategy: votingStrategy,
      calculatedAt: new Date().toISOString()
    };

    return this.consensus;
  }

  /**
   * Export swarm data
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      task: this.task,
      agents: Array.from(this.agents.entries()).map(([id, genome]) => ({
        id,
        fitness: genome.fitness,
        generation: genome.generation
      })),
      results: this.results,
      consensus: this.consensus,
      createdAt: this.createdAt,
      completedAt: this.completedAt
    };
  }
}

/**
 * SwarmOrchestrator - Quản lý nhiều swarms
 */
class SwarmOrchestrator {
  constructor() {
    this.swarms = new Map();
    this.activeSwarms = new Set();
  }

  /**
   * Tạo swarm mới
   */
  createSwarm(config) {
    const swarm = new Swarm(config);
    this.swarms.set(swarm.id, swarm);
    return swarm;
  }

  /**
   * Lấy swarm theo ID
   */
  getSwarm(id) {
    return this.swarms.get(id);
  }

  /**
   * Lấy tất cả swarms
   */
  getAllSwarms() {
    return Array.from(this.swarms.values());
  }

  /**
   * Xóa swarm
   */
  deleteSwarm(id) {
    this.activeSwarms.delete(id);
    return this.swarms.delete(id);
  }

  /**
   * Execute swarm và tự động consensus
   */
  async executeAndConsensus(swarmId, options = {}) {
    const swarm = this.getSwarm(swarmId);
    if (!swarm) {
      throw new Error(`Swarm ${swarmId} not found`);
    }

    this.activeSwarms.add(swarmId);
    
    try {
      // Execute with all agents
      await swarm.execute();
      
      // Calculate consensus
      const consensus = swarm.calculateConsensus(options.votingStrategy);
      
      return {
        swarm: swarm.toJSON(),
        consensus: consensus,
        bestResult: swarm.getBestResult(),
        allResults: swarm.getResultsForVoting()
      };
    } finally {
      this.activeSwarms.delete(swarmId);
    }
  }

  /**
   * Lấy stats của tất cả swarms
   */
  getStats() {
    return {
      totalSwarms: this.swarms.size,
      activeSwarms: this.activeSwarms.size,
      completedSwarms: Array.from(this.swarms.values()).filter(s => s.status === 'completed').length,
      swarms: Array.from(this.swarms.values()).map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        agentCount: s.agents.size
      }))
    };
  }
}

module.exports = {
  Swarm,
  SwarmOrchestrator
};
