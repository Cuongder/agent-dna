/**
 * Fitness Calculator
 * Tính toán fitness score từ task metrics
 * 
 * @author Team 7
 */

/**
 * Calculate fitness từ array of task results
 */
function calculateFitness(tasks) {
  if (!tasks || tasks.length === 0) {
    return 0.5;  // Default neutral fitness
  }

  let totalScore = 0;
  let totalWeight = 0;

  for (const task of tasks) {
    const score = calculateTaskScore(task);
    // Recent tasks có weight cao hơn
    const weight = task.timestamp 
      ? Math.exp(-(Date.now() - task.timestamp) / (24 * 60 * 60 * 1000))  // Decay theo ngày
      : 1;
    
    totalScore += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 
    ? Math.max(0, Math.min(1, totalScore / totalWeight))
    : 0.5;
}

/**
 * Calculate score cho 1 task
 */
function calculateTaskScore(task) {
  // Success rate (40%) - Quan trọng nhất
  const successScore = task.success ? 1.0 : 0.0;

  // Efficiency (25%) - Ít tokens = tốt hơn
  // Normalize: 0-50k tokens → 1-0 score
  const tokenScore = task.tokensUsed 
    ? Math.max(0, 1 - (task.tokensUsed / 50000))
    : 0.5;

  // Speed (20%) - Nhanh = tốt hơn
  // Normalize: 0-300s → 1-0 score
  const speedScore = task.duration 
    ? Math.max(0, 1 - (task.duration / 300))
    : 0.5;

  // Quality (15%) - User rating hoặc auto-evaluate
  const qualityScore = task.quality || 0.5;

  return (
    successScore * 0.40 +
    tokenScore * 0.25 +
    speedScore * 0.20 +
    qualityScore * 0.15
  );
}

/**
 * Calculate trend (improving hay declining)
 */
function calculateTrend(tasks) {
  if (tasks.length < 10) return 'insufficient_data';

  const firstHalf = tasks.slice(0, Math.floor(tasks.length / 2));
  const secondHalf = tasks.slice(Math.floor(tasks.length / 2));

  const firstScore = calculateFitness(firstHalf);
  const secondScore = calculateFitness(secondHalf);

  const diff = secondScore - firstScore;
  
  if (diff > 0.1) return 'improving';
  if (diff < -0.1) return 'declining';
  return 'stable';
}

/**
 * Identify strengths và weaknesses
 */
function analyzePerformance(tasks) {
  if (!tasks || tasks.length === 0) {
    return { strengths: [], weaknesses: [] };
  }

  const metrics = {
    success: tasks.filter(t => t.success).length / tasks.length,
    efficiency: 1 - (tasks.reduce((s, t) => s + (t.tokensUsed || 0), 0) / tasks.length / 50000),
    speed: 1 - (tasks.reduce((s, t) => s + (t.duration || 0), 0) / tasks.length / 300),
    quality: tasks.reduce((s, t) => s + (t.quality || 0.5), 0) / tasks.length
  };

  const strengths = [];
  const weaknesses = [];

  if (metrics.success > 0.8) strengths.push('high_success_rate');
  if (metrics.success < 0.5) weaknesses.push('low_success_rate');

  if (metrics.efficiency > 0.7) strengths.push('token_efficient');
  if (metrics.efficiency < 0.4) weaknesses.push('token_inefficient');

  if (metrics.speed > 0.7) strengths.push('fast_response');
  if (metrics.speed < 0.4) weaknesses.push('slow_response');

  if (metrics.quality > 0.8) strengths.push('high_quality');
  if (metrics.quality < 0.5) weaknesses.push('low_quality');

  return { strengths, weaknesses, metrics };
}

module.exports = {
  calculateFitness,
  calculateTaskScore,
  calculateTrend,
  analyzePerformance
};
