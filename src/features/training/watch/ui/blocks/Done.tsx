import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/shared/shadcn/ui/button";
import { confettiImg, cupImg } from "@/features/training/watch/ui/assets";
import { watchCorrectAnswersCount, watchTrainingMusicPlaying } from "@/features/training/watch/model";
import { useAtomValue } from "jotai";
import { useSetAtom } from "jotai/index";
import { useEffect } from "react";
import { WatchTrainingTemplate } from "../templates";
import { IWatchTrainingBlockProps } from "./types";

const Fire = () => {
    return (
        <svg className='absolute -top-[clamp(4px,1dvh,20px)] -right-[clamp(4px,1dvh,20px)] w-[clamp(2px,3.5dvh,32px)] h-[clamp(2px,3.5dvh,32px)]' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
            <path
                d="M6.33261 9.79583C6.13876 11.4173 6.00273 14.2868 7.22362 15.5082C7.22362 15.5082 6.64888 12.356 11.8011 8.40106C13.8756 6.80896 14.3551 4.64348 13.6307 3.01937C13.2192 2.0993 12.4677 1.33925 11.8147 0.808549C11.4338 0.496528 11.7263 -0.0181739 12.2806 0.000494051C15.6338 0.117835 21.0683 0.848551 23.3774 5.39286C24.3909 7.38766 24.4657 9.44914 23.9828 11.5453C23.6767 12.884 22.5885 15.8602 25.071 16.2256C26.8429 16.4869 27.6999 15.3829 28.0841 14.5882C28.244 14.2575 28.7983 14.1748 29.0976 14.4388C32.0903 17.1083 32.3454 20.2525 31.7264 22.9594C30.5293 28.1917 23.7719 32 17.0587 32C8.67236 32 1.99658 28.2371 0.265574 21.4259C-0.431591 18.6764 -0.0779063 13.2361 5.32937 9.3958C5.73067 9.10778 6.38702 9.3638 6.33261 9.79583Z"
                fill="url(#paint0_radial_1286_1177)"/>
            <path
                d="M19.6138 14.9966C16.7704 11.7973 18.0435 8.14681 18.7411 6.69208C18.8349 6.50067 18.5847 6.32019 18.3876 6.43777C17.1645 7.16514 14.6589 8.87691 13.4922 11.286C11.9125 14.5427 12.0251 16.1369 12.9604 18.0838C13.5235 19.2569 12.8697 19.5057 12.5412 19.5495C12.2222 19.5932 11.9281 19.4073 11.6935 19.2132C11.0186 18.6467 10.5377 17.9271 10.3047 17.135C10.2546 16.9654 10.0013 16.9189 9.88552 17.0584C9.00966 18.1166 8.5561 19.8147 8.5342 21.0152C8.46538 24.7258 11.9719 27.7337 16.2136 27.7337C21.5594 27.7337 25.4539 22.5656 22.3821 18.2452C21.4906 16.9873 20.6523 16.1642 19.6138 14.9966Z"
                fill="url(#paint1_radial_1286_1177)"/>
            <defs>
                <radialGradient id="paint0_radial_1286_1177" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
                                gradientTransform="translate(15.3977 32.0829) rotate(-179.805) scale(24.0054 30.8876)">
                    <stop offset="0.314" stopColor="#FF9800"/>
                    <stop offset="0.662" stopColor="#FF6D00"/>
                    <stop offset="0.972" stopColor="#F44336"/>
                </radialGradient>
                <radialGradient id="paint1_radial_1286_1177" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
                                gradientTransform="translate(16.5076 8.60849) rotate(90.662) scale(20.196 17.3863)">
                    <stop offset="0.214" stopColor="#FFF176"/>
                    <stop offset="0.328" stopColor="#FFF27D"/>
                    <stop offset="0.487" stopColor="#FFF48F"/>
                    <stop offset="0.672" stopColor="#FFF7AD"/>
                    <stop offset="0.793" stopColor="#FFF9C4"/>
                    <stop offset="0.822" stopColor="#FFF8BD" stopOpacity="0.804"/>
                    <stop offset="0.863" stopColor="#FFF6AB" stopOpacity="0.529"/>
                    <stop offset="0.91" stopColor="#FFF38D" stopOpacity="0.209"/>
                    <stop offset="0.941" stopColor="#FFF176" stopOpacity="0"/>
                </radialGradient>
            </defs>
        </svg>
    )
}

