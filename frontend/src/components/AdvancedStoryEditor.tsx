import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Image, Save, Eye, Users, Share2, MessageSquare, Undo, Redo } from 'lucide-react';

interface StoryEditorProps {
  storyId?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
  collaborationEnabled?: boolean;
  readOnly?: boolean;
}

interface EditorState {
  content: string;
  selection: { start: number; end: number };
  history: string[];
  historyIndex: number;
  isModified: boolean;
}

interface CollaboratorCursor {
  id: string;
  name: string;
  position: number;
  color: string;
}

const AdvancedStoryEditor: React.FC<StoryEditorProps> = ({ 
  storyId, 
  initialContent = '', 
  onSave, 
  collaborationEnabled = false,
  readOnly = false 
}) => {
  const [editorState, setEditorState] = useState<EditorState>({
    content: initialContent,
    selection: { start: 0, end: 0 },
    history: [initialContent],
    historyIndex: 0,
    isModified: false
  });

  const [activeFormat, setActiveFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignment: 'left'
  });

  const [showPreview, setShowPreview] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorCursor[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const initializeCollaboration = useCallback(() => {
    // WebSocket connection for real-time collaboration
    // This would connect to your backend collaboration service
    console.log('Initializing collaboration for story:', storyId);
    
    setCollaborators(prev =>
      prev.length > 0
        ? prev
        : [{
            id: storyId || 'local',
            name: 'You',
            position: 0,
            color: '#3b82f6'
          }]
    );
  }, [storyId]);

  useEffect(() => {
    if (collaborationEnabled && storyId) {
      // Initialize collaboration service
      initializeCollaboration();
    }
  }, [collaborationEnabled, storyId, initializeCollaboration]);

  const updateContent = (newContent: string) => {
    setEditorState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newContent);
      
      return {
        ...prev,
        content: newContent,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isModified: true
      };
    });
  };

  const applyFormat = (format: string) => {
    if (readOnly) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    switch (format) {
      case 'bold':
        document.execCommand('bold');
        setActiveFormat(prev => ({ ...prev, bold: !prev.bold }));
        break;
      case 'italic':
        document.execCommand('italic');
        setActiveFormat(prev => ({ ...prev, italic: !prev.italic }));
        break;
      case 'underline':
        document.execCommand('underline');
        setActiveFormat(prev => ({ ...prev, underline: !prev.underline }));
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft');
        setActiveFormat(prev => ({ ...prev, alignment: 'left' }));
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter');
        setActiveFormat(prev => ({ ...prev, alignment: 'center' }));
        break;
      case 'alignRight':
        document.execCommand('justifyRight');
        setActiveFormat(prev => ({ ...prev, alignment: 'right' }));
        break;
      case 'unorderedList':
        document.execCommand('insertUnorderedList');
        break;
      case 'orderedList':
        document.execCommand('insertOrderedList');
        break;
    }

    // Update content after formatting
    if (editorRef.current) {
      updateContent(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    if (readOnly) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          document.execCommand('insertImage', false, imageUrl);
          
          if (editorRef.current) {
            updateContent(editorRef.current.innerHTML);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleUndo = () => {
    if (editorState.historyIndex > 0) {
      const newIndex = editorState.historyIndex - 1;
      const content = editorState.history[newIndex];
      
      setEditorState(prev => ({
        ...prev,
        content,
        historyIndex: newIndex,
        isModified: true
      }));
      
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    }
  };

  const handleRedo = () => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      const newIndex = editorState.historyIndex + 1;
      const content = editorState.history[newIndex];
      
      setEditorState(prev => ({
        ...prev,
        content,
        historyIndex: newIndex,
        isModified: true
      }));
      
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    }
  };

  const handleSave = useCallback(() => {
    if (onSave && editorState.isModified) {
      onSave(editorState.content);
      setEditorState(prev => ({ ...prev, isModified: false }));
    }
  }, [editorState, onSave]);

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Auto-save functionality
  useEffect(() => {
    if (editorState.isModified) {
      const autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 30000); // Auto-save every 30 seconds
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [editorState.isModified, handleSave]);

  const toolbarButtons = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: 'Bold',
      action: () => applyFormat('bold'),
      active: activeFormat.bold
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: 'Italic',
      action: () => applyFormat('italic'),
      active: activeFormat.italic
    },
    {
      icon: <Underline className="h-4 w-4" />,
      label: 'Underline',
      action: () => applyFormat('underline'),
      active: activeFormat.underline
    },
    { divider: true },
    {
      icon: <AlignLeft className="h-4 w-4" />,
      label: 'Align Left',
      action: () => applyFormat('alignLeft'),
      active: activeFormat.alignment === 'left'
    },
    {
      icon: <AlignCenter className="h-4 w-4" />,
      label: 'Align Center',
      action: () => applyFormat('alignCenter'),
      active: activeFormat.alignment === 'center'
    },
    {
      icon: <AlignRight className="h-4 w-4" />,
      label: 'Align Right',
      action: () => applyFormat('alignRight'),
      active: activeFormat.alignment === 'right'
    },
    { divider: true },
    {
      icon: <List className="h-4 w-4" />,
      label: 'Bullet List',
      action: () => applyFormat('unorderedList')
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: 'Numbered List',
      action: () => applyFormat('orderedList')
    },
    {
      icon: <Image className="h-4 w-4" />,
      label: 'Insert Image',
      action: insertImage
    },
    { divider: true },
    {
      icon: <Undo className="h-4 w-4" />,
      label: 'Undo',
      action: handleUndo,
      disabled: editorState.historyIndex <= 0
    },
    {
      icon: <Redo className="h-4 w-4" />,
      label: 'Redo',
      action: handleRedo,
      disabled: editorState.historyIndex >= editorState.history.length - 1
    }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white border border-gray-300 rounded-lg shadow-lg">
      {/* Toolbar */}
      <div ref={toolbarRef} className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button, index) => {
            if (button.divider) {
              return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
            }
            
            return (
              <button
                key={index}
                onClick={button.action}
                disabled={button.disabled || readOnly}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  button.active ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                } ${(button.disabled || readOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={button.label}
              >
                {button.icon}
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          {/* Word count */}
          <span className="text-sm text-gray-500">
            {editorState.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words
          </span>

          {/* Collaboration indicators */}
          {collaborationEnabled && (
            <>
              <button
                onClick={() => setShowComments(!showComments)}
                className="p-2 rounded hover:bg-gray-200 text-gray-600 relative"
                title="Comments"
              >
                <MessageSquare className="h-4 w-4" />
                {comments.filter(c => !c.resolved).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {comments.filter(c => !c.resolved).length}
                  </span>
                )}
              </button>

              <button className="p-2 rounded hover:bg-gray-200 text-gray-600" title="Share">
                <Share2 className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">{collaborators.length + 1}</span>
              </div>
            </>
          )}

          {/* Action buttons */}
          <button
            onClick={togglePreview}
            className="p-2 rounded hover:bg-gray-200 text-gray-600"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={!editorState.isModified || readOnly}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editorState.isModified && !readOnly
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            title="Save"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Editor Content */}
        <div className={`flex-1 relative ${showComments ? 'mr-80' : ''}`}>
          {showPreview ? (
            <div 
              className="p-6 h-full overflow-y-auto prose max-w-none"
              dangerouslySetInnerHTML={{ __html: editorState.content }}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable={!readOnly}
              suppressContentEditableWarning={true}
              className={`p-6 h-full overflow-y-auto outline-none prose max-w-none ${
                readOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:ring-inset'
              }`}
              onInput={(e) => {
                if (!readOnly) {
                  updateContent(e.currentTarget.innerHTML);
                }
              }}
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  if (e.key === 's') {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    handleUndo();
                  } else if (e.key === 'z' && e.shiftKey) {
                    e.preventDefault();
                    handleRedo();
                  }
                }
              }}
              dangerouslySetInnerHTML={{ __html: editorState.content }}
            />
          )}

          {/* Collaboration cursors */}
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="absolute"
              style={{
                borderLeft: `2px solid ${collaborator.color}`,
                height: '20px',
                // Position would be calculated based on collaborator.position
              }}
            >
              <div
                className="absolute -top-6 left-0 px-1 py-0.5 text-xs text-white rounded"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name}
              </div>
            </div>
          ))}
        </div>

        {/* Comments Sidebar */}
        {showComments && collaborationEnabled && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 rounded border ${
                    comment.resolved ? 'bg-gray-100 border-gray-200' : 'bg-white border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                  {!comment.resolved && (
                    <button
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setComments(prev => 
                          prev.map(c => 
                            c.id === comment.id ? { ...c, resolved: true } : c
                          )
                        );
                      }}
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-gray-500 text-sm">No comments yet. Select text to add a comment.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span>Characters: {editorState.content.replace(/<[^>]*>/g, '').length}</span>
          <span>Paragraphs: {editorState.content.split('</p>').length - 1}</span>
          {collaborationEnabled && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {editorState.isModified && (
            <span className="text-amber-600">• Unsaved changes</span>
          )}
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStoryEditor;
