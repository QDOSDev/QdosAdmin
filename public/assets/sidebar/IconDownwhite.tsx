import React, { FC } from 'react';

interface HomeUpProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const Down: FC<HomeUpProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
            <path d="M13.5 11.75L9 7.25L4.5 11.75" fill="#A1AEC0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export default Down;
