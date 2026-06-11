import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store/store";

const bubbles = Array.from({ length: 15 }).map((_, i) => {
  const size = Math.random() * 6 + 3; // 3–9px
  const left = Math.random() * 100; // %
  const duration = Math.random() * 3 + 2; // 2–5s
  const delay = Math.random() * 5; // 0–5s

  return (
    <span
      key={i}
      className="bubble"
      style={{
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
});

// interface IDrop {
//   drinkedWater: number;
//   normalWater: number;
// }

export const Drop = () => {
  const today = useSelector((state: RootState) => state.today.today);

  const dailyGoalMl = today?.daily_goal_ml || 0;
  // const remainingML = today?.remaining_ml;
  // const progressPercent = today?.progress_percent || 0;
  const totalML = today?.total_ml || 0;

  const progressPercent = (totalML / dailyGoalMl) * 100;

  return (
    <div className="drop">
      {" "}
      <div className="relative -rotate-135 h-full flex justify-center items-center w-full">
        <div className=" z-40 flex flex-col justify-center items-center mix-blend-plus-lighter">
          <span className="text-gray-400 font-semibold text-[1rem]">
            Drink target
          </span>
          <strong className="text-[1rem] text-gray-400">
            {totalML}
            <span className="text-gray-400">/{dailyGoalMl} ml</span>
          </strong>
        </div>
        <div
          className={`absolute bottom-0 w-full transition-all `}
          style={{ height: `${progressPercent}%` }}
        >
          <div className="relative z-0">
            <div className="absolute w-[200%]  -top-[48px] flex wave-loop-rev">
              <svg
                viewBox="0 0 1440 320"
                className="w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#99c4fa"
                  d="M0,200
       C120,160 240,160 360,200
       C480,240 600,240 720,200
       C840,160 960,160 1080,200
       C1200,240 1320,240 1440,200
       L1440,320
       L0,320
       Z"
                />
              </svg>
              <svg
                viewBox="0 0 1440 320"
                className="w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#99c4fa"
                  d="M0,200
       C120,160 240,160 360,200
       C480,240 600,240 720,200
       C840,160 960,160 1080,200
       C1200,240 1320,240 1440,200
       L1440,320
       L0,320
       Z"
                />
              </svg>
            </div>
            <div className="absolute w-[200%]  -top-[42px] flex wave-loop">
              <svg
                viewBox="0 0 1440 320"
                className="w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#209bff"
                  d="M0,200
       C120,160 240,160 360,200
       C480,240 600,240 720,200
       C840,160 960,160 1080,200
       C1200,240 1320,240 1440,200
       L1440,320
       L0,320
       Z"
                />
              </svg>
              <svg
                viewBox="0 0 1440 320"
                className="w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#209bff"
                  d="M0,200
       C120,160 240,160 360,200
       C480,240 600,240 720,200
       C840,160 960,160 1080,200
       C1200,240 1320,240 1440,200
       L1440,320
       L0,320
       Z"
                />
              </svg>
            </div>
          </div>
          <div className="relative flex flex-col justify-center items-center bg-gradient-to-b z-10 from-[#209bff] to-[#00abe8] h-full w-full">
            <div className="bubble-layer absolute bottom-0 w-full h-full overflow-hidden pointer-events-none z-10">
              {bubbles}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
