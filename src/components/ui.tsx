import React from 'react';
import { Box, Text } from 'ink';

interface PanelProps {
  title?: string;
  borderColor?: string;
  paddingX?: number;
  paddingY?: number;
  minWidth?: number;
  width?: number | string;
  children: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  borderColor = 'grey',
  paddingX = 2,
  paddingY = 1,
  minWidth,
  width,
  children
}) => {
  return (
    <Box flexDirection="column" width={width}>
      <Box borderStyle="round" borderColor={borderColor} paddingX={paddingX} paddingY={paddingY} minWidth={minWidth} width={width}>
        <Box flexDirection="column" width="100%">
          {title && (
            <Box justifyContent="center" marginBottom={1}>
              <Text color={borderColor} bold>
                {title}
              </Text>
            </Box>
          )}
          {children}
        </Box>
      </Box>
    </Box>
  );
};

interface SectionTitleProps {
  label: string;
  color?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ label, color = 'cyan' }) => (
  <Text color={color} bold>{label}</Text>
);

interface KeyBarItem {
  key: string;
  label: string;
}

interface KeyBarProps {
  items: KeyBarItem[];
  color?: string;
  borderColor?: string;
}

export const KeyBar: React.FC<KeyBarProps> = ({ items, color = 'gray', borderColor = 'grey' }) => {
  const content = items.map((it) => `${it.key} ${it.label}`).join(' │ ');
  return (
    <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor={borderColor}>
      <Text color={color}>{content}</Text>
    </Box>
  );
};