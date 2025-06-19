export const blogPosts = [
  {
    id: 1,
    featured: true,
    date: "April 30, 2024",
    title: "You (probably) don't need CSS-in-JS",
    summary:
      "Vanilla CSS is good now actually. Here's a couple nifty techniques for dynamically styling React components.",
    readTime: "00:07:53:60",
    imageUrl:
      "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=2264&auto=format&fit=crop",
    content: `<p>When I first tried CSS-in-JS libraries like Styled Components and Emotion... it still had its problems.</p><ol><li><strong>Values:</strong> like a color, delay, or position.</li><li><strong>States:</strong> like a boolean that represents an on/off state.</li></ol>`,
  },
  {
    id: 2,
    featured: false,
    date: "April 20, 2024",
    title: "Hello world: how I built this site",
    summary:
      "I originally built this portfolio site back in 2018, and since then it's evolved quite a bit.",
    readTime: "00:05:03:99",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2370&auto=format&fit=crop",
    content: `<p>This is the story of how this website was built.</p>`,
  },
  {
    id: 3,
    featured: false,
    date: "June 18, 2025",
    title: "Coming Soon...",
    summary: "",
    readTime: "",
    comingSoon: true,
  },
];

export const publicationsData = [
  {
    id: 1,
    title: "Quantum Entanglement in High-Dimensional Systems",
    authors: "S. Ramachandran, E. Schrödinger, A. Einstein",
    journal: "Journal of Advanced Physics, Vol. 42, 2024",
    href: "#",
    abstract:
      "<p>This paper explores the complex nature of quantum entanglement in systems with more than three dimensions, proposing a new mathematical framework for their description and measurement.</p>",
  },
  {
    id: 2,
    title: "A Novel Approach to Neural Network Optimization",
    authors: "S. Ramachandran, Y. LeCun",
    journal:
      "Conference on Neural Information Processing Systems (NeurIPS), 2023",
    href: "#",
    abstract:
      '<p>We introduce a novel optimization algorithm, "Lion," which significantly accelerates the training of large-scale neural networks while improving final model accuracy.</p>',
  },
  {
    id: 3,
    title: "Topological Data Analysis for Unsupervised Anomaly Detection",
    authors: "S. Ramachandran, G. Carlsson",
    journal:
      "IEEE Transactions on Pattern Analysis and Machine Intelligence, 2022",
    href: "#",
    abstract:
      "<p>This work leverages topological data analysis (TDA) to create a robust method for unsupervised anomaly detection in high-volume, unstructured datasets.</p>",
  },
];

export const projectsData = [
  {
    id: 1,
    featured: true,
    title: "Project Alpha",
    summary:
      "An AI-powered data visualization tool that uncovers hidden patterns in complex datasets.",
    imageUrl:
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2295&auto=format&fit=crop",
    tech: ["React", "D3.js", "Python"],
    content: "<h3>Overview</h3><p>Project Alpha is our flagship product...</p>",
  },
  {
    id: 2,
    featured: false,
    title: "Project Beta",
    summary:
      "A decentralized social media platform built on Web3 technologies.",
    imageUrl:
      "https://images.unsplash.com/photo-1642104704074-907126278813?q=80&w=2370&auto=format&fit=crop",
    tech: ["Next.js", "Solidity", "IPFS"],
    content: "<h3>Concept</h3><p>Project Beta re-imagines social media...</p>",
  },
  {
    id: 3,
    featured: false,
    title: "Project Gamma",
    summary:
      "A real-time collaborative code editor with integrated video chat.",
    imageUrl:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2231&auto=format&fit=crop",
    tech: ["WebSockets", "Monaco Editor", "WebRTC"],
    content:
      "<h3>Features</h3><p>Project Gamma enhances pair programming...</p>",
  },
];

export const galleryData = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2369&auto=format&fit=crop",
    alt: "Code on a screen",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2372&auto=format&fit=crop",
    alt: "Laptop on a desk",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=2370&auto=format&fit=crop",
    alt: "Neon gaming setup",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?q=80&w=2370&auto=format&fit=crop",
    alt: "Abstract code",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2370&auto=format&fit=crop",
    alt: "Multiple monitors with code",
  },
];
