import React, { useState, useEffect } from 'react';

/**
 * VtellTales: WebApp Style Editor - Interactive Design System Editor
 * 
 * This component provides a visual interface for editing and previewing
 * the VtellTales: WebApp design system styles in real-time.
 */

interface StyleConfig {
  colors: {
    primaryYellow: string;
    primaryBlue: string;
    accentOrange: string;
    accentGreen: string;
    accentRed: string;
    accentPurple: string;
  };
  typography: {
    primaryFont: string;
    headingFont: string;
    baseSize: number;
    scaleRatio: number;
  };
  spacing: {
    baseUnit: number;
    scaleRatio: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    elevation: number;
    blur: number;
    spread: number;
    opacity: number;
  };
}

const defaultConfig: StyleConfig = {
  colors: {
    primaryYellow: '#F3D657',
    primaryBlue: '#5BCCF6',
    accentOrange: '#FF6B35',
    accentGreen: '#4CAF50',
    accentRed: '#E53E3E',
    accentPurple: '#8B5CF6'
  },
  typography: {
    primaryFont: 'system-ui, -apple-system, sans-serif',
    headingFont: 'Poppins, system-ui, sans-serif',
    baseSize: 16,
    scaleRatio: 1.25
  },
  spacing: {
    baseUnit: 4,
    scaleRatio: 2
  },
  borderRadius: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 12
  },
  shadows: {
    elevation: 4,
    blur: 6,
    spread: 0,
    opacity: 0.1
  }
};

