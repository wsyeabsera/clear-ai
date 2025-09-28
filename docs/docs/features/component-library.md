# Component Library

Clear AI provides a comprehensive React component library designed for building AI-powered applications with consistent design and functionality.

## Overview

The component library includes:
- **UI Components**: Buttons, inputs, cards, modals, and more
- **AI-Specific Components**: Chat interfaces, tool execution displays, workflow visualizers
- **Layout Components**: Grids, containers, and responsive layouts
- **Data Display**: Tables, lists, and data visualization components
- **Feedback Components**: Loading states, error messages, and notifications

## Installation

```bash
npm install clear-ai
```

```typescript
import { 
  Button, 
  Input, 
  Card, 
  Modal 
} from 'clear-ai/client';
```

## Basic Components

### Button

```typescript
import { Button } from 'clear-ai/client';

function ButtonExample() {
  return (
    <div>
      <Button variant="primary" size="lg">
        Primary Button
      </Button>
      <Button variant="secondary" size="md">
        Secondary Button
      </Button>
      <Button variant="outline" size="sm">
        Outline Button
      </Button>
      <Button variant="ghost" disabled>
        Disabled Button
      </Button>
    </div>
  );
}
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `disabled`: boolean
- `loading`: boolean
- `onClick`: () => void

### Input

```typescript
import { Input, Label } from 'clear-ai/client';

function InputExample() {
  const [value, setValue] = useState('');
  
  return (
    <div>
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your email"
        variant="outlined"
        size="md"
      />
    </div>
  );
}
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'search'
- `variant`: 'outlined' | 'filled' | 'underlined'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `error`: string | boolean
- `helperText`: string

### Card

```typescript
import { Card, CardHeader, CardBody, CardFooter } from 'clear-ai/client';

function CardExample() {
  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <Heading size="lg">Card Title</Heading>
        <Text color="secondary">Card subtitle</Text>
      </CardHeader>
      <CardBody>
        <Text>This is the card content. It can contain any React elements.</Text>
      </CardBody>
      <CardFooter>
        <Button variant="primary">Action</Button>
        <Button variant="outline">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
```

## AI-Specific Components

### Chat Interface

```typescript
import { ChatInterface, Message, MessageInput } from 'clear-ai/client';

function ChatExample() {
  const [messages, setMessages] = useState([]);
  
  const handleSendMessage = async (content) => {
    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    
    // Send to AI service
    const response = await aiService.chat([...messages, userMessage]);
    const aiMessage = { role: 'assistant', content: response.content };
    setMessages(prev => [...prev, aiMessage]);
  };
  
  return (
    <ChatInterface>
      {messages.map((message, index) => (
        <Message
          key={index}
          role={message.role}
          content={message.content}
          timestamp={message.timestamp}
        />
      ))}
      <MessageInput
        onSend={handleSendMessage}
        placeholder="Type your message..."
        disabled={loading}
      />
    </ChatInterface>
  );
}
```

### Tool Execution Display

```typescript
import { ToolExecution, ToolResult, ToolError } from 'clear-ai/client';

function ToolExecutionExample() {
  const [execution, setExecution] = useState(null);
  
  return (
    <div>
      {execution && (
        <ToolExecution
          toolName={execution.toolName}
          status={execution.status}
          startTime={execution.startTime}
        >
          {execution.status === 'success' && (
            <ToolResult
              data={execution.result}
              executionTime={execution.executionTime}
            />
          )}
          {execution.status === 'error' && (
            <ToolError
              error={execution.error}
              onRetry={() => retryExecution()}
            />
          )}
        </ToolExecution>
      )}
    </div>
  );
}
```

### Workflow Visualizer

```typescript
import { WorkflowVisualizer, WorkflowStep, WorkflowConnection } from 'clear-ai/client';

function WorkflowExample() {
  const workflow = {
    id: 'data-analysis',
    steps: [
      { id: 'fetch', name: 'Fetch Data', status: 'completed' },
      { id: 'process', name: 'Process Data', status: 'running' },
      { id: 'analyze', name: 'Analyze Results', status: 'pending' }
    ]
  };
  
  return (
    <WorkflowVisualizer workflow={workflow}>
      {workflow.steps.map((step, index) => (
        <WorkflowStep
          key={step.id}
          step={step}
          position={index}
        />
      ))}
      {workflow.steps.map((step, index) => 
        index < workflow.steps.length - 1 && (
          <WorkflowConnection
            key={`${step.id}-${workflow.steps[index + 1].id}`}
            from={step.id}
            to={workflow.steps[index + 1].id}
          />
        )
      )}
    </WorkflowVisualizer>
  );
}
```

## Layout Components

### Container

```typescript
import { Container, Row, Col } from 'clear-ai/client';

function LayoutExample() {
  return (
    <Container maxWidth="lg" padding="lg">
      <Row gap="md">
        <Col span={8}>
          <Card>
            <Heading size="lg">Main Content</Heading>
            <Text>This is the main content area.</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Heading size="md">Sidebar</Heading>
            <Text>This is the sidebar content.</Text>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
```

