"use client"

import CheckIcon from '@/assets/check.svg';
import { twMerge } from "tailwind-merge";
import { motion, useScroll, useTransform } from "framer-motion";





const pricingTiers = [
  {
    title: "Free",
    monthlyPrice: 0,
    buttonText: "Get started for free",
    popular: false,
    inverse: true,
    features: [
      "Up to 5 project members",
      "Unlimited tasks and projects",
      "2GB storage",
      "Integrations",
      "Basic support",
    ],
  },
  {
    title: "Pro",
    monthlyPrice: 9,
    buttonText: "Sign up now",
    popular: true,
    inverse: true,
    features: [
      "Up to 50 project members",
      "Unlimited tasks and projects",
      "50GB storage",
      "Integrations",
      "Priority support",
      "Advanced support",
      "Export support",
    ],
  },
  {
    title: "Business",
    monthlyPrice: 19,
    buttonText: "Sign up now",
    popular: false,
    inverse: true,
    features: [
      "Up to 5 project members",
      "Unlimited tasks and projects",
      "200GB storage",
      "Integrations",
      "Dedicated account manager",
      "Custom fields",
      "Advanced analytics",
      "Export capabilities",
      "API access",
      "Advanced security features",
    ],
  },
];

export const CourseObjectives = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className='flex flex-col gap-6 items-center mt-10 lg:flex-row lg:items-end lg:justify-center lg:gap-10' >
        {pricingTiers.map(
            ({ title, monthlyPrice, buttonText, popular, inverse, features }, index) => (
              <div key={index}  className={twMerge('p-10 border border-[#F1F1F1] rounded-3xl shadow-[0_7px_14px_#EAEAEA] max-w-xs w-full', inverse === true && "border-black bg-gray-900 text-white")}>
                <div className='flex justify-between'>
                   <h3 className={twMerge("text-lg font-bold text-black/50", inverse === true && "text-white/60")}>{title}</h3>
                   {popular === true && 
                   
                   <div className='inline-flex text-sm px-4 py-1.5 rounded-xl border border-white/20'>
                   <motion.span 
                      animate={{
                        backgroundPositionX: "100%",
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop",
                      }}                      
                      className='bg-[linear-gradient(to_right,#DD7DDF,#E1CD86,#BBCB92,#71C2EF,#3BFFFF,#DD7DDF,#E1CD86,#BBCB92,#71C2EF,#3BFFFF)] [background-size:200%] text-transparent bg-clip-text font-medium'>Popular</motion.span>
                    </div>
                   }
                </div>
                <div className="flex items-baseline gap-1 mt-[30px]">
                  <span className="text-4xl font-bold tracking-tighter leading-none"
                  >${monthlyPrice}</span>
                  <span className={twMerge("tracking-tight font-bold text-black/50", inverse === true && "text-white/60")}
                  >/month</span>
                </div>
                <button className={twMerge("btn btn-primary w-full mt-[30px]", inverse === true && "bg-white text-black")}>{buttonText}</button>
                <ul className="flex flex-col gap-5 mt-8">
                    {features.map((feature, index) => (
                      <li key={index} className='text-sm flex items-center gap-4'>
                        <CheckIcon className="h-6 w-6" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
              </div>
            )
          )}

        </div>

      </div>
    </section>
  );
};

