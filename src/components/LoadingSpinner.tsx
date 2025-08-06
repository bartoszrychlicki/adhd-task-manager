import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';

interface LoadingSpinnerProps {
  message?: string;
  type?: 'dots' | 'spinner' | 'bar';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Ładowanie...', 
  type = 'dots',
  color = 'yellow'
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => prev + 1);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const getSpinner = () => {
    switch (type) {
      case 'dots':
        const dots = ['.', '..', '...'];
        return dots[frame % dots.length];
      case 'spinner':
        const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        return spinner[frame % spinner.length];
      case 'bar':
        const bar = ['[    ]', '[=   ]', '[==  ]', '[=== ]', '[====]'];
        return bar[frame % bar.length];
      default:
        return '...';
    }
  };

  return (
    <Box>
      <Text color={color}>
        {getSpinner()} {message}
      </Text>
    </Box>
  );
};

export default LoadingSpinner; 