import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Settings, Crown, Shield, Eye, Edit3, MessageCircle, Clock, Share2, X } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canManageCollaborators: boolean;
  };
}

interface CollaborationManagerProps {
  storyId: string;
  currentUserId: string;
  isVisible: boolean;
  onClose: () => void;
  onCollaboratorUpdate?: (collaborators: Collaborator[]) => void;
}

const CollaborationManager: React.FC<CollaborationManagerProps> = ({
  storyId,
  currentUserId,
  isVisible,
  onClose,
  onCollaboratorUpdate
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'commenter' | 'viewer'>('editor');
  const [shareLink, setShareLink] = useState('');
  const [linkAccess, setLinkAccess] = useState<'restricted' | 'anyone-with-link' | 'public'>('restricted');
  const [isInviting, setIsInviting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadCollaborators = useCallback(async () => {
    try {
      setLoadError(null);
      const response = await fetch(`${API_BASE_URL}/storyapi/StoryBook/GetCollaborators/${storyId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as Collaborator[];
      setCollaborators(data);
      onCollaboratorUpdate?.(data);
      setActionMessage(null);
      setActionError(null);
    } catch (error) {
      console.error('Failed to load collaborators:', error);
      setLoadError('Unable to load collaborators for this story.');
      setCollaborators([]);
      onCollaboratorUpdate?.([]);
    }
  }, [onCollaboratorUpdate, storyId]);

  const generateShareLink = useCallback(() => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/story/${storyId}?share=true`;
    setShareLink(link);
  }, [storyId]);

  useEffect(() => {
    if (isVisible) {
      loadCollaborators();
      generateShareLink();
    }
  }, [isVisible, loadCollaborators, generateShareLink]);

  const inviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteError(null);
    setActionMessage(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/storyapi/StoryBook/InviteCollaborator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          email: inviteEmail,
          role: inviteRole,
          requestedBy: currentUserId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setInviteEmail('');
      await loadCollaborators();
      setActionMessage('Invitation sent successfully.');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      setInviteError('We could not send this invitation. Please try again later.');
    } finally {
      setIsInviting(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      setActionError(null);
      const response = await fetch(`${API_BASE_URL}/storyapi/StoryBook/Collaborators/${storyId}/${collaboratorId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await loadCollaborators();
      setActionMessage('Collaborator removed.');
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      setActionError('Unable to remove collaborator. Please try again later.');
    }
  };

  const updateCollaboratorRole = async (collaboratorId: string, newRole: Collaborator['role']) => {
    try {
      setActionError(null);
      const response = await fetch(`${API_BASE_URL}/storyapi/StoryBook/Collaborators/${storyId}/${collaboratorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const permissions = getPermissionsByRole(newRole);
      setCollaborators(prev =>
        prev.map(c =>
          c.id === collaboratorId
            ? { ...c, role: newRole, permissions }
            : c
        )
      );
      setActionMessage('Collaborator role updated.');
    } catch (error) {
      console.error('Failed to update collaborator role:', error);
      setActionError('Unable to update collaborator role. Please try again later.');
    }
  };

  const getPermissionsByRole = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner':
        return {
          canEdit: true,
          canComment: true,
          canShare: true,
          canManageCollaborators: true
        };
      case 'editor':
        return {
          canEdit: true,
          canComment: true,
          canShare: false,
          canManageCollaborators: false
        };
      case 'commenter':
        return {
          canEdit: false,
          canComment: true,
          canShare: false,
          canManageCollaborators: false
        };
      case 'viewer':
        return {
          canEdit: false,
          canComment: false,
          canShare: false,
          canManageCollaborators: false
        };
      default:
        return {
          canEdit: false,
          canComment: false,
          canShare: false,
          canManageCollaborators: false
        };
    }
  };

  const getRoleIcon = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'editor':
        return <Edit3 className="h-4 w-4 text-blue-500" />;
      case 'commenter':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    // Show success message
    console.log('Link copied to clipboard');
  };

  const currentUserIsOwner = collaborators.find(c => c.id === currentUserId)?.role === 'owner';

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-4/5 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Manage Collaboration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-96">
          {/* Invite Section */}
          {currentUserIsOwner && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Invite People</h3>
              
              <div className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      inviteCollaborator();
                    }
                  }}
                />
                
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="editor">Editor</option>
                  <option value="commenter">Commenter</option>
                  <option value="viewer">Viewer</option>
                </select>
                
                <button
                  onClick={inviteCollaborator}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isInviting ? 'Inviting...' : 'Invite'}</span>
                </button>
              </div>
              {inviteError && (
                <p className="text-sm text-red-600">{inviteError}</p>
              )}
            </div>
          )}

          {/* Current Collaborators */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">People with access</h3>
            {loadError && (
              <p className="text-sm text-red-600">{loadError}</p>
            )}
            {!loadError && collaborators.length === 0 && (
              <p className="text-sm text-gray-500">
                No collaborators found for this story yet.
              </p>
            )}
            {actionMessage && (
              <p className="text-sm text-green-600">{actionMessage}</p>
            )}
            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}
            
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {collaborator.avatar ? (
                        <img
                          src={collaborator.avatar}
                          alt={collaborator.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{collaborator.name}</span>
                        {getRoleIcon(collaborator.role)}
                        {collaborator.isOnline && (
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{collaborator.email}</span>
                        {!collaborator.isOnline && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{collaborator.lastSeen}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Role and Actions */}
                  <div className="flex items-center space-x-2">
                    {currentUserIsOwner && collaborator.id !== currentUserId ? (
                      <>
                        <select
                          value={collaborator.role}
                          onChange={(e) => updateCollaboratorRole(collaborator.id, e.target.value as any)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="editor">Editor</option>
                          <option value="commenter">Commenter</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        
                        <button
                          onClick={() => removeCollaborator(collaborator.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          title="Remove collaborator"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded capitalize">
                        {collaborator.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Settings */}
          {currentUserIsOwner && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Share Settings</h3>
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>

              {showShareOptions && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Access Level
                    </label>
                    <select
                      value={linkAccess}
                      onChange={(e) => setLinkAccess(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="restricted">Restricted - Only invited people</option>
                      <option value="anyone-with-link">Anyone with the link</option>
                      <option value="public">Public - Anyone can find and view</option>
                    </select>
                    <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="h-3.5 w-3.5 text-gray-400" />
                      {linkAccess === 'restricted'
                        ? 'A secure link that keeps collaboration limited to invited members.'
                        : linkAccess === 'anyone-with-link'
                          ? 'Anyone holding the link can access this story.'
                          : 'The story is discoverable by anyone on the platform.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationManager;
