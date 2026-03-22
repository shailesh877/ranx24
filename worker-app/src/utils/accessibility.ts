/**
 * Accessibility utilities for React Native
 */

export interface AccessibilityProps {
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?:
    | 'none'
    | 'button'
    | 'link'
    | 'search'
    | 'image'
    | 'keyboardkey'
    | 'text'
    | 'adjustable'
    | 'imagebutton'
    | 'header'
    | 'summary'
    | 'alert'
    | 'checkbox'
    | 'combobox'
    | 'menu'
    | 'menubar'
    | 'menuitem'
    | 'progressbar'
    | 'radio'
    | 'radiogroup'
    | 'scrollbar'
    | 'spinbutton'
    | 'switch'
    | 'tab'
    | 'tablist'
    | 'timer'
    | 'toolbar';
    accessibilityState?: {
        disabled?: boolean;
        selected?: boolean;
        checked?: boolean | 'mixed';
        busy?: boolean;
        expanded?: boolean;
    };
    accessibilityValue?: {
        min?: number;
        max?: number;
        now?: number;
        text?: string;
    };
}

/**
 * Create accessibility props for buttons
 */
export function buttonA11y(label: string, hint?: string, disabled?: boolean): AccessibilityProps {
    return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityRole: 'button',
        accessibilityState: { disabled: disabled || false },
    };
}

/**
 * Create accessibility props for images
 */
export function imageA11y(description: string): AccessibilityProps {
    return {
        accessible: true,
        accessibilityLabel: description,
        accessibilityRole: 'image',
    };
}

/**
 * Create accessibility props for text inputs
 */
export function inputA11y(label: string, hint?: string, required?: boolean): AccessibilityProps {
    return {
        accessible: true,
        accessibilityLabel: label + (required ? ' (required)' : ''),
        accessibilityHint: hint,
        accessibilityRole: 'none', // Let TextInput handle its own role
    };
}

/**
 * Create accessibility props for headers
 */
export function headerA11y(text: string): AccessibilityProps {
    return {
        accessible: true,
        accessibilityLabel: text,
        accessibilityRole: 'header',
    };
}

/**
 * Create accessibility props for links
 */
export function linkA11y(label: string, hint?: string): AccessibilityProps {
    return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityHint: hint || 'Double tap to open',
        accessibilityRole: 'link',
    };
}

/**
 * Create accessibility props for checkboxes
 */
export function checkboxA11y(label: string, checked: boolean): AccessibilityProps {
    return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityRole: 'checkbox',
        accessibilityState: { checked },
    };
}

/**
 * Create accessibility props for switches
 */
export function switchA11y(label: string, value: boolean): AccessibilityProps {
    return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityRole: 'switch',
        accessibilityState: { checked: value },
    };
}

/**
 * Announce message to screen readers
 */
export function announceForAccessibility(message: string) {
    // This would use AccessibilityInfo.announceForAccessibility in actual implementation
    console.log('Accessibility announcement:', message);
}
