import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Modal } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const cmToFtIn = (cm: number) => {
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
};

export default function ProfileScreen() {
  const { profile, saveProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isMetric, setIsMetric] = useState(false);
  const [weeklyLimitError, setWeeklyLimitError] = useState('');
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);

  // Editing state
  const [editData, setEditData] = useState({
    sex: profile.sex || 'male',
    weight: profile.weight ? Number(profile.weight) : 150,
    height: profile.height ? Number(profile.height) : 170,
    weeklyLimit: profile.weeklyLimit ? String(profile.weeklyLimit) : '14'
  });

  // View state (current profile)
  const currentData = {
    sex: profile.sex || 'male',
    weight: profile.weight ? Number(profile.weight) : 150,
    height: profile.height ? Number(profile.height) : 170,
    weeklyLimit: profile.weeklyLimit || '14'
  };

  const handleEdit = () => {
    setEditData({
      ...currentData,
      weeklyLimit: String(currentData.weeklyLimit)
    });
    setWeeklyLimitError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setWeeklyLimitError('');
  };

  const handleSave = async () => {
    const weeklyNum = parseInt(editData.weeklyLimit);
    if (isNaN(weeklyNum) || weeklyNum < 1) {
      setWeeklyLimitError('Please enter a valid number greater than 0');
      return;
    }

    const weightToSave = isMetric ? editData.weight : Math.round(editData.weight / 2.20462);

    console.log('Saving profile:', {
      sex: editData.sex,
      weight: String(weightToSave),
      height: String(editData.height),
      weeklyLimit: String(weeklyNum)
    });

    await saveProfile({
      sex: editData.sex,
      weight: String(weightToSave),
      height: String(editData.height),
      weeklyLimit: String(weeklyNum)
    });
    setWeeklyLimitError('');
    setIsEditing(false);
  };

  const renderWeightField = () => {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>Weight</Text>
        {isEditing ? (
          <View>
            <TextInput
              style={styles.input}
              value={editData.weight.toString()}
              onChangeText={(value) => {
                setEditData({...editData, weight: Number(value) || 0});
              }}
              keyboardType="number-pad"
              placeholder={`Enter weight in ${isMetric ? 'kg' : 'lbs'}`}
              placeholderTextColor="rgba(255,255,255,0.5)"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
        ) : (
          <Text style={styles.value}>
            {isMetric ? `${currentData.weight} kg` : `${Math.round(currentData.weight * 2.20462)} lbs`}
          </Text>
        )}
      </View>
    );
  };

  const renderSexField = () => (
    <View style={styles.field}>
      <Text style={styles.label}>Sex</Text>
      {isEditing ? (
        <>
          <TouchableOpacity 
            style={styles.pickerTrigger}
            onPress={() => setShowSexPicker(true)}
          >
            <Text style={styles.pickerTriggerText}>
              {editData.sex.charAt(0).toUpperCase() + editData.sex.slice(1)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>

          <Modal
            visible={showSexPicker}
            transparent
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowSexPicker(false)}>
                    <Text style={styles.modalButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowSexPicker(false)}>
                    <Text style={[styles.modalButton, styles.modalDoneButton]}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={editData.sex}
                  onValueChange={(value) => {
                    setEditData({...editData, sex: value});
                  }}
                  style={styles.modalPicker}
                >
                  <Picker.Item label="Male" value="male" color="#000" />
                  <Picker.Item label="Female" value="female" color="#000" />
                  <Picker.Item label="Other" value="other" color="#000" />
                </Picker>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text style={styles.value}>
          {currentData.sex.charAt(0).toUpperCase() + currentData.sex.slice(1)}
        </Text>
      )}
    </View>
  );

  const renderHeightField = () => {
    if (isMetric) {
      return (
        <View style={styles.field}>
          <Text style={styles.label}>Height</Text>
          {isEditing ? (
            <>
              <TouchableOpacity 
                style={styles.pickerTrigger}
                onPress={() => setShowHeightPicker(true)}
              >
                <Text style={styles.pickerTriggerText}>{editData.height} cm</Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>

              <Modal
                visible={showHeightPicker}
                transparent
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowHeightPicker(false)}>
                        <Text style={styles.modalButton}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setShowHeightPicker(false)}>
                        <Text style={[styles.modalButton, styles.modalDoneButton]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <Picker
                      selectedValue={String(editData.height)}
                      onValueChange={(value) => setEditData({...editData, height: Number(value)})}
                    >
                      {Array.from({length: 81}, (_, i) => i + 140).map(cm => (
                        <Picker.Item key={cm} label={`${cm} cm`} value={String(cm)} color="#000" />
                      ))}
                    </Picker>
                  </View>
                </View>
              </Modal>
            </>
          ) : (
            <Text style={styles.value}>{currentData.height} cm</Text>
          )}
        </View>
      );
    }

    // Imperial height picker
    const feet = Math.floor(editData.height / 30.48);
    const inches = Math.round((editData.height - (feet * 30.48)) / 2.54);

    return (
      <View style={styles.field}>
        <Text style={styles.label}>Height</Text>
        {isEditing ? (
          <>
            <TouchableOpacity 
              style={styles.pickerTrigger}
              onPress={() => setShowHeightPicker(true)}
            >
              <Text style={styles.pickerTriggerText}>{cmToFtIn(editData.height)}</Text>
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>

            <Modal
              visible={showHeightPicker}
              transparent
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowHeightPicker(false)}>
                      <Text style={styles.modalButton}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowHeightPicker(false)}>
                      <Text style={[styles.modalButton, styles.modalDoneButton]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dualPickerContainer}>
                    <View style={styles.dualPicker}>
                      <Picker
                        selectedValue={String(feet)}
                        onValueChange={(value) => {
                          const newHeight = (Number(value) * 30.48) + (inches * 2.54);
                          setEditData({...editData, height: Math.round(newHeight)});
                        }}
                      >
                        {Array.from({length: 4}, (_, i) => i + 4).map(ft => (
                          <Picker.Item key={ft} label={`${ft} ft`} value={String(ft)} color="#000" />
                        ))}
                      </Picker>
                    </View>
                    <View style={styles.dualPicker}>
                      <Picker
                        selectedValue={String(inches)}
                        onValueChange={(value) => {
                          const newHeight = (feet * 30.48) + (Number(value) * 2.54);
                          setEditData({...editData, height: Math.round(newHeight)});
                        }}
                      >
                        {Array.from({length: 12}, (_, i) => i).map(inch => (
                          <Picker.Item key={inch} label={`${inch} in`} value={String(inch)} color="#000" />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <Text style={styles.value}>{cmToFtIn(currentData.height)}</Text>
        )}
      </View>
    );
  };

  const renderWeeklyLimitField = () => (
    <View style={[styles.field, { marginBottom: Platform.OS === 'ios' ? 100 : 20 }]}>
      <Text style={styles.label}>Weekly Limit</Text>
      {isEditing ? (
        <View>
          <TextInput
            style={[styles.input, weeklyLimitError ? styles.inputError : null]}
            value={editData.weeklyLimit}
            onChangeText={(value) => {
              setEditData({...editData, weeklyLimit: value});
              setWeeklyLimitError('');
            }}
            keyboardType="number-pad"
            placeholder="Enter weekly drink limit"
            placeholderTextColor="rgba(255,255,255,0.5)"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
          {weeklyLimitError ? (
            <Text style={styles.errorText}>{weeklyLimitError}</Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.value}>{currentData.weeklyLimit} drinks</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color={Colors.dark.tint} />
            </View>
            
            {!isEditing ? (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={24} color="#4facfe" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={handleCancel}
                >
                  <Ionicons name="close" size={24} color="#ff4444" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleSave}
                >
                  <Ionicons name="checkmark" size={24} color="#fff" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity 
              style={styles.unitToggle}
              onPress={() => setIsMetric(!isMetric)}
            >
              <Text style={styles.unitToggleText}>
                Switch to {isMetric ? 'Imperial' : 'Metric'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderSexField()}
            {renderWeightField()}
            {renderHeightField()}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drink Limits</Text>
            {renderWeeklyLimitField()}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79,172,254,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.dark.tint,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,68,68,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#ff4444',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  unitToggle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  unitToggleText: {
    color: '#fff',
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: Colors.dark.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    color: Colors.dark.tint,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: Platform.OS === 'ios' ? '#fff' : 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    ...(Platform.OS === 'ios' && {
      height: 48,
      justifyContent: 'center',
    }),
  },
  picker: {
    height: Platform.OS === 'ios' ? 48 : 50,
    ...(Platform.OS === 'ios' && {
      marginTop: -6,
      marginBottom: -6,
    }),
  },
  slider: {
    width: '100%',
    height: 40,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  heightPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  heightPicker: {
    flex: 1,
  },
  pickerTrigger: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pickerTriggerText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalButton: {
    color: '#007AFF',
    fontSize: 17,
  },
  modalDoneButton: {
    fontWeight: '600',
  },
  modalPicker: {
    height: 200,
  },
  dualPickerContainer: {
    flexDirection: 'row',
  },
  dualPicker: {
    flex: 1,
    height: 200,
  },
});
