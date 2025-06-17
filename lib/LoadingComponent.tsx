import React from 'react';
import { 
  Box, 
  Text, 
  Group, 
  Stack, 
  Paper,
  ThemeIcon,
  Container,
  Center,
  RingProgress,
  Loader
} from '@mantine/core';
import { 
  Truck, 
  Package, 
  Building2, 
  Hammer,
  HardHat,
  Cog
} from 'lucide-react';

interface LoadingComponentProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'construction' | 'pulse';
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({ 
  message = "Loading construction data...", 
  size = 'md',
  variant = 'default'
}) => {
  const sizeConfig = {
    sm: { container: 200, icon: 32, text: 'sm', ring: 60 },
    md: { container: 300, icon: 48, text: 'md', ring: 80 },
    lg: { container: 400, icon: 64, text: 'lg', ring: 100 },
    xl: { container: 500, icon: 80, text: 'xl', ring: 120 }
  };

  const config = sizeConfig[size];

  if (variant === 'minimal') {
    return (
      <Center style={{ minHeight: '200px' }}>
        <Group gap="md">
          <Box className="animate-spin">
            <Cog size={24} style={{ color: '#3D6B2C' }} />
          </Box>
          <Text size="sm" c="dimmed">{message}</Text>
        </Group>
      </Center>
    );
  }

  if (variant === 'pulse') {
    return (
      <Center style={{ minHeight: '300px' }}>
        <Stack align="center" gap="lg">
          <Box
            className="animate-pulse"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #3D6B2C, #388E3C, #F08C23)',
              backgroundSize: '300% 300%',
              animation: 'gradientShift 2s ease-in-out infinite'
            }}
          />
          <Text size={config.text} fw={500} className="text-gray-700">
            {message}
          </Text>
          <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>
        </Stack>
      </Center>
    );
  }

  if (variant === 'construction') {
    return (
      <Center style={{ minHeight: '400px' }}>
        <Container size="sm">
          <Paper
            shadow="lg"
            radius="xl"
            p="xl"
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(61, 107, 44, 0.05), rgba(240, 140, 35, 0.05))',
              border: '2px solid rgba(61, 107, 44, 0.1)'
            }}
          >
            {/* Background animated elements */}
            <Box
              className="absolute inset-0 opacity-10"
              style={{
                background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233D6B2C' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20zM0 20c0-11.046 8.954-20 20-20v40c-11.046 0-20-8.954-20-20z'/%3E%3C/g%3E%3C/svg%3E")`,
                animation: 'backgroundMove 20s linear infinite'
              }}
            />

            <Stack align="center" gap="xl">
              {/* Animated Construction Icons */}
              <Box className="relative">
                <Group gap="xl" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <ThemeIcon
                    size={config.icon}
                    radius="xl"
                    style={{
                      backgroundColor: 'rgba(61, 107, 44, 0.1)',
                      border: '3px solid #3D6B2C',
                      animation: 'bounce 2s ease-in-out infinite',
                      animationDelay: '0s'
                    }}
                  >
                    <Building2 size={config.icon * 0.6} style={{ color: '#3D6B2C' }} />
                  </ThemeIcon>
                  
                  <ThemeIcon
                    size={config.icon}
                    radius="xl"
                    style={{
                      backgroundColor: 'rgba(240, 140, 35, 0.1)',
                      border: '3px solid #F08C23',
                      animation: 'bounce 2s ease-in-out infinite',
                      animationDelay: '0.3s'
                    }}
                  >
                    <Hammer size={config.icon * 0.6} style={{ color: '#F08C23' }} />
                  </ThemeIcon>
                  
                  <ThemeIcon
                    size={config.icon}
                    radius="xl"
                    style={{
                      backgroundColor: 'rgba(56, 142, 60, 0.1)',
                      border: '3px solid #388E3C',
                      animation: 'bounce 2s ease-in-out infinite',
                      animationDelay: '0.6s'
                    }}
                  >
                    <HardHat size={config.icon * 0.6} style={{ color: '#388E3C' }} />
                  </ThemeIcon>
                </Group>

                {/* Rotating gear */}
                <Box
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    animation: 'spin 4s linear infinite',
                    zIndex: 10
                  }}
                >
                  <Cog size={config.icon * 0.4} style={{ color: '#3D6B2C', opacity: 0.3 }} />
                </Box>
              </Box>

              {/* Progress Ring */}
              <Box className="relative">
                <RingProgress
                  size={config.ring}
                  thickness={8}
                  sections={[
                    { value: 100, color: '#3D6B2C', animated: true }
                  ]}
                  rootColor="rgba(61, 107, 44, 0.1)"
                  className="animate-pulse"
                />
                <Box
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ animation: 'truck 3s ease-in-out infinite' }}
                >
                  <Truck size={config.ring * 0.3} style={{ color: '#F08C23' }} />
                </Box>
              </Box>

              {/* Message */}
              <Stack align="center" gap="xs">
                <Text
                  size={config.text}
                  fw={600}
                  className="text-center"
                  style={{
                    background: 'linear-gradient(45deg, #3D6B2C, #F08C23)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'textShine 2s ease-in-out infinite'
                  }}
                >
                  🏗️ {message}
                </Text>
                <Group gap="xs" className="animate-pulse">
                  <Box className="w-2 h-2 rounded-full bg-green-600" style={{ animationDelay: '0s' }} />
                  <Box className="w-2 h-2 rounded-full bg-orange-500" style={{ animationDelay: '0.2s' }} />
                  <Box className="w-2 h-2 rounded-full bg-green-500" style={{ animationDelay: '0.4s' }} />
                </Group>
              </Stack>

              {/* Animated construction line */}
              <Box
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(61, 107, 44, 0.1)' }}
              >
                <Box
                  className="h-full rounded-full"
                  style={{
                    width: '40%',
                    background: 'linear-gradient(90deg, #3D6B2C, #F08C23, #388E3C)',
                    animation: 'loading 2s ease-in-out infinite'
                  }}
                />
              </Box>
            </Stack>

            {/* Custom animations */}
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
              }
              
              @keyframes bounce {
                0%, 100% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.1) rotate(5deg); }
              }
              
              @keyframes spin {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
              }
              
              @keyframes truck {
                0%, 100% { transform: translate(-50%, -50%) translateX(0px); }
                25% { transform: translate(-50%, -50%) translateX(3px); }
                75% { transform: translate(-50%, -50%) translateX(-3px); }
              }
              
              @keyframes loading {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
              }
              
              @keyframes textShine {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.2); }
              }
              
              @keyframes backgroundMove {
                0% { transform: translateX(0) translateY(0); }
                25% { transform: translateX(-40px) translateY(-40px); }
                50% { transform: translateX(-80px) translateY(0); }
                75% { transform: translateX(-40px) translateY(40px); }
                100% { transform: translateX(0) translateY(0); }
              }
            `}</style>
          </Paper>
        </Container>
      </Center>
    );
  }

  // Default variant
  return (
    <Center style={{ minHeight: '350px' }}>
      <Paper
        shadow="md"
        radius="lg"
        p="xl"
        style={{
          background: 'linear-gradient(135deg, rgba(61, 107, 44, 0.03), rgba(240, 140, 35, 0.03))',
          border: '1px solid rgba(61, 107, 44, 0.1)',
          minWidth: config.container
        }}
      >
        <Stack align="center" gap="lg">
          {/* Main loading animation */}
          <Box className="relative">
            <Box
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #3D6B2C, #388E3C, #F08C23, #3D6B2C)',
                animation: 'rotate 2s linear infinite',
                padding: '4px'
              }}
            >
              <Box
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'white' }}
              >
                <Package 
                  size={config.icon * 0.6} 
                  style={{ 
                    color: '#3D6B2C',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} 
                />
              </Box>
            </Box>
            <Box
              style={{
                width: config.icon + 8,
                height: config.icon + 8,
                visibility: 'hidden'
              }}
            />
          </Box>

          {/* Message */}
          <Stack align="center" gap="xs">
            <Text size={config.text} fw={500} className="text-center text-gray-700">
              {message}
            </Text>
            <Group gap="xs">
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#3D6B2C', '#F08C23', '#388E3C'][i],
                    animation: `dot 1.4s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </Group>
          </Stack>

          {/* Custom animations */}
          <style>{`
            @keyframes rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.7; }
            }
            
            @keyframes dot {
              0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
              40% { transform: scale(1.2); opacity: 1; }
            }
          `}</style>
        </Stack>
      </Paper>
    </Center>
  );
};

