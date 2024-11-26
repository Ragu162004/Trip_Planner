import React, { useContext } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { LogInContext } from "@/Context/LogInContext/Login";

function Hero() {
  const { isAuthenticated } = useContext(LogInContext);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-b from-gray-100 to-white py-10">
      <div className="px-8 md:px-20 flex flex-col items-center gap-6">
        <h1 className="font-extrabold text-3xl md:text-[50px] leading-tight text-orange-500">
          Kickstart Your Electrifying Adventures with Plan It!
        </h1>

        <h3 className="font-extrabold text-xl md:text-[40px] leading-tight opacity-80">
          Personalized Plans for Every Explorer
        </h3>

        <h5 className="text-sm md:text-lg font-semibold opacity-60">
          Your trusted trip planner and adventure guide, igniting exciting journeys with personalized travel plans tailored to your passions and preferences.
        </h5>

        <Link to="/plan-a-trip">
          <Button className="mt-6 px-6 py-2 text-lg">
            {isAuthenticated
              ? "Let's Make Another Trip"
              : "Plan a Trip, It's Free"}
            <span className="ml-2">🚀</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Hero;
