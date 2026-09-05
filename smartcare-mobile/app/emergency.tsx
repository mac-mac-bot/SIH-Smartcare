import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { EMERGENCY_CONTACTS } from "../constants/emergency";
import { getCurrentUserLocation, Coordinates } from "../services/location";
import { DEMO_LAT, DEMO_LON } from "../data/demoFacilities";

export default function EmergencyScreen() {
  const [coords, setCoords] = useState<Coordinates>({ latitude: DEMO_LAT, longitude: DEMO_LON });
  const [isLiveGps, setIsLiveGps] = useState(false);

  useEffect(() => {
    getCurrentUserLocation().then((res) => {
      setCoords(res.coords);
      setIsLiveGps(res.isLive);
    });
  }, []);

  const emergencySmsText = `EMERGENCY MEDICAL SOS: Immediate assistance required. GPS Location: ${coords.latitude.toFixed(5)}° N, ${coords.longitude.toFixed(5)}° E (Near Cheranmahadevi/Tirunelveli, Tamil Nadu). Sent via SmartCare-TN.`;

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert("Dialer Error", `Please dial ${number} on your phone.`);
    });
  };

  const handleSendSms = (number: string) => {
    const encoded = encodeURIComponent(emergencySmsText);
    const url = `sms:${number}?body=${encoded}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("SMS Error", "Unable to launch SMS app automatically. Please copy GPS text below.");
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* High-Contrast Emergency Header */}
      <View style={styles.banner}>
        <MaterialCommunityIcons name="alert-decagram" size={36} color={COLORS.white} />
        <Text style={styles.bannerTitle}>EMERGENCY HELPLINES</Text>
        <Text style={styles.bannerSub}>
          Government of Tamil Nadu 24/7 Immediate Response Services
        </Text>
      </View>

      {/* GPS Location Card */}
      <View style={styles.gpsCard}>
        <View style={styles.gpsTop}>
          <View style={styles.gpsIconCircle}>
            <Ionicons name="navigate" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.gpsInfo}>
            <Text style={styles.gpsTitle}>
              {isLiveGps ? "Live GPS Coordinates" : "Current Coordinates (Demo Baseline)"}
            </Text>
            <Text style={styles.gpsCoords}>
              {coords.latitude.toFixed(5)}° N, {coords.longitude.toFixed(5)}° E
            </Text>
            <Text style={styles.gpsNotice}>
              Provide these exact coordinates to 108 ambulance dispatchers.
            </Text>
          </View>
        </View>
      </View>

      {/* Immediate Helplines Grid */}
      <View style={styles.contactsGrid}>
        {EMERGENCY_CONTACTS.map((item) => (
          <View key={item.id} style={styles.contactCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.badge, { backgroundColor: item.accent }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
              <Text style={styles.dialNumber}>{item.number}</Text>
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>
                {item.number === "108"
                  ? "108 Free Ambulance"
                  : item.number === "104"
                  ? "104 Medical Advice"
                  : item.number === "100"
                  ? "100 Police Control"
                  : item.number === "101"
                  ? "101 Fire & Rescue"
                  : item.number === "1091"
                  ? "1091 Women Helpline"
                  : "1098 Childline"}
              </Text>
              <Text style={styles.contactDesc}>
                {item.number === "108"
                  ? "Tamil Nadu GVK EMRI 24/7 Emergency Ambulance"
                  : item.number === "104"
                  ? "Govt Health Advice, Telemedicine & Blood Bank"
                  : item.number === "100"
                  ? "Tamil Nadu State Police Emergency"
                  : item.number === "101"
                  ? "Disaster Management & Fire Service"
                  : "24/7 Safety & Assistance for Women"}
              </Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: item.accent }]}
                onPress={() => handleCall(item.number)}
                activeOpacity={0.85}
              >
                <Ionicons name="call" size={16} color={COLORS.white} />
                <Text style={styles.callBtnText}>Call {item.number}</Text>
              </TouchableOpacity>

              {item.canSms && (
                <TouchableOpacity
                  style={styles.smsBtn}
                  onPress={() => handleSendSms(item.number)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={item.accent} />
                  <Text style={[styles.smsBtnText, { color: item.accent }]}>Send SOS SMS</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Transparent Pre-filled SMS Preview Notice */}
      <View style={styles.smsPreviewBox}>
        <View style={styles.smsHeader}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.smsHeaderTitle}>Pre-Filled SMS Transparency Notice</Text>
        </View>
        <Text style={styles.smsNote}>
          Tapping "Send SOS SMS" launches your phone's native messaging application with your GPS location pre-filled. No SMS is ever sent silently in the background. You review and send it yourself.
        </Text>
        <View style={styles.smsCodeBox}>
          <Text style={styles.smsCodeText}>{emergencySmsText}</Text>
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
  banner: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.elevated,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  bannerSub: {
    color: "#fee2e2",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
  gpsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  gpsTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  gpsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySurface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  gpsInfo: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  gpsCoords: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  gpsNotice: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  contactsGrid: {
    gap: SPACING.md,
  },
  contactCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dialNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  contactInfo: {
    marginBottom: SPACING.md,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  contactDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  callBtn: {
    flex: 1,
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
  smsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: 6,
  },
  smsBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  smsPreviewBox: {
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  smsHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  smsNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  smsCodeBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smsCodeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: "monospace",
  },
});
