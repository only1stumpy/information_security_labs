# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 application for information security lab work (Variant 10) implementing classical and modern cryptographic algorithms with an interactive UI. The application demonstrates encryption/decryption methods including permutation ciphers, Caesar cipher, Vigenère cipher, slogan cipher, RSA, and SHA-256.

## Tech Stack

- **Framework**: Next.js 15.5.5 with React 19.1.0
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Linting/Formatting**: Biome 2.2.0 (NOT ESLint/Prettier)
- **3D Graphics**: Three.js with @react-three/fiber (for Silk background shader)
- **Animation**: motion (not framer-motion)
- **TypeScript**: Strict mode enabled
- **Font**: Montserrat Alternates (Cyrillic + Latin)

## Development Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run Biome linting (check only)
npm run format       # Format code with Biome
```

## Key Architecture Patterns

### 1. Encryption Logic Structure

All cryptographic implementations are in `src/app/api/encrypt/route.ts`:

- **Encrypt()** function routes to specific algorithm implementations
- Each cipher returns formatted strings with encrypted/decrypted results
- RSA generates random prime keys on each request (p, q range: 100-1000)
- Vigenère key: "решение", Slogan key: "Степанов"

### 2. API Architecture

Single POST endpoint: `/api/encrypt`
- Request: `{ text: string, method: string }`
- Response: `{ result: string }`
- Methods: "permutation", "caesar", "visiner", "lozung", "RSA", "SHA-256"

### 3. Component Architecture

**Layout Structure** (`src/app/layout.tsx`):
- Fixed background: Silk shader component (z-index: 0)
- Content wrapper: relative positioning (z-index: 10)
- Font loading via next/font/google with Cyrillic support

**Main Page** (`src/app/page.tsx`):
- Client component with controlled form state
- Pre-filled test data via `fillInput()` method
- Result display uses DecryptedText animation component

**Silk Component** (`src/components/Silk/Silk.tsx`):
- WebGL shader-based animated background using Three.js
- Custom vertex/fragment shaders for silk-like wave pattern
- Props: speed, scale, color (hex), noiseIntensity, rotation

**DecryptedText** (`src/components/DecryptedText.tsx`):
- Text reveal animation with character scrambling effect
- Supports sequential/random reveal, directional reveal (start/end/center)
- Animation triggers: "view" (intersection observer), "hover", "both"
- Key prop: `useOriginalCharsOnly` - shuffles only chars from original text

### 4. Cipher Implementations

**Permutation Cipher**:
- Fixed key: [3, 5, 1, 4, 2]
- Pads text with underscores to block size

**Caesar Cipher**:
- Returns all 32 possible shifts (Russian alphabet)
- Cyrillic alphabet: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"

**Vigenère Cipher**:
- Modified alphabet (no Ё, Ъ, Ю, Я replaced): "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ "
- Includes space character in alphabet

**Slogan Cipher**:
- Substitution cipher based on keyword
- Creates shifted alphabet starting with keyword characters

**RSA**:
- Wraps Vigenère cipher with RSA key encryption
- Converts Vigenère key to numeric form for RSA encryption
- Returns open/secret keys, encrypted/decrypted key, and encrypted/decrypted text

## Path Aliases

- `@/*` → `./src/*`

## Biome Configuration

Located in `biome.json`:
- 2-space indentation
- Recommended rules for React and Next.js
- Disabled rule: `suspicious/noUnknownAtRules` for Tailwind CSS
- Auto-organize imports enabled
- VCS integration with git

## Color Scheme

Primary colors used throughout:
- Background: `#000000` (black)
- Primary accent: `#fca311` (orange)
- Border/text: `#e5e5e5` (light gray)
- Silk shader: `#14213D` (dark blue)

## Important Notes

- Use Biome for linting/formatting, NOT ESLint or Prettier
- All crypto logic is server-side (API route), no client-side encryption
- Montserrat Alternates font requires Cyrillic subset
- DecryptedText component has specific timing props for smooth animations
- RSA uses modular exponentiation with small primes (educational purpose only, not cryptographically secure)