const StyleEditor: React.FC = () => {
  const [config, setConfig] = useState<StyleConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'components'>('colors');
  const [previewComponent, setPreviewComponent] = useState<'button' | 'card' | 'form' | 'hero'>('button');
  const [exportedCSS, setExportedCSS] = useState<string>('');
  const [showExport, setShowExport] = useState(false);

  // Apply styles to CSS custom properties in real-time
  useEffect(() => {
    const root = document.documentElement;
    
    // Update color variables
    root.style.setProperty('--vtt-primary-yellow', config.colors.primaryYellow);
    root.style.setProperty('--vtt-primary-blue', config.colors.primaryBlue);
    root.style.setProperty('--vtt-accent-orange', config.colors.accentOrange);
    root.style.setProperty('--vtt-accent-green', config.colors.accentGreen);
    root.style.setProperty('--vtt-accent-red', config.colors.accentRed);
    root.style.setProperty('--vtt-accent-purple', config.colors.accentPurple);
    
    // Update typography variables
    root.style.setProperty('--vtt-font-primary', config.typography.primaryFont);
    root.style.setProperty('--vtt-font-heading', config.typography.headingFont);
    root.style.setProperty('--vtt-text-base', `${config.typography.baseSize}px`);
    
    // Update spacing variables
    root.style.setProperty('--vtt-spacing-base', `${config.spacing.baseUnit}px`);
    
    // Update border radius variables
    root.style.setProperty('--vtt-radius-sm', `${config.borderRadius.sm}px`);
    root.style.setProperty('--vtt-radius-md', `${config.borderRadius.md}px`);
    root.style.setProperty('--vtt-radius-lg', `${config.borderRadius.lg}px`);
    root.style.setProperty('--vtt-radius-xl', `${config.borderRadius.xl}px`);
    
  }, [config]);

  const updateConfig = (section: keyof StyleConfig, property: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [property]: value
      }
    }));
  };

  const resetToDefaults = () => {
    setConfig(defaultConfig);
  };

  const generateCSS = () => {
    return `:root {
  /* VtellTales: WebApp Color System */
  --vtt-primary-yellow: ${config.colors.primaryYellow};
  --vtt-primary-blue: ${config.colors.primaryBlue};
  --vtt-accent-orange: ${config.colors.accentOrange};
  --vtt-accent-green: ${config.colors.accentGreen};
  --vtt-accent-red: ${config.colors.accentRed};
  --vtt-accent-purple: ${config.colors.accentPurple};
  
  /* Typography System */
  --vtt-font-primary: ${config.typography.primaryFont};
  --vtt-font-heading: ${config.typography.headingFont};
  --vtt-text-base: ${config.typography.baseSize}px;
  
  /* Spacing System */
  --vtt-spacing-1: ${config.spacing.baseUnit}px;
  --vtt-spacing-2: ${config.spacing.baseUnit * 2}px;
  --vtt-spacing-3: ${config.spacing.baseUnit * 3}px;
  --vtt-spacing-4: ${config.spacing.baseUnit * 4}px;
  --vtt-spacing-6: ${config.spacing.baseUnit * 6}px;
  --vtt-spacing-8: ${config.spacing.baseUnit * 8}px;
  
  /* Border Radius */
  --vtt-radius-sm: ${config.borderRadius.sm}px;
  --vtt-radius-md: ${config.borderRadius.md}px;
  --vtt-radius-lg: ${config.borderRadius.lg}px;
  --vtt-radius-xl: ${config.borderRadius.xl}px;
  
  /* Shadows */
  --vtt-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, ${config.shadows.opacity});
  --vtt-shadow-md: 0 ${config.shadows.elevation}px ${config.shadows.blur}px ${config.shadows.spread}px rgba(0, 0, 0, ${config.shadows.opacity});
}`;
  };

  const exportStyles = () => {
    const css = generateCSS();
    setExportedCSS(css);
    setShowExport(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ColorPicker: React.FC<{ 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    description?: string;
  }> = ({ label, value, onChange, description }) => (
    <div className="vtt-form-group">
      <label className="vtt-label flex items-center gap-2">
        {label}
        <div 
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: value }}
        />
      </label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="vtt-input w-full h-12 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="vtt-input mt-2 font-mono text-sm"
        placeholder="#000000"
      />
      {description && (
        <span className="vtt-help-text">{description}</span>
      )}
    </div>
  );

  const NumberInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    description?: string;
  }> = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', description }) => (
    <div className="vtt-form-group">
      <label className="vtt-label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="vtt-input w-20"
        />
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {description && (
        <span className="vtt-help-text">{description}</span>
      )}
    </div>
  );

  const PreviewButton = () => (
    <div className="space-y-4">
      <button className="vtt-button vtt-button-primary">
        Primary Button
      </button>
      <button className="vtt-button vtt-button-secondary">
        Secondary Button
      </button>
      <button className="vtt-button vtt-button-outline">
        Outline Button
      </button>
      <button className="vtt-button vtt-button-ghost">
        Ghost Button
      </button>
    </div>
  );

  const PreviewCard = () => (
    <div className="vtt-story-card max-w-sm">
      <div className="vtt-story-card-image h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <span className="text-gray-500">Story Image</span>
      </div>
      <div className="vtt-story-card-content">
        <div className="flex items-start justify-between mb-3">
          <h3 className="vtt-heading-5 flex-1">Adventure in the Magical Forest</h3>
          <span className="vtt-age-badge-5to7 ml-2">Ages 5-7</span>
        </div>
        <p className="vtt-text-sm text-gray-600 mb-4">
          Join Luna the rabbit on an enchanting journey through a forest filled with talking animals and magical surprises.
        </p>
        <div className="flex items-center justify-between">
          <span className="vtt-badge vtt-badge-success">Published</span>
          <button className="vtt-button vtt-button-primary vtt-button-sm">
            Read Story
          </button>
        </div>
      </div>
    </div>
  );

  const PreviewForm = () => (
    <form className="vtt-form max-w-md">
      <div className="vtt-form-group">
        <label className="vtt-label vtt-label-required">Story Title</label>
        <input
          type="text"
          className="vtt-input"
          placeholder="Enter your story title..."
          defaultValue="The Magic Adventure"
        />
      </div>
      <div className="vtt-form-group">
        <label className="vtt-label">Age Group</label>
        <select className="vtt-select" defaultValue="5-7">
          <option value="3-5">Ages 3-5 (Early Learners)</option>
          <option value="5-7">Ages 5-7 (Beginning Readers)</option>
          <option value="7-10">Ages 7-10 (Independent Readers)</option>
        </select>
      </div>
      <div className="vtt-form-group">
        <label className="vtt-label">Description</label>
        <textarea
          className="vtt-textarea"
          rows={3}
          placeholder="Describe your story..."
          defaultValue="A magical adventure that teaches friendship and courage."
        />
      </div>
      <div className="vtt-form-actions">
        <button type="button" className="vtt-button vtt-button-outline">
          Cancel
        </button>
        <button type="submit" className="vtt-button vtt-button-primary">
          Create Story
        </button>
      </div>
    </form>
  );

  const PreviewHero = () => (
    <section className="vtt-hero-section vtt-hero-background py-12">
      <div className="vtt-container text-center">
        <h1 className="vtt-display-2 vtt-gradient-text mb-6">
          Create Magical Stories
        </h1>
        <p className="vtt-lead mb-8 max-w-2xl mx-auto">
          Empower young minds with interactive storytelling that sparks imagination 
          and builds reading skills for children ages 3-10.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="vtt-button vtt-button-primary vtt-button-lg">
            Start Creating
          </button>
          <button className="vtt-button vtt-button-outline vtt-button-lg">
            Explore Stories
          </button>
        </div>
      </div>
    </section>
  );

  const renderPreview = () => {
    switch (previewComponent) {
      case 'button': return <PreviewButton />;
      case 'card': return <PreviewCard />;
      case 'form': return <PreviewForm />;
      case 'hero': return <PreviewHero />;
      default: return <PreviewButton />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="vtt-container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="vtt-heading-4 vtt-gradient-text">VtellTales: WebApp Style Editor</h1>
              <p className="vtt-text-sm text-gray-600">
                Customize your design system in real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetToDefaults}
                className="vtt-button vtt-button-outline vtt-button-sm"
              >
                Reset to Defaults
              </button>
              <button
                onClick={exportStyles}
                className="vtt-button vtt-button-primary vtt-button-sm"
              >
                Export CSS
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="vtt-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="vtt-card">
              <div className="vtt-card-body p-0">
                <div className="flex border-b border-gray-200">
                  {[
                    { key: 'colors', label: 'Colors' },
                    { key: 'typography', label: 'Typography' },
                    { key: 'spacing', label: 'Spacing' },
                    { key: 'components', label: 'Components' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? 'border-yellow-400 text-yellow-600 bg-yellow-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="vtt-card">
              <div className="vtt-card-body">
                {activeTab === 'colors' && (
                  <div className="space-y-6">
                    <h3 className="vtt-heading-5 mb-4">Color System</h3>
                    
                    <div>
                      <h4 className="vtt-heading-6 mb-4 text-gray-700">Primary Colors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ColorPicker
                          label="Primary Yellow"
                          value={config.colors.primaryYellow}
                          onChange={(value) => updateConfig('colors', 'primaryYellow', value)}
                          description="Main brand color for buttons and highlights"
                        />
                        <ColorPicker
                          label="Primary Blue"
                          value={config.colors.primaryBlue}
                          onChange={(value) => updateConfig('colors', 'primaryBlue', value)}
                          description="Secondary brand color for links and accents"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="vtt-heading-6 mb-4 text-gray-700">Accent Colors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ColorPicker
                          label="Orange"
                          value={config.colors.accentOrange}
                          onChange={(value) => updateConfig('colors', 'accentOrange', value)}
                          description="Call-to-action and warning states"
                        />
                        <ColorPicker
                          label="Green"
                          value={config.colors.accentGreen}
                          onChange={(value) => updateConfig('colors', 'accentGreen', value)}
                          description="Success states and ages 3-5"
                        />
                        <ColorPicker
                          label="Red"
                          value={config.colors.accentRed}
                          onChange={(value) => updateConfig('colors', 'accentRed', value)}
                          description="Error states and destructive actions"
                        />
                        <ColorPicker
                          label="Purple"
                          value={config.colors.accentPurple}
                          onChange={(value) => updateConfig('colors', 'accentPurple', value)}
                          description="Premium features and ages 7-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'typography' && (
                  <div className="space-y-6">
                    <h3 className="vtt-heading-5 mb-4">Typography System</h3>
                    
                    <div className="vtt-form-group">
                      <label className="vtt-label">Primary Font Family</label>
                      <input
                        type="text"
                        value={config.typography.primaryFont}
                        onChange={(e) => updateConfig('typography', 'primaryFont', e.target.value)}
                        className="vtt-input font-mono"
                        placeholder="system-ui, sans-serif"
                      />
                      <span className="vtt-help-text">Font used for body text and UI elements</span>
                    </div>

                    <div className="vtt-form-group">
                      <label className="vtt-label">Heading Font Family</label>
                      <input
                        type="text"
                        value={config.typography.headingFont}
                        onChange={(e) => updateConfig('typography', 'headingFont', e.target.value)}
                        className="vtt-input font-mono"
                        placeholder="Poppins, system-ui, sans-serif"
                      />
                      <span className="vtt-help-text">Font used for headings and display text</span>
                    </div>

                    <NumberInput
                      label="Base Font Size"
                      value={config.typography.baseSize}
                      onChange={(value) => updateConfig('typography', 'baseSize', value)}
                      min={12}
                      max={24}
                      step={1}
                      unit="px"
                      description="Base size for body text (16px recommended)"
                    />

                    <NumberInput
                      label="Type Scale Ratio"
                      value={config.typography.scaleRatio}
                      onChange={(value) => updateConfig('typography', 'scaleRatio', value)}
                      min={1.1}
                      max={1.6}
                      step={0.05}
                      description="Ratio for calculating heading sizes (1.25 = Major Third)"
                    />
                  </div>
                )}

                {activeTab === 'spacing' && (
                  <div className="space-y-6">
                    <h3 className="vtt-heading-5 mb-4">Spacing System</h3>
                    
                    <NumberInput
                      label="Base Unit"
                      value={config.spacing.baseUnit}
                      onChange={(value) => updateConfig('spacing', 'baseUnit', value)}
                      min={2}
                      max={8}
                      step={1}
                      unit="px"
                      description="Base unit for all spacing (4px recommended)"
                    />

                    <div>
                      <h4 className="vtt-heading-6 mb-4 text-gray-700">Border Radius</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                          label="Small"
                          value={config.borderRadius.sm}
                          onChange={(value) => updateConfig('borderRadius', 'sm', value)}
                          min={0}
                          max={20}
                          unit="px"
                        />
                        <NumberInput
                          label="Medium"
                          value={config.borderRadius.md}
                          onChange={(value) => updateConfig('borderRadius', 'md', value)}
                          min={0}
                          max={20}
                          unit="px"
                        />
                        <NumberInput
                          label="Large"
                          value={config.borderRadius.lg}
                          onChange={(value) => updateConfig('borderRadius', 'lg', value)}
                          min={0}
                          max={24}
                          unit="px"
                        />
                        <NumberInput
                          label="Extra Large"
                          value={config.borderRadius.xl}
                          onChange={(value) => updateConfig('borderRadius', 'xl', value)}
                          min={0}
                          max={32}
                          unit="px"
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="vtt-heading-6 mb-4 text-gray-700">Shadow Configuration</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <NumberInput
                          label="Elevation"
                          value={config.shadows.elevation}
                          onChange={(value) => updateConfig('shadows', 'elevation', value)}
                          min={0}
                          max={20}
                          unit="px"
                        />
                        <NumberInput
                          label="Blur"
                          value={config.shadows.blur}
                          onChange={(value) => updateConfig('shadows', 'blur', value)}
                          min={0}
                          max={40}
                          unit="px"
                        />
                        <NumberInput
                          label="Spread"
                          value={config.shadows.spread}
                          onChange={(value) => updateConfig('shadows', 'spread', value)}
                          min={-10}
                          max={10}
                          unit="px"
                        />
                        <NumberInput
                          label="Opacity"
                          value={config.shadows.opacity}
                          onChange={(value) => updateConfig('shadows', 'opacity', value)}
                          min={0}
                          max={1}
                          step={0.05}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'components' && (
                  <div className="space-y-6">
                    <h3 className="vtt-heading-5 mb-4">Component Styles</h3>
                    
                    <div className="vtt-alert vtt-alert-info">
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-medium">Component Configuration</h4>
                        <p className="mt-1 text-sm">
                          Component-specific styling will be added in future updates. 
                          Use the color and spacing tabs to customize the overall design system.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="vtt-card">
              <div className="vtt-card-header">
                <h3 className="vtt-heading-5">Live Preview</h3>
                <div className="flex gap-2 mt-3">
                  {[
                    { key: 'button', label: 'Buttons' },
                    { key: 'card', label: 'Card' },
                    { key: 'form', label: 'Form' },
                    { key: 'hero', label: 'Hero' }
                  ].map((preview) => (
                    <button
                      key={preview.key}
                      onClick={() => setPreviewComponent(preview.key as any)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        previewComponent === preview.key
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {preview.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="vtt-card-body">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                  {renderPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="vtt-heading-5">Export Custom CSS</h3>
              <button
                onClick={() => setShowExport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-4">
                Copy the CSS below and paste it into your variables.css file to apply your custom styles:
              </p>
              
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{exportedCSS}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(exportedCSS)}
                  className="absolute top-2 right-2 vtt-button vtt-button-outline vtt-button-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowExport(false)}
                className="vtt-button vtt-button-outline"
              >
                Close
              </button>
              <button
                onClick={() => copyToClipboard(exportedCSS)}
                className="vtt-button vtt-button-primary"
              >
                Copy CSS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleEditor;
