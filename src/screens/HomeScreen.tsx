import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Touchable, Dimensions, ActivityIndicator } from 'react-native'
import { insertWord, getAllWords, deleteWord, WordExportType, dropWordsTable, getAllGroups, GroupExportType, deleteGroup } from '../db/SQLiteRepo';
import { Card } from '@rneui/base';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Divider, Flex, Icon, IconButton, Modal, Select, Toast, useToast } from 'native-base';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { deleteExport, getExport, postExport } from '../utils/JsonAPIs';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import vibrate from '../utils/Vibration';
import { useTypedDispatch, useTypedSelector } from '../store/storeHooks';
import { updateActiveGroup } from '../store/reducers';
import CountryFlag from "react-native-country-flag";
import { ALERT_TYPE, AlertNotificationRoot, Dialog } from '@nescude/react-native-alert-notification';

let fontsLoaded;

export default function HomeScreen({ navigation }) {

    ///** VARIABLES DEFINITION STARTS *///

    const COUNTDOWN_TIME = 20;
    const [words, setWords] = useState<{ ID: number, it: string, sp: string }[][]>([]);
    const [groups, setGroups] = useState<GroupExportType[]>([]);
    const [activeQR, setActiveQR] = useState('');
    const [qrModalOpen, isQrModalOpen] = useState(false);
    const [scannerModalOpen, isScannerModalOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [randomSort, setRandomSort] = useState(true);
    const [currentGroup, setCurrentGroup] = useState('0');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const { activeGroup } = useTypedSelector(state => state.global);
    const dispatch = useTypedDispatch();
    const opacity = useRef(new Animated.Value(0)).current;
    const [contentLoading, setContentLoading] = useState(false);

    // const shiny = useRef(new Animated.Value(0)).current;
    // const [shouldShine, setShouldShine] = useState(false);

    [fontsLoaded] = useFonts({
        'Galder': require('../../assets/fonts/galder.ttf'),
        'Galder-2': require('../../assets/fonts/galder-2.ttf'),
        'Galder-Light': require('../../assets/fonts/galder-light.ttf'),
        'Belanosima': require('../../assets/fonts/Belanosima-Regular.ttf'),
        'AbrilFatface': require('../../assets/fonts/AbrilFatface-Regular.ttf')
    });

    let i = 0;

    useEffect(() => {
        initRedux();
        navigation.setOptions({ headerRight: () => headerRight(randomSort) });
    }, [randomSort, currentGroup, groups])

    useFocusEffect(
        React.useCallback(() => {
            BarCodeScanner.requestPermissionsAsync();
            readDB();
            return () => { };
        }, [])
    );

    ///** AUX FUNCTIONS DEFINITION STARTS *///
    async function closeCreateButtonDock() {
        fadeOut();
    }
    async function openCreateButtonDock() {
        setAddModalOpen(true);
        fadeIn();
    }
    function fadeIn() {
        opacity.stopAnimation();
        Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true
        }).start();
    }
    function fadeOut() {
        opacity.stopAnimation();
        Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true
        }).start(() => { setAddModalOpen(false); });
    }
    async function initRedux() {
        setContentLoading(true);
        let _groups = []; _groups = await getAllGroups();
        let groupsTemp: GroupExportType[] = [];
        _groups.forEach((group: GroupExportType) => {
            groupsTemp[group.ID] = { ID: group.ID, name: group.name, created_at: group.created_at };
        })
        if (groupsTemp[currentGroup] == undefined && groupsTemp.length > 0) {
            let newActiveGroup = String(groupsTemp.findLast(e => e).ID);
            setCurrentGroup(newActiveGroup);
            dispatch(updateActiveGroup({ activeGroup: parseInt(newActiveGroup) }));
        }
        else setCurrentGroup(String(activeGroup));
        setContentLoading(false);
    }

    function orderWords(sort: boolean) {
        let wordsTemp = [...words];
        wordsTemp.forEach((group, index) => {
            if (group != undefined) {
                wordsTemp[index] = orderArray(wordsTemp[index], sort);
            }
        })
        setWords(wordsTemp);
    }

    async function readDB() {
        let _words = []; _words = await getAllWords();
        let _groups = []; _groups = await getAllGroups();
        let wordsTemp = []; let groupsTemp: GroupExportType[] = []; let groupsToClean: number[] = [];
        _groups.forEach((group: GroupExportType) => {
            groupsTemp[group.ID] = { ID: group.ID, name: group.name, created_at: group.created_at };
        })
        _words.forEach((word: WordExportType) => {
            if (groupsTemp[word.GROUP_ID]) {
                let row = wordsTemp[word.GROUP_ID] || [];
                row = [...row, word];
                wordsTemp[word.GROUP_ID] = row;
            }
            else if (!groupsToClean.includes(word.GROUP_ID)) groupsToClean = [...groupsToClean, word.GROUP_ID];
        })
        wordsTemp.forEach((group, index) => {
            wordsTemp[index] = group;
        })
        setGroups(groupsTemp);
        setWords(wordsTemp);
        groupsToClean.forEach(gId => { deleteGroup(gId, () => { }) });
    }

    ///** HANDLERS DEFINITION STARTS *///

    const deleteHandler = (ID: number) => {
        Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Alerta',
            textBody: '¿Está seguro de que desea eliminar esta palabra?',
            forceCloseAfterPress: true,
            button: 'OK',
            buttons: ['Si', 'Cancelar'],
            onPressButton: (index) => {
                switch (index) {
                    case 0: deleteWord(ID); readDB(); break;
                }
            }
        })
    }

    const exportPressHandler = async () => {
        if (words[currentGroup] == undefined) {
            Dialog.show({
                type: ALERT_TYPE.WARNING,
                title: 'Alerta',
                textBody: 'No hay palabras para exportar.',
                forceCloseAfterPress: false,
                button: 'OK',
                buttons: ['OK']
            })
        }
        else {
            setActiveQR(await postExport(words[currentGroup]));
            isQrModalOpen(true);
        }
    }
    const onQRScanned = async (params) => {
        if (!scanning) {
            setScanning(true);
            isScannerModalOpen(false);
            let exp = await getExport(params.data);
            let amount = exp.length;
            if (exp != null && exp != undefined && exp.length > 0) {
                let mapped: any[];
                if (words[currentGroup] != undefined)
                    mapped = words[currentGroup].map((word) => { return ({ it: word.it }) });
                else
                    mapped = [];
                exp.forEach((word: { it: string, sp: string }) => {
                    if (mapped.length == 0 || mapped.some(e => e.it === word.it)) {
                        insertWord(parseInt(currentGroup), word.it, word.sp);
                    }
                })
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Éxito',
                    textBody: 'Diccionario importado: ' + amount + ' palabra(s)',
                    buttons: ['OK']
                })
                readDB();
                deleteExport(params.data);
            }
            else {
                Dialog.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Alerta',
                    textBody: 'No se agregaron palabras',
                    buttons: ['OK']
                })
            }
        }
    }
    const onScanPressHandler = () => {
        vibrate('micro');
        setScanning(false);
        closeCreateButtonDock();
        isScannerModalOpen(true);
    }
    const onSortButtonPressedHandler = () => {
        vibrate('micro');
        let sort = !randomSort;
        setRandomSort(!randomSort);
        orderWords(sort);
        Toast.show({ title: sort ? 'Ordenando Aleatoriamente' : 'Ordenando Alfabeticamente', bottom: 100, duration: 2000 })
        closeCreateButtonDock();
    }

    ///** COMPONENTS DEFINITION STARTS *///
    function TrashButton(props: { group: GroupExportType, color?: string, bgColor?: string }) {
        let group = props.group;
        let color = props.color || '#774360';
        let bgColor = props.bgColor || '#00000022';

        let _deleteGroup = () => {
            deleteGroup(group.ID, () => { readDB() });
            if (String(group.ID) == currentGroup) setCurrentGroup(String(groups.findLast(e => e).ID))
            Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Éxito',
                textBody: 'Tema eliminado correctamente!',
                buttons: ['OK']
            })
        }

        return (
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <IconButton background={bgColor} borderWidth={0} borderColor={'#ffffff00'} padding={1}
                    _icon={{
                        name: 'trash',
                        as: FontAwesome5, size: 'lg', color: color, marginLeft: 1
                    }}
                    _pressed={{
                        bg: '#77436088',
                        color: 'yellow',

                    }}
                    variant='solid' rounded='sm' height={50} width={50} onPress={() => {
                        Dialog.show({
                            type: ALERT_TYPE.DANGER,
                            title: 'Alerta',
                            textBody: '¿Está seguro de que desea eliminar este tema? \n ¡Se eliminarán todos las palabras asociadas!',
                            forceCloseAfterPress: false,
                            button: 'OK',
                            buttons: ['Si', 'Cancelar'],
                            onPressButton: (index) => {
                                switch (index) {
                                    case 0: _deleteGroup(); break;
                                    case 1: console.log('Chau'); Dialog.hide(); break;
                                }
                            }
                        })

                    }}>
                </IconButton>
            </View>
        );
    }
    function headerRight(_order) {
        return (
            <View style={{ flexDirection: 'row' }}>
                <SelectGroup />
                <IconButton backgroundColor={'#774360'} borderWidth={3} borderColor={'#ffffff88'} padding={7}
                    _icon={{
                        name: randomSort ? 'random' : 'sort-alpha-down',
                        as: FontAwesome5, size: '2xl', color: '#fff'
                    }}
                    _pressed={{
                        bg: '#77436088',
                    }}
                    variant='solid' style={styles.smallButton} onPress={onSortButtonPressedHandler}>
                </IconButton>

                <IconButton backgroundColor={'#774360'} borderWidth={3} borderColor={'#ffffff88'} padding={7}
                    _icon={{
                        as: FontAwesome5,
                        name: 'camera',
                        size: '2xl',
                        color: '#fff'
                    }}
                    _pressed={{ bg: '#77436088' }} marginLeft={2}
                    variant='solid' style={styles.smallButton} onPress={onScanPressHandler}>
                </IconButton>
            </View>
        );
    }
    function SelectGroup() {
        return (
            <View style={{ flex: 1, marginLeft: 30, marginRight: 10, marginTop: 10 }}>
                <Select borderColor={'#ffffff88'} borderWidth={3} defaultValue='1' placeholder='No hay temas' color={'#fff'} bg={'#774360'} height={62} fontSize={18} fontFamily={fontsLoaded ? 'Belanosima' : 'mono'}
                    onValueChange={(itemValue) => {
                        setCurrentGroup(itemValue);
                        dispatch(updateActiveGroup({ activeGroup: parseInt(itemValue) }))
                    }}
                    dropdownOpenIcon={<Icon as={FontAwesome5} name='caret-up' size={'2xl'} color={'#fff'} />}
                    dropdownIcon={<Icon as={FontAwesome5} name='caret-down' size={'2xl'} color={'#fff'} />} selectedValue={currentGroup}
                    _selectedItem={{
                        _text: { color: '#fff', top: 2, fontSize: 18, fontFamily: fontsLoaded ? 'Belanosima' : 'mono' }, style: { backgroundColor: '#B25068' }, rightIcon: <TrashButton group={groups[currentGroup]} color='#fff' bgColor='#ffffff33' />
                    }}
                    _item={{ width: '95%', borderRadius: 3, margin: 2, marginRight: 5 }}>
                    <Select.Item disabled={true} _text={{ fontStyle: 'italic', fontSize: 20 }} label='Seleccionar Tema' value='theme' rightIcon={
                        <Icon as={FontAwesome5} name='hand-point-up' size={'2xl'} color={'#000000'} />
                    } />

                    {groups.length == 0 ?
                        <Select.Item key={'GRUP' + 9999} label={'No hay temas'} value={'nongroups'}
                            padding={3} alignItems={'center'} justifyContent={'center'} disabled={true} backgroundColor={'coolGray.400'} paddingLeft={4} style={{ justifyContent: 'center', flex: 1 }}
                        />
                        : groups.map((group, index) => {
                            return (
                                <Select.Item key={'GRUP' + index} label={group.name} value={group.ID + ''}
                                    padding={3} paddingLeft={4} style={{ justifyContent: 'center', flex: 1, backgroundColor: '#00000011' }} _text={{ top: 2, fontSize: 18, fontFamily: fontsLoaded ? 'Belanosima' : 'mono' }}
                                    rightIcon={<TrashButton group={group} />}
                                />)
                        })}
                </Select>
            </View>
        );
    }
    const QRModal = () => {
        return (
            <Modal isOpen={qrModalOpen} onClose={() => { isQrModalOpen(false); setActiveQR(''); }}>
                <Card containerStyle={{ borderRadius: 6, alignItems: 'center', ...styles.coloredCard }}>
                    <View style={{ margin: 10, padding: 10, backgroundColor: '#fff' }}>{
                        <QRCode size={200} value={'This is a test'} />
                    }</View>
                    <Flex alignItems={'center'} padding={2} direction='row'>
                        <CountdownCircleTimer
                            isPlaying
                            duration={COUNTDOWN_TIME}
                            trailColor='#4C3A51'
                            colors={['#fff', '#C82A35']}
                            colorsTime={[COUNTDOWN_TIME, 0]}
                            size={65}
                            onComplete={(elapsed) => {
                                deleteExport(activeQR);
                                isQrModalOpen(false);
                            }}
                        >
                            {({ remainingTime }) => <Text style={{ ...styles.translation, color: '#fff' }}>{remainingTime}</Text>}
                        </CountdownCircleTimer>
                        <Flex flex={1}></Flex>
                        <Text style={{ ...styles.translation, color: '#fff', width: 150, textAlign: 'center', fontSize: 20 }}>Compartir diccionario por QR</Text>
                    </Flex>
                </Card>
            </Modal>
        );
    }
    const ScannerModal = () => {
        return (
            <Modal isOpen={scannerModalOpen} onClose={() => { isScannerModalOpen(false); setScanning(false); }}>
                <Card containerStyle={{ ...styles.coloredCard, paddingTop: 30, width: 320, height: 426, justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
                    <View style={{ flex: 1, backgroundColor: '#fff', padding: 5, borderRadius: 6 }}>{
                        <BarCodeScanner
                            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                            style={{ flex: 1 }}
                            onBarCodeScanned={onQRScanned}

                        />
                    }</View>
                    <Text style={{ fontFamily: 'Belanosima', color: '#fff', marginBottom: 10, marginTop: 20, width: 230, textAlign: 'center', fontSize: 20 }}>{'Escanear QR\nImportar diccionario'}</Text>
                </Card>
            </Modal>
        );
    }
    const ButtonsDock = () => {
        return (
            <View style={styles.buttonDock}>
                {largeButton('qrcode', '#9088D4', exportPressHandler, 'EXPORTAR', { left: 1 })}
                {largeButton('pizza-slice', '#F88F01', () => {
                    if (words.length > 0) { navigation.navigate('QuizScreen') } else {
                        Dialog.show({
                            type: ALERT_TYPE.WARNING,
                            title: 'Alerta',
                            textBody: 'Agregue palabras para practicar.',
                            buttons: ['OK']
                        })
                    }
                }, 'PRACTICAR', { bottom: 1, left: 1 })}
                {largeButton('plus', '#0C9463', () => {
                    addModalOpen ? closeCreateButtonDock() : openCreateButtonDock();
                }, 'AGREGAR', { left: 1 })}
            </View>
        );
    }
    const CreateFloatingDock = () => {
        return (
            <Animated.View style={{
                opacity, backgroundColor: '#fff', borderColor: '#633974',
                borderWidth: 3, borderRadius: 10, alignItems: 'center',
                position: 'absolute', bottom: 125, right: 28, height: 190, width: 95,
                justifyContent: 'center'
            }}>
                <TouchableOpacity style={{ width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: '#f1c40f', paddingRight: 2 }}
                    onPress={() => {
                        if (addModalOpen) {
                            closeCreateButtonDock();
                            navigation.navigate('AddGroupScreen');
                        }
                    }} activeOpacity={0.5}
                >
                    <Icon as={FontAwesome5} name={'meteor'} size={'2xl'} color={'#fff'}></Icon>
                    <Text style={styles.buttonTitle}>TEMA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '100%', borderBottomLeftRadius: 6, borderBottomRightRadius: 6, alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: '#633974', paddingLeft: 2 }}
                    onPress={() => {
                        if (addModalOpen) {
                            closeCreateButtonDock();
                            if (groups.length > 0) {
                                navigation.navigate('AddScreen');
                            }
                            else {
                                Dialog.show({
                                    type: ALERT_TYPE.WARNING,
                                    title: 'Alerta',
                                    textBody: 'Antes de agregar palabras debe agregar al menos un tema.',
                                    buttons: ['OK']
                                })
                            }
                        }
                    }} activeOpacity={0.5}
                >
                    <Icon as={FontAwesome5} name='font' size={'2xl'} color={'#fff'}></Icon>
                    <Text style={styles.buttonTitle}>PALABRA</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    ///** JSX DEFINITION STARTS *///

    if (!fontsLoaded) return <></>;
    return (
        <AlertNotificationRoot>
            <Flex style={styles.container}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.scroll} >
                    <TouchableOpacity onPress={closeCreateButtonDock} activeOpacity={1} style={{ flex: 1 }}>
                        <StatusBar backgroundColor="#B25068" translucent={false} />
                        <View style={{ width: '100%', height: 20, backgroundColor: '#774360' }} />
                        <View style={{ width: '100%', height: 20, backgroundColor: '#4C3A51' }} />

                        {
                            words && currentGroup && words[currentGroup] != undefined ?
                                contentLoading ? <ActivityIndicator style={{ marginTop: 15 }} size={60} color={'#B25068'} /> :
                                    words[currentGroup].map((value) => {
                                        return (
                                            <TouchableOpacity activeOpacity={0.8} key={'W' + value.ID} onPress={closeCreateButtonDock}>
                                                <Card containerStyle={{ flexDirection: 'column', ...styles.card }}>
                                                    <View style={{ marginRight: 30 }}>
                                                        <View style={{ flexDirection: 'row', width: '100%' }}>
                                                            <View style={{ margin: 5, marginRight: 10 }}><CountryFlag isoCode="it" size={25} /></View>
                                                            <Text style={{ ...styles.translation, width: '100%' }}>{formatWord(value.it)}</Text>
                                                        </View>
                                                        <Divider style={{ margin: 2 }} />
                                                        <View style={{ flexDirection: 'row', width: '100%' }}>
                                                            <View style={{ margin: 5, marginRight: 10 }}><CountryFlag isoCode="ar" size={25} /></View>
                                                            <Text style={{ ...styles.translation, width: '100%' }}>{formatWord(value.sp)}</Text>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity onPress={() => { deleteHandler(value.ID); vibrate('short') }} style={{ position:'absolute', right:0, height:30,width:30,alignItems:'flex-end',justifyContent:'center' }}>
                                                        <Icon as={FontAwesome5} name='times' size={'md'} color={'#A8A29E'} />
                                                    </TouchableOpacity>
                                                </Card>
                                            </TouchableOpacity>
                                        )
                                    })
                                :
                                <TouchableOpacity activeOpacity={0.8} key={'W9999'}>
                                    <Card containerStyle={{ ...styles.card }}>
                                        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                            <Icon marginLeft={5} marginRight={7} as={FontAwesome5} name='heart-broken' size={'5xl'} color={'#3a373b'} />
                                            <Text style={{ ...styles.translation, width: 250, textAlign: 'left' }}>{'No hay palabras. Puede agregar presionando en el botón debajo.'}</Text>
                                        </View>
                                        <Divider style={{ margin: 10 }} />
                                        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                            <Icon marginLeft={5} marginRight={7} as={FontAwesome5} name='dove' size={'5xl'} color={'#3a373b'} />
                                            <Text style={{ ...styles.translation, width: 250, textAlign: 'left' }}>{'También puede agregar temas y organizar su diccionario.'}</Text>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                        }
                        <Flex direction='column' style={{ flex: 1, height: '100%', marginTop: 15 }}>
                        </Flex>
                        <View style={{ width: '100%', height: 20, backgroundColor: '#774360' }} />
                    </TouchableOpacity>
                </ScrollView>
                <View style={{ height: '120%', width: 30, zIndex: -1, right: 0, backgroundColor: '#C82A35', position: 'absolute', transform: [{ rotateZ: '38deg' }] }} />
                <View style={{ height: '120%', width: 30, zIndex: -1, right: 38, backgroundColor: '#F7F7F7', position: 'absolute', transform: [{ rotateZ: '38deg' }] }} />
                <View style={{ height: '120%', width: 30, zIndex: -1, right: 76, backgroundColor: '#008D44', position: 'absolute', transform: [{ rotateZ: '38deg' }] }} />
                <View style={{ width: '100%', height: 20, backgroundColor: '#4C3A51', bottom: 0 }} />
                <View style={{ width: '100%', height: 56, backgroundColor: '#1C2938', bottom: 0 }} />
                <ButtonsDock />
                {!addModalOpen ? <></> :
                    <CreateFloatingDock />
                }
                <QRModal />
                <ScannerModal />
            </Flex>
        </AlertNotificationRoot>
    )

}

