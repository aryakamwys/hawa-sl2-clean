"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Image as ImageIcon, MessageCircle, ChevronDown, ChevronUp, Loader2, MessageSquare, Upload, Sparkles } from "lucide-react";

type TabType = "posts" | "ai";

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  image?: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  image?: string;
  replies: Reply[];
  showReplies?: boolean;
  aiExplanation?: string;
  isAiAnalyzing?: boolean;
}

export default function CommunityModal({ isOpen, onClose }: CommunityModalProps) {
  const [user, setUser] = useState<{ name: string; id: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPostContent, setNewPostContent] = useState("");

  // AI Chat state (removed)
  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be less than 5MB");
        return;
      }
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  // Fetch posts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPosts();
    }
  }, [isOpen]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/community/posts");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch posts");
      }

      // Transform data to match our interface
      const transformedPosts = data.posts.map((post: any) => ({
        id: post.id,
        author: post.user.name,
        avatar: "👤",
        content: post.content,
        image: post.imageUrl || undefined,
        timestamp: new Date(post.createdAt),
        replies: post.replies?.map((reply: any) => ({
          id: reply.id,
          author: reply.user.name,
          avatar: "👤",
          content: reply.content,
          image: reply.imageUrl || undefined,
          timestamp: new Date(reply.createdAt),
        })) || [],
        showReplies: false,
        aiExplanation: undefined,
        isAiAnalyzing: false,
      }));

      setPosts(transformedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      setError("Please login to create posts");
      return;
    }
    if (!newPostContent.trim()) {
      setError("Please enter some content");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", newPostContent.trim());

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch("/api/community/posts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      // Reset form
      setNewPostContent("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSuccess("Post created successfully!");
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  const handleToggleReplies = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, showReplies: !post.showReplies }
        : post
    ));
  };

  const handleReply = async (postId: string) => {
    if (!user) {
      setError("Please login to reply");
      return;
    }
    if (!replyContent.trim()) {
      setError("Please enter a reply");
      return;
    }

    try {
      const res = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          imageUrl: null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create reply");
      }

      setReplyContent("");
      setReplyingTo(null);
      setSuccess("Reply added!");
      fetchPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create reply");
    }
  };

  const handleExplainPost = async (postId: string, content: string, imageUrl?: string) => {
    // Set loading state for specific post
    setPosts(posts.map(p => p.id === postId ? { ...p, isAiAnalyzing: true, aiExplanation: undefined } : p));

    try {
      const res = await fetch("/api/ai/explain-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to explain post");
      }

      // Update post with explanation
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, isAiAnalyzing: false, aiExplanation: data.explanation } 
          : p
      ));
    } catch (err) {
      console.error(err);
      setPosts(posts.map(p => p.id === postId ? { ...p, isAiAnalyzing: false } : p));
      setError("Failed to get AI explanation");
    }
  };



  // ESC close + lock scroll
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label="Close modal backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div className="relative mx-auto flex min-h-full items-center justify-center !p-4 md:!p-6">
        <div className="w-full max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 !px-6 !py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Community Hub</h2>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Content */}
              <div className="flex-1 !p-6 overflow-y-auto">
                {/* Messages */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 !px-4 !py-3 text-sm text-red-700 mb-4">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl border border-green-200 bg-green-50 !px-4 !py-3 text-sm text-green-700 mb-4">
                    {success}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Create Post Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      {!user ? (
                        <div className="text-center py-6">
                          <p className="text-gray-500 mb-4 text-sm">Join the conversation by logging in</p>
                          <button
                            onClick={() => {
                              onClose();
                              window.location.href = "/";
                            }}
                            className="!px-6 !py-2.5 bg-[#005AE1] hover:bg-[#004BB8] text-white rounded-xl font-semibold text-sm transition-all"
                          >
                            Login to Post
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#005AE1] flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What's happening in your area?"
                                className="w-full bg-white border border-gray-200 rounded-xl !px-4 !py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005AE1]/25 resize-none min-h-[80px]"
                              />
                            </div>
                          </div>

                          {/* Actions: Image Upload & Post Button */}
                          <div className="flex items-center justify-between pt-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                            {imagePreview ? (
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  onClick={handleRemoveImage}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                                  title="Remove image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={triggerFileInput}
                                className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Add Image (max 5MB)"
                              >
                                <Upload size={18} />
                              </button>
                            )}

                            <button
                              onClick={handleCreatePost}
                              disabled={!newPostContent.trim()}
                              className="!px-5 !py-2.5 bg-[#005AE1] hover:bg-[#004BB8] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              <span>Post</span>
                              <Send size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Posts Feed */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Recent Activity
                      </h3>

                      {loading ? (
                        <div className="flex items-center justify-center !py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : posts.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No posts yet. Be the first to share!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {posts.map((post) => (
                            <div
                              key={post.id}
                              className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">{post.avatar}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">{post.author}</span>
                                    <span className="text-gray-300 text-[10px]">•</span>
                                    <span className="text-gray-400 text-xs">
                                      {new Intl.RelativeTimeFormat("en-US", {
                                        numeric: "auto",
                                        style: "short",
                                      }).format(-(Date.now() - post.timestamp.getTime()) / (1000 * 60 * 60) > -1 ? (Date.now() - post.timestamp.getTime()) / (1000 * 60) : (Date.now() - post.timestamp.getTime()) / (1000 * 60 * 60), "hour")}
                                    </span>
                                  </div>

                                  <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                                    {post.content}
                                  </p>

                                  {post.image && (
                                    <div className="rounded-xl overflow-hidden border border-gray-200 mb-3">
                                      <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-60" />
                                    </div>
                                  )}

                                  {/* Interaction Bar */}
                                    <div className="flex items-center gap-6 pt-2">
                                      <button
                                        onClick={() => {
                                          if (user) {
                                            setReplyingTo(post.id);
                                          } else {
                                            setError("Please login to reply");
                                          }
                                        }}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-[#005AE1] transition-colors text-xs font-medium"
                                      >
                                        <MessageCircle size={16} />
                                        <span>Reply</span>
                                      </button>
                                      
                                      <button
                                        onClick={() => handleExplainPost(post.id, post.content, post.image)}
                                        disabled={post.isAiAnalyzing}
                                        className={`flex items-center gap-1.5 transition-colors text-xs font-medium hover:bg-gray-100 p-1.5 rounded-lg ${
                                          post.aiExplanation 
                                            ? "bg-blue-50 text-[#005AE1]" 
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {post.isAiAnalyzing ? (
                                          <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                          <img 
                                            alt="Meta" 
                                            className="h-4 w-auto" 
                                            src="https://static.xx.fbcdn.net/rsrc.php/y9/r/tL_v571NdZ0.svg" 
                                            width="58"
                                            height="11" 
                                          />
                                        )}
                                        <span className="font-semibold text-[11px] tracking-tight">Ask Meta</span>
                                      </button>

                                      {post.replies.length > 0 && (
                                        <button
                                          onClick={() => handleToggleReplies(post.id)}
                                          className="flex items-center gap-1.5 text-gray-400 hover:text-[#005AE1] transition-colors text-xs font-medium"
                                        >
                                          {post.showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          <span>{post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}</span>
                                        </button>
                                      )}
                                    </div>

                                    {/* AI Explanation Result */}
                                    {post.aiExplanation && (
                                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-gray-800 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-1 text-[#005AE1] font-semibold text-xs uppercase tracking-wide">
                                          <Sparkles size={12} />
                                          Meta
                                        </div>
                                        <p className="whitespace-pre-wrap leading-relaxed">{post.aiExplanation}</p>
                                      </div>
                                    )}

                                  {/* Reply Input */}
                                  {replyingTo === post.id && (
                                    <div className="mt-3 space-y-2">
                                      <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="w-full bg-white border border-gray-200 rounded-xl !px-3 !py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005AE1]/25 resize-none"
                                        rows={2}
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          onClick={() => {
                                            setReplyingTo(null);
                                            setReplyContent("");
                                          }}
                                          className="!px-3 !py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleReply(post.id)}
                                          disabled={!replyContent.trim()}
                                          className="!px-3 !py-1.5 text-sm bg-[#005AE1] hover:bg-[#004BB8] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Replies Section */}
                                  {post.showReplies && post.replies.length > 0 && (
                                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                                      {post.replies.map((reply) => (
                                        <div key={reply.id} className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">{reply.avatar}</span>
                                            <span className="font-semibold text-gray-700 text-xs">{reply.author}</span>
                                            <span className="text-gray-400 text-[10px]">
                                              {new Intl.RelativeTimeFormat("en-US", {
                                                numeric: "auto",
                                                style: "short",
                                              }).format(-(Date.now() - reply.timestamp.getTime()) / (1000 * 60 * 60) > -1 ? (Date.now() - reply.timestamp.getTime()) / (1000 * 60) : (Date.now() - reply.timestamp.getTime()) / (1000 * 60 * 60), "hour")}
                                            </span>
                                          </div>
                                          <p className="text-gray-600 text-sm pl-7">{reply.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
