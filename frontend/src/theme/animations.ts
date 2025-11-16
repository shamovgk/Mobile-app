export const animations = {
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  spring: {
    default: {
      damping: 15,
      stiffness: 150,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
    },
    smooth: {
      damping: 20,
      stiffness: 200,
    },
  },

  easing: {
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.58, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  },
};
