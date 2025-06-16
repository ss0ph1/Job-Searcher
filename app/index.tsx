import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import 'react-native-reanimated';
import { Nearbyjobs, Popularjobs, ScreenHeaderBtn, Welcome } from '../components';
import { COLORS, icons, images, SIZES } from '../constants';


SplashScreen.preventAutoHideAsync();

  
const Home = () => {
    
    const [fontsLoaded] = useFonts({
        DMBold: require('../assets/fonts/DMSans-Bold.ttf'),
        DMMedium: require('../assets/fonts/DMSans-Medium.ttf'),
        DMRegular: require('../assets/fonts/DMSans-Regular.ttf'),
      })
    
      const onLayoutRootView = useCallback(async () => {
        if(fontsLoaded){
          await SplashScreen.hideAsync();
        }
      }, [fontsLoaded])
      //runs only if fontsLoaded updated
    
      if(!fontsLoaded) return null

    const router = useRouter();

    return (
        <SafeAreaView 
            style={{ flex: 1, backgroundColor: COLORS.lightWhite }}
            onLayout={onLayoutRootView}>
            <Stack.Screen 
                options={{
                    headerStyle: { backgroundColor: COLORS.lightWhite},
                    headerShadowVisible: false,
                    headerLeft:() => (
                        <ScreenHeaderBtn iconUrl={icons.menu} dimension="60%" handlePress={undefined}/>
                    ),
                    headerRight:() => (
                        <ScreenHeaderBtn iconUrl={images.profile} dimension="100%" handlePress={undefined} />
                    ),
                    headerTitle:""
                }}/>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View
                    style={{ flex: 1, padding:SIZES.medium }}>
                        <Welcome

                        />
                        <Popularjobs/>
                        <Nearbyjobs/>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Home;