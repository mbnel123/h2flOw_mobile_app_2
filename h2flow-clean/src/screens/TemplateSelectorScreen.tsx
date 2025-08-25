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
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { FastTemplate, templateService } from '../services/templateService';

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
  const [selectedCategory, setSelectedCategory] =
    useState<'beginner' | 'intermediate' | 'advanced' | 'custom'>('beginner');
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Fast Template</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
        <View style={styles.categoryTabs}>
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
        </View>

        {/* Template list */}
        <ScrollView contentContainerStyle={styles.templateGrid}>
          {currentTemplates.length === 0 ? (
            <View style={styles.emptyState}>
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
                  <Text style={styles.createBtnText}>+ Create Custom Template</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            currentTemplates.map((template) => {
              const color = getDurationColor(template.duration);
              return (
                <TouchableOpacity
                  key={template.id}
                  style={styles.card}
                  onPress={() => handleSelectTemplate(template)}
                >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>{template.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{template.name}</Text>
                      <Text style={styles.cardCategory}>{template.category}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      {template.isCustom && (
                        <TouchableOpacity
                          onPress={() => handleDeleteTemplate(template)}
                          style={styles.actionBtn}
                        >
                          <MaterialIcons name="delete" size={16} color="#DC2626" />
                        </TouchableOpacity>
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
                    <Text style={styles.cardDesc}>{template.description}</Text>
                  )}

                  {/* Duration badge */}
                  <View
                    style={[
                      styles.durationBadge,
                      { backgroundColor: color.bg, borderColor: color.border },
                    ]}
                  >
                    <Ionicons name="time-outline" size={14} color={color.text} />
                    <Text style={[styles.durationText, { color: color.text }]}>
                      {template.duration}h
                    </Text>
                  </View>

                  {/* Water goal */}
                  {template.waterGoal && (
                    <View style={styles.detailRow}>
                      <Ionicons name="water-outline" size={14} color="#2563EB" />
                      <Text style={styles.detailText}>
                        {template.waterGoal}ml water
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn} onPress={() => setShowCreateForm(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
            <Text style={styles.footerBtnText}>Create Custom Template</Text>
          </TouchableOpacity>
          {selectedDuration && (
            <TouchableOpacity
              style={[styles.footerBtn, styles.footerBtnPrimary]}
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
              <Text style={styles.footerBtnTextPrimary}>Use Current ({selectedDuration}h)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  categoryTabs: { flexDirection: 'row', padding: 12 },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 8,
  },
  categoryBtnActive: { backgroundColor: '#2563EB' },
  categoryText: { color: '#374151', fontWeight: '500' },
  categoryTextActive: { color: '#fff' },
  templateGrid: { padding: 16 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#6B7280', marginBottom: 12 },
  createBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createBtnText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { fontSize: 22, marginRight: 8 },
  cardTitle: { fontWeight: '600', fontSize: 14, color: '#111827' },
  cardCategory: { fontSize: 12, color: '#6B7280' },
  cardActions: { flexDirection: 'row', marginLeft: 8 },
  actionBtn: { marginLeft: 6 },
  cardDesc: { fontSize: 12, color: '#374151', marginBottom: 8 },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  durationText: { marginLeft: 4, fontWeight: '600', fontSize: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailText: { marginLeft: 6, fontSize: 12, color: '#374151' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  footerBtn: { flexDirection: 'row', alignItems: 'center' },
  footerBtnPrimary: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  footerBtnText: { marginLeft: 6, color: '#2563EB', fontWeight: '600' },
  footerBtnTextPrimary: { color: '#fff', fontWeight: '600' },
});

export default TemplateSelectorScreen;
