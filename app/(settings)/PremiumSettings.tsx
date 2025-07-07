import CustomButton from '@/components/CustomButton'
import CustomIcon from '@/components/CustomIcon'
import CustomText from '@/components/CustomText'
import ErrorDisplay from '@/components/ErrorDisplay'
import Page from '@/components/Page'
import useUserStore from '@/stores/userStore'
import { useFocusEffect, useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, Platform, StyleSheet, View } from 'react-native'
import Purchases, { CustomerInfo } from 'react-native-purchases'
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui'

interface SubscriptionInfo {
  isActive: boolean
  expirationDate?: string | null
  productId?: string | null
  willAutoRenew?: boolean
}

const PremiumSettings = () => {
  const { colors } = useTheme()
  const { isPremium, setPremium } = useUserStore()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    isActive: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchSubscriptionInfo()
  }, [])

  // Refresh subscription info when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSubscriptionInfo()
    }, [])
  )

  const fetchSubscriptionInfo = async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo()
      console.log('Customer info:', customerInfo)
      
      const premiumEntitlement = customerInfo.entitlements.active["premium"]
      
      if (premiumEntitlement) {
        setSubscriptionInfo({
          isActive: true,
          expirationDate: premiumEntitlement.expirationDate,
          productId: premiumEntitlement.productIdentifier,
          willAutoRenew: premiumEntitlement.willRenew
        })
        setPremium(true)
      } else {
        setSubscriptionInfo({
          isActive: false
        })
        setPremium(false)
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error)
      setError('Failed to load subscription information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestorePurchases = async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      
      const customerInfo = await Purchases.restorePurchases()
      console.log('Restored purchases:', customerInfo)
      
      const premiumEntitlement = customerInfo.entitlements.active["premium"]
      
      if (premiumEntitlement) {
        setSubscriptionInfo({
          isActive: true,
          expirationDate: premiumEntitlement.expirationDate,
          productId: premiumEntitlement.productIdentifier,
          willAutoRenew: premiumEntitlement.willRenew
        })
        setPremium(true)
        Alert.alert(
          'Success',
          'Your premium subscription has been restored!',
          [{ text: 'OK' }]
        )
      } else {
        Alert.alert(
          'No Purchases Found',
          'No premium subscription was found to restore.',
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.error('Error restoring purchases:', error)
      setError('Failed to restore purchases')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo()
      
      if (customerInfo.managementURL) {
        await Linking.openURL(customerInfo.managementURL)
      } else {
        // Fallback for platforms that don't provide management URL
        if (Platform.OS === 'ios') {
          await Linking.openURL('https://apps.apple.com/account/subscriptions')
        } else if (Platform.OS === 'android') {
          await Linking.openURL('https://play.google.com/store/account/subscriptions')
        }
      }
    } catch (error) {
      console.error('Error opening subscription management:', error)
      setError('Failed to open subscription management')
    }
  }

  const handleUpgradeToPremium = async () => {
    try {
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();
      
      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          // Refresh subscription info after successful purchase
          await fetchSubscriptionInfo();
          Alert.alert(
            'Success',
            'Welcome to Premium! You now have access to unlimited lists and all premium features.',
            [{ text: 'OK' }]
          );
          break;
        case PAYWALL_RESULT.CANCELLED:
          console.log('User cancelled the paywall');
          break;
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
          console.error('Paywall error:', paywallResult);
          setError('Failed to show upgrade options. Please try again.');
          break;
        default:
          console.log('Unknown paywall result:', paywallResult);
          break;
      }
    } catch (error) {
      console.error('Error presenting paywall:', error);
      setError('Failed to show upgrade options. Please try again.');
    }
  }

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'To cancel your subscription, you\'ll be redirected to your device\'s subscription management page. You can cancel there and your subscription will remain active until the end of the current billing period.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: async () => {
            try {
              const customerInfo = await Purchases.getCustomerInfo()
              
              if (customerInfo.managementURL) {
                await Linking.openURL(customerInfo.managementURL)
              } else {
                // Fallback for platforms that don't provide management URL
                if (Platform.OS === 'ios') {
                  await Linking.openURL('https://apps.apple.com/account/subscriptions')
                } else if (Platform.OS === 'android') {
                  await Linking.openURL('https://play.google.com/store/account/subscriptions')
                }
              }
            } catch (error) {
              console.error('Error opening subscription management:', error)
              setError('Failed to open subscription management')
            }
          }
        }
      ]
    )
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Unknown'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Unknown'
    }
  }

  const getStatusText = () => {
    if (subscriptionInfo.isActive) {
      return subscriptionInfo.willAutoRenew ? 'Active (Auto-renewing)' : 'Active (Expires soon)'
    }
    return 'Inactive'
  }

  const getStatusColor = () => {
    return subscriptionInfo.isActive ? '#4CAF50' : '#F44336'
  }

  return (
    <Page style={styles.container}>
      <View style={styles.header}>
        <CustomIcon name="chevron-left" size={30} onPress={() => router.back()} />
        <CustomText bold textAlign="center">Premium Settings</CustomText>
        <View />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <CustomText>Loading subscription information...</CustomText>
        </View>
      )}

      {error && (
        <ErrorDisplay
          title="Error"
          message={error}
          onRetry={fetchSubscriptionInfo}
          style={{ marginBottom: 20 }}
        />
      )}

      <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
        <View style={styles.statusHeader}>
          <CustomText bold fontSize="large">Premium Status</CustomText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <CustomText fontSize="small" style={{ color: 'white' }}>
              {getStatusText()}
            </CustomText>
          </View>
        </View>

        {subscriptionInfo.isActive && (
          <View style={styles.subscriptionDetails}>
            <View style={styles.detailRow}>
              <CustomText fontSize="small" color="gray">Expires:</CustomText>
              <CustomText fontSize="small">
                {formatDate(subscriptionInfo.expirationDate)}
              </CustomText>
            </View>
            
            <View style={styles.detailRow}>
              <CustomText fontSize="small" color="gray">Auto-renew:</CustomText>
              <CustomText fontSize="small">
                {subscriptionInfo.willAutoRenew ? 'Yes' : 'No'}
              </CustomText>
            </View>

            {subscriptionInfo.productId && (
              <View style={styles.detailRow}>
                <CustomText fontSize="small" color="gray">Plan:</CustomText>
                <CustomText fontSize="small">
                  {subscriptionInfo.productId.includes('monthly') ? 'Monthly' : 
                   subscriptionInfo.productId.includes('yearly') ? 'Yearly' : 
                   subscriptionInfo.productId}
                </CustomText>
              </View>
            )}
          </View>
        )}

        {!subscriptionInfo.isActive && (
          <View style={styles.noSubscription}>
                    <CustomText fontSize="normal" color="gray" textAlign="center">
          You don't have an active premium subscription
        </CustomText>
            <CustomText fontSize="small" color="gray" textAlign="center" style={{ marginTop: 10 }}>
              Upgrade to premium to create unlimited lists and unlock all features
            </CustomText>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <CustomButton
          title="Restore Purchases"
          onPress={handleRestorePurchases}
          isLoading={isLoading}
          style={styles.actionButton}
        />

        {subscriptionInfo.isActive && (
          <CustomButton
            title="Manage Subscription"
            onPress={handleManageSubscription}
            style={styles.actionButton}
          />
        )}

        {subscriptionInfo.isActive && (
          <CustomButton
            title="Cancel Subscription"
            onPress={handleCancelSubscription}
            style={styles.actionButton}
          />
        )}

        {!subscriptionInfo.isActive && (
          <CustomButton
            title="Upgrade to Premium"
            onPress={handleUpgradeToPremium}
            style={styles.actionButton}
          />
        )}
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <CustomText bold fontSize="normal" style={{ marginBottom: 10 }}>
          Premium Benefits
        </CustomText>
        <View style={styles.benefitItem}>
          <CustomIcon name="check" size={16} color="#4CAF50" />
          <CustomText fontSize="small" style={{ marginLeft: 10 }}>
            Create unlimited custom word lists
          </CustomText>
        </View>
      </View>
    </Page>
  )
}

export default PremiumSettings

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  statusCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subscriptionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noSubscription: {
    paddingVertical: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    width: '100%',
  },
  infoCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
})