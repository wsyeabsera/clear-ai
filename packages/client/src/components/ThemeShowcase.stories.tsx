import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button, Card, Input, ThemeSwitcher } from './index';
import { ThemeProvider } from '../themes';

const meta: Meta = {
  title: 'Design System/Themes',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete theme showcase demonstrating all available themes with their unique styles and animations.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Theme Showcase Component
const ThemeShowcase: React.FC<{ themeName: string }> = ({ themeName }) => {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <ThemeProvider defaultTheme={themeName as any}>
      <div style={{ 
        padding: '2rem', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        {/* Theme Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textTransform: 'capitalize'
          }}>
            {themeName} Theme
          </h1>
          <ThemeSwitcher size="lg" />
        </div>

        {/* Buttons Section */}
        <Card title="Buttons" shadow>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" disabled>Disabled Button</Button>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem',
            alignItems: 'center'
          }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        {/* Cards Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem'
        }}>
          <Card title="Regular Card" shadow>
            <p>This is a regular card with shadow. It demonstrates the theme's card styling.</p>
            <Button variant="primary">Action</Button>
          </Card>
          
          <Card title="Clickable Card" shadow clickable>
            <p>This card is clickable and will show hover effects.</p>
            <Button variant="outline">Explore</Button>
          </Card>
          
          <Card title="No Shadow" shadow={false}>
            <p>This card has no shadow for a flatter design.</p>
            <Button variant="ghost">Learn More</Button>
          </Card>
        </div>

        {/* Inputs Section */}
        <Card title="Form Elements" shadow>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem'
          }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={inputValue}
              onChange={setInputValue}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              helpText="Must be at least 8 characters"
            />
            
            <Input
              label="Username"
              placeholder="Enter username"
              error="Username is required"
            />
            
            <Input
              label="Disabled Input"
              placeholder="This is disabled"
              disabled
            />
          </div>
        </Card>

        {/* Color Palette */}
        <Card title="Theme Colors" shadow>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem'
          }}>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-primary-main)',
              color: 'var(--color-primary-contrast)',
              textAlign: 'center'
            }}>
              Primary
            </div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-secondary-main)',
              color: 'var(--color-secondary-contrast)',
              textAlign: 'center'
            }}>
              Secondary
            </div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-status-success)',
              color: 'white',
              textAlign: 'center'
            }}>
              Success
            </div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-status-warning)',
              color: 'white',
              textAlign: 'center'
            }}>
              Warning
            </div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-status-error)',
              color: 'white',
              textAlign: 'center'
            }}>
              Error
            </div>
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem',
              backgroundColor: 'var(--color-status-info)',
              color: 'white',
              textAlign: 'center'
            }}>
              Info
            </div>
          </div>
        </Card>

        {/* Typography */}
        <Card title="Typography" shadow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h1 style={{ margin: 0 }}>Heading 1 - Main Title</h1>
            <h2 style={{ margin: 0 }}>Heading 2 - Section Title</h2>
            <h3 style={{ margin: 0 }}>Heading 3 - Subsection</h3>
            <p>This is a paragraph with regular text. It demonstrates the theme's typography and color scheme.</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              This is smaller secondary text that shows the theme's secondary text color.
            </p>
            <code style={{ 
              fontFamily: 'var(--font-family-mono)',
              backgroundColor: 'var(--color-background-elevated)',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid var(--color-border-light)'
            }}>
              Code snippet with mono font
            </code>
          </div>
        </Card>
      </div>
    </ThemeProvider>
  );
};

// Individual theme stories
export const Default: Story = {
  render: () => <ThemeShowcase themeName="default" />,
  parameters: {
    docs: {
      description: {
        story: 'Professional and clean theme perfect for business applications.',
      },
    },
  },
};

export const Neowave: Story = {
  render: () => <ThemeShowcase themeName="neowave" />,
  parameters: {
    docs: {
      description: {
        story: 'Futuristic neon-inspired theme with glowing effects and vibrant colors.',
      },
    },
  },
};

export const Techno: Story = {
  render: () => <ThemeShowcase themeName="techno" />,
  parameters: {
    docs: {
      description: {
        story: 'Matrix-inspired theme with green terminal aesthetics and monospace fonts.',
      },
    },
  },
};

export const OldSchool: Story = {
  render: () => <ThemeShowcase themeName="oldschool" />,
  parameters: {
    docs: {
      description: {
        story: 'Classic and elegant theme with warm colors and serif typography.',
      },
    },
  },
};

export const Alien: Story = {
  render: () => <ThemeShowcase themeName="alien" />,
  parameters: {
    docs: {
      description: {
        story: 'Out-of-this-world theme with alien-inspired colors and morphing effects.',
      },
    },
  },
};

// Theme Comparison
export const ThemeComparison: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>Theme Comparison</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {['default', 'neowave', 'techno', 'oldschool', 'alien'].map(theme => (
          <div key={theme} style={{ 
            border: '2px solid var(--color-border-default)',
            borderRadius: '1rem',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--color-background-paper)',
              borderBottom: '1px solid var(--color-border-light)'
            }}>
              <h3 style={{ 
                textTransform: 'capitalize', 
                margin: 0,
                textAlign: 'center'
              }}>
                {theme} Theme
              </h3>
            </div>
            <ThemeProvider defaultTheme={theme as any}>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Button size="sm" variant="primary">Primary</Button>
                  <Button size="sm" variant="outline">Outline</Button>
                </div>
                <Card title="Sample Card" shadow={false}>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    Quick preview of the {theme} theme styling.
                  </p>
                </Card>
              </div>
            </ThemeProvider>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all available themes.',
      },
    },
  },
};
