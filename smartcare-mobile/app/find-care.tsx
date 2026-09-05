import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { Facility, LanguageCode } from "../types";
import { TRANSLATIONS } from "../services/translations";
import { getStoredFacilities, getStoredLanguage } from "../services/database";
import { DEMO_LAT, DEMO_LON } from "../data/demoFacilities";
import {
  extractHealthcareRequirement,
  rankFacilities,
  RequirementExtraction,
} from "../services/recommendations";
import { SearchBar } from "../components/SearchBar";
import { FacilityCard } from "../components/FacilityCard";
import { formatDistance } from "../services/location";

export default function FindCareScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [searchQuery, setSearchQuery] = useState("I need an X-Ray");
  const [selectedService, setSelectedService] = useState("X-Ray");
  const [extraction, setExtraction] = useState<RequirementExtraction>({
    canonicalService: "X-Ray",
    category: "diagnostics",
    confidence: 0.95,
    extractedQuery: "I need an X-Ray",
  });
  const [results, setResults] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    getStoredLanguage().then(setLanguage);
    getStoredFacilities().then((facilities) => {
      setAllFacilities(facilities);
      handleExecuteSearch("I need an X-Ray", facilities);
    });
  }, []);

  const handleExecuteSearch = (query: string, facilitiesList?: Facility[]) => {
    setLoading(true);
    const list = facilitiesList || allFacilities;
    const extracted = extractHealthcareRequirement(query);
    setExtraction(extracted);
    setSelectedService(extracted.canonicalService);

    // Run SmartCare weighted ranking
    const ranked = rankFacilities(
      list,
      DEMO_LAT,
      DEMO_LON,
      extracted.canonicalService
    );
    setResults(ranked);
    setLoading(false);
  };

  const handleSelectQuick = (svc: string) => {
    setSearchQuery(svc);
    handleExecuteSearch(svc);
  };

  const t = TRANSLATIONS[language];

  const topFacility = results.length > 0 ? results[0] : null;
  const nearestFacility =
    results.length > 0
      ? [...results].sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))[0]
      : null;

  const nearestIsDifferent =
    topFacility && nearestFacility && topFacility.id !== nearestFacility.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title & Philosophy Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.findCareTitle}</Text>
        <Text style={styles.subtitle}>{t.findCareSubtitle}</Text>
      </View>

      {/* Natural Language Search Bar + Quick Chips */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={() => handleExecuteSearch(searchQuery)}
        onSelectQuickService={handleSelectQuick}
        selectedService={selectedService}
        placeholder={t.searchPlaceholder}
      />

      {/* Structured Intent Extraction Pill */}
      {extraction && (
        <View style={styles.extractionBanner}>
          <View style={styles.extractionRow}>
            <Ionicons name="git-branch-outline" size={16} color={COLORS.primary} />
            <Text style={styles.extractionTitle}>Requirement Detected:</Text>
            <View style={styles.canonicalBadge}>
              <Text style={styles.canonicalBadgeText}>
                {extraction.canonicalService}
              </Text>
            </View>
          </View>
          <Text style={styles.extractionCategory}>
            Category: {extraction.category.toUpperCase()} • Confidence: {Math.round(extraction.confidence * 100)}%
          </Text>
        </View>
      )}

      {/* Critical Comparison Callout: Nearest vs Recommended */}
      {nearestIsDifferent && nearestFacility && topFacility && (
        <View style={styles.comparisonCallout}>
          <View style={styles.calloutHeader}>
            <Ionicons name="alert-circle" size={18} color="#b45309" />
            <Text style={styles.calloutTitle}>
              Nearest Facility Warning
            </Text>
          </View>
          <Text style={styles.calloutText}>
            The closest center,{" "}
            <Text style={styles.boldText}>
              {language === "ta" && nearestFacility.tamilName ? nearestFacility.tamilName : nearestFacility.name}
            </Text>{" "}
            ({formatDistance(nearestFacility.distance_km)}), currently has{" "}
            <Text style={styles.statusUnavailableText}>
              {extraction.canonicalService}: UNAVAILABLE
            </Text>
            .
          </Text>
          <Text style={styles.calloutSub}>
            SmartCare routed you to{" "}
            <Text style={styles.boldText}>
              {language === "ta" && topFacility.tamilName ? topFacility.tamilName : topFacility.name}
            </Text>{" "}
            ({formatDistance(topFacility.distance_km)}) because the service is verified{" "}
            <Text style={styles.statusAvailableText}>AVAILABLE</Text>.
          </Text>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeaderRow}>
        <Text style={styles.resultsTitle}>
          {t.resultsTitle} ({results.length})
        </Text>
      </View>

      {/* Ranked Facilities Cards */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : results.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="search" size={36} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>{t.noMatchingFacilities}</Text>
        </View>
      ) : (
        results.map((fac) => (
          <FacilityCard
            key={fac.id}
            facility={fac}
            language={language}
            highlightService={extraction?.canonicalService}
            onPressDetails={() => router.push(`/facility/${fac.id}` as any)}
          />
        ))
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
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  extractionBanner: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  extractionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  extractionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  canonicalBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  canonicalBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  extractionCategory: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  comparisonCallout: {
    backgroundColor: "#fffbeb",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: "#fde68a",
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#b45309",
  },
  calloutText: {
    fontSize: 12,
    color: "#78350f",
    lineHeight: 17,
  },
  calloutSub: {
    fontSize: 12,
    color: "#78350f",
    lineHeight: 17,
    marginTop: 4,
  },
  boldText: {
    fontWeight: "800",
  },
  statusUnavailableText: {
    fontWeight: "800",
    color: COLORS.danger,
  },
  statusAvailableText: {
    fontWeight: "800",
    color: COLORS.successDark,
  },
  resultsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  loader: {
    marginVertical: SPACING.xl,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
});
