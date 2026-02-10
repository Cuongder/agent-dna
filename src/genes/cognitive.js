/**
 * Cognitive Genes - Genes định nghĩa tư duy và cách tiếp cận vấn đề
 * 
 * @author Kakashi
 */

const { Gene } = require('../genome');

/**
 * Tạo bộ genes tư duy mặc định
 */
function createDefaultCognitiveGenes() {
  return {
    // Tư duy sáng tạo vs Logic
    creativity: new Gene('creativity', 0.5),
    analytical: new Gene('analytical', 0.7),
    
    // Mức độ thận trọng
    caution: new Gene('caution', 0.5),
    riskTaking: new Gene('riskTaking', 0.5),
    
    // Phong cách làm việc
    detailOriented: new Gene('detailOriented', 0.6),
    bigPicture: new Gene('bigPicture', 0.6),
    
    // Tốc độ xử lý
    speed: new Gene('speed', 0.5),
    thoroughness: new Gene('thoroughness', 0.7),
    
    // Giao tiếp
    verbosity: new Gene('verbosity', 0.5),  // Dài dòng vs Ngắn gọn
    clarity: new Gene('clarity', 0.7),
    
    // Problem solving
    iterative: new Gene('iterative', 0.6),   // Thử nhiều lần
    planFirst: new Gene('planFirst', 0.5),   // Lập kế hoạch trước
  };
}

/**
 * Tạo genes cho Team Leader (như Kakashi)
 */
function createLeaderGenes() {
  return {
    creativity: new Gene('creativity', 0.6),
    analytical: new Gene('analytical', 0.8),
    caution: new Gene('caution', 0.4),
    riskTaking: new Gene('riskTaking', 0.6),
    detailOriented: new Gene('detailOriented', 0.7),
    bigPicture: new Gene('bigPicture', 0.8),
    speed: new Gene('speed', 0.6),
    thoroughness: new Gene('thoroughness', 0.7),
    verbosity: new Gene('verbosity', 0.4),
    clarity: new Gene('clarity', 0.8),
    iterative: new Gene('iterative', 0.5),
    planFirst: new Gene('planFirst', 0.7),
  };
}

/**
 * Tạo genes cho Researcher (như Shika)
 */
function createResearcherGenes() {
  return {
    creativity: new Gene('creativity', 0.7),
    analytical: new Gene('analytical', 0.9),
    caution: new Gene('caution', 0.6),
    riskTaking: new Gene('riskTaking', 0.4),
    detailOriented: new Gene('detailOriented', 0.9),
    bigPicture: new Gene('bigPicture', 0.5),
    speed: new Gene('speed', 0.5),
    thoroughness: new Gene('thoroughness', 0.9),
    verbosity: new Gene('verbosity', 0.6),
    clarity: new Gene('clarity', 0.7),
    iterative: new Gene('iterative', 0.7),
    planFirst: new Gene('planFirst', 0.6),
  };
}

module.exports = {
  createDefaultCognitiveGenes,
  createLeaderGenes,
  createResearcherGenes
};
