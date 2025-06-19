import React, { createContext, useContext, useEffect, useState } from "react";
import { animated, useSpring as useReactSpring } from "@react-spring/web"; // For cursor

const CursorFollowerContext = createContext(null);
export const CursorFollowerProvider = ({ children }) => {
  const [start, setStart] = useState(false);
  const [scaling, setScaling] = useState(false);
  const [click, setClick] = useState(false);
  const [circle, setCircle] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const mousemove = (e) => {
      setStart(true);
      setCircle({ x: e.clientX, y: e.clientY });
      setScaling(
        e.target?.closest("a") || e.target?.closest("button") ? true : false,
      );
    };
    const onClick = () => {
      if (!click) {
        setClick(true);
        setTimeout(() => setClick(false), 100);
      }
    };
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("click", onClick);
    };
  }, [click]);
  return (
    <CursorFollowerContext.Provider value={{ start, scaling, click, circle }}>
      {children}
    </CursorFollowerContext.Provider>
  );
};
const useCursorFollower = () => useContext(CursorFollowerContext);

export const CursorFollower = () => {
  const { circle, start, scaling, click } = useCursorFollower();
  const wrapperStyles = useReactSpring({
    to: { x: circle.x - 16, y: circle.y - 16 },
    config: { mass: 1, tension: 1200, friction: 80 },
  });
  const circleStyles = useReactSpring({
    to: { scale: scaling ? 1.5 : 1 },
    config: { mass: 1, tension: 200, friction: 20 },
  });
  return (
    start && (
      <animated.div
        style={wrapperStyles}
        className="pointer-events-none fixed left-0 top-0 z-[140] hidden h-8 w-8 select-none md:block"
      >
        <animated.div
          style={circleStyles}
          className={`${click ? "bg-opacity-50" : "bg-opacity-0"} h-full w-full rounded-full bg-yellow-500 ring-2 ring-yellow-500 transition-colors duration-200`}
        ></animated.div>
      </animated.div>
    )
  );
};
