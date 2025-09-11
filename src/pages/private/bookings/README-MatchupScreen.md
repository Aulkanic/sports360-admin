# Multi-Court Matchup Screen

## Overview
The Multi-Court Matchup Screen displays all courts from the hub by default and allows focusing on a specific court when the admin clicks "Play Screen" from the open-play-details page.

## Features

### Default View
- Shows all courts from the hub in a grid layout
- Each court displays its current status (In-Game, Open, Closed)
- Courts with active games show team information and player avatars
- Empty courts show "No Players" or "Court Closed" messages
- **Active court indicator** shows which court is currently focused

### Focused View
- When admin clicks "Play Screen" on a specific court, that court scales up to full view
- Other courts are hidden or dimmed
- Focused court shows larger player avatars and more detailed information
- "All Courts" button allows returning to the grid view
- **Active court status bar** displays the currently focused court name

### State Persistence
- **localStorage integration** saves the active court ID
- State persists across page refreshes and window updates
- When admin selects a different court, the UI updates automatically
- State is cleared when the matchup window is closed

### Court Status Indicators
- **Green dot**: In-Game (active match)
- **Blue dot**: Open (available for play)
- **Gray dot**: Closed (unavailable)

## Usage

### From Open-Play Details Page
1. Navigate to an open-play session
2. Go to the "Game Management" tab
3. Click "Play Screen" on any court with active players
4. The matchup screen opens with that court focused

### Navigation
- **Focus Court**: Click the maximize button on any court card
- **Show All Courts**: Click "All Courts" button in focused view
- **Fullscreen**: Click the fullscreen button
- **Back**: Click back button to return to previous page

## Technical Implementation

### Route
- URL: `/matchup-multi/:id`
- Component: `MatchupScreenMulti`

### Data Flow
1. Open-play-detail page collects all court data
2. Saves active court ID to localStorage
3. Passes data via `postMessage` to the matchup window
4. Matchup screen receives data and displays accordingly
5. Focused court ID determines which court to highlight
6. Updates are sent to existing window if already open
7. State persists in localStorage for continuity

### Key Components
- `MatchupScreenMulti`: Main component
- Court cards with responsive sizing
- Focus/unfocus functionality
- Real-time status updates

## Styling
- **True full-screen display** optimized for TV screens with 100% viewport utilization
- **Enhanced court background** with realistic court lines, service boxes, and additional markings
- **Complete orange borders** (top, bottom, left, right) for authentic court appearance
- **Responsive design** for different screen sizes (1-4 columns based on screen width)
- **Smooth transitions** between views with scale animations
- **Backdrop blur effects** for modern glass-morphism design
- **Gradient backgrounds** with subtle patterns and animated particles
- **Enhanced glow effects** for focused courts with ring highlights
- **Dramatic VS divider** with gradient background and animated glow effects
- **Large player profiles** (60x60 for focused, 20x20 for grid) with enhanced information
- **Centered player positioning** with absolute positioning for perfect alignment
- **High z-index layering** ensuring player profiles stay on top of all court elements
- **Animated elements** including pulsing indicators, bouncing VS text, and floating particles
- **Status badges** with color-coded indicators (Green=In-Game, Blue=Open, Gray=Closed)
- **Live indicators** with pulsing dots for active courts
- **Enhanced typography** with larger, bolder text for better readability
- **Professional court design** with service boxes and realistic court markings
