"""Синтез аккуратного саунд-дизайна для DentalImplantReel.

Все звуки генерируются кодом (numpy), без сторонних сэмплов, поэтому
лицензия не нужна. Запуск из корня проекта:

    python3 scripts/make-sfx.py

Результат: public/sfx/*.mp3 (нужен ffmpeg в PATH).
"""

import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sfx')
rng = np.random.default_rng(32)


def t_axis(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, attack, decay):
    """Экспоненциальная огибающая с мягкой атакой (секунды)."""
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    a = np.sin(a * np.pi / 2) ** 2
    return a * np.exp(-t / decay)


def lowpass(x, cutoff):
    """Однополюсный ФНЧ; cutoff — число или массив той же длины."""
    c = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    k = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += k[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def reverb(x, seconds=1.2, mix=0.25, damp=6000):
    """Небольшой «воздух»: свёртка с затухающим отфильтрованным шумом."""
    n = int(SR * seconds)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (seconds / 5))
    ir = lowpass(ir, damp)
    ir /= np.sqrt(np.sum(ir ** 2))
    size = len(x) + n
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:size]
    dry = np.concatenate([x, np.zeros(n)])
    return dry * (1 - mix) + wet * mix


def bell(freq, sec, decay, partials=((1, 1), (2.0, 0.35), (2.76, 0.2), (5.4, 0.08))):
    t = t_axis(sec)
    y = np.zeros_like(t)
    for ratio, amp in partials:
        y += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / (decay / ratio ** 0.5))
    return y * env(len(t), 0.004, 10)


def place(dst, src, at):
    i = int(SR * at)
    end = min(len(dst), i + len(src))
    dst[i:end] += src[: end - i]


def normalize(x, peak_db):
    peak = np.max(np.abs(x)) or 1
    return x / peak * 10 ** (peak_db / 20)


def fade_tail(x, sec=0.05):
    n = int(SR * sec)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def save(name, mono, width=0.12):
    """Лёгкое стерео за счёт микрозадержки правого канала."""
    mono = fade_tail(mono)
    d = int(SR * 0.0007)
    left = mono
    right = np.concatenate([np.zeros(d), mono[:-d]]) * (1 - width) + mono * width
    stereo = np.stack([left, right], axis=1)
    pcm = (np.clip(stereo, -1, 1) * 32767).astype('<i2')
    os.makedirs(OUT, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        path = tmp.name
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-codec:a', 'libmp3lame', '-q:a', '2',
         os.path.join(OUT, f'{name}.mp3')],
        check=True,
    )
    os.remove(path)
    print('ok', name)


# shimmer — мягкий звон при появлении имплантата (две ноты, E6 → B6)
def shimmer():
    y = np.zeros(int(SR * 1.6))
    place(y, bell(1318.5, 1.5, 0.9), 0)
    place(y, 0.6 * bell(1975.5, 1.4, 0.7), 0.07)
    place(y, 0.25 * bell(2637.0, 1.2, 0.5), 0.14)
    return normalize(reverb(lowpass(y, 9000), 1.4, 0.35), -6)


# whoosh — тихий воздушный свист: шум с плавающим фильтром
def whoosh(sec=0.55):
    n = int(SR * sec)
    t = np.arange(n) / n
    noise = rng.standard_normal(n)
    sweep = 500 + 2600 * np.sin(np.pi * t) ** 1.5
    y = lowpass(highpass(noise, 250), sweep)
    y *= np.sin(np.pi * np.clip(t * 1.15, 0, 1)) ** 2
    return normalize(reverb(y, 0.8, 0.2), -6)


# sparkle — россыпь коротких «бликов» + звонкий хвост
def sparkle():
    y = np.zeros(int(SR * 1.2))
    pings = [(0.00, 3520), (0.05, 4186), (0.11, 3951), (0.16, 5274), (0.23, 4699), (0.31, 6272)]
    for i, (at, f) in enumerate(pings):
        p = bell(f, 0.25, 0.06, ((1, 1), (2.0, 0.15))) * (1 - i * 0.1)
        place(y, p, at)
    place(y, 0.35 * bell(2093.0, 1.0, 0.5), 0.02)
    return normalize(reverb(y, 1.2, 0.4), -6)


