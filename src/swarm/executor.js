/**
 * Parallel Executor - Chạy agents song song với timeout và error handling
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.1.0
 */

const { Swarm } = require('./orchestrator');

/**
 * TaskExecutor - Execute task với 1 agent
 */
class TaskExecutor {
  constructor(options = {}) {
    this.timeout = options.timeout || 30000; // 30 seconds default
    this.retryCount = options.retryCount || 1;
    this.onProgress = options.onProgress || null;
  }

  /**
   * Execute task với 1 agent
   */
  async execute(agent, task) {
    const startTime = Date.now();
    
    try {
      // Convert DNA to execution parameters
      const params = this.dnaToParams(agent);
      
      // Execute with timeout
      const result = await this.executeWithTimeout(agent, task, params);
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        output: result,
        confidence: this.calculateConfidence(agent, duration),
        duration: duration,
        agentId: agent.agentId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        error: error.message,
        confidence: 0,
        duration: Date.now() - startTime,
        agentId: agent.agentId,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Convert DNA genes thành execution parameters
   */
  dnaToParams(agent) {
    return {
      creativity: agent.cognitive?.creativity?.value || 0.5,
      caution: agent.cognitive?.caution?.value || 0.5,
      speed: agent.cognitive?.speed?.value || 0.5,
      analytical: agent.cognitive?.analytical?.value || 0.5,
      coding: agent.skills?.coding?.value || 0.5,
      maxTokens: 1000 + (agent.cognitive?.thoroughness?.value || 0.5) * 3000,
      temperature: 0.3 + (agent.cognitive?.creativity?.value || 0.5) * 0.7
    };
  }

  /**
   * Execute với timeout
   */
  async executeWithTimeout(agent, task, params) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timeout after ${this.timeout}ms`));
      }, this.timeout);

      // Mock execution - in real implementation, this would call the actual agent
      this.mockExecute(agent, task, params)
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Mock execution - simulate agent processing
   */
  async mockExecute(agent, task, params) {
    // Simulate processing time based on speed gene
    const processingTime = 100 + (1 - params.speed) * 1000;
    await this.delay(processingTime);

    // Simulate result based on agent skills
    const skillLevel = (params.coding + params.analytical) / 2;
    const creativityBonus = params.creativity * 0.2;
    
    // Generate mock result
    return `Solution from ${agent.agentId}: ${task.description} (skill: ${(skillLevel * 100).toFixed(0)}%, creativity: ${(creativityBonus * 100).toFixed(0)}%)`;
  }

  /**
   * Calculate confidence score từ agent performance
   */
  calculateConfidence(agent, duration) {
    const baseConfidence = agent.fitness || 0.5;
    const speedPenalty = duration > this.timeout * 0.8 ? 0.1 : 0;
    
    return Math.max(0, Math.min(1, baseConfidence - speedPenalty));
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * ParallelExecutor - Execute nhiều agents song song
 */
class ParallelExecutor {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 5;
    this.timeout = options.timeout || 30000;
    this.onProgress = options.onProgress || null;
    this.taskExecutor = new TaskExecutor({
      timeout: this.timeout,
      onProgress: this.onProgress
    });
  }

  /**
   * Execute swarm song song
   */
  async executeSwarm(swarm, options = {}) {
    if (!(swarm instanceof Swarm)) {
      throw new Error('Invalid swarm object');
    }

    const agents = Array.from(swarm.agents.values());
    const task = swarm.task;
    
    if (!task) {
      throw new Error('Swarm has no assigned task');
    }

    const results = [];
    const errors = [];

    // Process in batches to control concurrency
    for (let i = 0; i < agents.length; i += this.maxConcurrency) {
      const batch = agents.slice(i, i + this.maxConcurrency);
      
      const batchPromises = batch.map(async (agent) => {
        try {
          const result = await this.taskExecutor.execute(agent, task);
          
          if (this.onProgress) {
            this.onProgress({
              agentId: agent.agentId,
              status: result.success ? 'completed' : 'failed',
              progress: ((results.length + 1) / agents.length) * 100
            });
          }
          
          return result;
        } catch (error) {
          errors.push({
            agentId: agent.agentId,
            error: error.message
          });
          
          return {
            success: false,
            error: error.message,
            agentId: agent.agentId,
            timestamp: new Date().toISOString()
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return {
      swarmId: swarm.id,
      results: results,
      errors: errors,
      completedAt: new Date().toISOString(),
      summary: {
        total: agents.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        avgConfidence: results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length
      }
    };
  }

  /**
   * Execute với retry logic
   */
  async executeWithRetry(agents, task, maxRetries = 2) {
    const results = [];
    
    for (const agent of agents) {
      let attempt = 0;
      let success = false;
      let lastResult = null;

      while (attempt < maxRetries && !success) {
        try {
          lastResult = await this.taskExecutor.execute(agent, task);
          success = lastResult.success;
        } catch (error) {
          lastResult = {
            success: false,
            error: error.message,
            agentId: agent.agentId
          };
        }
        
        attempt++;
        
        if (!success && attempt < maxRetries) {
          // Wait before retry
          await this.delay(1000 * attempt);
        }
      }

      results.push({
        ...lastResult,
        attempts: attempt
      });
    }

    return results;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = {
  TaskExecutor,
  ParallelExecutor
};
