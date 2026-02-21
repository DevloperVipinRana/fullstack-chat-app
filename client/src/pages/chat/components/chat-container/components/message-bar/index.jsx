import { useRef, useState, useEffect } from "react";
import { GrAttachment } from "react-icons/gr";
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useSocket } from "@/context/SocketContext";
import { useAppStore } from "@/store";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const socket = useSocket();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
  } = useAppStore();
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
    }
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true)
        const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          withCredentials: true,
          onUploadProgress: data => {
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
          }
        });

        if (response.status === 200 && response.data) {
          setIsUploading(false);
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: response.data.filePath,
            });
          } else if (selectedChatType === "channel") {
            socket.emit("send-channel-message", {
              sender: userInfo.id,
              content: undefined,
              messageType: "file",
              fileUrl: response.data.filePath,
              channelId: selectedChatData._id,
            })
          }
        }
      }
      console.log({ file });
    } catch (error) {
      setIsUploading(false);
      console.log({ error });
    }
  };

  return (
    <div className="bg-[#1c1d25] flex justify-center items-center px-4 md:px-8 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] gap-3 md:gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-2 md:gap-5 pr-3 md:pr-5">
        <input
          type="text"
          className="flex-1 p-3 md:p-5 bg-transparent rounded-md focus:border-0 focus:outline-none text-sm md:text-base"
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="text-neutral-500 active:text-white duration-300 transition-all flex-shrink-0"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-lg md:text-2xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative flex-shrink-0">
          <button
            className="text-neutral-500 active:text-white duration-300 transition-all"
            onClick={() => setEmojiPickerOpen(true)}
          >
            <RiEmojiStickerLine className="text-lg md:text-2xl" />
          </button>
          <div className="absolute bottom-12 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Send message"
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-3 md:p-5 hover:bg-[#741bda] focus:outline-none active:outline-none active:text-white transition-colors duration-300 flex-shrink-0"
        onClick={handleSendMessage}
      >
        <IoSend className="text-lg md:text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;
