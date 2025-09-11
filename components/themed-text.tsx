import React from 'react';
import { Text, TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  light?: string;
  dark?: string;
};

export function ThemedText(props: ThemedTextProps) {
  const { style, light, dark, ...otherProps } = props;
  const color = useThemeColor({ light, dark }, 'text');

  return <Text style={[{ color }, style]} {...otherProps} />;
}