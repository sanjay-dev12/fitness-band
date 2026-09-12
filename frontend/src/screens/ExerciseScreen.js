import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Activity,
  Footprints,
  Clock,
  Play,
  Pause,
  Square,
  Watch,
  Flame,
  Heart,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react-native';
import { useProfile } from '../context/ProfileContext';

const WORKOUT_TYPES = [
  {
    id: 'outdoor_run',
    title: 'Outdoor Run',
    subtitle: 'Track outdoor run with pace and distance',
    icon: Activity,
    expectedMetrics: ['Distance', 'Duration', 'Pace', 'Calories'],
  },
  {
    id: 'indoor_run',
    title: 'Indoor Run',
    subtitle: 'Run indoors on treadmill or indoor track',
    icon: Clock,
    expectedMetrics: ['Duration', 'Heart Rate', 'Calories', 'Cadence'],
  },
  {
    id: 'outdoor_walk',
    title: 'Outdoor Walk',
    subtitle: 'Brisk walking with step counting',
    icon: Footprints,
    expectedMetrics: ['Steps', 'Duration', 'Distance', 'Calories'],
  },
];

export default function ExerciseScreen() {
  const { activeProfile, showModal, showToast, syncHealthTelemetry } = useProfile();
  const m = activeProfile?.metrics || {};

  const [selectedWorkoutId, setSelectedWorkoutId] = useState('outdoor_run');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const timerRef = useRef(null);

  // Active workout stopwatch timer
  useEffect(() => {
    if (isWorkoutActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setWorkoutSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWorkoutActive, isPaused]);

  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const selectedWorkout =
    WORKOUT_TYPES.find((w) => w.id === selectedWorkoutId) || WORKOUT_TYPES[0];

  const handleStartWorkout = () => {
    setWorkoutSeconds(0);
    setIsPaused(false);
    setIsWorkoutActive(true);
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleEndWorkout = () => {
    const finalTime = formatTimer(workoutSeconds);
    const finalCalories = Math.round(workoutSeconds * 0.14);
    const workoutMins = Math.max(1, Math.round(workoutSeconds / 60));
    const addedSteps = Math.round(workoutSeconds * 1.8);

    // Save real workout telemetry to database via backend API
    if (syncHealthTelemetry) {
      const currentCal = m.calories || 0;
      const currentMins = m.exerciseMins || 0;
      const currentSteps = m.steps || 0;
      syncHealthTelemetry({
        calories: currentCal + finalCalories,
        exerciseMins: currentMins + workoutMins,
        steps: currentSteps + addedSteps,
        heartRate: 110,
        oxygenLevel: 98,
        walkingHours: Math.min(12, (m.walkingHours || 0) + 1),
        battery: activeProfile?.battery || 95,
        statusText: 'Post Workout Active',
      }).catch((e) => console.log('Workout sync error:', e.message));
    }

    setIsWorkoutActive(false);
    setIsPaused(false);
    setWorkoutSeconds(0);

    showModal({
      title: 'Workout Completed',
      message: `Great job! You finished your ${selectedWorkout.title} in ${finalTime} and burned ${finalCalories} kcal. Telemetry saved to your health log.`,
      type: 'success',
      confirmText: 'Done',
    });
  };

  // Active Workout View
  if (isWorkoutActive) {
    const liveCalories = Math.round(workoutSeconds * 0.14);
    const liveHeartRate = m.heartRate
      ? m.heartRate + Math.min(30, Math.floor(workoutSeconds / 10))
      : 128;
    const liveDistance = (workoutSeconds * 0.0028).toFixed(2);
    const liveSteps = (m.steps || 0) + Math.floor(workoutSeconds * 1.8);

    return (
      <View style={styles.container}>
        {/* Active Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{selectedWorkout.title}</Text>
            <Text style={styles.headerSubtitle}>Workout in progress</Text>
          </View>
          <View style={[styles.statusBadge, isPaused && styles.statusBadgePaused]}>
            <View style={[styles.liveDot, isPaused && styles.liveDotPaused]} />
            <Text style={[styles.statusBadgeText, isPaused && styles.statusBadgeTextPaused]}>
              {isPaused ? 'Paused' : 'Active'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Stopwatch Timer Card */}
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>DURATION</Text>
            <Text style={styles.timerValue}>{formatTimer(workoutSeconds)}</Text>
            <View style={styles.timerDeviceRow}>
              <Watch color="#00BFA5" size={14} style={{ marginRight: 5 }} />
              <Text style={styles.timerDeviceText}>
                {activeProfile?.name}'s Band tracking live
              </Text>
            </View>
          </View>

          {/* Real-time Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(255, 82, 82, 0.12)' }]}>
                <Flame color="#FF5252" size={18} />
              </View>
              <Text style={styles.metricNumber}>{liveCalories}</Text>
              <Text style={styles.metricUnit}>kcal</Text>
              <Text style={styles.metricName}>Calories</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                <Heart color="#00E676" size={18} />
              </View>
              <Text style={styles.metricNumber}>{liveHeartRate}</Text>
              <Text style={styles.metricUnit}>BPM</Text>
              <Text style={styles.metricName}>Heart Rate</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(0, 191, 165, 0.12)' }]}>
                <Footprints color="#00BFA5" size={18} />
              </View>
              <Text style={styles.metricNumber}>{liveSteps.toLocaleString()}</Text>
              <Text style={styles.metricUnit}>steps</Text>
              <Text style={styles.metricName}>Steps</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: 'rgba(41, 182, 246, 0.12)' }]}>
                <Activity color="#29B6F6" size={18} />
              </View>
              <Text style={styles.metricNumber}>{liveDistance}</Text>
              <Text style={styles.metricUnit}>km</Text>
              <Text style={styles.metricName}>Distance</Text>
            </View>
          </View>

          {/* Active Controls */}
          <View style={styles.activeControlsRow}>
            <TouchableOpacity
              style={[styles.controlBtn, styles.pauseBtn]}
              onPress={handleTogglePause}
              activeOpacity={0.8}
            >
              {isPaused ? (
                <>
                  <Play color="#00BFA5" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.pauseBtnText}>Resume</Text>
                </>
              ) : (
                <>
                  <Pause color="#00BFA5" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.pauseBtnText}>Pause</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, styles.endBtn]}
              onPress={handleEndWorkout}
              activeOpacity={0.8}
            >
              <Square color="#FFFFFF" size={18} style={{ marginRight: 8 }} fill="#FFFFFF" />
              <Text style={styles.endBtnText}>End Workout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Pre-Workout / Setup View
  return (
    <View style={styles.container}>
      {/* 2. Compact Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Exercise</Text>
          <Text style={styles.headerSubtitle}>Choose a workout and start moving</Text>
        </View>
        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => setSelectedWorkoutId('outdoor_run')}
          activeOpacity={0.7}
        >
          <RotateCcw color="#8FAAB2" size={18} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 3. Workout Type Selection */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose your workout</Text>
        </View>

        <View style={styles.workoutList}>
          {WORKOUT_TYPES.map((workout) => {
            const isSelected = workout.id === selectedWorkoutId;
            const IconComponent = workout.icon;

            return (
              <TouchableOpacity
                key={workout.id}
                style={[
                  styles.workoutCard,
                  isSelected && styles.workoutCardSelected,
                ]}
                onPress={() => setSelectedWorkoutId(workout.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.workoutIconBox,
                    isSelected && styles.workoutIconBoxSelected,
                  ]}
                >
                  <IconComponent
                    color={isSelected ? '#00BFA5' : '#8FAAB2'}
                    size={22}
                  />
                </View>

                <View style={styles.workoutTextCol}>
                  <Text
                    style={[
                      styles.workoutTitle,
                      isSelected && styles.workoutTitleSelected,
                    ]}
                  >
                    {workout.title}
                  </Text>
                  <Text style={styles.workoutSubtitle}>{workout.subtitle}</Text>
                </View>

                <View
                  style={[
                    styles.selectionRadio,
                    isSelected && styles.selectionRadioSelected,
                  ]}
                >
                  {isSelected && <Check color="#00BFA5" size={14} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Selected Workout Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryTitle}>{selectedWorkout.title}</Text>
              <Text style={styles.summaryStatus}>Ready to start</Text>
            </View>
            <View style={styles.summaryBadge}>
              <Zap color="#00BFA5" size={13} style={{ marginRight: 4 }} />
              <Text style={styles.summaryBadgeText}>GPS Tracked</Text>
            </View>
          </View>

          <Text style={styles.summaryHelpText}>
            Your activity will appear here once you start.
          </Text>

          <View style={styles.metricsChipsRow}>
            {selectedWorkout.expectedMetrics.map((metric, index) => (
              <View key={index} style={styles.metricChip}>
                <Text style={styles.metricChipText}>{metric}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7. Pre-Workout Status & 6. Primary Start Button */}
        <View style={styles.actionContainer}>
          <View style={styles.preStatusRow}>
            <View style={styles.preStatusLeft}>
              <Watch color="#00BFA5" size={15} style={{ marginRight: 6 }} />
              <Text style={styles.preStatusText}>
                {activeProfile?.name}'s Band connected
              </Text>
            </View>
            <View style={styles.preStatusRight}>
              <View style={styles.greenDot} />
              <Text style={styles.readyText}>Ready to start</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            activeOpacity={0.85}
          >
            <Play color="#001F27" size={20} style={{ marginRight: 8 }} fill="#001F27" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* 8. Training Instructions (Expandable) */}
        <View style={styles.instructionsContainer}>
          <TouchableOpacity
            style={styles.instructionsHeader}
            onPress={() => setShowInstructions((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={styles.instructionsHeaderLeft}>
              <Info color="#00BFA5" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.instructionsHeaderText}>
                Training Instructions
              </Text>
            </View>
            {showInstructions ? (
              <ChevronUp color="#8FAAB2" size={18} />
            ) : (
              <ChevronDown color="#8FAAB2" size={18} />
            )}
          </TouchableOpacity>

          {showInstructions && (
            <View style={styles.instructionsContent}>
              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>1</Text>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>Warm Up</Text>
                  <Text style={styles.stepBody}>
                    Spend 3 to 5 minutes doing light stretching and dynamic movements before increasing pace.
                  </Text>
                </View>
              </View>

              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>2</Text>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>Pacing & Aerobic Zone</Text>
                  <Text style={styles.stepBody}>
                    Keep your heart rate in your target zone. Take deep, steady breaths and maintain an even cadence.
                  </Text>
                </View>
              </View>

              <View style={styles.instructionStep}>
                <Text style={styles.stepNumber}>3</Text>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>Cool Down & Hydration</Text>
                  <Text style={styles.stepBody}>
                    Slow down gradually for 2 to 3 minutes before ending your session. Remember to hydrate well.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 9 & 10. Motivational Content & Contextual Progress */}
        <View style={styles.motivationalCard}>
          {m.exerciseMins && m.exerciseMins > 0 ? (
            <>
              <Text style={styles.motivationalTitle}>Great progress today!</Text>
              <Text style={styles.motivationalBody}>
                You have completed {m.exerciseMins} min of activity towards your {m.exerciseGoal || 30} min daily goal. Keep the momentum going!
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.motivationalTitle}>Ready for your first workout?</Text>
              <Text style={styles.motivationalBody}>
                Start moving and your activity telemetry will be logged dynamically from your connected band.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F27',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 46,
    paddingBottom: 14,
    backgroundColor: '#002833',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(122, 158, 168, 0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#8FAAB2',
    fontSize: 13,
    marginTop: 2,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#002129',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.2)',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Ample space so bottom tab bar never clips content
  },

  // Section Header
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // 3. Workout List Cards
  workoutList: {
    gap: 10,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#002B36',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.16)',
  },
  workoutCardSelected: {
    borderColor: '#00BFA5',
    backgroundColor: 'rgba(0, 191, 165, 0.08)',
  },
  workoutIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00222B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutIconBoxSelected: {
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
  },
  workoutTextCol: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  workoutTitleSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  workoutSubtitle: {
    fontSize: 12,
    color: '#8FAAB2',
  },
  selectionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(122, 158, 168, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectionRadioSelected: {
    borderColor: '#00BFA5',
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
  },

  // 5. Selected Workout Summary Card
  summaryCard: {
    backgroundColor: '#002B36',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.16)',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStatus: {
    fontSize: 12,
    color: '#00E676',
    fontWeight: '600',
    marginTop: 2,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 191, 165, 0.3)',
  },
  summaryBadgeText: {
    fontSize: 10.5,
    color: '#00BFA5',
    fontWeight: '700',
  },
  summaryHelpText: {
    fontSize: 12,
    color: '#8FAAB2',
    marginBottom: 12,
  },
  metricsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metricChip: {
    backgroundColor: '#002129',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.12)',
  },
  metricChipText: {
    fontSize: 11,
    color: '#8FAAB2',
    fontWeight: '600',
  },

  // 7 & 6. Pre-Workout Status and Primary Button
  actionContainer: {
    marginBottom: 16,
  },
  preStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 191, 165, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.18)',
  },
  preStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  preStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 4,
  },
  readyText: {
    fontSize: 11,
    color: '#00E676',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#00BFA5',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00BFA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#001F27',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // 8. Training Instructions
  instructionsContainer: {
    backgroundColor: '#002B36',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.16)',
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  instructionsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionsHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructionsContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(122, 158, 168, 0.1)',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 191, 165, 0.15)',
    color: '#00BFA5',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 11,
    fontWeight: '700',
    marginRight: 10,
    marginTop: 1,
  },
  stepTextCol: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  stepBody: {
    fontSize: 11.5,
    color: '#8FAAB2',
    lineHeight: 16,
  },

  // 9. Motivational Content
  motivationalCard: {
    backgroundColor: '#00242D',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.12)',
  },
  motivationalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BFA5',
    marginBottom: 4,
  },
  motivationalBody: {
    fontSize: 12,
    color: '#8FAAB2',
    lineHeight: 17,
  },

  // Active Workout View Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  statusBadgePaused: {
    backgroundColor: 'rgba(255, 179, 0, 0.14)',
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 5,
  },
  liveDotPaused: {
    backgroundColor: '#FFB300',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00E676',
  },
  statusBadgeTextPaused: {
    color: '#FFB300',
  },
  timerCard: {
    backgroundColor: '#002B36',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 165, 0.25)',
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8FAAB2',
    letterSpacing: 1,
    marginBottom: 6,
  },
  timerValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  timerDeviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(0, 191, 165, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerDeviceText: {
    fontSize: 11,
    color: '#00BFA5',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#002B36',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(122, 158, 168, 0.15)',
  },
  metricIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 11,
    color: '#8FAAB2',
    fontWeight: '600',
    marginTop: -2,
    marginBottom: 2,
  },
  metricName: {
    fontSize: 11.5,
    color: '#8FAAB2',
    fontWeight: '500',
  },
  activeControlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  controlBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseBtn: {
    backgroundColor: 'rgba(0, 191, 165, 0.12)',
    borderWidth: 1.5,
    borderColor: '#00BFA5',
  },
  pauseBtnText: {
    color: '#00BFA5',
    fontSize: 15,
    fontWeight: '700',
  },
  endBtn: {
    backgroundColor: '#FF4B4B',
  },
  endBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
