/**
 * Learning Genes - Genes định nghĩa khả năng học tập và thích nghi
 * 
 * @author Kakashi
 */

const { Gene } = require('../genome');

/**
 * Tạo bộ genes học tập mặc định
 */
function createDefaultLearningGenes() {
  return {
    // Tốc độ học
    learningRate: new Gene('learningRate', 0.5),      // Học nhanh hay chậm
    adaptationSpeed: new Gene('adaptationSpeed', 0.5), // Thích nghi với thay đổi
    
    // Memory
    memoryRetention: new Gene('memoryRetention', 0.5),  // Nhớ lâu hay quên nhanh
    patternRecognition: new Gene('patternRecognition', 0.5), // Nhận diện pattern
    
    // Phong cách học
    depthFirst: new Gene('depthFirst', 0.5),      // Học sâu 1 topic
    breadthFirst: new Gene('breadthFirst', 0.5),  // Học rộng nhiều topic
    
    // Cách tiếp cận lỗi
    errorCorrection: new Gene('errorCorrection', 0.5),     // Sửa lỗi từ feedback
    mistakeAvoidance: new Gene('mistakeAvoidance', 0.5),   // Tránh lặp lại lỗi
    
    // Generalization
    generalization: new Gene('generalization', 0.5),       // Áp dụng kiến thức sang context mới
    specialization: new Gene('specialization', 0.5),       // Chuyên sâu 1 lĩnh vực
    
    // Curiosity
    curiosity: new Gene('curiosity', 0.5),        // Thích khám phá cái mới
    exploration: new Gene('exploration', 0.5),    // Thử nghiệm approaches khác nhau
  };
}

/**
 * Tạo genes cho Fast Learner
 */
function createFastLearnerGenes() {
  return {
    learningRate: new Gene('learningRate', 0.9),
    adaptationSpeed: new Gene('adaptationSpeed', 0.85),
    memoryRetention: new Gene('memoryRetention', 0.7),
    patternRecognition: new Gene('patternRecognition', 0.8),
    depthFirst: new Gene('depthFirst', 0.4),
    breadthFirst: new Gene('breadthFirst', 0.8),
    errorCorrection: new Gene('errorCorrection', 0.85),
    mistakeAvoidance: new Gene('mistakeAvoidance', 0.7),
    generalization: new Gene('generalization', 0.8),
    specialization: new Gene('specialization', 0.4),
    curiosity: new Gene('curiosity', 0.9),
    exploration: new Gene('exploration', 0.85),
  };
}

/**
 * Tạo genes cho Deep Learner
 */
function createDeepLearnerGenes() {
  return {
    learningRate: new Gene('learningRate', 0.6),
    adaptationSpeed: new Gene('adaptationSpeed', 0.5),
    memoryRetention: new Gene('memoryRetention', 0.95),
    patternRecognition: new Gene('patternRecognition', 0.85),
    depthFirst: new Gene('depthFirst', 0.9),
    breadthFirst: new Gene('breadthFirst', 0.3),
    errorCorrection: new Gene('errorCorrection', 0.8),
    mistakeAvoidance: new Gene('mistakeAvoidance', 0.9),
    generalization: new Gene('generalization', 0.5),
    specialization: new Gene('specialization', 0.9),
    curiosity: new Gene('curiosity', 0.7),
    exploration: new Gene('exploration', 0.5),
  };
}

/**
 * Tạo genes cho Adaptive Learner
 */
function createAdaptiveLearnerGenes() {
  return {
    learningRate: new Gene('learningRate', 0.75),
    adaptationSpeed: new Gene('adaptationSpeed', 0.95),
    memoryRetention: new Gene('memoryRetention', 0.75),
    patternRecognition: new Gene('patternRecognition', 0.85),
    depthFirst: new Gene('depthFirst', 0.5),
    breadthFirst: new Gene('breadthFirst', 0.6),
    errorCorrection: new Gene('errorCorrection', 0.9),
    mistakeAvoidance: new Gene('mistakeAvoidance', 0.85),
    generalization: new Gene('generalization', 0.85),
    specialization: new Gene('specialization', 0.5),
    curiosity: new Gene('curiosity', 0.8),
    exploration: new Gene('exploration', 0.8),
  };
}

module.exports = {
  createDefaultLearningGenes,
  createFastLearnerGenes,
  createDeepLearnerGenes,
  createAdaptiveLearnerGenes
};