### Grid

```typescript
import { Grid, GridItem } from 'clear-ai/client';

function GridExample() {
  return (
    <Grid columns={3} gap="md">
      <GridItem>
        <Card>Item 1</Card>
      </GridItem>
      <GridItem>
        <Card>Item 2</Card>
      </GridItem>
      <GridItem>
        <Card>Item 3</Card>
      </GridItem>
    </Grid>
  );
}
```

## Data Display Components

### Table

```typescript
import { Table, TableHeader, TableBody, TableRow, TableCell } from 'clear-ai/client';

function TableExample() {
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### List

```typescript
import { List, ListItem, ListItemText, ListItemIcon } from 'clear-ai/client';

function ListExample() {
  const items = [
    { icon: '📊', text: 'Analytics Dashboard' },
    { icon: '🔧', text: 'Settings' },
    { icon: '📝', text: 'Reports' }
  ];
  
  return (
    <List>
      {items.map((item, index) => (
        <ListItem key={index} onClick={() => handleClick(item)}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  );
}
```

## Feedback Components

### Loading States

```typescript
import { Spinner, Skeleton, ProgressBar } from 'clear-ai/client';

function LoadingExample() {
  return (
    <div>
      <Spinner size="lg" />
      <Skeleton height="20px" width="200px" />
      <ProgressBar value={75} max={100} />
    </div>
  );
}
```

### Notifications

```typescript
import { Toast, Alert, NotificationProvider } from 'clear-ai/client';

function NotificationExample() {
  return (
    <NotificationProvider>
      <Toast
        type="success"
        title="Success!"
        message="Operation completed successfully"
        duration={5000}
      />
      <Alert
        type="warning"
        title="Warning"
        message="Please check your input"
        closable
      />
    </NotificationProvider>
  );
}
```

## Form Components

### Form

```typescript
import { Form, FormField, FormLabel, FormError } from 'clear-ai/client';

function FormExample() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  return (
    <Form onSubmit={handleSubmit}>
      <FormField>
        <FormLabel>Username</FormLabel>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          error={errors.username}
        />
        {errors.username && <FormError>{errors.username}</FormError>}
      </FormField>
      
      <Button type="submit" variant="primary">
        Submit
      </Button>
    </Form>
  );
}
```

### Select

```typescript
import { Select, SelectOption } from 'clear-ai/client';

function SelectExample() {
  const [value, setValue] = useState('');
  
  return (
    <Select
      value={value}
      onChange={setValue}
      placeholder="Choose an option"
    >
      <SelectOption value="option1">Option 1</SelectOption>
      <SelectOption value="option2">Option 2</SelectOption>
      <SelectOption value="option3">Option 3</SelectOption>
    </Select>
  );
}
```

## Advanced Components

### Modal

```typescript
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'clear-ai/client';

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="lg"
      >
        <ModalHeader>
          <Heading size="lg">Modal Title</Heading>
        </ModalHeader>
        <ModalBody>
          <Text>Modal content goes here</Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
```

### Tabs

```typescript
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'clear-ai/client';

function TabsExample() {
  return (
    <Tabs>
      <TabList>
        <Tab>Overview</Tab>
        <Tab>Details</Tab>
        <Tab>Settings</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Text>Overview content</Text>
        </TabPanel>
        <TabPanel>
          <Text>Details content</Text>
        </TabPanel>
        <TabPanel>
          <Text>Settings content</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
```

## Styling and Theming

### Custom Styling

```typescript
import { styled } from 'clear-ai/client';

const CustomButton = styled(Button)`
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;
```

### Theme Integration

```typescript
import { useTheme } from 'clear-ai/client';

function ThemedComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      padding: theme.spacing.lg
    }}>
      Themed content
    </div>
  );
}
```

## Accessibility

All components include built-in accessibility features:

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG compliant color schemes
- **Semantic HTML**: Proper HTML structure

## Performance

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';
import { Spinner } from 'clear-ai/client';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo } from 'react';
import { Card } from 'clear-ai/client';

const MemoizedCard = memo(({ data }) => (
  <Card>
    <Text>{data.title}</Text>
  </Card>
));
```

## Best Practices

1. **Consistent Usage**: Use components consistently across your app
2. **Accessibility**: Always provide proper labels and descriptions
3. **Performance**: Use memoization for expensive components
4. **Theming**: Leverage the theme system for consistent styling
5. **Testing**: Write tests for your component usage

## Migration Guide

### From v1 to v2

```typescript
// v1
<Button primary large>Click me</Button>

// v2
<Button variant="primary" size="lg">Click me</Button>
```

## Troubleshooting

### Common Issues

1. **Styling not applied**: Check theme provider setup
2. **Components not rendering**: Verify imports and dependencies
3. **Accessibility issues**: Check ARIA attributes and keyboard navigation
4. **Performance problems**: Use React DevTools Profiler to identify bottlenecks