const Star = () => {
    return (
        <svg className='absolute -top-[clamp(4px,2.5dvh,24px)] -right-[clamp(4px,2.5dvh,24px)] w-[clamp(2px,5dvh,52px)] h-[clamp(2px,5.5dvh,52px)]' xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49 49" fill="none">
            <g opacity="0.5">
                <path
                    d="M43.454 16.8964L31.3045 15.1307L25.8733 4.12003C25.725 3.81856 25.481 3.57452 25.1795 3.42618C24.4234 3.05294 23.5047 3.36397 23.1267 4.12003L17.6955 15.1307L5.546 16.8964C5.21104 16.9442 4.90479 17.1022 4.67032 17.3414C4.38685 17.6328 4.23065 18.0247 4.23604 18.4312C4.24142 18.8377 4.40795 19.2254 4.69903 19.5091L13.4894 28.0793L11.4126 40.181C11.3639 40.4625 11.3951 40.752 11.5025 41.0167C11.61 41.2814 11.7895 41.5107 12.0206 41.6786C12.2518 41.8465 12.5254 41.9463 12.8103 41.9666C13.0953 41.9869 13.3803 41.927 13.6329 41.7936L24.5 36.0801L35.3671 41.7936C35.6638 41.9515 36.0083 42.0041 36.3385 41.9467C37.1711 41.8031 37.731 41.0136 37.5874 40.181L35.5107 28.0793L44.301 19.5091C44.5402 19.2746 44.6982 18.9684 44.746 18.6334C44.8752 17.796 44.2914 17.0208 43.454 16.8964V16.8964Z"
                    fill="#F1D900"/>
            </g>
            <path
                d="M31.9256 25.4139L22.9994 24.1166L19.0092 16.0272C18.9002 15.8057 18.7209 15.6264 18.4994 15.5174C17.944 15.2432 17.269 15.4717 16.9912 16.0272L13.001 24.1166L4.07483 25.4139C3.82873 25.449 3.60373 25.5651 3.43147 25.7408C3.22321 25.9549 3.10845 26.2429 3.1124 26.5415C3.11636 26.8401 3.23871 27.125 3.45256 27.3334L9.91077 33.6299L8.38498 42.5209C8.3492 42.7277 8.37209 42.9405 8.45105 43.1349C8.53001 43.3294 8.66188 43.4979 8.83171 43.6212C9.00154 43.7446 9.20253 43.8179 9.4119 43.8328C9.62126 43.8477 9.83062 43.8037 10.0162 43.7057L18.0002 39.508L25.9842 43.7057C26.2022 43.8217 26.4553 43.8604 26.6979 43.8182C27.3096 43.7127 27.7209 43.1326 27.6155 42.5209L26.0897 33.6299L32.5479 27.3334C32.7237 27.1611 32.8397 26.9361 32.8748 26.6901C32.9698 26.0748 32.5408 25.5053 31.9256 25.4139V25.4139Z"
                fill="#F1D900"/>
        </svg>
    )
}

