import React from "react";
import Lottie from "react-lottie";
import { animationDefaultOptions } from "@/lib/utils";

const SplashLoader = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1b1c24] z-[9999]">
            <div className="flex flex-col items-center gap-6">
                {/* Logo/Icon Container */}
                <div className="relative">
                    <Lottie
                        isClickToPauseDisabled
                        height={200}
                        width={200}
                        options={animationDefaultOptions}
                    />
                </div>

                {/* Text Container with subtle animation */}
                <div className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="flex items-center gap-2">
                        <svg
                            id="logo-38"
                            width="40"
                            height="20"
                            viewBox="0 0 78 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
                                fill="#8338ec"
                            ></path>
                            <path
                                d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
                                fill="#975aed"
                            ></path>
                            <path
                                d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
                                fill="#a16ee8"
                            ></path>
                        </svg>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Syncronus</h1>
                    </div>
                    <p className="text-neutral-400 text-sm font-light tracking-widest uppercase">
                        Securing Connection...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SplashLoader;
