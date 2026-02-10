/**
 * Mutation - Đột biến DNA
 * 
 * @author Shika
 */

const { Gene } = require('../genome');

/**
 * Mutate một gene
 */
function mutateGene(gene, mutationRate = 0.1, mutationStrength = 0.1) {
  if (!gene.mutable || Math.random() > mutationRate) {
    return { ...gene };
  }

  const delta = (Math.random() - 0.5) * 2 * mutationStrength;
  const newValue = Math.max(0, Math.min(1, gene.value + delta));
  
  return new Gene(gene.name, newValue, gene.mutable);
}

/**
 * Mutate toàn bộ genome
 */
function mutateGenome(genome, mutationRate = 0.1, mutationStrength = 0.1) {
  const mutated = genome; // Mutate in place
  
  // Mutate cognitive genes
  for (const name in mutated.cognitive) {
    mutated.cognitive[name] = mutateGene(
      mutated.cognitive[name], 
      mutationRate, 
      mutationStrength
    );
  }
  
  // Mutate skill genes
  for (const name in mutated.skills) {
    mutated.skills[name] = mutateGene(
      mutated.skills[name],
      mutationRate,
      mutationStrength
    );
  }
  
  // Mutate learning genes
  for (const name in mutated.learning) {
    mutated.learning[name] = mutateGene(
      mutated.learning[name],
      mutationRate,
      mutationStrength
    );
  }
  
  return mutated;
}

/**
 * Adaptive mutation - Tăng mutation rate khi population đa dạng thấp
 */
function adaptiveMutation(genome, populationDiversity, baseRate = 0.1) {
  // Nếu diversity thấp, tăng mutation để tạo variation
  const adjustedRate = baseRate + (1 - populationDiversity) * 0.2;
  const strength = 0.1 + (1 - populationDiversity) * 0.1;
  
  return mutateGenome(genome, adjustedRate, strength);
}

/**
 * Type-aware mutation - Mỗi loại gene có mutation rate khác nhau
 */
function typeAwareMutation(genome, typeRates = {}) {
  const rates = {
    cognitive: 0.1,
    skill: 0.08,
    learning: 0.12,
    ...typeRates
  };
  
  const mutated = genome;
  
  for (const name in mutated.cognitive) {
    mutated.cognitive[name] = mutateGene(
      mutated.cognitive[name],
      rates.cognitive,
      0.1
    );
  }
  
  for (const name in mutated.skills) {
    mutated.skills[name] = mutateGene(
      mutated.skills[name],
      rates.skill,
      0.08
    );
  }
  
  for (const name in mutated.learning) {
    mutated.learning[name] = mutateGene(
      mutated.learning[name],
      rates.learning,
      0.12
    );
  }
  
  return mutated;
}

/**
 * Boundary mutation - Đảm bảo không vượt quá 0-1
 */
function boundaryMutation(genome, mutationRate = 0.1) {
  const strength = 0.15;
  
  const mutateWithBoundary = (gene, rate) => {
    if (Math.random() > rate || !gene.mutable) {
      return gene;
    }
    
    // 50% chance: jump to boundary (0 or 1)
    // 50% chance: small perturbation
    if (Math.random() < 0.5) {
      const newValue = Math.random() < 0.5 ? 0 : 1;
      return new Gene(gene.name, newValue, gene.mutable);
    } else {
      const delta = (Math.random() - 0.5) * 2 * strength;
      const newValue = Math.max(0, Math.min(1, gene.value + delta));
      return new Gene(gene.name, newValue, gene.mutable);
    }
  };
  
  const mutated = genome;
  
  for (const category of ['cognitive', 'skills', 'learning']) {
    for (const name in mutated[category]) {
      mutated[category][name] = mutateWithBoundary(
        mutated[category][name],
        mutationRate
      );
    }
  }
  
  return mutated;
}

module.exports = {
  mutateGene,
  mutateGenome,
  adaptiveMutation,
  typeAwareMutation,
  boundaryMutation
};
