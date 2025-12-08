"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  TextInput,
  Group,
  Stack,
  Paper,
  ThemeIcon,
  Badge,
  Box,
} from "@mantine/core";
import {
  Factory,
  MapPin,
  Bell,
  Sparkles,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  Building2,
  Truck,
  Wrench,
} from "lucide-react";
import styles from "./page.module.css";

export default function FactoryPageComponent() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = () => {
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail("");
      }, 2000);
    }
  };

  const features = [
    {
      icon: MapPin,
      title: "Location-Based Discovery",
      description: "Find factories within your preferred radius",
      color: "#3D6B2C",
    },
    {
      icon: Building2,
      title: "Verified Manufacturers",
      description: "Connect with trusted, verified factories",
      color: "#F08C23",
    },
    {
      icon: Truck,
      title: "Direct Delivery",
      description: "Get materials delivered straight to your site",
      color: "#3D6B2C",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "All products meet industry standards",
      color: "#F08C23",
    },
  ];

  const stats = [
    { value: "50+", label: "Factories Ready" },
    { value: "1000+", label: "Products Listed" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Animated Background */}
      <div className={styles.backgroundPattern}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
        <div className={styles.gridPattern} />
      </div>

      {/* Floating Elements */}
      <div className={styles.floatingElements}>
        <div className={`${styles.floatingIcon} ${styles.float1}`}>
          <Factory size={24} />
        </div>
        <div className={`${styles.floatingIcon} ${styles.float2}`}>
          <Wrench size={20} />
        </div>
        <div className={`${styles.floatingIcon} ${styles.float3}`}>
          <Building2 size={22} />
        </div>
        <div className={`${styles.floatingIcon} ${styles.float4}`}>
          <Truck size={20} />
        </div>
        <div className={`${styles.floatingIcon} ${styles.float5}`}>
          <MapPin size={18} />
        </div>
      </div>

      <Container size="lg" className={styles.container}>
        {/* Hero Section */}
        <div
          className={`${styles.heroSection} ${mounted ? styles.visible : ""}`}
        >
          {/* Badge */}
          <div className={styles.badgeWrapper}>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "#3D6B2C", to: "#4CAF50" }}
              className={styles.comingSoonBadge}
              leftSection={<Sparkles size={14} />}
            >
              COMING SOON
            </Badge>
          </div>

          {/* Main Icon */}
          <div className={styles.mainIconWrapper}>
            <div className={styles.iconPulseRing} />
            <div className={styles.iconPulseRing2} />
            <div className={styles.iconPulseRing3} />
            <ThemeIcon
              size={120}
              radius="xl"
              variant="gradient"
              gradient={{ from: "#3D6B2C", to: "#4CAF50" }}
              className={styles.mainIcon}
            >
              <Factory size={60} strokeWidth={1.5} />
            </ThemeIcon>
          </div>

          {/* Title */}
          <Title order={1} className={styles.mainTitle}>
            <span className={styles.titleGradient}>Factories</span> Near Me
          </Title>

          <Text size="xl" className={styles.subtitle}>
            Discover local manufacturing partners for your construction
            projects.
            <br />
            <span className={styles.highlightText}>
              Direct from factory. Better prices. Faster delivery.
            </span>
          </Text>

          {/* Stats */}
          <div className={styles.statsContainer}>
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={styles.statItem}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <Text className={styles.statValue}>{stat.value}</Text>
                <Text className={styles.statLabel}>{stat.label}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div
          className={`${styles.featuresSection} ${
            mounted ? styles.visible : ""
          }`}
        >
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Paper
                key={feature.title}
                className={`${styles.featureCard} ${
                  activeFeature === index ? styles.activeFeature : ""
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
                onClick={() => setActiveFeature(index)}
              >
                <div
                  className={styles.featureIconWrapper}
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon size={28} color={feature.color} />
                </div>
                <Text fw={600} size="md" className={styles.featureTitle}>
                  {feature.title}
                </Text>
                <Text
                  size="sm"
                  c="dimmed"
                  className={styles.featureDescription}
                >
                  {feature.description}
                </Text>
                <div
                  className={styles.featureGlow}
                  style={{ background: `${feature.color}20` }}
                />
              </Paper>
            ))}
          </div>
        </div>

        {/* Notification Section */}
        <Paper
          className={`${styles.notifySection} ${mounted ? styles.visible : ""}`}
        >
          <div className={styles.notifyContent}>
            <Group gap="sm" className={styles.notifyHeader}>
              <ThemeIcon size={40} radius="md" variant="light" color="orange">
                <Bell size={22} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">
                  Be the First to Know
                </Text>
                <Text size="sm" c="dimmed">
                  Get notified when we launch in your area
                </Text>
              </div>
            </Group>

            {!isSubscribed ? (
              <div className={styles.inputWrapper}>
                <TextInput
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  radius="xl"
                  className={styles.emailInput}
                  leftSection={<Zap size={18} className={styles.inputIcon} />}
                />
                <Button
                  size="lg"
                  radius="xl"
                  className={styles.notifyButton}
                  onClick={handleSubscribe}
                  rightSection={<ArrowRight size={18} />}
                >
                  Notify Me
                </Button>
              </div>
            ) : (
              <div className={styles.successMessage}>
                <CheckCircle size={24} className={styles.successIcon} />
                <Text fw={600}>
                  You&apos;re on the list! We&apos;ll notify you soon.
                </Text>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className={styles.notifyDecor1} />
          <div className={styles.notifyDecor2} />
        </Paper>

        {/* Bottom CTA */}
        <div
          className={`${styles.bottomSection} ${mounted ? styles.visible : ""}`}
        >
          <Group gap="xs" className={styles.launchInfo}>
            <Clock size={16} />
            <Text size="sm" c="dimmed">
              Estimated launch: Q1 2025
            </Text>
          </Group>
        </div>
      </Container>
    </div>
  );
}
