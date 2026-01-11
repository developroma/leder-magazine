'use client';

import { useState, useEffect } from 'react';
import styles from './PhoneInput.module.scss';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

export default function PhoneInput({
    value,
    onChange,
    placeholder = '50 123 45 67',
    required = false,
    error
}: PhoneInputProps) {
    const [localValue, setLocalValue] = useState('');

    // Initialize from value prop (strip +380 prefix if present)
    useEffect(() => {
        if (value) {
            let cleaned = value.replace(/\D/g, '');
            if (cleaned.startsWith('380')) {
                cleaned = cleaned.substring(3);
            }
            setLocalValue(formatPhone(cleaned));
        }
    }, []);

    const formatPhone = (digits: string): string => {
        // Format as: XX XXX XX XX
        const d = digits.substring(0, 9);
        if (d.length <= 2) return d;
        if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
        if (d.length <= 7) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
        return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '').substring(0, 9);
        const formatted = formatPhone(digits);
        setLocalValue(formatted);

        // Pass full number with +380 to parent
        if (digits.length > 0) {
            onChange(`+380${digits}`);
        } else {
            onChange('');
        }
    };

    return (
        <div className={`${styles.phoneInput} ${error ? styles.hasError : ''}`}>
            <div className={styles.prefix}>
                <span className={styles.flag}>🇺🇦</span>
                <span className={styles.code}>+380</span>
            </div>
            <input
                type="tel"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                className={styles.input}
            />
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
