"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const themes_1 = require("../themes");
// Example prompts based on the API relationship tests
const EXAMPLE_CATEGORIES = [
    {
        name: 'API Relationships',
        description: 'Test understanding of data relationships and API structures using JSONPlaceholder',
        prompts: [
            {
                id: 'api-relationships-1',
                text: 'Analyze the relationships between users, posts, and comments in the JSONPlaceholder API (https://jsonplaceholder.typicode.com/). Show me how a user can have multiple posts and each post can have multiple comments using these endpoints: GET /users, GET /posts, GET /comments.',
                category: 'API Relationships',
                description: 'Tests relationship analysis with users, posts, and comments'
            },
            {
                id: 'api-relationships-2',
                text: 'Explain how albums and photos are connected in JSONPlaceholder (https://jsonplaceholder.typicode.com/). Can you show me how to get all photos for album ID 1 using GET /albums/1 and GET /photos?albumId=1?',
                category: 'API Relationships',
                description: 'Album-photo relationship analysis'
            },
            {
                id: 'api-relationships-3',
                text: 'What patterns do you see in the JSONPlaceholder API (https://jsonplaceholder.typicode.com/)? How are users connected to todos and how can I filter todos by completion status using GET /todos?userId=1&completed=false?',
                category: 'API Relationships',
                description: 'User-todo relationships and filtering patterns'
            },
            {
                id: 'api-relationships-4',
                text: 'Show me the complete data flow using JSONPlaceholder (https://jsonplaceholder.typicode.com/): how can I get all posts by user ID 1 (GET /posts?userId=1), then get comments for the first post (GET /comments?postId=1), and finally get the user details for comment authors (GET /users/1)?',
                category: 'API Relationships',
                description: 'Complex relationship traversal and filtering'
            },
            {
                id: 'api-relationships-5',
                text: 'Explain the filtering capabilities in JSONPlaceholder (https://jsonplaceholder.typicode.com/). How can I filter posts by user ID (GET /posts?userId=1), todos by completion status (GET /todos?completed=true), and photos by album ID (GET /photos?albumId=1)?',
                category: 'API Relationships',
                description: 'API filtering and querying patterns'
            }
        ]
    },
    {
        name: 'JSONPlaceholder API Examples',
        description: 'Practical examples using the JSONPlaceholder API endpoints',
        prompts: [
            {
                id: 'jsonplaceholder-1',
                text: 'Using https://jsonplaceholder.typicode.com/, get all posts for user ID 1 (GET /posts?userId=1), then show me how to get comments for the first post (GET /comments?postId=1)',
                category: 'JSONPlaceholder API Examples',
                description: 'User posts and their comments traversal'
            },
            {
                id: 'jsonplaceholder-2',
                text: 'Using https://jsonplaceholder.typicode.com/, show me all incomplete todos for user ID 5 (GET /todos?userId=5&completed=false) and explain how to mark them as completed (PUT /todos/{id})',
                category: 'JSONPlaceholder API Examples',
                description: 'Todo filtering and status management'
            },
            {
                id: 'jsonplaceholder-3',
                text: 'Using https://jsonplaceholder.typicode.com/, get all photos from album ID 3 (GET /photos?albumId=3) and show me the photo URLs and titles',
                category: 'JSONPlaceholder API Examples',
                description: 'Album photos retrieval'
            },
            {
                id: 'jsonplaceholder-4',
                text: 'Using https://jsonplaceholder.typicode.com/, find all users who have commented on posts by user ID 2. Start with GET /posts?userId=2, then GET /comments?postId=11 for the first post, then GET /users/1 for the first comment author',
                category: 'JSONPlaceholder API Examples',
                description: 'Cross-entity relationship analysis'
            },
            {
                id: 'jsonplaceholder-5',
                text: 'Using https://jsonplaceholder.typicode.com/, create a new post for user ID 1 with title "My New Post" and body "This is the content" (POST /posts with JSON payload)',
                category: 'JSONPlaceholder API Examples',
                description: 'Data creation and POST operations'
            },
            {
                id: 'jsonplaceholder-6',
                text: 'Using https://jsonplaceholder.typicode.com/, show me how to get user details (GET /users/1), then get all their posts (GET /posts?userId=1), and finally get comments on their first post (GET /comments?postId=1)',
                category: 'JSONPlaceholder API Examples',
                description: 'Complete user profile analysis'
            },
            {
                id: 'jsonplaceholder-7',
                text: 'Using https://jsonplaceholder.typicode.com/, demonstrate filtering: GET /posts?userId=3&title_like=qui, GET /todos?completed=false&userId=2, and GET /photos?albumId=1&title_like=accusamus',
                category: 'JSONPlaceholder API Examples',
                description: 'Advanced filtering with query parameters'
            },
            {
                id: 'jsonplaceholder-8',
                text: 'Using https://jsonplaceholder.typicode.com/, show me how to update a post (PUT /posts/1), delete a post (DELETE /posts/1), and handle pagination (GET /posts?_limit=10&_page=2)',
                category: 'JSONPlaceholder API Examples',
                description: 'CRUD operations and pagination'
            },
            {
                id: 'jsonplaceholder-9',
                text: 'Using https://jsonplaceholder.typicode.com/, get user ID 1 details (GET /users/1) and show me their contact information',
                category: 'JSONPlaceholder API Examples',
                description: 'Simple user data retrieval'
            },
            {
                id: 'jsonplaceholder-10',
                text: 'Using https://jsonplaceholder.typicode.com/, get all comments for post ID 1 (GET /comments?postId=1) and analyze the comment structure',
                category: 'JSONPlaceholder API Examples',
                description: 'Comment data analysis'
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
const PromptModal = ({ isOpen, onClose, onPromptSelect, disabled = false, }) => {
    const { theme } = (0, themes_1.useTheme)();
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)(null);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    // Lock body scroll when modal is open
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);
    // Reset state when modal opens/closes
    (0, react_1.useEffect)(() => {
        if (isOpen) {
            setSelectedCategory(null);
            setSearchTerm('');
        }
    }, [isOpen]);
    if (!isOpen)
        return null;
    const overlayStyles = {
        position: 'fixed',
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
        flexDirection: 'column',
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
        flexDirection: 'column',
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
        overflowY: 'auto',
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
        overflowY: 'auto',
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
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    const handlePromptClick = (prompt) => {
        onPromptSelect(prompt.text);
        onClose();
    };
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };
    const handleBackClick = () => {
        setSelectedCategory(null);
    };
    // Filter prompts based on search term
    const filteredCategories = EXAMPLE_CATEGORIES.map(category => ({
        ...category,
        prompts: category.prompts.filter(prompt => prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(category => category.prompts.length > 0);
    const filteredPrompts = selectedCategory ?
        selectedCategory.prompts.filter(prompt => prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prompt.description?.toLowerCase().includes(searchTerm.toLowerCase())) : [];
    return (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)("div", { style: overlayStyles, onClick: handleOverlayClick, onKeyDown: handleKeyDown, tabIndex: -1, children: (0, jsx_runtime_1.jsxs)("div", { style: modalStyles, children: [(0, jsx_runtime_1.jsxs)("div", { style: headerStyles, children: [(0, jsx_runtime_1.jsx)("h3", { style: titleStyles, children: "Select a Prompt" }), (0, jsx_runtime_1.jsx)("button", { style: closeButtonStyles, onClick: onClose, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                                e.currentTarget.style.color = theme.colors.text.primary;
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = theme.colors.text.secondary;
                            }, title: "Close modal", children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { style: contentStyles, children: [(0, jsx_runtime_1.jsx)("div", { style: searchStyles, children: (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Search prompts...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), style: searchInputStyles, disabled: disabled }) }), (0, jsx_runtime_1.jsxs)("div", { style: mainContentStyles, children: [!selectedCategory ? ((0, jsx_runtime_1.jsx)("div", { style: sidebarStyles, children: (0, jsx_runtime_1.jsx)("div", { style: categoryListStyles, children: filteredCategories.map((category) => ((0, jsx_runtime_1.jsxs)("div", { style: categoryItemStyles, onClick: () => handleCategoryClick(category), onMouseEnter: (e) => {
                                                e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                                                e.currentTarget.style.border = `1px solid ${theme.colors.primary.main}40`;
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.border = '1px solid transparent';
                                            }, children: [(0, jsx_runtime_1.jsx)("div", { style: categoryNameStyles, children: category.name }), (0, jsx_runtime_1.jsx)("div", { style: categoryDescStyles, children: category.description })] }, category.name))) }) })) : ((0, jsx_runtime_1.jsx)("div", { style: sidebarStyles, children: (0, jsx_runtime_1.jsx)("div", { style: categoryListStyles, children: (0, jsx_runtime_1.jsx)("button", { style: backButtonStyles, onClick: handleBackClick, onMouseEnter: (e) => {
                                                e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                                                e.currentTarget.style.color = theme.colors.text.primary;
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = theme.colors.text.secondary;
                                            }, children: "\u2190 Back to Categories" }) }) })), (0, jsx_runtime_1.jsx)("div", { style: promptsAreaStyles, children: selectedCategory ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("h4", { style: {
                                                    marginBottom: '1rem',
                                                    color: theme.colors.text.primary,
                                                    fontSize: theme.typography.fontSize.base,
                                                    fontWeight: theme.typography.fontWeight.medium,
                                                }, children: [selectedCategory.name, " Prompts"] }), filteredPrompts.length > 0 ? (filteredPrompts.map((prompt) => ((0, jsx_runtime_1.jsxs)("div", { style: promptItemStyles, onClick: () => handlePromptClick(prompt), onMouseEnter: (e) => {
                                                    e.currentTarget.style.backgroundColor = theme.colors.interactive.hover;
                                                    e.currentTarget.style.border = `1px solid ${theme.colors.primary.main}40`;
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.border = '1px solid transparent';
                                                }, children: [(0, jsx_runtime_1.jsx)("div", { style: promptTextStyles, children: prompt.text }), prompt.description && ((0, jsx_runtime_1.jsx)("div", { style: promptDescStyles, children: prompt.description }))] }, prompt.id)))) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                    textAlign: 'center',
                                                    color: theme.colors.text.disabled,
                                                    padding: '2rem',
                                                }, children: ["No prompts found matching \"", searchTerm, "\""] }))] })) : ((0, jsx_runtime_1.jsx)("div", { style: {
                                            textAlign: 'center',
                                            color: theme.colors.text.disabled,
                                            padding: '2rem',
                                        }, children: "Select a category to view prompts" })) })] })] })] }) }), document.body);
};
exports.PromptModal = PromptModal;
exports.default = exports.PromptModal;
//# sourceMappingURL=PromptModal.js.map