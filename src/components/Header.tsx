import React from 'react';
import { Text, Box } from 'ink';
import figlet from 'figlet';

export const Header: React.FC = () => {
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
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Text color="cyan" bold>{adhdText}</Text>
      <Box marginTop={0}>
        <Text color="yellow">{taskManagerText}</Text>
      </Box>
      <Box marginTop={0}>
        <Text color="gray">──────────────────────────────────────────────────────────────</Text>
      </Box>
      <Box marginTop={0}>
        <Text color="gray" dimColor>[READY] Modern CLI • Ink + React • Esc = Back</Text>
      </Box>
    </Box>
  );
};