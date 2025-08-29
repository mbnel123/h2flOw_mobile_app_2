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
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const colors = {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: isDark ? '#000000' : '#FFFFFF',
    backgroundSecondary: isDark ? '#1F1F1F' : '#F8F9FA',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
    card: isDark ? '#1F1F1F' : '#FFFFFF',
    success: '#34D399',
    danger: '#EF4444',
    warning: '#F59E0B',
  };

  const [templates, setTemplates] = useState<FastTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'beginner' | 'intermediate' | 'advanced' | 'custom'>('beginner');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'flash-outline',
    duration: selectedDuration || 0, // Geen default waarde
    waterGoal: 0, // Wordt automatisch berekend
    tags: '',
  });

  // Bereken watergoal op basis van duration
  useEffect(() => {
    const calculatedWaterGoal = Math.round((formData.duration || 0) * 100); // 100ml per uur
    setFormData(prev => ({ ...prev, waterGoal: calculatedWaterGoal }));
  }, [formData.duration]);

  useEffect(() => {
    const unsubscribe = templateService.subscribe((updatedTemplates) => {
      setTemplates(updatedTemplates);
    });
    return unsubscribe;
  }, []);

  const getCurrentTemplates = () =>
    templates
      .filter((t) => t.category === selectedCategory)
      .sort((a, b) => a.duration - b.duration);

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

    if (!formData.duration || formData.duration <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    if (formData.duration > 72) {
      Alert.alert('Error', 'Maximum duration is 72 hours');
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
      icon: 'flash-outline',
      duration: selectedDuration || 0,
      waterGoal: 0,
      tags: '',
    });
    setShowCreateForm(false);
    setSelectedCategory('custom');
  };

  const getDurationColor = (duration: number) => {
    if (duration <= 16) return { bg: isDark ? '#064E3B' : '#ECFDF5', text: isDark ? '#34D399' : '#059669', border: isDark ? '#065F46' : '#A7F3D0' };
    if (duration <= 24) return { bg: isDark ? '#1E3A8A' : '#EFF6FF', text: isDark ? '#60A5FA' : '#2563EB', border: isDark ? '#1E40AF' : '#BFDBFE' };
    if (duration <= 48) return { bg: isDark ? '#7C2D12' : '#FFF7ED', text: isDark ? '#F97316' : '#EA580C', border: isDark ? '#9A3412' : '#FED7AA' };
    return { bg: isDark ? '#7F1D1D' : '#FEF2F2', text: isDark ? '#F87171' : '#DC2626', border: isDark ? '#991B1B' : '#FECACA' };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner': return 'leaf-outline';
      case 'intermediate': return 'rocket-outline';
      case 'advanced': return 'fitness-outline';
      case 'custom': return 'star-outline';
      default: return 'flash-outline';
    }
  };

  const getCategoryIconName = (category: string) => {
    switch (category) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      case 'custom': return 'Custom';
      default: return 'Custom';
    }
  };

  const renderIcon = (icon: string, size: number = 20, color: string) => {
    try {
      return <Ionicons name={icon as any} size={size} color={color} />;
    } catch (error) {
      return <Ionicons name="flash-outline" size={size} color={color} />;
    }
  };

  const currentTemplates = getCurrentTemplates();
  const iconOptions = [
    'flash-outline', 'flame-outline', 'fitness-outline', 'body-outline',
    'star-outline', 'diamond-outline', 'rocket-outline', 'leaf-outline',
    'shield-outline', 'refresh-outline', 'brain-outline', 'heart-outline',
    'water-outline', 'nutrition-outline', 'time-outline', 'speedometer-outline',
    'barbell-outline', 'walk-outline', 'medal-outline', 'trophy-outline'
  ];

  // Create form modal
  if (showCreateForm) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={() => setShowCreateForm(false)}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.formHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Create Custom Template</Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <AntDesign name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.text }]}>Template Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border, 
                  color: colors.text 
                }]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="My Custom Fast"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Icon selector */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
              <View style={styles.iconGrid}>
                {iconOptions.map(iconName => (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                    style={[
                      styles.iconButton,
                      { 
                        backgroundColor: colors.card, 
                        borderColor: colors.border 
                      },
                      formData.icon === iconName && { 
                        borderColor: colors.primary,
                        backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF'
                      }
                    ]}
                  >
                    <Ionicons name={iconName as any} size={24} color={colors.text} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.text }]}>Duration (hours)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border, 
                  color: colors.text 
                }]}
                value={formData.duration === 0 ? '' : formData.duration.toString()}
                onChangeText={(text) => {
                  const numValue = text === '' ? 0 : parseInt(text) || 0;
                  setFormData(prev => ({ ...prev, duration: numValue }));
                }}
                keyboardType="numeric"
                placeholder="Enter duration in hours (max 72)"
                placeholderTextColor={colors.textSecondary}
                maxLength={2} // Max 72 uur
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Maximum duration: 72 hours
              </Text>
            </View>

            {/* Water Goal (read-only, automatisch berekend) */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.text }]}>Water Goal (ml)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0', 
                  borderColor: colors.border, 
                  color: colors.textSecondary 
                }]}
                value={formData.waterGoal.toString()}
                editable={false}
                placeholder="Calculated automatically"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Calculated based on duration ({formData.duration}h × 100ml/h)
              </Text>
            </View>

            {/* Description */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.text }]}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border, 
                  color: colors.text 
                }]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Brief description of your fast..."
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Tags */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.text }]}>Tags (comma separated)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border, 
                  color: colors.text 
                }]}
                value={formData.tags}
                onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
                placeholder="custom, personal, challenge"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </ScrollView>

          <View style={[styles.formFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity 
              style={[styles.formButton, styles.formCancelButton, { 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }]}
              onPress={() => setShowCreateForm(false)}
            >
              <Text style={[styles.formCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.formButton, styles.formSubmitButton, { backgroundColor: colors.primary }]}
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Fast Template</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
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
                  style={[styles.categoryBtn, { 
                    backgroundColor: active ? colors.primary : colors.backgroundSecondary,
                    borderColor: colors.border
                  }]}
                  onPress={() => setSelectedCategory(category as any)}
                >
                  <Ionicons 
                    name={getCategoryIcon(category) as any} 
                    size={16} 
                    color={active ? '#FFFFFF' : colors.text} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.categoryText, { 
                    color: active ? '#FFFFFF' : colors.text 
                  }]}>
                    {getCategoryIconName(category)} ({count})
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
              <MaterialIcons name="hourglass-empty" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {selectedCategory === 'custom'
                  ? 'No custom templates yet. Create your first one!'
                  : 'No templates in this category yet.'}
              </Text>
              {selectedCategory === 'custom' && (
                <TouchableOpacity
                  style={[styles.createBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Ionicons name="add-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
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
                    { 
                      backgroundColor: isSelected ? colors.backgroundSecondary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => handleSelectTemplate(template)}
                >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardIconContainer, { backgroundColor: colors.backgroundSecondary }]}>
                      {renderIcon(template.icon, 20, colors.text)}
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{template.name}</Text>
                      <View style={styles.cardCategoryRow}>
                        <Text style={[styles.cardCategory, { color: colors.textSecondary }]}>
                          {template.category}
                        </Text>
                        {template.isCustom && (
                          <View style={[styles.customBadge, { backgroundColor: colors.backgroundSecondary }]}>
                            <Text style={[styles.customBadgeText, { color: colors.textSecondary }]}>
                              Custom
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    {/* Action buttons */}
                    <View style={styles.cardActions}>
                      {template.isCustom && (
                        <>
                          <TouchableOpacity
                            onPress={() => handleDuplicateTemplate(template)}
                            style={styles.actionBtn}
                          >
                            <Feather name="copy" size={16} color={colors.success} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteTemplate(template)}
                            style={styles.actionBtn}
                          >
                            <Feather name="trash-2" size={16} color={colors.danger} />
                          </TouchableOpacity>
                        </>
                      )}
                      {!template.isCustom && (
                        <TouchableOpacity
                          onPress={() => handleDuplicateTemplate(template)}
                          style={styles.actionBtn}
                        >
                          <Feather name="copy" size={16} color={colors.success} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Description */}
                  {template.description && (
                    <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
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
                        <Ionicons name="water" size={12} color={colors.primary} />
                        <Text style={[styles.detailText, { color: colors.text }]}>
                          <Text style={{ fontWeight: 'bold' }}>{template.waterGoal}ml</Text> water
                        </Text>
                      </View>
                    )}
                    
                    {template.usageCount > 0 && (
                      <View style={styles.detailRow}>
                        <AntDesign name="star" size={12} color={colors.warning} />
                        <Text style={[styles.detailText, { color: colors.text }]}>
                          Used <Text style={{ fontWeight: 'bold' }}>{template.usageCount}</Text>x
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {template.tags.slice(0, 3).map((tag) => (
                        <View key={tag} style={[styles.tag, { backgroundColor: colors.backgroundSecondary }]}>
                          <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
                        </View>
                      ))}
                      {template.tags.length > 3 && (
                        <Text style={[styles.tagText, { color: colors.textSecondary, paddingHorizontal: 4 }]}>
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
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.footerContent}>
            <TouchableOpacity 
              style={[styles.cancelButton, { 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            {selectedDuration && (
              <TouchableOpacity
                style={[styles.useCurrentButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  const customTemplate: FastTemplate = {
                    id: 'temp_custom',
                    userId,
                    name: `${selectedDuration}h Custom Fast`,
                    icon: 'flash-outline',
                    duration: selectedDuration,
                    category: 'custom',
                    tags: ['custom'],
                    isDefault: false,
                    isCustom: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    usageCount: 0,
                    waterGoal: Math.round(selectedDuration * 100), // Automatisch berekend
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold',
  },
  categoryTabs: { 
    paddingVertical: 16,
  },
  categoryScrollView: {
    paddingHorizontal: 20,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: { 
    fontWeight: '600',
    fontSize: 14,
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
  emptyText: { 
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12 
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: { 
    fontWeight: '600', 
    fontSize: 16,
  },
  cardCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cardCategory: { 
    fontSize: 12,
    textTransform: 'capitalize',
    marginRight: 8,
  },
  customBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '600',
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
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
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
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  useCurrentButton: {
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
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  formFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  formButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  formCancelButton: {
    borderWidth: 1,
  },
  formSubmitButton: {
    backgroundColor: '#7DD3FC',
  },
  formCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TemplateSelectorScreen;
