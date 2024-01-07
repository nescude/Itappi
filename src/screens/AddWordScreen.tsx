import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'
import { insertWord, getAllWords, deleteAllWords, WordExportType, GroupExportType, getAllGroups, deleteGroup } from '../db/SQLiteRepo';
import { Card } from '@rneui/base';
import { useFonts } from 'expo-font';
import { Box, Icon, IconButton, Input, ScrollView, Select } from 'native-base';
import { Alert } from 'react-native';
import { Divider } from '@rneui/themed';
import { useTypedDispatch, useTypedSelector } from '../store/storeHooks';
import { updateActiveGroup } from '../store/reducers';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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
    const [words, setWords] = useState<WordExportType[][]>([]);
    const [groups, setGroups] = useState<GroupExportType[]>([]);
    const { activeGroup } = useTypedSelector(state => state.global)
    const [groupId, setGroupId] = useState('1');
    const dispatch = useTypedDispatch();

    async function readDB() {
        let _words = []; _words = await getAllWords();
        let _groups = []; _groups = await getAllGroups();
        let wordsTemp = []; let groupsTemp: GroupExportType[] = []; let groupsToClean = [];
        _groups.forEach((group: GroupExportType) => {
            groupsTemp[group.ID] = { ID: group.ID, name: group.name, created_at: group.created_at };
        })
        _words.forEach((word: WordExportType) => {
            if (groupsTemp[word.GROUP_ID]) {
                let row = wordsTemp[word.GROUP_ID] || [];
                row = [...row, word];
                wordsTemp[word.GROUP_ID] = row;
            }
            else if (!groupsToClean.includes(word.GROUP_ID)) groupsToClean = [...groupsToClean, word];
        })
        if (groupsTemp[groupId] == undefined && groupsTemp.length > 0) {
            let newActiveGroup = String(groupsTemp.findLast(e => e).ID);
            setGroupId(newActiveGroup);
            dispatch(updateActiveGroup({ activeGroup: parseInt(newActiveGroup) }));
        }
        setGroups(groupsTemp);
        setWords(wordsTemp);
        groupsToClean.forEach((g: GroupExportType) => { deleteGroup(g.ID, () => { }) });
    }

    useEffect(() => {
        setGroupId(activeGroup + '');
        navigation.setOptions({ headerRight: () => headerRight(), headerLeft: () => backButton() });
    }, [fontsLoaded, groupId, groups])

    useFocusEffect(
        React.useCallback(() => {
            readDB();
            return () => { };
        }, [])
    );

    function backButton() {
        return (
            <IconButton left={-2} background={'#ffffff22'} borderWidth={3} borderColor={'#ffffff00'} padding={4}
                _icon={{
                    name: 'chevron-left',
                    as: FontAwesome5, size: '2xl', color: '#fff', paddingLeft: 1
                }}
                _pressed={{
                    bg: '#77436088',
                    borderColor: '#ffffff22'
                }}
                variant='solid' rounded='full' onPress={() => { navigation.navigate('HomeScreen'); }}>
            </IconButton>
        );
    }

    function headerRight() {
        return (
            <View style={{ width: 250, margin: 10 }}>
                <SelectGroup />
            </View >
        );
    }

    function SelectGroup() {
        return (
            <View style={{ flex: 1 }}>
                <Select borderColor={'#ffffff88'} borderWidth={3} defaultValue='1' placeholder='No hay temas' color={'#fff'} bg={'#774360'} height={62} fontSize={18} fontFamily={fontsLoaded ? 'Belanosima' : 'mono'}
                    onValueChange={(itemValue) => {
                        setGroupId(itemValue);
                        dispatch(updateActiveGroup({ activeGroup: parseInt(itemValue) }))
                    }} dropdownIcon={<Icon as={FontAwesome5} name='caret-down' size={'2xl'} color={'#fff'} />} selectedValue={groupId}
                    _selectedItem={{
                        bg: '#B25068', _text: { color: '#fff' }
                    }}
                    _item={{ width: '95%', borderRadius: 3, margin: 2, marginRight: 5 }}>
                    <Select.Item disabled={true} _text={{ fontStyle: 'italic', fontSize: 20 }} label='Seleccionar Tema' value='theme' />

                    {groups.length == 0 ?
                        <Select.Item key={'GRUP' + 9999} label={'No hay temas'} value={'nongroups'}
                            padding={3} alignItems={'center'} justifyContent={'center'} disabled={true} backgroundColor={'coolGray.400'} paddingLeft={4} style={{ justifyContent: 'center', flex: 1 }}
                        />
                        : groups.map((group, index) => {
                            return (
                                <Select.Item key={'AWGRUP' + index} label={group.name} value={group.ID + ''}
                                    padding={3} height={70} paddingLeft={4} style={{ justifyContent: 'center', flex: 1 }}
                                />)
                        })}
                </Select>
            </View>
        );
    }

    const acceptHandler = () => {
        if (groups.length > 0) {
            if (input1 != null && input1 != "" && input2 != null && input2 != "") {
                if (words[groupId]==undefined || words[groupId].filter(e => e.it == input1).length <= 0) {
                    insertWord(activeGroup, input1, input2);
                    Dialog.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Éxito',
                        textBody: 'Traducción agregada correctamente',
                        buttons: ['OK']
                    })
                    navigation.navigate('HomeScreen');
                }
                else Dialog.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Error',
                    textBody: 'Esta palabra ya ha sido agregada.',
                    buttons: ['OK']
                })
            }
            else {
                Dialog.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Alerta',
                    textBody: 'Por favor, escriba una palabra y su traducción debajo.',
                    buttons: ['OK']
                })
            }
        } else Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Alerta',
            textBody: 'Por favor, agregue temas en la pantalla principal.',
            buttons: ['OK']
        });
    }
    const image = require('../../assets/img/bg.png')
    return (
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
            <ImageBackground source={image} style={{ flex: 1 }} imageStyle={{ opacity: 0.3 }}>
                <Card containerStyle={styles.card}>
                    <Box style={styles.boxHeader} >
                        <Text style={{ ...styles.translation, textAlign: 'center', fontSize: 26, color: '#fff' }}> Agregar traducción </Text>
                    </Box>
                    <ScrollView style={{ padding: 20 }}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#008D44', height: 40, width: 20, marginLeft: 5 }} />
                                <View style={{ backgroundColor: '#F7F7F7', height: 40, width: 20 }} />
                                <View style={{ backgroundColor: '#C82A35', height: 40, width: 20, marginRight: 10 }} />
                                <Text style={styles.translation}> Italiano </Text>
                            </View>
                            <Input isDisabled={!(groups.length > 0)} value={input1} onChangeText={(text) => { setInput1(text) }} placeholder='Palabra / Frase' size={'2xl'} borderWidth={2} _focus={{ bg: '#B2506855', borderColor: '#4C3A51', borderWidth: 2 }}></Input>
                        </View>
                        <Divider style={{ marginTop: 30, marginBottom: 30 }} />
                        <View style={{ flexDirection: 'column', marginBottom: 0, justifyContent: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'column', marginLeft: 5, marginRight: 10, justifyContent: 'center' }}>
                                    <View style={{ backgroundColor: '#AE0027', height: 10, width: 60 }} />
                                    <View style={{ backgroundColor: '#F2B700', height: 20, width: 60 }} />
                                    <View style={{ backgroundColor: '#AE0027', height: 10, width: 60 }} />
                                </View>
                                <Text style={styles.translation}> Español </Text>
                            </View>
                            <Input isDisabled={!(groups.length > 0)} value={input2} onChangeText={(text) => { setInput2(text) }} placeholder='Traducción' size={'2xl'} borderWidth={2} _focus={{ bg: '#B2506855', borderColor: '#4C3A51', borderWidth: 2 }} >
                            </Input>
                        </View>
                    </ScrollView>
                </Card>
                <TouchableOpacity activeOpacity={0.8}
                    style={styles.acceptButton}
                    onPress={acceptHandler}
                >
                    <Text style={{ ...styles.translation, color: '#fff' }}>ACEPTAR</Text>
                </TouchableOpacity>


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
        borderWidth: 3,
        backgroundColor: '#B25068',
        borderColor: '#4C3A51',
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