/**
 * Mutation Module - Agent DNA System
 * Đột biến genes để tạo đa dạng và tránh local optimum
 */

class Mutation {
  constructor(options = {}) {
    this.rate = options.rate || 0.1; // Xác suất mutation (10%)
    this.strength = options.strength || 0.1; // Cường độ mutation (±10%)
    this.adaptive = options.adaptive || false; // Adaptive mutation rate
  }

  /**
   * Thực hiện mutation trên DNA
   * @param {Object} dna - DNA cần mutate
   * @param {Object} options - Options cho mutation
   * @returns {Object} DNA sau khi mutate
   */
  mutate(dna, options = {}) {
    const mutated = JSON.parse(JSON.stringify(dna)); // Deep clone
    const rate = options.rate || this.rate;
    const strength = options.strength || this.strength;

    // Mutate từng gene
    for (const geneKey of Object.keys(mutated.genes)) {
      if (Math.random() < rate) {
        mutated.genes[geneKey] = this.mutateGene(
          mutated.genes[geneKey],
          strength,
          geneKey
        );
      }
    }

    // Thêm metadata về mutation
    mutated.mutations = mutated.mutations || [];
    mutated.mutations.push({
      timestamp: new Date().toISOString(),
      rate: rate,
      strength: strength,
      generation: mutated.generation
    });

    return mutated;
  }

  /**
   * Mutate một gene cụ thể
   */
  mutateGene(value, strength, geneName) {
    // Kiểm tra kiểu dữ liệu
    if (typeof value === 'number') {
      return this.mutateNumber(value, strength, geneName);
    } else if (typeof value === 'boolean') {
      return this.mutateBoolean(value);
    } else if (typeof value === 'string') {
      return this.mutateString(value, geneName);
    } else if (Array.isArray(value)) {
      return this.mutateArray(value, strength);
    } else if (typeof value === 'object' && value !== null) {
      return this.mutateObject(value, strength);
    }
    return value;
  }

  /**
   * Mutate số (gene phổ biến nhất, ví dụ: 0.5 -> 0.53)
   */
  mutateNumber(value, strength, geneName) {
    // Gaussian-like mutation
    const change = (Math.random() - 0.5) * 2 * strength;
    let newValue = value + change;

    // Clamp về [0, 1] cho normalized genes
    if (this.isNormalizedGene(geneName)) {
      newValue = Math.max(0, Math.min(1, newValue));
    }

    return Math.round(newValue * 1000) / 1000; // Round đến 3 decimal
  }

  /**
   * Mutate boolean (toggle với xác suất nhỏ)
   */
  mutateBoolean(value) {
    return Math.random() < 0.3 ? !value : value;
  }

  /**
   * Mutate string (thường là tags, categories)
   */
  mutateString(value, geneName) {
    const mutations = {
      addChar: () => value + String.fromCharCode(97 + Math.floor(Math.random() * 26)),
      removeChar: () => value.slice(0, -1),
      swapCase: () => value.split('').map(c => 
        c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
      ).join('')
    };

    const ops = Object.keys(mutations);
    const op = ops[Math.floor(Math.random() * ops.length)];
    return mutations[op]();
  }

  /**
   * Mutate array (ví dụ: preferred_tools)
   */
  mutateArray(arr, strength) {
    const mutations = [];
    
    // Shuffle một phần tử
    if (arr.length > 1 && Math.random() < 0.5) {
      const idx1 = Math.floor(Math.random() * arr.length);
      const idx2 = Math.floor(Math.random() * arr.length);
      [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
    }

    // Thêm/xóa phần tử
    if (Math.random() < 0.3 && arr.length > 0) {
      arr.pop();
    }

    return arr;
  }

  /**
   * Mutate object (nested genes)
   */
  mutateObject(obj, strength) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Math.random() < this.rate) {
        result[key] = this.mutateGene(value, strength, key);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Kiểm tra gene có nên normalized [0,1] không
   */
  isNormalizedGene(geneName) {
    const normalizedGenes = [
      'creativity', 'analytical', 'caution', 'curiosity',
      'coding', 'research', 'communication', 'leadership',
      'learning_rate', 'memory_retention', 'adaptation_speed'
    ];
    return normalizedGenes.includes(geneName);
  }

  /**
   * Adaptive mutation - tăng rate khi population stagnate
   */
  calculateAdaptiveRate(generation, stagnationCount) {
    if (!this.adaptive) return this.rate;
    
    // Tăng mutation khi stuck ở local optimum
    const baseRate = this.rate;
    const boost = Math.min(stagnationCount * 0.05, 0.3);
    return Math.min(baseRate + boost, 0.5); // Max 50%
  }

  /**
   * Batch mutation cho nhiều DNA
   */
  mutateBatch(dnas, options = {}) {
    return dnas.map(dna => this.mutate(dna, options));
  }

  /**
   * Simulate mutation effects (không apply, chỉ preview)
   */
  simulateMutation(dna, options = {}) {
    const preview = [];
    const rate = options.rate || this.rate;

    for (const [geneKey, value] of Object.entries(dna.genes || {})) {
      if (Math.random() < rate) {
        preview.push({
          gene: geneKey,
          oldValue: value,
          newValue: this.mutateGene(value, this.strength, geneKey)
        });
      }
    }

    return preview;
  }
}

module.exports = Mutation;
