/**
 * Agent Presets - DNA templates cho các loại agent phổ biến
 * 
 * @author Kakashi
 */

const { Genome } = require('./genome');
const { cognitive, skill, learning } = require('./genes');

/**
 * Tạo DNA cho Team Leader (như Kakashi)
 * Giỏi lập trình, lãnh đạo, phân tích
 */
function createLeaderDNA(agentId = 'leader', generation = 1) {
  const genome = new Genome(agentId, generation);
  genome.cognitive = cognitive.createLeaderGenes();
  genome.skills = skill.createTeamLeaderGenes();
  genome.learning = learning.createAdaptiveLearnerGenes();
  return genome;
}

/**
 * Tạo DNA cho Researcher (như Shika)
 * Giỏi nghiên cứu, phân tích sâu
 */
function createResearcherDNA(agentId = 'researcher', generation = 1) {
  const genome = new Genome(agentId, generation);
  genome.cognitive = cognitive.createResearcherGenes();
  genome.skills = skill.createResearcherGenes();
  genome.learning = learning.createDeepLearnerGenes();
  return genome;
}

/**
 * Tạo DNA cho Developer
 * Giỏi coding, debug, tạo tools
 */
function createDeveloperDNA(agentId = 'developer', generation = 1) {
  const genome = new Genome(agentId, generation);
  genome.cognitive = cognitive.createDefaultCognitiveGenes();
  genome.cognitive.creativity.value = 0.6;
  genome.cognitive.analytical.value = 0.85;
  genome.skills = skill.createDeveloperGenes();
  genome.learning = learning.createFastLearnerGenes();
  return genome;
}

/**
 * Tạo DNA cho Support Agent
 * Giỏi giao tiếp, giải thích, kiên nhẫn
 */
function createSupportDNA(agentId = 'support', generation = 1) {
  const genome = new Genome(agentId, generation);
  genome.cognitive = cognitive.createDefaultCognitiveGenes();
  genome.cognitive.clarity.value = 0.95;
  genome.cognitive.caution.value = 0.7;
  genome.cognitive.verbosity.value = 0.7;
  genome.skills = skill.createDefaultSkillGenes();
  genome.skills.explanation.value = 0.95;
  genome.skills.writing.value = 0.9;
  genome.skills.presentation.value = 0.8;
  genome.learning = learning.createDefaultLearningGenes();
  genome.learning.curiosity.value = 0.6;
  return genome;
}

/**
 * Tạo DNA cho Architect
 * Giỏi thiết kế hệ thống, tầm nhìn dài hạn
 */
function createArchitectDNA(agentId = 'architect', generation = 1) {
  const genome = new Genome(agentId, generation);
  genome.cognitive = cognitive.createDefaultCognitiveGenes();
  genome.cognitive.bigPicture.value = 0.95;
  genome.cognitive.analytical.value = 0.9;
  genome.cognitive.planFirst.value = 0.95;
  genome.skills = skill.createDefaultSkillGenes();
  genome.skills.architecture.value = 0.95;
  genome.skills.planning.value = 0.9;
  genome.learning = learning.createDeepLearnerGenes();
  return genome;
}

/**
 * Tạo DNA từ Kakashi + Shika (hybrid)
 * Kết hợp ưu điểm cả hai
 */
function createTeam7HybridDNA(agentId = 'team7-hybrid', generation = 1) {
  const genome = new Genome(agentId, generation);
  
  // Blend genes from both parents
  const kakashiCognitive = cognitive.createLeaderGenes();
  const shikaCognitive = cognitive.createResearcherGenes();
  
  genome.cognitive = {
    creativity: { value: (kakashiCognitive.creativity.value + shikaCognitive.creativity.value) / 2 },
    analytical: { value: (kakashiCognitive.analytical.value + shikaCognitive.analytical.value) / 2 },
    caution: { value: (kakashiCognitive.caution.value + shikaCognitive.caution.value) / 2 },
    riskTaking: { value: (kakashiCognitive.riskTaking.value + shikaCognitive.riskTaking.value) / 2 },
    detailOriented: { value: (kakashiCognitive.detailOriented.value + shikaCognitive.detailOriented.value) / 2 },
    bigPicture: { value: (kakashiCognitive.bigPicture.value + shikaCognitive.bigPicture.value) / 2 },
    speed: { value: (kakashiCognitive.speed.value + shikaCognitive.speed.value) / 2 },
    thoroughness: { value: (kakashiCognitive.thoroughness.value + shikaCognitive.thoroughness.value) / 2 },
    verbosity: { value: (kakashiCognitive.verbosity.value + shikaCognitive.verbosity.value) / 2 },
    clarity: { value: (kakashiCognitive.clarity.value + shikaCognitive.clarity.value) / 2 },
    iterative: { value: (kakashiCognitive.iterative.value + shikaCognitive.iterative.value) / 2 },
    planFirst: { value: (kakashiCognitive.planFirst.value + shikaCognitive.planFirst.value) / 2 },
  };
  
  // Skills - take best from both
  genome.skills = skill.createTeamLeaderGenes();
  genome.skills.research.value = 0.85;
  genome.skills.analysis.value = 0.85;
  
  // Learning - balanced
  genome.learning = learning.createAdaptiveLearnerGenes();
  genome.learning.memoryRetention.value = 0.85;
  
  return genome;
}

module.exports = {
  createLeaderDNA,
  createResearcherDNA,
  createDeveloperDNA,
  createSupportDNA,
  createArchitectDNA,
  createTeam7HybridDNA
};
