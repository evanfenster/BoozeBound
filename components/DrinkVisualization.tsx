import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G } from 'react-native-svg';

interface DrinkVisualizationProps {
  weeklyDrinks: number;
  weeklyLimit: number;
}

export function DrinkVisualization({ weeklyDrinks, weeklyLimit }: DrinkVisualizationProps) {
  const remainingPercentage = Math.max(0, Math.min(100, ((weeklyLimit - weeklyDrinks) / weeklyLimit) * 100));
  const isOverLimit = weeklyDrinks > weeklyLimit;
  
  // Calculate fill height - start from bottom
  const fillHeight = 220 * (remainingPercentage / 100);
  const fillY = 260 - fillHeight;

  return (
    <View style={styles.container}>
      <View style={styles.glassContainer}>
        <Svg width="200" height="300" viewBox="0 0 200 300">
          <Defs>
            {/* Glass gradient */}
            <LinearGradient id="glassGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="rgba(255,255,255,0.2)" stopOpacity="0.4" />
              <Stop offset="0.5" stopColor="rgba(255,255,255,0.1)" stopOpacity="0.2" />
              <Stop offset="1" stopColor="rgba(255,255,255,0.05)" stopOpacity="0.1" />
            </LinearGradient>

            {/* Liquid gradient */}
            <LinearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={isOverLimit ? '#ff6b6b' : '#ffd700'} stopOpacity="0.9" />
              <Stop offset="1" stopColor={isOverLimit ? '#ff4444' : '#ffa500'} stopOpacity="0.9" />
            </LinearGradient>

            {/* Highlight gradient */}
            <LinearGradient id="highlightGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          <G>
            {/* Glass shape - removed separate base */}
            <Path
              d="M40,40 
                 C40,40 45,30 100,30 
                 C155,30 160,40 160,40
                 L150,270 
                 C150,275 130,275 115,275
                 L85,275
                 C70,275 50,275 50,270
                 Z"
              fill="url(#glassGradient)"
              stroke="#ffffff"
              strokeWidth="1"
            />

            {/* Updated liquid shape - fixed top connection */}
            <Path
              d={`M${45},${fillY}
                  C${45},${fillY} ${50},${fillY} 100,${fillY}
                  C${150},${fillY} ${155},${fillY} ${155},${fillY}
                  L${155},260
                  C${155},270 ${130},270 ${115},270
                  L${85},270
                  C${70},270 ${45},270 ${45},260
                  Z`}
              fill="url(#liquidGradient)"
            />

            {/* Glass highlights remain the same */}
            <Path
              d="M45,50
                 C45,50 50,40 100,40
                 C150,40 155,50 155,50"
              stroke="url(#highlightGradient)"
              strokeWidth="4"
              fill="none"
            />

            {/* Updated liquid surface highlights - adjusted to match */}
            {remainingPercentage > 0 && (
              <Path
                d={`M${45},${fillY}
                    C${45},${fillY} ${50},${fillY} 100,${fillY}
                    C${150},${fillY} ${155},${fillY} ${155},${fillY}`}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                fill="none"
              />
            )}

            {/* Bubbles */}
            {remainingPercentage > 0 && Array.from({ length: 5 }).map((_, i) => (
              <Circle
                key={i}
                cx={70 + Math.random() * 60}
                cy={260 - Math.random() * fillHeight}
                r={1.5 + Math.random() * 2}
                fill="rgba(255,255,255,0.4)"
              />
            ))}
          </G>
        </Svg>
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
}); 