"use client";
import React, { useState, useRef } from "react";
import { useForm } from "@mantine/form";
import {
  Modal,
  Button,
  Group,
  //TextInput,
  FileInput,
  //Paper,
  //Title,
  Text,
  Grid,
  Card,
  Image,
  ActionIcon,
  Alert,
  Progress,
  Box,
} from "@mantine/core";
import {
  Upload,
  X,
  //CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Camera,
} from "lucide-react";
import { sendKYC } from "@/api/wallet";
import { notify } from "@/lib/notifications";
import { toDataUrlFromFile } from "@/lib/FileHandlers";

interface KYCResubmissionModalProps {
  opened: boolean;
  onClose: () => void;
  idType?: string;
}

interface KYCFormData {
  frontSidePhoto: File | null;
  backSidePhoto: File | null;
  selfiePhoto: File | null;
}

const getIdLabels = (idType: string) => {
  switch (idType) {
    case "101": // National ID
      return {
        idNumber: "National ID Number",
        frontPhoto: "National ID Front Side Photo",
        backPhoto: "National ID Back Side Photo",
        showBackPhoto: true,
      };
    case "102": // Alien ID
      return {
        idNumber: "Alien ID Number",
        frontPhoto: "Alien ID Front Side Photo",
        backPhoto: "Alien ID Back Side Photo",
        showBackPhoto: true,
      };
    case "103": // Passport
      return {
        idNumber: "Passport Number",
        frontPhoto: "Passport Photo",
        backPhoto: "",
        showBackPhoto: false,
      };
    default:
      return {
        idNumber: "ID Number",
        frontPhoto: "ID Front Side Photo",
        backPhoto: "ID Back Side Photo",
        showBackPhoto: true,
      };
  }
};

