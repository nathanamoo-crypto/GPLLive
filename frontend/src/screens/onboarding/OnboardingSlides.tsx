import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import type { OnboardingStackParamList } from '../../navigation/types';

const slides = [
  {
    id: 'reactions',
    title: 'Reactions',
    description: 'React to every GPL moment in real time.',
  },
  {
    id: 'fantasy',
    title: 'Fantasy',
    description: 'Build your dream GPL squad and compete every week.',
  },
  {
    id: 'predictions',
    title: 'Predictions',
    description: 'Predict match results and climb the leaderboard.',
  },
];

const { width } = Dimensions.get('window');

type SlidesNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Slides'>;

export default function OnboardingSlides() {
  const navigation = useNavigation<SlidesNavigationProp>();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof slides)[number]>>(null);

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
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
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.illustration}>
              <Text style={styles.illustrationLabel}>{item.title}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
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

        {isLastSlide ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={goNext}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  list: { flex: 1 },
  header: { alignItems: 'flex-end', paddingHorizontal: 16 },
  skipText: { color: Colors.yellow, fontSize: 14, fontWeight: '700' },
  slide: { width, paddingHorizontal: 24, alignItems: 'center' },
  illustration: {
    width: width - 72,
    height: 300,
    backgroundColor: Colors.surface2,
    borderRadius: 24,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  illustrationLabel: {
    fontSize: 42,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.yellow,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: fonts.display,
    textAlign: 'center',
    color: Colors.white,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  description: {
    fontSize: 16,
    color: Colors.grey1,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 24, paddingTop: 24 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey2,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.yellow,
  },
  primaryButton: {
    backgroundColor: Colors.yellow,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: 'center',
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
