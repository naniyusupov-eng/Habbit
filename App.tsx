import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, FlatList, Platform } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: "Habbit helps me build better habits",
    subtitle: "Stay consistent with your goals using Habbit's smart habit reminders and easy-to-use tools."
  },
  {
    id: 2,
    title: "Track your progress easily",
    subtitle: "Visualize your journey with beautiful charts and stay motivated with streak tracking."
  },
  {
    id: 3,
    title: "Stay motivated every day",
    subtitle: "Join a community of like-minded people and achieve more together."
  }
];

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'onboarding'>('welcome');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Wait for 1.5 seconds, then fade out the splash screen
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsAppReady(true));
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleLetsGo = () => {
    setCurrentScreen('onboarding');
  };

  const handleContinue = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentSlideIndex + 1,
        animated: true
      });
    } else {
      console.log("Onboarding finished");
    }
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== currentSlideIndex) {
      setCurrentSlideIndex(roundIndex);
    }
  };

  const renderWelcome = () => (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Habbit</Text>
        <Text style={styles.subtitle}>Starting today, let's build better habits and achieve your goals together.</Text>
      </View>

      {/* Absolute Footer to match Onboarding exactly */}
      <View style={styles.footerContainer}>
        {/* Invisible dots to keep layout height identical */}
        <View style={[styles.paginationContainer, { opacity: 0 }]}>
          <View style={styles.paginationDot} />
        </View>
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleLetsGo}>
          <Text style={styles.buttonText}>Let's go!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOnboardingItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => (
    <View style={{ width: width, alignItems: 'center', justifyContent: 'flex-start' }}>
      {/* Top Section: iPhone Mockup */}
      <View style={styles.mockupContainer}>
        <View style={styles.iphoneMockup}>
          <View style={styles.iphoneDynamicIsland} />
          <View style={styles.iphoneScreen}>
            {/* Mockup Dynamic Content */}
            <View style={styles.mockupHeader} />

            {index === 0 && (
              <>
                <View style={[styles.mockupRow, { width: '60%' }]} />
                <View style={[styles.mockupRow, { width: '80%', marginTop: 20 }]} />
                <View style={[styles.mockupCard, { marginTop: 40 }]} />
                <View style={styles.mockupCard} />
              </>
            )}
            {index === 1 && (
              <>
                <View style={[styles.mockupGraph]} />
                <View style={[styles.mockupRow, { width: '90%', marginTop: 20 }]} />
                <View style={[styles.mockupRow, { width: '70%' }]} />
              </>
            )}
            {index === 2 && (
              <>
                <View style={[styles.mockupCircle]} />
                <View style={[styles.mockupRow, { width: '50%', alignSelf: 'center', marginTop: 20 }]} />
              </>
            )}
          </View>
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.onboardingContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const renderOnboarding = () => (
    <View style={styles.container}>
      {/* Scrollable Slides */}
      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderOnboardingItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
        />
      </View>

      {/* Fixed Footer with Dots and Button */}
      <View style={styles.footerContainer}>
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlideIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {currentScreen === 'welcome' ? renderWelcome() : renderOnboarding()}
      {!isAppReady && (
        <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
          <Text style={styles.splashLogo}>Habbit</Text>
        </Animated.View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

// 78mm width / 163mm height ~= 0.4785 aspect ratio
const MOCKUP_ASPECT_RATIO = 78 / 163;
const MOCKUP_WIDTH = width * 0.55; // Smaller width as requested

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  splashLogo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Updated text styles
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.35,
    textAlign: 'center',
    marginBottom: 12, // Standard spacing
    marginTop: 30, // Space from mockup
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
  },

  // Layout Styles - UNIFIED FOR BOTH SCREENS
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30, // Safe area considerations
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 24, // Matching styling
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.41,
  },

  // Mockup Styles
  mockupContainer: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iphoneMockup: {
    width: MOCKUP_WIDTH,
    aspectRatio: MOCKUP_ASPECT_RATIO,
    backgroundColor: '#1C1C1E',
    borderRadius: 35,
    padding: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iphoneDynamicIsland: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    width: '30%',
    height: 20,
    backgroundColor: '#000',
    borderRadius: 15,
    zIndex: 2,
  },
  iphoneScreen: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    padding: 12,
    paddingTop: 40,
  },

  // Mockup Inner Content
  mockupHeader: {
    height: 14,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    width: '40%',
    marginBottom: 20,
  },
  mockupRow: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 10,
    width: '100%',
  },
  mockupCard: {
    height: 50,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 12,
  },
  mockupGraph: {
    height: 90,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    marginBottom: 16,
  },
  mockupCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5E5EA',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 10,
  },

  onboardingContent: {
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 20, // Add explicit margin to separate form text
    // Removed bottom padding since footer is absolute and we need space in FlatList content if scoll is needed, 
    // but layout looks static enough for now.
    paddingBottom: 150, // Keep safe space for scroll
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Space between dots and button
    height: 10, // Fixed height to prevent layout shift
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 16,
  },
});
