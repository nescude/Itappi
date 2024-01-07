import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import QuizScreen from './QuizScreen';
import AddWordScreen from './AddWordScreen';
import AddGroupScreen from './AddGroupScreen';


const Stack = createNativeStackNavigator();

const ScreenStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Group screenOptions={{
                headerStyle: { backgroundColor: '#B25068' },
                headerTitleStyle: { color: '#fff' },
                headerTintColor:'#fff'
            }}>
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: '' }} />
                <Stack.Screen name="QuizScreen" component={QuizScreen} options={{ title: 'Practicar' }} />
                <Stack.Screen name="AddScreen" component={AddWordScreen} options={{ title: '' }} />
                <Stack.Screen name="AddGroupScreen" component={AddGroupScreen} options={{ title: '' }} />
            </Stack.Group>
        </Stack.Navigator>
    );
};
export default ScreenStack;