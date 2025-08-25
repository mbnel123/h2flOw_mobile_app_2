import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

interface TimelineSectionProps {
  elapsedHours: number;
}

const fastingPhases = [
  { hours: 0, title: "Fast begins", description: "Using glucose from last meal", processes: ["Glucose burning", "Insulin declining"] },
  { hours: 6, title: "Glycogen use", description: "Using stored energy", processes: ["Glycogen breakdown", "Blood sugar stabilizing"] },
  { hours: 12, title: "Ketosis start", description: "Fat burning begins", processes: ["First ketones", "Fat burning increases"] },
  { hours: 18, title: "Deep ketosis", description: "Mental clarity improves", processes: ["Higher ketones", "Focus improves", "Hunger decreases"] },
  { hours: 24, title: "Autophagy", description: "Cellular repair starts", processes: ["Autophagy starts", "Cellular cleansing", "Growth hormone rises"] },
  { hours: 48, title: "Deep autophagy", description: "Maximum cleansing", processes: ["Intense autophagy", "Stem cells activate"] },
  { hours: 72, title: "Immune reset", description: "Complete renewal", processes: ["New immune cells", "System reset"] }
];

const TimelineSection: React.FC<TimelineSectionProps> = ({ elapsedHours }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>What happens during your fast</Text>
        {isExpanded ? <ChevronUp size={20} color="#6B7280" /> : <ChevronDown size={20} color="#6B7280" />}
      </TouchableOpacity>

      {isExpanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {fastingPhases.map((phase, index) => {
            const active = elapsedHours >= phase.hours;
            return (
              <View key={index} style={[styles.phaseBox, active && styles.activePhase]}>
                <View style={{ width: 50 }}>
                  <Text style={[styles.phaseHours, active && styles.activePhaseText]}>{phase.hours}h</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.phaseTitle, active && styles.activePhaseText]}>{phase.title}</Text>
                  <Text style={styles.phaseDesc}>{phase.description}</Text>
                  {phase.processes.map((p, i) => (
                    <Text key={i} style={styles.process}>• {p}</Text>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginVertical: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  phaseBox: { flexDirection: 'row', padding: 12, marginBottom: 8, borderRadius: 8, backgroundColor: '#F9FAFB' },
  phaseHours: { fontSize: 12, color: '#6B7280' },
  phaseTitle: { fontWeight: '600', color: '#111827' },
  phaseDesc: { fontSize: 12, color: '#374151', marginBottom: 4 },
  process: { fontSize: 11, color: '#6B7280' },
  activePhase: { backgroundColor: '#DBEAFE' },
  activePhaseText: { color: '#2563EB' }
});

export default TimelineSection;
