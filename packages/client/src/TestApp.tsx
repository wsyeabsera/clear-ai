import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Clear AI Test App</h1>
      <p style={{ color: '#666', fontSize: '16px' }}>If you can see this, React is working correctly!</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        border: '1px solid #2196f3',
        borderRadius: '8px'
      }}>
        <h2 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>Status: ✅ Working</h2>
        <p style={{ margin: '0', color: '#424242' }}>The React development server is running successfully.</p>
      </div>
    </div>
  );
};

export default TestApp;
