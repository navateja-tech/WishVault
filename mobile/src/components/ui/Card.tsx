import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'flat' | 'elevated' | 'bordered';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'bordered',
  className = '',
  style,
  ...props
}) => {
  let cardStyles = 'bg-white rounded-2xl p-5 ';

  switch (variant) {
    case 'bordered':
      cardStyles += 'border border-gray-100 shadow-sm shadow-gray-100 ';
      break;
    case 'elevated':
      cardStyles += 'shadow-md shadow-pink-100/50 border border-pink-50/50 ';
      break;
    case 'flat':
      cardStyles += 'bg-gray-50 border border-gray-100 ';
      break;
  }

  return (
    <View className={`${cardStyles} ${className}`} style={style} {...props}>
      {children}
    </View>
  );
};
