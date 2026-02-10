#!/usr/bin/env node

/**
 * Agent DNA CLI Tool
 * 
 * Usage:
 *   agent-dna create --id agent-1 --type leader
 *   agent-dna crossover --parentA a.json --parentB b.json --count 2
 *   agent-dna mutate --input dna.json --rate 0.2
 *   agent-dna evaluate --input dna.json --success 0.9
 *   agent-dna select --population ./pop --count 3
 *   agent-dna stats --population ./pop
 * 
 * @author Shika
 */

const fs = require('fs');
const path = require('path');
const { Genome } = require('./src/genome');
const presets = require('./src/presets');
const crossover = require('./src/evolution/crossover');
const mutation = require('./src/evolution/mutation');
const selection = require('./src/evolution/selection');

function showHelp() {
  console.log(`
Agent DNA CLI Tool

Commands:
  create      Create new agent DNA
  crossover   Breed two parent agents
  mutate      Mutate agent DNA
  evaluate    Evaluate fitness from tasks
  select      Select best agents from population
  stats       Show population statistics

Examples:
  agent-dna create --id agent-1 --type leader
  agent-dna crossover --parentA kakashi.json --parentB shika.json --count 2
  agent-dna mutate --input dna.json --rate 0.2 --strength 0.15
  agent-dna evaluate --input dna.json --success 0.9 --tokens 50000 --time 60
  agent-dna select --population ./pop --count 3 --strategy tournament
  agent-dna stats --population ./pop
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const params = {};
  
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    params[key] = value;
  }
  
  return { command, params };
}

function cmdCreate(params) {
  const id = params.id || 'agent-' + Date.now();
  const type = params.type || 'leader';
  const gen = parseInt(params.generation) || 1;
  
  const genome = presets.createAgent(type, id, gen);
  
  const output = params.output || `${id}.json`;
  fs.writeFileSync(output, JSON.stringify(genome.toJSON(), null, 2));
  
  console.log(`✅ Created ${type} agent: ${id}`);
  console.log(`📁 Saved to: ${output}`);
}

function cmdCrossover(params) {
  const parentA = Genome.fromJSON(JSON.parse(fs.readFileSync(params.parentA, 'utf8')));
  const parentB = Genome.fromJSON(JSON.parse(fs.readFileSync(params.parentB, 'utf8')));
  const count = parseInt(params.count) || 2;
  const strategy = params.strategy || 'uniform';
  
  const children = crossover.createOffspring(parentA, parentB, count, strategy);
  
  children.forEach((child, i) => {
    const output = params.output || `${child.agentId}.json`;
    fs.writeFileSync(output.replace('.json', `-${i+1}.json`), JSON.stringify(child.toJSON(), null, 2));
    console.log(`✅ Created child ${i+1}: ${child.agentId}`);
  });
}

function cmdMutate(params) {
  const genome = Genome.fromJSON(JSON.parse(fs.readFileSync(params.input, 'utf8')));
  const rate = parseFloat(params.rate) || 0.1;
  const strength = parseFloat(params.strength) || 0.1;
  
  mutation.mutateGenome(genome, rate, strength);
  
  const output = params.output || params.input.replace('.json', '-mutated.json');
  fs.writeFileSync(output, JSON.stringify(genome.toJSON(), null, 2));
  
  console.log(`✅ Mutated genome: ${genome.agentId}`);
  console.log(`📁 Saved to: ${output}`);
}

function cmdEvaluate(params) {
  const genome = Genome.fromJSON(JSON.parse(fs.readFileSync(params.input, 'utf8')));
  
  const tasks = [{
    success: params.success === 'true' || params.success === '1',
    tokensUsed: parseInt(params.tokens) || 0,
    duration: parseInt(params.time) || 0
  }];
  
  const fitness = selection.evaluateFitness(genome, tasks);
  genome.fitness = fitness;
  
  const output = params.output || params.input;
  fs.writeFileSync(output, JSON.stringify(genome.toJSON(), null, 2));
  
  console.log(`✅ Evaluated: ${genome.agentId}`);
  console.log(`📊 Fitness: ${fitness.toFixed(4)}`);
}

function cmdSelect(params) {
  const popDir = params.population || './population';
  const count = parseInt(params.count) || 3;
  const strategy = params.strategy || 'tournament';
  
  const files = fs.readdirSync(popDir).filter(f => f.endsWith('.json'));
  const population = files.map(f => 
    Genome.fromJSON(JSON.parse(fs.readFileSync(path.join(popDir, f), 'utf8')))
  );
  
  const selected = selection.eliteSelection(population, count);
  
  console.log(`✅ Selected top ${count} agents:`);
  selected.forEach((agent, i) => {
    console.log(`  ${i+1}. ${agent.agentId} (fitness: ${agent.fitness.toFixed(4)})`);
  });
}

function cmdStats(params) {
  const popDir = params.population || './population';
  
  const files = fs.readdirSync(popDir).filter(f => f.endsWith('.json'));
  const population = files.map(f => 
    Genome.fromJSON(JSON.parse(fs.readFileSync(path.join(popDir, f), 'utf8')))
  );
  
  const totalFitness = population.reduce((sum, a) => sum + a.fitness, 0);
  const avgFitness = totalFitness / population.length;
  const best = population.reduce((max, a) => a.fitness > max.fitness ? a : max);
  const worst = population.reduce((min, a) => a.fitness < min.fitness ? a : min);
  
  console.log(`📊 Population Statistics`);
  console.log(`  Size: ${population.length}`);
  console.log(`  Avg Fitness: ${avgFitness.toFixed(4)}`);
  console.log(`  Best: ${best.agentId} (${best.fitness.toFixed(4)})`);
  console.log(`  Worst: ${worst.agentId} (${worst.fitness.toFixed(4)})`);
  console.log(`  Diversity: ${(best.fitness - worst.fitness).toFixed(4)}`);
}

// Main
const { command, params } = parseArgs();

switch (command) {
  case 'create':
    cmdCreate(params);
    break;
  case 'crossover':
    cmdCrossover(params);
    break;
  case 'mutate':
    cmdMutate(params);
    break;
  case 'evaluate':
    cmdEvaluate(params);
    break;
  case 'select':
    cmdSelect(params);
    break;
  case 'stats':
    cmdStats(params);
    break;
  case 'help':
  default:
    showHelp();
}
