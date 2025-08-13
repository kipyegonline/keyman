"use client";
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
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Stepper,
  Container,
  Title,
  Progress,
  Divider,
  Chip,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  Shield,
  Users,
  CheckCircle,
  Sparkles,
  ArrowRight,
  FileText,
  Zap,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Info,
  Lock,
  Building,
  User,
  FileCheck,
  AlertCircle,
  Briefcase,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

const CustomerContractCreation: React.FC = () => {
  const [active, setActive] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showKeyContractInfo, setShowKeyContractInfo] = useState(false);

  // Form states
  const [contractType, setContractType] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [totalBudget, setTotalBudget] = useState<number | undefined>();
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", title: "", description: "", amount: 0, dueDate: "" },
  ]);
  const [serviceProvider, setServiceProvider] = useState("");

  const contractTypes = [
    { value: "construction", label: "🏗️ Construction & Renovation" },
    { value: "plumbing", label: "🔧 Plumbing Services" },
    { value: "electrical", label: "⚡ Electrical Work" },
    { value: "painting", label: "🎨 Painting & Decoration" },
    { value: "landscaping", label: "🌳 Landscaping" },
    { value: "other", label: "📋 Other Services" },
  ];

  const nextStep = () =>
    setActive((current) => (current < 4 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: Date.now().toString(),
        title: "",
        description: "",
        amount: 0,
        dueDate: "",
      },
    ]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: any) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const calculateProgress = () => {
    const totalAmount = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    return totalBudget ? (totalAmount / totalBudget) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-orange-600">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-yellow-400/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-green-400/20 to-green-600/10 rounded-full animate-bounce"></div>
      </div>

      <Container size="xl" className="relative z-10 py-8">
        {/* Header */}
        <Paper
          radius="xl"
          className="p-6 mb-8 bg-white/95 backdrop-blur-md shadow-2xl"
        >
          <Group justify="space-between" align="center">
            <div>
              <Group gap="md" align="center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <Title order={2} className="text-gray-800">
                    Create Your Contract
                  </Title>
                  <Text size="sm" className="text-gray-600">
                    Secure, milestone-based agreements with KeyContract
                  </Text>
                </div>
              </Group>
            </div>
            <Button
              variant="light"
              color="orange"
              leftSection={<Info className="w-4 h-4" />}
              onClick={() => setShowKeyContractInfo(true)}
              className="hover:scale-105 transition-transform"
            >
              About KeyContract
            </Button>
          </Group>
        </Paper>

        {/* Progress Bar */}
        <Paper radius="lg" className="p-4 mb-6 bg-white/90 backdrop-blur-md">
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600} className="text-gray-700">
              Contract Progress
            </Text>
            <Badge color="green" variant="filled">
              Step {active + 1} of 5
            </Badge>
          </Group>
          <Progress
            value={(active + 1) * 20}
            color="green"
            size="lg"
            radius="xl"
            className="shadow-sm"
          />
        </Paper>

        {/* Stepper */}
        <Paper
          radius="xl"
          className="p-8 bg-white/95 backdrop-blur-md shadow-2xl"
        >
          <Stepper
            active={active}
            onStepClick={setActive}
            color="green"
            size="sm"
            className="mb-8"
          >
            <Stepper.Step
              label="Contract Type"
              description="Select service category"
              icon={<Briefcase className="w-5 h-5" />}
            >
              <Transition
                mounted={active === 0}
                transition="slide-up"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <div style={styles}>
                    <Stack gap="lg">
                      <div>
                        <Text
                          fw={600}
                          size="lg"
                          mb="md"
                          className="text-gray-800"
                        >
                          What type of service do you need?
                        </Text>
                        <Select
                          label="Service Category"
                          placeholder="Choose a category"
                          data={contractTypes}
                          value={contractType}
                          onChange={setContractType}
                          size="md"
                          radius="lg"
                          required
                          leftSection={<Briefcase className="w-4 h-4" />}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {contractTypes.map((type) => (
                          <Paper
                            key={type.value}
                            p="md"
                            radius="lg"
                            className={`cursor-pointer transition-all duration-300 border-2 ${
                              contractType === type.value
                                ? "border-green-500 bg-green-50 scale-105"
                                : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                            }`}
                            onClick={() => setContractType(type.value)}
                          >
                            <Text align="center" size="sm" fw={500}>
                              {type.label}
                            </Text>
                          </Paper>
                        ))}
                      </div>
                    </Stack>
                  </div>
                )}
              </Transition>
            </Stepper.Step>

            <Stepper.Step
              label="Project Details"
              description="Describe your project"
              icon={<FileText className="w-5 h-5" />}
            >
              <Transition
                mounted={active === 1}
                transition="slide-up"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <div style={styles}>
                    <Stack gap="lg">
                      <TextInput
                        label="Project Title"
                        placeholder="e.g., Kitchen Renovation"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        size="md"
                        radius="lg"
                        required
                        leftSection={<FileText className="w-4 h-4" />}
                      />

                      <Textarea
                        label="Project Description"
                        placeholder="Describe the work to be done..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        minRows={4}
                        size="md"
                        radius="lg"
                        required
                      />

                      <NumberInput
                        label="Total Budget"
                        placeholder="Enter total project budget"
                        value={totalBudget}
                        onChange={(value) => setTotalBudget(value as number)}
                        prefix="$"
                        thousandSeparator=","
                        size="md"
                        radius="lg"
                        required
                        leftSection={<DollarSign className="w-4 h-4" />}
                      />
                    </Stack>
                  </div>
                )}
              </Transition>
            </Stepper.Step>

            <Stepper.Step
              label="Milestones"
              description="Break into phases"
              icon={<CheckCircle className="w-5 h-5" />}
            >
              <Transition
                mounted={active === 2}
                transition="slide-up"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <div style={styles}>
                    <Stack gap="lg">
                      <Group justify="space-between">
                        <div>
                          <Text fw={600} size="lg" className="text-gray-800">
                            Define Payment Milestones
                          </Text>
                          <Text size="sm" className="text-gray-600">
                            Break your project into phases with specific
                            deliverables
                          </Text>
                        </div>
                        <Button
                          variant="light"
                          color="green"
                          leftSection={<Plus className="w-4 h-4" />}
                          onClick={addMilestone}
                        >
                          Add Milestone
                        </Button>
                      </Group>

                      {totalBudget && (
                        <Paper
                          p="md"
                          radius="lg"
                          className="bg-gradient-to-r from-green-50 to-orange-50"
                        >
                          <Group justify="space-between">
                            <Text size="sm" fw={500}>
                              Budget Allocation
                            </Text>
                            <Text
                              size="sm"
                              fw={600}
                              color={
                                calculateProgress() === 100 ? "green" : "orange"
                              }
                            >
                              $
                              {milestones
                                .reduce((sum, m) => sum + (m.amount || 0), 0)
                                .toLocaleString()}{" "}
                              / ${totalBudget.toLocaleString()}
                            </Text>
                          </Group>
                          <Progress
                            value={calculateProgress()}
                            color={
                              calculateProgress() === 100 ? "green" : "orange"
                            }
                            size="sm"
                            radius="xl"
                            mt="xs"
                          />
                        </Paper>
                      )}

                      <Stack gap="md">
                        {milestones.map((milestone, index) => (
                          <Paper
                            key={milestone.id}
                            p="lg"
                            radius="lg"
                            className="border-2 border-gray-200 hover:border-green-300 transition-all duration-300"
                          >
                            <Group justify="space-between" mb="md">
                              <Badge color="green" variant="light">
                                Milestone {index + 1}
                              </Badge>
                              {milestones.length > 1 && (
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  onClick={() => removeMilestone(milestone.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </ActionIcon>
                              )}
                            </Group>

                            <Stack gap="sm">
                              <TextInput
                                label="Milestone Title"
                                placeholder="e.g., Foundation Complete"
                                value={milestone.title}
                                onChange={(e) =>
                                  updateMilestone(
                                    milestone.id,
                                    "title",
                                    e.target.value
                                  )
                                }
                                required
                              />

                              <Textarea
                                label="Description"
                                placeholder="Describe what will be delivered..."
                                value={milestone.description}
                                onChange={(e) =>
                                  updateMilestone(
                                    milestone.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                minRows={2}
                              />

                              <Group grow>
                                <NumberInput
                                  label="Amount"
                                  placeholder="0"
                                  value={milestone.amount}
                                  onChange={(value) =>
                                    updateMilestone(
                                      milestone.id,
                                      "amount",
                                      value
                                    )
                                  }
                                  prefix="$"
                                  thousandSeparator=","
                                  required
                                />

                                <TextInput
                                  label="Due Date"
                                  type="date"
                                  value={milestone.dueDate}
                                  onChange={(e) =>
                                    updateMilestone(
                                      milestone.id,
                                      "dueDate",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </Group>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Stack>
                  </div>
                )}
              </Transition>
            </Stepper.Step>

            <Stepper.Step
              label="Service Provider"
              description="Select professional"
              icon={<Users className="w-5 h-5" />}
            >
              <Transition
                mounted={active === 3}
                transition="slide-up"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <div style={styles}>
                    <Stack gap="lg">
                      <div>
                        <Text
                          fw={600}
                          size="lg"
                          mb="md"
                          className="text-gray-800"
                        >
                          Choose Your Service Provider
                        </Text>
                        <Text size="sm" className="text-gray-600 mb-4">
                          Select from verified professionals on KeymanStores
                        </Text>
                      </div>

                      <Select
                        label="Service Provider"
                        placeholder="Search for a professional..."
                        data={[
                          {
                            value: "john-construction",
                            label: "John's Construction Co. ⭐ 4.8",
                          },
                          {
                            value: "premier-renovations",
                            label: "Premier Renovations ⭐ 4.9",
                          },
                          {
                            value: "quality-builders",
                            label: "Quality Builders Inc. ⭐ 4.7",
                          },
                        ]}
                        value={serviceProvider}
                        onChange={setServiceProvider}
                        size="md"
                        radius="lg"
                        searchable
                        leftSection={<Building className="w-4 h-4" />}
                      />

                      <Paper
                        p="md"
                        radius="lg"
                        className="bg-blue-50 border-2 border-blue-200"
                      >
                        <Group gap="sm">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <div>
                            <Text size="sm" fw={600} className="text-blue-900">
                              Verified Professionals Only
                            </Text>
                            <Text size="xs" className="text-blue-700">
                              All service providers are verified and insured
                              through KeymanStores
                            </Text>
                          </div>
                        </Group>
                      </Paper>
                    </Stack>
                  </div>
                )}
              </Transition>
            </Stepper.Step>

            <Stepper.Step
              label="Review & Submit"
              description="Finalize contract"
              icon={<FileCheck className="w-5 h-5" />}
            >
              <Transition
                mounted={active === 4}
                transition="slide-up"
                duration={400}
                timingFunction="ease"
              >
                {(styles) => (
                  <div style={styles}>
                    <Stack gap="lg">
                      <div>
                        <Text
                          fw={600}
                          size="lg"
                          mb="md"
                          className="text-gray-800"
                        >
                          Contract Summary
                        </Text>
                      </div>

                      <Paper
                        p="lg"
                        radius="lg"
                        className="bg-gradient-to-r from-green-50 to-orange-50"
                      >
                        <Stack gap="md">
                          <Group justify="space-between">
                            <Text fw={500}>Contract Type:</Text>
                            <Text>
                              {
                                contractTypes.find(
                                  (t) => t.value === contractType
                                )?.label
                              }
                            </Text>
                          </Group>

                          <Divider />

                          <Group justify="space-between">
                            <Text fw={500}>Project Title:</Text>
                            <Text>{projectTitle || "Not specified"}</Text>
                          </Group>

                          <Group justify="space-between">
                            <Text fw={500}>Total Budget:</Text>
                            <Text fw={600} color="green">
                              ${totalBudget?.toLocaleString() || 0}
                            </Text>
                          </Group>

                          <Group justify="space-between">
                            <Text fw={500}>Number of Milestones:</Text>
                            <Text>{milestones.length}</Text>
                          </Group>

                          <Group justify="space-between">
                            <Text fw={500}>Service Provider:</Text>
                            <Text>{serviceProvider || "Not selected"}</Text>
                          </Group>
                        </Stack>
                      </Paper>

                      <Paper
                        p="md"
                        radius="lg"
                        className="bg-orange-50 border-2 border-orange-200"
                      >
                        <Group gap="sm">
                          <Lock className="w-5 h-5 text-orange-600" />
                          <div>
                            <Text
                              size="sm"
                              fw={600}
                              className="text-orange-900"
                            >
                              Secure Escrow Protection
                            </Text>
                            <Text size="xs" className="text-orange-700">
                              Funds will be held in escrow and released only
                              upon milestone completion
                            </Text>
                          </div>
                        </Group>
                      </Paper>

                      <Group justify="center" mt="xl">
                        <Button
                          size="lg"
                          radius="xl"
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          leftSection={<CheckCircle className="w-5 h-5" />}
                          rightSection={<Sparkles className="w-5 h-5" />}
                        >
                          Create Contract
                        </Button>
                      </Group>
                    </Stack>
                  </div>
                )}
              </Transition>
            </Stepper.Step>

            <Stepper.Completed>
              <div className="text-center py-8">
                <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <Title order={3} className="text-gray-800 mb-2">
                  Contract Created Successfully!
                </Title>
                <Text className="text-gray-600">
                  Your contract has been sent to the service provider for review
                </Text>
              </div>
            </Stepper.Completed>
          </Stepper>

          {/* Navigation Buttons */}
          {active < 5 && (
            <Group justify="space-between" mt="xl">
              <Button
                variant="light"
                onClick={prevStep}
                disabled={active === 0}
                leftSection={<ArrowRight className="w-4 h-4 rotate-180" />}
              >
                Previous
              </Button>
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-green-500 to-green-600"
                rightSection={<ArrowRight className="w-4 h-4" />}
              >
                {active === 4 ? "Submit" : "Next"}
              </Button>
            </Group>
          )}
        </Paper>
      </Container>

      {/* KeyContract Info Modal */}
      <Modal
        opened={showKeyContractInfo}
        onClose={() => setShowKeyContractInfo(false)}
        size="lg"
        title="About KeyContract"
        centered
        radius="xl"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 8,
        }}
      >
        <Stack gap="lg">
          <div className="text-center">
            <Badge
              size="lg"
              radius="xl"
              className="mb-4 bg-gradient-to-r from-orange-400 to-yellow-400"
            >
              🚀 Coming Soon
            </Badge>
            <Title order={3} className="mb-2">
              KeyContract
            </Title>
            <Text fw={600}>
              Smart Contracts. Built for Construction. Backed by Keyman Logic.
            </Text>
          </div>

          <Paper p="md" radius="lg" className="bg-green-50">
            <Text fw={600} mb="sm">
              🚫 Say goodbye to guesswork and handshake deals
            </Text>
            <Text size="sm">
              With KeyContract, you'll create secure, milestone-based agreements
              directly with verified stores and professionals—backed by escrow,
              dispute protection, and AI-powered drafting.
            </Text>
          </Paper>

          <Stack gap="xs">
            <Group gap="sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Text>Set your budget</Text>
            </Group>
            <Group gap="sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Text>Break it into phases</Text>
            </Group>
            <Group gap="sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Text>Release payment only when work is done</Text>
            </Group>
          </Stack>

          <Group justify="center" gap="xl">
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-1" />
              <Text size="sm" fw={600}>
                Secure
              </Text>
            </div>
            <div className="text-center">
              <FileText className="w-8 h-8 text-orange-600 mx-auto mb-1" />
              <Text size="sm" fw={600}>
                Enforceable
              </Text>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-1" />
              <Text size="sm" fw={600}>
                Digital
              </Text>
            </div>
          </Group>

          <Text align="center" fw={600}>
            ⚖️ Fair. 🛡️ Enforceable. 💻 Digital.
          </Text>

          <Text size="sm" align="center">
            Whether you're a buyer or a service provider, KeyContract is your
            legal backup on every job—coming soon to KeymanStores
          </Text>
        </Stack>
      </Modal>
    </div>
  );
};

export default CustomerContractCreation;
