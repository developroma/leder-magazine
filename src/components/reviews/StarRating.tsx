'use client';

import { useState, useRef } from 'react';
import { FiStar } from 'react-icons/fi';
import styles from './StarRating.module.scss';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
    allowHalf?: boolean;
}

export default function StarRating({
    rating,
    maxRating = 5,
    size = 20,
    interactive = false,
    onChange,
    showValue = false,
    allowHalf = true,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (e: React.MouseEvent, starIndex: number) => {
        if (!interactive || !onChange) return;

        if (allowHalf) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const isHalf = x < rect.width / 2;
            const value = starIndex + (isHalf ? 0.5 : 1);
            onChange(value);
        } else {
            onChange(starIndex + 1);
        }
    };

    const handleMouseMove = (e: React.MouseEvent, starIndex: number) => {
        if (!interactive) return;

        if (allowHalf) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const isHalf = x < rect.width / 2;
            setHoverRating(starIndex + (isHalf ? 0.5 : 1));
        } else {
            setHoverRating(starIndex + 1);
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
                    const isFilled = i + 1 <= displayRating;
                    const isHalf = !isFilled && i + 0.5 <= displayRating;

                    return (
                        <button
                            key={i}
                            type="button"
                            className={`${styles.star} ${isFilled ? styles.filled : ''} ${isHalf ? styles.half : ''} ${interactive ? styles.interactive : ''}`}
                            onClick={(e) => handleClick(e, i)}
                            onMouseMove={(e) => handleMouseMove(e, i)}
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
