import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { ServiceStatus, DoctorStatus, MedicineStatus } from "../types";

interface Props {
  status: ServiceStatus | DoctorStatus | MedicineStatus | string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: Props) {
  let bg = COLORS.borderLight;
  let text = COLORS.textSecondary;
  let border = COLORS.border;
  let icon: keyof typeof Ionicons.glyphMap = "information-circle";
  let label = status;

  switch (status) {
    case "AVAILABLE":
    case "IN_STOCK":
    case "ON_DUTY":
      bg = COLORS.successSurface;
      text = COLORS.successDark;
      border = COLORS.successBorder;
      icon = "checkmark-circle";
      label = status === "ON_DUTY" ? "ON DUTY" : status === "IN_STOCK" ? "IN STOCK" : "AVAILABLE";
      break;

    case "LIMITED":
    case "LOW_STOCK":
      bg = COLORS.warningSurface;
      text = COLORS.warningDark;
      border = COLORS.warningBorder;
      icon = "alert-circle";
      label = status === "LOW_STOCK" ? "LOW STOCK" : "LIMITED";
      break;

    case "UNAVAILABLE":
    case "OUT_OF_STOCK":
    case "OFF_DUTY":
    case "LEAVE":
      bg = COLORS.dangerSurface;
      text = COLORS.dangerDark;
      border = COLORS.dangerBorder;
      icon = "close-circle";
      label = status === "OFF_DUTY" ? "OFF DUTY" : status === "OUT_OF_STOCK" ? "OUT OF STOCK" : "UNAVAILABLE";
      break;

    default:
      break;
  }

  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        isSmall && styles.badgeSmall,
      ]}
    >
      <Ionicons name={icon} size={isSmall ? 12 : 14} color={text} style={styles.icon} />
      <Text style={[styles.text, { color: text }, isSmall && styles.textSmall]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeSmall: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  textSmall: {
    fontSize: 10,
    fontWeight: "700",
  },
});
