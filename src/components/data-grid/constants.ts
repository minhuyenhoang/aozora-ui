export const DATA_GRID_PAGE_SIZES = [
  { label: "20", id: 20, value: 20 },
  { label: "50", id: 50, value: 50 },
  { label: "100", id: 100, value: 100 },
  { label: "200", id: 200, value: 200 },
];

export const DATA_GRID_ROW_ANIMATE = {
  move: {
    duration: 500,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", // spring overshoot
  },
  enter: {
    duration: 300,
    easing: "ease-out",
    type: () => [
      { opacity: 0, transform: "translateY(20px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
  },
  exit: {
    duration: 200,
    easing: "ease-in",
    type: () => [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-20px)" },
    ],
  },
};

export const DATA_GRID_COLUMN_ANIMATE = {
  move: {
    duration: 500,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  enter: {
    duration: 250,
    easing: "ease-out",
    type: () => [
      { opacity: 0, transform: "translateX(-12px)" },
      { opacity: 1, transform: "translateX(0)" },
    ],
  },
  exit: {
    duration: 200,
    easing: "ease-in",
    type: () => [
      { opacity: 1, transform: "translateX(0)" },
      { opacity: 0, transform: "translateX(12px)" },
    ],
  },
};
