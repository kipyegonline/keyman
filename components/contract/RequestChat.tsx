/* eslint-disable*/
//@ts-ignore

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Textarea,
  FileInput,
  Modal,
  Progress,
  SegmentedControl,
  Badge,
  Avatar,
  ActionIcon,
  ScrollArea,
  Transition,
  Box,
  Image,
  Center,
  TextInput,
  Grid,
  Container,
  Title,
  Anchor,
} from "@mantine/core";
import {
  Send,
  Paperclip,
  Mic,
  Square,
  Settings,
  Trash2,
  Package,
  Check,
  X,
  Plus,
  Minus,
  RotateCcw,
  MapPin,
  Building2,
  Clock,
  Users,
  FileText,
} from "lucide-react";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
  items?: Item[];
  projects?: Project[];
  attachments?: Attachment[];
  selectedItems?: Item[];
  userSelectedItems?: boolean;
  canResend?: boolean;
  resendPayload?: {
    text: string;
    file: File | null;
  };
}

interface Item {
  name: string;
  description: string;
  photo?: string;
  quantity?: number;
  selected: boolean;
  desiredQuantity: number;
}

interface Project {
  id: string;
  name: string;
  address: string;
  description?: string;
  image?: string;
  status?: string;
}

interface Attachment {
  type: "image" | "audio";
  url: string;
}

interface RequestState {
  stage: number;
  currentAction: string;
  selectedItems: Item[];
  deliveryDate: Date | null;
  projectData: Project | null;
  supplierMode: string | null;
}

interface RequestChatProps {
  webhookUrl?: string;
  sessionId?: string;
  userToken: string;
  userType?: "user" | "supplier";
  showEnvToggle?: boolean;
  baseUrlProd?: string;
  baseUrlTest?: string;
  onError?: (error: string) => void;
  onRequestSubmitted?: (message: Message) => void;
}

const N8N_WEBHOOK_PATH = "31202e0d-7ed4-4b6e-9368-4ae8d97302cd";

const LS_KEYS = {
  env: "request_env",
  baseUrlProd: "request_base_url_prod",
  baseUrlTest: "request_base_url_test",
  userType: "request_user_type",
};

const CHAT_STORAGE_PREFIX = "request_chat_history_";

