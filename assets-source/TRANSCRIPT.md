# Nate Campbell — About Me video transcript

Source: <https://youtu.be/4flKcYR3ZYg> (2:15, AboutMeVideo+, Oct 2023)

This is where the site's copy comes from. Reconciled from two passes, because
neither alone is right:

- **YouTube auto-captions** — dropped a whole sentence ("180 mindset is a
  turnaround") and truncated the opening word.
- **whisper.cpp `base.en`** — caught both, but garbled "watching" → "like to"
  and "involved" → "a ball".

Where they disagree, the reading that makes sense in context wins. One word is
still unresolved and marked below.

The video has exactly **three spoken blocks**. Everything else is music — there
is no spoken intro; the first 30 seconds are the title card and score.

---

## 0:30 — origin

> Since I was a kid, seven years old, playing basketball. Picking up a ball,
> watching my older brothers. That's all I knew, that's all I've seen — was
> being active as a kid, and I never stopped. So I just figured out once I got
> older: how can I still be involved in health and wellness? So I decided to
> start training and getting into nutrition.

## 1:15 — the method

> 180 mindset is a turnaround. You're not thinking the way you used to think.
> We're changing your mindset and letting you know that you can do it.
> Discipline is important, the consistency is important. So if you're consistent
> in discipline here — which would be consistent with the workouts, but
> discipline in the nutrition area — then we're gonna get to the highest level.
> You're making a 180, you're turning it around, 'cause you're going from weak
> mind to a positive mind.

## 2:07 — sign-off

> My name is Nate Campbell. I'm the founder of 180 Peak Performance.

---

## Regenerating

```bash
.cache/yt-dlp --js-runtimes node -f "ba/b" -x --audio-format wav -o ".cache/audio.%(ext)s" <url>
ffmpeg -i .cache/audio.wav -ar 16000 -ac 1 -c:a pcm_s16le .cache/audio16k.wav
whisper-cli -m .cache/ggml-base.en.bin -f .cache/audio16k.wav --output-txt
```
