import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, FlatList, Platform, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Image, Easing } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

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

const OrbitingEmoji = ({ emoji, radius, duration, initialAngle, isReverse }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current; // For initial expansion

  useEffect(() => {
    // Initial expansion from center
    Animated.timing(expandAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.back(1.5)), // "Pop" out effect
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: isReverse
      ? [`${initialAngle}deg`, `${initialAngle - 360}deg`]
      : [`${initialAngle}deg`, `${initialAngle + 360}deg`]
  });

  const counterRotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: isReverse
      ? [`${-initialAngle}deg`, `${-(initialAngle - 360)}deg`]
      : [`${-initialAngle}deg`, `${-(initialAngle + 360)}deg`]
  });

  const translateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -radius] // From 0 (center) to negative radius
  });

  return (
    <Animated.View style={[
      StyleSheet.absoluteFill,
      { justifyContent: 'center', alignItems: 'center', zIndex: -1 },
      { transform: [{ rotate }] }
    ]} pointerEvents="none">
      <Animated.View style={{
        transform: [
          { translateY }, // Animated radius
          { rotate: counterRotate }
        ]
      }}>
        <Text style={{ fontSize: 36, opacity: 1 }}>{emoji}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const FloatingEmojisBackground = () => {
  useEffect(() => {
    // Trigger vibration when emojis pop out
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Config for each emoji
  // Uniform duration to prevent overlapping
  // Radii spread out more (155-200) for separation
  const duration = 20000;
  // Radii increased significantly (180-250 range)
  // Directions mixed
  const data = [
    { emoji: '🧠', radius: 200, duration, angle: 0, isReverse: false },
    { emoji: '💰', radius: 220, duration, angle: 33, isReverse: true },
    { emoji: '⚽', radius: 180, duration, angle: 65, isReverse: false },
    { emoji: '🥗', radius: 210, duration, angle: 98, isReverse: true },
    { emoji: '📚', radius: 240, duration, angle: 130, isReverse: false },
    { emoji: '💡', radius: 190, duration, angle: 163, isReverse: true },
    { emoji: '✈️', radius: 230, duration, angle: 196, isReverse: false },
    { emoji: '🎵', radius: 250, duration, angle: 229, isReverse: true },
    { emoji: '👍', radius: 205, duration, angle: 262, isReverse: false },
    { emoji: '💪', radius: 235, duration, angle: 295, isReverse: true },
    { emoji: '🏋️', radius: 195, duration, angle: 328, isReverse: false },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {data.map((item, index) => (
        <OrbitingEmoji
          key={index}
          emoji={item.emoji}
          radius={item.radius}
          duration={item.duration}
          initialAngle={item.angle}
          isReverse={item.isReverse}
        />
      ))}
    </View>
  );
};

const SelectionCard = ({ option, isSelected, onSelect, cardStyle }: any) => {
  // Animation for background color and text colors
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isSelected ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false // color interpolation requires false
    }).start();
  }, [isSelected]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F2F2F7', '#0a714e']
  });

  const titleColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#000000', '#ffffff']
  });

  const descColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#8E8E93', 'rgba(255,255,255,0.8)']
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8} // "Momiq" effect (soft press)
      onPress={onSelect}
      style={{ width: '100%', marginBottom: 12 }}
    >
      <Animated.View style={[styles.optionCard, { backgroundColor, marginBottom: 0 }, cardStyle]}>
        <View style={styles.optionIconContainer}>
          <Text style={{ fontSize: 22 }}>{option.emoji}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Animated.Text style={[styles.optionTitle, { color: titleColor, marginBottom: option.desc ? 4 : 0 }]}>
            {option.title}
          </Animated.Text>
          {option.desc ? (
            <Animated.Text style={[styles.optionDesc, { color: descColor }]}>
              {option.desc}
            </Animated.Text>
          ) : null}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const TailoringView = ({ onBack, onContinue, progressAnim }: any) => {
  const [step, setStep] = useState<'calculating' | 'done'>('calculating');
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start rotation
    const spin = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    // Blink Dots
    const dotsBlink = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true })
      ])
    );
    dotsBlink.start();

    // Transition after 4s
    const timer = setTimeout(() => {
      setStep('done');
      spin.stop();
      dotsBlink.stop();

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true
      }).start();
    }, 4000);

    return () => {
      clearTimeout(timer);
      spin.stop();
      dotsBlink.stop();
    };
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, { justifyContent: 'space-between' }]}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <View style={styles.backIconShape} />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        </View>

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 100 }}>
          <View style={{ width: 180, height: 180, justifyContent: 'center', alignItems: 'center', marginBottom: 50 }}>
            {step === 'calculating' ? (
              <Animated.View style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 6,
                borderColor: '#F2F2F7',
                borderTopColor: '#0a714e',
                borderLeftColor: '#0a714e',
                transform: [{ rotate: rotation }],
              }} />
            ) : (
              // Done State (Checkmark)
              <Animated.View style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: '#0a714e',
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ scale: scaleAnim }], // Spring scale
                shadowColor: "#0a714e",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              }}>
                <Text style={{ fontSize: 60, color: '#FFFFFF', fontWeight: '800' }}>✓</Text>
              </Animated.View>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
            <Text style={{
              fontSize: 19,
              fontWeight: '700',
              color: '#000000',
            }}>
              Tailoring the app to your needs
            </Text>
            {step === 'calculating' && (
              <Animated.Text style={{
                fontSize: 19,
                fontWeight: '700',
                color: '#000000',
                opacity: dotOpacity,
                marginLeft: 2
              }}>...</Animated.Text>
            )}
          </View>
        </View>
      </View>

      {/* Footer */}
      {step === 'done' && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={onContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'onboarding' | 'nameInput' | 'welcomeUser' | 'energySelection' | 'trackingSelection' | 'goalSelection' | 'barrierSelection' | 'mainGoalSelection' | 'tailoring' | 'news' | 'badNewsStat'>('welcome');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [name, setName] = useState('');
  const [inputError, setInputError] = useState(false);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedBarrier, setSelectedBarrier] = useState<string | null>(null);
  const [selectedMainGoal, setSelectedMainGoal] = useState<string | null>(null);
  const [energyError, setEnergyError] = useState(false);
  const [trackingError, setTrackingError] = useState(false);
  const [goalError, setGoalError] = useState(false);
  const [barrierError, setBarrierError] = useState(false);
  const [mainGoalError, setMainGoalError] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Update progress based on screen (Assuming ~10 screens total)
  useEffect(() => {
    let toValue = 0;
    if (currentScreen === 'nameInput') {
      toValue = 0.1; // 10%
    } else if (currentScreen === 'welcomeUser') {
      toValue = 0.2; // 20%
    } else if (currentScreen === 'energySelection') {
      toValue = 0.3; // 30%
    } else if (currentScreen === 'trackingSelection') {
      toValue = 0.4; // 40%
    } else if (currentScreen === 'goalSelection') {
      toValue = 0.5; // 50%
    } else if (currentScreen === 'barrierSelection') {
      toValue = 0.6; // 60%
    } else if (currentScreen === 'mainGoalSelection') {
      toValue = 0.7; // 70%
    } else if (currentScreen === 'tailoring') {
      toValue = 0.8; // 80% (Hidden likely)
    } else if (currentScreen === 'news') {
      toValue = 0.85; // 85%
    } else if (currentScreen === 'badNewsStat') {
      toValue = 0.9; // 90%
    }

    Animated.timing(progressAnim, {
      toValue,
      duration: 500,
      useNativeDriver: false, // width is layout prop
    }).start();
  }, [currentScreen]);

  useEffect(() => {
    // Fade out splash screen
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsAppReady(true));
    }, 1500);

    // iOS Keyboard synchronization
    let keyboardWillShowSub: any;
    let keyboardWillHideSub: any;

    if (Platform.OS === 'ios') {
      keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: e.duration, // Exact sync
          useNativeDriver: false,
        }).start();
      });
      keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: e.duration,
          useNativeDriver: false,
        }).start();
      });
    }

    return () => {
      clearTimeout(timer);
      if (Platform.OS === 'ios') {
        keyboardWillShowSub?.remove();
        keyboardWillHideSub?.remove();
      }
    };
  }, []);

  const handleLetsGo = () => {
    setCurrentScreen('onboarding');
  };

  const handleBack = () => {
    if (currentScreen === 'nameInput') {
      setCurrentScreen('onboarding');
    } else if (currentScreen === 'welcomeUser') {
      setCurrentScreen('nameInput');
    } else if (currentScreen === 'energySelection') {
      setCurrentScreen('welcomeUser');
    } else if (currentScreen === 'trackingSelection') {
      setCurrentScreen('energySelection');
    } else if (currentScreen === 'goalSelection') {
      setCurrentScreen('trackingSelection');
    } else if (currentScreen === 'barrierSelection') {
      setCurrentScreen('goalSelection');
    } else if (currentScreen === 'mainGoalSelection') {
      setCurrentScreen('barrierSelection');
    } else if (currentScreen === 'tailoring') {
      setCurrentScreen('mainGoalSelection');
    } else if (currentScreen === 'news') {
      setCurrentScreen('mainGoalSelection');
    } else if (currentScreen === 'badNewsStat') {
      setCurrentScreen('news');
    }
  };

  const handleContinue = () => {
    if (currentScreen === 'onboarding') {
      if (currentSlideIndex < SLIDES.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: currentSlideIndex + 1,
          animated: true
        });
      } else {
        setCurrentScreen('nameInput');
      }
    } else if (currentScreen === 'nameInput') {
      if (name.trim().length === 0) {
        setInputError(true);
        // "dq dq" effect: Double impact
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 100);
      } else {
        setCurrentScreen('welcomeUser');
      }
    } else if (currentScreen === 'welcomeUser') {
      setCurrentScreen('energySelection');
    } else if (currentScreen === 'energySelection') {
      if (selectedEnergy) {
        console.log("Selected Energy:", selectedEnergy);
        setEnergyError(false);
        setCurrentScreen('trackingSelection');
      } else {
        setEnergyError(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else if (currentScreen === 'trackingSelection') {
      if (selectedTracking) {
        console.log("Selected Tracking:", selectedTracking);
        setTrackingError(false);
        setCurrentScreen('goalSelection');
      } else {
        setTrackingError(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else if (currentScreen === 'goalSelection') {
      if (selectedGoal) {
        console.log("Selected Goal:", selectedGoal);
        setGoalError(false);
        setCurrentScreen('barrierSelection');
      } else {
        setGoalError(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else if (currentScreen === 'barrierSelection') {
      if (selectedBarrier) {
        console.log("Selected Barrier:", selectedBarrier);
        setBarrierError(false);
        setCurrentScreen('mainGoalSelection');
      } else {
        setBarrierError(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else if (currentScreen === 'mainGoalSelection') {
      if (selectedMainGoal) {
        console.log("Selected Main Goal:", selectedMainGoal);
        setMainGoalError(false);
        setCurrentScreen('tailoring');
      } else {
        setMainGoalError(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else if (currentScreen === 'tailoring') {
      setCurrentScreen('news');
    } else if (currentScreen === 'news') {
      setCurrentScreen('badNewsStat');
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

  // --- RENDER FUNCTIONS ---



  // --- EXISTING RENDER FUNCTIONS ---
  // ... (renderWelcome...renderBarrierSelection)

  const renderMainGoalSelection = () => {
    const options = [
      { id: 'productivity', title: 'Increase my productivity', desc: '', emoji: '⚡' },
      { id: 'energy', title: 'Boost my energy', desc: '', emoji: '🔋' },
      { id: 'self_improvement', title: 'Work on self-improvement', desc: '', emoji: '📚' },
      { id: 'health', title: 'Adopt a healthier lifestyle', desc: '', emoji: '🥗' },
      { id: 'other', title: 'Other', desc: '', emoji: '💬' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.inputContent, { paddingTop: 0 }]}>
            <Text style={styles.inputTitle}>What's your main goal?</Text>

            <View style={{ marginTop: 10, width: '100%' }}>
              {options.map((option) => (
                <SelectionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedMainGoal === option.id}
                  onSelect={() => {
                    setSelectedMainGoal(option.id);
                    if (mainGoalError) setMainGoalError(false);
                  }}
                  cardStyle={{ padding: 8 }}
                />
              ))}
              {mainGoalError && (
                <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                  Select an option
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          {/* No InfoBox here as requested */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNews = () => {
    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{
              fontSize: 32,
              fontWeight: '800',
              color: '#000000',
              textAlign: 'center',
              letterSpacing: -0.5,
              marginBottom: 30
            }}>
              Some not so good news, and some great news
            </Text>

          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBadNewsStat = () => {
    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>
            {selectedMainGoal === 'productivity' && (
              <Text style={{ fontSize: 32, color: '#000000', textAlign: 'center', lineHeight: 42, fontWeight: '800', letterSpacing: -0.5 }}>
                <Text style={{ color: '#0a714e' }}>47%</Text> of your day might be spent with your mind wandering.
              </Text>
            )}
            {selectedMainGoal === 'energy' && (
              <Text style={{ fontSize: 32, color: '#000000', textAlign: 'center', lineHeight: 42, fontWeight: '800', letterSpacing: -0.5 }}>
                Fatigue affects <Text style={{ color: '#0a714e' }}>60%</Text> of adults, impacting their daily potential.
              </Text>
            )}
            {selectedMainGoal === 'self_improvement' && (
              <Text style={{ fontSize: 32, color: '#000000', textAlign: 'center', lineHeight: 42, fontWeight: '800', letterSpacing: -0.5 }}>
                <Text style={{ color: '#0a714e' }}>80%</Text> of resolutions fail by February due to lack of structure.
              </Text>
            )}
            {selectedMainGoal === 'health' && (
              <Text style={{ fontSize: 32, color: '#000000', textAlign: 'center', lineHeight: 42, fontWeight: '800', letterSpacing: -0.5 }}>
                Inconsistency is the #1 reason why <Text style={{ color: '#0a714e' }}>95%</Text> of fitness plans fail.
              </Text>
            )}
            {((!selectedMainGoal) || (selectedMainGoal !== 'productivity' && selectedMainGoal !== 'energy' && selectedMainGoal !== 'self_improvement' && selectedMainGoal !== 'health')) && (
              <Text style={{ fontSize: 32, color: '#000000', textAlign: 'center', lineHeight: 42, fontWeight: '800', letterSpacing: -0.5 }}>
                Without a clear system, <Text style={{ color: '#0a714e' }}>92%</Text> of goals remain unachieved.
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- RENDER FUNCTIONS ---
  // ... (renderWelcome...renderGoalSelection)

  const renderBarrierSelection = () => {
    const options = [
      { id: 'motivation', title: 'Losing motivation', desc: '', emoji: '📉' },
      { id: 'time', title: 'Lack of time', desc: '', emoji: '⏰' },
      { id: 'start', title: 'Not knowing how to start', desc: '', emoji: '🤷' },
      { id: 'overwhelmed', title: 'Feeling overwhelmed', desc: '', emoji: '🤯' },
      { id: 'other', title: 'Other', desc: '', emoji: '💬' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.inputContent, { paddingTop: 0 }]}>
            <Text style={styles.inputTitle}>What tends to get in the way of your goals?</Text>

            <View style={{ marginTop: 10, width: '100%' }}>
              {options.map((option) => (
                <SelectionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedBarrier === option.id}
                  onSelect={() => {
                    setSelectedBarrier(option.id);
                    if (barrierError) setBarrierError(false);
                  }}
                  cardStyle={{ padding: 8 }}
                />
              ))}
              {barrierError && (
                <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                  Select an option
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={[styles.optionCard, { backgroundColor: '#F2F2F7', marginBottom: 20, borderWidth: 0, paddingVertical: 16 }]}>
            <View style={[styles.optionIconContainer, { width: 56, height: 56, borderRadius: 18 }]}>
              <Text style={{ fontSize: 46 }}>🧱</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '400', color: '#000000', lineHeight: 18 }}>
                <Text style={{ fontWeight: '600', color: '#000000' }}>We personalize tools to your needs.</Text> Overcome obstacles and thrive thanks to your habits
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- RENDER FUNCTIONS ---

  const renderWelcome = () => (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Habbit</Text>
        <Text style={styles.subtitle}>Starting today, let's build better habits and achieve your goals together.</Text>
      </View>

      <View style={styles.footerContainer}>
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
      <View style={styles.mockupContainer}>
        <View style={styles.iphoneMockup}>
          <View style={styles.iphoneDynamicIsland} />
          <View style={styles.iphoneScreen}>
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

      <View style={styles.onboardingContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  const renderOnboarding = () => (
    <View style={styles.container}>
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

  const renderNameInput = () => {
    // Standard padding when keyboard is hidden
    const basePadding = Platform.OS === 'ios' ? 20 : 20;

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[
          styles.container,
          { justifyContent: 'space-between' },
          Platform.OS === 'ios' && { paddingBottom: Animated.add(keyboardHeight, basePadding) }
        ]}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <View style={styles.backIconShape} />
              </TouchableOpacity>

              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]}
                />
              </View>
            </View>

            {/* Content */}
            <View style={styles.inputContent}>
              <Text style={styles.inputTitle}>What's your preferred name?</Text>
              <Text style={styles.inputSubtitle}>We are really glad that you're here! What should we call you?</Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder=""
                  value={name}
                  onChangeText={(text) => {
                    setName(text.slice(0, 20));
                    if (inputError) setInputError(false);
                  }}
                  autoFocus={true}
                  returnKeyType="next"
                  onSubmitEditing={handleContinue}
                  selectionColor="#0a714e"
                  cursorColor="#0a714e"
                />
              </View>

              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 5 }}>
                <Text style={styles.errorText}>{inputError ? "Enter your name" : ""}</Text>
                <Text style={styles.charCount}>{name.length}/20</Text>
              </View>
            </View>
          </View>

          {/* Footer - Relative positioning inside Flex Space-Between */}
          <View style={[
            styles.footerContainer,
            { position: 'relative', paddingBottom: Platform.OS === 'android' ? 20 : 0 }
          ]}>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  const renderWelcomeUser = () => (
    <View style={[styles.container, { justifyContent: 'space-between' }]}>
      <FloatingEmojisBackground />
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backIconShape} />
          </TouchableOpacity>

          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.welcomeUserContent}>
          <Text style={styles.welcomeUserTitle}>
            Glad to have you with{'\n'}us, <Text style={{ color: '#0a714e' }}>{name}</Text> 👋
          </Text>
          <Text style={styles.welcomeUserSubtitle}>
            We have a few quick questions for you to get started. Choose whatever feels right
          </Text>
          <Text style={[styles.welcomeUserSubtitle, { marginTop: 10 }]}>Let your journey begin!</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEnergySelection = () => {
    const options = [
      { id: 'early_bird', title: 'Early bird', desc: 'I am energized and productive in the morning', emoji: '🐦' },
      { id: 'night_owl', title: 'Night owl', desc: 'I feel most creative and awake at night', emoji: '🦉' },
      { id: 'flexible', title: 'Flexible energy', desc: 'I can adapt my energy flow to my schedule', emoji: '⚡' },
      { id: 'low_energy', title: 'Low energy', desc: 'I feel tired often and want to boost my stamina', emoji: '🪫' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.inputContent, { paddingTop: 0 }]}>
            <Text style={styles.inputTitle}>Which statement best{'\n'}describes you?</Text>

            <View style={{ marginTop: 10, width: '100%' }}>
              {options.map((option) => (
                <SelectionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedEnergy === option.id}
                  onSelect={() => {
                    setSelectedEnergy(option.id);
                    if (energyError) setEnergyError(false);
                  }}
                />
              ))}
              {energyError && (
                <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                  Select an option
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={[styles.optionCard, { backgroundColor: '#F2F2F7', marginBottom: 20, borderWidth: 0, paddingVertical: 16 }]}>
            <View style={[styles.optionIconContainer, { width: 56, height: 56, borderRadius: 18 }]}>
              <Text style={{ fontSize: 46 }}>⭐</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#000000', marginBottom: 4, letterSpacing: -0.3 }}>
                Your energy is the key to lasting habits.
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '400', color: '#8E8E93' }}>
                We will help you focus during the right moments of the day
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTrackingSelection = () => {
    const options = [
      { id: 'graphs', title: 'Graphs and detailed stats', desc: '', emoji: '📊' },
      { id: 'check_ins', title: 'Daily check ins', desc: '', emoji: '✅' },
      { id: 'streaks', title: 'Celebrating streaks', desc: '', emoji: '🔥' },
      { id: 'not_sure', title: 'I’m not sure yet', desc: '', emoji: '🤔' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.inputContent, { paddingTop: 0 }]}>
            <Text style={styles.inputTitle}>How do you prefer to{'\n'}track your progress?</Text>

            <View style={{ marginTop: 10, width: '100%' }}>
              {options.map((option) => (
                <SelectionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedTracking === option.id}
                  onSelect={() => {
                    setSelectedTracking(option.id);
                    if (trackingError) setTrackingError(false);
                  }}
                  cardStyle={{ padding: 8 }}
                />
              ))}
              {trackingError && (
                <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                  Select an option
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={[styles.optionCard, { backgroundColor: '#F2F2F7', marginBottom: 20, borderWidth: 0, paddingVertical: 16 }]}>
            <View style={[styles.optionIconContainer, { width: 56, height: 56, borderRadius: 18 }]}>
              <Text style={{ fontSize: 46 }}>📈</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '400', color: '#000000', lineHeight: 18 }}>
                Some love detailed stats, others prefer to go on streaks. <Text style={{ fontWeight: '600', color: '#000000' }}>However you track progress, we've got you</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderGoalSelection = () => {
    const options = [
      { id: 'good_habits', title: 'Building good habits', desc: '', emoji: '🌱' },
      { id: 'bad_habits', title: 'Getting rid of bad habits', desc: '', emoji: '🗑️' },
      { id: 'both', title: 'Both', desc: '', emoji: '🎯' },
      { id: 'not_sure', title: 'I’m not sure yet', desc: '', emoji: '🤔' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: 10 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.inputContent, { paddingTop: 0 }]}>
            <Text style={styles.inputTitle}>How can we help you?</Text>

            <View style={{ marginTop: 10, width: '100%' }}>
              {options.map((option) => (
                <SelectionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedGoal === option.id}
                  onSelect={() => {
                    setSelectedGoal(option.id);
                    if (goalError) setGoalError(false);
                  }}
                  cardStyle={{ padding: 8 }}
                />
              ))}
              {goalError && (
                <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                  Select an option
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={[styles.optionCard, { backgroundColor: '#F2F2F7', marginBottom: 20, borderWidth: 0, paddingVertical: 16 }]}>
            <View style={[styles.optionIconContainer, { width: 56, height: 56, borderRadius: 18 }]}>
              <Text style={{ fontSize: 46 }}>🚀</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '400', color: '#000000', lineHeight: 18 }}>
                <Text style={{ fontWeight: '600', color: '#000000' }}>Thanks to our extensive tracking options</Text>, we can assist you to reach your goals
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'welcome' ? renderWelcome() :
        currentScreen === 'onboarding' ? renderOnboarding() :
          currentScreen === 'nameInput' ? renderNameInput() :
            currentScreen === 'welcomeUser' ? renderWelcomeUser() :
              currentScreen === 'energySelection' ? renderEnergySelection() :
                currentScreen === 'trackingSelection' ? renderTrackingSelection() :
                  currentScreen === 'goalSelection' ? renderGoalSelection() :
                    currentScreen === 'barrierSelection' ? renderBarrierSelection() :
                      currentScreen === 'mainGoalSelection' ? renderMainGoalSelection() :
                        currentScreen === 'tailoring' ? <TailoringView onBack={handleBack} onContinue={handleContinue} progressAnim={progressAnim} /> :
                          currentScreen === 'news' ? renderNews() :
                            currentScreen === 'badNewsStat' ? renderBadNewsStat() :
                              renderNameInput()
      }
      {!isAppReady && (
        <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
          <Image
            source={require('./assets/habbit-logo.png')}
            style={styles.splashImage}
            resizeMode="contain"
          />
        </Animated.View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

// 78mm width / 163mm height ~= 0.4785 aspect ratio
const MOCKUP_ASPECT_RATIO = 78 / 163;
const MOCKUP_WIDTH = width * 0.55;

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
  splashImage: {
    width: 200,
    height: 200,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Text Styles
  title: {
    fontSize: 38,
    fontWeight: '800', // Thicker
    color: '#000000',
    letterSpacing: -0.8, // Tight iOS Display style
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24, // Relaxed reading
    letterSpacing: 0,
    paddingHorizontal: 20,
  },

  // Layout Styles
  footerContainer: {
    // Default Absolute for Welcome/Onboarding
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'rgba(10, 113, 78, 0.85)',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#0a714e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.4, // Standard iOS Button spacing
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'left',
    fontWeight: '400',
  },

  // Welcome User Styles
  welcomeUserContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  welcomeUserTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  welcomeUserSubtitle: {
    fontSize: 14.5,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
    letterSpacing: 0,
  },
  welcomeUserJourneyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  // Option Card Styles
  optionCard: {
    width: '100%',
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // No border
  },
  optionCardSelected: {
    backgroundColor: '#0a714e', // Brand Color Selection
    // No border
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor removed
    borderRadius: 14,
    marginRight: 14,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  optionDesc: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    letterSpacing: 0,
  },
  // checkCircle/Inner removed



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
    marginTop: 20,
    paddingBottom: 150,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 10,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#0a714e',
    width: 16,
  },

  // Name Input Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    // Soft, liquid shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backIconShape: {
    width: 12,
    height: 12,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: '#000000',
    transform: [{ rotate: '-45deg' }, { translateX: 2 }],
  },
  progressBarContainer: {
    flex: 1,
    height: 4, // Thinner
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0a714e', // New Brand Color
    borderRadius: 2,
  },

  inputContent: {
    flex: 1,
    paddingHorizontal: 16, // Reduced padding for wider text area
    paddingTop: 10, // Moved up significantly
    alignItems: 'center',
  },
  inputTitle: {
    fontSize: 28,
    fontWeight: '800', // Thicker header
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
    alignSelf: 'center',
    letterSpacing: -0.8, // Tight display look
  },
  inputSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 40,
    // Removed paddingHorizontal to let text flow wider
    lineHeight: 22,
    letterSpacing: 0,
  },
  inputWrapper: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5EA',
    marginBottom: 10,
    paddingBottom: 5,
  },
  textInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    paddingVertical: 5,
    letterSpacing: -0.5,
  },
  charCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 5,
    textAlign: 'right', // Keeping right alignment relative to the wrapper is tricky if wrapper is 100%. 
    alignSelf: 'flex-end', // Let's keep it right-aligned as per persistent preference, relative to the wide input wrapper
  },
});
