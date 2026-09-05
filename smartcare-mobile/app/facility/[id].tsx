import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../constants/theme";
import { Facility, LanguageCode } from "../../types";
import { TRANSLATIONS } from "../../services/translations";
import { getStoredFacilities, getStoredLanguage } from "../../services/database";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDistance } from "../../services/location";

export default function FacilityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredLanguage().then(setLanguage);
    getStoredFacilities().then((list) => {
      const found = list.find((f) => f.id === id);
      setFacility(found || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!facility) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.warningDark} />
        <Text style={styles.notFoundText}>Facility record not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const t = TRANSLATIONS[language];
  const displayName =
    language === "ta" && facility.tamilName
      ? facility.tamilName
      : language === "hi" && facility.hindiName
      ? facility.hindiName
      : facility.name;

  const handleCall = () => {
    const num = facility.emergencyPhone || facility.phone;
    Linking.openURL(`tel:${num}`).catch(() => {});
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const lastDate = facility.last_updated ? new Date(facility.last_updated).getTime() : Date.now();
  const hoursAgo = Math.max(0, (Date.now() - lastDate) / (1000 * 60 * 60));

  let freshnessBadge = "🟢 Verified Recent (< 6 hrs)";
  let freshnessColor = COLORS.success;
  let freshnessBg = COLORS.successSurface;
  if (hoursAgo >= 24) {
    freshnessBadge = "🔴 Outdated — Please call before traveling";
    freshnessColor = COLORS.danger;
    freshnessBg = COLORS.dangerSurface;
  } else if (hoursAgo >= 6) {
    freshnessBadge = "🟡 Needs Confirmation (6–24 hrs)";
    freshnessColor = COLORS.warningDark;
    freshnessBg = COLORS.warningSurface;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Back Navigation Bar */}
      <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        <Text style={styles.navBackText}>Back to Results</Text>
      </TouchableOpacity>

      {/* Main Header Card */}
      <View style={styles.mainCard}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {facility.tier.toUpperCase()} • {facility.type}
          </Text>
        </View>

        <Text style={styles.title}>{displayName}</Text>
        {language !== "en" && (
          <Text style={styles.subEnglishTitle}>{facility.name}</Text>
        )}

        <Text style={styles.address}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />{" "}
          {facility.address}
        </Text>

        {facility.distance_km !== undefined && (
          <View style={styles.distanceRow}>
            <Ionicons name="navigate-outline" size={14} color={COLORS.primary} />
            <Text style={styles.distanceText}>
              Estimated {formatDistance(facility.distance_km)} from patient location
            </Text>
          </View>
        )}

        {/* Verification Freshness Bar */}
        <View style={[styles.freshnessBanner, { backgroundColor: freshnessBg }]}>
          <Text style={[styles.freshnessBannerText, { color: freshnessColor }]}>
            {freshnessBadge}
          </Text>
          <Text style={styles.freshnessSub}>
            Updated by: {facility.updated_by || "Medical Officer"} • {new Date(facility.last_updated).toLocaleString()}
          </Text>
        </View>

        {/* Quick Action CTA Buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <Ionicons name="call" size={18} color={COLORS.white} />
            <Text style={styles.callBtnText}>Call Hospital</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={handleNavigate}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate" size={18} color={COLORS.white} />
            <Text style={styles.navBtnText}>Directions (GPS)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Diagnostic Equipment & Scans */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="radiology-box" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{t.diagnosticsTitle}</Text>
        </View>

        {facility.diagnostics && Object.keys(facility.diagnostics).length > 0 ? (
          Object.entries(facility.diagnostics).map(([diagName, diagObj]) => (
            <View key={diagName} style={styles.diagItem}>
              <View style={styles.diagTop}>
                <Text style={styles.diagName}>{diagName}</Text>
                <StatusBadge status={diagObj.status} size="sm" />
              </View>
              {diagObj.timing && (
                <Text style={styles.diagTiming}>Hours: {diagObj.timing}</Text>
              )}
              {diagObj.notes && (
                <Text style={styles.diagNotes}>{diagObj.notes}</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyNote}>No diagnostic information listed.</Text>
        )}
      </View>

      {/* Doctors / Specialists on Duty */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="doctor" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{t.doctorsOnDuty}</Text>
        </View>

        {facility.doctors && facility.doctors.length > 0 ? (
          facility.doctors.map((doc) => (
            <View key={doc.id} style={styles.doctorItem}>
              <View style={styles.doctorTop}>
                <View>
                  <Text style={styles.doctorName}>{doc.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doc.specialty}</Text>
                </View>
                <StatusBadge status={doc.status} size="sm" />
              </View>
              <Text style={styles.doctorRoom}>
                {doc.room || "General OPD"} • {doc.timing || "Regular Shift"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyNote}>General medical officer on duty.</Text>
        )}
      </View>

      {/* Essential Medicines Inventory */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="pill" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{t.medicinesStockTitle}</Text>
        </View>

        {facility.medicines && facility.medicines.length > 0 ? (
          facility.medicines.map((med) => (
            <View key={med.id} style={styles.medItem}>
              <View style={styles.medTop}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medGeneric}>Generic: {med.generic}</Text>
                </View>
                <StatusBadge status={med.status} size="sm" />
              </View>
              {med.stock !== undefined && (
                <Text style={styles.medStock}>Stock: {med.stock} units</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyNote}>Standard primary health medicines available.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  navBack: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: 4,
  },
  navBackText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  typeBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: SPACING.sm,
  },
  typeBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  subEnglishTitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  address: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  freshnessBanner: {
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  freshnessBannerText: {
    fontSize: 13,
    fontWeight: "800",
  },
  freshnessSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  ctaRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  callBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  callBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  navBtn: {
    flex: 1,
    backgroundColor: "#0369a1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  navBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  diagItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  diagTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diagName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  diagTiming: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  diagNotes: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  doctorItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  doctorTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  doctorName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: "600",
    marginTop: 1,
  },
  doctorRoom: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  medItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  medTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  medName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  medGeneric: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  medStock: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  emptyNote: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: "italic",
    paddingVertical: SPACING.sm,
  },
});