# draw — едва слышный «штрих» при рисовании линии
def draw(sec=0.4):
    n = int(SR * sec)
    t = np.arange(n) / n
    y = lowpass(highpass(rng.standard_normal(n), 2500), 7000)
    y *= np.sin(np.pi * t) ** 2 * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * t))
    return normalize(reverb(y, 0.5, 0.15), -6)


# tick — мягкий деревянный тап (зубы, абатмент)
def tick():
    t = t_axis(0.25)
    y = np.sin(2 * np.pi * 1650 * t) * np.exp(-t / 0.018)
    y += 0.5 * np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.03)
    click = lowpass(rng.standard_normal(len(t)), 4000) * np.exp(-t / 0.003) * 0.4
    return normalize(reverb(y + click, 0.4, 0.15), -6)


# pop — мягкий «пузырёк» (смена фраз, кнопка)
def pop():
    t = t_axis(0.3)
    f = 420 + 520 * (1 - np.exp(-t / 0.03))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.003, 0.06)
    return normalize(reverb(lowpass(y, 5000), 0.5, 0.2), -6)


# drop — тихий нисходящий тон: зуб исчезает
def drop():
    t = t_axis(0.6)
    f = 640 * np.exp(-t / 0.45)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.01, 0.18)
    y += 0.3 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * env(len(t), 0.01, 0.1)
    return normalize(reverb(y, 0.9, 0.3), -6)


# click — коронка «садится» на абатмент: короткий тёплый щелчок
def click():
    t = t_axis(0.5)
    body = np.sin(2 * np.pi * 150 * t) * np.exp(-t / 0.07)
    snap = bell(2400, 0.3, 0.03, ((1, 1), (1.5, 0.3))) * 0.5
    y = body
    place(y, snap, 0)
    return normalize(reverb(y, 0.6, 0.2), -6)


# chime — финальный аккорд CTA (E5 + B5 + E6), мягко
def chime():
    y = np.zeros(int(SR * 2.2))
    for i, f in enumerate([659.3, 987.8, 1318.5]):
        place(y, (1 - i * 0.2) * bell(f, 2.0, 1.1), i * 0.045)
    return normalize(reverb(lowpass(y, 7000), 1.8, 0.4), -6)


# impact — глубокий мягкий удар: суб-бас, шумовой всплеск, короткий хвост
def impact():
    t = t_axis(1.4)
    f = 32 + 90 * np.exp(-t / 0.05)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35)
    burst = lowpass(rng.standard_normal(len(t)), 2600) * np.exp(-t / 0.09) * 0.55
    body = np.sin(2 * np.pi * 96 * t) * np.exp(-t / 0.12) * 0.4
    y = boom + burst + body
    return normalize(reverb(y, 1.2, 0.18), -4)


# type — едва слышный щелчок клавиши
def type_key():
    t = t_axis(0.09)
    y = lowpass(highpass(rng.standard_normal(len(t)), 1800), 6500) * np.exp(-t / 0.008)
    y += 0.5 * np.sin(2 * np.pi * 1300 * t) * np.exp(-t / 0.01)
    return normalize(y, -9)


# riser — нарастание: шум + восходящий тон
def riser(sec=1.6):
    n = int(SR * sec)
    t = np.arange(n) / SR
    u = t / sec
    noise = highpass(rng.standard_normal(n), 1200)
    noise = lowpass(noise, 800 + 7000 * u ** 2)
    f = 180 * (12 ** u)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    y = (noise * 0.8 + tone) * (u ** 2.2)
    y *= np.minimum(1, (sec - t) / 0.02)
    return normalize(reverb(y, 0.6, 0.15), -6)


if __name__ == '__main__':
    for name, fn in [
        ('impact', impact),
        ('type', type_key),
        ('riser', riser),
        ('shimmer', shimmer),
        ('whoosh', whoosh),
        ('sparkle', sparkle),
        ('draw', draw),
        ('tick', tick),
        ('pop', pop),
        ('drop', drop),
        ('click', click),
        ('chime', chime),
    ]:
        save(name, fn())
