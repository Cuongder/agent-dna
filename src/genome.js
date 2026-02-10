/**
 * Agent DNA System
 * Core module định nghĩa cấu trúc genome cho AI agents
 * 
 * @author Team 7 (Kakashi, Shika)
 * @version 0.1.0
 */

/**
 * Genome - Bộ gen đầy đủ của 1 agent
 * Chứa tất cả genes định nghĩa tính cách và khả năng
 */
class Genome {
  constructor(agentId, generation = 1) {
    this.agentId = agentId;
    this.generation = generation;
    this.createdAt = new Date().toISOString();
    
    // 3 loại genes chính
    this.cognitive = {};    // Tư duy
    this.skills = {};       // Kỹ năng
    this.learning = {};     // Học tập
    
    // Metadata
    this.fitness = 0;       // Điểm hiệu suất (0-1)
    this.tasksCompleted = 0;
    this.tasksSucceeded = 0;
  }

  /**
   * Tính toán fitness score dựa trên performance
   */
  calculateFitness(tasksData) {
    if (tasksData.length === 0) return 0;
    
    const totalScore = tasksData.reduce((sum, task) => {
      // Factors: success_rate, efficiency, user_satisfaction
      const successWeight = task.success ? 1.0 : 0.0;
      const efficiencyWeight = 1.0 - (task.tokensUsed / 100000); // Normalize
      const timeWeight = 1.0 - Math.min(task.duration / 300, 1); // 5 min max
      
      return sum + (successWeight * 0.5 + efficiencyWeight * 0.3 + timeWeight * 0.2);
    }, 0);
    
    this.fitness = totalScore / tasksData.length;
    return this.fitness;
  }

  /**
   * Serialize genome to JSON
   */
  toJSON() {
    return {
      agentId: this.agentId,
      generation: this.generation,
      createdAt: this.createdAt,
      cognitive: this.cognitive,
      skills: this.skills,
      learning: this.learning,
      fitness: this.fitness,
      tasksCompleted: this.tasksCompleted,
      tasksSucceeded: this.tasksSucceeded
    };
  }

  /**
   * Create genome from JSON
   */
  static fromJSON(data) {
    const genome = new Genome(data.agentId, data.generation);
    genome.createdAt = data.createdAt;
    genome.cognitive = data.cognitive;
    genome.skills = data.skills;
    genome.learning = data.learning;
    genome.fitness = data.fitness || 0;
    genome.tasksCompleted = data.tasksCompleted || 0;
    genome.tasksSucceeded = data.tasksSucceeded || 0;
    return genome;
  }
}

/**
 * Gene - Đơn vị cơ bản trong genome
 * Giá trị từ 0.0 đến 1.0
 */
class Gene {
  constructor(name, value = 0.5, mutable = true) {
    this.name = name;
    this.value = Math.max(0, Math.min(1, value)); // Clamp 0-1
    this.mutable = mutable;
  }

  /**
   * Mutate gene với mutation rate
   */
  mutate(mutationRate = 0.1, mutationStrength = 0.1) {
    if (!this.mutable || Math.random() > mutationRate) {
      return this;
    }

    const delta = (Math.random() - 0.5) * 2 * mutationStrength;
    const newValue = Math.max(0, Math.min(1, this.value + delta));
    
    return new Gene(this.name, newValue, this.mutable);
  }
}

module.exports = { Genome, Gene };
