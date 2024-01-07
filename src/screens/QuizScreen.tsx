import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, Text } from 'react-native'
import { WordExportType, getAllWords } from '../db/SQLiteRepo';
import { Card } from '@rneui/base';
import { useFonts } from 'expo-font';
import { CheckIcon, CloseIcon, Input, WarningIcon } from 'native-base';
import { Alert } from 'react-native';
import { ALERT_TYPE, Dialog } from '@nescude/react-native-alert-notification';



const stringSimilarity = require("string-similarity");

export default function HomeScreen({ navigation }) {

    const [fontsLoaded] = useFonts({
        'Galder': require('../../assets/fonts/galder.ttf'),
        'Galder-2': require('../../assets/fonts/galder-2.ttf'),
        'Galder-Light': require('../../assets/fonts/galder-light.ttf'),
        'Belanosima': require('../../assets/fonts/Belanosima-Regular.ttf'),
        'AbrilFatface': require('../../assets/fonts/AbrilFatface-Regular.ttf')
    });

    const [words, setWords] = useState<WordExportType[]>([]);
    const [similarity, setSimilarity] = useState(-1);
    const [input, setInput] = useState('');
    const [activeTranslation, setActiveTranslation] = useState<WordExportType>({ it: '', sp: '' });
    const [cleared, setCleared] = useState(false);
    const [clearedQuestions, setClearedQuestions] = useState(0);
    const [drawed, setDrawed] = useState<WordExportType[]>([]);

    async function readDB() {
        const all = await getAllWords();
        const array = all;
        setWords(array);
        let draw = drawRandom(array, []);
        setDrawed([...drawed, draw]);
        setActiveTranslation(draw);
    }

    useEffect(() => {
        //deleteAll();
        //insertWord('Domanda','Pregunta');
        readDB();
    }, [])

    const acceptHandler = () => {
        if (cleared) {
            if (clearedQuestions < 4 && drawed.length < words.length) {
                let draw = drawRandom(words, drawed);
                setDrawed([...drawed, draw]);
                setActiveTranslation(draw);
                setCleared(false);
                setSimilarity(-1);
                setInput('');
                setClearedQuestions(clearedQuestions + 1);
            }
            else {
                Dialog.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Éxito',
                    textBody: '¡Práctica completada! Bravissimo!',
                    buttons: ['OK']
                })
                navigation.navigate('HomeScreen');
            }
        }
        else {
            let sim = compareWords(input, activeTranslation.sp);
            setSimilarity(sim);
            if (sim >= 1) setCleared(true);
        }
    }
    const image = require('../../assets/img/bg2.jpg')
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <ImageBackground source={image} style={{ flex: 1 }} imageStyle={{ opacity: 0.4 }}>
                <Card containerStyle={{ ...styles.coloredCard }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', margin: 5 }}>
                        {activeTranslation ?
                            <View style={{ width: '80%' }}>
                                <Text style={{ ...styles.translation, color: '#fff' }}>
                                    {formatWord(activeTranslation.it)}
                                </Text>
                            </View> : <></>
                        }
                        <View style={{ height: 30, flex: 1, backgroundColor: 'red' }} />
                        <View style={{ flexDirection: 'row', borderColor: '#fff', borderWidth: 2 }}>
                            <View style={{ height: 40, width: 20, backgroundColor: '#C82A35' }} />
                            <View style={{ height: 40, width: 20, backgroundColor: '#F7F7F7' }} />
                            <View style={{ height: 40, width: 20, backgroundColor: '#008D44' }} />
                        </View>
                    </View>
                </Card>
                <Card containerStyle={{ ...styles.card, padding: 2 }}>
                    <View style={{ ...styles.header }}>
                        <Text style={{ ...styles.translation, color: '#fff' }}>¿Qué significa ...?</Text>
                    </View>
                    <View style={{ padding: 20 }}>
                        <Input value={input} onChangeText={(text) => { setInput(text); setSimilarity(-1) }} placeholder='Traducción' size={'2xl'} _focus={{ bg: '#B2506855', borderColor: '#4C3A51' }} >
                        </Input>
                    </View>
                </Card>

                {
                    similarity >= 0 && similarity < 0.5 ? infoCard('incorrect') : <></>
                }
                {
                    similarity >= 0.5 && similarity < 1 ? infoCard('almost') : <></>
                }
                {
                    similarity >= 1 ? infoCard('correct') : <></>
                }
                <View style={{ flex: 1 }}></View>
                <TouchableOpacity activeOpacity={0.2}
                    style={{ ...styles.acceptButton, ...styles.coloredCard }}
                    onPress={acceptHandler}
                >
                    <Text style={{ ...styles.translation, color: '#fff' }}>{cleared ? 'SIGUIENTE' : 'ACEPTAR'}</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    )
}


