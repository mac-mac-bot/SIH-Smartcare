import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Linking } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../constants/theme";
import { Facility, LanguageCode } from "../types";
import { formatDistance, calculateBearing } from "../services/location";
import { StatusBadge } from "./StatusBadge";

interface Props {
  userLat: number;
  userLon: number;
  facilities: Facility[];
  selectedFacilityId?: string;
  onSelectFacility?: (facility: Facility) => void;
  language?: LanguageCode;
}

export function MapView({
  userLat,
  userLon,
  facilities,
  selectedFacilityId,
  onSelectFacility,
  language = "en",
}: Props) {
  const [activeId, setActiveId] = useState<string>(
    selectedFacilityId || (facilities.length > 0 ? facilities[0].id : "")
  );

  const activeFacility = facilities.find((f) => f.id === activeId) || facilities[0];

  const handleMarkerPress = (fac: Facility) => {
    setActiveId(fac.id);
    if (onSelectFacility) onSelectFacility(fac);
  };

  const handleOpenExternalMap = (fac: Facility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      {/* Map Header / Offline Badge */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="compass-outline" size={18} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Geospatial Facility Radar</Text>
        </View>
        <View style={styles.offlinePill}>
          <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
          <Text style={styles.offlinePillText}>Zero-Tile Offline Map</Text>
        </View>
      </View>

      {/* Interactive Radar Compass Canvas */}
      <View style={styles.radarContainer}>
        {/* Concentric Distance Rings */}
        <View style={[styles.ring, styles.ringOuter]}>
          <Text style={styles.ringLabel}>30 km</Text>
        </View>
        <View style={[styles.ring, styles.ringMiddle]}>
          <Text style={styles.ringLabel}>15 km</Text>
        </View>
        <View style={[styles.ring, styles.ringInner]}>
          <Text style={styles.ringLabel}>5 km</Text>
        </View>

        {/* Crosshairs */}
        <View style={styles.crosshairV} />
        <View style={styles.crosshairH} />

        {/* Cardinal Directions */}
        <Text style={[styles.cardinal, styles.cardinalN]}>N</Text>
        <Text style={[styles.cardinal, styles.cardinalS]}>S</Text>
        <Text style={[styles.cardinal, styles.cardinalE]}>E</Text>
        <Text style={[styles.cardinal, styles.cardinalW]}>W</Text>

        {/* User GPS Center Dot */}
        <View style={styles.centerDot}>
          <View style={styles.centerPulse} />
          <Ionicons name="person" size={10} color={COLORS.white} />
        </View>

        {/* Facility Markers placed by relative bearing & distance */}
        {facilities.map((fac) => {
          const dist = fac.distance_km || 10;
          const bearing = calculateBearing(userLat, userLon, fac.latitude, fac.longitude);
          const isSelected = fac.id === activeId;

          // Scale distance to radar radius (max 35 km -> 100px radius)
          const radarRadius = Math.min(105, Math.max(22, (dist / 35) * 105));
          const rad = (bearing - 90) * (Math.PI / 180);
          const x = Math.cos(rad) * radarRadius;
          const y = Math.sin(rad) * radarRadius;

          const isAvailable =
            fac.service_status === "AVAILABLE" ||
            fac.services?.["General Consultation"] === "AVAILABLE";

          return (
            <TouchableOpacity
              key={fac.id}
              style={[
                styles.markerWrapper,
                {
                  transform: [{ translateX: x }, { translateY: y }],
                },
              ]}
              onPress={() => handleMarkerPress(fac)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.markerPin,
                  isAvailable ? styles.markerAvailable : styles.markerLimited,
                  isSelected && styles.markerSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name={fac.tier === "Tertiary" ? "hospital-building" : "hospital-box"}
                  size={isSelected ? 16 : 13}
                  color={COLORS.white}
                />
              </View>
              {isSelected && (
                <View style={styles.markerLabelBubble}>
                  <Text style={styles.markerLabelText} numberOfLines={1}>
                    {fac.taluk} ({formatDistance(dist)})
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Facility Card Peek */}
      {activeFacility && (
        <View style={styles.peekCard}>
          <View style={styles.peekHeader}>
            <View style={styles.peekTitleCol}>
              <Text style={styles.peekName} numberOfLines={1}>
                {language === "ta" && activeFacility.tamilName
                  ? activeFacility.tamilName
                  : language === "hi" && activeFacility.hindiName
                  ? activeFacility.hindiName
                  : activeFacility.name}
              </Text>
              <Text style={styles.peekSubtext}>
                {activeFacility.taluk} • {formatDistance(activeFacility.distance_km)}
              </Text>
            </View>

            {activeFacility.service_status ? (
              <StatusBadge status={activeFacility.service_status} size="sm" />
            ) : (
              <StatusBadge status="AVAILABLE" size="sm" />
            )}
          </View>

          <View style={styles.peekActions}>
            <TouchableOpacity
              style={styles.peekBtnNavigate}
              onPress={() => handleOpenExternalMap(activeFacility)}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={14} color={COLORS.white} />
              <Text style={styles.peekBtnNavigateText}>Turn-by-Turn GPS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.peekBtnCall}
              onPress={() => Linking.openURL(`tel:${activeFacility.phone}`).catch(() => {})}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={14} color={COLORS.primaryDark} />
              <Text style={styles.peekBtnCallText}>Call Facility</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Facility Quick Selector Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.facilityPillsRow}
      >
        {facilities.map((fac) => {
          const isSelected = fac.id === activeId;
          return (
            <TouchableOpacity
              key={fac.id}
              onPress={() => handleMarkerPress(fac)}
              style={[
                styles.facPill,
                isSelected ? styles.facPillActive : styles.facPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.facPillText,
                  isSelected ? styles.facPillTextActive : styles.facPillTextInactive,
                ]}
              >
                {fac.taluk} • {formatDistance(fac.distance_km)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  offlinePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  offlinePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.successDark,
  },
  radarContainer: {
    height: 240,
    backgroundColor: "#092e2b",
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  ring: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.25)",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  ringOuter: {
    width: 220,
    height: 220,
  },
  ringMiddle: {
    width: 140,
    height: 140,
  },
  ringInner: {
    width: 60,
    height: 60,
  },
  ringLabel: {
    color: "rgba(204, 251, 241, 0.45)",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
  },
  crosshairV: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "rgba(20, 184, 166, 0.15)",
  },
  crosshairH: {
    position: "absolute",
    height: 1,
    width: "100%",
    backgroundColor: "rgba(20, 184, 166, 0.15)",
  },
  cardinal: {
    position: "absolute",
    color: "rgba(204, 251, 241, 0.6)",
    fontSize: 11,
    fontWeight: "800",
  },
  cardinalN: { top: 6 },
  cardinalS: { bottom: 6 },
  cardinalE: { right: 8 },
  cardinalW: { left: 8 },
  centerDot: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  centerPulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(20, 184, 166, 0.35)",
  },
  markerWrapper: {
    position: "absolute",
    alignItems: "center",
    zIndex: 5,
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  markerAvailable: {
    backgroundColor: COLORS.primary,
  },
  markerLimited: {
    backgroundColor: COLORS.warning,
  },
  markerSelected: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e11d48",
    borderWidth: 2.5,
    borderColor: COLORS.white,
  },
  markerLabelBubble: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 2,
  },
  markerLabelText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "700",
  },
  peekCard: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
  },
  peekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  peekTitleCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  peekName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  peekSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  peekActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  peekBtnNavigate: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  peekBtnNavigateText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  peekBtnCall: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  peekBtnCallText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "700",
  },
  facilityPillsRow: {
    paddingTop: SPACING.sm,
    gap: 6,
  },
  facPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  facPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  facPillInactive: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  facPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  facPillTextActive: {
    color: COLORS.white,
  },
  facPillTextInactive: {
    color: COLORS.textSecondary,
  },
});
