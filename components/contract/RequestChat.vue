<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";

// n8n webhook path
const N8N_WEBHOOK_PATH = "31202e0d-7ed4-4b6e-9368-4ae8d97302cd";

// Props
const props = defineProps({
  webhookUrl: String,
  sessionId: String,
  userToken: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    default: "user",
  },
  showEnvToggle: {
    type: Boolean,
    default: true,
  },
  baseUrlProd: {
    type: String,
    default: "https://kimari.app.n8n.cloud",
  },
  baseUrlTest: {
    type: String,
    default: "https://kimari.app.n8n.cloud",
  },
});

// Emits
const emit = defineEmits(["error", "requestSubmitted"]);

// Local storage keys
const LS_KEYS = {
  env: "request_env",
  baseUrlProd: "request_base_url_prod",
  baseUrlTest: "request_base_url_test",
  userType: "request_user_type",
};

// Local storage for chat history
const CHAT_STORAGE_PREFIX = "request_chat_history_";

// State
const messages = ref([]);
const pending = ref(false);
const chatInput = ref("");
const selectedFile = ref(null);
const imagePreviewUrl = ref("");
const showSettings = ref(false);

// Audio recording
const isRecording = ref(false);
const recordedBlob = ref(null);
const recordedUrl = ref("");
let mediaRecorder = null;
let recordedChunks = [];

// Project selection state
const selectedProjectId = ref(null);
const showProjectModal = ref(false);
const availableProjects = ref([]);

// File input ref
const fileInput = ref(null);
const chatContainer = ref(null);

// Environment and endpoint state
const env = ref(localStorage.getItem(LS_KEYS.env) || "test");
const userType = ref(localStorage.getItem(LS_KEYS.userType) || props.userType);
const baseUrlProdState = ref(
  localStorage.getItem(LS_KEYS.baseUrlProd) || props.baseUrlProd
);
const baseUrlTestState = ref(
  localStorage.getItem(LS_KEYS.baseUrlTest) || props.baseUrlTest
);

// Persist state changes
watch(env, (v) => localStorage.setItem(LS_KEYS.env, v));
watch(userType, (v) => localStorage.setItem(LS_KEYS.userType, v));
watch(baseUrlProdState, (v) => localStorage.setItem(LS_KEYS.baseUrlProd, v || ""));
watch(baseUrlTestState, (v) => localStorage.setItem(LS_KEYS.baseUrlTest, v || ""));

const isTest = computed(() => env.value === "test");
const resolvedBaseUrl = computed(() => {
  const base = (isTest.value ? baseUrlTestState.value : baseUrlProdState.value) || "";
  return base.replace(/\/$/, "");
});

// Current request state tracking
const requestState = reactive({
  stage: 1,
  currentAction: "",
  selectedItems: [],
  deliveryDate: null,
  projectData: null,
  supplierMode: null,
});

// Computed properties
const webhookUrl = computed(() => {
  if (props.webhookUrl && props.webhookUrl.trim()) return props.webhookUrl.trim();
  const base = resolvedBaseUrl.value;
  if (!base) return "";
  const segment = isTest.value ? "webhook-test" : "webhook";
  return `${base}/${segment}/${N8N_WEBHOOK_PATH}`;
});

const canSend = computed(() => {
  return (
    !!webhookUrl.value &&
    (!!chatInput.value?.trim() || !!selectedFile.value || !!recordedBlob.value)
  );
});

const selectedProject = computed(() => {
  return availableProjects.value.find((p) => p.id === selectedProjectId.value);
});

const currentSessionId = computed(() => props.sessionId || props.userToken || "");

// Chat persistence functions
function getChatStorageKey() {
  return currentSessionId.value ? `${CHAT_STORAGE_PREFIX}${currentSessionId.value}` : null;
}