export const Done = (props: IWatchTrainingBlockProps) => {
    const correctAnswers = useAtomValue(watchCorrectAnswersCount)
    const setIsMusicPlaying = useSetAtom(watchTrainingMusicPlaying)

    useEffect(() => {
        setIsMusicPlaying(false)
    }, []);

    return (
        <div>
            <WatchTrainingTemplate.BlockSounds isPlaying block={props.block}/>
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            >
                <Image
                    draggable={false}
                    priority={true}
                    src={confettiImg}
                    className='object-cover w-[150vw] h-[150vh] -top-[20%] sm:w-[350vw] sm:h-[350vh] fixed sm:-top-[50%] -z-50 left-0'
                    width={2000}
                    height={2000}
                    alt='woman'
                />
            </motion.div>
            <div className='relative w-[100dvw] h-[100dvh] flex items-center justify-center'>
                <motion.div
                    initial={{height: 0}}
                    animate={{height: '50%'}}
                    exit={{height: 0, transition: {delay: 0}}}
                    transition={{delay: 0.1}}
                    className='transform-gpu flex items-center -z-[60] justify-center w-full max-w-[1024px] bg-blue-500 rounded-b-[40dvh] top-0 left-1/2 -translate-x-1/2 absolute'
                >
                    <motion.div
                        initial={{transform: 'translateY(-100dvh)'}}
                        animate={{transform: 'translateY(0)'}}
                        exit={{transform: 'translateY(-100dvh)'}}
                        className='flex flex-col items-center justify-center -mt-12'>
                        <motion.h1
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            exit={{scale: 0, transition: {delay: 0.1}}}
                            className='text-white z-50 w-full font-medium mix-blend-difference [font-size:_clamp(0.3em,4dvh,2em)] max-w-[300px] text-center'>
                            Поздравляем
                        </motion.h1>
                        <motion.h1
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            exit={{scale: 0, transition: {delay: 0.1}}}
                            className='text-white z-50 mt-[clamp(0px,0.5dvh,10px)] [font-size:_clamp(0.1em,2.5dvh,32px)] w-full max-w-[300px] text-center'>
                            Тренировка окончена!
                        </motion.h1>
                        <motion.div
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            exit={{scale: 0, transition: {delay: 0.1}}}
                        >
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    exit={{scale: 0, transition: {delay: 0.1}}}
                    transition={{delay: 0.15}}
                    className='
                    flex items-center justify-center relative w-max h-max
                transform-gpu
                shadow-2xl
                bg-[#f2f6fe]
                rounded-full
                border
                z-50
                p-1
                '
                >
                    <div
                        className='rounded-full relative bg-blue-500 w-[270px] h-[270px] max-w-[25vh] max-h-[25vh] cursor-pointer flex items-center justify-center'>
                        <Image
                            draggable={false}
                            priority={true}
                            src={cupImg}
                            className='object-contain -mt-[15dvh] -mr-[6dvh] max-w-[30vh] max-h-[30vh]'
                            width={300}
                            height={300}
                            alt='woman'
                        />
                        <div
                            className='rounded-full bg-white border-2 border-blue-500 flex items-center justify-center w-[6.5dvh] h-[6.5dvh] absolute bottom-[1.3dvh] left-[1.3dvh]'>
                            <h1 className='[font-size:_clamp(0.1em,2dvh,24px)]  text-blue-500 font-bold'>{(correctAnswers > 0 ? correctAnswers : 0) * 100}</h1>
                            <Fire/>
                        </div>

                        <div
                            className='rounded-full bg-white border-2 border-blue-500  flex items-center justify-center w-[6.5dvh] h-[6.5dvh] absolute top-[7dvh] -right-[2dvh]'>
                            <h1 className='[font-size:_clamp(0.1em,3.5dvh,32px)]  text-blue-500 font-bold'>7</h1>
                            <Star/>
                        </div>
                    </div>
                </motion.div>
                <div className='fixed w-full flex flex-col justify-center items-center px-8 bottom-8'>
                    <div className='w-full  flex gap-4 sm:w-[400px]'>
                        <motion.div
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            exit={{scale: 0, transition: {delay: 0.1}}}
                            className='border text-center bg-white border-zinc-200 w-full rounded-3xl p-[clamp(2px,3dvh,32px)]'
                        >
                            <h1 className=' [font-size:_clamp(0.3em,5dvh,3em)] text-blue-500 font-bold'>{(correctAnswers > 0 ? correctAnswers : 0) * 100}</h1>
                            <p className='[font-size:_clamp(0.1em,1.5dvh,24px)]  text-[#282738]'>Вы заработали</p>
                        </motion.div>

                        <motion.div
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            exit={{scale: 0, transition: {delay: 0.1}}}
                            className='border text-center bg-white border-zinc-200 w-full rounded-3xl p-[clamp(2px,3dvh,32px)]'
                        >
                            <h1 className='font-bold [font-size:_clamp(0.3em,5dvh,3em)]  text-blue-500'>7</h1>
                            <p className='[font-size:_clamp(0.1em,1.5dvh,24px)] text-[#282738]'>Ваше место</p>
                        </motion.div>
                    </div>
                    <motion.h1
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0, transition: {delay: 0.1}}}
                        className='z-50 w-full mix-blend-difference [font-size:_clamp(0.3em,1.7dvh,2em)] max-w-[400px] bg-white pt-4 pb-2 px-2 text-center'>
                        {correctAnswers > 0 ? `Вы верно ответили на тест и заработали баллы` : `К сожалению, вы не заработали баллов, так как неверно ответили на тест.`}
                    </motion.h1>
                    <motion.div
                        className='w-full flex mt-4 items-center justify-center gap-2'
                        initial={{transform: 'translateY(200px)'}}
                        animate={{transform: 'translateY(0px)'}}
                        exit={{transform: 'translateY(200px)', transition: {delay: 0.2}}}
                        transition={{delay: 0.2}}
                    >
                        <Button className='w-full sm:w-[400px] py-6' onClick={() => {
                            setIsMusicPlaying(true)
                        }}>
                            ЕЩЕ ЗАДАНИЯ НА СЕГОДНЯ
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
