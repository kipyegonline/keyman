import React, { useState, useEffect } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share";
import { Copy, Check, Rss } from "lucide-react";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  via?: string;
  image?: string;
  rssUrl?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description = "",
  hashtags = [],
  via = "",

  rssUrl = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleRssClick = () => {
    if (rssUrl) {
      window.open(rssUrl, "_blank");
    }
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      Component: WhatsappShareButton,
      Icon: WhatsappIcon,
      props: { url, title, separator: " - " },
      color: "#25D366",
      delay: 0,
    },
    {
      name: "Facebook",
      Component: FacebookShareButton,
      Icon: FacebookIcon,
      props: { url, quote: title, hashtag: hashtags.join(" ") },
      color: "#1877F2",
      delay: 100,
    },
    {
      name: "Twitter",
      Component: TwitterShareButton,
      Icon: TwitterIcon,
      props: { url, title, via, hashtags },
      color: "#000000",
      delay: 200,
    },
    {
      name: "Email",
      Component: EmailShareButton,
      Icon: EmailIcon,
      props: { url, subject: title, body: description },
      color: "#7C3AED",
      delay: 300,
    },
    {
      name: "LinkedIn",
      Component: LinkedinShareButton,
      Icon: LinkedinIcon,
      props: { url, title, summary: description },
      color: "#0A66C2",
      delay: 400,
    },
  ];

  return (
    <div className="social-share-container">
      <style jsx>{`
        .social-share-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.3);
          max-width: 500px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }

        .social-share-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 4px;
          background: linear-gradient(
            90deg,
            #25d366,
            #1877f2,
            #000000,
            #7c3aed,
            #0a66c2
          );
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        .share-title {
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #3d6b2c 0%, #f08c23 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .share-title::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
        }

        .social-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .social-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 8px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(30px) scale(0.9);
          cursor: pointer;
        }

        .social-item.animate {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .social-item:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.9);
        }

        .social-item:hover .social-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .social-item::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0.1)
          );
          border-radius: 16px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .social-item:hover::before {
          opacity: 1;
        }

        .social-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .social-label {
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .social-item:hover .social-label {
          color: #2d3748;
          transform: translateY(-2px);
        }

        .rss-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 8px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(30px) scale(0.9);
          cursor: pointer;
        }

        .rss-item.animate {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .rss-item:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          background: rgba(255, 255, 255, 0.9);
        }

        .rss-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .rss-item:hover .rss-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .share-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 0, 0, 0.1),
            transparent
          );
          margin: 20px 0;
        }

        .copy-section {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 16px;
          padding: 12px 16px;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .copy-section:hover {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.1);
        }

        .copy-input {
          flex: 1;
          border: none;
          background: none;
          font-size: 13px;
          color: #4a5568;
          outline: none;
          user-select: all;
          font-family: monospace;
        }

        .copy-button {
          background: linear-gradient(135deg, #3d6b2c 0%, #f08c23 100%);
          border: none;
          border-radius: 12px;
          padding: 8px 16px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .copy-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .copy-button:active {
          transform: translateY(0);
        }

        .copy-button.copied {
          background: linear-gradient(135deg, #3d6b2c 0%, ##f08c23 100%);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .copy-button.copied {
          animation: bounce 0.6s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .social-share-container {
          animation: fadeInUp 0.8s ease-out;
        }

        @media (max-width: 480px) {
          .social-share-container {
            padding: 20px;
            border-radius: 20px;
          }

          .social-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .social-item {
            padding: 12px 6px;
          }

          .share-title {
            font-size: 20px;
            margin-bottom: 20px;
          }

          .copy-section {
            flex-direction: column;
            gap: 8px;
          }

          .copy-input {
            text-align: center;
            width: 100%;
          }
        }
      `}</style>

      <div className="share-title ">Share {title}</div>

      <div className="social-grid">
        {socialPlatforms.map((platform) => {
          const { Component, Icon, props, color, delay, name } = platform;
          return (
            <div
              key={name}
              className={`social-item ${mounted ? "animate" : ""}`}
              style={{
                animationDelay: `${delay}ms`,
                transitionDelay: `${delay}ms`,
                color,
              }}
            >
              <Component {...props}>
                <div className="social-icon">
                  <Icon size={40} round />
                </div>
              </Component>
              <div className="social-label">{name}</div>
            </div>
          );
        })}

        {/* RSS Feed Item */}
        {rssUrl && (
          <div
            className={`rss-item ${mounted ? "animate" : ""}`}
            style={{
              animationDelay: "500ms",
              transitionDelay: "500ms",
            }}
            onClick={handleRssClick}
          >
            <div className="rss-icon">
              <Rss size={20} />
            </div>
            <div className="social-label">RSS</div>
          </div>
        )}
      </div>

      <div className="share-divider" />

      <div className="copy-section">
        <input
          type="text"
          value={url}
          readOnly
          className="copy-input"
          placeholder="Share URL"
        />
        <button
          className={`copy-button ${copied ? "copied" : ""}`}
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SocialShare;
