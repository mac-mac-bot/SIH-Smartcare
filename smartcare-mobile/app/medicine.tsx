import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { Facility, LanguageCode, MedicineItem } from "../types";
import { TRANSLATIONS } from "../services/translations";
import { getStoredFacilities, getStoredLanguage } from "../services/database";
import { StatusBadge } from "../components/StatusBadge";
import { formatDistance } from "../services/location";

interface GroupedMedicine {
  generic: string;
  name: string;
  category: string;
  availabilities: {
    facility: Facility;
    item: MedicineItem;
  }[];
}

export default function MedicineScreen() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    getStoredLanguage().then(setLanguage);
    getStoredFacilities().then(setFacilities);
  }, []);

  const t = TRANSLATIONS[language];

  // Aggregate medicines across all facilities
  const allMeds: GroupedMedicine[] = [];
  facilities.forEach((fac) => {
    (fac.medicines || []).forEach((med) => {
      let group = allMeds.find(
        (g) => g.generic.toLowerCase() === med.generic.toLowerCase()
      );
      if (!group) {
        group = {
          generic: med.generic,
          name: med.name,
          category: med.category || "General Medicine",
          availabilities: [],
        };
        allMeds.push(group);
      }
      group.availabilities.push({ facility: fac, item: med });
    });
  });

  const categories = [
    "ALL",
    ...Array.from(new Set(allMeds.map((m) => m.category))),
  ];

  const filteredMeds = allMeds.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.generic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "ALL" || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.tabMedicine}</Text>
        <Text style={styles.subtitle}>
          Track essential medicine availability across public hospitals & PHCs
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t.medicineSearchPlaceholder}
          placeholderTextColor={COLORS.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm("")}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryChip,
                isSelected ? styles.categoryChipActive : styles.categoryChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected ? styles.categoryChipTextActive : styles.categoryChipTextInactive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Grouped Medicine Results */}
      {filteredMeds.map((group) => {
        const inStockCount = group.availabilities.filter(
          (a) => a.item.status === "IN_STOCK"
        ).length;

        return (
          <View key={group.generic} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={styles.medIconBox}>
                <MaterialCommunityIcons name="pill" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.groupTitleCol}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupGeneric}>
                  Generic: {group.generic} • {group.category}
                </Text>
              </View>
            </View>

            <View style={styles.stockSummaryRow}>
              <Text style={styles.stockSummaryText}>
                Available at {inStockCount} of {group.availabilities.length} public facilities
              </Text>
            </View>

            {/* Facility Availability Breakdown */}
            <View style={styles.facilityList}>
              {group.availabilities.map(({ facility, item }) => {
                const facName =
                  language === "ta" && facility.tamilName
                    ? facility.tamilName
                    : facility.name;

                return (
                  <View key={facility.id} style={styles.facRow}>
                    <View style={styles.facInfoCol}>
                      <Text style={styles.facName} numberOfLines={1}>
                        {facName}
                      </Text>
                      <Text style={styles.facSub}>
                        {facility.taluk} • {formatDistance(facility.distance_km)}
                        {item.stock !== undefined && ` • ${item.stock} in stock`}
                      </Text>
                    </View>

                    <View style={styles.facActionCol}>
                      <StatusBadge status={item.status} size="sm" />
                      <TouchableOpacity
                        style={styles.facCallSmall}
                        onPress={() => Linking.openURL(`tel:${facility.phone}`).catch(() => {})}
                      >
                        <Ionicons name="call" size={12} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
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
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  categoryRow: {
    gap: 6,
    paddingBottom: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipInactive: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  categoryChipTextInactive: {
    color: COLORS.textSecondary,
  },
  groupCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  medIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.primarySurface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  groupTitleCol: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  groupGeneric: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  stockSummaryRow: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  stockSummaryText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  facilityList: {
    gap: SPACING.xs,
  },
  facRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  facInfoCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  facName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  facSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  facActionCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  facCallSmall: {
    backgroundColor: COLORS.primarySurface,
    padding: 6,
    borderRadius: RADIUS.sm,
  },
});