function persistMessages() {
  const key = getChatStorageKey();
  if (!key) return;
  try {
    const compact = messages.value.map(
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
  } catch (_) {}
}

function restoreMessages() {
  const key = getChatStorageKey();
  if (!key) return;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      messages.value = Array.isArray(parsed) ? parsed : [];
    }
  } catch (_) {
    messages.value = [];
  }
}

function clearChat() {
  messages.value = [];
  requestState.stage = 1;
  requestState.currentAction = "";
  requestState.selectedItems = [];
  requestState.deliveryDate = null;
  requestState.projectData = null;
  requestState.supplierMode = null;
  selectedProjectId.value = null;
  persistMessages();
}

// Lifecycle
onMounted(async () => {
  restoreMessages();
  // Scroll to bottom to focus on latest messages
  await nextTick();
  scrollToBottom();
});

watch(messages, persistMessages, { deep: true });

// File handling
function onPickFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  clearRecording();
  selectedFile.value = file;
  if (file.type.startsWith("image/")) {
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
}

function removeAttachment() {
  selectedFile.value = null;
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
    imagePreviewUrl.value = "";
  }
}

// Audio recording
async function startRecording() {
  try {
    removeAttachment();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    mediaRecorder = new MediaRecorder(stream, { mimeType: mime });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mime });
      recordedBlob.value = blob;
      recordedUrl.value = URL.createObjectURL(blob);
      selectedFile.value = new File([blob], "recording.webm", { type: mime });
    };

    mediaRecorder.start();
    isRecording.value = true;
  } catch (err) {
    emit("error", "Microphone access denied or unsupported browser");
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
    isRecording.value = false;
  }
}

function clearRecording() {
  if (recordedUrl.value) URL.revokeObjectURL(recordedUrl.value);
  recordedUrl.value = "";
  recordedBlob.value = null;
}

// Chat functions
async function scrollToBottom() {
  await nextTick();
  try {
    chatContainer.value?.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: "smooth",
    });
  } catch (_) {}
}

// Markdown renderer
function renderMarkdown(md) {
  if (!md || typeof md !== "string") return "";
  // Escape HTML
  md = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Fenced code blocks
  md = md.replace(/```([\s\S]*?)```/g, (m, code) => `<pre><code>${code.trim()}</code></pre>`);
  // Inline code
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Headings
  md = md.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
         .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
         .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  // Bold/italic
  md = md.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/\*(?!\s)([^*]+)(?!\s)\*/g, '<em>$1</em>');
  md = md.replace(/_(?!\s)([^_]+)(?!\s)_/g, '<em>$1</em>');
  // Lists
  md = md.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>');
  md = md.replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/gs, (m) => `<ul>${m}</ul>`);
  md = md.replace(/^(\d+)\.\s+(.*)$/gm, '<li>$2</li>');
  // Paragraphs
  md = md.split(/\n{2,}/).map(block => {
    if (/^\s*<(h1|h2|h3|ul|ol|pre|blockquote)/.test(block)) return block;
    if (/^\s*<li>/.test(block)) return `<ul>${block}</ul>`;
    return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');
  return md;
}

// HTML sanitizer
function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml) return '';
  if (typeof window === 'undefined' || !window.document) return String(dirtyHtml);

  const allowedTags = new Set(['p','strong','em','u','s','br','ul','ol','li','blockquote','code','pre','span','a','h1','h2','h3','h4']);
  const allowedAttrs = {
    a: new Set(['href','target','rel']),
    span: new Set(['style']),
  };

  const temp = document.createElement('div');
  temp.innerHTML = dirtyHtml;

  const sanitizeNode = (node) => {
    const doc = document;
    if (node.nodeType === Node.TEXT_NODE) {
      return doc.createTextNode(node.nodeValue || '');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return doc.createDocumentFragment();
    }

    const tag = node.tagName.toLowerCase();
    const children = Array.from(node.childNodes).map(sanitizeNode);

    if (!allowedTags.has(tag)) {
      const frag = doc.createDocumentFragment();
      children.forEach((c) => frag.appendChild(c));
      return frag;
    }

    const cleanEl = doc.createElement(tag);
    const owner = allowedAttrs[tag];
    if (owner) {
      for (const attr of Array.from(node.attributes)) {
        const attrName = attr.name.toLowerCase();
        if (owner.has(attrName)) cleanEl.setAttribute(attrName, attr.value);
      }
    }

    if (tag === 'a') {
      const href = cleanEl.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
        cleanEl.removeAttribute('href');
      } else {
        cleanEl.setAttribute('target', '_blank');
        cleanEl.setAttribute('rel', 'nofollow noopener noreferrer');
      }
    }

    children.forEach((c) => cleanEl.appendChild(c));
    return cleanEl;
  };

  const wrapper = document.createElement('div');
  Array.from(temp.childNodes).forEach((child) => {
    wrapper.appendChild(sanitizeNode(child));
  });
  return wrapper.innerHTML;
}

