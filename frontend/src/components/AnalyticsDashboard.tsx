import React, { useEffect, useState } from 'react';
import { AnalyticsService } from '../services/AnalyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isVisible, onClose }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'users' | 'performance'>('overview');

  useEffect(() => {
    if (isVisible) {
      const analyticsService = AnalyticsService.getInstance();
      const data = analyticsService.getAnalyticsData();
      setAnalytics(data);
    }
  }, [isVisible]);

  if (!isVisible || !analytics) return null;

  const processEventData = () => {
    const events = analytics.events || [];
    
    // Page views by day
    const pageViews = events
      .filter((e: any) => e.event === 'page_view')
      .reduce((acc: any, event: any) => {
        const date = new Date(event.timestamp).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

    // Story interactions
    const storyEvents = events
      .filter((e: any) => e.category === 'story')
      .reduce((acc: any, event: any) => {
        acc[event.action] = (acc[event.action] || 0) + 1;
        return acc;
      }, {});

    // User interactions
    const interactions = events
      .filter((e: any) => e.category === 'interaction')
      .reduce((acc: any, event: any) => {
        acc[event.action] = (acc[event.action] || 0) + 1;
        return acc;
      }, {});

    return {
      pageViewsData: Object.entries(pageViews).map(([date, count]) => ({
        date: date.slice(0, 10),
        views: count
      })),
      storyData: Object.entries(storyEvents).map(([action, count]) => ({
        action,
        count
      })),
      interactionData: Object.entries(interactions).map(([action, count]) => ({
        action,
        count
      }))
    };
  };

  const { pageViewsData, storyData, interactionData } = processEventData();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 px-6 py-2 border-b">
          <div className="flex space-x-4">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'stories', label: 'Stories' },
              { key: 'users', label: 'Users' },
              { key: 'performance', label: 'Performance' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600">Total Events</h3>
                  <p className="text-2xl font-bold text-blue-900">{analytics.events.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-600">Page Views</h3>
                  <p className="text-2xl font-bold text-green-900">
                    {analytics.events.filter((e: any) => e.event === 'page_view').length}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-amber-600">Story Views</h3>
                  <p className="text-2xl font-bold text-amber-900">
                    {analytics.events.filter((e: any) => e.event === 'story_view').length}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-600">Session ID</h3>
                  <p className="text-xs font-medium text-purple-900 truncate">{analytics.sessionId}</p>
                </div>
              </div>

              {/* Page Views Chart */}
              {pageViewsData.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Page Views Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={pageViewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stories' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Story Analytics</h3>
              
              {storyData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="text-lg font-semibold mb-4">Story Actions</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={storyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="action" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="text-lg font-semibold mb-4">Story Actions Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={storyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="action"
                        >
                          {storyData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Recent Story Events */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-semibold mb-4">Recent Story Events</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.events
                    .filter((e: any) => e.category === 'story')
                    .slice(-10)
                    .reverse()
                    .map((event: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{event.action}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">User Analytics</h3>

              {interactionData.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-lg font-semibold mb-4">User Interactions</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={interactionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="action" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* User Info */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-semibold mb-4">Session Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900">{analytics.userId || 'Anonymous'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Session ID</label>
                    <p className="mt-1 text-xs text-gray-900 font-mono">{analytics.sessionId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Performance Analytics</h3>

              {/* Performance Events */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-semibold mb-4">Performance Events</h4>
                <div className="space-y-2">
                  {analytics.events
                    .filter((e: any) => e.category === 'performance')
                    .map((event: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{event.action}</span>
                        <span className="text-sm text-gray-600">{event.value}ms</span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-semibold mb-4">Engagement Metrics</h4>
                <div className="space-y-2">
                  {analytics.events
                    .filter((e: any) => e.category === 'engagement')
                    .map((event: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{event.action}</span>
                        <span className="text-sm text-gray-600">
                          {event.action.includes('scroll') ? `${event.value}%` : `${event.value}s`}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;