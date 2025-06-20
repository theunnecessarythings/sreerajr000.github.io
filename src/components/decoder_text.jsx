import React, { useEffect, useRef } from "react";
import { VisuallyHidden, useMockReducedMotion, delay } from "../utils";
import { useSpring as useFramerSpring, AnimatePresence } from "framer-motion";

const glyphs =
  "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:',.<>?/`~".split(
    "",
  );
const CharType = { Glyph: "glyph", Value: "value" };

function shuffle(content, output, position) {
  return content.map((value, index) => {
    if (index < position) return { type: CharType.Value, value };
    if (position % 1 < 0.5)
      return {
        type: CharType.Glyph,
        value: glyphs[Math.floor(Math.random() * glyphs.length)],
      };
    return { type: CharType.Glyph, value: output[index].value };
  });
}

export const DecoderText = React.memo(
  ({ text, start = true, delay: startDelay = 0, className, ...rest }) => {
    const output = useRef([{ type: CharType.Glyph, value: "" }]);
    const container = useRef();
    const reduceMotion = useMockReducedMotion();
    const decoderSpring = useFramerSpring(0, { stiffness: 50, damping: 20 });

    useEffect(() => {
      const containerInstance = container.current;
      if (!containerInstance) return;
      const content = text.split("");
      output.current = content.map(() => ({
        type: CharType.Glyph,
        value: "",
      }));
      const renderOutput = () => {
        if (!containerInstance) return;
        const characterMap = output.current.map(
          (item) =>
            `<span style="color:${item.type === "glyph" ? "#888" : "inherit"}; opacity:${item.type === "glyph" ? 0.4 : 1}; white-space: pre;">${item.value}</span>`,
        );
        containerInstance.innerHTML = characterMap.join("");
      };
      const unsubscribeSpring = decoderSpring.on("change", (value) => {
        output.current = shuffle(content, output.current, value);
        renderOutput();
      });
      const startSpring = async () => {
        await delay(startDelay);
        decoderSpring.set(content.length);
      };
      if (start && !reduceMotion) startSpring();
      if (reduceMotion) {
        output.current = content.map((value, index) => ({
          type: CharType.Value,
          value: content[index],
        }));
        renderOutput();
      }
      return () => unsubscribeSpring?.();
    }, [decoderSpring, reduceMotion, start, startDelay, text]);

    return (
      <span className={className} {...rest}>
        <VisuallyHidden>{text}</VisuallyHidden>
        <span aria-hidden ref={container} />
      </span>
    );
  },
);
