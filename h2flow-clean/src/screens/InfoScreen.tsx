// src/screens/InfoScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

// Define colors for light and dark mode - aangepast voor consistentie met de rest van de app
const colors = {
  light: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    text: '#000000',
    textSecondary: '#6B7280',
    card: '#F8F9FA',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#7DD3FC',
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#7DD3FC',
      600: '#38BDF8',
    },
    green: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      500: '#10B981',
      600: '#059669',
    },
    orange: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      500: '#F59E0B',
      600: '#D97706',
    },
    red: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
    },
    purple: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      500: '#8B5CF6',
      600: '#7C3AED',
    },
    gradient: ['#F9FAFB', '#F3F4F6', '#F9FAFB']
  },
  dark: {
    primary: '#7DD3FC',
    secondary: '#38BDF8',
    background: '#000000',
    backgroundSecondary: '#1F1F1F',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    card: '#1F1F1F',
    border: '#374151',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#7DD3FC',
    blue: {
      50: '#1E3A8A',
      100: '#1E40AF',
      500: '#7DD3FC',
      600: '#38BDF8',
    },
    green: {
      50: '#064E3B',
      100: '#065F46',
      500: '#10B981',
      600: '#059669',
    },
    orange: {
      50: '#7C2D12',
      100: '#9A3412',
      500: '#F59E0B',
      600: '#D97706',
    },
    red: {
      50: '#7F1D1D',
      100: '#991B1B',
      500: '#EF4444',
      600: '#DC2626',
    },
    purple: {
      50: '#4C1D95',
      100: '#5B21B6',
      500: '#8B5CF6',
      600: '#7C3AED',
    },
    gradient: ['#111827', '#1F2937', '#111827']
  }
};

// Card component
const Card = ({ children, style, colors }: { children: React.ReactNode; style?: any; colors: any }) => (
  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
    {children}
  </View>
);

