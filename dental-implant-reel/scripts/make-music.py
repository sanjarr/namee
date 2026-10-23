"""Синтез фоновой музыки для DentalImplantReel (tech-motion версия, 60 с).

Электронный грув 120 BPM в Fm: бочка, хэты, клэп, бас, арпеджио, пад.
Структура подогнана под сцены ролика (границы — в SECTIONS, секунды):
вступление → ритм → «последствия» (добавляется арпеджио) → пауза перед «25%»
→ драйв на «решении» → приглушённое «было» и раскрытие на «стало» → CTA.

Всё генерируется кодом, лицензия не нужна. Запуск из корня проекта:

    python3 scripts/make-music.py

Результат: public/music.mp3 (нужны numpy, scipy, ffmpeg).
"""

import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM  # 0,5 с
DUR = 60.0
N = int(SR * DUR)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'music.mp3')
rng = np.random.default_rng(32)


# ---------- утилиты ----------
def sos(kind, fc, order=2):
    return butter(order, fc, kind, fs=SR, output='sos')


def lp(x, fc, order=2):
    return sosfilt(sos('low', fc, order), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(sos('high', fc, order), x, axis=0)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x, axis=0)


def mtof(m):
    return 440 * 2 ** ((np.asarray(m, float) - 69) / 12)


def saw(freq, n, detune_cents=0.0):
    f = freq * 2 ** (detune_cents / 1200)
    ph = (np.cumsum(np.full(n, f / SR)) + rng.random()) % 1
    return 2 * ph - 1


def put(dst, src, t):
    i = int(t * SR)
    if i >= len(dst):
        return
    e = min(len(dst), i + len(src))
    dst[i:e] += src[: e - i]


def on(t, ranges):
    return any(a - 1e-6 <= t < b - 1e-6 for a, b in ranges)


def reverb(x, sec=1.6, mix=0.3, damp=5000):
    n = int(SR * sec)
    ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n) / SR / (sec / 5))[:, None]
    ir = lp(ir, damp, 1)
    ir /= np.sqrt((ir ** 2).sum(0))
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)
    return x * (1 - mix) + wet * mix


# ---------- структура ----------
# Границы сцен (с): hook 0–5, doubt 5–12, conseq 12–23, stat 23–30,
# solution 30–40, was 40–46, benefits 46–52, cta 52–60
KICK = [(2.5, 23.0), (26.5, 51.5), (52.5, 57.0)]
HAT = [(5.0, 23.0), (26.5, 51.5), (52.5, 57.0)]
HAT16 = [(30.0, 40.0), (46.0, 51.5), (52.5, 57.0), (21.0, 23.0)]
CLAP = [(12.0, 23.0), (27.0, 51.5), (52.5, 57.0)]
BASS = [(5.0, 23.0), (26.5, 51.5), (52.5, 57.0)]
BASS_SPARSE = [(5.0, 12.0)]
ARP = [(12.0, 23.0), (30.0, 51.5), (52.5, 57.0)]
ARP16 = [(30.0, 40.0), (46.0, 51.5), (54.5, 57.0)]
RISERS = [(3.4, 5.0, 1.0), (22.0, 23.0, 0.7), (23.5, 26.5, 1.0), (28.8, 30.0, 0.8), (50.6, 52.5, 1.0)]
MUFFLE = (40.0, 42.5)  # «было» приглушено, на «стало» раскрывается
END_CARD = 57.0  # финальная карточка: ритм уходит, остаётся пад и колокольчики

CHORDS = [[65, 68, 72, 77], [61, 65, 68, 73], [60, 63, 68, 72], [63, 67, 70, 75]]  # Fm Db Ab Eb
ROOTS = [41, 37, 44, 39]


# ---------- инструменты ----------
def kick():
    t = np.arange(int(SR * 0.4)) / SR
    f = 46 + 110 * np.exp(-t / 0.028)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.14)
    y += lp(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.003) * 0.35
    return y


def hat(open_=False):
    n = int(SR * (0.22 if open_ else 0.06))
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500) * np.exp(-t / (0.07 if open_ else 0.014))


