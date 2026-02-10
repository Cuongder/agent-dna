/**
 * Evolution Engine - Export all evolution modules
 * 
 * @author Shika
 */

const crossover = require('./crossover');
const mutation = require('./mutation');
const selection = require('./selection');

module.exports = {
  ...crossover,
  ...mutation,
  ...selection
};
