import { Vibration } from "react-native";

export default function vibrate(duration: ('long' | 'short' | 'micro')){
    let vibrate = 0;
    switch (duration) {
        case 'long': vibrate = 300; break;
        case 'short': vibrate = 200; break;
        case 'micro': vibrate = 50; break;
    }
    Vibration.vibrate(vibrate);
}