import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export default function App() {
  const [isAdMobReady, setIsAdMobReady] = useState(false);

  useEffect(() => {
    // Safely initialize AdMob inside useEffect with error catching
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        setIsAdMobReady(true);
      })
      .catch(error => {
        // Prevent crash if ads fail to load or initialize
        console.warn('AdMob init error:', error);
        setIsAdMobReady(true);
      });
  }, []);

  return (
    <View style={styles.container}>
      {/* Your Loan Planner app content goes here */}
      <Text style={styles.title}>Timely Loan Planner</Text>

      {/* Render Banner Ad safely once initialized */}
      {isAdMobReady && (
        <View style={styles.adContainer}>
          <BannerAd
            unitId={TestIds.BANNER} // Use TestIds.BANNER while testing to prevent account bans or crashes
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdFailedToLoad={(error) => console.log('Ad failed:', error)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  adContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});
