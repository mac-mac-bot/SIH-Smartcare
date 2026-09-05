import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { LanguageCode, SyncMetadata } from "../types";
import { TRANSLATIONS } from "../services/translations";
import { LanguageSelector } from "../components/LanguageSelector";
import { SyncBadge } from "../components/SyncBadge";
import { getStoredLanguage, saveStoredLanguage, getSyncMetadata } from "../services/database";
import { triggerMicroDeltaSync } from "../services/sync";

export default function RootLayout() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [syncMeta, setSyncMeta] = useState<SyncMetadata>({
    lastSyncDate: "Just now",
    payloadBytes: 1840,
    pendingRecordsCount: 0,
    isOnline: true,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getStoredLanguage().then(setLanguage);
    getSyncMetadata().then(setSyncMeta);
  }, []);

  const handleSelectLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    saveStoredLanguage(lang);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const updated = await triggerMicroDeltaSync();
    setSyncMeta(updated);
    setIsSyncing(false);
  };

  const t = TRANSLATIONS[language];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* Global Brand Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="hospital-box" size={20} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.appName}>{t.appName}</Text>
            <Text style={styles.appSub}>{t.appSubtitle}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <SyncBadge
            metadata={syncMeta}
            isSyncing={isSyncing}
            onPressSync={handleManualSync}
            compact
          />
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={handleSelectLanguage}
            compact
          />
        </View>
      </View>

      {/* Main Bottom Tabs */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t.tabHome,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="find-care"
          options={{
            title: t.tabFindCare,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="medicine"
          options={{
            title: t.tabMedicine,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="pill" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="health-record"
          options={{
            title: t.tabHealthRecord,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="emergency"
          options={{
            title: t.tabEmergency,
            tabBarLabelStyle: [styles.tabLabel, { color: COLORS.danger, fontWeight: "900" }],
            tabBarIcon: ({ size }) => (
              <View style={styles.emergencyTabBadge}>
                <Ionicons name="alert" size={16} color={COLORS.white} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: t.tabSettings,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Hidden Stack Route for facility details */}
        <Tabs.Screen
          name="facility/[id]"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  topHeader: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  appSub: {
    color: "#ccfbf1",
    fontSize: 10,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  emergencyTabBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
  },
});
