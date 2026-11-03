import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { AD_CONFIG } from './adsConfig';

const interstitial = InterstitialAd.createForAdRequest(AD_CONFIG.interstitialAdUnitId, {
  requestNonPersonalizedAdsOnly: false,
});

const rewarded = RewardedAd.createForAdRequest(AD_CONFIG.rewardedAdUnitId, {
  requestNonPersonalizedAdsOnly: false,
});

export default function App() {
  const [screen, setScreen] = useState('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  
  const [loanAmount, setLoanAmount] = useState('50000');
  const [interestRate, setInterestRate] = useState('11.5');
  const [tenureMonths, setTenureMonths] = useState('12');
  const [emi, setEmi] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);

  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);
  const [unlockedReport, setUnlockedReport] = useState(false);
  const [lastAdTime, setLastAdTime] = useState(0);

  useEffect(() => {
    const unsubInterLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
    });
    const unsubInterClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      interstitial.load();
    });

    const unsubRewLoad = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setRewardedLoaded(true);
    });
    const unsubRewEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      setUnlockedReport(true);
      Alert.alert('Unlocked!', 'Detailed repayment schedule is now available below.');
    });
    const unsubRewClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setRewardedLoaded(false);
      rewarded.load();
    });

    interstitial.load();
    rewarded.load();

    return () => {
      unsubInterLoad();
      unsubInterClosed();
      unsubRewLoad();
      unsubRewEarned();
      unsubRewClosed();
    };
  }, []);

  const triggerInterstitial = (onComplete) => {
    const now = Date.now();
    if (interstitialLoaded && now - lastAdTime > AD_CONFIG.cooldownMs) {
      interstitial.show();
      setLastAdTime(now);
    }
    if (onComplete) onComplete();
  };

  const handleLogin = () => {
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    triggerInterstitial(() => setScreen('info'));
  };

  const handleInfoSubmit = () => {
    if (!fullName.trim() || !monthlyIncome.trim()) {
      Alert.alert('Required Fields', 'Please complete your basic profile details.');
      return;
    }
    triggerInterstitial(() => setScreen('dashboard'));
  };

  const calculateLoan = () => {
    const P = parseFloat(loanAmount);
    const R = parseFloat(interestRate) / 12 / 100;
    const N = parseFloat(tenureMonths);

    if (isNaN(P) || isNaN(R) || isNaN(N) || P <= 0 || N <= 0) {
      Alert.alert('Error', 'Please enter valid loan parameters.');
      return;
    }

    const emiCalc = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPay = emiCalc * N;
    const totalInt = totalPay - P;

    setEmi(emiCalc.toFixed(2));
    setTotalInterest(totalInt.toFixed(2));
    setTotalPayment(totalPay.toFixed(2));
  };

  const handleWatchRewarded = () => {
    if (rewardedLoaded) {
      rewarded.show();
    } else {
      Alert.alert('Loading Video', 'Ad is preparing, please try again in a few seconds.');
      rewarded.load();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {screen === 'login' && (
        <View style={styles.screenContainer}>
          <Text style={styles.logoTitle}>Timely Planner</Text>
          <Text style={styles.subTitle}>Quick & Secure Financial Planning</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
              <Text style={styles.btnText}>Login / Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {screen === 'info' && (
        <View style={styles.screenContainer}>
          <Text style={styles.logoTitle}>Basic Profile</Text>
          <Text style={styles.subTitle}>Step 2 of 2: Complete Profile Setup</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#64748B"
              value={fullName}
              onChangeText={setFullName}
            />
            <Text style={styles.label}>Monthly Income (₹ / $)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 35000"
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleInfoSubmit}>
              <Text style={styles.btnText}>Proceed to Planner</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {screen === 'dashboard' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.dashboardTitle}>EMI & Repayment Calculator</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Loan Amount</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={loanAmount}
              onChangeText={setLoanAmount}
            />
            <Text style={styles.label}>Annual Interest Rate (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={interestRate}
              onChangeText={setInterestRate}
            />
            <Text style={styles.label}>Tenure (Months)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tenureMonths}
              onChangeText={setTenureMonths}
            />
            <TouchableOpacity style={styles.calcBtn} onPress={calculateLoan}>
              <Text style={styles.btnText}>Calculate EMI</Text>
            </TouchableOpacity>
          </View>

          {emi && (
            <View style={styles.resultCard}>
              <Text style={styles.resultHeader}>Repayment Calculation</Text>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Monthly EMI:</Text>
                <Text style={styles.rowHighlight}>{emi}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Total Interest:</Text>
                <Text style={styles.rowValue}>{totalInterest}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Total Amount:</Text>
                <Text style={styles.rowValue}>{totalPayment}</Text>
              </View>

              {!unlockedReport ? (
                <TouchableOpacity style={styles.rewardBtn} onPress={handleWatchRewarded}>
                  <Text style={styles.rewardBtnText}>
                    Watch Video to Unlock Amortization Breakdown
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.scheduleBox}>
                  <Text style={styles.scheduleTitle}>Amortization Preview:</Text>
                  <Text style={styles.scheduleText}>• Month 1: Principal {(loanAmount / tenureMonths).toFixed(2)} | Interest {(totalInterest / tenureMonths).toFixed(2)}</Text>
                  <Text style={styles.scheduleText}>• Month 2: Principal {(loanAmount / tenureMonths).toFixed(2)} | Interest {(totalInterest / tenureMonths).toFixed(2)}</Text>
                  <Text style={styles.scheduleText}>• Month 3: Principal {(loanAmount / tenureMonths).toFixed(2)} | Interest {(totalInterest / tenureMonths).toFixed(2)}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={AD_CONFIG.bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B132B' },
  screenContainer: { flex: 1, justifyContent: 'center', padding: 20, paddingBottom: 80 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  logoTitle: { fontSize: 26, fontWeight: '800', color: '#F8FAFC', textAlign: 'center' },
  subTitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginBottom: 24, marginTop: 4 },
  dashboardTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC', marginBottom: 16, marginTop: 8 },
  card: { backgroundColor: '#1C2541', borderRadius: 12, padding: 18, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#CBD5E1', marginBottom: 6 },
  input: {
    backgroundColor: '#3A506B',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
  },
  primaryBtn: { backgroundColor: '#3B82F6', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  calcBtn: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  resultCard: { backgroundColor: '#1C2541', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#3A506B' },
  resultHeader: { fontSize: 16, fontWeight: '700', color: '#F8FAFC', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  rowLabel: { color: '#94A3B8', fontSize: 14 },
  rowValue: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  rowHighlight: { color: '#38BDF8', fontSize: 17, fontWeight: '700' },
  rewardBtn: { backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  rewardBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  scheduleBox: { marginTop: 14, padding: 12, backgroundColor: '#064E3B', borderRadius: 8 },
  scheduleTitle: { color: '#6EE7B7', fontWeight: '700', marginBottom: 6 },
  scheduleText: { color: '#ECFDF5', fontSize: 12, marginVertical: 2 },
  bannerContainer: { position: 'absolute', bottom: 0, width: '100%', alignItems: 'center', backgroundColor: '#0B132B' },
});
