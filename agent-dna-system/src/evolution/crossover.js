/**
 * Crossover Module - Agent DNA System
 * Lai ghép DNA từ 2 parent agents để tạo offspring
 */

class Crossover {
  constructor(options = {}) {
    this.method = options.method || 'uniform'; // 'uniform', 'single-point', 'blended'
    this.uniformRate = options.uniformRate || 0.5;
  }

  /**
   * Thực hiện crossover giữa 2 parent DNAs
   * @param {Object} parentA - DNA của parent thứ nhất
   * @param {Object} parentB - DNA của parent thứ hai
   * @returns {Object} DNA của offspring
   */
  crossover(parentA, parentB) {
    switch (this.method) {
      case 'uniform':
        return this.uniformCrossover(parentA, parentB);
      case 'single-point':
        return this.singlePointCrossover(parentA, parentB);
      case 'blended':
        return this.blendedCrossover(parentA, parentB);
      default:
        throw new Error(`Unknown crossover method: ${this.method}`);
    }
  }

  /**
   * Uniform Crossover: Chọn gene ngẫu nhiên từ A hoặc B
   */
  uniformCrossover(parentA, parentB) {
    const offspring = {
      agent_id: this.generateOffspringId(parentA.agent_id, parentB.agent_id),
      parent_ids: [parentA.agent_id, parentB.agent_id],
      generation: Math.max(parentA.generation || 0, parentB.generation || 0) + 1,
      genes: {}
    };

    // Lấy tất cả gene keys
    const allGeneKeys = new Set([
      ...Object.keys(parentA.genes || {}),
      ...Object.keys(parentB.genes || {})
    ]);

    // Chọn gene từ A hoặc B dựa trên uniformRate
    for (const geneKey of allGeneKeys) {
      if (Math.random() < this.uniformRate) {
        offspring.genes[geneKey] = this.inheritGene(parentA.genes[geneKey], parentB.genes[geneKey], parentA.genes, geneKey);
      } else {
        offspring.genes[geneKey] = this.inheritGene(parentB.genes[geneKey], parentA.genes[geneKey], parentB.genes, geneKey);
      }
    }

    return offspring;
  }

  /**
   * Single Point Crossover: Chọn điểm cắt, lấy trước từ A, sau từ B
   */
  singlePointCrossover(parentA, parentB) {
    const geneKeys = Object.keys(parentA.genes || {});
    const crossoverPoint = Math.floor(Math.random() * geneKeys.length);

    const offspring = {
      agent_id: this.generateOffspringId(parentA.agent_id, parentB.agent_id),
      parent_ids: [parentA.agent_id, parentB.agent_id],
      generation: Math.max(parentA.generation || 0, parentB.generation || 0) + 1,
      genes: {}
    };

    // Genes trước điểm cắt từ A
    for (let i = 0; i < crossoverPoint; i++) {
      const key = geneKeys[i];
      offspring.genes[key] = parentA.genes[key];
    }

    // Genes sau điểm cắt từ B
    for (let i = crossoverPoint; i < geneKeys.length; i++) {
      const key = geneKeys[i];
      offspring.genes[key] = parentB.genes[key];
    }

    return offspring;
  }

  /**
   * Blended Crossover: Trung bình có trọng số của 2 genes
   */
  blendedCrossover(parentA, parentB) {
    const offspring = {
      agent_id: this.generateOffspringId(parentA.agent_id, parentB.agent_id),
      parent_ids: [parentA.agent_id, parentB.agent_id],
      generation: Math.max(parentA.generation || 0, parentB.generation || 0) + 1,
      genes: {}
    };

    const allGeneKeys = new Set([
      ...Object.keys(parentA.genes || {}),
      ...Object.keys(parentB.genes || {})
    ]);

    for (const geneKey of allGeneKeys) {
      const valueA = parentA.genes[geneKey] || 0.5;
      const valueB = parentB.genes[geneKey] || 0.5;
      
      // Trung bình có trọng số ngẫu nhiên
      const weight = Math.random();
      offspring.genes[geneKey] = valueA * weight + valueB * (1 - weight);
    }

    return offspring;
  }

  /**
   * Kế thừa gene, xử lý trường hợp gene không tồn tại ở 1 parent
   */
  inheritGene(primary, secondary, secondaryParent, geneKey) {
    if (primary !== undefined) return primary;
    if (secondary !== undefined) return secondary;
    return 0.5; // Default value
  }

  /**
   * Generate ID cho offspring
   */
  generateOffspringId(parentA, parentB) {
    const timestamp = Date.now().toString(36);
    const hash = Math.random().toString(36).substring(2, 8);
    return `offspring-${parentA.split('-')[0]}-${parentB.split('-')[0]}-${timestamp}-${hash}`;
  }

  /**
   * Tạo nhiều offspring từ 2 parents
   */
  createOffspring(parentA, parentB, count = 1) {
    const offspring = [];
    for (let i = 0; i < count; i++) {
      offspring.push(this.crossover(parentA, parentB));
    }
    return offspring;
  }
}

module.exports = Crossover;
