/**
 * Color system following Apple's Human Interface Guidelines
 * - Uses semantic colors for clear communication
 * - Maintains accessible contrast ratios
 * - Creates visual hierarchy through intentional color usage
 */

const primary = {
  // Vibrant cyan that pops but isn't harsh
  light: '#00C6E0',  
  dark: '#00C6E0',   
};

const secondary = {
  // Energetic red that commands attention
  light: '#FF3B30',  
  dark: '#FF453A',   
};

export const Colors = {
  light: {
    // Core interface colors
    text: '#000000',           // Pure black for maximum contrast
    textSecondary: '#666666',  // Softer gray for secondary text
    textTertiary: '#999999',   // Subtle gray for tertiary information
    background: '#FFFFFF',     // Clean white background
    backgroundSecondary: '#F5F7FA', // Subtle off-white for cards/sections
    tint: primary.light,      

    // Interactive elements
    tabIconDefault: '#8E8E93',    // SF Symbols default gray
    tabIconSelected: primary.light,
    button: primary.light,
    buttonText: '#FFFFFF',
    
    // Status colors (following SF Symbols colors)
    success: '#34C759',        // Green that feels natural and positive
    warning: '#FF9500',        // Orange that draws attention without alarm
    error: secondary.light,    // Red that demands attention
    
    // Structural elements
    card: '#FFFFFF',           // Elevated surface
    border: '#E5E5EA',         // Subtle borders for definition
    separator: '#C6C6C8',      // Slightly stronger than border for dividers
    overlay: 'rgba(0,0,0,0.4)', // Modal/sheet overlays
  },
  dark: {
    // Core interface colors - true black theme
    text: '#FFFFFF',           // Pure white for main text
    textSecondary: '#EBEBF5',  // Slightly dimmed for secondary text, 60% white
    textTertiary: '#EBEBF599', // More dimmed for tertiary text, 38% white
    background: '#000000',     // True black background
    backgroundSecondary: '#1C1C1E', // Slightly lifted surface
    tint: primary.dark,

    // Interactive elements
    tabIconDefault: '#98989D',    // Muted but visible
    tabIconSelected: primary.dark,
    button: primary.dark,
    buttonText: '#000000',        // Black text on bright buttons for contrast

    // Status colors (optimized for dark mode)
    success: '#30D158',        // Brighter green for dark mode
    warning: '#FFD60A',        // Warmer orange for dark mode
    error: secondary.dark,     // Brighter red for dark mode

    // Structural elements
    card: '#1C1C1E',          // Slightly elevated surface
    border: '#38383A',        // Subtle definition
    separator: '#545458',     // Stronger definition between sections
    overlay: 'rgba(0,0,0,0.6)', // Darker overlay for better contrast
  },
  // Semantic colors that maintain their meaning across modes
  semantic: {
    // Activity colors
    strain: '#FF453A',         // High intensity/strain (red)
    recovery: '#30D158',       // Recovery/rest (green)
    sleep: '#BF5AF2',          // Sleep/restoration (purple)
    hydration: '#00C6E0',      // Hydration/water (cyan)
    
    // Chart/data colors (colorblind-friendly)
    chart: [
      '#00C6E0',  // Cyan (primary)
      '#30D158',  // Green
      '#FF9F0A',  // Orange
      '#BF5AF2',  // Purple
      '#FF453A',  // Red
      '#64D2FF',  // Light blue
    ],
    
    // Gradients for visual richness
    gradient: {
      primary: ['#00C6E0', '#30D158'],     // Cyan to green
      energy: ['#FF453A', '#FF9F0A'],      // Red to orange
      sleep: ['#BF5AF2', '#64D2FF'],       // Purple to blue
    },
    
    // Special states
    focus: '#007AFF',          // Classic iOS blue for focused states
    inactive: '#3A3A3C',       // Truly inactive elements
    disabled: '#999999',       // Disabled interactive elements
  },
};
