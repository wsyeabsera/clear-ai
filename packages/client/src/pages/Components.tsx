import React, { useState } from 'react';
import { Button, Card, Input } from '../components';

const Components: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('Form submitted! Check console for data.');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Component Library</h1>
        <p className="text-lg text-gray-600">
          A showcase of all available components in the Clear AI design system.
        </p>
      </div>

      {/* Buttons Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Basic Card">
            <p className="text-gray-600">
              This is a basic card with some content inside.
            </p>
          </Card>
          
          <Card title="Clickable Card" clickable>
            <p className="text-gray-600 mb-4">
              This card is clickable and has a hover effect.
            </p>
            <Button size="sm">Action</Button>
          </Card>
          
          <Card title="No Shadow" shadow={false}>
            <p className="text-gray-600">
              This card has no shadow for a flatter look.
            </p>
          </Card>
        </div>
      </section>

      {/* Inputs Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Inputs</h2>
        <div className="max-w-2xl space-y-6">
          <Input
            label="Name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange('name')}
          />
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            required
          />
          
          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            helpText="Include country code (e.g., +1)"
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
          />
          
          <Input
            label="Error Example"
            placeholder="This input has an error"
            error="This field is required"
          />
          
          <Input
            label="Disabled Input"
            placeholder="This input is disabled"
            disabled
            value="Disabled value"
          />
        </div>
      </section>

      {/* Form Example */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Form Example</h2>
        <Card title="Contact Form">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                placeholder="Enter your first name"
                required
              />
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                required
              />
            </div>
            
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your message"
                value={formData.message}
                onChange={(e) => handleInputChange('message')(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Send Message
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* Component Stats */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Component Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Total Components">
            <p className="text-3xl font-bold text-blue-600">4</p>
            <p className="text-sm text-gray-500">Button, Card, Input, Layout</p>
          </Card>
          
          <Card title="Stories Created">
            <p className="text-3xl font-bold text-green-600">12</p>
            <p className="text-sm text-gray-500">Comprehensive test coverage</p>
          </Card>
          
          <Card title="TypeScript Coverage">
            <p className="text-3xl font-bold text-purple-600">100%</p>
            <p className="text-sm text-gray-500">Fully typed components</p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Components;
