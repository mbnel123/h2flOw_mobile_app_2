// src/services/templateService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FastTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  duration: number; // hours
  category: 'beginner' | 'intermediate' | 'advanced' | 'custom';
  waterGoal?: number; // ml
  reminderInterval?: number; // minutes
  tags: string[];
  isDefault: boolean;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  lastUsed?: Date;
}

export interface TemplateStats {
  totalTemplates: number;
  mostUsed: FastTemplate | null;
  recentlyUsed: FastTemplate[];
  favoriteCategory: string;
}

class TemplateService {
  private static instance: TemplateService;
  private templates: Map<string, FastTemplate> = new Map();
  private listeners: ((templates: FastTemplate[]) => void)[] = [];
  private isInitialized = false;

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    this.loadDefaultTemplates();
    await this.loadUserTemplates();
    this.isInitialized = true;
  }

  // Subscribe to template changes
  subscribe(listener: (templates: FastTemplate[]) => void): () => void {
    this.listeners.push(listener);
    // Send initial data (async to ensure initialization)
    this.initialize().then(() => {
      listener(this.getAllTemplates());
    });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Load default templates
  private loadDefaultTemplates(): void {
    const defaultTemplates: Omit<FastTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>[] = [
      {
        name: "Beginner Fast",
        description: "Perfect introduction to fasting",
        icon: "🌱",
        duration: 12,
        category: 'beginner',
        waterGoal: 2000,
        reminderInterval: 60,
        tags: ['beginner', 'easy', 'introduction'],
        isDefault: true,
        isCustom: false
      },
      {
        name: "Classic 16:8",
        description: "Most popular intermittent fasting",
        icon: "⚡",
        duration: 16,
        category: 'beginner',
        waterGoal: 2500,
        reminderInterval: 90,
        tags: ['popular', 'intermittent', 'daily'],
        isDefault: true,
        isCustom: false
      },
      {
        name: "Extended Fast",
        description: "Deep ketosis and mental clarity",
        icon: "🧠",
        duration: 18,
        category: 'intermediate',
        waterGoal: 2500,
        reminderInterval: 60,
        tags: ['ketosis', 'clarity', 'intermediate'],
        isDefault: true,
        isCustom: false
      },
      {
        name: "OMAD (One Meal)",
        description: "24-hour fast for autophagy",
        icon: "🔄",
        duration: 24,
        category: 'intermediate',
        waterGoal: 3000,
        reminderInterval: 90,
        tags: ['omad', 'autophagy', 'cellular'],
        isDefault: true,
        isCustom: false
      },
      {
        name: "Warrior Fast",
        description: "36-hour deep cleansing",
        icon: "⚔️",
        duration: 36,
        category: 'advanced',
        waterGoal: 3500,
        reminderInterval: 60,
        tags: ['warrior', 'cleansing', 'advanced'],
        isDefault: true,
        isCustom: false
      },
      {
        name: "Monk Mode",
        description: "48-hour spiritual journey",
        icon: "🧘",
        duration: 48,
        category: 'advanced',
        waterGoal: 4000,
        reminderInterval: 90,
        tags: ['spiritual', 'monk', 'discipline'],
        isDefault: true,
        isCustom: false
      },
      {
        name: "Reset Protocol",
        description: "72-hour immune system reset",
        icon: "🛡️",
        duration: 72,
        category: 'advanced',
        waterGoal: 4500,
        reminderInterval: 120,
        tags: ['reset', 'immune', 'healing'],
        isDefault: true,
        isCustom: false
      }
    ];

    defaultTemplates.forEach(template => {
      const fullTemplate: FastTemplate = {
        ...template,
        id: `default_${template.name.toLowerCase().replace(/\s+/g, '_')}`,
        userId: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      };
      this.templates.set(fullTemplate.id, fullTemplate);
    });

    console.log('✅ Default templates loaded:', defaultTemplates.length);
  }

  // Load user templates from AsyncStorage
  private async loadUserTemplates(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('h2flow_templates');
      if (stored) {
        const userTemplates: FastTemplate[] = JSON.parse(stored);
        userTemplates.forEach(template => {
          // Convert date strings back to Date objects
          template.createdAt = new Date(template.createdAt);
          template.updatedAt = new Date(template.updatedAt);
          if (template.lastUsed) {
            template.lastUsed = new Date(template.lastUsed);
          }
          this.templates.set(template.id, template);
        });
        console.log('✅ User templates loaded:', userTemplates.length);
      }
    } catch (error) {
      console.error('❌ Failed to load user templates:', error);
    }
  }

  // Save user templates to AsyncStorage
  private async saveUserTemplates(): Promise<void> {
    try {
      const userTemplates = this.getUserTemplates();
      await AsyncStorage.setItem('h2flow_templates', JSON.stringify(userTemplates));
      console.log('✅ User templates saved:', userTemplates.length);
    } catch (error) {
      console.error('❌ Failed to save user templates:', error);
    }
  }

  // Create new template
  async createTemplate(
    userId: string,
    templateData: Omit<FastTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'isDefault'>
  ): Promise<FastTemplate> {
    const template: FastTemplate = {
      ...templateData,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      isDefault: false,
      isCustom: true
    };

    this.templates.set(template.id, template);
    await this.saveUserTemplates();
    this.notifyListeners();

    console.log('✅ Template created:', template.name);
    return template;
  }

  // Update template
  async updateTemplate(templateId: string, updates: Partial<FastTemplate>): Promise<FastTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template || template.isDefault) {
      console.warn('❌ Cannot update default template or template not found');
      return null;
    }

    const updatedTemplate: FastTemplate = {
      ...template,
      ...updates,
      id: template.id, // Prevent ID changes
      userId: template.userId, // Prevent user changes
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    await this.saveUserTemplates();
    this.notifyListeners();

    console.log('✅ Template updated:', updatedTemplate.name);
    return updatedTemplate;
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<boolean> {
    const template = this.templates.get(templateId);
    if (!template) {
      console.warn('❌ Template not found');
      return false;
    }

    if (template.isDefault) {
      console.warn('❌ Cannot delete default template');
      return false;
    }

    this.templates.delete(templateId);
    await this.saveUserTemplates();
    this.notifyListeners();

    console.log('✅ Template deleted:', template.name);
    return true;
  }

  // Use template (increment usage count)
  async useTemplate(templateId: string): Promise<FastTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) {
      console.warn('❌ Template not found');
      return null;
    }

    const updatedTemplate: FastTemplate = {
      ...template,
      usageCount: template.usageCount + 1,
      lastUsed: new Date(),
      updatedAt: new Date()
    };

    this.templates.set(templateId, updatedTemplate);
    if (!template.isDefault) {
      await this.saveUserTemplates();
    }
    this.notifyListeners();

    console.log('✅ Template used:', template.name, 'Count:', updatedTemplate.usageCount);
    return updatedTemplate;
  }

  // Get all templates
  getAllTemplates(): FastTemplate[] {
    return Array.from(this.templates.values()).sort((a, b) => {
      // Sort by: custom templates first, then by usage count, then by name
      if (a.isCustom !== b.isCustom) return a.isCustom ? -1 : 1;
      if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
      return a.name.localeCompare(b.name);
    });
  }

  // Get templates by category
  getTemplatesByCategory(category: FastTemplate['category']): FastTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  // Get user templates only
  getUserTemplates(): FastTemplate[] {
    return this.getAllTemplates().filter(template => template.isCustom);
  }

  // Get default templates only
  getDefaultTemplates(): FastTemplate[] {
    return this.getAllTemplates().filter(template => template.isDefault);
  }

  // Get recently used templates
  getRecentlyUsed(limit: number = 5): FastTemplate[] {
    return this.getAllTemplates()
      .filter(template => template.lastUsed)
      .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
      .slice(0, limit);
  }

  // Get most popular templates
  getMostPopular(limit: number = 5): FastTemplate[] {
    return this.getAllTemplates()
      .filter(template => template.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Search templates
  searchTemplates(query: string): FastTemplate[] {
    const searchTerm = query.toLowerCase();
    return this.getAllTemplates().filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description?.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get template by ID
  getTemplate(templateId: string): FastTemplate | null {
    return this.templates.get(templateId) || null;
  }

  // Get templates by duration range
  getTemplatesByDuration(minHours: number, maxHours: number): FastTemplate[] {
    return this.getAllTemplates().filter(template =>
      template.duration >= minHours && template.duration <= maxHours
    );
  }

  // Get template statistics
  getTemplateStats(): TemplateStats {
    const allTemplates = this.getAllTemplates();
    const templatesWithUsage = allTemplates.filter(t => t.usageCount > 0);
    
    const categoryCount = allTemplates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + template.usageCount;
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'beginner';

    return {
      totalTemplates: allTemplates.length,
      mostUsed: templatesWithUsage.sort((a, b) => b.usageCount - a.usageCount)[0] || null,
      recentlyUsed: this.getRecentlyUsed(3),
      favoriteCategory
    };
  }

  // Duplicate template (create copy)
  async duplicateTemplate(templateId: string, userId: string, newName?: string): Promise<FastTemplate | null> {
    const original = this.templates.get(templateId);
    if (!original) {
      console.warn('❌ Template not found for duplication');
      return null;
    }

    const duplicate = await this.createTemplate(userId, {
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      icon: original.icon,
      duration: original.duration,
      category: 'custom',
      waterGoal: original.waterGoal,
      reminderInterval: original.reminderInterval,
      tags: [...original.tags, 'copy'],
      isCustom: true
    });

    console.log('✅ Template duplicated:', duplicate.name);
    return duplicate;
  }

  // Import/Export templates
  exportTemplates(): string {
    const userTemplates = this.getUserTemplates();
    return JSON.stringify(userTemplates, null, 2);
  }

  async importTemplates(userId: string, templatesJson: string): Promise<boolean> {
    try {
      const templates: FastTemplate[] = JSON.parse(templatesJson);
      
      for (const template of templates) {
        await this.createTemplate(userId, {
          name: `${template.name} (Imported)`,
          description: template.description,
          icon: template.icon,
          duration: template.duration,
          category: 'custom',
          waterGoal: template.waterGoal,
          reminderInterval: template.reminderInterval,
          tags: [...(template.tags || []), 'imported'],
          isCustom: true
        });
      }

      console.log('✅ Templates imported:', templates.length);
      return true;
    } catch (error) {
      console.error('❌ Failed to import templates:', error);
      return false;
    }
  }

  // Notify listeners
  private notifyListeners(): void {
    const templates = this.getAllTemplates();
    this.listeners.forEach(listener => {
      try {
        listener(templates);
      } catch (error) {
        console.error('❌ Error in template listener:', error);
      }
    });
  }

  // Clear all user templates (for debugging)
  async clearUserTemplates(): Promise<void> {
    const userTemplates = this.getUserTemplates();
    userTemplates.forEach(template => {
      this.templates.delete(template.id);
    });
    
    await AsyncStorage.removeItem('h2flow_templates');
    this.notifyListeners();
    
    console.log('🗑️ All user templates cleared');
  }
}

export const templateService = TemplateService.getInstance();