def clap():
    n = int(SR * 0.3)
    t = np.arange(n) / SR
    env = np.exp(-t / 0.075)
    for d in (0.0, 0.011, 0.022):
        env += 0.8 * np.exp(-np.clip(t - d, 0, None) / 0.01) * (t >= d)
    return bp(rng.standard_normal(n), 1100, 3800) * env * 0.6


def bass_note(midi, dur):
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = float(mtof(midi))
    y = lp(saw(f, n), 260, 2) * 0.7 + np.sin(2 * np.pi * f * t) * 0.6
    env = np.minimum(1, t / 0.004) * np.exp(-t / (dur * 0.7))
    return y * env


def pluck(midi, dur=0.5):
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = float(mtof(midi))
    y = saw(f, n, -7) + saw(f, n, +7)
    y = lp(y, 3200, 2)
    return y * np.minimum(1, t / 0.002) * np.exp(-t / 0.13) * 0.5


def pad_chord(midis, dur):
    n = int(SR * dur)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for k, m in enumerate(midis):
        f = float(mtof(m - 12 if k == 0 else m))
        out[:, 0] += saw(f, n, -9) * 0.5
        out[:, 1] += saw(f, n, +9) * 0.5
    out = lp(out, 1300, 2)
    env = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.5)
    return out * env[:, None] * 0.16


def bell(midi, dur=2.2):
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = float(mtof(midi))
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (dur / 3 / r ** 0.4)) for r, a in ((1, 1), (2, 0.4), (3.01, 0.18), (4.2, 0.08)))
    return y * np.minimum(1, t / 0.004) * 0.3


def riser(dur, level):
    n = int(SR * dur)
    t = np.arange(n) / SR
    u = t / dur
    noise = hp(rng.standard_normal(n), 1500)
    # «открывающийся» фильтр: плавно переходим от тёмного шума к яркому
    noise = lp(noise, 2200) * (1 - u) + lp(noise, 9500) * u
    tone = np.sin(2 * np.pi * np.cumsum(220 * 8 ** u) / SR) * 0.25
    return (noise * 0.5 + tone) * (u ** 2) * level * 0.7


# ---------- сборка ----------
kick_t, drums = [], np.zeros(N)
hats = np.zeros((N, 2))
bass = np.zeros(N)
arp = np.zeros((N, 2))
pad = np.zeros((N, 2))
fx = np.zeros((N, 2))

K, C = kick(), clap()
beats = int(DUR / BEAT)
for b in range(beats):
    t = b * BEAT
    if on(t, KICK):
        put(drums, K, t)
        kick_t.append(t)
    if b % 2 == 1 and on(t, CLAP):
        put(drums, C * 0.8, t)

# хэты: 8-е на «и», 16-е в плотных местах
for s in range(int(DUR / (BEAT / 4))):
    t = s * BEAT / 4
    step = s % 4
    sixteen = on(t, HAT16)
    if step == 2 and on(t, HAT):  # «и»
        put(hats[:, 0], hat(open_=True) * 0.18, t)
        put(hats[:, 1], hat(open_=True) * 0.14, t)
    elif sixteen and step in (1, 3):
        v = 0.07 if step == 1 else 0.05
        put(hats[:, 0], hat() * v, t)
        put(hats[:, 1], hat() * v * 1.2, t)
    elif step == 0 and on(t, HAT) and not on(t, KICK):
        put(hats[:, 0], hat() * 0.06, t)

