#!/usr/bin/env node

/**
 * Master Enhanced Agent Test Runner
 * 
 * This script runs all enhanced agent tests and provides comprehensive analysis:
 * - Comprehensive functionality tests
 * - Tool chains and relationships tests
 * - Performance analysis
 * - Detailed reporting
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MasterTestRunner {
  constructor() {
    this.results = {
      comprehensive: null,
      toolChains: null,
      startTime: null,
      endTime: null,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalErrors: 0
    };
  }

  async runComprehensiveTests() {
    console.log('🧪 Running Comprehensive Enhanced Agent Tests...');
    console.log('=' .repeat(60));
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['test-enhanced-agent-comprehensive.js'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Comprehensive tests completed successfully');
          resolve({ stdout, stderr, code });
        } else {
          console.log(`\n❌ Comprehensive tests failed with code ${code}`);
          reject(new Error(`Comprehensive tests failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error('❌ Error running comprehensive tests:', error);
        reject(error);
      });
    });
  }

  async runToolChainTests() {
    console.log('\n🔗 Running Tool Chains and Relationships Tests...');
    console.log('=' .repeat(60));
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['test-tool-chains-relationships.js'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Tool chain tests completed successfully');
          resolve({ stdout, stderr, code });
        } else {
          console.log(`\n❌ Tool chain tests failed with code ${code}`);
          reject(new Error(`Tool chain tests failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error('❌ Error running tool chain tests:', error);
        reject(error);
      });
    });
  }

  async checkServerStatus() {
    console.log('🔍 Checking Enhanced Agent Server Status...');
    
    try {
      const axios = require('axios');
      const response = await axios.get('http://localhost:3001/api/agent/enhanced-status', {
        timeout: 10000
      });
      
      if (response.data.success) {
        console.log('✅ Enhanced Agent server is running and responsive');
        return true;
      } else {
        console.log('❌ Enhanced Agent server is not responding properly');
        return false;
      }
    } catch (error) {
      console.log('❌ Enhanced Agent server is not accessible:', error.message);
      console.log('💡 Make sure the server is running on http://localhost:3001');
      return false;
    }
  }

  async initializeAgent() {
    console.log('🚀 Initializing Enhanced Agent Service...');
    
    try {
      const axios = require('axios');
      const response = await axios.post('http://localhost:3001/api/agent/enhanced-initialize', {}, {
        timeout: 60000
      });
      
      if (response.data.success) {
        console.log('✅ Enhanced Agent service initialized successfully');
        return true;
      } else {
        console.log('❌ Failed to initialize Enhanced Agent service');
        return false;
      }
    } catch (error) {
      console.log('❌ Error initializing Enhanced Agent service:', error.message);
      return false;
    }
  }

  generateDetailedReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ENHANCED AGENT COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    
    const duration = this.results.endTime - this.results.startTime;
    const durationMinutes = Math.floor(duration / 60000);
    const durationSeconds = Math.floor((duration % 60000) / 1000);
    
    console.log(`⏱️  Total Execution Time: ${durationMinutes}m ${durationSeconds}s`);
    console.log(`📈 Overall Success Rate: ${this.getOverallSuccessRate()}%`);
    console.log(`📊 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.totalPassed}`);
    console.log(`❌ Failed: ${this.results.totalFailed}`);
    console.log(`⚠️  Errors: ${this.results.totalErrors}`);
    
    console.log('\n🎯 TEST SUITE BREAKDOWN:');
    if (this.results.comprehensive) {
      const compRate = this.getComprehensiveSuccessRate();
      console.log(`  📋 Comprehensive Tests: ${compRate}% success rate`);
    }
    
    if (this.results.toolChains) {
      const chainRate = this.getToolChainSuccessRate();
      console.log(`  🔗 Tool Chain Tests: ${chainRate}% success rate`);
    }
    
    console.log('\n🔍 CAPABILITY ASSESSMENT:');
    this.assessCapabilities();
    
    console.log('\n💡 RECOMMENDATIONS:');
    this.generateRecommendations();
    
    console.log('\n📝 DETAILED FINDINGS:');
    this.generateDetailedFindings();
    
    console.log('\n' + '='.repeat(80));
  }

  getOverallSuccessRate() {
    if (this.results.totalTests === 0) return 0;
    return Math.round((this.results.totalPassed / this.results.totalTests) * 100);
  }

  getComprehensiveSuccessRate() {
    if (!this.results.comprehensive) return 0;
    const { testResults } = this.results.comprehensive;
    if (testResults.total === 0) return 0;
    return Math.round((testResults.passed / testResults.total) * 100);
  }

  getToolChainSuccessRate() {
    if (!this.results.toolChains) return 0;
    const { chainTestResults } = this.results.toolChains;
    if (chainTestResults.total === 0) return 0;
    return Math.round((chainTestResults.passed / chainTestResults.total) * 100);
  }

  assessCapabilities() {
    const overallRate = this.getOverallSuccessRate();
    
    if (overallRate >= 90) {
      console.log('  ✅ EXCELLENT: Enhanced Agent is performing exceptionally well');
      console.log('     - All core capabilities are functioning properly');
      console.log('     - Tool execution and chaining work reliably');
      console.log('     - Memory and reasoning systems are effective');
    } else if (overallRate >= 75) {
      console.log('  ⚠️  GOOD: Enhanced Agent is performing well with minor issues');
      console.log('     - Most capabilities are working correctly');
      console.log('     - Some areas may need attention or optimization');
      console.log('     - Overall system is stable and usable');
    } else if (overallRate >= 50) {
      console.log('  ⚠️  MODERATE: Enhanced Agent has significant issues');
      console.log('     - Core functionality is partially working');
      console.log('     - Several components need debugging or fixes');
      console.log('     - System may be unstable in some scenarios');
    } else {
      console.log('  ❌ POOR: Enhanced Agent has major issues');
      console.log('     - Core functionality is not working properly');
      console.log('     - System needs significant debugging and fixes');
      console.log('     - Not recommended for production use');
    }
  }

  generateRecommendations() {
    const overallRate = this.getOverallSuccessRate();
    
    if (overallRate >= 90) {
      console.log('  🎉 System is performing excellently!');
      console.log('     - Consider adding more advanced features');
      console.log('     - Monitor performance under high load');
      console.log('     - Document successful patterns for future development');
    } else if (overallRate >= 75) {
      console.log('  🔧 Focus on improving failed test areas:');
      if (this.results.comprehensive && this.results.comprehensive.testResults.failed > 0) {
        console.log('     - Review comprehensive test failures');
        console.log('     - Check intent classification accuracy');
        console.log('     - Verify tool execution reliability');
      }
      if (this.results.toolChains && this.results.toolChains.chainTestResults.failed > 0) {
        console.log('     - Improve tool chaining mechanisms');
        console.log('     - Enhance data flow between tools');
        console.log('     - Strengthen error recovery');
      }
    } else if (overallRate >= 50) {
      console.log('  🚨 Priority fixes needed:');
      console.log('     - Debug core functionality issues');
      console.log('     - Check server configuration and dependencies');
      console.log('     - Verify API endpoints are working correctly');
      console.log('     - Review error handling and logging');
    } else {
      console.log('  🆘 Critical issues require immediate attention:');
      console.log('     - Check if Enhanced Agent service is properly initialized');
      console.log('     - Verify all dependencies are installed and configured');
      console.log('     - Check server logs for startup errors');
      console.log('     - Ensure all required environment variables are set');
    }
  }

  generateDetailedFindings() {
    if (this.results.comprehensive && this.results.comprehensive.testResults.errors.length > 0) {
      console.log('  🚨 Comprehensive Test Errors:');
      this.results.comprehensive.testResults.errors.forEach(error => {
        console.log(`     - ${error.test}: ${error.error}`);
      });
    }
    
    if (this.results.toolChains && this.results.toolChains.chainTestResults.errors.length > 0) {
      console.log('  🚨 Tool Chain Test Errors:');
      this.results.toolChains.chainTestResults.errors.forEach(error => {
        console.log(`     - ${error.test}: ${error.error}`);
      });
    }
    
    if (this.results.comprehensive && this.results.comprehensive.testResults.failed > 0) {
      console.log('  ❌ Comprehensive Test Failures:');
      this.results.comprehensive.testResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`     - ${test.name}: ${test.details}`);
        });
    }
    
    if (this.results.toolChains && this.results.toolChains.chainTestResults.failed > 0) {
      console.log('  ❌ Tool Chain Test Failures:');
      this.results.toolChains.chainTestResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`     - ${test.name}: ${test.details}`);
        });
    }
  }

  async saveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: this.results.endTime - this.results.startTime,
      results: this.results,
      summary: {
        overallSuccessRate: this.getOverallSuccessRate(),
        comprehensiveSuccessRate: this.getComprehensiveSuccessRate(),
        toolChainSuccessRate: this.getToolChainSuccessRate(),
        totalTests: this.results.totalTests,
        totalPassed: this.results.totalPassed,
        totalFailed: this.results.totalFailed,
        totalErrors: this.results.totalErrors
      }
    };
    
    const reportPath = `enhanced-agent-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  async runAllTests() {
    this.results.startTime = Date.now();
    
    console.log('🚀 Starting Enhanced Agent Master Test Suite');
    console.log('=' .repeat(80));
    
    try {
      // Check server status
      const serverRunning = await this.checkServerStatus();
      if (!serverRunning) {
        console.log('\n❌ Cannot proceed without a running Enhanced Agent server');
        console.log('💡 Please start the server and try again');
        process.exit(1);
      }
      
      // Initialize agent
      const agentInitialized = await this.initializeAgent();
      if (!agentInitialized) {
        console.log('\n❌ Cannot proceed without initializing the Enhanced Agent service');
        process.exit(1);
      }
      
      // Run comprehensive tests
      try {
        const comprehensiveResult = await this.runComprehensiveTests();
        this.results.comprehensive = { testResults: require('./test-enhanced-agent-comprehensive.js').testResults };
        this.results.totalTests += this.results.comprehensive.testResults.total;
        this.results.totalPassed += this.results.comprehensive.testResults.passed;
        this.results.totalFailed += this.results.comprehensive.testResults.failed;
        this.results.totalErrors += this.results.comprehensive.testResults.errors.length;
      } catch (error) {
        console.log('❌ Comprehensive tests failed:', error.message);
        this.results.comprehensive = { error: error.message };
      }
      
      // Run tool chain tests
      try {
        const toolChainResult = await this.runToolChainTests();
        this.results.toolChains = { chainTestResults: require('./test-tool-chains-relationships.js').chainTestResults };
        this.results.totalTests += this.results.toolChains.chainTestResults.total;
        this.results.totalPassed += this.results.toolChains.chainTestResults.passed;
        this.results.totalFailed += this.results.toolChains.chainTestResults.failed;
        this.results.totalErrors += this.results.toolChains.chainTestResults.errors.length;
      } catch (error) {
        console.log('❌ Tool chain tests failed:', error.message);
        this.results.toolChains = { error: error.message };
      }
      
      this.results.endTime = Date.now();
      
      // Generate and display report
      this.generateDetailedReport();
      
      // Save detailed report
      await this.saveReport();
      
      // Exit with appropriate code
      const overallRate = this.getOverallSuccessRate();
      if (overallRate >= 75) {
        console.log('\n🎉 Test suite completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Test suite completed with significant issues');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Master test runner failed:', error);
      process.exit(1);
    }
  }
}

// Run the master test suite
async function main() {
  const runner = new MasterTestRunner();
  await runner.runAllTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Master test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { MasterTestRunner };
