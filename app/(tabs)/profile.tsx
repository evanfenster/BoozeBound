import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, TextInput, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Linking } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const { profile, saveProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [weeklyLimitError, setWeeklyLimitError] = useState('');

  // Editing state
  const [editData, setEditData] = useState({
    weeklyLimit: profile.weeklyLimit ? String(profile.weeklyLimit) : '14'
  });

  // View state (current profile)
  const currentData = {
    weeklyLimit: profile.weeklyLimit || '14'
  };

  const handleEdit = () => {
    setEditData({
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

    await saveProfile({
      weeklyLimit: String(weeklyNum)
    });
    setWeeklyLimitError('');
    setIsEditing(false);
  };

  const handlePrivacyPolicy = useCallback(async () => {
    const url = 'https://sidcareerhaus.wixsite.com/my-site-1';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

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
          contentContainerStyle={[styles.contentContainer, { minHeight: '100%' }]}
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drink Limits</Text>
            {renderWeeklyLimitField()}
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity 
            style={styles.privacyLink} 
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.privacyText}>Privacy Policy</Text>
          </TouchableOpacity>
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
    flexGrow: 1,
    justifyContent: 'space-between',
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
  spacer: {
    flex: 1,
  },
  privacyLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  privacyText: {
    color: Colors.dark.tint,
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});
