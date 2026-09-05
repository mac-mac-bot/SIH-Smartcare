import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { LanguageCode, SyncMetadata } from "../types";
import { TRANSLATIONS } from "../services/translations";
import {
  getStoredLanguage,
  saveStoredLanguage,
  getStoredApiUrl,
  saveStoredApiUrl,
  getSyncMetadata,
} from "../services/database";
import { LanguageSelector } from "../components/LanguageSelector";
import { triggerMicroDeltaSync } from "../services/sync";
import { SyncBadge } from "../components/SyncBadge";

export default function SettingsScreen() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [apiUrl, setApiUrl] = useState("http://localhost:3000");
  const [syncMeta, setSyncMeta] = useState<SyncMetadata>({
    lastSyncDate: "Never",
    payloadBytes: 1840,
    pendingRecordsCount: 0,
    isOnline: true,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getStoredLanguage().then(setLanguage);
    getStoredApiUrl().then(setApiUrl);
    getSyncMetadata().then(setSyncMeta);
  }, []);

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    saveStoredLanguage(lang);
  };

  const handleSaveApiUrl = async () => {
    await saveStoredApiUrl(apiUrl.trim());
    Alert.alert("API Endpoint Saved", `SmartCare will connect to: ${apiUrl.trim()}`);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const meta = await triggerMicroDeltaSync();
    setSyncMeta(meta);
    setIsSyncing(false);
    Alert.alert(
      "Micro-Delta Sync Complete",
      meta.isOnline
        ? `Transferred ${meta.payloadBytes} bytes. Local facility registry is up to date.`
        : "Backend server could not be reached. Local cached facilities will remain active."
    );
  };

  const t = TRANSLATIONS[language];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.tabSettings}</Text>
        <Text style={styles.subtitle}>Preferences, Network & Offline Sync</Text>
      </View>

      {/* Language Selection Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="language" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{t.selectLanguage}</Text>
        </View>
        <Text style={styles.cardDesc}>
          Select your preferred interface language. Supports full Tamil and Hindi Unicode rendering.
        </Text>
        <View style={styles.langSelectorWrapper}>
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={handleLanguageChange}
          />
        </View>
      </View>

      {/* Micro-Delta Sync Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="sync" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Micro-Delta Synchronization</Text>
        </View>
        <Text style={styles.cardDesc}>{t.microDeltaBytes}</Text>
        <SyncBadge
          metadata={syncMeta}
          isSyncing={isSyncing}
          onPressSync={handleManualSync}
        />
      </View>

      {/* Backend API Configuration (LAN IP guide for Expo Go physical testing) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="server-network" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{t.apiConfigTitle}</Text>
        </View>
        <Text style={styles.cardDesc}>{t.apiEndpointDesc}</Text>

        <View style={styles.ipNoticeBox}>
          <Ionicons name="information-circle" size={16} color="#0284c7" />
          <Text style={styles.ipNoticeText}>
            IMPORTANT: When testing with Expo Go on a physical phone, "localhost" refers to the phone itself. Set this to your computer's local Wi-Fi IP address (e.g. http://192.168.1.105:8000 or :3000).
          </Text>
        </View>

        <TextInput
          style={styles.apiInput}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.x.x:8000"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.saveApiBtn}
          onPress={handleSaveApiUrl}
          activeOpacity={0.85}
        >
          <Text style={styles.saveApiBtnText}>Save API Endpoint</Text>
        </TouchableOpacity>
      </View>

      {/* About SmartCare Tamil Nadu */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>{t.aboutSmartCare}</Text>
        </View>
        <Text style={styles.aboutText}>{t.aboutDesc}</Text>
        <View style={styles.districtTag}>
          <Text style={styles.districtTagText}>
            Piloted across Tirunelveli & Tenkasi Districts, Tamil Nadu
          </Text>
        </View>
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  langSelectorWrapper: {
    marginTop: SPACING.xs,
  },
  ipNoticeBox: {
    flexDirection: "row",
    backgroundColor: "#f0f9ff",
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: "#bae6fd",
    marginBottom: SPACING.sm,
    gap: 6,
  },
  ipNoticeText: {
    fontSize: 11,
    color: "#0369a1",
    lineHeight: 15,
    flex: 1,
  },
  apiInput: {
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  saveApiBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  saveApiBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  aboutText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  districtTag: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  districtTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
});
