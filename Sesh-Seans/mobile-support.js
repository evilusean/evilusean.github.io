// Mobile/iOS support: screen wake lock, alarm audio, and background timer recovery
const MobileSupport = {
    wakeLockSentinel: null,
    noSleepVideo: null,
    silentKeepaliveAudio: null,
    alarmAudio: null,
    alarmAudioUrl: null,
    alarmStopFn: null,
    keepAwakeActive: false,
    initialized: false,

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    },

    isMobile() {
        return this.isIOS() || /Android/i.test(navigator.userAgent);
    },

    hasWakeLock() {
        return 'wakeLock' in navigator;
    },

    init() {
        if (this.initialized) return;
        this.initialized = true;

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.keepAwakeActive) {
                this._acquireWakeLock();
            }
        });

        // Unlock audio on first user interaction (required on iOS)
        const unlockOnce = () => {
            this.unlockAudio();
            document.removeEventListener('touchstart', unlockOnce, true);
            document.removeEventListener('click', unlockOnce, true);
        };
        document.addEventListener('touchstart', unlockOnce, { capture: true, passive: true });
        document.addEventListener('click', unlockOnce, { capture: true });
    },

    async unlockAudio() {
        try {
            if (typeof getAudioContext === 'function') {
                await getAudioContext();
            }
        } catch (e) {
            console.warn('AudioContext unlock failed:', e);
        }

        if (!this.alarmAudioUrl) {
            this.alarmAudioUrl = this._createAlarmWavUrl();
        }

        if (!this.silentKeepaliveAudio) {
            this.silentKeepaliveAudio = new Audio(this._createSilentWavUrl());
            this.silentKeepaliveAudio.loop = true;
            this.silentKeepaliveAudio.volume = 0.01;
            this.silentKeepaliveAudio.setAttribute('playsinline', '');
        }

        try {
            await this.silentKeepaliveAudio.play();
            this.silentKeepaliveAudio.pause();
            this.silentKeepaliveAudio.currentTime = 0;
        } catch (e) {
            // Expected until user gesture on some browsers
        }
    },

    enableKeepAwake() {
        if (this.keepAwakeActive) return;
        this.keepAwakeActive = true;
        this._acquireWakeLock();
        this._showKeepAwakeIndicator(true);
    },

    disableKeepAwake() {
        if (!this.keepAwakeActive) return;
        this.keepAwakeActive = false;
        this._releaseWakeLock();
        this.stopSilentKeepalive();
        this._showKeepAwakeIndicator(false);
    },

    startSilentKeepalive() {
        if (!this.silentKeepaliveAudio) {
            this.silentKeepaliveAudio = new Audio(this._createSilentWavUrl());
            this.silentKeepaliveAudio.loop = true;
            this.silentKeepaliveAudio.volume = 0.01;
            this.silentKeepaliveAudio.setAttribute('playsinline', '');
        }
        this.silentKeepaliveAudio.play().catch(() => {});
    },

    stopSilentKeepalive() {
        if (this.silentKeepaliveAudio) {
            this.silentKeepaliveAudio.pause();
            this.silentKeepaliveAudio.currentTime = 0;
        }
    },

    async _acquireWakeLock() {
        if (this.hasWakeLock()) {
            try {
                if (this.wakeLockSentinel && !this.wakeLockSentinel.released) {
                    return;
                }
                this._disableVideoFallback();
                this.wakeLockSentinel = await navigator.wakeLock.request('screen');
                this.wakeLockSentinel.addEventListener('release', () => {
                    this.wakeLockSentinel = null;
                    if (this.keepAwakeActive) {
                        this._enableVideoFallback();
                    }
                });
                console.log('Screen wake lock active');
                return;
            } catch (e) {
                console.warn('Wake lock unavailable, using video fallback:', e.message);
            }
        }

        this._enableVideoFallback();
    },

    _releaseWakeLock() {
        if (this.wakeLockSentinel) {
            this.wakeLockSentinel.release().catch(() => {});
            this.wakeLockSentinel = null;
        }
        this._disableVideoFallback();
    },

    _enableVideoFallback() {
        if (this.noSleepVideo) {
            this.noSleepVideo.play().catch(() => {});
            return;
        }

        const media = window.NOSLEEP_MEDIA;
        if (!media || !media.mp4) {
            console.warn('NoSleep media not loaded');
            return;
        }

        const video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.muted = true;
        video.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;left:-9999px';
        video.setAttribute('title', 'Keep Awake');

        if (media.webm) {
            const webmSource = document.createElement('source');
            webmSource.src = media.webm;
            webmSource.type = 'video/webm';
            video.appendChild(webmSource);
        }

        const mp4Source = document.createElement('source');
        mp4Source.src = media.mp4;
        mp4Source.type = 'video/mp4';
        video.appendChild(mp4Source);

        video.addEventListener('loadedmetadata', () => {
            if (video.duration <= 1) {
                video.setAttribute('loop', '');
            } else {
                video.addEventListener('timeupdate', () => {
                    if (video.currentTime > 0.5) {
                        video.currentTime = 0.1;
                    }
                });
            }
        });

        document.body.appendChild(video);
        this.noSleepVideo = video;
        video.play().catch((err) => console.warn('Video keep-awake failed:', err));
    },

    _disableVideoFallback() {
        if (this.noSleepVideo) {
            this.noSleepVideo.pause();
        }
    },

    _showKeepAwakeIndicator(active) {
        const el = document.getElementById('keepAwakeStatus');
        if (el) {
            el.classList.toggle('hidden', !active);
        }
    },

    async startAlarmSound() {
        await this.unlockAudio();

        if (navigator.vibrate) {
            navigator.vibrate([800, 400, 800, 400, 800, 400, 800]);
        }

        // HTML5 Audio loop — more reliable on iOS than Web Audio intervals
        if (!this.alarmAudio) {
            this.alarmAudio = new Audio(this.alarmAudioUrl || this._createAlarmWavUrl());
            this.alarmAudio.loop = true;
            this.alarmAudio.volume = 1.0;
            this.alarmAudio.setAttribute('playsinline', '');
        }

        try {
            this.alarmAudio.currentTime = 0;
            await this.alarmAudio.play();
        } catch (e) {
            console.warn('HTML5 alarm play failed, trying Web Audio:', e);
        }

        // Web Audio backup beeps
        let alarmInterval;
        const playBeep = async () => {
            try {
                const audioContext = await getAudioContext();
                if (!audioContext) return;
                for (let i = 0; i < 5; i++) {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = 1000;
                    osc.type = 'sawtooth';
                    const startTime = audioContext.currentTime + (i * 0.4);
                    gain.gain.setValueAtTime(0.5, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                    osc.start(startTime);
                    osc.stop(startTime + 0.3);
                }
            } catch (err) {
                console.error('Web Audio alarm beep failed:', err);
            }
        };

        playBeep();
        alarmInterval = setInterval(playBeep, 2000);

        const vibrateInterval = setInterval(() => {
            if (navigator.vibrate) {
                navigator.vibrate([500, 200, 500]);
            }
        }, 3000);

        this.alarmStopFn = () => {
            clearInterval(alarmInterval);
            clearInterval(vibrateInterval);
            if (this.alarmAudio) {
                this.alarmAudio.pause();
                this.alarmAudio.currentTime = 0;
            }
            if (navigator.vibrate) {
                navigator.vibrate(0);
            }
        };

        return this.alarmStopFn;
    },

    stopAlarmSound() {
        if (this.alarmStopFn) {
            this.alarmStopFn();
            this.alarmStopFn = null;
        }
    },

    _createSilentWavUrl() {
        const sampleRate = 8000;
        const numSamples = sampleRate;
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);
        this._writeWavHeader(view, numSamples, sampleRate);
        return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    },

    _createAlarmWavUrl() {
        const sampleRate = 44100;
        const duration = 2;
        const numSamples = sampleRate * duration;
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);
        this._writeWavHeader(view, numSamples, sampleRate);

        const freq = 880;
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const cycle = (t * freq) % 1;
            const sample = cycle < 0.5 ? 0.9 : -0.9;
            const envelope = i < sampleRate * 0.05 ? i / (sampleRate * 0.05) :
                i > numSamples - sampleRate * 0.05 ? (numSamples - i) / (sampleRate * 0.05) : 1;
            view.setInt16(44 + i * 2, sample * envelope * 0x7FFF, true);
        }

        return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
    },

    _writeWavHeader(view, numSamples, sampleRate) {
        const writeStr = (offset, str) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };
        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeStr(36, 'data');
        view.setUint32(40, numSamples * 2, true);
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            return Notification.requestPermission();
        }
        return Promise.resolve(Notification.permission);
    }
};
