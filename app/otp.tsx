import Colors from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Linking, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MaskInput from 'react-native-mask-input';
import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo'

const Page = () => {
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const router = useRouter();
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;
  const { bottom } = useSafeAreaInsets();
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  const US_PHONE = [
    `+`,
    /\d/,
    ' (',
    /\d/,
    /\d/,
    /\d/,
    ') ',
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ];

  const openLink = () => {
    Linking.openURL("https://elijahdev.com/")
  }

  const sendOTP = async () => {
    console.log('sendOTP', phoneNumber);
    setLoading(true);
    try {
      await signUp!.create({
        phoneNumber
      })

      signUp!.preparePhoneNumberVerification();

      router.push(`/verify/${phoneNumber}`)
    } catch(err) {
      if (isClerkAPIResponseError(err)) {
        if (err.errors[0].code === 'form_identifier_exists') {
          console.log('User already exists');
          await trySignIn();
        } else if (err.errors[0].code === 'session_exists') {
          console.log('The user is already logged in with an active session.')
          router.push('(tabs)/chats')
        } else {
          console.log('error', JSON.stringify(err, null, 2));
          setLoading(false);
          Alert.alert('Error', err.errors[0].message)
        }
      }
    }
  }

  const trySignIn = async () => {
    const { supportedFirstFactors } = await signIn!.create({
      identifier: phoneNumber
    });
    
    const firstPhoneFactor: any = supportedFirstFactors.find((factor: any) => {
      return factor.strategy === 'phone_code';
    });

    const { phoneNumberId } = firstPhoneFactor;

    await signIn!.prepareFirstFactor({
      strategy: 'phone_code',
      phoneNumberId,
    });

    router.push(`/verify/${phoneNumber}?signin=true`);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={keyboardVerticalOffset} behavior="padding">
      <View style={styles.container}>
        {loading && (
          <View style={[StyleSheet.absoluteFill, styles.loading]}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ fontSize: 18, padding: 10 }}>Sending code...</Text>
          </View>
        )}
        <Text style={styles.description}>
          WhatsApp will need to verify your account. Carrier charges may apply.
        </Text>
        <View style={styles.list}>
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>United States</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
          </View>
          <View style={styles.seperator} />
          <MaskInput
            value={phoneNumber}
            keyboardType="numeric"
            autoFocus
            placeholder="+1 "
            onChangeText={(masked, unmasked) => {
              setPhoneNumber(unmasked);
            }}
            mask={US_PHONE}
            style={styles.input}
          />
        </View>

        <Text style={styles.legal}>
          You must be{' '}
          <Text style={styles.link} onPress={openLink}>
            at least 16 years old
          </Text>{' '}
          to register. Learn how WhatsApp works with the{' '}
          <Text style={styles.link} onPress={openLink}>
            Meta Companies
          </Text>
          .
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
        style={[styles.button, phoneNumber.length === 11 ? styles.enabled : null, {marginBottom: bottom}]} 
        disabled={phoneNumber.length !== 11}
        onPress={sendOTP}>
          <Text style={[styles.buttonText, phoneNumber.length === 11 ? styles.enabled : null]}>Next</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    gap: 20
  },
  description: {
    fontSize: 14,
    color: Colors.gray
  },
  list: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 10
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
    marginBottom: 10
  },
  listItemText: {
    fontSize: 18,
    color: Colors.primary
  },
  seperator: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray,
    opacity: 0.4
  },
  legal: {
    fontSize: 12,
    textAlign: 'center',
    color: '#000'
  },
  link: {
    color: Colors.primary,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
  },
  enabled: {
    backgroundColor: Colors.primary,
    color: "#fff"
  },
  buttonText: {
    color: Colors.gray,
    fontSize: 22,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    fontSize: 16,
    padding: 6, 
    marginTop: 10
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default Page