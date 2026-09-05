import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING } from "../constants/theme";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  onSelectQuickService?: (service: string) => void;
  selectedService?: string;
}

const COMMON_SERVICES = [
  { label: "X-Ray", icon: "scan-outline" },
  { label: "Blood Test", icon: "water-outline" },
  { label: "ECG", icon: "pulse-outline" },
  { label: "Ultrasound", icon: "radio-outline" },
  { label: "Pediatrics", icon: "people-outline" },
  { label: "Maternity", icon: "heart-outline" },
  { label: "General Consultation", icon: "medkit-outline" },
];

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search symptom, scan, or service...",
  onSelectQuickService,
  selectedService,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="search"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.goBtn} onPress={onSubmit} activeOpacity={0.8}>
          <Text style={styles.goBtnText}>Find</Text>
        </TouchableOpacity>
      </View>

      {onSelectQuickService && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {COMMON_SERVICES.map((item) => {
            const isSelected = selectedService === item.label;
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => onSelectQuickService(item.label)}
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  isSelected ? styles.chipSelected : styles.chipDefault,
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={14}
                  color={isSelected ? COLORS.white : COLORS.primaryDark}
                  style={styles.chipIcon}
                />
                <Text
                  style={[
                    styles.chipText,
                    isSelected ? styles.chipTextSelected : styles.chipTextDefault,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    height: "100%",
  },
  clearBtn: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  goBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  goBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  chipsRow: {
    paddingTop: SPACING.sm,
    gap: SPACING.xs + 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextDefault: {
    color: COLORS.textPrimary,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
});
