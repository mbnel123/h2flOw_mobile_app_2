// src/screens/TemplateSelectorScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { FastTemplate, templateService } from '../services/templateService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TemplateSelectorScreenProps {
  userId: string;
  visible: boolean;
  selectedDuration?: number;
  onClose: () => void;
  onSelectTemplate: (template: FastTemplate) => void;
}

const TemplateSelectorScreen: React.FC<TemplateSelectorScreenProps> = ({
  userId,
  visible,
  selectedDuration,
  onClose,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<FastTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'beginner' | 'intermediate' | 'advanced' | 'custom'>('beginner');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '⚡',
    duration: selectedDuration || 24,
    waterGoal: 2500,
    tags: '',
  });

  useEffect(() => {
    const unsubscribe = templateService.subscribe((updatedTemplates) => {
      setTemplates(updatedTemplates);
    });
    return unsubscribe;
  }, []);

  const getCurrentTemplates = () =>
    templates.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (template: FastTemplate) => {
    templateService.useTemplate(template.id);
    onSelectTemplate(template);
    onClose();
  };

  const handleDuplicateTemplate = (template: FastTemplate) => {
    templateService.duplicateTemplate(template.id, userId);
  };

  const handleDeleteTemplate = (template: FastTemplate) => {
    Alert.alert('Delete Template', `Delete "${template.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => templateService.deleteTemplate(template.id),
      },
    ]);
  };

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    await templateService.createTemplate(userId, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      duration: formData.duration,
      category: 'custom',
      waterGoal: formData.waterGoal,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      isCustom: true,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      icon: '⚡',
      duration: selectedDuration || 24,
      waterGoal: 2500,
      tags: '',
    });
    setShowCreateForm(false);
    setSelectedCategory('custom');
  };

  const getDurationColor = (duration: number) => {
    if (duration <= 16) return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    if (duration <= 24) return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    if (duration <= 48) return { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' };
    return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
  };

  const currentTemplates = getCurrentTemplates();
  const emojiOptions = ['⚡', '🔥', '💪', '🧘', '🌟', '💎', '🚀', '⭐', '🌱', '🛡️', '🔄', '🧠'];

  // Create form modal
  if (showCreateForm) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={() => setShowCreateForm(false)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Create Custom Template</Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <AntDesign name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.formField}>
              <Text style={styles.label}>Template Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="My Custom Fast"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Icon selector */}
            <View style={styles.formField}>
              <Text style={styles.label}>Icon</Text>
              <View style={styles.iconGrid}>
                {emojiOptions.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                    style={[
                      styles.iconButton,
                      formData.icon === emoji && styles.iconButtonSelected
                    ]}
                  >
                    <Text style={styles.iconEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.formField}>
              <Text style={styles.label}>Duration (hours)</Text>
              <TextInput
                style={styles.input}
                value={formData.duration.toString()}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  duration: parseInt(text) || 24 
                }))}
                keyboardType="numeric"
                placeholder="24"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Water Goal */}
            <View style={styles.formField}>
              <Text style={styles.label}>Water Goal (ml)</Text>
              <TextInput
                style={styles.input}
                value={formData.waterGoal.toString()}
                onChangeText={(text) => setFormData(prev => ({ 
                  ...prev, 
                  waterGoal: parseInt(text) || 2500 
                }))}
                keyboardType="numeric"
                placeholder="2500"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description */}
            <View style={styles.formField}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Brief description of your fast..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Tags */}
            <View style={styles.formField}>
              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
                placeholder="custom, personal, challenge"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>

          <View style={styles.formFooter}>
            <TouchableOpacity 
              style={[styles.formButton, styles.formCancelButton]}
              onPress={() => setShowCreateForm(false)}
            >
              <Text style={styles.formCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.formButton, styles.formSubmitButton]}
              onPress={handleCreateTemplate}
            >
              <Text style={styles.formSubmitText}>Create Template</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Fast Template</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Category tabs - ZONDER Create tab */}
        <View style={styles.categoryTabs}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollView}
          >
            {['beginner', 'intermediate', 'advanced', 'custom'].map((category) => {
              const count = templates.filter((t) => t.category === category).length;
              const active = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryBtn, active && styles.categoryBtnActive]}
                  onPress={() => setSelectedCategory(category as any)}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Template list */}
        <ScrollView 
          style={styles.templatesContainer}
          contentContainerStyle={styles.templateGrid}
          showsVerticalScrollIndicator={false}
        >
          {currentTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>
                {selectedCategory === 'custom'
                  ? 'No custom templates yet. Create your first one!'
                  : 'No templates in this category yet.'}
              </Text>
              {selectedCategory === 'custom' && (
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Text style={styles.createBtnText}>Create Custom Template</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            currentTemplates.map((template) => {
              const color = getDurationColor(template.duration);
              const isSelected = selectedDuration === template.duration;
              
              return (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected
                  ]}
                  onPress={() => handleSelectTemplate(template)}
                >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>{template.icon}</Text>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{template.name}</Text>
                      <Text style={styles.cardCategory}>{template.category}</Text>
                    </View>
                    
                    {/* Action buttons */}
                    <View style={styles.cardActions}>
                      {template.isCustom && (
                        <>
                          <TouchableOpacity
                            onPress={() => setShowCreateForm(true)}
                            style={styles.actionBtn}
                          >
                            <Feather name="edit-3" size={16} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteTemplate(template)}
                            style={styles.actionBtn}
                          >
                            <Feather name="trash-2" size={16} color="#DC2626" />
                          </TouchableOpacity>
                        </>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDuplicateTemplate(template)}
                        style={styles.actionBtn}
                      >
                        <Feather name="copy" size={16} color="#059669" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Description */}
                  {template.description && (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {template.description}
                    </Text>
                  )}

                  {/* Duration badge */}
                  <View
                    style={[
                      styles.durationBadge,
                      { backgroundColor: color.bg, borderColor: color.border },
                    ]}
                  >
                    <Feather name="clock" size={12} color={color.text} />
                    <Text style={[styles.durationText, { color: color.text }]}>
                      {template.duration}h
                    </Text>
                  </View>

                  {/* Details */}
                  <View style={styles.detailsContainer}>
                    {template.waterGoal && (
                      <View style={styles.detailRow}>
                        <Ionicons name="water" size={12} color="#2563EB" />
                        <Text style={styles.detailText}>
                          <Text style={{ fontWeight: 'bold' }}>{template.waterGoal}ml</Text> water
                        </Text>
                      </View>
                    )}
                    
                    {template.usageCount > 0 && (
                      <View style={styles.detailRow}>
                        <AntDesign name="star" size={12} color="#EAB308" />
                        <Text style={styles.detailText}>
                          Used <Text style={{ fontWeight: 'bold' }}>{template.usageCount}</Text>x
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {template.tags.slice(0, 3).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                      {template.tags.length > 3 && (
                        <Text style={[styles.tagText, { paddingHorizontal: 4 }]}>
                          +{template.tags.length - 3}
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            {selectedDuration && (
              <TouchableOpacity
                style={styles.useCurrentButton}
                onPress={() => {
                  const customTemplate: FastTemplate = {
                    id: 'temp_custom',
                    userId,
                    name: `${selectedDuration}h Custom Fast`,
                    icon: '⚡',
                    duration: selectedDuration,
                    category: 'custom',
                    tags: ['custom'],
                    isDefault: false,
                    isCustom: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    usageCount: 0,
                  };
                  onSelectTemplate(customTemplate);
                  onClose();
                }}
              >
                <Text style={styles.useCurrentButtonText}>Use Current ({selectedDuration}h)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    padding: 5,
  },
  categoryTabs: { 
    paddingVertical: 16,
  },
  categoryScrollView: {
    paddingHorizontal: 20,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  categoryBtnActive: { 
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: { 
    color: '#374151', 
    fontWeight: '600',
    fontSize: 14,
  },
  categoryTextActive: { 
    color: '#fff' 
  },
  templatesContainer: {
    flex: 1,
  },
  templateGrid: { 
    padding: 20 
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: { 
    color: '#6B7280', 
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  createBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12 
  },
  cardIcon: { 
    fontSize: 24, 
    marginRight: 12 
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: { 
    fontWeight: '600', 
    fontSize: 16, 
    color: '#111827' 
  },
  cardCategory: { 
    fontSize: 12, 
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  cardActions: { 
    flexDirection: 'row', 
    gap: 8,
  },
  actionBtn: { 
    padding: 4,
    borderRadius: 6,
  },
  cardDesc: { 
    fontSize: 12, 
    color: '#374151', 
    marginBottom: 12,
    lineHeight: 16,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  durationText: { 
    marginLeft: 4, 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  detailsContainer: {
    gap: 6,
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  detailText: { 
    marginLeft: 8, 
    fontSize: 12, 
    color: '#374151' 
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  useCurrentButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  useCurrentButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
  },

  // Form styles
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  formContent: {
    flex: 1,
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  iconEmoji: {
    fontSize: 24,
  },
  formFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  formButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  formCancelButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  formSubmitButton: {
    backgroundColor: '#2563EB',
  },
  formCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  formSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
