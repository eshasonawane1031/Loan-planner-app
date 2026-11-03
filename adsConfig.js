import { TestIds } from 'react-native-google-mobile-ads';

export const USE_PRODUCTION_ADS = true;

export const AD_CONFIG = {
  appId: 'ca-app-pub-4385379627058219~7345793426',
  bannerAdUnitId: USE_PRODUCTION_ADS
    ? 'ca-app-pub-4385379627058219/9162272128'
    : TestIds.BANNER,
  interstitialAdUnitId: USE_PRODUCTION_ADS
    ? 'ca-app-pub-4385379627058219/6367541649'
    : TestIds.INTERSTITIAL,
  rewardedAdUnitId: USE_PRODUCTION_ADS
    ? 'ca-app-pub-4385379627058219/4862888286'
    : TestIds.REWARDED,
  cooldownMs: 60000,
};
