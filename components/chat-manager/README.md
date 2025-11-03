# Chat Manager Component

A standalone, feature-rich chat component for the Keyman application with Facebook Messenger-style UI.

## Features

- ✅ Real-time messaging with long polling (5-second intervals)
- ✅ Send text messages
- ✅ Attach and send files/images
- ✅ Send files without text
- ✅ Delete messages
- ✅ Read receipts (single and bulk)
- ✅ Unread message counter badge
- ✅ Minimizable chat window
- ✅ Responsive design (mobile-friendly)
- ✅ Smooth animations and transitions
- ✅ Brand colors (Keyman green #3D6B2C and orange #F08C23)

## Installation

**Important:** This component does NOT use `react-chat-elements`. Instead, it uses a custom-built UI with Lucide React icons for better integration with your existing design system.

No additional dependencies are required beyond what's already in your project:

- `@tanstack/react-query` (already installed)
- `lucide-react` (already installed)

## Usage

```tsx
import { ChatManager } from "@/components/chat-manager";

function MyComponent() {
  return (
    <ChatManager
      chatId="chat-123"
      currentUserId={1}
      recipientName="John Doe"
      recipientAvatar="https://example.com/avatar.jpg"
    />
  );
}
```

## Props

| Prop              | Type     | Required | Description                                      |
| ----------------- | -------- | -------- | ------------------------------------------------ |
| `chatId`          | `string` | Yes      | The unique identifier for the chat               |
| `currentUserId`   | `number` | Yes      | The ID of the currently logged-in user           |
| `recipientName`   | `string` | No       | Name to display in chat header (default: "Chat") |
| `recipientAvatar` | `string` | No       | URL of recipient's avatar image                  |

## Features Breakdown

### 1. Long Polling

- Fetches new messages every 5 seconds when chat is open
- Automatically invalidates cache on new messages
- Stops polling when chat is closed

### 2. Message Sending

- **Text only**: Type and press Enter or click Send
- **Text + Attachments**: Select files and type message
- **Attachments only**: Select files without typing

### 3. File Attachments

- Click paperclip icon to select files
- Multiple files supported
- Preview selected files before sending
- Remove files from selection
- Visual file type indicators (image/document icons)

### 4. Message Actions

- **Delete**: Click trash icon on your own messages
- **Read receipts**:
  - Single check = sent
  - Double check (green) = read
- Auto-mark as read when chat is opened

### 5. UI States

- **Closed**: Floating action button with unread badge
- **Open**: Full chat window
- **Minimized**: Header only (click minimize icon)
- **Loading**: Spinner while fetching messages
- **Empty**: "No messages yet" placeholder

## API Integration

The component automatically handles:

- GET `/api/chats/{chatId}/messages` - Fetch messages
- POST `/api/chats/{chatId}/messages` - Send messages
- DELETE `/api/chats/{chatId}/messages/{messageId}` - Delete message
- POST `/api/chats/{chatId}/read-all` - Mark all as read

See `/api/chat.ts` for API function details.

## Styling

The component uses inline styles with CSS classes for animations. All styles are in `ChatManager.css` and include:

- Smooth slide-up/down animations
- Hover effects
- Loading spinners
- Custom scrollbar
- Mobile responsive breakpoints
- Brand color variables

## Mobile Support

The component is fully responsive:

- Adjusts width on small screens
- Optimized touch targets
- Smaller floating button on mobile
- Message bubbles scale appropriately

## Keyboard Shortcuts

- `Enter`: Send message
- `Shift + Enter`: New line in message

## Best Practices

1. **Wrap in QueryClientProvider**: The component uses React Query
2. **User Authentication**: Ensure `currentUserId` is accurate
3. **Chat ID**: Must be a valid chat ID from your backend
4. **Error Handling**: Errors are shown via toast notifications

## Example with User Context

```tsx
import { ChatManager } from "@/components/chat-manager";
import { useAppContext } from "@/providers/AppContext";

function ChatFeature() {
  const { user } = useAppContext();

  if (!user) return null;

  return (
    <ChatManager
      chatId="contract-chat-KMC073"
      currentUserId={user.id}
      recipientName="Supplier Name"
      recipientAvatar={user.profile_photo_url}
    />
  );
}
```

## Customization

To modify colors, edit the CSS variables in `ChatManager.css`:

```css
:root {
  --keyman-green: #3d6b2c;
  --keyman-orange: #f08c23;
  --keyman-light-green: #4a8234;
}
```

## TypeScript Support

Full TypeScript support with exported types:

- `ChatManagerProps`
- `ChatMessage`
- `ChatUser`
- `MessageAttachment`

See `/types/chat.ts` for complete type definitions.
