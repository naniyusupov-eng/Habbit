import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Animated, Dimensions, FlatList, Platform, TextInput, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Image, Easing, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: "Master your daily routine",
    subtitle: "Consistently hit your goals with Habbit's intelligent reminders and seamless tracking."
  },
  {
    id: 2,
    title: "Visualize your growth",
    subtitle: "See how far you've come with intuitive charts and motivating streak counters."
  },
  {
    id: 3,
    title: "Find your daily drive",
    subtitle: "Connect with a supportive community and crush your targets together."
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

const FadeInView = ({ children }: any) => {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fade }}>
      {children}
    </Animated.View>
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
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [{ width: '100%', marginBottom: 12 }, pressed && { opacity: 0.8 }]}
    >
      <Animated.View style={[styles.optionCard, { backgroundColor, marginBottom: 0 }, cardStyle]}>
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
        <View style={[styles.optionIconContainer, { marginRight: 0, marginLeft: 14 }]}>
          <Text style={{ fontSize: 22 }}>{option.emoji}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const SuccessView = ({ onBack, onContinue, progressAnim }: any) => {
  return (
    <View style={[styles.container, { justifyContent: 'space-between' }]}>
      {/* Background Effect */}
      <FloatingEmojisBackground />

      <View style={{ flex: 1, zIndex: 1, justifyContent: 'space-between' }}>
        <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
          <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={onBack}>
            <View style={styles.backIconShape} />
          </Pressable>
          <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
            <Animated.View style={{ height: '100%', backgroundColor: '#0a714e', borderRadius: 3, width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
          </View>
        </View>

        {/* Centered Content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 56, textAlign: 'center', marginBottom: 12 }}>
            Great Job<Text style={{ color: '#cc0000' }}>.</Text>
          </Text>
          <Text style={{ fontSize: 18, color: '#8E8E93', textAlign: 'center', lineHeight: 26, fontWeight: '500' }}>
            You are all set.
          </Text>
        </View>

        {/* Spacer for layout balance */}
        <View style={{ height: 100 }} />
      </View>

      <View style={[styles.footerContainer, { zIndex: 2 }]}>
        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={onContinue}>
          <Text style={styles.buttonText}>Start the Engine</Text>
        </Pressable>
      </View>
    </View>
  );
};

const WhatCanDoView = ({ onBack, onContinue, progressAnim, name }: any) => {
  const [isSigned, setIsSigned] = useState(false);

  // Stamp Animations
  const stampScale = useRef(new Animated.Value(2.5)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;

  // Document-style contract items
  const contractItems = [
    "I commit to prioritizing my essential tasks and eliminating distractions.",
    "I will actively explore the boundaries of my potential every day.",
    "I will remain curious, open-minded, and willing to learn from failure.",
    "I will confront and address my weaknesses to turn them into strengths.",
    "I will stay true to my core values and who I am."
  ];

  const handleAgree = () => {
    if (isSigned) {
      // Proceed if already signed
      onContinue();
    } else {
      // Sign Contract
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate Stamp
      Animated.parallel([
        Animated.spring(stampScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true
        }),
        Animated.timing(stampOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();

      setIsSigned(true);
    }
  };

  return (
    <View style={[styles.container, { justifyContent: 'space-between' }]}>

      {/* Stamp View (Bottom Right of Document) */}
      <View style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', alignItems: 'flex-end', paddingBottom: 120, paddingRight: 40, zIndex: 10, pointerEvents: 'none' }]}>
        <Animated.View style={{
          width: 140,
          height: 140,
          borderRadius: 70,
          borderWidth: 3,
          borderColor: 'rgba(10, 113, 78, 0.6)',
          borderStyle: 'dashed',
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ scale: stampScale }, { rotate: '-12deg' }],
          opacity: stampOpacity,
          backgroundColor: 'transparent',
        }}>
          <View style={{ width: 126, height: 126, borderRadius: 63, borderWidth: 1, borderColor: 'rgba(10, 113, 78, 0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Garet-Heavy', fontSize: 18, color: 'rgba(10, 113, 78, 0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>ACCEPTED</Text>
          </View>
        </Animated.View>
      </View>



      <View style={{ flex: 1, zIndex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
          <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={onBack}>
            <View style={styles.backIconShape} />
          </Pressable>

          {/* Progress Bar - Always Full */}
          <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: '#0a714e', borderRadius: 3, width: '100%' }} />
          </View>
        </View>

        <View style={styles.inputContent}>
          {/* Title: Name (Green), Dot (Red) */}
          <Text style={[styles.title, { marginBottom: 40, fontSize: 32, fontFamily: 'Garet-Heavy' }]}>
            <Text style={{ color: '#0a714e' }}>{name}'s</Text> Contract<Text style={{ color: '#cc0000' }}>.</Text>
          </Text>

          {/* Contract Text Items - Document Style */}
          <View style={{ gap: 24 }}>
            {contractItems.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {/* Bullet */}
                <View style={{ marginTop: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#cc0000', marginRight: 12 }} />
                <Text style={{ fontSize: 16, lineHeight: 22, color: '#333', letterSpacing: 0.2, fontWeight: '400', flex: 1 }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>



      {/* Footer Button */}
      <View style={[styles.footerContainer, { zIndex: 20, backgroundColor: '#fff', paddingTop: 20 }]}>
        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={handleAgree}>
          <Text style={styles.buttonText}>{isSigned ? "Get Started" : "I Agree"}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const TailoringView = ({ onBack, onContinue, progressAnim }: any) => {
  const [step, setStep] = useState<'calculating' | 'done'>('calculating');
  const [dots, setDots] = useState('.');

  // Animation Values
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const scaleDoneAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Dots Loop
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '.');
    }, 500);

    // 2. Ripple Animation
    Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();

    // 3. Breathing Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    // 4. Transition to Done
    const timer = setTimeout(() => {
      setStep('done');
      clearInterval(dotsInterval);
      setDots('.');

      // Pop in the Checkmark
      Animated.spring(scaleDoneAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true
      }).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
        <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={onBack}>
          <View style={styles.backIconShape} />
        </Pressable>
        <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: '#0a714e',
              borderRadius: 3,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }}
          />
        </View>
      </View>

      {/* Content - Fully Centered */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
        {/* Title */}
        <Text style={{ fontSize: 38, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 12 }}>
          Personalizing{'\n'}your plan<Text style={{ color: '#cc0000' }}>{dots}</Text>
        </Text>
        <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 60, lineHeight: 24, fontWeight: '500' }}>
          {step === 'calculating' ? "Crafting the perfect habit stack tailored to your goals." : "Your personalized plan is ready."}
        </Text>

        {/* Custom Animation Area */}
        <View style={{ width: 120, height: 120, justifyContent: 'center', alignItems: 'center' }}>
          {step === 'calculating' ? (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              {/* Ripple Effect */}
              <Animated.View style={{
                position: 'absolute',
                width: 120, height: 120, borderRadius: 60,
                backgroundColor: 'rgba(10, 113, 78, 0.2)',
                transform: [{ scale: rippleAnim }],
                opacity: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
              }} />
              {/* Breathing Core */}
              <Animated.View style={{
                width: 60, height: 60, borderRadius: 30, backgroundColor: '#0a714e',
                transform: [{ scale: breathingAnim }],
                shadowColor: "#0a714e",
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 5,
              }} />
            </View>
          ) : (
            <Animated.View style={{
              width: 100, height: 100, borderRadius: 50, backgroundColor: '#0a714e',
              justifyContent: 'center', alignItems: 'center',
              transform: [{ scale: scaleDoneAnim }]
            }}>
              {/* Checkmark built with Views */}
              <View style={{
                width: 30, height: 15,
                borderLeftWidth: 4, borderBottomWidth: 4, borderColor: '#fff',
                transform: [{ rotate: '-45deg' }, { translateY: -4 }]
              }} />
            </Animated.View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        {step === 'done' ? (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={onContinue}
          >
            <Text style={styles.buttonText}>See My Plan</Text>
          </Pressable>
        ) : (
          <View style={{ height: 56 }} /> // Placeholder for consistent spacing
        )}
      </View>
    </View>
  );
};

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'onboarding' | 'nameInput' | 'welcomeUser' | 'energySelection' | 'trackingSelection' | 'goalSelection' | 'barrierSelection' | 'mainGoalSelection' | 'tailoring' | 'news' | 'badNewsStat' | 'whatCanDo' | 'solution' | 'dashboard' | 'createHabit'>('welcome');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [name, setName] = useState('');
  const [habitName, setHabitName] = useState('');
  const [habitTime, setHabitTime] = useState('');
  const [inputError, setInputError] = useState(false);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedBarrier, setSelectedBarrier] = useState<string | null>(null);
  const [selectedMainGoal, setSelectedMainGoal] = useState<string | null>(null);
  const [energyError, setEnergyError] = useState(false);
  const [trackingError, setTrackingError] = useState(false);
  const [goalError, setGoalError] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // Paywall selection
  const [barrierError, setBarrierError] = useState(false);
  const [mainGoalError, setMainGoalError] = useState(false);
  const [habitInputError, setHabitInputError] = useState(false);
  const [habitTimeError, setHabitTimeError] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'settings'>('home');

  const [fontsLoaded, error] = useFonts({
    'Garet-Heavy': require('./Fonts/Garet-Heavy.ttf'),
    'Garet-Book': require('./Fonts/Garet-Book.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading fonts", error);
    }
  }, [error]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<FlatList>(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Update progress based on screen (Assuming ~10 screens total)
  useEffect(() => {
    let toValue = 0;
    if (currentScreen === 'nameInput') {
      toValue = 0; // 0%
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
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setIsAppReady(true));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  useEffect(() => {
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
    } else if (currentScreen === 'solution') {
      setCurrentScreen('badNewsStat');
    } else if (currentScreen === 'dashboard') {
      // No back from dashboard usually, or exit
    } else if (currentScreen === 'createHabit') {
      setCurrentScreen('dashboard');
    }
  };

  const handleContinue = () => {
    if (currentScreen === 'onboarding') {
      setCurrentScreen('nameInput');
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
    } else if (currentScreen === 'badNewsStat') {
      setCurrentScreen('whatCanDo');
    } else if (currentScreen === 'whatCanDo') {
      setCurrentScreen('solution');
    } else if (currentScreen === 'solution') {
      setCurrentScreen('dashboard');
    } else if (currentScreen === 'createHabit') {
      if (habitName.trim().length === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        setCurrentScreen('dashboard');
      }
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

  const renderBarrierSelection = () => {
    const options = [
      { id: 'time', title: 'Lack of Time', desc: 'Too busy', emoji: '⏰' },
      { id: 'motivation', title: 'No Motivation', desc: 'Hard to keep going', emoji: '🌧️' },
      { id: 'distraction', title: 'Distractions', desc: 'Easily sidetracked', emoji: '📱' },
      { id: 'start', title: 'Getting Started', desc: 'Procrastination', emoji: '🧗' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
            <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </Pressable>
            <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
              <Animated.View style={{ height: '100%', backgroundColor: '#0a714e', borderRadius: 3, width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
            </View>
          </View>

          <View style={[styles.inputContent, { paddingTop: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 12 }}>
              What usually{'\n'}stops you <Text style={{ color: '#cc0000' }}>?</Text>
            </Text>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 30, lineHeight: 24, fontWeight: '500' }}>
              Identify the hurdle to clear the path.
            </Text>

            <View style={{ width: '100%', paddingHorizontal: 4 }}>
              {options.map((option) => {
                const isSelected = selectedBarrier === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setSelectedBarrier(option.id);
                      if (barrierError) setBarrierError(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? '#0a714e' : '#F7F7F9',
                      borderRadius: 32,
                      marginBottom: 12,
                      padding: 16,
                      paddingRight: 24,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.2 : 0,
                      shadowRadius: 8,
                      elevation: isSelected ? 3 : 0,
                    }, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
                  >
                    <View style={{ marginRight: 16 }}>
                      <Text style={{ fontSize: 32 }}>{option.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: isSelected ? '#ffffff' : '#000000', marginBottom: 2 }}>
                        {option.title}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: isSelected ? 'rgba(255,255,255,0.8)' : '#8E8E93' }}>
                        {option.desc}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {barrierError && (
              <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                Please select an option
              </Text>
            )}
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderMainGoalSelection = () => {
    const options = [
      { id: 'productivity', title: 'Maximize productivity', desc: 'Get more done', emoji: '⚡' },
      { id: 'energy', title: 'Revitalize energy', desc: 'Feel alive', emoji: '🔋' },
      { id: 'mindfulness', title: 'Mindfulness', desc: 'Inner peace', emoji: '🧘' },
      { id: 'health', title: 'Healthier living', desc: 'Body & mind', emoji: '🍎' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
            <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </Pressable>
            <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
              <Animated.View style={{ height: '100%', backgroundColor: '#0a714e', borderRadius: 3, width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
            </View>
          </View>

          <View style={[styles.inputContent, { paddingTop: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 12 }}>
              What is your{'\n'}primary focus <Text style={{ color: '#cc0000' }}>?</Text>
            </Text>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 30, lineHeight: 24, fontWeight: '500' }}>
              We'll curate your experience based on this.
            </Text>

            <View style={{ width: '100%', paddingHorizontal: 4 }}>
              {options.map((option) => {
                const isSelected = selectedMainGoal === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setSelectedMainGoal(option.id);
                      if (mainGoalError) setMainGoalError(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? '#0a714e' : '#F7F7F9',
                      borderRadius: 32,
                      marginBottom: 12,
                      padding: 16,
                      paddingRight: 24,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.2 : 0,
                      shadowRadius: 8,
                      elevation: isSelected ? 3 : 0,
                    }, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
                  >
                    <View style={{ marginRight: 16 }}>
                      <Text style={{ fontSize: 32 }}>{option.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: isSelected ? '#ffffff' : '#000000', marginBottom: 2 }}>
                        {option.title}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: isSelected ? 'rgba(255,255,255,0.8)' : '#8E8E93' }}>
                        {option.desc}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {mainGoalError && (
              <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                Please select an option
              </Text>
            )}
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderNews = () => {
    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
            <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </Pressable>
            <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
              <Animated.View style={{ height: '100%', backgroundColor: '#0a714e', borderRadius: 3, width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
            </View>
          </View>

          <View style={[styles.inputContent, { paddingTop: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 12 }}>
              Don't Miss Out<Text style={{ color: '#cc0000' }}>.</Text>
            </Text>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 40, lineHeight: 24, fontWeight: '500' }}>
              Our smart notifications can double your success rate by keeping you accountable.
            </Text>

            <View style={{ width: '100%', paddingHorizontal: 10 }}>
              {/* Feature 1 */}
              <View style={{ flexDirection: 'row', marginBottom: 24, alignItems: 'flex-start' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <Text style={{ fontSize: 20 }}>⚡</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 4 }}>Low energy</Text>
                  <Text style={{ fontSize: 15, color: '#8E8E93', lineHeight: 20 }}>Get reminders for your habits when you have most energy.</Text>
                </View>
              </View>

              {/* Feature 2 */}
              <View style={{ flexDirection: 'row', marginBottom: 24, alignItems: 'flex-start' }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <Text style={{ fontSize: 20 }}>📈</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 4 }}>Stay on track</Text>
                  <Text style={{ fontSize: 15, color: '#8E8E93', lineHeight: 20 }}>Keep your streak alive with timely nudges.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={async () => {
              try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                const { status } = await Notifications.requestPermissionsAsync();
              } catch (error) {
                console.log('Error requesting notifications permissions:', error);
              } finally {
                handleContinue();
              }
            }}
          >
            <Text style={styles.buttonText}>Enable Notifications</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderBadNewsStat = () => {
    return (
      <SuccessView
        onBack={handleBack}
        onContinue={handleContinue}
        progressAnim={progressAnim}
      />
    );
  };


  // --- RENDER FUNCTIONS ---
  // ... (renderWelcome...renderGoalSelection)



  // --- RENDER FUNCTIONS ---

  const renderWelcome = () => (
    <View style={styles.container}>
      {/* Abstract Background Element */}
      <View style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: '#E0F2E9', // Light green brand tint
        opacity: 0.7,
      }} />
      <View style={{
        position: 'absolute',
        top: 100,
        left: -40,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#F2F2F7',
        opacity: 0.6,
      }} />

      <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 30, paddingBottom: 140 }}>
        <Text style={{ fontSize: 52, fontWeight: '600', color: '#000000', letterSpacing: -2, lineHeight: 52 }}>
          Welcome to
        </Text>
        <Text style={{ fontSize: 52, color: '#0a714e', letterSpacing: -5, lineHeight: 74, marginBottom: 20 }}>
          <Text style={{ fontFamily: 'Garet-Heavy' }}>habbit {'\u200A'}<Text style={{ color: '#ff2828' }}>.</Text></Text>
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View style={{ width: 3, backgroundColor: '#0a714e', marginRight: 16, borderRadius: 1.5 }} />
          <Text style={{ fontSize: 18, color: '#3C3C43', lineHeight: 28, fontWeight: '500', letterSpacing: -0.3 }}>
            Tiny changes.{'\n'}Remarkable results.
          </Text>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={handleLetsGo}>
          <Text style={styles.buttonText}>Let's go!</Text>
        </Pressable>
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
      <View style={{ flex: 1, paddingTop: 100, alignItems: 'center' }}>
        {/* Visual: Abstract Representation of a "Perfect Streak" */}
        <View style={{ marginBottom: 60, alignItems: 'center' }}>
          <View style={{ width: 280, height: 280, backgroundColor: '#F2F2F7', borderRadius: 40, transform: [{ rotate: '-5deg' }], alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }}>
            <View style={{ width: 240, height: 40, backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#0a714e' }} />
              <View style={{ width: 100, height: 8, backgroundColor: '#F2F2F7', marginLeft: 12, borderRadius: 4 }} />
            </View>
            <View style={{ width: 240, height: 40, backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#0a714e' }} />
              <View style={{ width: 140, height: 8, backgroundColor: '#F2F2F7', marginLeft: 12, borderRadius: 4 }} />
            </View>
            <View style={{ width: 240, height: 40, backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#0a714e' }} />
              <View style={{ width: 80, height: 8, backgroundColor: '#F2F2F7', marginLeft: 12, borderRadius: 4 }} />
            </View>
            <View style={{ width: 240, height: 40, backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#0a714e' }} />
              <View style={{ width: 110, height: 8, backgroundColor: '#F2F2F7', marginLeft: 12, borderRadius: 4 }} />
            </View>
          </View>
          {/* Decorative Back Card */}
          <View style={{ position: 'absolute', top: 10, zIndex: -1, width: 280, height: 280, backgroundColor: '#E0F2E9', borderRadius: 40, transform: [{ rotate: '5deg' }] }} />
        </View>

        <View style={{ paddingHorizontal: 30, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#000000', textAlign: 'center', marginBottom: 16, letterSpacing: -1 }}>
            Master your routine<Text style={{ color: '#cc0000' }}>.</Text>
          </Text>
          <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', lineHeight: 24, fontWeight: '500' }}>
            Consistency is the bridge between goals and accomplishment. We help you build it.
          </Text>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={handleContinue}>
          <Text style={styles.buttonText}>Start Journey</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderNameInput = () => {
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
            <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60 }]}>
              <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
                <View style={styles.backIconShape} />
              </Pressable>

              {/* Refined Progress Bar */}
              <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
                <Animated.View
                  style={{
                    height: '100%',
                    backgroundColor: '#0a714e',
                    borderRadius: 3,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }}
                />
              </View>
            </View>

            {/* Centered Content */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 60 }}>
              <Text style={{ fontSize: 40, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 46, marginBottom: 16, textAlign: 'center' }}>
                How should we{'\n'}call you?
              </Text>
              <Text style={{ fontSize: 16, color: '#8E8E93', lineHeight: 24, marginBottom: 50, fontWeight: '500', textAlign: 'center' }}>
                Your journey belongs to you.{'\n'}Let's make it personal.
              </Text>

              {/* Centered Input */}
              <View style={{ width: '100%', alignItems: 'center' }}>
                <TextInput
                  style={{
                    fontSize: 36,
                    fontWeight: '700',
                    color: '#000000',
                    paddingVertical: 10,
                    textAlign: 'center',
                    width: '100%',
                    borderBottomWidth: 2,
                    borderBottomColor: inputError ? '#FF3B30' : '#E5E5EA',
                  }}
                  placeholder=""
                  placeholderTextColor="#C7C7CC"
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
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 }}>
                  <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '500', opacity: inputError ? 1 : 0 }}>
                    Required
                  </Text>
                  <Text style={styles.charCount}>{name.length}/20</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={[
            styles.footerContainer,
            { position: 'relative', paddingBottom: Platform.OS === 'android' ? 20 : 0 }
          ]}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
              onPress={handleContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
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
        <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60 }]}>
          <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
            <View style={styles.backIconShape} />
          </Pressable>

          <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
            <Animated.View
              style={{
                height: '100%',
                backgroundColor: '#0a714e',
                borderRadius: 3,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }}
            />
          </View>
        </View>

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 80 }}>
          <Text style={{ fontSize: 42, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 50, textAlign: 'center' }}>
            Welcome,
          </Text>
          <Text style={{ fontSize: 42, fontWeight: '800', color: '#0a714e', letterSpacing: -1, lineHeight: 56, textAlign: 'center', marginBottom: 16 }}>
            <Text style={{ fontFamily: 'Garet-Heavy' }}>{name}<Text style={{ color: '#cc0000' }}>.</Text></Text> <Text style={{ fontSize: 36 }}>👋</Text>
          </Text>
          <Text style={{ fontSize: 18, color: '#8E8E93', textAlign: 'center', lineHeight: 28, fontWeight: '500' }}>
            Let's personalize your path.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderEnergySelection = () => {
    const options = [
      { id: 'early_bird', title: 'Morning', desc: 'Start fresh & early', emoji: '☀️' },
      { id: 'night_owl', title: 'Night', desc: 'Focus after sunset', emoji: '🌙' },
      { id: 'flexible', title: 'Flexible', desc: 'Whenever I can', emoji: '⚡' },
      { id: 'low_energy', title: 'Recharge', desc: 'Need energy boost', emoji: '🪫' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
            <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </Pressable>
            <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: '#0a714e',
                  borderRadius: 3,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.inputContent, { paddingTop: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 12 }}>
              When are you{'\n'}at your best <Text style={{ color: '#cc0000' }}>?</Text>
            </Text>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 30, lineHeight: 24, fontWeight: '500' }}>
              Align your habits with your natural rhythm.
            </Text>

            <View style={{ width: '100%', paddingHorizontal: 4 }}>
              {options.map((option) => {
                const isSelected = selectedEnergy === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setSelectedEnergy(option.id);
                      if (energyError) setEnergyError(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? '#0a714e' : '#F7F7F9',
                      borderRadius: 32,
                      marginBottom: 12,
                      padding: 16,
                      paddingRight: 24,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.2 : 0,
                      shadowRadius: 8,
                      elevation: isSelected ? 3 : 0,
                    }, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
                  >
                    <View style={{ marginRight: 16 }}>
                      <Text style={{ fontSize: 32 }}>{option.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: isSelected ? '#ffffff' : '#000000', marginBottom: 2 }}>
                        {option.title}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: isSelected ? 'rgba(255,255,255,0.8)' : '#8E8E93' }}>
                        {option.desc}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {energyError && (
              <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                Please select an option
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFC', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#F2F2F7', marginBottom: 20 }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#8E8E93', lineHeight: 20 }}>
                <Text style={{ fontWeight: '700', color: '#000' }}>Energy is everything.</Text> We track it to help you stay consistent.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderTrackingSelection = () => {
    const options = [
      { id: 'graphs', title: 'Visual Analytics', desc: 'See the big picture', emoji: '📊' },
      { id: 'check_ins', title: 'Checklist Mode', desc: 'Simple & Fast', emoji: '✅' },
      { id: 'streaks', title: 'Streak Keeper', desc: "Don't break the chain", emoji: '🔥' },
      { id: 'not_sure', title: 'Undecided', desc: "I'll decide later", emoji: '🤔' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
            <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </Pressable>
            <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: '#0a714e',
                  borderRadius: 3,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.inputContent, { paddingTop: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 12 }}>
              How do you{'\n'}track progress <Text style={{ color: '#cc0000' }}>?</Text>
            </Text>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 30, lineHeight: 24, fontWeight: '500' }}>
              Find the view that keeps you going.
            </Text>

            <View style={{ width: '100%', paddingHorizontal: 4 }}>
              {options.map((option) => {
                const isSelected = selectedTracking === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setSelectedTracking(option.id);
                      if (trackingError) setTrackingError(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? '#0a714e' : '#F7F7F9',
                      borderRadius: 32,
                      marginBottom: 12,
                      padding: 16,
                      paddingRight: 24,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.2 : 0,
                      shadowRadius: 8,
                      elevation: isSelected ? 3 : 0,
                    }, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
                  >
                    <View style={{ marginRight: 16 }}>
                      <Text style={{ fontSize: 32 }}>{option.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: isSelected ? '#ffffff' : '#000000', marginBottom: 2 }}>
                        {option.title}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: isSelected ? 'rgba(255,255,255,0.8)' : '#8E8E93' }}>
                        {option.desc}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {trackingError && (
              <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                Please select an option
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFC', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#F2F2F7', marginBottom: 20 }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>📈</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#8E8E93', lineHeight: 20 }}>
                <Text style={{ fontWeight: '700', color: '#000' }}>Your Rules.</Text> Stats or streaks, it's up to you.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderGoalSelection = () => {
    const options = [
      { id: 'good_habits', title: 'Start Fresh', desc: 'Build new routines', emoji: '🌱' },
      { id: 'bad_habits', title: 'Break Free', desc: 'Quit bad habits', emoji: '🗑️' },
      { id: 'both', title: 'Total Reset', desc: 'Reinvent yourself', emoji: '🎯' },
      { id: 'not_sure', title: 'Undecided', desc: "I'll decide later", emoji: '🤔' },
    ];

    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
            <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </Pressable>
            <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: '#0a714e',
                  borderRadius: 3,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }}
              />
            </View>
          </View>

          {/* Content */}
          <View style={[styles.inputContent, { paddingTop: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 12 }}>
              What is{'\n'}the plan <Text style={{ color: '#cc0000' }}>?</Text>
            </Text>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 30, lineHeight: 24, fontWeight: '500' }}>
              Define your starting point.
            </Text>

            <View style={{ width: '100%', paddingHorizontal: 4 }}>
              {options.map((option) => {
                const isSelected = selectedGoal === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setSelectedGoal(option.id);
                      if (goalError) setGoalError(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{
                      width: '100%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isSelected ? '#0a714e' : '#F7F7F9',
                      borderRadius: 32,
                      marginBottom: 12,
                      padding: 16,
                      paddingRight: 24,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.2 : 0,
                      shadowRadius: 8,
                      elevation: isSelected ? 3 : 0,
                    }, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]}
                  >
                    <View style={{ marginRight: 16 }}>
                      <Text style={{ fontSize: 32 }}>{option.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: isSelected ? '#ffffff' : '#000000', marginBottom: 2 }}>
                        {option.title}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: isSelected ? 'rgba(255,255,255,0.8)' : '#8E8E93' }}>
                        {option.desc}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {goalError && (
              <Text style={{ color: '#FF3B30', fontSize: 13, marginTop: 8, textAlign: 'center', fontWeight: '500' }}>
                Please select an option
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFC', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#F2F2F7', marginBottom: 20 }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>🚀</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#8E8E93', lineHeight: 20 }}>
                <Text style={{ fontWeight: '700', color: '#000' }}>Reach Your Goals.</Text> Small steps lead to big changes.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderSolution = () => {
    // Plans Data
    // Plans Data
    const plans = [
      { id: 'yearly', title: 'Yearly', price: '$29.99', sub: '/yr', save: 'Most Popular' },
      { id: 'monthly', title: 'Monthly', price: '$4.99', sub: '/mo', save: '' },
      { id: 'lifetime', title: 'Lifetime', price: '$99.99', sub: 'one-time', save: 'Best Value' },
    ];

    return (
      <View style={[styles.container, { backgroundColor: '#fff', position: 'relative' }]}>

        {/* Background Circles Design */}
        <View style={StyleSheet.absoluteFill}>
          <View style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#0a714e', opacity: 0.05 }} />
          <View style={{ position: 'absolute', top: 100, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#0a714e', opacity: 0.03 }} />
          <View style={{ position: 'absolute', bottom: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#0a714e', opacity: 0.05 }} />
        </View>

        {/* Close Button */}
        <Pressable
          style={({ pressed }) => [{
            position: 'absolute', top: 60, right: 24, zIndex: 50,
            width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F2F7',
            justifyContent: 'center', alignItems: 'center', opacity: pressed ? 0.7 : 1
          }]}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <View style={{ width: 14, height: 2, backgroundColor: '#8E8E93', transform: [{ rotate: '45deg' }], position: 'absolute' }} />
          <View style={{ width: 14, height: 2, backgroundColor: '#8E8E93', transform: [{ rotate: '-45deg' }], position: 'absolute' }} />
        </Pressable>

        <ScrollView contentContainerStyle={{ paddingTop: 100, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>

          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ fontFamily: 'Garet-Heavy', fontSize: 32, textAlign: 'left', color: '#000', marginBottom: 16 }}>
              Hey <Text style={{ color: '#0a714e' }}>{name}</Text>,{'\n'}it is time to get full access to Habbit<Text style={{ color: '#cc0000' }}>.</Text>
            </Text>

            <View style={{ gap: 12, marginBottom: 24 }}>
              {[
                "Unlimited Habits Tracking",
                "Advanced Analytics & Charts",
                "Secure Cloud Backup",
                "Personalized Assessments",
                "Exclusive App Icons"
              ].map((feature, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Text style={{ color: '#0a714e', fontSize: 14 }}>✓</Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* 3 Plans Selection Compact */}
            <View style={{ gap: 10 }}>
              {plans.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <Pressable
                    key={plan.id}
                    onPress={() => {
                      setSelectedPlan(plan.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={({ pressed }) => [{
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? '#0a714e' : '#F2F2F7',
                      borderRadius: 16,
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      backgroundColor: '#fff',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isSelected ? 0.08 : 0.02,
                      shadowRadius: 4,
                      elevation: isSelected ? 2 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }]
                    }]}
                  >
                    {/* Title & Badge Layout: Row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#000' }}>{plan.title}</Text>
                      {plan.save ? (
                        <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 8 }}>
                          <Text style={{ color: '#0a714e', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{plan.save}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Price */}
                    <Text style={{ fontSize: 16, fontWeight: '700', color: isSelected ? '#0a714e' : '#000' }}>
                      {plan.price}<Text style={{ fontSize: 12, color: '#8E8E93' }}>{plan.sub}</Text>
                    </Text>
                  </Pressable>
                );
              })}
            </View>

          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footerContainer, { backgroundColor: 'transparent' }]}>
          {/* Blur Fade Background could be nice here, but simple white is fine for now */}
          <View style={{ position: 'absolute', bottom: 0, width: width, height: 100, backgroundColor: '#fff', opacity: 0.95 }} />

          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }, { shadowColor: '#0a714e', shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 8 }]} onPress={() => { }}>
            <Text style={styles.buttonText}>
              {selectedPlan === 'lifetime' ? 'Get Lifetime Access' : 'Start 7-Day Free Trial'}
            </Text>
          </Pressable>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 20 }}>
            <Text style={{ fontSize: 12, color: '#C7C7CC', fontWeight: '500' }}>Terms</Text>
            <Text style={{ fontSize: 12, color: '#C7C7CC', fontWeight: '500' }}>Privacy</Text>
            <Text style={{ fontSize: 12, color: '#C7C7CC', fontWeight: '500' }}>Restore</Text>
          </View>
        </View>
      </View>
    );
  };


  const renderCommitment = () => {
    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
            <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </Pressable>
            <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
              <Animated.View style={{ height: '100%', backgroundColor: '#0a714e', borderRadius: 3, width: '94%' }} />
            </View>
          </View>

          <View style={[styles.inputContent, { paddingTop: 0, alignItems: 'center' }]}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: '#000000', letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 12 }}>
              Your{'\n'}Commitment
            </Text>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 40, lineHeight: 24, fontWeight: '500' }}>
              Make it official.
            </Text>
            <View style={{ marginBottom: 40 }}>
              <Text style={{ fontSize: 100 }}>🤝</Text>
            </View>

            <View style={{ backgroundColor: '#F7F7F9', padding: 24, borderRadius: 24, width: '100%' }}>
              <Text style={{ fontSize: 18, color: '#000000', lineHeight: 28, textAlign: 'center', fontWeight: '600' }}>
                "I, <Text style={{ color: '#0a714e', fontWeight: '800' }}>{name}</Text>, commit to creating a better version of myself, starting today."
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.footerContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={handleContinue}>
            <Text style={styles.buttonText}>I Commit</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderTimeSelection = () => {
    const times = ["After waking up", "With breakfast", "During lunch", "In the evening", "Before bed"];
    return (
      <View style={[styles.container, { justifyContent: 'space-between' }]}>
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomWidth: 0, paddingBottom: 0, justifyContent: 'center', position: 'relative', height: 60, marginBottom: 10 }]}>
            <Pressable style={({ pressed }) => [styles.backButton, { position: 'absolute', left: 20, zIndex: 10 }, pressed && { opacity: 0.7 }]} onPress={handleBack}>
              <View style={styles.backIconShape} />
            </Pressable>
            <View style={{ width: 100, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden' }}>
              <Animated.View style={{ height: '100%', backgroundColor: '#0a714e', borderRadius: 3, width: '98%' }} />
            </View>
          </View>
          <View style={[styles.inputContent, { paddingTop: 0 }]}>
            <Text style={styles.inputTitle}>Lock it in</Text>
            <Text style={styles.inputSubtitle}>
              When will you do <Text style={{ fontWeight: '700', color: '#000' }}>"{habitName}"</Text>?
            </Text>
            <View style={{ width: '100%', marginTop: 20 }}>
              {times.map((t) => (
                <Pressable
                  onPress={() => { setHabitTime(t); }}
                  style={({ pressed }) => [{
                    width: '100%',
                    padding: 16,
                    backgroundColor: habitTime === t ? '#0a714e' : '#F2F2F7',
                    borderRadius: 16,
                    marginBottom: 10
                  }, pressed && { opacity: 0.8 }]}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: habitTime === t ? '#fff' : '#000' }}>{t}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.footerContainer}>
          <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]} onPress={handleContinue}>
            <Text style={styles.buttonText}>Set Reminder</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderPaywall = () => {
    return (
      <View style={[styles.container, { justifyContent: 'space-between', backgroundColor: '#000' }]}>
        <View style={{ flex: 1, padding: 24, paddingTop: 60 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 10, letterSpacing: -0.5 }}>Unlock Full Potential</Text>
          <Text style={{ fontSize: 16, color: '#rgba(255,255,255,0.7)', marginBottom: 40, lineHeight: 24 }}>
            Get unlimited habits, advanced stats, and cloud sync.
          </Text>

          <View style={{ marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 24, marginRight: 16 }}>∞</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>Unlimited Habits</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 24, marginRight: 16 }}>☁️</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>Cloud Backup</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 24, marginRight: 16 }}>⭐</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>Premium Support</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 24, paddingBottom: 50 }}>
          <Pressable
            style={({ pressed }) => [[styles.button, { backgroundColor: '#fff' }], pressed && { opacity: 0.8 }]}
            onPress={handleContinue}>
            <Text style={[styles.buttonText, { color: '#000' }]}>Try Free for 7 Days</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [{ marginTop: 20, alignItems: 'center' }, pressed && { opacity: 0.7 }]}
            onPress={handleContinue}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Maybe Later</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCreateHabit = () => {
    return (
      <View style={[styles.container, { paddingHorizontal: 24, paddingTop: 60 }]}>
        {/* Custom Header with Back */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' }, pressed && { opacity: 0.7 }]}
          >
            <View style={{ width: 12, height: 12, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#000', transform: [{ rotate: '-45deg' }, { translateX: 2 }] }} />
          </Pressable>
        </View>

        <Text style={{ fontSize: 32, fontWeight: '800', marginBottom: 16 }}>Create Habit</Text>
        <TextInput
          style={{ fontSize: 24, fontWeight: '600', borderBottomWidth: 2, borderBottomColor: '#E5E5EA', paddingVertical: 10 }}
          placeholder="Name your habit"
          placeholderTextColor="#C7C7CC"
          value={habitName}
          onChangeText={setHabitName}
          autoFocus
        />

        <Pressable
          style={({ pressed }) => [styles.button, { marginTop: 40 }, pressed && { opacity: 0.8 }]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Save Habit</Text>
        </Pressable>
      </View>
    );
  };

  const renderDashboard = () => {
    const renderContent = () => {
      if (activeTab === 'home') {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 100 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F2F2F7', borderWidth: 2, borderColor: '#E5E5EA', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 32, opacity: 0.3 }}>📝</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#8E8E93', textAlign: 'center', marginBottom: 24 }}>
              You don't have any habits yet.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.button, { width: 'auto', paddingHorizontal: 32, height: 50 }, pressed && { opacity: 0.8 }]}
              onPress={() => {
                setHabitName('');
                setCurrentScreen('createHabit');
              }}
            >
              <Text style={styles.buttonText}>+ Create New Habit</Text>
            </Pressable>
          </View>
        );
      } else if (activeTab === 'stats') {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>Statistics</Text>
            <Text style={{ color: '#8E8E93', marginTop: 10 }}>Your progress will appear here.</Text>
          </View>
        );
      } else if (activeTab === 'settings') {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>Settings</Text>
            <Text style={{ color: '#8E8E93', marginTop: 10 }}>App preferences.</Text>
          </View>
        );
      }
    };

    return (
      <View style={[styles.container, { backgroundColor: '#fff', justifyContent: 'flex-start' }]}>
        {/* Header */}
        <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 10 }}>
          <Text style={{ fontFamily: 'Garet-Heavy', fontSize: 32, color: '#000' }}>habbit<Text style={{ color: '#0a714e' }}>.</Text></Text>
        </View>

        {renderContent()}

        {/* Floating Modern Navbar */}
        <View style={{ position: 'absolute', bottom: 40, left: 24, right: 24, height: 70, backgroundColor: '#ffffff', borderRadius: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 10, borderWidth: 1, borderColor: '#F2F2F7' }}>
          <Pressable onPress={() => { setActiveTab('home'); Haptics.selectionAsync(); }} style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, opacity: activeTab === 'home' ? 1 : 0.3 }}>🏠</Text>
            {activeTab === 'home' && <View style={{ width: 4, height: 4, backgroundColor: '#0a714e', borderRadius: 2, marginTop: 4 }} />}
          </Pressable>
          <Pressable onPress={() => { setActiveTab('stats'); Haptics.selectionAsync(); }} style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, opacity: activeTab === 'stats' ? 1 : 0.3 }}>📊</Text>
            {activeTab === 'stats' && <View style={{ width: 4, height: 4, backgroundColor: '#0a714e', borderRadius: 2, marginTop: 4 }} />}

          </Pressable>
          <Pressable onPress={() => { setActiveTab('settings'); Haptics.selectionAsync(); }} style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, opacity: activeTab === 'settings' ? 1 : 0.3 }}>⚙️</Text>
            {activeTab === 'settings' && <View style={{ width: 4, height: 4, backgroundColor: '#0a714e', borderRadius: 2, marginTop: 4 }} />}
          </Pressable>
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
                              currentScreen === 'whatCanDo' ? <WhatCanDoView onBack={handleBack} onContinue={handleContinue} progressAnim={progressAnim} name={name} /> :
                                currentScreen === 'solution' ? renderSolution() :
                                  currentScreen === 'dashboard' ? renderDashboard() :
                                    currentScreen === 'createHabit' ? renderCreateHabit() :
                                      renderNameInput()}
      {(!isAppReady || !fontsLoaded) && (
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
    fontSize: 28, // Reduced from 38
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 15, // Reduced from 16
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: 24, // Reduced from 29
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.6,
  },
  welcomeUserSubtitle: {
    fontSize: 14, // Reduced from 14.5
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
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
    padding: 16, // Increased padding
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    // No border
  },
  optionCardSelected: {
    backgroundColor: '#0a714e', // Brand Color Selection
    // No border
  },
  optionIconContainer: {
    width: 40, // Increased size
    height: 40, // Increased size
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor removed
    borderRadius: 12,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 15, // Reduced from 17
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  optionDesc: {
    fontSize: 12, // Reduced from 13
    color: '#8E8E93',
    lineHeight: 16,
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
    marginTop: Platform.OS === 'ios' ? 44 : 24,
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
    alignItems: 'stretch', // Changed from center to stretch for left align
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
    marginTop: 10, // Added margin top
    textAlign: 'left',
    alignSelf: 'flex-start',
    letterSpacing: -0.6,
    borderLeftWidth: 3,
    borderLeftColor: '#0a714e',
    paddingLeft: 12,
    marginLeft: 4,
  },
  inputSubtitle: {
    fontSize: 14, // Reduced from 16
    color: '#8E8E93',
    textAlign: 'left',
    marginBottom: 30,
    lineHeight: 20,
    letterSpacing: 0,
    paddingLeft: 20,
  },
  inputWrapper: {
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5EA',
    marginBottom: 8,
    paddingBottom: 4,
  },
  textInput: {
    fontSize: 26, // Reduced from 32
    fontWeight: '700',
    color: '#000000',
    textAlign: 'left',
    paddingVertical: 4,
    letterSpacing: -0.4,
    paddingLeft: 6,
  },
  charCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 5,
    textAlign: 'right', // Keeping right alignment relative to the wrapper is tricky if wrapper is 100%.
    alignSelf: 'flex-end', // Let's keep it right-aligned as per persistent preference, relative to the wide input wrapper
  },
});