export default function KYCResubmissionModal({
  opened,
  onClose,
  idType = "101",
}: KYCResubmissionModalProps) {
  const [photoPreview, setPhotoPreview] = useState<{ [key: string]: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [currentField, setCurrentField] = useState<keyof KYCFormData | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const idLabels = getIdLabels(idType);

  const form = useForm<KYCFormData>({
    initialValues: {
      frontSidePhoto: null,
      backSidePhoto: null,
      selfiePhoto: null,
    },
    validate: {
      frontSidePhoto: (value) =>
        !value ? "Front side photo is required" : null,
      backSidePhoto: (value) =>
        idType !== "103" && !value ? "Back side photo is required" : null,
      selfiePhoto: (value) => (!value ? "Selfie photo is required" : null),
    },
  });

  const handleFilePreview = (file: File | null, fieldName: string) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview((prev) => ({
          ...prev,
          [fieldName]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview((prev) => {
        const newPreview = { ...prev };
        delete newPreview[fieldName];
        return newPreview;
      });
    }
  };

  const startCamera = async (fieldName: keyof KYCFormData) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: fieldName === "selfiePhoto" ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCurrentStream(stream);
      setCurrentField(fieldName);
      setCameraOpen(true);

      // Wait for next tick to ensure modal is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Explicitly play the video
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);
    } catch (error) {
      console.error("Camera access error:", error);
      notify.error("Unable to access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !currentField) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `${currentField}_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          form.setFieldValue(currentField, file);
          handleFilePreview(file, currentField);
          closeCamera();
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const closeCamera = () => {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      setCurrentStream(null);
    }
    setCameraOpen(false);
    setCurrentField(null);
  };

  const PhotoUploadField = ({
    fieldName,
    label,
    required = false,
    description = "",
  }: {
    fieldName: keyof KYCFormData;
    label: string;
    required?: boolean;
    description?: string;
  }) => {
    const file = form.values[fieldName] as File | null;

    return (
      <div className="space-y-3">
        <Text size="sm" fw={500} className="flex items-center gap-2">
          <Upload size={16} />
          {label} {required && <span className="text-red-500">*</span>}
        </Text>
        {description && (
          <Text size="xs" c="dimmed" className="!py-1 italic">
            {description}
          </Text>
        )}

        <div className="flex gap-3">
          <FileInput
            placeholder="Choose file"
            accept="image/*"
            value={file}
            onChange={(file) => {
              form.setFieldValue(fieldName, file);
              handleFilePreview(file, fieldName);
            }}
            className="flex-1"
            leftSection={<Upload size={16} />}
            error={form.errors[fieldName]}
          />
        </div>

        {/* Camera Capture Button */}
        <Group gap="xs" align="center">
          <Button
            variant="light"
            size="compact-sm"
            leftSection={<Camera size={16} />}
            onClick={() => startCamera(fieldName)}
            style={{
              backgroundColor: "#F08C2315",
              color: "#F08C23",
              fontSize: "0.75rem",
            }}
          >
            Take Photo
          </Button>
          <Text size="xs" c="dimmed">
            or choose from gallery above
          </Text>
        </Group>

        {photoPreview[fieldName] && (
          <Card className="p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Text size="xs" c="dimmed">
                Preview
              </Text>
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => {
                  form.setFieldValue(fieldName, null);
                  handleFilePreview(null, fieldName);
                }}
              >
                <X size={14} />
              </ActionIcon>
            </div>
            <Image
              src={photoPreview[fieldName]}
              alt="Preview"
              className="max-h-32 w-auto mx-auto rounded"
            />
          </Card>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      notify.error("Please upload all required documents");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("idType", idType);

      // Add required photos
      if (form.values.frontSidePhoto) {
        const base64 = await toDataUrlFromFile(form.values.frontSidePhoto);
        formData.append("frontSidePhoto", (base64 as string).split(",")[1]);
      }

      if (form.values.backSidePhoto && idType !== "103") {
        const base64 = await toDataUrlFromFile(form.values.backSidePhoto);
        formData.append("backSidePhoto", (base64 as string).split(",")[1]);
      }

      if (form.values.selfiePhoto) {
        const base64 = await toDataUrlFromFile(form.values.selfiePhoto);
        formData.append("selfiePhoto", (base64 as string).split(",")[1]);
      }

      const response = await sendKYC(formData);

      if (response.success) {
        notify.success("KYC documents uploaded successfully");
        form.reset();
        setPhotoPreview({});
        onClose();
        location.pathname = "/keyman/dashboard/key-wallet";
      } else {
        notify.error(response.message || "Failed to upload KYC documents");
      }
    } catch (error) {
      notify.error("Failed to upload KYC documents");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setPhotoPreview({});
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <FileText size={20} />
          Upload KYC Documents
        </div>
      }
      centered
      size="lg"
    >
      <div className="space-y-6">
        <Alert icon={<AlertCircle size={16} />} color="orange">
          <Text size="sm">
            Your previous KYC documents were not accepted. Please upload new,
            clear photos of your identification documents.
          </Text>
        </Alert>

        <Grid gutter="lg">
          <Grid.Col span={idLabels.showBackPhoto ? 6 : 12}>
            <PhotoUploadField
              fieldName="frontSidePhoto"
              label={idLabels.frontPhoto}
              required
              description="Take a clear photo of front side of your ID."
            />
          </Grid.Col>

          {idLabels.showBackPhoto && (
            <Grid.Col span={6}>
              <PhotoUploadField
                fieldName="backSidePhoto"
                label={idLabels.backPhoto}
                required
                description="Take a clear photo of back side of your ID."
              />
            </Grid.Col>
          )}

          <Grid.Col span={12}>
            <PhotoUploadField
              fieldName="selfiePhoto"
              label="Selfie Photo"
              required
            />
          </Grid.Col>
        </Grid>

        {isSubmitting && (
          <Box>
            <Progress value={100} animated color="#3D6B2C" />
            <Text size="sm" c="dimmed" ta="center" mt="xs">
              Uploading documents...
            </Text>
          </Box>
        )}

        <Group justify="space-between" mt="xl">
          <Button variant="light" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            leftSection={<Send size={16} />}
            style={{ backgroundColor: "#3D6B2C" }}
            className="hover:opacity-90"
          >
            Upload Documents
          </Button>
        </Group>
      </div>

      {/* Camera Modal */}
      <Modal
        opened={cameraOpen}
        onClose={closeCamera}
        title="Take Photo"
        centered
        size="lg"
      >
        <div className="space-y-4">
          <div
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ aspectRatio: "4/3", minHeight: "400px" }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                video.play().catch((err) => console.error("Play error:", err));
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <Alert icon={<Camera size={16} />} color="blue">
            <Text size="sm">
              Position your{" "}
              {currentField === "selfiePhoto" ? "face" : "ID document"} in the
              frame and click capture
            </Text>
          </Alert>

          <Group justify="space-between">
            <Button variant="light" onClick={closeCamera}>
              Cancel
            </Button>
            <Button
              onClick={capturePhoto}
              leftSection={<Camera size={16} />}
              style={{ backgroundColor: "#3D6B2C" }}
            >
              Capture Photo
            </Button>
          </Group>
        </div>
      </Modal>
    </Modal>
  );
}
