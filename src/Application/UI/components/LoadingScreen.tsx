import React, { useCallback, useEffect, useState } from 'react';
import eventBus from '../EventBus';

type LoadingProps = {};

const LoadingScreen: React.FC<LoadingProps> = () => {
    const [overlayOpacity, setLoadingOverlayOpacity] = useState(1);
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [toLoad, setToLoad] = useState(0);
    const [showStartPrompt, setShowStartPrompt] = useState(false);
    const [firefoxPopupOpacity, setFirefoxPopupOpacity] = useState(0);
    const [webGLErrorOpacity, setWebGLErrorOpacity] = useState(0);
    const [firefoxError, setFirefoxError] = useState(false);
    const [webGLError, setWebGLError] = useState(false);
    const [mobileWarning, setMobileWarning] = useState(window.innerWidth < 768);
    const [computerStep, setComputerStep] = useState(0);

    const onResize = () => {
        setMobileWarning(window.innerWidth < 768);
    };

    useEffect(() => {
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    useEffect(() => {
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            setFirefoxError(true);
            return;
        }

        if (!detectWebGLContext()) {
            setWebGLError(true);
        }
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setComputerStep((previous) => (previous + 1) % 4);
        }, 450);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        eventBus.on('loadedSource', (data) => {
            setProgress(data.progress);
            setLoaded(data.loaded);
            setToLoad(data.toLoad);

            if (data.progress >= 1) {
                setTimeout(() => {
                    setShowStartPrompt(true);
                }, 300);
            }
        });
    }, []);

    useEffect(() => {
        if (firefoxError) {
            setTimeout(() => {
                setFirefoxPopupOpacity(1);
            }, 200);
        }
    }, [firefoxError]);

    useEffect(() => {
        if (webGLError) {
            setTimeout(() => {
                setWebGLErrorOpacity(1);
            }, 200);
        }
    }, [webGLError]);

    const start = useCallback(() => {
        setLoadingOverlayOpacity(0);
        eventBus.dispatch('loadingScreenDone', {});
        const ui = document.getElementById('ui');
        if (ui) {
            ui.style.pointerEvents = 'none';
        }
    }, []);

    const detectWebGLContext = () => {
        const canvas = document.createElement('canvas');
        const gl =
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');

        return !!(gl && gl instanceof WebGLRenderingContext);
    };

    const computerSequence = '💻'.repeat(computerStep);

    return (
        <div
            style={Object.assign({}, styles.overlay, {
                opacity: overlayOpacity,
                transform: `scale(${overlayOpacity === 0 ? 1.04 : 1})`,
            })}
        >
            {!firefoxError && !webGLError && (
                <div style={Object.assign({}, styles.popupContainer, { opacity: 1 })}>
                    <div style={styles.startPopup}>
                        {!showStartPrompt ? (
                            <>
                                <p>LOADING RESOURCES</p>
                                <div style={styles.spacer} />
                                <p>
                                    {loaded}/{toLoad === 0 ? '-' : toLoad} (
                                    {Math.round(progress * 100)}%)
                                </p>
                                <div style={styles.spacer} />
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        gap: 8,
                                    }}
                                >
                                    <p>Please wait</p>
                                    <span style={styles.dogLoader}>{computerSequence}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Daniel Cook Portfolio Showcase</p>
                                {mobileWarning && (
                                    <>
                                        <br />
                                        <b>
                                            <p style={styles.warning}>
                                                Mobile device detected. For the best experience,
                                                click SCREEN ONLY.
                                            </p>
                                        </b>
                                        <br />
                                    </>
                                )}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        gap: 8,
                                        marginTop: '4px',
                                    }}
                                >
                                    <p>Click start to begin</p>
                                    <span style={styles.dogLoader}>{computerSequence}</span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginTop: '16px',
                                    }}
                                >
                                    <div className="bios-start-button" onClick={start}>
                                        <p>START</p>
                                    </div>
                                    <div
                                        className="bios-start-button"
                                        style={{ marginLeft: '12px' }}
                                        onClick={() =>
                                            (window.location.href =
                                                'https://danos-website-gsxi.vercel.app/')
                                        }
                                    >
                                        <p>SCREEN ONLY</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {firefoxError && (
                <div
                    style={Object.assign({}, styles.popupContainer, {
                        opacity: firefoxPopupOpacity,
                    })}
                >
                    <div style={styles.startPopup}>
                        <p>
                            <b style={{ color: 'red' }}>FATAL ERROR:</b> Firefox Detected
                        </p>
                        <div style={styles.spacer} />
                        <div style={styles.spacer} />
                        <p>
                            Due to a{' '}
                            <a style={styles.link} href={'https://github.com/dc0820/'}>
                                bug in firefox
                            </a>
                            , this website is temporarily inaccessible for anyone using the
                            browser.
                        </p>
                        <div style={styles.spacer} />
                        <p>
                            In the mean time if you want to access this site you will need to use
                            a different browser.
                        </p>
                        <div style={styles.spacer} />
                        <p>Thank you - Daniel</p>
                    </div>
                </div>
            )}
            {webGLError && (
                <div
                    style={Object.assign({}, styles.popupContainer, {
                        opacity: webGLErrorOpacity,
                    })}
                >
                    <div style={styles.startPopup}>
                        <p>
                            <b style={{ color: 'red' }}>CRITICAL ERROR:</b> No WebGL Detected
                        </p>
                        <div style={styles.spacer} />
                        <div style={styles.spacer} />
                        <p>WebGL is required to run this site.</p>
                        <p>Please enable it or switch to a browser which supports WebGL</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles: StyleSheetCSS = {
    overlay: {
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
        display: 'flex',
        transition: 'opacity 0.2s, transform 0.2s',
        MozTransition: 'opacity 0.2s, transform 0.2s',
        WebkitTransition: 'opacity 0.2s, transform 0.2s',
        OTransition: 'opacity 0.2s, transform 0.2s',
        msTransition: 'opacity 0.2s, transform 0.2s',
        transitionTimingFunction: 'ease-in-out',
        MozTransitionTimingFunction: 'ease-in-out',
        WebkitTransitionTimingFunction: 'ease-in-out',
        OTransitionTimingFunction: 'ease-in-out',
        msTransitionTimingFunction: 'ease-in-out',
        boxSizing: 'border-box',
        fontSize: 16,
        letterSpacing: 0.8,
    },
    popupContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    startPopup: {
        backgroundColor: '#000',
        padding: 24,
        border: '7px solid #fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: 540,
    },
    warning: {
        color: 'yellow',
    },
    dogLoader: {
        minWidth: 70,
        minHeight: '1.4em',
        lineHeight: '1.4em',
        display: 'inline-flex',
        alignItems: 'center',
        textAlign: 'left',
        letterSpacing: 2,
    },
    spacer: {
        height: 16,
    },
    link: {
        color: '#4598ff',
        cursor: 'pointer',
    },
};

export default LoadingScreen;