# бас: 8-е со «синкопой»
for e in range(int(DUR / (BEAT / 2))):
    t = e * BEAT / 2
    if not on(t, BASS):
        continue
    bar = int(t // (BEAT * 4))
    root = ROOTS[bar % 4]
    step = e % 8
    if on(t, BASS_SPARSE):
        if step in (0, 4):
            put(bass, bass_note(root, 0.9) * 0.9, t)
        continue
    if step in (0, 1, 3, 4, 6):
        midi = root + (12 if step in (3, 6) else 0)
        put(bass, bass_note(midi, 0.28 if step != 0 else 0.45) * 0.8, t)

# арпеджио: 8-е (спокойно) или 16-е (напористо) + эхо
pattern = [0, 2, 1, 3, 2, 3, 1, 2]
arp_dry = np.zeros((N, 2))
for s in range(int(DUR / (BEAT / 4))):
    t = s * BEAT / 4
    if not on(t, ARP):
        continue
    sixteen = on(t, ARP16)
    if not sixteen and s % 2 == 1:
        continue
    bar = int(t // (BEAT * 4))
    chord = CHORDS[bar % 4]
    idx = pattern[(s if sixteen else s // 2) % 8]
    midi = chord[idx] + (12 if (sixteen and s % 8 in (6, 7)) else 0)
    amp = 0.55 if sixteen else 0.4
    p = pluck(midi) * amp
    pan = 0.35 + 0.3 * ((s % 8) / 7)
    put(arp_dry[:, 0], p * (1 - pan), t)
    put(arp_dry[:, 1], p * pan, t)
# пинг-понг эхо (пунктирная 8-я)
arp = arp_dry.copy()
d1 = int(SR * BEAT * 0.75)
arp[d1:, 1] += arp_dry[:-d1, 0] * 0.35
arp[2 * d1:, 0] += arp_dry[: -2 * d1, 1] * 0.2

# пад: по аккорду на такт; в финале — длиннее и ярче
for bar in range(int(DUR / (BEAT * 4))):
    t = bar * BEAT * 4
    chord = CHORDS[bar % 4]
    put(pad, pad_chord(chord, BEAT * 4 + 0.6), t - 0.1 if t > 0 else t)

# нарастания
for a, b, lvl in RISERS:
    r = riser(b - a, lvl)
    put(fx[:, 0], r * 0.8, a)
    put(fx[:, 1], r, a)

# финальная карточка: колокольчики на Fm add9 и длинный хвост
for k, (m, dt) in enumerate([(77, 0.0), (84, 0.25), (80, 0.5), (79, 0.75), (72, 1.3)]):
    b = bell(m) * 0.9
    put(fx[:, 0], b * 0.8, END_CARD + 0.6 + dt)
    put(fx[:, 1], b, END_CARD + 0.6 + dt)

# сайдчейн от бочки
duck = np.ones(N)
for t in kick_t:
    i = int(t * SR)
    L = int(SR * 0.28)
    seg = np.arange(min(L, N - i)) / SR
    duck[i : i + len(seg)] *= 1 - 0.6 * np.exp(-seg / 0.1)

# уровни секций: пад тише во время ритма, громче на паузах и в финале
tt = np.arange(N) / SR
pad_gain = (
    0.55
    + 0.5 * ((tt > 23.0) & (tt < 26.5))
    + 0.45 * (tt >= END_CARD)
    + 0.1 * (tt < 5.0)
)
pad_gain = lp(pad_gain, 3, 1)
# в финале ритм уходит, пад сохраняется на весь хвост
duck_pad = np.where(tt < END_CARD, duck, 1.0)

mix = np.zeros((N, 2))
mix += drums[:, None] * 0.95
mix += hats
mix += (bass * duck)[:, None] * 0.9
mix += arp * duck[:, None] * 0.6
mix += pad * (pad_gain * duck_pad)[:, None]
mix += fx

# «было» приглушено фильтром, на «стало» раскрывается
a, b = MUFFLE
w = np.clip((tt - (a - 0.1)) / 0.1, 0, 1) * np.clip(((b + 0.25) - tt) / 0.25, 0, 1)
low = lp(mix, 650, 2)
mix = mix * (1 - w[:, None]) + low * w[:, None]

# общая реверберация (немного воздуха) и мастер
mix = reverb(mix, 1.8, 0.16)
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
fade_in = np.clip(tt / 0.05, 0, 1)
fade_out = np.clip((DUR - tt) / 2.0, 0, 1) ** 1.5
mix *= (fade_in * fade_out)[:, None]
mix /= np.abs(mix).max()
mix *= 10 ** (-3 / 20)

pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2')
with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
    path = tmp.name
with wave.open(path, 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(pcm.tobytes())
# loudnorm: около −17 LUFS, как у референса; пик не выше −2 дБ
subprocess.run(
    ['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-af', 'loudnorm=I=-17:TP=-2:LRA=9',
     '-ar', '44100', '-codec:a', 'libmp3lame', '-q:a', '2', OUT],
    check=True,
)
os.remove(path)
print('ok', OUT)
