"use client";
import React, { useState } from "react";
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
import CameraCapture from "./CameraCapture";

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
  const [currentField, setCurrentField] = useState<keyof KYCFormData | null>(
    null
  );

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

  const openCamera = (fieldName: keyof KYCFormData) => {
    setCurrentField(fieldName);
    setCameraOpen(true);
  };

  const handlePhotoCapture = (file: File) => {
    if (currentField) {
      form.setFieldValue(currentField, file);
      handleFilePreview(file, currentField);
    }
  };

  const getCameraInstructions = () => {
    if (!currentField) return "Position the subject in the frame";

    if (currentField === "frontSidePhoto") {
      return "Position the front side of your ID card clearly in the frame";
    } else if (currentField === "backSidePhoto") {
      return "Position the back side of your ID card clearly in the frame";
    } else if (currentField === "selfiePhoto") {
      return "Position your face clearly in the frame and ensure good lighting";
    }
    return "Position the subject in the frame";
  };

  const getCameraTitle = () => {
    if (currentField === "frontSidePhoto") return "Capture Front ID Photo";
    if (currentField === "backSidePhoto") return "Capture Back ID Photo";
    if (currentField === "selfiePhoto") return "Capture Selfie Photo";
    return "Take Photo";
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
            onClick={() => openCamera(fieldName)}
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

      {/* Camera Capture */}
      <CameraCapture
        opened={cameraOpen}
        onClose={() => {
          setCameraOpen(false);
          setCurrentField(null);
        }}
        onCapture={handlePhotoCapture}
        title={getCameraTitle()}
        facingMode={currentField === "selfiePhoto" ? "user" : "environment"}
        instructionText={getCameraInstructions()}
        clickSoundUrl="/camera.mp3"
      />
    </Modal>
  );
}
