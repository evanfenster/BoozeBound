import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SimpleDrinkVisualizationProps {
  weeklyDrinks: number;
  weeklyLimit: number;
}

export function SimpleDrinkVisualization({ weeklyDrinks, weeklyLimit }: SimpleDrinkVisualizationProps) {
  const remainingPercentage = Math.max(0, Math.min(100, ((weeklyLimit - weeklyDrinks) / weeklyLimit) * 100));
  const isOverLimit = weeklyDrinks > weeklyLimit;
  
  // Calculate fill height - start from bottom
  const fillPercentage = 100 - remainingPercentage;

  return (
    <View style={styles.container}>
      <View style={styles.glassContainer}>
        {/* The empty glass */}
        <View style={styles.glass}>
          {/* The fill level */}
          <View 
            style={[
              styles.fill, 
              { 
                height: `${fillPercentage}%`,
                backgroundColor: isOverLimit ? '#ff4444' : '#ffd700',
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassContainer: {
    marginVertical: 20,
  },
  glass: {
    width: 100,
    height: 150,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.9,
  },
});
