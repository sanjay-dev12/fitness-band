import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const HealthRing = ({
  radius = 60,
  strokeWidth = 10,
  color = '#FF4B4B',
  percentage = 70,
  icon,
  label,
  value,
  unit,
  pulse = false,
}) => {
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;
  
  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    animatedProgress.value = withTiming(percentage / 100, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    if (pulse) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 300 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [percentage, pulse]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - animatedProgress.value),
    };
  });

  const animatedPulseStyle = useAnimatedProps(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[pulse && animatedPulseStyle, { alignItems: 'center', justifyContent: 'center' }]}>
        <Svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
          {/* Background Circle */}
          <Circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            stroke={`${color}33`} // 20% opacity background
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground Progress Circle */}
          <AnimatedCircle
            cx={radius}
            cy={radius}
            r={innerRadius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFillObject, styles.centerContent]}>
          {icon}
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.unitText}>{unit}</Text>
        </View>
      </Animated.View>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  unitText: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
});

export default HealthRing;