// Main send message function
async function sendMessage(messageText = null, fileOverride = null) {
  const textToSend = messageText || chatInput.value?.trim();
  const fileToUse = fileOverride || selectedFile.value;

  if (pending.value) return;
  if (!webhookUrl.value) {
    emit("error", "Assistant endpoint is not configured.");
    return;
  }
  if (!textToSend && !fileToUse && !recordedBlob.value) return;

  // Add user message
  if (textToSend || fileToUse) {
    const userContent = textToSend || 
      `[${fileToUse?.type?.startsWith("image/") ? "Image" : "Audio"} attachment]`;
    
    // Mark previous user messages as non-resendable
    const lastUserIdx = [...messages.value].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx !== -1) {
      const absoluteIdx = messages.value.length - 1 - lastUserIdx;
      if (messages.value[absoluteIdx]) messages.value[absoluteIdx].canResend = false;
    }
    
    messages.value.push({
      id: `${Date.now()}-user`,
      role: "user",
      content: userContent,
      attachments: fileToUse
        ? [{
            type: fileToUse.type?.startsWith("image/") ? "image" : "audio",
            url: imagePreviewUrl.value || recordedUrl.value,
          }]
        : [],
      canResend: true,
      resendPayload: { text: textToSend || '', file: fileToUse || null }
    });
  }

  pending.value = true;
  await scrollToBottom();

  try {
    const form = new FormData();
    if (fileToUse) form.append("file", fileToUse);
    form.append("chatInput", textToSend || "");
    form.append("sessionId", currentSessionId.value);
    form.append("workflow", "requests"); // Always use requests workflow
    form.append("user_type", userType.value === "user" ? "CLIENT" : "SERVICE_PROVIDER");
    form.append("user_token", props.userToken || "");
    
    const res = await fetch(webhookUrl.value, { method: "POST", body: form });
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
    messages.value.push(assistantMessage);

    // Update request state
    updateRequestState(assistantMessage);
    
    // Emit event if request was submitted
    if (assistantMessage.action === 'request_items') {
      emit('requestSubmitted', assistantMessage);
    }
  } catch (err) {
    emit("error", "Failed to reach assistant. Check network connection.");
  } finally {
    pending.value = false;
    if (!messageText && !fileOverride) {
      chatInput.value = "";
      removeAttachment();
      clearRecording();
    }
    await scrollToBottom();
  }
}

function safeJsonParse(str) {
  if (typeof str !== "string") return null;
  try {
    const v = JSON.parse(str);
    if (v && (typeof v === "object" || Array.isArray(v))) return v;
  } catch (_) {}
  return null;
}

