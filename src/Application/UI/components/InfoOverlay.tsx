import React, { useEffect, useRef, useState } from 'react';
import FreeCamToggle from './FreeCamToggle';
import MuteToggle from './MuteToggle';

interface InfoOverlayProps {
    visible: boolean;
}

const NAME_TEXT = 'Daniel Cook';
const TITLE_TEXT = 'Cyber Security Analyst/Software Engineer';
const MULTIPLIER = 1;

const InfoOverlay: React.FC<InfoOverlayProps> = ({ visible }) => {
    const visRef = useRef(visible);
    const [nameText, setNameText] = useState('');
    const [titleText, setTitleText] = useState('');
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const timeRef = useRef(time);
    const [timeText, setTimeText] = useState('');
    const [textDone, setTextDone] = useState(false);
    const [volumeVisible, setVolumeVisible] = useState(false);
    const [freeCamVisible, setFreeCamVisible] = useState(false);

    const typeText = (
        i: number,
        curText: string,
        text: string,
        setText: React.Dispatch<React.SetStateAction<string>>,
        callback: () => void,
        refOverride?: React.MutableRefObject<string>
    ) => {
        if (refOverride) {
            text = refOverride.current;
        }
        if (i < text.length) {
            setTimeout(() => {
                if (visRef.current === true)
                    window.postMessage(
                        { type: 'keydown', key: `_AUTO_${text[i]}` },
                        '*'
                    );

                setText(curText + text[i]);
                typeText(
                    i + 1,
                    curText + text[i],
                    text,
                    setText,
                    callback,
                    refOverride
                );
            }, Math.random() * 50 + 50 * MULTIPLIER);
        } else {
            callback();
        }
    };

    useEffect(() => {
        if (visible && nameText == '') {
            setTimeout(() => {
                typeText(0, '', NAME_TEXT, setNameText, () => {
                    typeText(0, '', TITLE_TEXT, setTitleText, () => {
                        typeText(
                            0,
                            '',
                            time,
                            setTimeText,
                            () => {
                                setTextDone(true);
                            },
                            timeRef
                        );
                    });
                });
            }, 400);
        }
        visRef.current = visible;
    }, [visible]);

    useEffect(() => {
        if (textDone) {
            setTimeout(() => {
                setVolumeVisible(true);
                setTimeout(() => {
                    setFreeCamVisible(true);
                }, 250);
            }, 250);
        }
    }, [textDone]);

    useEffect(() => {
        window.postMessage({ type: 'keydown', key: `_AUTO_` }, '*');
    }, [freeCamVisible, volumeVisible]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        timeRef.current = time;
        textDone && setTimeText(time);
    }, [time]);

    return (
        <div style={styles.wrapper}>
            {nameText !== '' && (
                <div style={styles.container}>
                    <p style={styles.text}>{nameText}</p>
                </div>
            )}
            {titleText !== '' && (
                <div style={styles.container}>
                    <p style={styles.text}>{titleText}</p>
                </div>
            )}
            {timeText !== '' && (
                <div style={styles.lastRow}>
                    <div
                        style={Object.assign(
                            {},
                            styles.container,
                            styles.lastRowChild
                        )}
                    >
                        <p style={styles.text}>{timeText}</p>
                    </div>
                    {volumeVisible && (
                        <div style={styles.lastRowChild}>
                            <MuteToggle />
                        </div>
                    )}
                    {freeCamVisible && (
                        <div style={styles.lastRowChild}>
                            <FreeCamToggle />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles: StyleSheetCSS = {
    container: {
        background:
            'linear-gradient(145deg, rgba(4, 6, 10, 0.95), rgba(2, 2, 2, 0.88))',
        border: '1px solid rgba(176, 255, 255, 0.22)',
        backdropFilter: 'blur(2px)',
        padding: 4,
        paddingLeft: 14,
        paddingRight: 14,
        textAlign: 'center',
        display: 'flex',
        marginBottom: 4,
        borderRadius: 2,
        boxSizing: 'border-box',
    },
    text: {
        color: '#e9ffff',
        textShadow: '0 0 8px rgba(119, 255, 255, 0.28)',
        letterSpacing: 0.9,
    },
    wrapper: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingTop: 4,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    blinkingContainer: {
        // width: 100,
        // height: 100,
        marginLeft: 8,
        paddingBottom: 2,
        paddingRight: 4,
    },
    lastRow: {
        display: 'flex',
        flexDirection: 'row',
    },
    lastRowChild: {
        marginRight: 4,
    },
};

export default InfoOverlay;
