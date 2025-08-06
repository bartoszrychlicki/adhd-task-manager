import React from 'react';
import { Text, Box } from 'ink';
import figlet from 'figlet';
import { colors } from '../utils/theme.js';

export const Header: React.FC = () => {
  // Generate ASCII art with figlet - using retro fonts
  const adhdText = figlet.textSync('ADHD', {
    font: 'Block' as figlet.Fonts,
    horizontalLayout: 'fitted',
    verticalLayout: 'default'
  });

  const taskManagerText = figlet.textSync('TASK MANAGER', {
    font: 'Small' as figlet.Fonts,
    horizontalLayout: 'fitted', 
    verticalLayout: 'default'
  });

  return (
    <Box flexDirection="column" alignItems="center" marginBottom={2}>
      {/* Main ADHD ASCII Art - Generated with figlet */}
      <Text color="cyan" bold>
        {adhdText}
      </Text>
      
      {/* Subtitle - Generated with figlet */}
      <Box marginTop={0}>
        <Text color="yellow">
          {taskManagerText}
        </Text>
      </Box>
      
      {/* C64-style top border */}
      <Box marginTop={1}>
        <Text color="magenta" bold>
          ═══════════════════════════════════════════════════════════════════
        </Text>
      </Box>
      
      
      {/* Status line */}
      <Box marginTop={1}>
        <Text color="cyan" dimColor>
          [SYSTEM READY] • [64KB RAM FREE] • [PRESS ANY KEY TO CONTINUE]
        </Text>
      </Box>
    </Box>
  );
};