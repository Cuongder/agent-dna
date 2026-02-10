#!/usr/bin/env node
/**
 * NeuralMemory Wrapper for OpenClaw
 * Tích hợp NeuralMemory (Python) với OpenClaw (Node.js)
 */

const { execSync, exec } = require('child_process');
const path = require('path');

const NMEM_BIN = '/usr/local/bin/nmem';

/**
 * Execute nmem command and return result
 */
function runNmem(args, callback) {
  const cmd = `${NMEM_BIN} ${args} --json`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`NeuralMemory error: ${error.message}`);
      callback(error, null);
      return;
    }
    try {
      const result = JSON.parse(stdout);
      callback(null, result);
    } catch (e) {
      callback(null, { raw: stdout });
    }
  });
}

/**
 * Remember a memory
 */
function remember(content, type = 'context', priority = 5, callback) {
  const args = `remember "${content.replace(/"/g, '\\"')}" --type ${type} --priority ${priority}`;
  runNmem(args, callback);
}

/**
 * Recall memories
 */
function recall(query, depth = 1, callback) {
  const args = `recall "${query.replace(/"/g, '\\"')}" --depth ${depth}`;
  runNmem(args, callback);
}

/**
 * Get context
 */
function context(limit = 5, callback) {
  const args = `context --limit ${limit}`;
  runNmem(args, callback);
}

/**
 * Recap session
 */
function recap(callback) {
  runNmem('recap', callback);
}

/**
 * Session management
 */
function session(action, data = {}, callback) {
  let args = `session --action ${action}`;
  if (data.feature) args += ` --feature "${data.feature}"`;
  if (data.task) args += ` --task "${data.task}"`;
  if (data.progress) args += ` --progress ${data.progress}`;
  runNmem(args, callback);
}

/**
 * Stats
 */
function stats(callback) {
  runNmem('stats', callback);
}

/**
 * Auto capture from text
 */
function autoCapture(text, callback) {
  const args = `auto --action process --text "${text.replace(/"/g, '\\"')}"`;
  runNmem(args, callback);
}

// Export for use in OpenClaw
module.exports = {
  remember,
  recall,
  context,
  recap,
  session,
  stats,
  autoCapture,
  runNmem
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('NeuralMemory Wrapper for OpenClaw');
    console.log('Usage: node neural-memory-wrapper.js <command> [args]');
    console.log('');
    console.log('Commands:');
    console.log('  remember <content> [type] [priority]');
    console.log('  recall <query> [depth]');
    console.log('  context [limit]');
    console.log('  recap');
    console.log('  stats');
    process.exit(0);
  }

  const command = args[0];
  
  switch (command) {
    case 'remember':
      remember(args[1], args[2] || 'context', parseInt(args[3]) || 5, (err, result) => {
        if (err) console.error(err);
        else console.log(JSON.stringify(result, null, 2));
      });
      break;
    case 'recall':
      recall(args[1], parseInt(args[2]) || 1, (err, result) => {
        if (err) console.error(err);
        else console.log(JSON.stringify(result, null, 2));
      });
      break;
    case 'context':
      context(parseInt(args[1]) || 5, (err, result) => {
        if (err) console.error(err);
        else console.log(JSON.stringify(result, null, 2));
      });
      break;
    case 'recap':
      recap((err, result) => {
        if (err) console.error(err);
        else console.log(JSON.stringify(result, null, 2));
      });
      break;
    case 'stats':
      stats((err, result) => {
        if (err) console.error(err);
        else console.log(JSON.stringify(result, null, 2));
      });
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}
