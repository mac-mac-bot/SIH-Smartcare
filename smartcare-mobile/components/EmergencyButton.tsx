import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../constants/theme";

interface Props {
  onPressCustom?: () => void;
  title?: string;
  subtitle?: string;
}

export function EmergencyButton({ onPressCustom, title = "108 EMERGENCY SOS", subtitle = "Tap for Instant Ambulance & Govt Helplines" }: Props) {
  const handlePress = () => {
    if (onPressCustom) {
      onPressCustom();
      return;
    }
    Linking.openURL("tel:108").catch(() => {
      Alert.alert("Emergency Call", "Please dial 108 directly on your phone keypad.");
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="ambulance" size={28} color={COLORS.danger} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.callBadge}>
        <MaterialCommunityIcons name="phone" size={16} color={COLORS.white} />
        <Text style={styles.callText}>CALL</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.elevated,
    minHeight: 64,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#fee2e2",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  callBadge: {
    backgroundColor: COLORS.dangerDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },
  callText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 4,
  },
});