function parseAssistantResponse(payload) {
  // Normalize diverse n8n response shapes
  let output = payload;
  if (Array.isArray(payload)) {
    const first = payload[0]?.json || payload[0] || {};
    output = first.output || first;
  } else if (payload && typeof payload === "object") {
    output = payload.output || payload.json?.output || payload;
  }

  // If output is a JSON string, try parse
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

  const itemsRaw = typeof output?.items === "string" ? safeJsonParse(output.items) : output?.items;
  const projectsRaw = typeof output?.projects === "string" ? safeJsonParse(output.projects) : output?.projects;

  // Update availableProjects when projects are received
  if (Array.isArray(projectsRaw) && projectsRaw.length > 0) {
    availableProjects.value = projectsRaw;
  }

  return {
    id: `${Date.now()}-assistant`,
    role: "assistant",
    content: String(output?.content ?? output?.message ?? ""),
    action: output?.action || "message",
    items: Array.isArray(itemsRaw)
      ? itemsRaw.map((item) => ({
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
}

function updateRequestState(message) {
  requestState.currentAction = message.action;

  // Update stage based on action
  const stageMap = {
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

  if (stageMap[message.action]) {
    requestState.stage = stageMap[message.action];
  }
}

// Project selection
function selectProject(projectId) {
  selectedProjectId.value = projectId;
  requestState.projectData = availableProjects.value.find(
    (p) => p.id === projectId
  );
  showProjectModal.value = false;

  // Send project selection message
  const project = availableProjects.value.find((p) => p.id === projectId);
  if (project) {
    sendMessage(`I want to deliver to: ${project.name} (${project.address})`);
  }
}

// Item interaction functions
function toggleItemSelection(messageId, itemIndex) {
  const message = messages.value.find((m) => m.id === messageId);
  if (message?.items?.[itemIndex]) {
    message.items[itemIndex].selected = !message.items[itemIndex].selected;
    message.selectedItems = message.items.filter((item) => item.selected);
  }
}

function adjustItemQuantity(messageId, itemIndex, delta) {
  const message = messages.value.find((m) => m.id === messageId);
  if (message?.items?.[itemIndex]) {
    const item = message.items[itemIndex];
    item.desiredQuantity = Math.max(1, (item.desiredQuantity || 1) + delta);
    if (item.selected) {
      message.selectedItems = message.items.filter((i) => i.selected);
    }
  }
}

function sendSelectedItems(messageId) {
  const message = messages.value.find((m) => m.id === messageId);
  if (message?.selectedItems?.length > 0) {
    const itemsList = message.selectedItems
      .map((item) => `${item.name} (Qty: ${item.desiredQuantity})`)
      .join(", ");
    sendMessage(`Selected items: ${itemsList}`);
  }
}

// Quick actions for different stages
function sendQuickAction(action, data = null) {
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
      showProjectModal.value = true;
      break;
    default:
      if (data) {
        sendMessage(data);
      }
  }
}

// Keyboard handling
function onComposerKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (canSend.value && !pending.value) {
      sendMessage();
    }
  }
}

// Resend message
function resendMessage(message) {
  if (pending.value || !message?.resendPayload) return;
  sendMessage(message.resendPayload.text, message.resendPayload.file);
}

// Get progress percentage
const progressPercentage = computed(() => {
  return Math.round((requestState.stage / 9) * 100);
});

// Get stage label
const stageLabel = computed(() => {
  const labels = {
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
});
</script>

<template>
  <div class="w-full max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
    <!-- Header -->
    <div class="relative bg-gradient-to-r from-emerald-600 to-teal-700">
      <div class="flex items-center justify-between p-4 md:p-5 text-white">
        <div class="flex items-center gap-3">
          <div class="h-11 w-11 rounded-xl bg-white/20 backdrop-blur ring-1 ring-white/30 grid place-items-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <div class="text-lg font-bold">Request Materials</div>
            <div class="text-xs opacity-90">Powered by Keyman AI</div>
          </div>
        </div>
        
        <div class="flex items-center gap-2 flex-wrap justify-end">
          <!-- Environment Toggle -->
          <div v-if="showEnvToggle" class="bg-white/20 backdrop-blur rounded-full p-0.5 flex items-center shadow-inner">
            <button 
              @click="env='test'" 
              :class="['px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200', 
                env==='test' ? 'bg-white text-emerald-700 shadow-md' : 'text-white/90 hover:text-white']"
            >
              Test
            </button>
            <button 
              @click="env='prod'" 
              :class="['px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200', 
                env==='prod' ? 'bg-white text-emerald-700 shadow-md' : 'text-white/90 hover:text-white']"
            >
              Production
            </button>
          </div>
          
          <!-- User Type Toggle -->
          <div class="bg-white/20 backdrop-blur rounded-full p-0.5 flex items-center shadow-inner">
            <button 
              @click="userType='user'" 
              :class="['px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200', 
                userType==='user' ? 'bg-white text-emerald-700 shadow-md' : 'text-white/90 hover:text-white']"
            >
              Client
            </button>
            <button 
              @click="userType='supplier'" 
              :class="['px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200', 
                userType==='supplier' ? 'bg-white text-emerald-700 shadow-md' : 'text-white/90 hover:text-white']"
            >
              Supplier
            </button>
          </div>
          
          <!-- Settings Button -->
          <button 
            @click="showSettings = !showSettings" 
            class="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 grid place-items-center"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z"/>
            </svg>
          </button>
          
          <!-- Clear Chat Button -->
          <button 
            @click="clearChat" 
            class="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 grid place-items-center"
            title="Clear chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <transition name="slide-fade">
      <div v-show="showSettings" class="px-4 md:px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">n8n Base URL (Production)</label>
            <input 
              v-model="baseUrlProdState" 
              type="url" 
              placeholder="https://n8n.example.com" 
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm transition-colors" 
            />
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">n8n Base URL (Test)</label>
            <input 
              v-model="baseUrlTestState" 
              type="url" 
              placeholder="https://n8n.example.com" 
              class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm transition-colors" 
            />
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Session ID</label>
            <input 
              :value="currentSessionId || 'Using user token as session'" 
              disabled 
              class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 text-sm" 
            />
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1.5">Webhook URL</label>
            <input 
              :value="webhookUrl || 'Not configured'" 
              disabled 
              class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 text-xs font-mono" 
            />
          </div>
        </div>
        
        <div class="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div class="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600 mt-0.5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"/>
            </svg>
            <div class="text-xs text-emerald-800">
              <strong>Active Configuration:</strong> 
              {{ env === 'test' ? 'Test' : 'Production' }} environment • 
              {{ userType === 'user' ? 'Client' : 'Supplier' }} mode • 
              Requests workflow
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Progress Bar -->
    <div v-if="requestState.stage > 1" class="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-3 border-b">
      <div class="flex items-center gap-3">
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium text-gray-700">{{ stageLabel }}</span>
            <span class="text-xs text-gray-500">{{ progressPercentage }}%</span>
          </div>
          <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Project Display -->
    <div v-if="selectedProject" class="bg-blue-50 border-b px-6 py-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-blue-900 text-sm">{{ selectedProject.name }}</h3>
          <p class="text-blue-700 text-xs">{{ selectedProject.address }}</p>
        </div>
        <button @click="selectedProjectId = null; requestState.projectData = null;" class="text-blue-600 hover:text-blue-800">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Chat Container -->
    <div class="p-4 md:p-6 bg-gray-50">
      <div ref="chatContainer" class="h-[450px] md:h-[500px] overflow-y-auto rounded-xl bg-white p-4 space-y-4 shadow-inner">
        <!-- Empty State -->
        <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="text-sm font-medium">Ready to help you request materials</p>
          <p class="text-xs text-gray-400 mt-1">Tell me what construction materials you need</p>
        </div>

        <!-- Messages -->
        <template v-for="message in messages" :key="message.id">
          <div class="flex items-start gap-3" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
            <!-- Assistant Avatar -->
            <div v-if="message.role === 'assistant'" class="flex-shrink-0">
              <div class="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center text-xs font-bold shadow-md">
                AI
              </div>
            </div>
            
            <!-- Message Bubble -->
            <div :class="[
              'group relative max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
              message.role === 'user' 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            ]">
              <!-- Message Content -->
              <div class="prose prose-sm max-w-none">
                <span v-if="message.role === 'user'" class="whitespace-pre-wrap leading-relaxed">{{ message.content }}</span>
                <div v-else class="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0" v-html="sanitizeHtml(renderMarkdown(message.content))" />
              </div>
              
              <!-- Resend Button for User Messages -->
              <button 
                v-if="message.role === 'user' && message.canResend" 
                @click="resendMessage(message)" 
                class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-full bg-white shadow-md grid place-items-center text-emerald-600 hover:bg-emerald-50"
                title="Resend message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/>
                </svg>
              </button>
              
              <!-- Attachments -->
              <div v-if="message.attachments?.length" class="mt-3 space-y-2">
                <div v-for="(att, i) in message.attachments" :key="i">
                  <img v-if="att.type === 'image'" :src="att.url" class="rounded-lg max-h-48 object-cover w-full border border-white/20" />
                  <audio v-else-if="att.type === 'audio'" :src="att.url" controls class="w-full"></audio>
                </div>
              </div>

              <!-- Show Items Grid -->
              <div v-if="message.action === 'show_items' && message.items?.length" class="mt-4 space-y-4">
                <div class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Available Materials
                </div>
                
                <div class="grid gap-3">
                  <div
                    v-for="(item, idx) in message.items"
                    :key="idx"
                    :class="[
                      'border rounded-xl p-3 transition-all duration-200 cursor-pointer hover:shadow-md',
                      item.selected
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white',
                    ]"
                    @click="toggleItemSelection(message.id, idx)"
                  >
                    <div class="flex gap-3">
                      <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img v-if="item.photo" :src="item.photo" :alt="item.name" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                          <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                          <h4 class="font-semibold text-gray-900 text-sm">{{ item.name }}</h4>
                          <div :class="[
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            item.selected
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-300',
                          ]">
                            <svg v-if="item.selected" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ item.description }}</p>
                        
                        <div class="flex items-center justify-between mt-3">
                          <div class="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                            <button @click.stop="adjustItemQuantity(message.id, idx, -1)" class="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                              </svg>
                            </button>
                            <span class="text-sm font-medium w-8 text-center">{{ item.desiredQuantity }}</span>
                            <button @click.stop="adjustItemQuantity(message.id, idx, 1)" class="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  v-if="message.selectedItems?.length > 0"
                  @click="sendSelectedItems(message.id)"
                  class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add {{ message.selectedItems.length }} Items to Request
                </button>
              </div>

              <!-- Project Selection -->
              <div v-if="message.action === 'select_project'" class="mt-4 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-gray-700">Choose delivery location</span>
                  <button @click="sendQuickAction('show_projects')" class="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    View All Projects
                  </button>
                </div>
                
                <div class="grid gap-2 max-h-48 overflow-y-auto">
                  <div
                    v-for="project in message.projects?.length ? message.projects : availableProjects"
                    :key="project.id"
                    @click="selectProject(project.id)"
                    class="border rounded-lg p-3 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition-all bg-white"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-sm text-gray-900">{{ project.name }}</h4>
                        <div class="flex items-center gap-2 mt-1">
                          <svg class="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p class="text-xs text-gray-600">{{ project.address }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Supplier Mode Selection -->
              <div v-if="message.action === 'supplier_mode_selection'" class="mt-4 space-y-3">
                <p class="text-sm text-gray-700 mb-3">How would you like to find suppliers?</p>
                <div class="grid gap-3">
                  <button @click="sendQuickAction('get_quotes')" class="flex items-center gap-3 p-4 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all text-left bg-white">
                    <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900 text-sm">Get Multiple Quotes</h4>
                      <p class="text-xs text-gray-600">Compare prices from nearby suppliers</p>
                    </div>
                  </button>
                  
                  <button @click="sendQuickAction('use_ks_number')" class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-left bg-white">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900 text-sm">Use KS Number</h4>
                      <p class="text-xs text-gray-600">Order from a specific supplier directly</p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Final Confirmation -->
              <div v-if="message.action === 'final_confirm'" class="mt-4 space-y-4">
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="font-semibold text-green-800">Ready to Submit</h3>
                  </div>
                  <p class="text-sm text-green-700">Review your request details before submission.</p>
                </div>
                
                <div class="flex gap-3">
                  <button @click="sendQuickAction('confirm_yes')" class="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md">
                    Submit Request
                  </button>
                  <button @click="sendQuickAction('confirm_no')" class="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all">
                    Modify
                  </button>
                </div>
              </div>

              <!-- Request Submitted -->
              <div v-if="message.action === 'request_items'" class="mt-4 space-y-4">
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-semibold text-blue-800">Request Submitted Successfully!</h3>
                      <p class="text-sm text-blue-600">Your materials request is now being processed.</p>
                    </div>
                  </div>
                  
                  <div class="bg-white rounded-lg p-3 border">
                    <h4 class="font-medium text-gray-900 text-sm mb-2">Next Steps:</h4>
                    <ul class="text-xs text-gray-600 space-y-1">
                      <li>• Suppliers will receive your request within 10 minutes</li>
                      <li>• You'll get quotes/confirmations within 2-4 hours</li>
                      <li>• Payment is protected in escrow until delivery</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Generic Quick Actions -->
              <div v-if="['detect_intent', 'set_source', 'set_delivery_date'].includes(message.action)" class="mt-3">
                <div class="flex flex-wrap gap-2">
                  <button v-if="message.action === 'detect_intent'" @click="sendQuickAction('confirm_yes')" class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-200 transition-all">
                    Yes, check availability
                  </button>
                </div>
              </div>
            </div>
            
            <!-- User Avatar -->
            <div v-if="message.role === 'user'" class="flex-shrink-0">
              <div class="h-8 w-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-white grid place-items-center text-xs font-bold shadow-md">
                {{ userType === 'user' ? 'C' : 'S' }}
              </div>
            </div>
          </div>
        </template>

        <!-- Typing Indicator -->
        <div v-if="pending" class="flex items-start gap-3">
          <div class="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center text-xs font-bold shadow-md">
            AI
          </div>
          <div class="rounded-2xl px-4 py-3 bg-gray-100 shadow-sm">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Processing</span>
              <div class="flex gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Section -->
      <div class="mt-4 space-y-3">
        <!-- Attachment Preview -->
        <div v-if="imagePreviewUrl || recordedUrl" class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
          <div v-if="imagePreviewUrl" class="flex items-center gap-3">
            <img :src="imagePreviewUrl" class="h-12 w-12 object-cover rounded-lg border" />
            <span class="text-sm text-gray-600">Image attached</span>
          </div>
          <div v-if="recordedUrl && !imagePreviewUrl" class="flex items-center gap-3">
            <audio :src="recordedUrl" controls class="h-10"></audio>
            <span class="text-sm text-gray-600">Audio recorded</span>
          </div>
          <button 
            @click="removeAttachment" 
            class="ml-auto px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>

        <!-- Input Bar -->
        <div class="flex items-end gap-3">
          <div class="flex-1">
            <textarea 
              v-model="chatInput" 
              @keydown="onComposerKeydown"
              :disabled="pending"
              rows="3" 
              placeholder="Describe the materials you need... (Press Enter to send, Shift+Enter for new line)"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm resize-none transition-all duration-200 disabled:opacity-50"
            ></textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- File Upload -->
            <input ref="fileInput" type="file" accept="image/*,audio/*" class="hidden" @change="onPickFile" />
            <button 
              @click="fileInput?.click()" 
              :disabled="pending"
              class="h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 grid place-items-center transition-all duration-200 disabled:opacity-50"
              title="Attach file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6z"/>
              </svg>
            </button>
            
            <!-- Voice Recording -->
            <button 
              v-if="!isRecording" 
              @click="startRecording" 
              :disabled="pending"
              class="h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 grid place-items-center transition-all duration-200 disabled:opacity-50"
              title="Record audio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15a.998.998 0 0 0-.98-.85c-.61 0-1.09.54-1 1.14c.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78c.1-.6-.39-1.14-1-1.14"/>
              </svg>
            </button>
            
            <!-- Stop Recording -->
            <div v-else class="flex items-center gap-2">
              <button 
                @click="stopRecording" 
                class="relative h-10 w-10 rounded-full bg-red-500 text-white hover:bg-red-600 grid place-items-center transition-all duration-200 shadow-md"
                title="Stop recording"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 6h12v12H6z"/>
                </svg>
                <span class="absolute -inset-1 rounded-full bg-red-400 animate-ping opacity-75"></span>
              </button>
              <div class="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full">
                <span class="text-xs text-red-600 font-medium">Recording</span>
                <div class="flex gap-0.5">
                  <span class="w-1 h-3 bg-red-500 rounded-sm animate-pulse"></span>
                  <span class="w-1 h-4 bg-red-500 rounded-sm animate-pulse" style="animation-delay: 100ms"></span>
                  <span class="w-1 h-2 bg-red-500 rounded-sm animate-pulse" style="animation-delay: 200ms"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Send Button -->
          <button 
            :disabled="!canSend || pending" 
            @click="sendMessage()"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
          >
            <span>{{ pending ? 'Sending...' : 'Send' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M2 21l21-9L2 3v7l15 2l-15 2z"/>
            </svg>
          </button>
        </div>

        <!-- Status Bar -->
        <div class="flex items-center justify-between text-[11px] text-gray-500">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" :class="webhookUrl ? 'bg-green-500' : 'bg-gray-300'"></span>
              {{ webhookUrl ? 'Connected' : 'Not configured' }}
            </span>
            <span v-if="currentSessionId">Session: {{ currentSessionId.substring(0, 8) }}...</span>
          </div>
          <div v-if="webhookUrl" class="text-gray-400">
            {{ env === 'test' ? 'Test Mode' : 'Production' }} • {{ userType === 'user' ? 'Client' : 'Supplier' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Projects Selection Modal -->
    <teleport to="body">
      <div
        v-if="showProjectModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="showProjectModal = false"
      >
        <div class="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">Select Project</h2>
            <button @click="showProjectModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid gap-4 max-h-96 overflow-y-auto">
            <div
              v-for="project in availableProjects"
              :key="project.id"
              @click="selectProject(project.id)"
              class="border rounded-xl p-4 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all group"
            >
              <div class="flex gap-4">
                <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img v-if="project.image" :src="project.image" :alt="project.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 mb-1">{{ project.name }}</h3>
                  <p class="text-sm text-gray-600 mb-2">{{ project.description }}</p>
                  <p class="text-xs text-gray-500 mb-2">{{ project.address }}</p>
                  <div class="flex items-center gap-2">
                    <span :class="[
                      'inline-block text-xs px-2 py-1 rounded-full',
                      project.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700',
                    ]">{{ project.status }}</span>
                    <div class="flex items-center gap-1 text-xs text-gray-500">
                      <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      GPS Available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button @click="showProjectModal = false" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
/* Remove default prose margins */
.prose :where(p):not(:where([class~="not-prose"] *)) {
  margin: 0;
}

.prose :where(ul):not(:where([class~="not-prose"] *)),
.prose :where(ol):not(:where([class~="not-prose"] *)) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.prose :where(li):not(:where([class~="not-prose"] *)) {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Custom scrollbar for chat container */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>