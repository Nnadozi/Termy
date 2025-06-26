const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

export default {
  expo: {
    name: IS_DEV ? 'Termy (Dev)' : IS_PREVIEW ? 'Termy (Preview)' : 'Termy',
    ios: {
      bundleIdentifier: IS_DEV 
        ? 'com.nnadozi.termy.dev' 
        : IS_PREVIEW 
        ? 'com.nnadozi.termy.preview' 
        : 'com.nnadozi.termy',
    },
    android: {
      package: IS_DEV 
        ? 'com.nnadozi.termy.dev' 
        : IS_PREVIEW 
        ? 'com.nnadozi.termy.preview' 
        : 'com.nnadozi.termy'
    }
  }
}; 