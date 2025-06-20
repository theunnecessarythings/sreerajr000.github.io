import React from "react";
import Giscus from "@giscus/react";

export const Comments = () => {
  return (
    <div className="giscus mt-16">
      <Giscus
        id="comments"
        repo="theunnecessarythings/sreerajr000.github.io"
        repoId="R_kgDOHhobNQ"
        category="Announcements"
        categoryId="DIC_kwDOHhobNc4Ci3VC"
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="transparent_dark"
        lang="en"
        loading="lazy"
      />
    </div>
  );
};
