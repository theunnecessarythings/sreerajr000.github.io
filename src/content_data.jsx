const blogModules = import.meta.glob("/src/content/blog/*.mdx", { eager: true });
const projectModules = import.meta.glob("/src/content/projects/*.mdx", {
  eager: true,
});
const publicationModules = import.meta.glob("/src/content/publications/*.mdx", {
  eager: true,
});

const toSlug = (file) => file.split("/").pop().replace(".mdx", "");

const parseDate = (value) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const readCollection = (modules, includeContent = true) =>
  Object.keys(modules)
    .map((file) => {
      const post = modules[file];
      return {
        slug: toSlug(file),
        ...post.frontmatter,
        ...(includeContent ? { Content: post.default } : {}),
      };
    })
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

export const blogPosts = readCollection(blogModules);
export const projectsData = readCollection(projectModules);
export const publicationsData = readCollection(publicationModules, false);

export const getAllTags = (items) => [
  ...new Set(items.flatMap((item) => item.tags || [])),
];

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};
