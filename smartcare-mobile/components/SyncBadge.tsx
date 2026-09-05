import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { SyncMetadata } from "../types";

interface Props {
  metadata: SyncMetadata;
  isSyncing?: boolean;
  onPressSync?: () => void;
  compact?: boolean;
}

export function SyncBadge({ metadata, isSyncing, onPressSync, compact = false }: Props) {
  const isOnline = metadata.isOnline;

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPressSync}
        activeOpacity={0.7}
        style={[
          styles.compactContainer,
          { backgroundColor: isOnline ? COLORS.successSurface : COLORS.warningSurface },
        ]}
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.spinner} />
        ) : (
          <View
            style={[
              styles.dot,
              { backgroundColor: isOnline ? COLORS.success : COLORS.warningDark },
            ]}
          />
        )}
        <Text
          style={[
            styles.compactText,
            { color: isOnline ? COLORS.successDark : COLORS.warningDark },
          ]}
        >
          {isSyncing ? "Syncing..." : isOnline ? "Synced" : "Offline"}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.fullCard,
        {
          borderColor: isOnline ? COLORS.primaryBorder : COLORS.warningBorder,
          backgroundColor: isOnline ? COLORS.primarySurface : COLORS.warningSurface,
        },
      ]}
    >
      <View style={styles.leftInfo}>
        <View style={styles.statusRow}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.spinner} />
          ) : (
            <Ionicons
              name={isOnline ? "cloud-done-outline" : "cloud-offline-outline"}
              size={18}
              color={isOnline ? COLORS.primary : COLORS.warningDark}
            />
          )}
          <Text
            style={[
              styles.statusTitle,
              { color: isOnline ? COLORS.primaryDark : COLORS.warningDark },
            ]}
          >
            {isSyncing
              ? "Micro-Delta Syncing..."
              : isOnline
              ? "Online • Delta Synced"
              : "Offline Mode Active"}
          </Text>
        </View>
        <Text style={styles.subtext}>
          Last synced: {metadata.lastSyncDate} • Patch size: ~{Math.round(metadata.payloadBytes / 1024 * 10) / 10 || 1.8} KB
        </Text>
      </View>

      {onPressSync && (
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={onPressSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          <Ionicons name="sync" size={14} color={COLORS.white} />
          <Text style={styles.syncBtnText}>Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  spinner: {
    marginRight: 4,
    transform: [{ scale: 0.7 }],
  },
  compactText: {
    fontSize: 11,
    fontWeight: "700",
  },
  fullCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginVertical: SPACING.xs,
  },
  leftInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  subtext: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  syncBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  syncBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
});
