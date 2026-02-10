/**
 * Skill Genes - Genes định nghĩa kỹ năng chuyên môn
 * 
 * @author Kakashi
 */

const { Gene } = require('../genome');

/**
 * Tạo bộ genes kỹ năng mặc định
 */
function createDefaultSkillGenes() {
  return {
    // Technical skills
    coding: new Gene('coding', 0.5),
    debugging: new Gene('debugging', 0.5),
    architecture: new Gene('architecture', 0.5),
    testing: new Gene('testing', 0.5),
    
    // Research skills
    research: new Gene('research', 0.5),
    analysis: new Gene('analysis', 0.5),
    synthesis: new Gene('synthesis', 0.5),  // Tổng hợp thông tin
    
    // Communication skills
    writing: new Gene('writing', 0.5),
    presentation: new Gene('presentation', 0.5),
    explanation: new Gene('explanation', 0.5),
    
    // Tool skills
    toolUsage: new Gene('toolUsage', 0.5),     // Dùng tools hiệu quả
    toolCreation: new Gene('toolCreation', 0.3), // Tạo tools mới
    integration: new Gene('integration', 0.4),   // Tích hợp hệ thống
    
    // Soft skills
    planning: new Gene('planning', 0.5),
    prioritization: new Gene('prioritization', 0.5),
    delegation: new Gene('delegation', 0.4),
  };
}

/**
 * Tạo genes cho Developer
 */
function createDeveloperGenes() {
  return {
    coding: new Gene('coding', 0.95),
    debugging: new Gene('debugging', 0.9),
    architecture: new Gene('architecture', 0.8),
    testing: new Gene('testing', 0.85),
    research: new Gene('research', 0.6),
    analysis: new Gene('analysis', 0.7),
    synthesis: new Gene('synthesis', 0.5),
    writing: new Gene('writing', 0.5),
    presentation: new Gene('presentation', 0.4),
    explanation: new Gene('explanation', 0.6),
    toolUsage: new Gene('toolUsage', 0.85),
    toolCreation: new Gene('toolCreation', 0.6),
    integration: new Gene('integration', 0.8),
    planning: new Gene('planning', 0.6),
    prioritization: new Gene('prioritization', 0.7),
    delegation: new Gene('delegation', 0.3),
  };
}

/**
 * Tạo genes cho Researcher
 */
function createResearcherGenes() {
  return {
    coding: new Gene('coding', 0.5),
    debugging: new Gene('debugging', 0.4),
    architecture: new Gene('architecture', 0.3),
    testing: new Gene('testing', 0.4),
    research: new Gene('research', 0.95),
    analysis: new Gene('analysis', 0.9),
    synthesis: new Gene('synthesis', 0.9),
    writing: new Gene('writing', 0.8),
    presentation: new Gene('presentation', 0.7),
    explanation: new Gene('explanation', 0.85),
    toolUsage: new Gene('toolUsage', 0.75),
    toolCreation: new Gene('toolCreation', 0.4),
    integration: new Gene('integration', 0.5),
    planning: new Gene('planning', 0.6),
    prioritization: new Gene('prioritization', 0.6),
    delegation: new Gene('delegation', 0.4),
  };
}

/**
 * Tạo genes cho Team Leader
 */
function createTeamLeaderGenes() {
  return {
    coding: new Gene('coding', 0.8),
    debugging: new Gene('debugging', 0.7),
    architecture: new Gene('architecture', 0.85),
    testing: new Gene('testing', 0.6),
    research: new Gene('research', 0.6),
    analysis: new Gene('analysis', 0.8),
    synthesis: new Gene('synthesis', 0.8),
    writing: new Gene('writing', 0.7),
    presentation: new Gene('presentation', 0.8),
    explanation: new Gene('explanation', 0.9),
    toolUsage: new Gene('toolUsage', 0.8),
    toolCreation: new Gene('toolCreation', 0.5),
    integration: new Gene('integration', 0.85),
    planning: new Gene('planning', 0.9),
    prioritization: new Gene('prioritization', 0.9),
    delegation: new Gene('delegation', 0.85),
  };
}

module.exports = {
  createDefaultSkillGenes,
  createDeveloperGenes,
  createResearcherGenes,
  createTeamLeaderGenes
};
