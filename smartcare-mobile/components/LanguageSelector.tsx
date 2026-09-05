import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { LanguageCode } from "../types";

interface Props {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  compact?: boolean;
}

const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "EN" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
];

export function LanguageSelector({ currentLanguage, onSelectLanguage, compact = false }: Props) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {LANGUAGES.map((lang) => {
        const isSelected = currentLanguage === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => onSelectLanguage(lang.code)}
            activeOpacity={0.8}
            style={[
              styles.button,
              isSelected ? styles.buttonActive : styles.buttonInactive,
              compact && styles.buttonCompact,
            ]}
          >
            <Text
              style={[
                styles.text,
                isSelected ? styles.textActive : styles.textInactive,
                compact && styles.textCompact,
              ]}
            >
              {lang.nativeLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.borderLight,
    padding: 3,
    borderRadius: RADIUS.md,
    alignSelf: "flex-start",
  },
  compactContainer: {
    borderRadius: RADIUS.sm,
    padding: 2,
  },
  button: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  buttonCompact: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonInactive: {
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 13,
    fontWeight: "700",
  },
  textCompact: {
    fontSize: 11,
  },
  textActive: {
    color: COLORS.white,
  },
  textInactive: {
    color: COLORS.textSecondary,
  },
});
