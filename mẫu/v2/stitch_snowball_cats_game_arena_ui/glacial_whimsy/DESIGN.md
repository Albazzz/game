---
name: Glacial Whimsy
colors:
  surface: '#f5fafd'
  surface-dim: '#d6dbde'
  surface-bright: '#f5fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4f7'
  surface-container: '#e9eff2'
  surface-container-high: '#e4e9ec'
  surface-container-highest: '#dee3e6'
  on-surface: '#171c1f'
  on-surface-variant: '#414752'
  inverse-surface: '#2c3134'
  inverse-on-surface: '#ecf1f4'
  outline: '#717783'
  outline-variant: '#c1c7d4'
  surface-tint: '#0060ac'
  primary: '#005da7'
  on-primary: '#ffffff'
  primary-container: '#1976cd'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a4c9ff'
  secondary: '#8c5000'
  on-secondary: '#ffffff'
  secondary-container: '#fe9c2d'
  on-secondary-container: '#683a00'
  tertiary: '#006389'
  on-tertiary: '#ffffff'
  tertiary-container: '#007dac'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#ffb874'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6a3b00'
  tertiary-fixed: '#c6e7ff'
  tertiary-fixed-dim: '#82cfff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6b'
  background: '#f5fafd'
  on-background: '#171c1f'
  surface-variant: '#dee3e6'
typography:
  display-xl:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  display-lg:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Anton
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1'
    letterSpacing: 0.05em
  display-xl-mobile:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  panel-padding: 24px
---

## Brand & Style
The design system for this casual game arena centers on a "Cheerful Winter Anime" aesthetic. It balances the playful energy of high-action gaming with the soft, inviting atmosphere of a Japanese winter festival. 

The style utilizes **Glassmorphism** for the UI layer—specifically frosted, semi-transparent panels—layered over vibrant, cel-shaded 2D environments. Key visual identifiers include thick white outlines on primary elements to ensure they pop against snowy backgrounds, and a constant presence of "snow sparkle" particles that add depth and life to static screens. The emotional goal is to feel "chilly yet cozy," combining high-performance game HUD clarity with the approachability of a premium mobile title.

## Colors
The palette is built on a foundation of "Snow" and "Ice Blue" to establish the winter theme, with "Deep Navy" providing the necessary contrast for text and structural borders. 

- **Primary (Royal Blue):** Used for core navigation and active states.
- **Secondary (Warm Orange):** Reserved for "Play" buttons and high-priority calls to action, creating a heat-map contrast against the cool background.
- **Accents:** Gold is used exclusively for rewards and currency, while Coral Red signifies danger or health depletion. Mint Green is utilized for success states and leveling up.
- **Transparency:** Background panels should maintain a variable opacity between 85% and 94% to allow game world colors to bleed through softly.

## Typography
The typography system uses a dual-font approach to balance character and readability.

- **Display & Numbers:** The condensed, bold nature of **Anton** is used for score counters, timers, and "Level Up" announcements. It provides the "Game Arena" impact required for high-energy moments.
- **Body & UI Labels:** **Noto Sans** (with JP support) provides a clean, neutral balance. It ensures that complex game instructions and settings are highly legible even at smaller sizes.
- **Visual Treatment:** All Anton headers should feature a subtle 2px Deep Navy drop shadow or a thin white stroke when placed over dark backgrounds to maintain the "anime HUD" feel.

## Layout & Spacing
This design system utilizes a **Fluid Grid** model designed for landscape-oriented gaming devices. 

- **HUD Safety:** Maintain a 40px safe zone (margin-desktop) from all edges to avoid screen curvature or hardware notches.
- **Spacing Rhythm:** Based on an 8px base unit. UI panels typically use 24px internal padding to provide a "breathable" and high-end feel.
- **Reflow:** On mobile, secondary UI elements (like friend lists or settings) collapse into full-screen overlays, while primary HUD elements (health bars, timers) scale down by 20% to maximize the playable area.

## Elevation & Depth
Depth is achieved through **Glassmorphism** and layering rather than traditional shadows.

- **Surface Layers:** The base layer is the game world. Above this sits the Glassy Panel (85-94% opacity). 
- **Backdrop Blur:** All panels must apply a 15-20px backdrop-blur to ensure text remains legible against dynamic game backgrounds.
- **Outlines:** Instead of shadows, use "Thick White Borders" (2-3px) to define the silhouette of panels and buttons. This mimics the cel-shaded look of anime characters.
- **Particles:** Floating snowflake particles should exist in a "mid-layer" between the game world and the UI, occasionally drifting *over* the edges of the UI panels to integrate the HUD into the environment.

## Shapes
The shape language is extremely soft and approachable. 

- **Panels:** Use a consistent 24px corner radius for all main containers.
- **Interactive Elements:** Buttons and input fields should feel "bouncy," utilizing the same 20-28px radius range. 
- **Icons:** All icons should be encased in circular or heavily rounded square containers. 
- **Motifs:** Incorporate "Cat Paw" silhouettes into the corner of panels or as the "handle" for sliders. Snowflake shapes serve as bullet points or loading indicators.

## Components
- **Primary Buttons:** Features a vibrant "Warm Orange" to "Gold" vertical gradient. It must have a 3px white bottom-heavy border to create a "3D pressed" look without using shadows.
- **Secondary Buttons:** Blue-white aesthetic. Uses "Sky Blue" background with "Snow White" text and a 2px white border.
- **Glassy Panels:** The core container. 90% opacity "Snow White" fill with a 20px blur. 24px corner radius.
- **Chips / Badges:** Small pill-shaped containers in "Mint Green" (for levels) or "Deep Navy" (for categories).
- **Input Fields:** Semi-transparent "Deep Navy" (20% opacity) with a "Snow White" 2px border.
- **Progress Bars:** "Ice Blue" background track with a "Royal Blue" fill. The fill head should be capped with a small "Cat Paw" icon.
- **Cards:** Used for character selection; includes a soft cel-shaded character portrait that "breaks" the top border of the card for a 3D effect.