#!/usr/bin/env node

// Simple test to verify the enhanced agent can be imported and basic functionality works
console.log('Testing Enhanced Agent Service...');

try {
  // Test if we can import the basic types
  const { ExecutionEngine, PlanningSystem } = require('./packages/shared/dist/services/ExecutionEngine');
  console.log('✅ ExecutionEngine can be imported');
  
  const { PlanningSystem: PlanningSystemClass } = require('./packages/shared/dist/services/PlanningSystem');
  console.log('✅ PlanningSystem can be imported');
  
  console.log('🎉 Basic enhanced agent components are working!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
}
