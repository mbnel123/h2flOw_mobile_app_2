// src/components/TemplateSelector.tsx
import React, { useState, useEffect } from 'react';
// Gebruik @expo/vector-icons in plaats van lucide
import { Ionicons, MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import { FastTemplate, templateService, TemplateStats } from '../services/templateService';

interface TemplateSelectorProps {
  userId: string;
  onSelectTemplate: (template: FastTemplate) => void;
  onClose: () => void;
  selectedDuration?: number;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  userId,
  onSelectTemplate,
  onClose,
  selectedDuration
}) => {
  const [templates, setTemplates] = useState<FastTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'beginner' | 'intermediate' | 'advanced' | 'custom'>('beginner');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '⚡',
    duration: selectedDuration || 24,
    waterGoal: 2500,
    tags: ''
  });

  // Load templates
  useEffect(() => {
    const unsubscribe = templateService.subscribe((updatedTemplates) => {
      setTemplates(updatedTemplates);
    });
    return unsubscribe;
  }, []);

  // Get filtered templates for current category
  const getCurrentTemplates = () => {
    return templates.filter(template => template.category === selectedCategory);
  };

  const handleSelectTemplate = (template: FastTemplate) => {
    templateService.useTemplate(template.id);
    onSelectTemplate(template);
    onClose();
  };

  const handleDuplicateTemplate = (template: FastTemplate) => {
    templateService.duplicateTemplate(template.id, userId);
  };

  const handleDeleteTemplate = (template: FastTemplate) => {
    if (confirm(`Delete "${template.name}"?`)) {
      templateService.deleteTemplate(template.id);
    }
  };

  const handleCreateTemplate = () => {
    if (!formData.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const newTemplate = templateService.createTemplate(userId, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      duration: formData.duration,
      category: 'custom',
      waterGoal: formData.waterGoal,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      isCustom: true
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      icon: '⚡',
      duration: selectedDuration || 24,
      waterGoal: 2500,
      tags: ''
    });

    setShowCreateForm(false);
    setSelectedCategory('custom');
  };

  const getDurationColor = (duration: number) => {
    if (duration <= 16) return 'text-green-600 bg-green-50 border-green-200';
    if (duration <= 24) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (duration <= 48) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const currentTemplates = getCurrentTemplates();
  const emojiOptions = ['⚡', '🔥', '💪', '🧘', '🌟', '💎', '🚀', '⭐', '🌱', '🛡️', '🔄', '🧠'];

  if (showCreateForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create Custom Template</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <AntDesign name="close" size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="My Custom Fast"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {emojiOptions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                    className={`p-3 text-2xl rounded-lg border-2 transition-colors ${
                      formData.icon === emoji
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 24 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="168"
              />
            </div>

            {/* Water Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Water Goal (ml)</label>
              <input
                type="number"
                value={formData.waterGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, waterGoal: parseInt(e.target.value) || 2500 }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="250"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Brief description of your fast..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="custom, personal, challenge"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex space-x-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTemplate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Template
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Choose Fast Template</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Compact Category Navigation */}
          <div className="flex space-x-2">
            {['beginner', 'intermediate', 'advanced', 'custom'].map((category) => {
              const count = templates.filter(t => t.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as any)}
                  className={`
                    px-4 py-2 rounded-lg border transition-all text-sm font-medium
                    ${selectedCategory === category
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid - Fixed Height */}
        <div className="flex-1 p-6 min-h-0">
          {currentTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-600 mb-4">
                  {selectedCategory === 'custom' 
                    ? 'No custom templates yet. Create your first one!'
                    : 'No templates in this category yet.'
                  }
                </p>
                {selectedCategory === 'custom' && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Custom Template
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
              {currentTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`
                    border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 h-fit
                    ${selectedDuration === template.duration 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center min-w-0 flex-1">
                      <span className="text-2xl mr-2 flex-shrink-0">{template.icon}</span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{template.name}</h3>
                        <span className="text-xs text-gray-500 capitalize">{template.category}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {(template.isCustom || selectedCategory !== 'custom') && (
                      <div className="flex space-x-1 flex-shrink-0 ml-2">
                        {template.isCustom && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCreateForm(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
                            >
                              <Feather name="edit-3" size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
                            >
                              <Feather name="trash-2" size={12} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTemplate(template);
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors rounded"
                        >
                          <Feather name="copy" size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {template.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                  )}

                  {/* Duration */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold mb-3 border ${getDurationColor(template.duration)}`}>
                    <Feather name="clock" size={12} style={{ marginRight: 4 }} />
                    {template.duration}h
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    {template.waterGoal && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Ionicons name="water" size={12} color="#3B82F6" style={{ marginRight: 8 }} />
                        <span><strong>{template.waterGoal}ml</strong> water</span>
                      </div>
                    )}
                    
                    {template.usageCount > 0 && (
                      <div className="flex items-center text-xs text-gray-600">
                        <AntDesign name="star" size={12} color="#EAB308" style={{ marginRight: 8 }} />
                        <span>Used <strong>{template.usageCount}</strong>x</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {template.tags.length > 2 && (
                        <span className="text-xs text-gray-500 px-1">
                          +{template.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              <AntDesign name="plus" size={20} style={{ marginRight: 8 }} />
              Create Custom Template
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedDuration) {
                    const customTemplate: FastTemplate = {
                      id: 'temp_custom',
                      userId: userId,
                      name: `${selectedDuration}h Custom Fast`,
                      icon: '⚡',
                      duration: selectedDuration,
                      category: 'custom',
                      tags: ['custom'],
                      isDefault: false,
                      isCustom: true,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      usageCount: 0
                    };
                    onSelectTemplate(customTemplate);
                    onClose();
                  }
                }}
                disabled={!selectedDuration}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                Use Current ({selectedDuration}h)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
