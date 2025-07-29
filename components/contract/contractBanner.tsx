import React, { useState } from "react";
import {
  Modal,
  Button,
  Text,
  Stack,
  Group,
  Paper,
  Badge,
  Transition,
} from "@mantine/core";
import {
  Shield,
  Users,
  //Clock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  //Lock,
  FileText,
  Zap,
} from "lucide-react";

interface KeyContractBannerProps {
  opened: boolean;
  onClose: () => void;
}

const KeyContractBanner: React.FC<KeyContractBannerProps> = ({
  opened,
  onClose,
}) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    { icon: <CheckCircle className="w-5 h-5" />, text: "Set your budget" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Break it into phases" },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "Release payment only when work is done",
    },
  ];

  const highlights = [
    { icon: <Shield className="w-6 h-6" />, label: "Secure", color: "#3D6B2C" },
    {
      icon: <FileText className="w-6 h-6" />,
      label: "Enforceable",
      color: "#F08C23",
    },
    { icon: <Zap className="w-6 h-6" />, label: "Digital", color: "#3D6B2C" },
  ];

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="xl"
        centered
        padding={0}
        radius="xl"
        // scrollAreaComponent="div"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 8,
        }}
        transitionProps={{
          transition: "fade",
          duration: 300,
          timingFunction: "ease-out",
        }}
        withCloseButton={false}
        styles={{
          content: {
            maxHeight: "90vh",
            overflowY: "auto",
            background: "transparent",
          },
          body: {
            padding: 0,
            maxHeight: "90vh",
            overflowY: "auto",
          },
        }}
      >
        <Transition
          mounted={opened}
          transition="slide-up"
          duration={500}
          timingFunction="cubic-bezier(0.34, 1.56, 0.64, 1)"
        >
          {(styles) => (
            <Paper
              style={styles}
              radius="xl"
              className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-orange-600 shadow-2xl border-2 border-orange-400"
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Large Gradient Orbs */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-orange-400/30 to-yellow-400/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-green-400/30 to-green-600/20 rounded-full animate-bounce"></div>
                <div className="absolute top-1/3 -right-16 w-32 h-32 bg-gradient-to-bl from-orange-300/25 to-orange-500/15 rounded-full animate-ping"></div>

                {/* Animated Particles */}
                <div className="absolute top-20 right-20 w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 left-16 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-32 right-32 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-orange-300 rounded-full animate-pulse"></div>

                {/* Geometric Shapes */}
                <div className="absolute top-16 left-1/4 w-4 h-4 bg-gradient-to-r from-orange-400/40 to-transparent rotate-45 animate-spin"></div>
                <div className="absolute bottom-24 left-1/2 w-6 h-6 bg-gradient-to-l from-green-400/30 to-transparent rotate-12 animate-pulse"></div>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>

              {/* Close Button */}
              <Button
                variant="subtle"
                size="sm"
                className="absolute top-4 right-4 z-10 hover:bg-white/20 transition-colors duration-200 !text-white hover:text-orange-200"
                onClick={onClose}
              >
                ✕
              </Button>

              <Stack gap="xl" className="p-8 relative z-10">
                {/* Header Section */}
                <div className="text-center space-y-4">
                  <Transition
                    mounted={opened}
                    transition="slide-down"
                    duration={600}
                    timingFunction="ease-out"
                  >
                    {(styles) => (
                      <div style={styles}>
                        <Badge
                          size="lg"
                          radius="xl"
                          className="mb-4 bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 !text-white font-bold px-8 py-3 shadow-2xl animate-bounce border-2 border-orange-300"
                          leftSection={
                            <Sparkles className="w-5 h-5 animate-spin" />
                          }
                        >
                          🚀 Coming Soon
                        </Badge>

                        <div className="flex items-center justify-center gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-lg animate-pulse">
                            <FileText className="w-8 h-8 !text-white" />
                          </div>
                          <Text
                            size="xl"
                            fw={900}
                            className="text-5xl !text-white drop-shadow-lg"
                          >
                            KeyContract
                          </Text>
                        </div>
                      </div>
                    )}
                  </Transition>

                  <Transition
                    mounted={opened}
                    transition="fade"
                    duration={800}
                    timingFunction="ease-out"
                  >
                    {(styles) => (
                      <Text
                        style={styles}
                        size="lg"
                        fw={700}
                        className="!text-white drop-shadow-md max-w-md mx-auto leading-relaxed"
                      >
                        Smart Contracts. Built for Construction. Backed by
                        Keyman Logic.
                      </Text>
                    )}
                  </Transition>
                </div>

                {/* Main Content */}
                <Transition
                  mounted={opened}
                  transition="slide-up"
                  duration={700}
                  timingFunction="ease-out"
                >
                  {(styles) => (
                    <Paper
                      style={styles}
                      radius="lg"
                      className="p-6 bg-gradient-to-br from-white/95 via-orange-50/90 to-green-50/95 backdrop-blur-md border-2 border-white/30 shadow-2xl"
                    >
                      <Text
                        size="lg"
                        fw={600}
                        className="text-gray-800 text-center mb-6 leading-relaxed"
                      >
                        🚫 Say goodbye to guesswork and handshake deals.
                      </Text>

                      <Text
                        size="md"
                        className="text-gray-600 text-center mb-6 leading-relaxed max-w-2xl mx-auto"
                      >
                        {`With KeyContract, you'll create secure, milestone-based
                        agreements directly with verified stores and
                        professionals—backed by escrow, dispute protection, and
                        AI-powered drafting.`}
                      </Text>

                      {/* Features List */}
                      <Stack gap="sm" className="mb-6">
                        {features.map((feature, index) => (
                          <Transition
                            key={index}
                            mounted={opened}
                            transition="slide-right"
                            duration={500 + index * 100}
                            timingFunction="ease-out"
                          >
                            {(styles) => (
                              <Group
                                style={styles}
                                gap="md"
                                className={`p-3 rounded-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border ${
                                  hoveredFeature === index
                                    ? "bg-gradient-to-r from-green-100 to-orange-50 shadow-lg border-orange-300"
                                    : "hover:bg-gradient-to-r hover:from-green-50 hover:to-orange-25 border-transparent"
                                }`}
                                onMouseEnter={() => setHoveredFeature(index)}
                                onMouseLeave={() => setHoveredFeature(null)}
                              >
                                <div className="text-green-600 p-1 bg-green-100 rounded-full shadow-sm">
                                  {feature.icon}
                                </div>
                                <Text fw={500} className="text-gray-700 flex-1">
                                  {feature.text}
                                </Text>
                              </Group>
                            )}
                          </Transition>
                        ))}
                      </Stack>
                    </Paper>
                  )}
                </Transition>

                {/* Highlights Section */}
                <Transition
                  mounted={opened}
                  transition="fade"
                  duration={900}
                  timingFunction="ease-out"
                >
                  {(styles) => (
                    <div style={styles}>
                      <Group justify="center" gap="xl" className="mb-6">
                        {highlights.map((highlight, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-110 border border-white/20"
                          >
                            <div
                              className="p-3 rounded-full shadow-lg animate-pulse"
                              style={{
                                backgroundColor: `${highlight.color}20`,
                              }}
                            >
                              <div style={{ color: highlight.color }}>
                                {highlight.icon}
                              </div>
                            </div>
                            <Text
                              size="sm"
                              fw={700}
                              className="!text-white drop-shadow-md"
                            >
                              {highlight.label}
                            </Text>
                          </div>
                        ))}
                      </Group>

                      <Text
                        size="lg"
                        fw={700}
                        className="text-center !text-white drop-shadow-lg mb-2"
                      >
                        ⚖️ Fair. 🛡️ Enforceable. 💻 Digital.
                      </Text>

                      <Text
                        size="md"
                        className="text-center !text-white drop-shadow-md max-w-lg mx-auto leading-relaxed"
                      >
                        {` Whether you're a buyer or a service provider,
                        KeyContract is your legal backup on every job—coming
                        soon to `}
                        <span className="font-bold text-yellow-200 bg-orange-600/30 px-2 py-1 rounded">
                          KeymanStores
                        </span>
                      </Text>
                    </div>
                  )}
                </Transition>

                {/* CTA Section */}
                <Transition
                  mounted={opened}
                  transition="slide-up"
                  duration={1000}
                  timingFunction="ease-out"
                >
                  {(styles) => (
                    <div style={styles}>
                      <Group justify="center" gap="md" className="mb-4 !hidden">
                        <Button
                          size="lg"
                          radius="xl"
                          className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 hover:from-orange-600 hover:via-orange-700 hover:to-yellow-600 !text-white font-bold px-10 py-4 shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-orange-300"
                          rightSection={
                            <ArrowRight className="w-6 h-6 animate-bounce" />
                          }
                          onClick={onClose}
                        >
                          🔔 Get Notified
                        </Button>

                        <Button
                          variant="outline"
                          size="lg"
                          radius="xl"
                          className="border-3 border-white !text-white hover:bg-white/20 hover:border-orange-200 font-bold px-10 py-4 transform hover:scale-110 transition-all duration-300 backdrop-blur-sm"
                          leftSection={<Users className="w-6 h-6" />}
                          onClick={onClose}
                        >
                          📚 Learn More
                        </Button>
                      </Group>

                      {/* Bottom Close Button */}
                      <Group justify="center" className="mt-6">
                        <Button
                          variant="filled"
                          size="md"
                          radius="xl"
                          className="!text-white/80 hover:!text-white hover:bg-white/10 transition-all duration-300"
                          onClick={onClose}
                        >
                          Close
                        </Button>
                      </Group>
                    </div>
                  )}
                </Transition>
              </Stack>
            </Paper>
          )}
        </Transition>
      </Modal>
    </>
  );
};

export default KeyContractBanner;
