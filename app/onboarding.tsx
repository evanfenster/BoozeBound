import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const { saveProfile } = useProfile();
  const [sex, setSex] = useState('');
  const [weight, setWeight] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [weeklyLimit, setWeeklyLimit] = useState('');
  const [height, setHeight] = useState('');
  const router = useRouter();

  const onSave = async () => {
    await saveProfile({ sex, weight, weeklyLimit, height });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Profile</Text>
      <Text style={styles.label}>Sex:</Text>
      <TextInput value={sex} onChangeText={setSex} style={styles.input} />
      <Text style={styles.label}>Weight (lbs):</Text>
      <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input}/>
      <Text style={styles.label}>Height (inches):</Text>
      <TextInput value={height} onChangeText={setHeight} keyboardType="numeric" style={styles.input}/>
      <Text style={styles.label}>Daily Limit (drinks):</Text>
      <TextInput value={dailyLimit} onChangeText={setDailyLimit} keyboardType="numeric" style={styles.input}/>
      <Text style={styles.label}>Weekly Limit (drinks):</Text>
      <TextInput value={weeklyLimit} onChangeText={setWeeklyLimit} keyboardType="numeric" style={styles.input}/>
      <Button title="Save" onPress={onSave} />
    </View>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#25292e',
    padding:20
  },
  label:{
    color:'#fff',
    marginBottom:5
  },
  input:{
    borderWidth:1,
    borderColor:'#fff',
    color:'#fff',
    marginBottom:10,
    padding:8
  }
});