// Expandable section component
const ExpandableSection = ({ 
  title, 
  iconName, 
  children, 
  colors,
  isExpanded,
  onToggle 
}: { 
  title: string; 
  iconName: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode; 
  colors: any;
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <Card colors={colors} style={styles.expandableCard}>
    <TouchableOpacity onPress={onToggle} style={styles.expandableHeader}>
      <View style={styles.expandableTitle}>
        <Ionicons name={iconName} size={24} color={colors.primary} />
        <Text style={[styles.expandableTitleText, { color: colors.text }]}>{title}</Text>
      </View>
      <Ionicons 
        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
        size={20} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
    {isExpanded && (
      <View style={[styles.expandableContent, { borderTopColor: colors.border }]}>
        {children}
      </View>
    )}
  </Card>
);

// Timeline Section
const TimelineSection = ({ colors, scrollToTimeline, highlightPhase }: { colors: any, scrollToTimeline?: boolean, highlightPhase?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionRef = useRef<View>(null);

  const fastingPhases = [
    { hours: 0, title: "Fast begins", description: "Using glucose from last meal", processes: ["Glucose burning", "Insulin declining"] },
    { hours: 6, title: "Glycogen use", description: "Using stored energy", processes: ["Glycogen breakdown", "Blood sugar stabilizing"] },
    { hours: 12, title: "Ketosis start", description: "Fat burning begins", processes: ["First ketones", "Fat burning increases"] },
    { hours: 18, title: "Deep ketosis", description: "Mental clarity improves", processes: ["Higher ketones", "Focus improves", "Hunger decreases"] },
    { hours: 24, title: "Autophagy", description: "Cellular repair starts", processes: ["Autophagy starts", "Cellular cleansing", "Growth hormone rises"] },
    { hours: 48, title: "Deep autophagy", description: "Maximum cleansing", processes: ["Intense autophagy", "Stem cells activate"] },
    { hours: 72, title: "Immune reset", description: "Complete renewal", processes: ["New immune cells", "System reset"] }
  ];

  // Auto-expand if we need to scroll to this section
  React.useEffect(() => {
    if (scrollToTimeline) {
      setIsExpanded(true);
      
      // Small delay to ensure the section is expanded before scrolling
      setTimeout(() => {
        if (sectionRef.current) {
          sectionRef.current.measureLayout(
            // @ts-ignore - we're using a simplified approach
            { getBoundingClientRect: () => ({ top: 0 }) },
            (x, y, width, height) => {
              // This would normally be passed from parent to scroll to position
              // For now we'll just ensure it's expanded
            }
          );
        }
      }, 300);
    }
  }, [scrollToTimeline]);

  return (
    <View ref={sectionRef}>
      <ExpandableSection
        title="What happens during your fast"
        iconName="time-outline"
        colors={colors}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.timelineContent}>
          {fastingPhases.map((phase, index) => (
            <View 
              key={index} 
              style={[
                styles.timelineItem, 
                { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  borderWidth: highlightPhase === phase.title ? 2 : 1,
                  borderColor: highlightPhase === phase.title ? colors.primary : colors.border
                }
              ]}
            >
              <View style={[styles.timelineHours, { backgroundColor: colors.blue[50] }]}>
                <Text style={[styles.timelineHoursText, { color: colors.blue[600] }]}>{phase.hours}h</Text>
              </View>
              <View style={styles.timelineInfo}>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>{phase.title}</Text>
                <Text style={[styles.timelineDescription, { color: colors.textSecondary }]}>{phase.description}</Text>
                <View style={styles.timelineProcesses}>
                  {phase.processes.map((process, i) => (
                    <View key={i} style={styles.processItem}>
                      <View style={[styles.processDot, { backgroundColor: colors.primary }]} />
                      <Text style={[styles.processText, { color: colors.textSecondary }]}>{process}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ExpandableSection>
    </View>
  );
};

// Safety Section
const SafetySection = ({ colors }: { colors: any }) => {
  const [expandedSections, setExpandedSections] = useState({
    safety: false,
    conditions: false,
    warnings: false,
    disclaimer: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Health and safety information</Text>
      </View>
      
      <View style={styles.safetyGrid}>
        <ExpandableSection
          title="General safety guidelines"
          iconName="bulb-outline"
          colors={colors}
          isExpanded={expandedSections.safety}
          onToggle={() => toggleSection('safety')}
        >
          <View style={[styles.safetyContent, { backgroundColor: colors.blue[50], borderColor: colors.blue[100] }]}>
            <View style={[styles.safetyTip, { backgroundColor: colors.background }]}>
              <Ionicons name="time-outline" size={20} color={colors.blue[600]} />
              <Text style={[styles.safetyText, { color: colors.blue[600] }]}>Start with shorter fasts (12-24h) before attempting longer ones</Text>
            </View>
            <View style={[styles.safetyTip, { backgroundColor: colors.background }]}>
              <Ionicons name="water-outline" size={20} color={colors.blue[600]} />
              <Text style={[styles.safetyText, { color: colors.blue[600] }]}>Stay well hydrated - drink 2-3 liters of water daily</Text>
            </View>
            <View style={[styles.safetyTip, { backgroundColor: colors.background }]}>
              <Ionicons name="ear-outline" size={20} color={colors.blue[600]} />
              <Text style={[styles.safetyText, { color: colors.blue[600] }]}>Listen to your body and stop if you feel unwell</Text>
            </View>
            <View style={[styles.safetyTip, { backgroundColor: colors.background }]}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.blue[600]} />
              <Text style={[styles.safetyText, { color: colors.blue[600] }]}>This app is for tracking purposes only - not medical advice</Text>
            </View>
          </View>
        </ExpandableSection>

        <ExpandableSection
          title="When to consult a healthcare provider first"
          iconName="medical-outline"
          colors={colors}
          isExpanded={expandedSections.conditions}
          onToggle={() => toggleSection('conditions')}
        >
          <View style={[styles.safetyContent, { backgroundColor: colors.orange[50], borderColor: colors.orange[100] }]}>
            <Text style={[styles.safetyWarning, { color: colors.orange[600] }]}>
              Consider consulting a healthcare provider before fasting if you have:
            </Text>
            <View style={styles.conditionsList}>
              {[
                "Diabetes or blood sugar issues",
                "Heart conditions or blood pressure medications",
                "History of eating disorders",
                "Kidney or liver conditions",
                "Currently taking medications",
                "Underweight (BMI under 18.5)",
                "History of gallstones",
                "Any chronic medical condition",
                "Pregnancy, breastfeeding, or under 18 years old"
              ].map((condition, index) => (
                <Text key={index} style={[styles.conditionItem, { color: colors.orange[600] }]}>
                  • {condition}
                </Text>
              ))}
            </View>
          </View>
        </ExpandableSection>

        <ExpandableSection
          title="When to stop fasting"
          iconName="warning-outline"
          colors={colors}
          isExpanded={expandedSections.warnings}
          onToggle={() => toggleSection('warnings')}
        >
          <View style={[styles.safetyContent, { backgroundColor: colors.red[50], borderColor: colors.red[100] }]}>
            <Text style={[styles.safetyWarning, { color: colors.red[600] }]}>
              Stop fasting and consider seeking medical advice if you experience:
            </Text>
            <View style={styles.conditionsList}>
              {[
                "Severe dizziness or lightheadedness",
                "Chest discomfort or heart palpitations",
                "Persistent severe headaches",
                "Extreme fatigue or weakness",
                "Difficulty concentrating or confusion",
                "Persistent nausea or vomiting",
                "Feeling faint or unstable",
                "Any symptoms that concern you"
              ].map((warning, index) => (
                <Text key={index} style={[styles.conditionItem, { color: colors.red[600] }]}>
                  • {warning}
                </Text>
              ))}
            </View>
          </View>
        </ExpandableSection>

        <ExpandableSection
          title="App disclaimer"
          iconName="document-text-outline"
          colors={colors}
          isExpanded={expandedSections.disclaimer}
          onToggle={() => toggleSection('disclaimer')}
        >
          <View style={[styles.safetyContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.disclaimerText, { color: colors.text }]}>
              H2Flow is designed for educational and tracking purposes only. We do not provide medical advice or recommendations. 
              Water fasting involves certain risks including:
            </Text>
            <View style={styles.disclaimerList}>
              <Text style={[styles.disclaimerItem, { color: colors.textSecondary }]}>• Changes in blood sugar and electrolyte levels</Text>
              <Text style={[styles.disclaimerItem, { color: colors.textSecondary }]}>• Potential effects on heart rhythm</Text>
              <Text style={[styles.disclaimerItem, { color: colors.textSecondary }]}>• Risk of dehydration</Text>
              <Text style={[styles.disclaimerItem, { color: colors.textSecondary }]}>• Possible gallstone formation during extended fasts</Text>
              <Text style={[styles.disclaimerItem, { color: colors.textSecondary }]}>• Metabolic changes</Text>
              <Text style={[styles.disclaimerItem, { color: colors.textSecondary }]}>• Refeeding considerations after extended fasts</Text>
            </View>
            <Text style={[styles.disclaimerText, { color: colors.text }]}>
              By using this app, you acknowledge that fasting decisions are your personal responsibility. 
              H2Flow and its creators are not liable for any health outcomes related to your fasting choices.
            </Text>
          </View>
        </ExpandableSection>
      </View>
    </View>
  );
};

// Benefits Section
const BenefitsSection = ({ colors }: { colors: any }) => {
  const [expandedSections, setExpandedSections] = useState({
    autophagy: false,
    cognitive: false,
    metabolic: false,
    immune: false,
    cardiovascular: false,
    longevity: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const benefits = [
    {
      key: 'autophagy',
      iconName: 'refresh-outline',
      title: 'Autophagy - Cellular renewal',
      description: 'Your cells activate their internal "recycling program," breaking down and removing damaged proteins, organelles, and cellular debris.',
      items: [
        'Removes toxic protein aggregates linked to Alzheimer\'s',
        'Repairs damaged mitochondria (cellular powerhouses)',
        'Eliminates pre-cancerous cells',
        'Reduces cellular inflammation',
        'Increases cellular efficiency and longevity'
      ]
    },
    {
      key: 'cognitive',
      iconName: 'brain-outline',
      title: 'Enhanced cognitive function',
      description: 'Ketones produced during fasting provide superior brain fuel, leading to:',
      items: [
        '25% more efficient energy production for neurons',
        'Increased BDNF (brain-derived neurotrophic factor)',
        'Enhanced focus and mental clarity',
        'Improved memory consolidation',
        'Reduced brain fog and increased alertness',
        'Neuroprotection against degenerative diseases'
      ]
    },
    {
      key: 'metabolic',
      iconName: 'heart-outline',
      title: 'Metabolic optimization',
      description: 'Fasting fundamentally rewires your metabolism for efficiency:',
      items: [
        'Insulin sensitivity increases by up to 40%',
        'Growth hormone levels increase 5-fold',
        'Norepinephrine boosts fat burning by 14%',
        'Metabolic rate increases initially',
        'Improved glucose regulation and HbA1c levels',
        'Enhanced fat oxidation and ketone production'
      ]
    },
    {
      key: 'immune',
      iconName: 'shield-checkmark-outline',
      title: 'Immune system reset',
      description: 'Extended fasting triggers stem cell regeneration and immune renewal:',
      items: [
        'Eliminates old, damaged immune cells',
        'Activates stem cell regeneration (particularly after 72h)',
        'Reduces chronic inflammation markers',
        'Rebalances immune system response',
        'Improves white blood cell efficiency',
        'May help with autoimmune conditions'
      ]
    },
    {
      key: 'cardiovascular',
      iconName: 'pulse-outline',
      title: 'Cardiovascular health',
      description: 'Fasting provides powerful cardioprotective benefits:',
      items: [
        'Reduces blood pressure by 10-15%',
        'Improves cholesterol profile (HDL up, LDL down)',
        'Decreases triglycerides by 30-50%',
        'Reduces resting heart rate',
        'Improves heart rate variability',
        'Reduces oxidative stress on blood vessels'
      ]
    },
    {
      key: 'longevity',
      iconName: 'star-outline',
      title: 'Longevity and anti-aging',
      description: 'Fasting activates multiple longevity pathways:',
      items: [
        'Activates SIRT1 longevity genes',
        'Increases NAD+ levels (cellular energy)',
        'Extends telomeres (chromosomal caps)',
        'Reduces senescent cell accumulation',
        'Improves DNA repair mechanisms',
        'May extend lifespan by 10-20%'
      ]
    }
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="star-outline" size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Comprehensive health benefits</Text>
      </View>
      
      <View style={styles.benefitsGrid}>
        {benefits.map(benefit => (
          <ExpandableSection
            key={benefit.key}
            title={benefit.title}
            iconName={benefit.iconName}
            colors={colors}
            isExpanded={expandedSections[benefit.key as keyof typeof expandedSections]}
            onToggle={() => toggleSection(benefit.key as keyof typeof expandedSections)}
          >
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitDescription, { color: colors.text }]}>{benefit.description}</Text>
              <View style={styles.benefitList}>
                {benefit.items.map((item, index) => (
                  <Text key={index} style={[styles.benefitItem, { color: colors.textSecondary }]}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          </ExpandableSection>
        ))}
      </View>
    </View>
  );
};

// Research Section
const ResearchSection = ({ colors }: { colors: any }) => {
  const [expandedSections, setExpandedSections] = useState({
    research: false,
    autophagy: false,
    metabolic: false,
    immune: false,
    longevity: false,
    database: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="search-outline" size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Scientific research and studies</Text>
      </View>
      
      <ExpandableSection
        title="Scientific research and studies"
        iconName="search-outline"
        colors={colors}
        isExpanded={expandedSections.research}
        onToggle={() => toggleSection('research')}
      >
        <Text style={[styles.researchIntro, { color: colors.text }]}>
          The benefits of water fasting are supported by extensive peer-reviewed research. Here are key studies 
          that demonstrate the physiological effects and health benefits:
        </Text>

        <ExpandableSection
          title="Autophagy and cellular renewal"
          iconName="refresh-outline"
          colors={colors}
          isExpanded={expandedSections.autophagy}
          onToggle={() => toggleSection('autophagy')}
        >
          <View style={[styles.researchItem, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.researchTitle, { color: colors.text }]}>
              "Autophagy: cellular and molecular mechanisms"
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Journal: The Journal of Clinical Investigation (2015)
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Finding: Comprehensive review of autophagy mechanisms and their role in cellular health and longevity.
            </Text>
            <TouchableOpacity onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/25654554/')}>
              <Text style={[styles.researchLink, { color: colors.primary }]}>
                View on PubMed →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.researchItem, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.researchTitle, { color: colors.text }]}>
              "Fasting activates macroautophagy in neurons of Alzheimer's disease mouse model"
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Journal: Autophagy (2019)
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Finding: Demonstrates how fasting enhances autophagy specifically in brain cells, potentially protecting against neurodegenerative diseases.
            </Text>
            <TouchableOpacity onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/30667316/')}>
              <Text style={[styles.researchLink, { color: colors.primary }]}>
                View on PubMed →
              </Text>
            </TouchableOpacity>
          </View>
        </ExpandableSection>

        <ExpandableSection
          title="Metabolic and weight loss effects"
          iconName="flash-outline"
          colors={colors}
          isExpanded={expandedSections.metabolic}
          onToggle={() => toggleSection('metabolic')}
        >
          <View style={[styles.researchItem, { borderLeftColor: colors.green[500] }]}>
            <Text style={[styles.researchTitle, { color: colors.text }]}>
              "Fasting: molecular mechanisms and clinical applications"
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Journal: Cell Metabolism (2014)
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Finding: Detailed analysis of fasting's effects on metabolism, showing improved insulin sensitivity and fat oxidation.
            </Text>
            <TouchableOpacity onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/24411938/')}>
              <Text style={[styles.researchLink, { color: colors.green[500] }]}>
                View on PubMed →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.researchItem, { borderLeftColor: colors.green[500] }]}>
            <Text style={[styles.researchTitle, { color: colors.text }]}>
              "Intermittent fasting vs daily calorie restriction for type 2 diabetes prevention"
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Journal: Journal of Clinical Medicine (2020)
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Finding: Shows intermittent fasting is more effective than calorie restriction for improving insulin sensitivity.
            </Text>
            <TouchableOpacity onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/32121457/')}>
              <Text style={[styles.researchLink, { color: colors.green[500] }]}>
                View on PubMed →
              </Text>
            </TouchableOpacity>
          </View>
        </ExpandableSection>

        <ExpandableSection
          title="Immune system and inflammation"
          iconName="shield-checkmark-outline"
          colors={colors}
          isExpanded={expandedSections.immune}
          onToggle={() => toggleSection('immune')}
        >
          <View style={[styles.researchItem, { borderLeftColor: colors.purple[500] }]}>
            <Text style={[styles.researchTitle, { color: colors.text }]}>
              "Fasting-mimicking diet and markers/risk factors for aging, diabetes, cancer, and cardiovascular disease"
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Journal: Science Translational Medicine (2017)
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Finding: Demonstrates how fasting reduces inflammation markers and regenerates immune cells.
            </Text>
            <TouchableOpacity onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/28202779/')}>
              <Text style={[styles.researchLink, { color: colors.purple[500] }]}>
                View on PubMed →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.researchItem, { borderLeftColor: colors.purple[500] }]}>
            <Text style={[styles.researchTitle, { color: colors.text }]}>
              "Prolonged fasting reduces IGF-1/PKA to promote hematopoietic-stem-cell-based regeneration"
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Journal: Cell Stem Cell (2014)
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Finding: Shows how extended fasting (72h+) triggers regeneration of new immune cells from stem cells.
            </Text>
            <TouchableOpacity onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/24905167/')}>
              <Text style={[styles.researchLink, { color: colors.purple[500] }]}>
                View on PubMed →
              </Text>
            </TouchableOpacity>
          </View>
        </ExpandableSection>

        <ExpandableSection
          title="Longevity and anti-aging"
          iconName="star-outline"
          colors={colors}
          isExpanded={expandedSections.longevity}
          onToggle={() => toggleSection('longevity')}
        >
          <View style={[styles.researchItem, { borderLeftColor: colors.orange[500] }]}>
            <Text style={[styles.researchTitle, { color: colors.text }]}>
              "Caloric restriction and intermittent fasting: Two potential diets for successful brain aging"
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Journal: Ageing Research Reviews (2006)
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Finding: Review showing how fasting may protect against age-related cognitive decline and extend lifespan.
            </Text>
            <TouchableOpacity onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/16904611/')}>
              <Text style={[styles.researchLink, { color: colors.orange[500] }]}>
                View on PubMed →
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.researchItem, { borderLeftColor: colors.orange[500] }]}>
            <Text style={[styles.researchTitle, { color: colors.text }]}>
              "Fasting enhances growth hormone secretion and amplifies the complex rhythms of growth hormone secretion"
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Journal: Journal of Clinical Investigation (1988)
            </Text>
            <Text style={[styles.researchDetails, { color: colors.textSecondary }]}>
              Finding: Classic study showing fasting increases growth hormone levels by up to 5-fold.
            </Text>
            <TouchableOpacity onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/3350967/')}>
              <Text style={[styles.researchLink, { color: colors.orange[500] }]}>
                View on PubMed →
              </Text>
            </TouchableOpacity>
          </View>
        </ExpandableSection>

        <ExpandableSection
          title="Further research databases"
          iconName="library-outline"
          colors={colors}
          isExpanded={expandedSections.database}
          onToggle={() => toggleSection('database')}
        >
          <Text style={[styles.researchIntro, { color: colors.text }]}>
            Explore more scientific studies on fasting through these research databases:
          </Text>

          <TouchableOpacity 
            style={[styles.databaseLink, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/?term=water+fasting')}
          >
            <Text style={[styles.databaseTitle, { color: colors.primary }]}>
              PubMed - Water fasting studies
            </Text>
            <Text style={[styles.databaseDescription, { color: colors.textSecondary }]}>
              Search peer-reviewed research on water fasting
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.databaseLink, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/?term=intermittent+fasting')}
          >
            <Text style={[styles.databaseTitle, { color: colors.primary }]}>
              PubMed - Intermittent fasting
            </Text>
            <Text style={[styles.databaseDescription, { color: colors.textSecondary }]}>
              Explore intermittent fasting research
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.databaseLink, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openLink('https://pubmed.ncbi.nlm.nih.gov/?term=autophagy+fasting')}
          >
            <Text style={[styles.databaseTitle, { color: colors.primary }]}>
              PubMed - Autophagy research
            </Text>
            <Text style={[styles.databaseDescription, { color: colors.textSecondary }]}>
              Studies on fasting-induced cellular cleanup
            </Text>
          </TouchableOpacity>
        </ExpandableSection>
      </ExpandableSection>
    </View>
  );
};

// Main Info Screen Component
const InfoScreen: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const route = useRoute<RouteProp<RootStackParamList, 'Info'>>();
  const scrollViewRef = useRef<ScrollView>(null);
  const timelineSectionRef = useRef<View>(null);

  const scrollToTimeline = route.params?.scrollToTimeline || false;
  const highlightPhase = route.params?.highlightPhase;

  // Handle scrolling to timeline when needed
  React.useEffect(() => {
    if (scrollToTimeline && timelineSectionRef.current) {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        timelineSectionRef.current?.measureLayout(
          // @ts-ignore - simplified approach
          { getBoundingClientRect: () => ({ top: 0 }) },
          (x, y, width, height) => {
            scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
          }
        );
      }, 500);
    }
  }, [scrollToTimeline]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Fasting Benefits & Science</Text>
      </View>

      <ScrollView style={styles.content} ref={scrollViewRef}>
        {/* Introduction */}
        <Card colors={theme} style={styles.introCard}>
          <Text style={[styles.introTitle, { color: theme.text }]}>Why Water Fasting Works</Text>
          <Text style={[styles.introText, { color: theme.textSecondary }]}>
            Extended water fasting triggers powerful biological processes that have been refined by millions of years of evolution. 
            When you fast, your body shifts from external fuel (food) to internal fuel (stored fat and damaged cells), 
            activating ancient survival mechanisms that promote healing and longevity.
          </Text>
        </Card>

        {/* Benefits Section */}
        <BenefitsSection colors={theme} />

        {/* Timeline Section */}
        <View style={styles.section} ref={timelineSectionRef}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Fasting Timeline</Text>
          </View>
          <TimelineSection 
            colors={theme} 
            scrollToTimeline={scrollToTimeline}
            highlightPhase={highlightPhase}
          />
        </View>

        {/* Research Section */}
        <ResearchSection colors={theme} />

        {/* Safety Section */}
        <SafetySection colors={theme} />

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            H2Flow - Fasting Tracker & Education
          </Text>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Information provided for educational purposes only
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  introCard: {
    margin: 16,
    padding: 20,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  expandableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  expandableTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expandableTitleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandableContent: {
    padding: 16,
    borderTopWidth: 1,
  },
  timelineContent: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    gap: 12,
  },
  timelineHours: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineHoursText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineInfo: {
    flex: 1,
    gap: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineDescription: {
    fontSize: 14,
  },
  timelineProcesses: {
    marginTop: 8,
    gap: 4,
  },
  processItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  processText: {
    fontSize: 12,
  },
  benefitsGrid: {
    gap: 12,
  },
  benefitContent: {
    gap: 12,
  },
  benefitDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefitList: {
    gap: 4,
  },
  benefitItem: {
    fontSize: 12,
    lineHeight: 16,
  },
  safetyGrid: {
    gap: 12,
  },
  safetyContent: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  safetyText: {
    fontSize: 14,
    flex: 1,
  },
  safetyWarning: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  conditionsList: {
    gap: 4,
  },
  conditionItem: {
    fontSize: 12,
    lineHeight: 16,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  disclaimerList: {
    marginLeft: 8,
    marginBottom: 8,
  },
  disclaimerItem: {
    fontSize: 12,
    lineHeight: 16,
  },
  researchIntro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  researchItem: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    marginBottom: 16,
    gap: 4,
  },
  researchTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  researchDetails: {
    fontSize: 12,
    lineHeight: 16,
  },
  researchLink: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  databaseLink: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  databaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  databaseDescription: {
    fontSize: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default InfoScreen;
