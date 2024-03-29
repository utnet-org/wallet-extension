import React, { useState, useRef, useEffect } from 'react';

const LongPressComponent = ({ onLongPress, children }) => {
    const [isPressed, setIsPressed] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleMouseDown = (e) => {
        e.stopPropagation();
        timeoutRef.current = setTimeout(() => {
            setIsPressed(true);
            if (onLongPress) {
                onLongPress();
            }
        }, 1000);
    };

    const handleMouseUp = () => {
        clearTimeout(timeoutRef.current);
        setIsPressed(false);
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                display: 'inline-block',
                position: 'relative',
                cursor: isPressed ? 'pointer' : 'default',
            }}
        >
            {React.cloneElement(children, {
                style: {
                    ...(isPressed ? { opacity: 0.7 } : {}),
                    ...children.props.style,
                },
            })}
        </div>
    );
};

export default LongPressComponent;