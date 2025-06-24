"use client"
import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Paper,
  ThemeIcon,
  Transition,
  Center,
  Anchor
} from '@mantine/core';
import {
  Home,
  ArrowLeft,
  Construction,
  Hammer,
  Wrench,
  AlertCircle,
  LucideProps
} from 'lucide-react';

const KeymanNotFound = () => {
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [floatingTools, setFloatingTools] = useState<{ icon: React.FC<LucideProps>; delay: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowContent(true), 300);
    
    // Create floating construction tools animation
    const tools = [
      { icon: Hammer, delay: 0 },
      { icon: Wrench, delay: 500 },
      { icon: Construction, delay: 1000 }
    ];
    setFloatingTools(tools);

    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
      p={{base:"sm",md:"xl"}}
    >
      {/* Floating Background Elements */}
      {floatingTools.map((tool, index) => (
        <Box
          key={index}
          style={{
            position: 'absolute',
            top: `${20 + index * 25}%`,
            left: `${10 + index * 30}%`,
            opacity: 0.1,
            animation: `float-${index} ${3 + index}s ease-in-out infinite`,
            transform: 'rotate(-15deg)',
            fontSize: '4rem',
            color: '#3D6B2C'
          }}
        >
          <tool.icon size={80} />
        </Box>
      ))}

      <Container size="md" style={{ position: 'relative', zIndex: 10 }}>
        <Center style={{ minHeight: '100vh' }}>
          <Stack align="center"gap="xl">
            
            {/* Main Error Icon */}
            <Transition
              mounted={mounted}
              transition="pop-bottom-left"
              duration={800}
            >
              {(styles) => (
                <Paper
                  shadow="xl"
                  radius="xl"
                  p="xl"
                  style={{
                    ...styles,
                    background: 'linear-gradient(135deg, #3D6B2C, #388E3C)',
                    border: '3px solid #F08C23',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  <ThemeIcon
                    size={120}
                    radius="xl"
                    color="transparent"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <AlertCircle size={80} color="white" strokeWidth={1.5} />
                  </ThemeIcon>
                </Paper>
              )}
            </Transition>

            {/* 404 Text */}
            <Transition
              mounted={showContent}
              transition="slide-up"
              duration={600}
            >
              {(styles) => (
                <Stack align="center"gap="md" style={styles}>
                  <Title
                    order={1}
                    size="8rem"
                    fw={900}
                    style={{
                      background: 'linear-gradient(45deg, #3D6B2C, #F08C23, #388E3C)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    404
                  </Title>
                  
                  <Title
                    order={2}
                    size="2.5rem"
                   fw={700}
                    c="#3D6B2C"
                 ta="center"
                    style={{ 
                      marginTop: '-1rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    Construction Zone Ahead
                  </Title>
                  
                  <Text
                    size="lg"
                    color="dimmed"
                    ta="center"
                    style={{ 
                      maxWidth: '500px',
                      lineHeight: 1.6,
                      fontSize: '1.1rem'
                    }}
                  >
                   {` Looks like this page is still under construction! 🚧 
                    The resource you're looking for might have been moved, 
                    deleted, or is temporarily unavailable.`}
                  </Text>
                </Stack>
              )}
            </Transition>

            {/* Action Buttons */}
            <Transition
              mounted={showContent}
              transition="slide-up"
              duration={800}
              timingFunction="ease-out"
            >
              {(styles) => (
                <Group gap="lg" style={styles}>
                  <Button
                    size="lg"
                    radius="xl"
                    leftSection={<ArrowLeft size={20} />}
                    onClick={handleGoBack}
                    variant="outline"
                    color="#3D6B2C"
                    style={{
                      borderWidth: 2,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(61, 107, 44, 0.3)'
                      }
                    }}
                  >
                    Go Back
                  </Button>
                  
                  <Button
                    size="lg"
                    radius="xl"
                    leftSection={<Home size={20} />}
                    onClick={handleGoHome}
                    style={{
                      background: 'linear-gradient(135deg, #F08C23, #ff9f40)',
                      fontWeight: 600,
                      border: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(240, 140, 35, 0.4)',
                        background: 'linear-gradient(135deg, #ff9f40, #F08C23)'
                      }
                    }}
                  >
                    Back to Home
                  </Button>
                </Group>
              )}
            </Transition>

            {/* Help Text */}
            <Transition
              mounted={showContent}
              transition="fade"
              duration={1000}
            >
              {(styles) => (
                <Box style={styles}>
                  <Text
                    size="sm"
                    color="dimmed"
                    ta="center"
                    style={{ marginTop: '2rem' }}
                  >
                    Need help finding construction materials or connecting with suppliers?{' '}
                    <Anchor
                      href="/"
                      style={{ 
                        color: '#3D6B2C',
                        fontWeight: 600,
                        textDecoration: 'none',
                        borderBottom: '1px solid #3D6B2C',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Explore Keyman Stores
                    </Anchor>
                  </Text>
                </Box>
              )}
            </Transition>
          </Stack>
        </Center>
      </Container>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) rotate(-15deg); }
          50% { transform: translateY(-20px) rotate(-10deg); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(-15deg); }
          50% { transform: translateY(-30px) rotate(-20deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(-15deg); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .mantine-Button-root:hover {
          transform: translateY(-2px) !important;
        }
      `}</style>
    </Box>
  );
};

export default KeymanNotFound;