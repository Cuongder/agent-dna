/**
 * Crossover - Lai ghép DNA từ 2 bố mẹ
 * 
 * @author Shika
 */

const { Genome, Gene } = require('../genome');

/**
 * Uniform Crossover - Chọn gene ngẫu nhiên từ bố hoặc mẹ
 */
function uniformCrossover(parentA, parentB, childId, generation) {
  const child = new Genome(childId, generation);
  
  // Crossover cognitive genes
  child.cognitive = {};
  for (const geneName in parentA.cognitive) {
    child.cognitive[geneName] = Math.random() < 0.5 
      ? { ...parentA.cognitive[geneName] }
      : { ...parentB.cognitive[geneName] };
  }
  
  // Crossover skill genes
  child.skills = {};
  for (const geneName in parentA.skills) {
    child.skills[geneName] = Math.random() < 0.5
      ? { ...parentA.skills[geneName] }
      : { ...parentB.skills[geneName] };
  }
  
  // Crossover learning genes
  child.learning = {};
  for (const geneName in parentA.learning) {
    child.learning[geneName] = Math.random() < 0.5
      ? { ...parentA.learning[geneName] }
      : { ...parentB.learning[geneName] };
  }
  
  return child;
}

/**
 * Single-Point Crossover - Chọn điểm cắt và swap
 */
function singlePointCrossover(parentA, parentB, childId, generation, cutPoint = 0.5) {
  const child = new Genome(childId, generation);
  
  const crossoverGene = (genesA, genesB, point) => {
    const result = {};
    const geneNames = Object.keys(genesA);
    const cutIndex = Math.floor(geneNames.length * point);
    
    geneNames.forEach((name, index) => {
      result[name] = index < cutIndex 
        ? { ...genesA[name] }
        : { ...genesB[name] };
    });
    
    return result;
  };
  
  child.cognitive = crossoverGene(parentA.cognitive, parentB.cognitive, cutPoint);
  child.skills = crossoverGene(parentA.skills, parentB.skills, cutPoint);
  child.learning = crossoverGene(parentA.learning, parentB.learning, cutPoint);
  
  return child;
}

/**
 * Blended Crossover - Trung bình có trọng số
 */
function blendedCrossover(parentA, parentB, childId, generation, alpha = 0.5) {
  const child = new Genome(childId, generation);
  
  const blendGenes = (genesA, genesB, a) => {
    const result = {};
    for (const name in genesA) {
      const valueA = genesA[name].value;
      const valueB = genesB[name].value;
      const blendedValue = valueA * a + valueB * (1 - a);
      result[name] = new Gene(name, blendedValue, genesA[name].mutable);
    }
    return result;
  };
  
  child.cognitive = blendGenes(parentA.cognitive, parentB.cognitive, alpha);
  child.skills = blendGenes(parentA.skills, parentB.skills, alpha);
  child.learning = blendGenes(parentA.learning, parentB.learning, alpha);
  
  return child;
}

/**
 * Best-of-Both Crossover - Chọn gene tốt nhất từ bố mẹ
 */
function bestOfBothCrossover(parentA, parentB, childId, generation) {
  const child = new Genome(childId, generation);
  
  const selectBest = (genesA, genesB) => {
    const result = {};
    for (const name in genesA) {
      // Chọn gene có giá trị cao hơn (giả định cao = tốt)
      result[name] = genesA[name].value >= genesB[name].value
        ? { ...genesA[name] }
        : { ...genesB[name] };
    }
    return result;
  };
  
  child.cognitive = selectBest(parentA.cognitive, parentB.cognitive);
  child.skills = selectBest(parentA.skills, parentB.skills);
  child.learning = selectBest(parentA.learning, parentB.learning);
  
  return child;
}

/**
 * Create multiple children từ 2 parents
 */
function createOffspring(parentA, parentB, count = 2, strategy = 'uniform', generation = null) {
  const gen = generation || Math.max(parentA.generation, parentB.generation) + 1;
  const children = [];
  
  for (let i = 0; i < count; i++) {
    const childId = `${parentA.agentId}-${parentB.agentId}-child-${i + 1}`;
    let child;
    
    switch (strategy) {
      case 'uniform':
        child = uniformCrossover(parentA, parentB, childId, gen);
        break;
      case 'single-point':
        child = singlePointCrossover(parentA, parentB, childId, gen);
        break;
      case 'blended':
        child = blendedCrossover(parentA, parentB, childId, gen);
        break;
      case 'best-of-both':
        child = bestOfBothCrossover(parentA, parentB, childId, gen);
        break;
      default:
        child = uniformCrossover(parentA, parentB, childId, gen);
    }
    
    children.push(child);
  }
  
  return children;
}

module.exports = {
  uniformCrossover,
  singlePointCrossover,
  blendedCrossover,
  bestOfBothCrossover,
  createOffspring
};
