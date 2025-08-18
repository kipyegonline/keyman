import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ContractChat from "./ContractChat";

interface ContractChatBotProps {
  userToken: string;
  sessionId: string;
  supplierId?: string | null;
  contractId?: string | null;
  userType?: "user" | "supplier";
  onClose?: () => void;
}

const ContractChatBot: React.FC<ContractChatBotProps> = ({
  userToken,
  sessionId,
  supplierId = null,
  contractId = null,
  userType = "user",
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(!false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed bottom-4 right-4" style={{ zIndex: 999 }}>
      {/* Chat Window */}
      <div
        className={`
          absolute bottom-16 right-0  
          w-80 sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]
          max-w-[calc(100vw-2rem)]
          max-h-[85vh] sm:max-h-[80vh] md:max-h-[75vh] lg:max-h-[70vh]
          bg-white rounded-2xl shadow-2xl
          transform transition-all duration-300 ease-in-out flex flex-col
          ${
            isOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          }
          overflow-hidden
        `}
      >
        <div className="h-full overflow-auto">
          <ContractChat
            userToken={userToken}
            sessionId={sessionId}
            supplierId={supplierId}
            contractId={contractId}
            userType={userType}
            onClose={handleClose}
          />
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={toggleChatbot}
        className={`
          w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#3D6B2C] to-[#388E3C] text-white rounded-full shadow-lg
          flex items-center justify-center transition-all duration-300 hover:scale-110
          ${isOpen ? "rotate-90" : "rotate-0"}
        `}
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>
    </div>
  );
};

export default ContractChatBot;
