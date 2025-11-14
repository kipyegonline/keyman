"use client";
import React, { useRef, useState, useEffect } from "react";
import { Modal, Button, Group, Text, Alert, Box } from "@mantine/core";
import { Camera, X } from "lucide-react";
import { notify } from "@/lib/notifications";

interface CameraCaptureProps {
  opened: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
  facingMode?: "user" | "environment";
  instructionText?: string;
  clickSoundUrl?: string;
}

export default function CameraCapture({
  opened,
  onClose,
  onCapture,
  title = "Take Photo",
  facingMode = "environment",
  instructionText = "Position the subject in the frame and click capture",
  clickSoundUrl,
}: CameraCaptureProps) {
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio when click sound is provided
  useEffect(() => {
    if (clickSoundUrl) {
      audioRef.current = new Audio(clickSoundUrl);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [clickSoundUrl]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setCurrentStream(stream);

      // Wait for next tick to ensure modal is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        }
      }, 100);
    } catch (error) {
      console.error("Camera access error:", error);
      notify.error("Unable to access camera. Please check permissions.");
      onClose();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Play click sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.error("Error playing click sound:", err);
      });
    }

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
          const file = new File([blob], `photo_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });

          onCapture(file);
          handleClose();
        }
      },
      "image/jpeg",
      0.95
    );
  };

  const handleClose = () => {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      setCurrentStream(null);
    }
    onClose();
  };

  // Start camera when modal opens
  useEffect(() => {
    if (opened) {
      startCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      centered
      size="lg"
    >
      <div className="space-y-4">
        <Box
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
        </Box>

        <Alert icon={<Camera size={16} />} color="blue">
          <Text size="sm">{instructionText}</Text>
        </Alert>

        <Group justify="space-between">
          <Button
            variant="light"
            onClick={handleClose}
            leftSection={<X size={16} />}
          >
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
  );
}
