import React, { ReactNode } from 'react';
import { Theme, ThemeName } from './types';
interface ThemeContextType {
    theme: Theme;
    themeName: ThemeName;
    setTheme: (themeName: ThemeName) => void;
    availableThemes: ThemeName[];
}
interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: ThemeName;
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export declare const useTheme: () => ThemeContextType;
export declare const useThemeStyles: () => {
    button: {
        primary: {
            backgroundColor: string;
            color: string;
            border: string;
            boxShadow: string;
            borderRadius: string;
            transition: string;
            fontFamily: string;
            '&:hover': {
                backgroundColor: string;
                boxShadow: string;
            };
            '&:active': {
                backgroundColor: string;
                transform: string;
            };
            '&:disabled': {
                backgroundColor: string;
                color: string;
                cursor: string;
            };
        };
        secondary: {
            backgroundColor: string;
            color: string;
            border: string;
            boxShadow: string;
            borderRadius: string;
            transition: string;
            fontFamily: string;
            '&:hover': {
                backgroundColor: string;
                boxShadow: string;
            };
            '&:active': {
                backgroundColor: string;
                transform: string;
            };
            '&:disabled': {
                backgroundColor: string;
                color: string;
                cursor: string;
            };
        };
        outline: {
            backgroundColor: string;
            color: string;
            border: string;
            borderRadius: string;
            transition: string;
            fontFamily: string;
            '&:hover': {
                backgroundColor: string;
                boxShadow: string;
            };
            '&:active': {
                backgroundColor: string;
                transform: string;
            };
            '&:disabled': {
                borderColor: string;
                color: string;
                cursor: string;
            };
        };
        ghost: {
            backgroundColor: string;
            color: string;
            border: string;
            borderRadius: string;
            transition: string;
            fontFamily: string;
            '&:hover': {
                backgroundColor: string;
            };
            '&:active': {
                backgroundColor: string;
            };
            '&:disabled': {
                color: string;
                cursor: string;
            };
        };
    };
    card: {
        backgroundColor: string;
        border: string;
        borderRadius: string;
        boxShadow: string;
        transition: string;
        fontFamily: string;
        '&:hover': {
            boxShadow: string;
        };
    };
    input: {
        backgroundColor: string;
        color: string;
        border: string;
        borderRadius: string;
        boxShadow: string;
        transition: string;
        fontFamily: string;
        '&:focus': {
            outline: string;
            borderColor: string;
            boxShadow: string;
        };
        '&:disabled': {
            backgroundColor: string;
            color: string;
            cursor: string;
        };
        '&::placeholder': {
            color: string;
        };
    };
};
export {};
//# sourceMappingURL=ThemeProvider.d.ts.map