declare module 'react-native-liquid-progress' {
  import { ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  interface LiquidProgressProps {
    fill: number;
    size: number;
    backgroundColor?: string;
    frontWaveColor?: string;
    backWaveColor?: string;
    baseColor?: string;
    customStyle?: ViewStyle;
    children?: ReactNode;
  }

  export default function LiquidProgress(props: LiquidProgressProps): JSX.Element;
} 