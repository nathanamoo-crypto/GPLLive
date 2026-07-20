import React from 'react';
import { View, StyleSheet } from 'react-native';

interface JerseyIconProps {
  /** Fill color - pass the club's color so the jersey reads as "their kit"
   *  rather than a generic neutral icon. */
  color: string;
  size?: number;
  /** Goalkeepers get a long-sleeve cut; outfield players get a short-sleeve
   *  cut - built as plain Views (body + two angled sleeves + a collar trim)
   *  rather than an emoji/generic icon glyph, and without pulling in a new
   *  SVG dependency the project doesn't have installed yet. */
  isGoalkeeper?: boolean;
}

export default function JerseyIcon({ color, size = 24, isGoalkeeper = false }: JerseyIconProps) {
  const bodyWidth = size * 0.52;
  const bodyHeight = size * 0.58;
  const sleeveWidth = size * 0.24;
  const sleeveHeight = isGoalkeeper ? size * 0.48 : size * 0.3;
  const collarWidth = size * 0.22;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.sleeve,
          {
            width: sleeveWidth,
            height: sleeveHeight,
            backgroundColor: color,
            top: size * 0.16,
            left: size * 0.04,
            borderRadius: sleeveWidth * 0.4,
            transform: [{ rotate: '30deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.sleeve,
          {
            width: sleeveWidth,
            height: sleeveHeight,
            backgroundColor: color,
            top: size * 0.16,
            right: size * 0.04,
            borderRadius: sleeveWidth * 0.4,
            transform: [{ rotate: '-30deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.body,
          {
            width: bodyWidth,
            height: bodyHeight,
            backgroundColor: color,
            borderTopLeftRadius: bodyWidth * 0.22,
            borderTopRightRadius: bodyWidth * 0.22,
            borderBottomLeftRadius: bodyWidth * 0.12,
            borderBottomRightRadius: bodyWidth * 0.12,
          },
        ]}
      />
      <View
        style={[
          styles.collar,
          {
            width: collarWidth,
            height: collarWidth * 0.45,
            borderBottomLeftRadius: collarWidth,
            borderBottomRightRadius: collarWidth,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    position: 'absolute',
  },
  sleeve: {
    position: 'absolute',
  },
  collar: {
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