function formatWord(word: string) {
    if (word.length >= 1) {
        let s = word.toLowerCase();
        s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        return s;
    }
    else return word.toUpperCase();
}

function orderArray(list: any[], _randomSort: boolean) {
    let array = [...list];
    if (_randomSort) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    else {
        array.sort((a, b) => {
            if (a['it'] > b['it']) return 1;
            else {
                if (a['it'] < b['it']) return -1;
                else return 0;
            }
        })
    }
    return array;
}

const largeButton = (icon, color, onPress?, title?, margin?: { left?: number, bottom?: number }, absolute?: { bottom?: number, top?: number, left?: number, right?: number }) => {
    return (
        <View style={{
            flexDirection: 'column', alignItems: 'center',
            position: absolute ? 'absolute' : 'relative',
            bottom: absolute?.bottom ? absolute.bottom : undefined,
            top: absolute?.top ? absolute.top : undefined,
            left: absolute?.left ? absolute.left : undefined,
            right: absolute?.right ? absolute.right : undefined
        }}>
            <TouchableOpacity>

                <IconButton backgroundColor={color}
                    borderColor={color + '88'}
                    borderWidth={4}
                    _icon={{
                        as: FontAwesome5,
                        name: icon,
                        size: '2xl',
                        marginLeft: margin?.left,
                        marginBottom: margin?.bottom
                    }}
                    _pressed={{ bg: color + 'BB', borderColor: color + '77' }}
                    rounded='full' variant='solid' style={styles.button} onPress={() => { vibrate('micro'); onPress(); }}>
                </IconButton>
            </TouchableOpacity>
            {fontsLoaded ? <Text style={styles.buttonTitle}>{title}</Text> : <></>}
        </View>
    );
}

const styles = StyleSheet.create({
    headerText: {
        color: '#ffffff',
        fontSize: 24,
        fontFamily: 'Galder'
    },
    header: {
        height: 70,
        width: '100%',
        backgroundColor: '#F5333F',
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: '#17202a'
    },
    scroll: {
        height: '100%',
        marginBottom: 0,
        backgroundColor: '#f7f7f7AA' //f7f7f7
    },
    translation: {
        color: '#3a373b',
        fontSize: 24,
        fontFamily: 'Belanosima'
    },
    card: {
        borderRadius: 6,
    },
    button: {
        height: 72,
        width: 72,
        marginLeft: 25,
        marginRight: 25,
        marginBottom: 5,
    },
    smallButton: {
        height: 40,
        width: 40,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 3,
    },
    buttonTitle: {
        textAlign: 'center',
        width: 100,
        fontFamily: 'Belanosima',
        fontSize: 16,
        color: '#fff',
    },
    buttonDock: {
        position: 'absolute',
        bottom: 15,
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        flexDirection: 'row',
    },
    coloredCard: {
        backgroundColor: '#B25068',
        borderColor: '#4C3A51AA',
        borderRadius: 8,
        borderWidth: 4,
    },
})