// Example usage component
export const LoadingExamples: React.FC = () => {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box>
          <Text size="xl" fw={700} mb="md" className="text-gray-800">
            🏗️ Keyman Loading Components
          </Text>
          <Text c="dimmed" mb="xl">
            Stunning, animated loading components for your construction app
          </Text>
        </Box>

        <Stack gap="xl">
          <Box>
            <Text size="lg" fw={600} mb="md" style={{ color: '#3D6B2C' }}>
              🎯 Default Variant
            </Text>
            <LoadingComponent 
              message="Loading construction materials..." 
              size="md"
              variant="default"
            />
          </Box>

          <Box>
            <Text size="lg" fw={600} mb="md" style={{ color: '#F08C23' }}>
              🏗️ Construction Variant
            </Text>
            <LoadingComponent 
              message="Preparing site data..." 
              size="lg"
              variant="construction"
            />
          </Box>

          <Box>
            <Text size="lg" fw={600} mb="md" style={{ color: '#388E3C' }}>
              ✨ Pulse Variant
            </Text>
            <LoadingComponent 
              message="Syncing with suppliers..." 
              size="md"
              variant="pulse"
            />
          </Box>

          <Box>
            <Text size="lg" fw={600} mb="md" style={{ color: '#3D6B2C' }}>
            ⚡ Minimal Variant
            </Text>
            <LoadingComponent 
              message="Quick loading..." 
              size="sm"
              variant="minimal"
            />
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
};

export default LoadingComponent 