import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';
import type { OnboardingStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type SlidesNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Slides'>;

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  // Drop real photography into src/assets/onboarding/ and swap these in.
  // Until then each slide falls back to its gradient below.
  image: number | null;
  gradient: [string, string, string];
};

const slides: Slide[] = [
  {
    id: 'reactions',
    eyebrow: 'GHANA PREMIER LEAGUE',
    title: 'Reactions',
    description: 'React to every GPL moment in real time.',
    image: require('../../assets/onboarding/slide-1-stars.jpg'),
    gradient: [Colors.black, Colors.surface2, Colors.black],
  },
  {
    id: 'fantasy',
    eyebrow: 'LIVE THE MATCH',
    title: 'Fantasy',
    description: 'Build your dream GPL squad and compete every week.',
    image: require('../../assets/onboarding/slide-2-pitch.jpg'),
    gradient: [Colors.surface, Colors.black, Colors.surface2],
  },
  {
    id: 'predictions',
    eyebrow: 'INSIDE THE CLUB',
    title: 'Predictions',
    description: 'Predict match results and climb the leaderboard.',
    image: require('../../assets/onboarding/slide-3-feed.jpg'),
    gradient: [Colors.black, Colors.surface, Colors.black],
  },
];

export default function OnboardingSlides() {
  const navigation = useNavigation<SlidesNavigationProp>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setCurrentIndex(clamped);
  };

  const handleGetStarted = () => {
    navigation.navigate('RegisterLogin');
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(nextIndex);
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const isLastSlide = currentIndex === slides.length - 1;

  const renderBackdrop = (slide: Slide, children: React.ReactNode) => {
    if (slide.image) {
      return (
        <ImageBackground source={slide.image} style={styles.slideBackdrop} resizeMode="cover">
          <LinearGradient
            colors={['rgba(10,10,10,0.1)', Colors.black]}
            style={StyleSheet.absoluteFill}
          />
          {children}
        </ImageBackground>
      );
    }
    return (
      <LinearGradient colors={slide.gradient} style={styles.slideBackdrop}>
        {children}
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.wordmark}>
          GPL<Text style={{ color: colors.yellow }}>Live</Text>
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterLogin')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={slides}
        ref={listRef}
        style={styles.list}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) =>
          renderBackdrop(
            item,
            <View style={styles.slideTextBlock}>
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )
        }
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          {currentIndex > 0 ? (
            <TouchableOpacity onPress={() => goTo(currentIndex - 1)} hitSlop={12}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {isLastSlide ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <Text style={styles.primaryButtonText}>Enter GPLLive  →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={() => goTo(currentIndex + 1)}>
              <Text style={styles.primaryButtonText}>Next  →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    list: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    wordmark: {
      fontFamily: fonts.display,
      fontWeight: '800',
      fontSize: 16,
      color: colors.white,
    },
    skipText: { color: colors.yellow, fontSize: 14, fontWeight: '700' },
    // Slide backdrops are full-bleed marketing photos with a dark scrim for
    // text legibility - this stays visually dark regardless of app theme
    // (like a splash screen), so these colors are intentionally NOT themed.
    slideBackdrop: {
      width,
      flex: 1,
      justifyContent: 'flex-end',
    },
    slideTextBlock: {
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    eyebrow: {
      color: colors.yellow,
      fontFamily: fonts.bodySemiBold,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 2,
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      fontFamily: fonts.display,
      color: colors.white,
      textTransform: 'uppercase',
      lineHeight: 32,
      marginBottom: 14,
    },
    description: {
      fontSize: 15,
      color: colors.grey1,
      lineHeight: 22,
      maxWidth: '90%',
    },
    footer: { paddingHorizontal: 24, paddingTop: 24 },
    pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.grey2,
      marginHorizontal: 4,
    },
    dotActive: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.yellow,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backText: { color: colors.grey1, fontSize: 14, fontWeight: '600' },
    primaryButton: {
      backgroundColor: colors.yellow,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: radius.button,
      alignItems: 'center',
      marginLeft: 'auto',
    },
    primaryButtonText: {
      color: '#000000',
      fontWeight: '800',
      fontFamily: fonts.display,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: 0.06,
    },
  });
}
