'use client';

import { motion } from "framer-motion";

interface IProps {
    checked: boolean,
    onChangeValue: () => void,
    rounded?: boolean
}

export const AnimatedCheckbox = (props: IProps) => {
    return (
        <motion.div
            onClick={props.onChangeValue}
            className={`min-w-9 min-h-9 w-max h-max active:scale-90 cursor-pointer flex justify-center transition-all items-center border ${props.rounded ? 'rounded-full' : 'rounded-xl'} ${props.checked ? 'bg-blue-500 border-transparent' : 'bg-blue-100 border-blue-500'}`}
        >
            {props.checked && (
                <motion.svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.path
                        d="M7 14L10 17L17 9" // Галочка остается уменьшенной
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{pathLength: 0}}
                        animate={{pathLength: 1}}
                        transition={{duration: 0.2}}
                    />
                </motion.svg>
            )}
        </motion.div>
    );
};
