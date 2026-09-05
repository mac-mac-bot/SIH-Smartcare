import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { Facility, LanguageCode } from "../types";
import { TRANSLATIONS } from "../services/translations";
import { getStoredFacilities, getStoredLanguage } from "../services/database";
import { getCurrentUserLocation, Coordinates } from "../services/location";
import { DEMO_LAT, DEMO_LON } from "../data/demoFacilities";
import { rankFacilities } from "../services/recommendations";
import { EmergencyButton } from "../components/EmergencyButton";
import { FacilityCard } from "../components/FacilityCard";
import { MapView } from "../components/MapView";

export default function HomeScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [coords, setCoords] = useState<Coordinates>({ latitude: DEMO_LAT, longitude: DEMO_LON });
  const [isLiveGps, setIsLiveGps] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const lang = await getStoredLanguage();
      setLanguage(lang);

      const stored = await getStoredFacilities();
      const ranked = rankFacilities(stored, coords.latitude, coords.longitude, "General Consultation");
      setFacilities(ranked);
    } catch (e) {
      console.warn("Error loading home screen data:", e);
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestGps = async () => {
    setLoading(true);
    const result = await getCurrentUserLocation();
    setCoords(result.coords);
    setIsLiveGps(result.isLive);
    const stored = await getStoredFacilities();
    const ranked = rankFacilities(stored, result.coords.latitude, result.coords.longitude, "General Consultation");
    setFacilities(ranked);
    setLoading(false);
  };

  const handleResetDemo = async () => {
    setCoords({ latitude: DEMO_LAT, longitude: DEMO_LON });
    setIsLiveGps(false);
    const stored = await getStoredFacilities();
    const ranked = rankFacilities(stored, DEMO_LAT, DEMO_LON, "General Consultation");
    setFacilities(ranked);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const t = TRANSLATIONS[language];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Location Strip */}
      <View style={styles.locationBar}>
        <View style={styles.locLeft}>
          <Ionicons
            name={isLiveGps ? "navigate" : "location"}
            size={18}
            color={isLiveGps ? COLORS.success : COLORS.primary}
          />
          <View style={styles.locTextCol}>
            <Text style={styles.locTitle}>
              {isLiveGps ? t.usingCurrentGps : t.usingDemoLocation}
            </Text>
            <Text style={styles.locSubtitle}>
              {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.gpsToggleBtn}
          onPress={isLiveGps ? handleResetDemo : handleRequestGps}
          activeOpacity={0.8}
        >
          <Text style={styles.gpsToggleText}>
            {isLiveGps ? "Reset Demo" : "Get GPS"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick "Find Care" CTA Banner */}
      <TouchableOpacity
        style={styles.findCareHeroCard}
        onPress={() => router.push("/find-care")}
        activeOpacity={0.9}
      >
        <View style={styles.heroLeft}>
          <View style={styles.heroBadge}>
            <Ionicons name="search" size={14} color={COLORS.white} />
            <Text style={styles.heroBadgeText}>CORE FEATURE</Text>
          </View>
          <Text style={styles.heroTitle}>{t.findCareTitle}</Text>
          <Text style={styles.heroSub}>{t.findCareSubtitle}</Text>

          <View style={styles.heroInputSim}>
            <Text style={styles.heroInputText}>{t.searchPlaceholder}</Text>
            <View style={styles.heroSearchCircle}>
              <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* 108 Emergency SOS Button */}
      <EmergencyButton
        onPressCustom={() => router.push("/emergency")}
        title="108 EMERGENCY SOS"
        subtitle="108 Ambulance, 100 Police, 104 Health Helpline"
      />

      {/* Core Principle Notice */}
      <View style={styles.principleBox}>
        <Ionicons name="bulb-outline" size={18} color={COLORS.primaryDark} style={styles.principleIcon} />
        <Text style={styles.principleText}>
          <Text style={styles.principleBold}>SmartCare Principle: </Text>
          {t.nearestVsRecommended} We rank facilities by actual service availability, distance, and verified data freshness.
        </Text>
      </View>

      {/* Health Advisory */}
      <View style={styles.advisoryCard}>
        <View style={styles.advisoryHeader}>
          <MaterialCommunityIcons name="shield-alert-outline" size={18} color="#92400e" />
          <Text style={styles.advisoryTitle}>District Health Advisory</Text>
        </View>
        <Text style={styles.advisoryBody}>{t.recentHealthTip}</Text>
      </View>

      {/* Geospatial Radar Toggle */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t.nearbyFacilities}</Text>
        <TouchableOpacity
          style={styles.radarToggle}
          onPress={() => setShowRadar(!showRadar)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showRadar ? "list" : "compass-outline"}
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.radarToggleText}>
            {showRadar ? "Show Cards" : "Show Radar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : showRadar ? (
        <MapView
          userLat={coords.latitude}
          userLon={coords.longitude}
          facilities={facilities}
          language={language}
          onSelectFacility={(fac) => router.push(`/facility/${fac.id}` as any)}
        />
      ) : (
        facilities.slice(0, 4).map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            language={language}
            onPressDetails={() => router.push(`/facility/${facility.id}` as any)}
          />
        ))
      )}

      {/* View All button */}
      {!showRadar && facilities.length > 4 && (
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push("/find-care")}
          activeOpacity={0.8}
        >
          <Text style={styles.viewAllBtnText}>{t.viewAll} ({facilities.length})</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
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
  locationBar: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  locLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locTextCol: {
    marginLeft: SPACING.sm,
  },
  locTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  locSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  gpsToggleBtn: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  gpsToggleText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "700",
  },
  findCareHeroCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.elevated,
  },
  heroLeft: {
    flex: 1,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: "flex-start",
    gap: 4,
    marginBottom: SPACING.sm,
  },
  heroBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  heroSub: {
    color: "#ccfbf1",
    fontSize: 13,
    marginTop: 4,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  heroInputSim: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroInputText: {
    color: COLORS.textMuted,
    fontSize: 13,
    flex: 1,
  },
  heroSearchCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  principleBox: {
    backgroundColor: COLORS.primarySurface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  principleIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  principleText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 17,
    flex: 1,
  },
  principleBold: {
    fontWeight: "800",
  },
  advisoryCard: {
    backgroundColor: "#fef3c7",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  advisoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  advisoryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
  },
  advisoryBody: {
    fontSize: 12,
    color: "#78350f",
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  radarToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  radarToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  loader: {
    marginVertical: SPACING.xl,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    paddingVertical: SPACING.md,
    gap: 6,
    marginTop: SPACING.xs,
  },
  viewAllBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