function formatWord(word: string) {

    if (word != null && word != undefined) {
        if (word.length >= 1) {
            let s = word.toLowerCase();
            s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
            return s.toUpperCase();
        }
        else return word.toUpperCase()
    }
    else return '';
}

function drawRandom(array: WordExportType[], drawed: WordExportType[]): WordExportType {
    let a = array[Math.floor(Math.random() * array.length)];
    if (drawed.includes(a)) {
        return drawRandom(array, drawed);
    }
    else
        return a;
}


const compareWords = (s1: string, s2: string) => {
    let removeDiac = (string) => {
        return string.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u');
    }
    return stringSimilarity.compareTwoStrings(removeDiac(s1.toLowerCase()), removeDiac(s2.toLowerCase()));
}

const infoCard = (type: ('correct' | 'incorrect' | 'almost')) => {
    switch (type) {
        case 'correct':
            return (
                <View style={{ ...styles.statusCard, height: 55, backgroundColor: '#28b463', borderColor: '#16161688' }}>
                    <Text style={{ ...styles.button_text, color: '#fff', marginRight: 20 }}>{"¡Correcto!".toUpperCase()}</Text>
                    <CheckIcon size="7" color="#fff" />
                </View>
            ); break;
        case 'almost':
            return (
                <View style={{ ...styles.statusCard, height: 55, backgroundColor: '#f5b041', borderColor: '#16161688' }}>
                    <Text style={{ ...styles.button_text, color: '#fff', marginRight: 20 }}>{"¡Estás cerca!".toUpperCase()}</Text>
                    <WarningIcon size="7" color="#fff" />
                </View>
            ); break;
        case 'incorrect':
            return (
                <View style={{ ...styles.statusCard, height: 55, backgroundColor: '#cf3f3f', borderColor: '#16161688' }}>
                    <Text style={{ ...styles.button_text, color: '#fff', marginRight: 20 }}>{"Incorrecto".toUpperCase()}</Text>
                    <CloseIcon size="7" color="#fff" />
                </View>
            ); break;
    }
}

const shadowOpts = {
    width: 100,
    height: 100,
    color: "#000",
    border: 2,
    radius: 3,
    opacity: 0.2,
    x: 0,
    y: 3,
}


const styles = StyleSheet.create({
    headerText: {
        color: '#ffffff',
        fontSize: 24,
        fontFamily: 'Galder'
    },
    header: {
        marginBottom: 0,
        backgroundColor: '#161616',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        top: 0
    },
    translation: {
        color: '#4C3A51',
        fontSize: 24,
        fontFamily: 'Belanosima',
    },
    button_text: {
        color: '#4C3A51',
        fontSize: 20,
        fontFamily: 'Belanosima',
    },
    card: {
        borderRadius: 8,
        borderWidth: 4,
        borderColor: '#161616AA'
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
    statusCard: {
        borderRadius: 8,
        flexDirection: 'row',
        height: 40,
        margin: 15,
        marginBottom: 0,
        marginTop: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
    },
    coloredCard: {
        backgroundColor: '#B25068',
        borderColor: '#161616AA',
        borderRadius: 8,
        borderWidth: 4,
    },
    acceptButton: {
        borderRadius: 8,
        flexDirection: 'row',
        height: 70,
        margin: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
})