import Colors from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { Stack } from 'expo-router'
import { TouchableOpacity } from 'react-native'

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerTitle: 'Calls',
          headerLargeTitle: true,
          headerShadowVisible: false,
          // headerBlurEffect: 'regular',
          headerStyle: { backgroundColor: Colors.background },
          headerSearchBarOptions: {
            placeholder: 'Search',
          },
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons name="call-outline" color={Colors.primary} size={30} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  )
}

export default Layout