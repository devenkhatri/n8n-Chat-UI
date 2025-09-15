#!/usr/bin/env node

/**
 * Comprehensive test runner for the UI/UX modernization project
 * Runs unit tests, integration tests, accessibility tests, and performance tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test configuration
const testConfig = {
  unit: {
    name: 'Unit Tests',
    command: 'npm test -- --testPathPattern="(components|hooks|lib).*\\.test\\.(ts|tsx)$" --coverage',
    color: colors.green,
  },
  integration: {
    name: 'Integration Tests',
    command: 'npm test -- --testPathPattern="__tests__/integration" --verbose',
    color: colors.blue,
  },
  accessibility: {
    name: 'Accessibility Tests',
    command: 'npm test -- --testPathPattern="__tests__/accessibility" --verbose',
    color: colors.magenta,
  },
  performance: {
    name: 'Performance Tests',
    command: 'npm test -- --testPathPattern="__tests__/performance" --verbose',
    color: colors.cyan,
  },
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  const border = '='.repeat(message.length + 4);
  log(border, colors.bright);
  log(`  ${message}  `, colors.bright);
  log(border, colors.bright);
}

function logSection(message, color = colors.yellow) {
  log(`\n${'-'.repeat(50)}`, color);
  log(message, color);
  log('-'.repeat(50), color);
}

function runCommand(command, description, color = colors.reset) {
  try {
    log(`\n🚀 Running: ${description}`, color);
    log(`Command: ${command}`, colors.reset);
    
    const startTime = Date.now();
    const output = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    
    const duration = Date.now() - startTime;
    log(`✅ ${description} completed in ${duration}ms`, colors.green);
    
    return { success: true, duration, output };
  } catch (error) {
    log(`❌ ${description} failed`, colors.red);
    log(`Error: ${error.message}`, colors.red);
    return { success: false, error: error.message };
  }
}

function generateTestReport(results) {
  const reportPath = path.join(process.cwd(), 'test-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length,
    },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📊 Test report generated: ${reportPath}`, colors.blue);
  
  return report;
}

function displaySummary(report) {
  logSection('TEST SUMMARY', colors.bright);
  
  log(`Total test suites: ${report.summary.total}`, colors.bright);
  log(`Passed: ${report.summary.passed}`, colors.green);
  log(`Failed: ${report.summary.failed}`, colors.red);
  
  const successRate = (report.summary.passed / report.summary.total * 100).toFixed(1);
  log(`Success rate: ${successRate}%`, successRate === '100.0' ? colors.green : colors.yellow);
  
  // Display individual results
  Object.entries(report.results).forEach(([testType, result]) => {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration ? `(${result.duration}ms)` : '';
    log(`${status} ${testConfig[testType].name} ${duration}`, 
        result.success ? colors.green : colors.red);
  });
}

function checkPrerequisites() {
  logSection('Checking Prerequisites');
  
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    log('❌ node_modules not found. Please run "npm install" first.', colors.red);
    process.exit(1);
  }
  
  // Check if Jest is available
  try {
    execSync('npx jest --version', { stdio: 'pipe' });
    log('✅ Jest is available', colors.green);
  } catch (error) {
    log('❌ Jest is not available. Please install dependencies.', colors.red);
    process.exit(1);
  }
  
  // Check if test files exist
  const testDirs = ['__tests__', 'components', 'hooks', 'lib'];
  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`✅ ${dir} directory found`, colors.green);
    } else {
      log(`⚠️  ${dir} directory not found`, colors.yellow);
    }
  });
}

function runLinting() {
  logSection('Code Quality Checks');
  
  try {
    log('🔍 Running ESLint...', colors.blue);
    execSync('npm run lint', { stdio: 'inherit' });
    log('✅ Linting passed', colors.green);
    return true;
  } catch (error) {
    log('❌ Linting failed', colors.red);
    return false;
  }
}

function runTypeChecking() {
  try {
    log('🔍 Running TypeScript type checking...', colors.blue);
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    log('✅ Type checking passed', colors.green);
    return true;
  } catch (error) {
    log('❌ Type checking failed', colors.red);
    return false;
  }
}

async function main() {
  const startTime = Date.now();
  
  logHeader('UI/UX Modernization Test Suite');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const runAll = args.length === 0 || args.includes('--all');
  const runUnit = runAll || args.includes('--unit');
  const runIntegration = runAll || args.includes('--integration');
  const runAccessibility = runAll || args.includes('--accessibility');
  const runPerformance = runAll || args.includes('--performance');
  const skipLinting = args.includes('--skip-lint');
  const skipTypeCheck = args.includes('--skip-types');
  
  // Check prerequisites
  checkPrerequisites();
  
  // Run code quality checks
  if (!skipLinting) {
    const lintPassed = runLinting();
    if (!lintPassed && !args.includes('--force')) {
      log('\n❌ Linting failed. Fix linting errors or use --force to continue.', colors.red);
      process.exit(1);
    }
  }
  
  if (!skipTypeCheck) {
    const typeCheckPassed = runTypeChecking();
    if (!typeCheckPassed && !args.includes('--force')) {
      log('\n❌ Type checking failed. Fix type errors or use --force to continue.', colors.red);
      process.exit(1);
    }
  }
  
  // Run tests
  const results = {};
  
  if (runUnit) {
    results.unit = runCommand(
      testConfig.unit.command,
      testConfig.unit.name,
      testConfig.unit.color
    );
  }
  
  if (runIntegration) {
    results.integration = runCommand(
      testConfig.integration.command,
      testConfig.integration.name,
      testConfig.integration.color
    );
  }
  
  if (runAccessibility) {
    results.accessibility = runCommand(
      testConfig.accessibility.command,
      testConfig.accessibility.name,
      testConfig.accessibility.color
    );
  }
  
  if (runPerformance) {
    results.performance = runCommand(
      testConfig.performance.command,
      testConfig.performance.name,
      testConfig.performance.color
    );
  }
  
  // Generate report and display summary
  const report = generateTestReport(results);
  displaySummary(report);
  
  const totalTime = Date.now() - startTime;
  log(`\n⏱️  Total execution time: ${totalTime}ms`, colors.blue);
  
  // Exit with appropriate code
  const hasFailures = report.summary.failed > 0;
  if (hasFailures) {
    log('\n❌ Some tests failed. Please review the output above.', colors.red);
    process.exit(1);
  } else {
    log('\n🎉 All tests passed!', colors.green);
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught exception: ${error.message}`, colors.red);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`\n💥 Unhandled rejection at: ${promise}, reason: ${reason}`, colors.red);
  process.exit(1);
});

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  logHeader('Test Runner Help');
  log('Usage: node scripts/test-runner.js [options]');
  log('\nOptions:');
  log('  --all              Run all test suites (default)');
  log('  --unit             Run unit tests only');
  log('  --integration      Run integration tests only');
  log('  --accessibility    Run accessibility tests only');
  log('  --performance      Run performance tests only');
  log('  --skip-lint        Skip linting checks');
  log('  --skip-types       Skip TypeScript type checking');
  log('  --force            Continue even if linting/type checking fails');
  log('  --help, -h         Show this help message');
  log('\nExamples:');
  log('  node scripts/test-runner.js                    # Run all tests');
  log('  node scripts/test-runner.js --unit             # Run unit tests only');
  log('  node scripts/test-runner.js --accessibility    # Run accessibility tests only');
  log('  node scripts/test-runner.js --skip-lint        # Skip linting');
  process.exit(0);
}

// Run the main function
main().catch((error) => {
  log(`\n💥 Fatal error: ${error.message}`, colors.red);
  console.error(error.stack);
  process.exit(1);
});