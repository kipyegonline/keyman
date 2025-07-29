import React, { useState, useEffect } from "react";
import {
  Shield,
  Building2,
  CheckCircle,
  FileText,
  Sparkles,
} from "lucide-react";

interface SupplierRegistrationLoadingProps {
  loadingStep?: "checking" | "preparing" | "ready";
  onComplete?: () => void;
}

const SupplierRegistrationLoading: React.FC<
  SupplierRegistrationLoadingProps
> = ({ loadingStep = "checking", onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  const loadingSteps = [
    {
      id: "checking",
      icon: <Shield className="w-6 h-6" />,
      title: "Checking Account Status",
      description: "Verifying if you already have a supplier account...",
      color: "#3D6B2C",
    },
    {
      id: "preparing",
      icon: <FileText className="w-6 h-6" />,
      title: "Preparing Registration Form",
      description: "Setting up your registration experience...",
      color: "#F08C23",
    },
    {
      id: "ready",
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Almost Ready",
      description: "Finalizing everything for you...",
      color: "#388E3C",
    },
  ];

  useEffect(() => {
    setShowContent(true);

    // Simulate loading progression
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Step progression based on loadingStep prop
    const stepMap = { checking: 0, preparing: 1, ready: 2 };
    setCurrentStep(stepMap[loadingStep] || 0);

    return () => clearInterval(progressInterval);
  }, [loadingStep, onComplete]);

  const currentStepData = loadingSteps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div
        className={`w-full max-w-lg transition-all duration-600 transform ${
          showContent
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-8 opacity-0 scale-95"
        }`}
      >
        <div className="p-8 shadow-2xl rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-100 to-orange-100 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-orange-100 to-green-100 rounded-full opacity-40 animate-bounce"></div>
            <div className="absolute top-1/2 right-8 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-8 relative z-10">
            {/* Header */}
            <div className="text-center">
              <div
                className={`flex items-center justify-center gap-4 mb-4 transition-all duration-800 transform ${
                  showContent ? "scale-100 opacity-100" : "scale-75 opacity-0"
                }`}
              >
                <div className="p-3 bg-gradient-to-r from-green-600 to-green-700 rounded-full shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#3D6B2C]">
                    Keyman Network
                  </h1>
                  <p className="text-sm text-gray-600">Supplier Registration</p>
                </div>
              </div>
            </div>

            {/* Current Step Display */}
            <div
              className={`transition-all duration-1000 transform ${
                showContent
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="p-6 bg-gradient-to-r from-green-50 to-orange-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="p-3 rounded-full shadow-md animate-pulse"
                    style={{ backgroundColor: `${currentStepData.color}20` }}
                  >
                    <div style={{ color: currentStepData.color }}>
                      {currentStepData.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">
                      {currentStepData.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {currentStepData.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: currentStepData.color,
                        backgroundImage:
                          "linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)",
                        backgroundSize: "1rem 1rem",
                        animation: "progress-animation 1s linear infinite",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Indicators */}
            <div
              className={`transition-all duration-1200 transform ${
                showContent
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex justify-center gap-8">
                {loadingSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center gap-2 transition-all duration-500 ${
                      index <= currentStep
                        ? "opacity-100 scale-100"
                        : "opacity-40 scale-95"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full border-2 transition-all duration-300 ${
                        index === currentStep
                          ? "animate-pulse shadow-lg"
                          : index < currentStep
                          ? "bg-green-100 border-green-300"
                          : "border-gray-200"
                      }`}
                      style={{
                        borderColor:
                          index <= currentStep ? step.color : "#e5e7eb",
                        backgroundColor:
                          index === currentStep
                            ? `${step.color}20`
                            : "transparent",
                      }}
                    >
                      <div
                        style={{
                          color: index <= currentStep ? step.color : "#9ca3af",
                        }}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          React.cloneElement(step.icon, {
                            className: "w-4 h-4",
                          })
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs text-center transition-colors duration-300 ${
                        index <= currentStep ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {step.title.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading Animation */}
            <div
              className={`transition-all duration-1400 transform ${
                showContent ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex justify-center items-center gap-2 text-gray-500">
                <div
                  className="w-4 h-4 rounded-full animate-spin border-2 border-transparent"
                  style={{
                    borderTopColor: currentStepData.color,
                    borderRightColor: currentStepData.color,
                  }}
                ></div>
                <span className="text-sm animate-pulse">Please wait...</span>
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
            </div>

            {/* Additional Info */}
            {progress > 80 && (
              <div
                className={`transition-all duration-400 transform ${
                  progress > 80
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600">
                    🎉 Your registration experience is being optimized for the
                    best possible journey!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-animation {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 1rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SupplierRegistrationLoading;
