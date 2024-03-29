import React, { useEffect, useRef } from 'react';
import Identicon from 'identicon.js';

interface IdenticonAvatarProps {
    address: string;
    size: number;
    borderColor?: string; // 可选的边框颜色
    borderWidth?: number; // 可选的边框宽度
}

const IdenticonAvatar: React.FC<IdenticonAvatarProps> = ({ address, size, borderColor = '#3edfcf', borderWidth = 2 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const data = new Identicon(address, {
            size: size - 2 * borderWidth, // 调整头像大小以留出边框空间
            background: [255, 255, 255, 255], // 背景颜色，你可以根据需要进行更改
        }).toString();

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = new Image();

        img.onload = () => {
            if (ctx) {
                // 绘制背景边框
                ctx.beginPath();
                ctx.lineWidth = borderWidth;
                ctx.strokeStyle = borderColor;
                ctx.arc(size / 2, size / 2, size / 2 - borderWidth / 2, 0, Math.PI * 2);
                ctx.stroke();
                // 绘制头像
                ctx.save(); // 保存当前绘图状态
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, (size - 2 * borderWidth) / 2, 0, Math.PI * 2);
                ctx.clip(); // 使用当前路径作为裁剪区域
                ctx.drawImage(img, borderWidth, borderWidth, size - 2 * borderWidth, size - 2 * borderWidth);
                ctx.restore(); // 恢复之前保存的绘图状态
            }
        };

        img.src = 'data:image/png;base64,' + data;
    }, [address, size, borderColor, borderWidth]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ borderRadius: '50%', width: size, height: size }}
        />
    );
};

export default IdenticonAvatar;
