const IS_DEV = process.env.APP_VARIANT === 'development';

import appJson from './app.json';

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    name: IS_DEV ? 'Termy (Dev)' : 'Termy',
    ios: {
      ...appJson.expo?.ios,
      bundleIdentifier: IS_DEV 
        ? 'com.nnadozi.termy.dev' 
        : 'com.nnadozi.termy',
    },
    android: {
      ...appJson.expo?.android,
      package: IS_DEV 
        ? 'com.nnadozi.termy.dev' 
        : 'com.nnadozi.termy',
      googleServicesFile: IS_DEV 
        ? process.env.GOOGLE_SERVICES_DEV ??  './google-services-dev.json'
        : process.env.GOOGLE_SERVICES_PROD ??  './google-services-prod.json'
    },
    plugins: [
      ...appJson.expo.plugins.filter(plugin => 
        Array.isArray(plugin) ? plugin[0] !== 'react-native-google-mobile-ads' : plugin !== 'react-native-google-mobile-ads'
      ),
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": process.env.ADMOB_ANDROID_APP_ID,
          "iosAppId": process.env.ADMOB_IOS_APP_ID,
          "userTrackingUsageDescription": "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ],
    extra: {
      ...appJson.expo?.extra,
      router: {},
      eas: {
        projectId: "3f69e2d6-5620-4b05-a7c5-c9771c732a84"
      }
    }
  }
}; 