export const RequestChat: React.FC<RequestChatProps> = ({
  webhookUrl: propWebhookUrl,
  sessionId,
  userToken,
  userType: propUserType = "user",
  showEnvToggle = true,
  baseUrlProd = "https://kimari.app.n8n.cloud",
  baseUrlTest = "https://kimari.app.n8n.cloud",
  onError,
  onRequestSubmitted,
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Project selection
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  // Environment and endpoint state
  const [env, setEnv] = useState(
    () => localStorage.getItem(LS_KEYS.env) || "test"
  );
  const [userType, setUserType] = useState(
    () => localStorage.getItem(LS_KEYS.userType) || propUserType
  );
  const [baseUrlProdState, setBaseUrlProdState] = useState(
    () => localStorage.getItem(LS_KEYS.baseUrlProd) || baseUrlProd
  );
  const [baseUrlTestState, setBaseUrlTestState] = useState(
    () => localStorage.getItem(LS_KEYS.baseUrlTest) || baseUrlTest
  );

  // Request state
  const [requestState, setRequestState] = useState<RequestState>({
    stage: 1,
    currentAction: "",
    selectedItems: [],
    deliveryDate: null,
    projectData: null,
    supplierMode: null,
  });

  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(LS_KEYS.env, env);
  }, [env]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.userType, userType);
  }, [userType]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.baseUrlProd, baseUrlProdState || "");
  }, [baseUrlProdState]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.baseUrlTest, baseUrlTestState || "");
  }, [baseUrlTestState]);

  // Computed values
  const isTest = env === "test";
  const resolvedBaseUrl = useMemo(() => {
    const base = (isTest ? baseUrlTestState : baseUrlProdState) || "";
    return base.replace(/\/$/, "");
  }, [isTest, baseUrlTestState, baseUrlProdState]);

  const webhookUrl = useMemo(() => {
    if (propWebhookUrl && propWebhookUrl.trim()) return propWebhookUrl.trim();
    const base = resolvedBaseUrl;
    if (!base) return "";
    const segment = isTest ? "webhook-test" : "webhook";
    return `${base}/${segment}/${N8N_WEBHOOK_PATH}`;
  }, [propWebhookUrl, resolvedBaseUrl, isTest]);

  const canSend = useMemo(() => {
    return !!(webhookUrl && (chatInput.trim() || selectedFile || recordedBlob));
  }, [webhookUrl, chatInput, selectedFile, recordedBlob]);

  const selectedProject = useMemo(() => {
    return availableProjects.find((p) => p.id === selectedProjectId);
  }, [availableProjects, selectedProjectId]);

  const currentSessionId = sessionId || userToken || "";

  const progressPercentage = useMemo(() => {
    return Math.round((requestState.stage / 9) * 100);
  }, [requestState.stage]);

  const stageLabel = useMemo(() => {
    const labels: Record<string, string> = {
      detect_intent: "Understanding request",
      set_source: "Setting source",
      show_items: "Selecting items",
      confirm_items: "Confirming items",
      set_delivery_date: "Setting delivery",
      select_project: "Choosing location",
      set_supplier_mode: "Supplier selection",
      final_confirm: "Final review",
      request_items: "Request submitted",
    };
    return labels[requestState.currentAction] || "Getting started";
  }, [requestState.currentAction]);

  // Chat persistence functions
  const getChatStorageKey = useCallback(() => {
    return currentSessionId
      ? `${CHAT_STORAGE_PREFIX}${currentSessionId}`
      : null;
  }, [currentSessionId]);

  const persistMessages = useCallback(
    (msgs: Message[]) => {
      const key = getChatStorageKey();
      if (!key) return;
      try {
        const compact = msgs.map(
          ({
            id,
            role,
            content,
            items,
            projects,
            action,
            selectedItems,
            userSelectedItems,
          }) => ({
            id,
            role,
            content,
            items,
            projects,
            action,
            selectedItems,
            userSelectedItems,
          })
        );
        localStorage.setItem(key, JSON.stringify(compact));
      } catch {
        // Ignore localStorage errors
      }
    },
    [getChatStorageKey]
  );

  const restoreMessages = useCallback(() => {
    const key = getChatStorageKey();
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMessages(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setMessages([]);
    }
  }, [getChatStorageKey]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setRequestState({
      stage: 1,
      currentAction: "",
      selectedItems: [],
      deliveryDate: null,
      projectData: null,
      supplierMode: null,
    });
    setSelectedProjectId(null);
    const key = getChatStorageKey();
    if (key) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [getChatStorageKey]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  }, []);

  // File handling
  const onFileChange = useCallback((file: File | null) => {
    if (!file) return;
    clearRecording();
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const removeAttachment = useCallback(() => {
    setSelectedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }
  }, [imagePreviewUrl]);

  // Audio recording
  const clearRecording = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl("");
    setRecordedBlob(null);
  }, [recordedUrl]);

  const startRecording = useCallback(async () => {
    try {
      removeAttachment();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        setSelectedFile(new File([blob], "recording.webm", { type: mime }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.log(err);
      onError?.("Microphone access denied or unsupported browser");
    }
  }, [removeAttachment, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Markdown renderer (simplified)
  const renderMarkdown = useCallback((md: string) => {
    if (!md || typeof md !== "string") return "";

    // Basic markdown rendering
    const html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/^- (.*)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/g, "<ul>$&</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(.*)$/gm, "<p>$1</p>");

    return html;
  }, []);

  // Safe JSON parse
  const safeJsonParse = useCallback((str: string | null) => {
    if (typeof str !== "string") return null;
    try {
      const v = JSON.parse(str);
      if (v && (typeof v === "object" || Array.isArray(v))) return v;
    } catch (_) {}
    return null;
  }, []);

  // Parse assistant response
  const parseAssistantResponse = useCallback(
    (payload: any): Message => {
      let output = payload;
      if (Array.isArray(payload)) {
        const first = payload[0]?.json || payload[0] || {};
        output = first.output || first;
      } else if (payload && typeof payload === "object") {
        output = payload.output || payload.json?.output || payload;
      }

      if (typeof output === "string") {
        const maybe = safeJsonParse(output);
        if (!maybe) {
          return {
            id: `${Date.now()}-assistant`,
            role: "assistant",
            content: output,
            action: "message",
            items: [],
            selectedItems: [],
            userSelectedItems: false,
          };
        }
        output = maybe;
      }

      const itemsRaw =
        typeof output?.items === "string"
          ? safeJsonParse(output.items)
          : output?.items;
      const projectsRaw =
        typeof output?.projects === "string"
          ? safeJsonParse(output.projects)
          : output?.projects;

      // Update availableProjects when projects are received
      if (Array.isArray(projectsRaw) && projectsRaw.length > 0) {
        setAvailableProjects(projectsRaw);
      }

      return {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: String(output?.content ?? output?.message ?? ""),
        action: output?.action || "message",
        items: Array.isArray(itemsRaw)
          ? itemsRaw.map((item: any) => ({
              ...item,
              selected: false,
              desiredQuantity: Math.max(1, Number(item.quantity) || 1),
            }))
          : [],
        projects: Array.isArray(projectsRaw) ? projectsRaw : [],
        selectedItems: [],
        userSelectedItems:
          output?.user_selected_items === true ||
          output?.user_selected_items === "true" ||
          output?.user_selected_items === 1,
      };
    },
    [safeJsonParse]
  );

  // Update request state
  const updateRequestState = useCallback((message: Message) => {
    const stageMap: Record<string, number> = {
      detect_intent: 1,
      set_source: 2,
      show_items: 3,
      confirm_items: 4,
      set_delivery_date: 5,
      select_project: 6,
      set_supplier_mode: 7,
      final_confirm: 8,
      request_items: 9,
    };

    setRequestState((prev) => ({
      ...prev,
      currentAction: message.action || "",
      stage: stageMap[message.action || ""] || prev.stage,
    }));
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (messageText?: string, fileOverride?: File | null) => {
      const textToSend = messageText || chatInput.trim();
      const fileToUse = fileOverride || selectedFile;

      if (pending) return;
      if (!webhookUrl) {
        onError?.("Assistant endpoint is not configured.");
        return;
      }
      if (!textToSend && !fileToUse && !recordedBlob) return;

      // Add user message
      if (textToSend || fileToUse) {
        const userContent =
          textToSend ||
          `[${
            fileToUse?.type?.startsWith("image/") ? "Image" : "Audio"
          } attachment]`;

        setMessages((prev) => {
          // Mark previous user messages as non-resendable
          const updated = prev.map((msg) =>
            msg.role === "user" ? { ...msg, canResend: false } : msg
          );

          return [
            ...updated,
            {
              id: `${Date.now()}-user`,
              role: "user" as const,
              content: userContent,
              attachments: fileToUse
                ? [
                    {
                      type: fileToUse.type?.startsWith("image/")
                        ? ("image" as const)
                        : ("audio" as const),
                      url: imagePreviewUrl || recordedUrl,
                    },
                  ]
                : [],
              canResend: true,
              resendPayload: {
                text: textToSend || "",
                file: fileToUse || null,
              },
            },
          ];
        });
      }

      setPending(true);
      scrollToBottom();

      try {
        const form = new FormData();
        if (fileToUse) form.append("file", fileToUse);
        form.append("chatInput", textToSend || "");
        form.append("sessionId", currentSessionId);
        form.append("workflow", "requests");
        form.append(
          "user_type",
          userType === "user" ? "CLIENT" : "SERVICE_PROVIDER"
        );
        form.append("user_token", userToken || "");

        const res = await fetch(webhookUrl, { method: "POST", body: form });
        const contentType = res.headers.get("content-type") || "";
        let response;

        if (contentType.includes("application/json")) {
          response = await res.json();
        } else {
          const text = await res.text();
          try {
            response = JSON.parse(text);
          } catch (_) {
            response = { action: "message", content: text, items: [] };
          }
        }

        // Parse response
        const assistantMessage = parseAssistantResponse(response);
        setMessages((prev) => [...prev, assistantMessage]);

        // Update request state
        updateRequestState(assistantMessage);

        // Emit event if request was submitted
        if (assistantMessage.action === "request_items") {
          onRequestSubmitted?.(assistantMessage);
        }
      } catch (err) {
        onError?.("Failed to reach assistant. Check network connection.");
      } finally {
        setPending(false);
        if (!messageText && !fileOverride) {
          setChatInput("");
          removeAttachment();
          clearRecording();
        }
        scrollToBottom();
      }
    },
    [
      pending,
      webhookUrl,
      chatInput,
      selectedFile,
      recordedBlob,
      onError,
      imagePreviewUrl,
      recordedUrl,
      currentSessionId,
      userType,
      userToken,
      scrollToBottom,
      parseAssistantResponse,
      updateRequestState,
      onRequestSubmitted,
      removeAttachment,
      clearRecording,
    ]
  );

  // Keyboard handling
  const onComposerKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (canSend && !pending) {
          sendMessage();
        }
      }
    },
    [canSend, pending, sendMessage]
  );

  // Item interaction functions
  const toggleItemSelection = useCallback(
    (messageId: string, itemIndex: number) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id === messageId && message.items?.[itemIndex]) {
            const updatedItems = [...message.items];
            updatedItems[itemIndex] = {
              ...updatedItems[itemIndex],
              selected: !updatedItems[itemIndex].selected,
            };
            return {
              ...message,
              items: updatedItems,
              selectedItems: updatedItems.filter((item) => item.selected),
            };
          }
          return message;
        })
      );
    },
    []
  );

  const adjustItemQuantity = useCallback(
    (messageId: string, itemIndex: number, delta: number) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id === messageId && message.items?.[itemIndex]) {
            const updatedItems = [...message.items];
            const item = updatedItems[itemIndex];
            updatedItems[itemIndex] = {
              ...item,
              desiredQuantity: Math.max(1, (item.desiredQuantity || 1) + delta),
            };
            return {
              ...message,
              items: updatedItems,
              selectedItems: item.selected
                ? updatedItems.filter((i) => i.selected)
                : message.selectedItems || [],
            };
          }
          return message;
        })
      );
    },
    []
  );

  const sendSelectedItems = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (message?.selectedItems?.length) {
        const itemsList = message.selectedItems
          .map((item) => `${item.name} (Qty: ${item.desiredQuantity})`)
          .join(", ");
        sendMessage(`Selected items: ${itemsList}`);
      }
    },
    [messages, sendMessage]
  );

  // Project selection
  const selectProject = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
      const project = availableProjects.find((p) => p.id === projectId);
      setRequestState((prev) => ({
        ...prev,
        projectData: project || null,
      }));
      setShowProjectModal(false);

      if (project) {
        sendMessage(
          `I want to deliver to: ${project.name} (${project.address})`
        );
      }
    },
    [availableProjects, sendMessage]
  );

  // Quick actions
  const sendQuickAction = useCallback(
    (action: string, data?: string) => {
      switch (action) {
        case "confirm_yes":
          sendMessage("Yes, proceed");
          break;
        case "confirm_no":
          sendMessage("No, let me change that");
          break;
        case "get_quotes":
          sendMessage("Request quotes from multiple suppliers");
          break;
        case "use_ks_number":
          sendMessage("I have a specific KS number to use");
          break;
        case "show_projects":
          setShowProjectModal(true);
          break;
        default:
          if (data) {
            sendMessage(data);
          }
      }
    },
    [sendMessage]
  );

  // Resend message
  const resendMessage = useCallback(
    (message: Message) => {
      if (pending || !message?.resendPayload) return;
      sendMessage(message.resendPayload.text, message.resendPayload.file);
    },
    [pending, sendMessage]
  );

  // Lifecycle
  useEffect(() => {
    restoreMessages();
    scrollToBottom();
  }, [restoreMessages, scrollToBottom]);

  useEffect(() => {
    persistMessages(messages);
  }, [messages, persistMessages]);

  return (
    <Container size="lg" p={0}>
      <Paper
        radius="xl"
        shadow="xl"
        style={{ overflow: "hidden", border: "1px solid #e9ecef" }}
      >
        {/* Header */}
        <Box
          style={{
            background: "linear-gradient(135deg, #3D6B2C 0%, #4CAF50 100%)",
            color: "white",
          }}
        >
          <Group justify="space-between" p="md">
            <Group gap="md">
              <Avatar
                size="lg"
                radius="xl"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <Package size={24} />
              </Avatar>
              <Box>
                <Title order={4} c="white">
                  Request Materials
                </Title>
                <Text size="xs" style={{ opacity: 0.9 }}>
                  Powered by Keyman{" "}
                </Text>
              </Box>
            </Group>

            <Group gap="xs">
              {/* Environment Toggle */}
              {showEnvToggle && (
                <SegmentedControl
                  size="xs"
                  value={env}
                  onChange={setEnv}
                  data={[
                    { label: "Test", value: "test" },
                    { label: "Production", value: "prod" },
                  ]}
                  styles={{
                    root: {
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                    },
                    indicator: {
                      background: "white",
                      color: "#3D6B2C",
                    },
                    control: {
                      color: "white",
                      "&[data-active]": {
                        color: "#3D6B2C",
                      },
                    },
                  }}
                />
              )}

              {/* User Type Toggle */}
              <SegmentedControl
                size="xs"
                value={userType}
                onChange={setUserType}
                data={[
                  { label: "Client", value: "user" },
                  { label: "Supplier", value: "supplier" },
                ]}
                styles={{
                  root: {
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                  },
                  indicator: {
                    background: "white",
                    color: "#3D6B2C",
                  },
                  control: {
                    color: "white",
                    "&[data-active]": {
                      color: "#3D6B2C",
                    },
                  },
                }}
              />

              {/* Settings Button */}
              <ActionIcon
                variant="subtle"
                color="white"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings size={20} />
              </ActionIcon>

              {/* Clear Chat Button */}
              <ActionIcon
                variant="subtle"
                color="white"
                onClick={clearChat}
                title="Clear chat"
              >
                <Trash2 size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </Box>

        {/* Settings Panel */}
        <Transition
          mounted={showSettings}
          transition="slide-down"
          duration={300}
        >
          {(styles) => (
            <Box
              // style={styles}
              bg="#f8f9fa"
              p="md"
              style={{ ...styles, borderBottom: "1px solid #e9ecef" }}
            >
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="n8n Base URL (Production)"
                    placeholder="https://n8n.example.com"
                    value={baseUrlProdState}
                    onChange={(e) => setBaseUrlProdState(e.target.value)}
                    size="sm"
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <TextInput
                    label="n8n Base URL (Test)"
                    placeholder="https://n8n.example.com"
                    value={baseUrlTestState}
                    onChange={(e) => setBaseUrlTestState(e.target.value)}
                    size="sm"
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <TextInput
                    label="Session ID"
                    value={currentSessionId || "Using user token as session"}
                    disabled
                    size="sm"
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <TextInput
                    label="Webhook URL"
                    value={webhookUrl || "Not configured"}
                    disabled
                    size="sm"
                    styles={{
                      input: { fontSize: "11px", fontFamily: "monospace" },
                    }}
                  />
                </Grid.Col>
              </Grid>

              <Paper
                mt="md"
                p="md"
                bg="#e7f5e0"
                style={{ border: "1px solid #c3e6cb" }}
              >
                <Group gap="xs">
                  <Check size={16} color="#3D6B2C" />
                  <Text size="xs" c="#3D6B2C">
                    <strong>Active Configuration:</strong>{" "}
                    {env === "test" ? "Test" : "Production"} environment •{" "}
                    {userType === "user" ? "Client" : "Supplier"} mode •
                    Requests workflow
                  </Text>
                </Group>
              </Paper>
            </Box>
          )}
        </Transition>

        {/* Progress Bar */}
        {requestState.stage > 1 && (
          <Box
            bg="linear-gradient(135deg, #e7f5e0 0%, #f0f8e7 100%)"
            p="md"
            style={{ borderBottom: "1px solid #e9ecef" }}
          >
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600} c="#3D6B2C">
                {stageLabel}
              </Text>
              <Text size="sm" c="#666">
                {progressPercentage}%
              </Text>
            </Group>
            <Progress
              value={progressPercentage}
              size="sm"
              styles={{
                root: { background: "#e9ecef" },
                section: {
                  background:
                    "linear-gradient(135deg, #3D6B2C 0%, #4CAF50 100%)",
                },
              }}
            />
          </Box>
        )}

        {/* Selected Project Display */}
        {selectedProject && (
          <Box
            bg="#e3f2fd"
            p="md"
            style={{ borderBottom: "1px solid #e9ecef" }}
          >
            <Group>
              <Avatar size="md" bg="#1976d2" radius="md">
                <Building2 size={20} />
              </Avatar>
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="sm" c="#1565c0">
                  {selectedProject.name}
                </Text>
                <Text size="xs" c="#1976d2">
                  {selectedProject.address}
                </Text>
              </Box>
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => {
                  setSelectedProjectId(null);
                  setRequestState((prev) => ({ ...prev, projectData: null }));
                }}
              >
                <X size={16} />
              </ActionIcon>
            </Group>
          </Box>
        )}

        {/* Chat Container */}
        <Box p="md" bg="#f8f9fa">
          <ScrollArea
            h={500}
            ref={chatContainerRef}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {/* Empty State */}
            {messages.length === 0 && (
              <Center h="100%">
                <Stack align="center" gap="md">
                  <Package size={64} color="#d1d5db" />
                  <Text fw={500} size="sm" c="#6b7280">
                    Ready to help you request materials
                  </Text>
                  <Text size="xs" c="#9ca3af">
                    Tell me what construction materials you need
                  </Text>
                </Stack>
              </Center>
            )}

            {/* Messages */}
            <Stack gap="md">
              {messages.map((message) => (
                <Group
                  key={message.id}
                  align="flex-start"
                  gap="md"
                  style={{
                    justifyContent:
                      message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Assistant Avatar */}
                  {message.role === "assistant" && (
                    <Avatar
                      size="sm"
                      bg="linear-gradient(135deg, #3D6B2C 0%, #4CAF50 100%)"
                      radius="xl"
                    >
                      <Text size="xs" fw={700} c="white">
                        AI
                      </Text>
                    </Avatar>
                  )}

                  {/* Message Bubble */}
                  <Paper
                    p="md"
                    radius="xl"
                    shadow="sm"
                    style={{
                      maxWidth: "75%",
                      background:
                        message.role === "user"
                          ? "linear-gradient(135deg, #3D6B2C 0%, #4CAF50 100%)"
                          : "#f1f3f4",
                      color: message.role === "user" ? "white" : "#374151",
                      position: "relative",
                    }}
                  >
                    {/* Message Content */}
                    {message.role === "user" ? (
                      <Text style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                        {message.content}
                      </Text>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(message.content),
                        }}
                        style={{
                          //@ts-expect-error
                          "& p": { margin: "0 0 8px 0" },
                          "& p:last-child": { margin: 0 },
                          "& ul": { margin: "8px 0", paddingLeft: "20px" },
                          "& li": { margin: "4px 0" },
                        }}
                      />
                    )}

                    {/* Resend Button for User Messages */}
                    {message.role === "user" && message.canResend && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="white"
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          background: "white",
                          color: "#3D6B2C",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        onClick={() => resendMessage(message)}
                        title="Resend message"
                      >
                        <RotateCcw size={14} />
                      </ActionIcon>
                    )}

                    {/* Attachments */}
                    {message.attachments?.length && (
                      <Stack gap="xs" mt="md">
                        {message.attachments.map((att, i) => (
                          <div key={i}>
                            {att.type === "image" ? (
                              <Image
                                src={att.url}
                                alt="Attachment"
                                radius="md"
                                style={{
                                  maxHeight: 200,
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <audio
                                src={att.url}
                                controls
                                style={{ width: "100%" }}
                              />
                            )}
                          </div>
                        ))}
                      </Stack>
                    )}

                    {/* Show Items Grid */}
                    {message.action === "show_items" &&
                      message.items?.length && (
                        <Stack gap="md" mt="md">
                          <Group gap="xs">
                            <Package size={16} color="#374151" />
                            <Text size="sm" fw={600} c="#374151">
                              Available Materials
                            </Text>
                          </Group>

                          <Stack gap="xs">
                            {message.items.map((item, idx) => (
                              <Paper
                                key={idx}
                                p="md"
                                radius="md"
                                style={{
                                  border: item.selected
                                    ? "2px solid #3D6B2C"
                                    : "1px solid #e5e7eb",
                                  background: item.selected
                                    ? "#f0f9ff"
                                    : "white",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onClick={() =>
                                  toggleItemSelection(message.id, idx)
                                }
                              >
                                <Group gap="md">
                                  <Box
                                    w={60}
                                    h={60}
                                    style={{
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      background: "#f3f4f6",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {item.photo ? (
                                      <Image
                                        src={item.photo}
                                        alt={item.name}
                                        w="100%"
                                        h="100%"
                                        fit="cover"
                                      />
                                    ) : (
                                      <Package size={24} color="#9ca3af" />
                                    )}
                                  </Box>

                                  <Box style={{ flex: 1 }}>
                                    <Group
                                      justify="space-between"
                                      align="flex-start"
                                    >
                                      <Text fw={600} size="sm" c="#374151">
                                        {item.name}
                                      </Text>
                                      <ActionIcon
                                        size="sm"
                                        variant="outline"
                                        color={item.selected ? "green" : "gray"}
                                        style={{
                                          border: item.selected
                                            ? "2px solid #3D6B2C"
                                            : "2px solid #d1d5db",
                                          background: item.selected
                                            ? "#3D6B2C"
                                            : "transparent",
                                        }}
                                      >
                                        {item.selected && (
                                          <Check size={12} color="white" />
                                        )}
                                      </ActionIcon>
                                    </Group>

                                    <Text
                                      size="xs"
                                      c="#6b7280"
                                      lineClamp={2}
                                      mt="xs"
                                    >
                                      {item.description}
                                    </Text>

                                    <Group justify="space-between" mt="md">
                                      <Group gap="xs">
                                        <ActionIcon
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            adjustItemQuantity(
                                              message.id,
                                              idx,
                                              -1
                                            );
                                          }}
                                        >
                                          <Minus size={12} />
                                        </ActionIcon>
                                        <Text
                                          size="sm"
                                          fw={500}
                                          w={30}
                                          ta="center"
                                        >
                                          {item.desiredQuantity}
                                        </Text>
                                        <ActionIcon
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            adjustItemQuantity(
                                              message.id,
                                              idx,
                                              1
                                            );
                                          }}
                                        >
                                          <Plus size={12} />
                                        </ActionIcon>
                                      </Group>
                                    </Group>
                                  </Box>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>

                          {(message.selectedItems?.length || 0) > 0 && (
                            <Button
                              fullWidth
                              size="md"
                              style={{
                                background:
                                  "linear-gradient(135deg, #3D6B2C 0%, #4CAF50 100%)",
                              }}
                              leftSection={<Plus size={18} />}
                              onClick={() => sendSelectedItems(message.id)}
                            >
                              Add {message.selectedItems?.length} Items to
                              Request
                            </Button>
                          )}
                        </Stack>
                      )}

                    {/* Project Selection */}
                    {message.action === "select_project" && (
                      <Stack gap="md" mt="md">
                        <Group justify="space-between">
                          <Text size="sm" fw={600} c="#374151">
                            Choose delivery location
                          </Text>
                          <Anchor
                            size="sm"
                            c="#3D6B2C"
                            onClick={() => sendQuickAction("show_projects")}
                          >
                            View All Projects
                          </Anchor>
                        </Group>

                        <Stack
                          gap="xs"
                          style={{ maxHeight: 200, overflowY: "auto" }}
                        >
                          {(message.projects?.length
                            ? message.projects
                            : availableProjects
                          ).map((project) => (
                            <Paper
                              key={project.id}
                              p="md"
                              radius="md"
                              onClick={() => selectProject(project.id)}
                              style={{
                                border: "1px solid #e5e7eb",
                                background: "white",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  borderColor: "#3D6B2C",
                                  background: "#f0f9ff",
                                },
                              }}
                            >
                              <Group gap="md">
                                <Avatar size="md" bg="#e7f5e0" radius="lg">
                                  <Building2 size={20} color="#3D6B2C" />
                                </Avatar>
                                <Box style={{ flex: 1 }}>
                                  <Text fw={600} size="sm" c="#374151">
                                    {project.name}
                                  </Text>
                                  <Group gap="xs" mt="xs">
                                    <MapPin size={12} color="#9ca3af" />
                                    <Text size="xs" c="#6b7280">
                                      {project.address}
                                    </Text>
                                  </Group>
                                </Box>
                              </Group>
                            </Paper>
                          ))}
                        </Stack>
                      </Stack>
                    )}

                    {/* Supplier Mode Selection */}
                    {message.action === "supplier_mode_selection" && (
                      <Stack gap="md" mt="md">
                        <Text size="sm" c="#374151" mb="md">
                          How would you like to find suppliers?
                        </Text>
                        <Stack gap="md">
                          <Paper
                            p="md"
                            radius="md"
                            onClick={() => sendQuickAction("get_quotes")}
                            style={{
                              border: "1px solid #3D6B2C",
                              background: "white",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                background: "#f0f9ff",
                                transform: "translateY(-1px)",
                                boxShadow: "0 4px 12px rgba(61, 107, 44, 0.15)",
                              },
                            }}
                          >
                            <Group gap="md">
                              <Avatar size="md" bg="#e7f5e0">
                                <Users size={20} color="#3D6B2C" />
                              </Avatar>
                              <Box>
                                <Text fw={600} size="sm" c="#374151">
                                  Get Multiple Quotes
                                </Text>
                                <Text size="xs" c="#6b7280">
                                  Compare prices from nearby suppliers
                                </Text>
                              </Box>
                            </Group>
                          </Paper>

                          <Paper
                            p="md"
                            radius="md"
                            onClick={() => sendQuickAction("use_ks_number")}
                            style={{
                              border: "1px solid #e5e7eb",
                              background: "white",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                background: "#f9fafb",
                                borderColor: "#d1d5db",
                              },
                            }}
                          >
                            <Group gap="md">
                              <Avatar size="md" bg="#f3f4f6">
                                <FileText size={20} color="#6b7280" />
                              </Avatar>
                              <Box>
                                <Text fw={600} size="sm" c="#374151">
                                  Use KS Number
                                </Text>
                                <Text size="xs" c="#6b7280">
                                  Order from a specific supplier directly
                                </Text>
                              </Box>
                            </Group>
                          </Paper>
                        </Stack>
                      </Stack>
                    )}

                    {/* Final Confirmation */}
                    {message.action === "final_confirm" && (
                      <Stack gap="md" mt="md">
                        <Paper
                          p="md"
                          radius="md"
                          bg="linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                          style={{ border: "1px solid #86efac" }}
                        >
                          <Group gap="xs" mb="md">
                            <Check size={20} color="#16a34a" />
                            <Text fw={600} c="#15803d">
                              Ready to Submit
                            </Text>
                          </Group>
                          <Text size="sm" c="#15803d">
                            Review your request details before submission.
                          </Text>
                        </Paper>

                        <Group>
                          <Button
                            style={{
                              flex: 1,
                              background:
                                "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                            }}
                            onClick={() => sendQuickAction("confirm_yes")}
                          >
                            Submit Request
                          </Button>
                          <Button
                            variant="outline"
                            color="gray"
                            onClick={() => sendQuickAction("confirm_no")}
                          >
                            Modify
                          </Button>
                        </Group>
                      </Stack>
                    )}

                    {/* Request Submitted */}
                    {message.action === "request_items" && (
                      <Stack gap="md" mt="md">
                        <Paper
                          p="md"
                          radius="md"
                          bg="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
                          style={{ border: "1px solid #93c5fd" }}
                        >
                          <Group gap="md" mb="md">
                            <Avatar size="md" bg="#3b82f6">
                              <Clock size={20} />
                            </Avatar>
                            <Box>
                              <Text fw={600} c="#1d4ed8">
                                Request Submitted Successfully!
                              </Text>
                              <Text size="sm" c="#2563eb">
                                Your materials request is now being processed.
                              </Text>
                            </Box>
                          </Group>

                          <Paper
                            p="md"
                            bg="white"
                            radius="md"
                            style={{ border: "1px solid #e5e7eb" }}
                          >
                            <Text fw={500} size="sm" c="#374151" mb="xs">
                              Next Steps:
                            </Text>
                            <Stack gap="xs">
                              <Text size="xs" c="#6b7280">
                                • Suppliers will receive your request within 10
                                minutes
                              </Text>
                              <Text size="xs" c="#6b7280">
                                • You&apos;ll get quotes/confirmations within
                                2-4 hours
                              </Text>
                              <Text size="xs" c="#6b7280">
                                • Payment is protected in escrow until delivery
                              </Text>
                            </Stack>
                          </Paper>
                        </Paper>
                      </Stack>
                    )}

                    {/* Generic Quick Actions */}
                    {[
                      "detect_intent",
                      "set_source",
                      "set_delivery_date",
                    ].includes(message.action || "") && (
                      <Group mt="md">
                        {message.action === "detect_intent" && (
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() => sendQuickAction("confirm_yes")}
                          >
                            Yes, check availability
                          </Button>
                        )}
                      </Group>
                    )}
                  </Paper>

                  {/* User Avatar */}
                  {message.role === "user" && (
                    <Avatar
                      size="sm"
                      bg="linear-gradient(135deg, #4b5563 0%, #374151 100%)"
                      radius="xl"
                    >
                      <Text size="xs" fw={700} c="white">
                        {userType === "user" ? "C" : "S"}
                      </Text>
                    </Avatar>
                  )}
                </Group>
              ))}

              {/* Typing Indicator */}
              {pending && (
                <Group align="flex-start" gap="md">
                  <Avatar
                    size="sm"
                    bg="linear-gradient(135deg, #3D6B2C 0%, #4CAF50 100%)"
                    radius="xl"
                  >
                    <Text size="xs" fw={700} c="white">
                      AI
                    </Text>
                  </Avatar>
                  <Paper p="md" radius="xl" shadow="sm" bg="#f1f3f4">
                    <Group gap="xs">
                      <Text size="sm" c="#6b7280">
                        Processing
                      </Text>
                      <Group gap={2}>
                        <Box
                          w={8}
                          h={8}
                          bg="#3D6B2C"
                          style={{
                            borderRadius: "50%",
                            animation: "bounce 1.4s infinite ease-in-out",
                          }}
                        />
                        <Box
                          w={8}
                          h={8}
                          bg="#3D6B2C"
                          style={{
                            borderRadius: "50%",
                            animation: "bounce 1.4s infinite ease-in-out",
                            animationDelay: "0.16s",
                          }}
                        />
                        <Box
                          w={8}
                          h={8}
                          bg="#3D6B2C"
                          style={{
                            borderRadius: "50%",
                            animation: "bounce 1.4s infinite ease-in-out",
                            animationDelay: "0.32s",
                          }}
                        />
                      </Group>
                    </Group>
                  </Paper>
                </Group>
              )}
            </Stack>
          </ScrollArea>

          {/* Input Section */}
          <Stack gap="md" mt="md">
            {/* Attachment Preview */}
            {(imagePreviewUrl || recordedUrl) && (
              <Paper p="md" radius="md" style={{ border: "1px solid #e5e7eb" }}>
                <Group>
                  {imagePreviewUrl && (
                    <Group gap="md" style={{ flex: 1 }}>
                      <Image
                        src={imagePreviewUrl}
                        alt="Preview"
                        w={48}
                        h={48}
                        radius="md"
                        fit="cover"
                      />
                      <Text size="sm" c="#6b7280">
                        Image attached
                      </Text>
                    </Group>
                  )}
                  {recordedUrl && !imagePreviewUrl && (
                    <Group gap="md" style={{ flex: 1 }}>
                      <audio
                        src={recordedUrl}
                        controls
                        style={{ height: 40 }}
                      />
                      <Text size="sm" c="#6b7280">
                        Audio recorded
                      </Text>
                    </Group>
                  )}
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={removeAttachment}
                  >
                    Remove
                  </Button>
                </Group>
              </Paper>
            )}

            {/* Input Bar */}
            <Group align="flex-end" gap="md">
              <Textarea
                placeholder="Describe the materials you need... (Press Enter to send, Shift+Enter for new line)"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={onComposerKeydown}
                disabled={pending}
                autosize
                minRows={3}
                maxRows={6}
                style={{ flex: 1 }}
                styles={{
                  input: {
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    "&:focus": {
                      borderColor: "#3D6B2C",
                      boxShadow: "0 0 0 2px rgba(61, 107, 44, 0.1)",
                    },
                  },
                }}
              />
            </Group>

            {/* Action Buttons */}
            <Group justify="space-between">
              <Group gap="xs">
                {/* File Upload */}
                <FileInput
                  accept="image/*,audio/*"
                  onChange={onFileChange}
                  style={{ display: "none" }}
                />
                <ActionIcon
                  size="lg"
                  variant="outline"
                  color="gray"
                  disabled={pending}
                  title="Attach file"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*,audio/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) onFileChange(file);
                    };
                    input.click();
                  }}
                  style={{
                    "&:hover": {
                      color: "#3D6B2C",
                      borderColor: "#3D6B2C",
                      background: "#f0f9ff",
                    },
                  }}
                >
                  <Paperclip size={20} />
                </ActionIcon>

                {/* Voice Recording */}
                {!isRecording ? (
                  <ActionIcon
                    size="lg"
                    variant="outline"
                    color="gray"
                    disabled={pending}
                    title="Record audio"
                    onClick={startRecording}
                    style={{
                      "&:hover": {
                        color: "#dc2626",
                        borderColor: "#dc2626",
                        background: "#fef2f2",
                      },
                    }}
                  >
                    <Mic size={20} />
                  </ActionIcon>
                ) : (
                  <Group gap="xs">
                    <ActionIcon
                      size="lg"
                      color="red"
                      title="Stop recording"
                      onClick={stopRecording}
                      style={{
                        background: "#dc2626",
                        animation: "pulse 2s infinite",
                      }}
                    >
                      <Square size={20} />
                    </ActionIcon>
                    <Badge color="red" variant="light">
                      Recording...
                    </Badge>
                  </Group>
                )}
              </Group>

              {/* Send Button */}
              <Button
                disabled={!canSend || pending}
                onClick={() => sendMessage()}
                size="md"
                style={{
                  background:
                    canSend && !pending
                      ? "linear-gradient(135deg, #3D6B2C 0%, #4CAF50 100%)"
                      : undefined,
                  transform: canSend && !pending ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.2s",
                }}
                rightSection={<Send size={18} />}
              >
                {pending ? "Sending..." : "Send"}
              </Button>
            </Group>

            {/* Status Bar */}
            <Group justify="space-between">
              <Group gap="md">
                <Group gap="xs">
                  <Box
                    w={8}
                    h={8}
                    style={{
                      borderRadius: "50%",
                      background: webhookUrl ? "#22c55e" : "#d1d5db",
                    }}
                  />
                  <Text size="xs" c="#6b7280">
                    {webhookUrl ? "Connected" : "Not configured"}
                  </Text>
                </Group>
                {currentSessionId && (
                  <Text size="xs" c="#6b7280">
                    Session: {currentSessionId.substring(0, 8)}...
                  </Text>
                )}
              </Group>
              {webhookUrl && (
                <Text size="xs" c="#9ca3af">
                  {env === "test" ? "Test Mode" : "Production"} •{" "}
                  {userType === "user" ? "Client" : "Supplier"}
                </Text>
              )}
            </Group>
          </Stack>
        </Box>
      </Paper>

      {/* Projects Selection Modal */}
      <Modal
        opened={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        title="Select Project"
        size="lg"
        centered
      >
        <Stack gap="md" style={{ maxHeight: 400, overflowY: "auto" }}>
          {availableProjects.map((project) => (
            <Paper
              key={project.id}
              p="md"
              radius="md"
              onClick={() => selectProject(project.id)}
              style={{
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#3D6B2C",
                  background: "#f0f9ff",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Group gap="md">
                <Box
                  w={80}
                  h={80}
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.name}
                      w="100%"
                      h="100%"
                      fit="cover"
                    />
                  ) : (
                    <Building2 size={32} color="#9ca3af" />
                  )}
                </Box>

                <Box style={{ flex: 1 }}>
                  <Text fw={600} c="#374151" mb="xs">
                    {project.name}
                  </Text>
                  <Text size="sm" c="#6b7280" mb="xs">
                    {project.description}
                  </Text>
                  <Text size="xs" c="#9ca3af" mb="xs">
                    {project.address}
                  </Text>
                  <Group gap="xs">
                    <Badge
                      size="sm"
                      color={project.status === "active" ? "green" : "yellow"}
                      variant="light"
                    >
                      {project.status}
                    </Badge>
                    <Group gap="xs">
                      <MapPin size={12} color="#9ca3af" />
                      <Text size="xs" c="#9ca3af">
                        GPS Available
                      </Text>
                    </Group>
                  </Group>
                </Box>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Modal>

      {/* Bounce Animation Styles */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Container>
  );
};

export default RequestChat;
