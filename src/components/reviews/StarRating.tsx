'use client';

import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import styles from './StarRating.module.scss';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
}

export default function StarRating({
    rating,
    maxRating = 5,
    size = 20,
    interactive = false,
    onChange,
    showValue = false,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (value: number) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={styles.starRating}>
            <div className={styles.stars}>
                {Array.from({ length: maxRating }, (_, i) => {
                    const value = i + 1;
                    const isFilled = value <= displayRating;
                    const isHalf = !isFilled && value - 0.5 <= displayRating;

                    return (
                        <button
                            key={i}
                            type="button"
                            className={`${styles.star} ${isFilled ? styles.filled : ''} ${isHalf ? styles.half : ''} ${interactive ? styles.interactive : ''}`}
                            onClick={() => handleClick(value)}
                            onMouseEnter={() => handleMouseEnter(value)}
                            onMouseLeave={handleMouseLeave}
                            disabled={!interactive}
                        >
                            <FiStar size={size} />
                        </button>
                    );
                })}
            </div>
            {showValue && rating > 0 && (
                <span className={styles.value}>{rating.toFixed(1)}</span>
            )}
        </div>
    );
}
