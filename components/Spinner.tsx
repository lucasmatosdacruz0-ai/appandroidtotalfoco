import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="w-16 h-16 border-4 border-blue-500 border-solid border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
  );
};

export default Spinner;