/**
 * CLI Tool - Agent DNA System
 * Command line interface để tương tác với evolution engine
 */

const fs = require('fs');
const path = require('path');

// Import evolution modules
const Crossover = require('../src/evolution/crossover');
const Mutation = require('../src/evolution/mutation');
const Selection = require('../src/evolution/selection');

class DNACLITool {
  constructor() {
    this.crossover = new Crossover();
    this.mutation = new Mutation();
    this.selection = new Selection();
  }

  /**
   * Parse command line arguments
   */
  parseArgs() {
    const args = process.argv.slice(2);
    const command = args[0];
    const options = {};

    for (let i = 1; i < args.length; i += 2) {
      const key = args[i].replace('--', '');
      const value = args[i + 1];
      options[key] = value;
    }

    return { command, options };
  }

  /**
   * Load DNA từ file
   */
  loadDNA(filepath) {
    try {
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error loading DNA from ${filepath}:`, err.message);
      process.exit(1);
    }
  }

  /**
   * Save DNA to file
   */
  saveDNA(dna, filepath) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(dna, null, 2));
      console.log(`✅ Saved DNA to ${filepath}`);
    } catch (err) {
      console.error(`Error saving DNA:`, err.message);
      process.exit(1);
    }
  }

  /**
   * Create sample DNA
   */
  createSampleDNA(agentId = 'agent-001') {
    return {
      agent_id: agentId,
      generation: 0,
      genes: {
        // Cognitive genes
        creativity: Math.random(),
        analytical: Math.random(),
        caution: Math.random(),
        curiosity: Math.random(),
        
        // Skill genes
        coding: Math.random(),
        research: Math.random(),
        communication: Math.random(),
        leadership: Math.random(),
        
        // Learning genes
        learning_rate: Math.random(),
        memory_retention: Math.random(),
        adaptation_speed: Math.random()
      },
      fitness: 0
    };
  }

  /**
   * Command: Create sample DNA
   */
  cmdCreate(options) {
    const agentId = options.id || `agent-${Date.now()}`;
    const dna = this.createSampleDNA(agentId);
    
    const outputPath = options.output || `./${agentId}-dna.json`;
    this.saveDNA(dna, outputPath);
    
    console.log(`\n🧬 Created DNA for ${agentId}`);
    console.log('Genes:', JSON.stringify(dna.genes, null, 2));
  }

  /**
   * Command: Crossover (breed)
   */
  cmdCrossover(options) {
    if (!options.parentA || !options.parentB) {
      console.error('❌ Error: --parentA and --parentB required');
      process.exit(1);
    }

    const parentA = this.loadDNA(options.parentA);
    const parentB = this.loadDNA(options.parentB);
    const count = parseInt(options.count) || 1;
    
    const offspring = this.crossover.createOffspring(parentA, parentB, count);
    
    console.log(`\n🔄 Crossover: ${parentA.agent_id} × ${parentB.agent_id}`);
    console.log(`Created ${count} offspring:\n`);
    
    offspring.forEach((child, i) => {
      const outputPath = options.output || `./offspring-${i + 1}-dna.json`;
      this.saveDNA(child, outputPath);
      console.log(`  ${i + 1}. ${child.agent_id}`);
    });
  }

  /**
   * Command: Mutate
   */
  cmdMutate(options) {
    if (!options.input) {
      console.error('❌ Error: --input required');
      process.exit(1);
    }

    const dna = this.loadDNA(options.input);
    const rate = parseFloat(options.rate) || 0.1;
    const strength = parseFloat(options.strength) || 0.1;
    
    const mutated = this.mutation.mutate(dna, { rate, strength });
    
    console.log('\n🧪 Mutation Results:');
    console.log(`  Rate: ${rate}`);
    console.log(`  Strength: ${strength}`);
    
    // Show what changed
    if (dna.mutations && dna.mutations.length > 0) {
      const lastMutation = dna.mutations[dna.mutations.length - 1];
      console.log(`  Mutations applied: ${Object.keys(mutated.genes).length}`);
    }
    
    const outputPath = options.output || `./mutated-${dna.agent_id}-dna.json`;
    this.saveDNA(mutated, outputPath);
  }

  /**
   * Command: Evaluate fitness
   */
  cmdEvaluate(options) {
    if (!options.input) {
      console.error('❌ Error: --input required');
      process.exit(1);
    }

    const dna = this.loadDNA(options.input);
    const metrics = {
      taskSuccess: parseFloat(options.success) || 0.5,
      userSatisfaction: parseFloat(options.satisfaction) || 0.5,
      efficiency: parseFloat(options.efficiency) || 0.5
    };
    
    const fitness = this.selection.evaluateFitness(dna, metrics);
    dna.fitness = fitness;
    
    console.log('\n📊 Fitness Evaluation:');
    console.log(`  Agent: ${dna.agent_id}`);
    console.log(`  Fitness: ${fitness.toFixed(4)}`);
    console.log(`  Gene Average: ${(Object.values(dna.genes).reduce((a, b) => a + b, 0) / Object.keys(dna.genes).length).toFixed(4)}`);
    
    const outputPath = options.output || options.input;
    this.saveDNA(dna, outputPath);
  }

  /**
   * Command: Select best
   */
  cmdSelect(options) {
    if (!options.population) {
      console.error('❌ Error: --population (directory) required');
      process.exit(1);
    }

    const popDir = options.population;
    const files = fs.readdirSync(popDir).filter(f => f.endsWith('.json'));
    
    const population = files.map(f => this.loadDNA(path.join(popDir, f)));
    const count = parseInt(options.count) || 3;
    
    const selected = this.selection.select(population, count);
    
    console.log(`\n🎯 Selected ${count} best agents from ${population.length}:`);
    selected.forEach((agent, i) => {
      console.log(`  ${i + 1}. ${agent.agent_id} (fitness: ${agent.fitness?.toFixed(4) || 'N/A'})`);
    });
    
    if (options.output) {
      selected.forEach((agent, i) => {
        this.saveDNA(agent, path.join(options.output, `selected-${i + 1}.json`));
      });
    }
  }

  /**
   * Command: Stats
   */
  cmdStats(options) {
    if (!options.population) {
      console.error('❌ Error: --population (directory) required');
      process.exit(1);
    }

    const popDir = options.population;
    const files = fs.readdirSync(popDir).filter(f => f.endsWith('.json'));
    const population = files.map(f => this.loadDNA(path.join(popDir, f)));
    
    const stats = this.selection.getPopulationStats(population);
    
    console.log('\n📈 Population Statistics:');
    console.log(`  Size: ${stats.size}`);
    console.log(`  Best Fitness: ${stats.bestFitness?.toFixed(4) || 'N/A'}`);
    console.log(`  Worst Fitness: ${stats.worstFitness?.toFixed(4) || 'N/A'}`);
    console.log(`  Average Fitness: ${stats.avgFitness?.toFixed(4) || 'N/A'}`);
    console.log(`  Diversity: ${stats.diversity?.toFixed(4) || 'N/A'}`);
  }

  /**
   * Main CLI handler
   */
  run() {
    const { command, options } = this.parseArgs();

    if (!command) {
      console.log(`
🧬 Agent DNA System - CLI Tool

Usage: node cli.js <command> [options]

Commands:
  create       Create sample DNA
    --id <name>         Agent ID
    --output <file>     Output file

  crossover    Breed two parent DNAs
    --parentA <file>    Parent A DNA file
    --parentB <file>    Parent B DNA file
    --count <n>         Number of offspring
    --output <dir>      Output directory

  mutate       Mutate DNA
    --input <file>      Input DNA file
    --rate <0-1>        Mutation rate
    --strength <0-1>    Mutation strength
    --output <file>     Output file

  evaluate     Calculate fitness
    --input <file>      Input DNA file
    --success <0-1>     Task success rate
    --satisfaction <0-1> User satisfaction
    --efficiency <0-1>  Efficiency score

  select       Select best agents
    --population <dir>   Population directory
    --count <n>         Number to select
    --output <dir>      Output directory

  stats        Show population statistics
    --population <dir>   Population directory

Examples:
  node cli.js create --id kakashi --output kakashi-dna.json
  node cli.js crossover --parentA kakashi-dna.json --parentB shika-dna.json --count 3
  node cli.js mutate --input offspring-1-dna.json --rate 0.15 --strength 0.2
      `);
      process.exit(0);
    }

    switch (command) {
      case 'create':
        this.cmdCreate(options);
        break;
      case 'crossover':
        this.cmdCrossover(options);
        break;
      case 'mutate':
        this.cmdMutate(options);
        break;
      case 'evaluate':
        this.cmdEvaluate(options);
        break;
      case 'select':
        this.cmdSelect(options);
        break;
      case 'stats':
        this.cmdStats(options);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const cli = new DNACLITool();
  cli.run();
}

module.exports = DNACLITool;
