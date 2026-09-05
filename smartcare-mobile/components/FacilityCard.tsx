import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../constants/theme";
import { Facility, LanguageCode } from "../types";
import { StatusBadge } from "./StatusBadge";
import { formatDistance } from "../services/location";

interface Props {
  facility: Facility;
  onPressDetails?: () => void;
  language?: LanguageCode;
  highlightService?: string;
}

export function FacilityCard({
  facility,
  onPressDetails,
  language = "en",
  highlightService,
}: Props) {
  const isTop = facility.is_top_recommendation;

  const displayName =
    language === "ta" && facility.tamilName
      ? facility.tamilName
      : language === "hi" && facility.hindiName
      ? facility.hindiName
      : facility.name;

  const freshnessLabel = facility.freshness_label || "Verified Recent";
  const isRecent = freshnessLabel.includes("Verified") || (facility.freshness_score ?? 1.0) >= 0.9;
  const isNeedsConfirm = freshnessLabel.includes("Needs") || ((facility.freshness_score ?? 0.6) === 0.6);

  const handleCall = () => {
    const num = facility.emergencyPhone || facility.phone;
    Linking.openURL(`tel:${num}`).catch(() => {});
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isTop ? styles.cardTopRecommendation : styles.cardDefault,
      ]}
      onPress={onPressDetails}
      activeOpacity={0.85}
    >
      {/* Top Banner for Winner */}
      {isTop && (
        <View style={styles.topBadgeRow}>
          <Ionicons name="sparkles" size={14} color={COLORS.white} />
          <Text style={styles.topBadgeText}>TOP RECOMMENDED FACILITY</Text>
        </View>
      )}

      <View style={styles.body}>
        {/* Header: Name + Tier */}
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={2}>
              {displayName}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              {facility.taluk}, {facility.district} • {facility.type}
            </Text>
          </View>

          <View style={styles.distBadge}>
            <Ionicons name="location" size={14} color={COLORS.primary} />
            <Text style={styles.distText}>{formatDistance(facility.distance_km)}</Text>
          </View>
        </View>

        {/* Service status tag if query active */}
        {highlightService && facility.service_status && (
          <View style={styles.statusHighlightBox}>
            <Text style={styles.statusHighlightLabel}>
              {highlightService}:
            </Text>
            <StatusBadge status={facility.service_status} size="sm" />
          </View>
        )}

        {/* Transparency / Why Recommended reason */}
        {facility.recommendation_reason ? (
          <View
            style={[
              styles.reasonBox,
              isTop ? styles.reasonBoxTop : styles.reasonBoxStandard,
            ]}
          >
            <Ionicons
              name={isTop ? "checkmark-circle" : "information-circle-outline"}
              size={15}
              color={isTop ? COLORS.primaryDark : COLORS.textSecondary}
              style={styles.reasonIcon}
            />
            <Text
              style={[
                styles.reasonText,
                isTop && { color: COLORS.primaryDark, fontWeight: "600" },
              ]}
            >
              {facility.recommendation_reason}
            </Text>
          </View>
        ) : null}

        {/* Verification Freshness Row */}
        <View style={styles.freshnessRow}>
          <View
            style={[
              styles.freshnessDot,
              {
                backgroundColor: isRecent
                  ? COLORS.success
                  : isNeedsConfirm
                  ? COLORS.warning
                  : COLORS.danger,
              },
            ]}
          />
          <Text style={styles.freshnessText}>
            {freshnessLabel} • {facility.time_desc || "Recently"}
          </Text>
          {facility.isDemo && (
            <View style={styles.demoPill}>
              <Text style={styles.demoPillText}>Demo</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={16} color={COLORS.primaryDark} />
            <Text style={styles.actionBtnSecondaryText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={handleNavigate}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate-outline" size={16} color={COLORS.primaryDark} />
            <Text style={styles.actionBtnSecondaryText}>Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={onPressDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnPrimaryText}>View Details</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  cardDefault: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTopRecommendation: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  topBadgeRow: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    gap: 6,
  },
  topBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  body: {
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  address: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  distBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  distText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginLeft: 3,
  },
  statusHighlightBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    gap: 6,
  },
  statusHighlightLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  reasonBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  reasonBoxTop: {
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  reasonBoxStandard: {
    backgroundColor: COLORS.borderLight,
  },
  reasonIcon: {
    marginRight: 6,
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  freshnessRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  freshnessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  freshnessText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  demoPill: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  demoPillText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  actionBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: 4,
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.white,
  },
});
