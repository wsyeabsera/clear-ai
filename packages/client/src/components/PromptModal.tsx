import React, { useEffect, useState } from 'react';
import { useTheme } from '../themes';

export interface ExamplePrompt {
  id: string;
  text: string;
  category: string;
  description?: string;
}

export interface PromptCategory {
  name: string;
  description: string;
  prompts: ExamplePrompt[];
}

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptSelect: (prompt: string) => void;
  disabled?: boolean;
}

// Example prompts based on the API relationship tests
const EXAMPLE_CATEGORIES: PromptCategory[] = [
  {
    name: 'API Relationships',
    description: 'Test understanding of data relationships and API structures',
    prompts: [
      {
        id: 'api-relationships-1',
        text: 'Analyze the relationships between users, posts, and comments in this data structure',
        category: 'API Relationships',
        description: 'Tests relationship analysis capabilities'
      },
      {
        id: 'api-relationships-2',
        text: 'What patterns do you see in this API data? How are the entities connected?',
        category: 'API Relationships',
        description: 'Pattern recognition and entity connections'
      },
      {
        id: 'api-relationships-3',
        text: 'Explain the data flow and dependencies in this system',
        category: 'API Relationships',
        description: 'Data flow analysis'
      }
    ]
  },
  {
    name: 'Memory & Context',
    description: 'Test memory integration and context awareness',
    prompts: [
      {
        id: 'memory-1',
        text: 'What do you remember about our previous conversation?',
        category: 'Memory & Context',
        description: 'Basic memory retrieval'
      },
      {
        id: 'memory-2',
        text: 'Can you recall any insights we discussed about machine learning?',
        category: 'Memory & Context',
        description: 'Topic-specific memory search'
      },
      {
        id: 'memory-3',
        text: 'Store this information for future reference: [Your important note here]',
        category: 'Memory & Context',
        description: 'Explicit memory storage'
      }
    ]
  },
  {
    name: 'Tool Execution',
    description: 'Test tool calling and execution capabilities',
    prompts: [
      {
        id: 'tools-1',
        text: 'Calculate 15 * 23 + 45',
        category: 'Tool Execution',
        description: 'Mathematical calculation'
      },
      {
        id: 'tools-2',
        text: 'What\'s the weather like in New York?',
        category: 'Tool Execution',
        description: 'Weather information request'
      },
      {
        id: 'tools-3',
        text: 'Greet me in Spanish',
        category: 'Tool Execution',
        description: 'Multi-language greeting'
      }
    ]
  },
  {
    name: 'Reasoning & Analysis',
    description: 'Test logical reasoning and analytical capabilities',
    prompts: [
      {
        id: 'reasoning-1',
        text: 'Explain step-by-step how you would solve a complex problem',
        category: 'Reasoning & Analysis',
        description: 'Step-by-step reasoning demonstration'
      },
      {
        id: 'reasoning-2',
        text: 'What are the pros and cons of different approaches to this problem?',
        category: 'Reasoning & Analysis',
        description: 'Comparative analysis'
      },
      {
        id: 'reasoning-3',
        text: 'Help me debug this issue and explain your thought process',
        category: 'Reasoning & Analysis',
        description: 'Debugging assistance'
      }
    ]
  },
  {
    name: 'Custom Training',
    description: 'Personal prompts to train the agent for your specific needs',
    prompts: [
      {
        id: 'custom-1',
        text: 'I prefer detailed explanations with examples',
        category: 'Custom Training',
        description: 'Set preference for detailed responses'
      },
      {
        id: 'custom-2',
        text: 'When I ask about code, always include error handling',
        category: 'Custom Training',
        description: 'Code response preference'
      },
      {
        id: 'custom-3',
        text: 'Remember that I work with React and TypeScript primarily',
        category: 'Custom Training',
        description: 'Technology stack preference'
      }
    ]
  }
];

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onPromptSelect,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
    width: '100vw',
    height: '100vh',
  };

  const modalStyles = {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.effects.borderRadius.lg,
    boxShadow: theme.effects.shadow.xl,
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '800px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  };

  const headerStyles = {
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${theme.colors.border.default}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
  };

  const closeButtonStyles = {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: theme.effects.borderRadius.md,
    cursor: 'pointer',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: theme.effects.transition.normal,
    '&:hover': {
      backgroundColor: theme.colors.interactive.hover,
      color: theme.colors.text.primary,
    },
  };

  const contentStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  };

  const searchStyles = {
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${theme.colors.border.default}`,
  };

  const searchInputStyles = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.effects.borderRadius.md,
    backgroundColor: theme.colors.background.default,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.sm,
    outline: 'none',
    transition: theme.effects.transition.normal,
    '&:focus': {
      borderColor: theme.colors.primary.main,
      boxShadow: `0 0 0 3px ${theme.colors.primary.main}33`,
    },
    '&::placeholder': {
      color: theme.colors.text.disabled,
    },
  };

  const mainContentStyles = {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  };

  const sidebarStyles = {
    width: '300px',
    borderRight: `1px solid ${theme.colors.border.default}`,
    backgroundColor: theme.colors.background.default,
    overflowY: 'auto' as const,
  };

  const categoryListStyles = {
    padding: '1rem',
  };

  const categoryItemStyles = {
    padding: '0.75rem',
    cursor: 'pointer',
    borderRadius: theme.effects.borderRadius.md,
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    transition: theme.effects.transition.normal,
    marginBottom: '0.5rem',
    '&:hover': {
      backgroundColor: theme.colors.interactive.hover,
      border: `1px solid ${theme.colors.primary.main}40`,
    },
  };

  const categoryNameStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: '0.25rem',
  };

  const categoryDescStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    lineHeight: 1.3,
  };

  const promptsAreaStyles = {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto' as const,
  };

  const backButtonStyles = {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.border.default}`,
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    borderRadius: theme.effects.borderRadius.md,
    marginBottom: '1rem',
    transition: theme.effects.transition.normal,
    '&:hover': {
      backgroundColor: theme.colors.interactive.hover,
      color: theme.colors.text.primary,
    },
  };

  const promptItemStyles = {
    padding: '1rem',
    cursor: 'pointer',
    borderRadius: theme.effects.borderRadius.md,
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    transition: theme.effects.transition.normal,
    marginBottom: '0.75rem',
    '&:hover': {
      backgroundColor: theme.colors.interactive.hover,
      border: `1px solid ${theme.colors.primary.main}40`,
    },
  };

  const promptTextStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: '0.5rem',
    lineHeight: 1.4,
  };

  const promptDescStyles = {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    fontStyle: 'italic',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handlePromptClick = (prompt: ExamplePrompt) => {
    onPromptSelect(prompt.text);
    onClose();
  };

  const handleCategoryClick = (category: PromptCategory) => {
    setSelectedCategory(category);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  // Filter prompts based on search term
  const filteredCategories = EXAMPLE_CATEGORIES.map(category => ({
    ...category,
    prompts: category.prompts.filter(prompt =>
      prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.prompts.length > 0);

  const filteredPrompts = selectedCategory ? 
    selectedCategory.prompts.filter(prompt =>
      prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  return (
    <div
      style={overlayStyles}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div style={modalStyles}>
        <div style={headerStyles}>
          <h3 style={titleStyles}>Select a Prompt</h3>
          <button
            style={closeButtonStyles}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
            title="Close modal"
          >
            ×
          </button>
        </div>
        
        <div style={contentStyles}>
          <div style={searchStyles}>
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyles}
              disabled={disabled}
            />
          </div>

          <div style={mainContentStyles}>
            {!selectedCategory ? (
              <div style={sidebarStyles}>
                <div style={categoryListStyles}>
                  {filteredCategories.map((category) => (
                    <div
                      key={category.name}
                      style={categoryItemStyles}
                      onClick={() => handleCategoryClick(category)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                        e.currentTarget.style.border = `1px solid ${theme.colors.primary.main}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.border = '1px solid transparent';
                      }}
                    >
                      <div style={categoryNameStyles}>
                        {category.name}
                      </div>
                      <div style={categoryDescStyles}>
                        {category.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={sidebarStyles}>
                <div style={categoryListStyles}>
                  <button
                    style={backButtonStyles}
                    onClick={handleBackClick}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                      e.currentTarget.style.color = theme.colors.text.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.colors.text.secondary;
                    }}
                  >
                    ← Back to Categories
                  </button>
                </div>
              </div>
            )}

            <div style={promptsAreaStyles}>
              {selectedCategory ? (
                <>
                  <h4 style={{ 
                    marginBottom: '1rem', 
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}>
                    {selectedCategory.name} Prompts
                  </h4>
                  {filteredPrompts.length > 0 ? (
                    filteredPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        style={promptItemStyles}
                        onClick={() => handlePromptClick(prompt)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                          e.currentTarget.style.border = `1px solid ${theme.colors.primary.main}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.border = '1px solid transparent';
                        }}
                      >
                        <div style={promptTextStyles}>
                          {prompt.text}
                        </div>
                        {prompt.description && (
                          <div style={promptDescStyles}>
                            {prompt.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      color: theme.colors.text.disabled,
                      padding: '2rem',
                    }}>
                      No prompts found matching "{searchTerm}"
                    </div>
                  )}
                </>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: theme.colors.text.disabled,
                  padding: '2rem',
                }}>
                  Select a category to view prompts
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
