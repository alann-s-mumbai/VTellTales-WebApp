import React from 'react';

/**
 * VtellTales: WebApp Design System - Sample Component Usage
 * 
 * This file demonstrates how to properly use the VtellTales: WebApp Design System
 * classes and components in React components.
 */

// Example: Hero Section Component
export const HeroSection: React.FC = () => {
  return (
    <section className="vtt-hero-section vtt-hero-background">
      <div className="vtt-container">
        <div className="vtt-flex-col-center text-center space-y-8">
          <h1 className="vtt-display-1 vtt-gradient-text">
            Create Magical Stories
          </h1>
          <p className="vtt-lead max-w-3xl">
            Empower young minds with interactive storytelling that sparks imagination 
            and builds reading skills for children ages 3-10.
          </p>
          <div className="vtt-flex-center gap-4 flex-wrap">
            <button className="vtt-button vtt-button-primary vtt-button-lg">
              Start Creating
            </button>
            <button className="vtt-button vtt-button-outline vtt-button-lg">
              Explore Stories
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Example: Story Card Component
interface StoryCardProps {
  title: string;
  description: string;
  ageGroup: '3-5' | '5-7' | '7-10';
  imageUrl: string;
  isPublished: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  title,
  description,
  ageGroup,
  imageUrl,
  isPublished
}) => {
  const getAgeBadgeClass = (age: string) => {
    switch (age) {
      case '3-5': return 'vtt-age-badge-3to5';
      case '5-7': return 'vtt-age-badge-5to7';
      case '7-10': return 'vtt-age-badge-7to10';
      default: return 'vtt-badge-gray';
    }
  };

  return (
    <div className="vtt-story-card vtt-story-card-hover">
      <div className="vtt-story-card-image">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="vtt-story-card-content">
        <div className="vtt-flex-between items-start mb-3">
          <h3 className="vtt-heading-5 flex-1">{title}</h3>
          <span className={`${getAgeBadgeClass(ageGroup)} ml-2`}>
            Ages {ageGroup}
          </span>
        </div>
        
        <p className="vtt-text-sm text-gray-600 mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="vtt-flex-between items-center">
          <span className={`vtt-badge ${isPublished ? 'vtt-badge-success' : 'vtt-badge-warning'}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
          
          <button className="vtt-button vtt-button-primary vtt-button-sm">
            {isPublished ? 'Read Story' : 'Continue Editing'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Example: Form Component
interface StoryFormProps {
  onSubmit: (data: StoryFormData) => void;
  initialData?: Partial<StoryFormData>;
  isLoading?: boolean;
}

interface StoryFormData {
  title: string;
  description: string;
  ageGroup: '3-5' | '5-7' | '7-10';
  category: string;
}

export const StoryForm: React.FC<StoryFormProps> = ({ 
  onSubmit, 
  initialData, 
  isLoading = false 
}) => {
  const [formData, setFormData] = React.useState<StoryFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    ageGroup: initialData?.ageGroup || '5-7',
    category: initialData?.category || ''
  });

  const [errors, setErrors] = React.useState<Partial<StoryFormData>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Partial<StoryFormData> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
    <div className="vtt-card">
      <div className="vtt-card-header">
        <h2 className="vtt-heading-4">Create New Story</h2>
        <p className="vtt-text-sm text-gray-600">
          Fill in the details to start creating your magical story
        </p>
      </div>
      
      <div className="vtt-card-body">
        <form className="vtt-form" onSubmit={handleSubmit}>
          <div className="vtt-form-grid">
            <div className="vtt-form-group">
              <label className="vtt-label vtt-label-required">Story Title</label>
              <input
                type="text"
                className={`vtt-input ${errors.title ? 'vtt-input-error' : ''}`}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a magical title..."
                disabled={isLoading}
              />
              {errors.title && (
                <span className="vtt-error-message">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.title}
                </span>
              )}
              <span className="vtt-help-text">
                Choose a title that will capture children&apos;s imagination
              </span>
            </div>

            <div className="vtt-form-group">
              <label className="vtt-label vtt-label-required">Age Group</label>
              <select
                className="vtt-select"
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as '3-5' | '5-7' | '7-10' })}
                disabled={isLoading}
              >
                <option value="3-5">Ages 3-5 (Early Learners)</option>
                <option value="5-7">Ages 5-7 (Beginning Readers)</option>
                <option value="7-10">Ages 7-10 (Independent Readers)</option>
              </select>
            </div>
          </div>

          <div className="vtt-form-group">
            <label className="vtt-label vtt-label-required">Story Description</label>
            <textarea
              className={`vtt-textarea ${errors.description ? 'vtt-input-error' : ''}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what your story is about..."
              rows={4}
              disabled={isLoading}
            />
            {errors.description && (
              <span className="vtt-error-message">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description}
              </span>
            )}
          </div>

          <div className="vtt-form-actions">
            <button 
              type="button" 
              className="vtt-button vtt-button-outline"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="vtt-button vtt-button-primary"
              disabled={isLoading}
            >
              {isLoading && <div className="vtt-spinner mr-2" />}
              {isLoading ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Example: Dashboard Layout Component
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="vtt-layout-with-sidebar">
      {/* Sidebar */}
      <div className="vtt-sidebar">
        <div className="vtt-sidebar-content">
          <div className="px-4 pb-4">
            <h1 className="vtt-brand-logo">VtellTales: WebApp</h1>
          </div>
          
          <nav className="vtt-sidebar-nav">
            <a href="#" className="vtt-sidebar-nav-button active">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z" />
              </svg>
              Dashboard
            </a>
            
            <a href="#" className="vtt-sidebar-nav-button">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              My Stories
            </a>
            
            <a href="#" className="vtt-sidebar-nav-button">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New
            </a>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="vtt-main-with-sidebar">
        <header className="vtt-dashboard-header">
          <div className="vtt-container vtt-flex-between py-4">
            <h1 className="vtt-heading-4">Welcome back, Creator!</h1>
            <div className="vtt-flex-center gap-4">
              <button className="vtt-button vtt-button-ghost vtt-button-icon">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
        </header>
        
        <main className="vtt-dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

// Example: Alert Component
interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const alertClasses = {
    info: 'vtt-alert-info',
    success: 'vtt-alert-success',
    warning: 'vtt-alert-warning',
    error: 'vtt-alert-error'
  };

  const icons = {
    info: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className={`vtt-alert ${alertClasses[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        <p className="mt-1 text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 text-sm hover:opacity-75"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Example Usage in a Page Component
export const SamplePage: React.FC = () => {
  const [showAlert, setShowAlert] = React.useState(true);

  const sampleStories = [
    {
      title: "The Magical Forest Adventure",
      description: "Join Luna the rabbit on an enchanting journey through a forest filled with talking animals and magical surprises.",
      ageGroup: "5-7" as const,
      imageUrl: "/images/forest-adventure.jpg",
      isPublished: true
    },
    {
      title: "Counting with the Friendly Dragons",
      description: "Learn numbers 1-10 with colorful dragons who love to play and count their treasure.",
      ageGroup: "3-5" as const,
      imageUrl: "/images/counting-dragons.jpg",
      isPublished: false
    }
  ];

  const handleFormSubmit = (data: StoryFormData) => {
    console.log('Form submitted:', data);
    setShowAlert(true);
  };

  return (
    <DashboardLayout>
      <div className="vtt-space-y-section">
        {/* Alert Example */}
        {showAlert && (
          <Alert
            type="success"
            title="Story Created Successfully!"
            message="Your new story has been saved as a draft. You can continue editing or publish it when ready."
            onClose={() => setShowAlert(false)}
          />
        )}

        {/* Hero Section Example */}
        <HeroSection />

        {/* Form Example */}
        <section className="vtt-section">
          <div className="vtt-container-sm">
            <StoryForm onSubmit={handleFormSubmit} />
          </div>
        </section>

        {/* Story Cards Grid Example */}
        <section className="vtt-section">
          <div className="vtt-container">
            <h2 className="vtt-heading-2 text-center mb-12">Featured Stories</h2>
            <div className="vtt-card-grid">
              {sampleStories.map((story, index) => (
                <StoryCard
                  key={index}
                  title={story.title}
                  description={story.description}
                  ageGroup={story.ageGroup}
                  imageUrl={story.imageUrl}
                  isPublished={story.isPublished}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default SamplePage;
