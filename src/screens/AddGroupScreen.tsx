import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'
import { insertWord, getAllWords, getAllGroups, GroupExportType, WordExportType, insertGroup } from '../db/SQLiteRepo';
import { Card } from '@rneui/base';
import { useFonts } from 'expo-font';
import { Box, Icon, IconButton, Input, Select } from 'native-base';
import { Alert } from 'react-native';
import { Divider } from '@rneui/themed';
import { useTypedDispatch, useTypedSelector } from '../store/storeHooks';
import { updateActiveGroup } from '../store/reducers';
import { FontAwesome5 } from '@expo/vector-icons';
import { ALERT_TYPE, AlertNotificationRoot, Dialog } from '@nescude/react-native-alert-notification';

declare interface Translation {
    ID?: string,
    it: string,
    sp: string
}

export default function HomeScreen({ navigation }) {

    const [fontsLoaded] = useFonts({
        'Galder': require('../../assets/fonts/galder.ttf'),
        'Galder-2': require('../../assets/fonts/galder-2.ttf'),
        'Galder-Light': require('../../assets/fonts/galder-light.ttf'),
        'Belanosima': require('../../assets/fonts/Belanosima-Regular.ttf'),
        'AbrilFatface': require('../../assets/fonts/AbrilFatface-Regular.ttf')
    });

    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [words, setWords] = useState<{ ID: number, it: string, sp: string }[]>([]);
    const [groups, setGroups] = useState<{ ID: number, name: string, createdAt: Date }[]>([]);
    const { activeGroup } = useTypedSelector(state => state.global)
    const dispatch = useTypedDispatch();

    async function readDB() {
        let _words = await getAllWords();
        let _groups = await getAllGroups();
        let wordsTemp = []; let groupsTemp = [];
        _groups.forEach((group: GroupExportType) => {
            groupsTemp[group.ID] = { ID: group.ID, name: group.name, createdAt: group.created_at };
        })
        _words.forEach((word: WordExportType) => {
            let row = wordsTemp[word.GROUP_ID] || [];
            row = [...row, word];
            wordsTemp[word.GROUP_ID] = row;
        })
        setGroups(groupsTemp);
        setWords(wordsTemp);
    }

    useEffect(() => {
        readDB();
        navigation.setOptions({ headerLeft: () => backButton() });
    }, [])

    function backButton() {
        return (
            <IconButton left={-12} background={'#ffffff22'} borderWidth={3} borderColor={'#ffffff00'} padding={4} margin={2}
                _icon={{
                    name: 'chevron-left',
                    as: FontAwesome5, size: '2xl', color: '#fff', paddingLeft: 1
                }}
                _pressed={{
                    bg: '#77436088',
                    borderColor: '#ffffff22'
                }}
                variant='solid' rounded='full' onPress={() => { navigation.goBack() }}>
            </IconButton>
        );
    }

    const acceptHandler = () => {
        if (input1 != null && input1 != "") {
            if (!groups.some(e => { return (e.name == input1) })) {
                insertGroup(input1);
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Éxito',
                    textBody: 'Tema agregado correctamente',
                    button: 'OK'
                })
                navigation.navigate('HomeScreen');
            }
            else Alert.alert('Este tema ya ha sido agregada!');
        }
        else {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Alerta',
                textBody: 'Por favor, escriba un nombre válido para el tema.',
                button: 'OK'
            })
        }
    }
    const image = require('../../assets/img/bg.png')
    return (
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <ImageBackground source={image} style={{ flex: 1 }} imageStyle={{ opacity: 0.3 }}>
                <Card containerStyle={styles.card}>
                    <Box style={styles.boxHeader} >
                        <Text style={{ ...styles.translation, textAlign: 'center', fontSize: 26, color: '#fff' }}> Agregar tema </Text>
                    </Box>
                    <View style={{ padding: 20, marginBottom: 5 }}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Icon as={FontAwesome5} name={'crow'} size={'4xl'} flex={1} color={'#3a373b'}></Icon>
                                <Text style={{ ...styles.translation, marginRight: 25 }}>Nombre de tema</Text>
                            </View>
                            <Input value={input1} onChangeText={(text) => { setInput1(text) }} placeholder='Ingrese nombre' size={'2xl'} borderWidth={2} _focus={{ bg: '#B2506855', borderColor: '#4C3A51', borderWidth: 2 }}></Input>
                        </View>
                    </View>
                </Card>
                <TouchableOpacity activeOpacity={0.8}
                    style={styles.acceptButton}
                    onPress={acceptHandler}
                >
                    <Text style={{ ...styles.translation, color: '#fff' }}>ACEPTAR</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
            </ImageBackground>
        </View>
    )
}


const styles = StyleSheet.create({
    headerText: {
        color: '#ffffff',
        fontSize: 24,
        fontFamily: 'Galder'
    },
    container: {
        flex: 1,
        top: 0,
    },
    translation: {
        color: '#3a373b',
        fontSize: 26,
        fontFamily: 'Belanosima'
    },
    card: {
        marginTop: 20,
        padding: 2,
        borderRadius: 8,
        borderColor: '#4C3A51AA',
        borderWidth: 4,
    },
    button: {
        height: 70,
        width: 70,
        marginLeft: 20,
        marginRight: 20,
        fontFamily: 'Galder-Light'
    },
    buttonTitle: {
        fontFamily: 'Galder-Light'
    },
    buttonDock: {
        position: 'absolute',
        bottom: 30,
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        flexDirection: 'row',
    },
    acceptButton: {
        borderRadius: 8,
        flexDirection: 'row',
        height: 70,
        margin: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        backgroundColor: '#B25068',
        borderColor: '#4C3A51AA',
        marginBottom: 25
    },
    boxHeader: {
        marginBottom: 20,
        backgroundColor: '#B25068',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        height: 80,
        justifyContent: 'center'
    }
})