import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { HealthRecord, LanguageCode } from "../types";
import { TRANSLATIONS } from "../services/translations";
import {
  getHealthRecords,
  saveHealthRecord,
  getStoredLanguage,
} from "../services/database";

export default function HealthRecordScreen() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [patientName, setPatientName] = useState("Murugesan K.");
  const [age, setAge] = useState("52");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [facilityName, setFacilityName] = useState("Primary Health Centre, Cheranmahadevi");
  const [serviceReceived, setServiceReceived] = useState("Blood Pressure Screening");
  const [prescribedMeds, setPrescribedMeds] = useState("Amlodipine 5mg");
  const [notes, setNotes] = useState("BP 128/84. Follow up next month.");

  useEffect(() => {
    getStoredLanguage().then(setLanguage);
    getHealthRecords().then(setRecords);
  }, []);

  const handleSave = async () => {
    if (!serviceReceived.trim()) {
      Alert.alert("Required Field", "Please enter the service or treatment received.");
      return;
    }

    const newRecord: HealthRecord = {
      id: `rec-${Date.now()}`,
      patientName: patientName.trim() || "Patient",
      age: parseInt(age) || undefined,
      bloodGroup: bloodGroup.trim() || undefined,
      allergies: "None reported",
      conditions: "Hypertension",
      visitDate: new Date().toISOString().split("T")[0],
      facilityName: facilityName.trim() || "Public Health Center",
      serviceReceived: serviceReceived.trim(),
      prescribedMedicines: prescribedMeds.split(",").map((s) => s.trim()).filter(Boolean),
      notes: notes.trim(),
      status: "PENDING_SYNC",
      createdAt: new Date().toISOString(),
    };

    await saveHealthRecord(newRecord);
    setRecords([newRecord, ...records]);
    setIsModalOpen(false);
    // Reset form
    setServiceReceived("");
    setPrescribedMeds("");
    setNotes("");
  };

  const t = TRANSLATIONS[language];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title & Offline Guarantee Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t.myHealthRecordTitle}</Text>
          <View style={styles.offlinePill}>
            <Ionicons name="shield-checkmark" size={12} color={COLORS.successDark} />
            <Text style={styles.offlinePillText}>Offline Storage Active</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{t.healthRecordSubtitle}</Text>
      </View>

      {/* Patient Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={24} color={COLORS.white} />
          </View>
          <View style={styles.profileTextCol}>
            <Text style={styles.profileName}>{patientName}</Text>
            <Text style={styles.profileSub}>
              Age: {age} • Blood: {bloodGroup} • Rural Citizen ID: TN-8492
            </Text>
          </View>
        </View>

        <View style={styles.medicalTagsRow}>
          <View style={styles.medTag}>
            <Text style={styles.medTagLabel}>Allergies: </Text>
            <Text style={styles.medTagVal}>None Reported</Text>
          </View>
          <View style={styles.medTag}>
            <Text style={styles.medTagLabel}>Conditions: </Text>
            <Text style={styles.medTagVal}>Hypertension</Text>
          </View>
        </View>
      </View>

      {/* Action Button: Add Record */}
      <TouchableOpacity
        style={styles.addRecordBtn}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle" size={18} color={COLORS.white} />
        <Text style={styles.addRecordBtnText}>{t.addRecordBtn}</Text>
      </TouchableOpacity>

      {/* Visit History Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.visitHistory} ({records.length})</Text>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={40} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>{t.noRecordsYet}</Text>
        </View>
      ) : (
        records.map((rec) => {
          const isPending = rec.status === "PENDING_SYNC";
          return (
            <View key={rec.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.recordFacilityCol}>
                  <Text style={styles.recordFacility}>{rec.facilityName}</Text>
                  <Text style={styles.recordDate}>Visit Date: {rec.visitDate}</Text>
                </View>

                <View
                  style={[
                    styles.syncBadge,
                    isPending ? styles.syncBadgePending : styles.syncBadgeDone,
                  ]}
                >
                  <Ionicons
                    name={isPending ? "cloud-upload-outline" : "checkmark-done"}
                    size={12}
                    color={isPending ? "#b45309" : COLORS.successDark}
                  />
                  <Text
                    style={[
                      styles.syncBadgeText,
                      isPending ? styles.syncBadgeTextPending : styles.syncBadgeTextDone,
                    ]}
                  >
                    {isPending ? t.pendingSyncBadge : t.syncedBadge}
                  </Text>
                </View>
              </View>

              <View style={styles.recordBody}>
                <Text style={styles.recordService}>
                  <Text style={styles.bold}>Treatment: </Text>
                  {rec.serviceReceived}
                </Text>

                {rec.prescribedMedicines && rec.prescribedMedicines.length > 0 && (
                  <Text style={styles.recordMeds}>
                    <Text style={styles.bold}>Medicines: </Text>
                    {rec.prescribedMedicines.join(", ")}
                  </Text>
                )}

                {rec.notes && (
                  <Text style={styles.recordNotes}>
                    <Text style={styles.bold}>Doctor's Advice: </Text>
                    {rec.notes}
                  </Text>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* Add Consultation Record Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Healthcare Visit</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.inputLabel}>Facility Name</Text>
              <TextInput
                style={styles.modalInput}
                value={facilityName}
                onChangeText={setFacilityName}
                placeholder="e.g. Primary Health Centre, Cheranmahadevi"
              />

              <Text style={styles.inputLabel}>Service / Procedure Received</Text>
              <TextInput
                style={styles.modalInput}
                value={serviceReceived}
                onChangeText={setServiceReceived}
                placeholder="e.g. X-Ray Chest, Blood Test, Fever Consultation"
              />

              <Text style={styles.inputLabel}>Prescribed Medicines (comma separated)</Text>
              <TextInput
                style={styles.modalInput}
                value={prescribedMeds}
                onChangeText={setPrescribedMeds}
                placeholder="e.g. Paracetamol 500mg, Amoxicillin 500mg"
              />

              <Text style={styles.inputLabel}>Doctor's Notes & Advice</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="e.g. Rest for 3 days, drink clean boiled water"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsModalOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>{t.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>{t.saveRecord}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  profileSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  medicalTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  medTag: {
    flexDirection: "row",
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  medTagLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  medTagVal: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  addRecordBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: SPACING.md,
  },
  addRecordBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  recordCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  recordFacilityCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  recordFacility: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  recordDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  syncBadgePending: {
    backgroundColor: "#fef3c7",
  },
  syncBadgeDone: {
    backgroundColor: COLORS.successSurface,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  syncBadgeTextPending: {
    color: "#b45309",
  },
  syncBadgeTextDone: {
    color: COLORS.successDark,
  },
  recordBody: {
    marginTop: SPACING.xs,
    gap: 2,
  },
  recordService: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  recordMeds: {
    fontSize: 12,
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  recordNotes: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  bold: {
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  modalScroll: {
    paddingBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  modalTextArea: {
    height: 72,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.borderLight,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: "800",
  },
});
