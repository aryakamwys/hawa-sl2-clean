"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { MessageSquare, Image as ImageIcon, Send } from "lucide-react";
import { motion } from "framer-motion";

interface Post {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((date.getTime() - now) / 1000);

  const absDiff = Math.abs(diffInSeconds);

  // Determine the best unit
  if (absDiff < 60) {
    const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
    return rtf.format(diffInSeconds, "second");
  } else if (absDiff < 3600) {
    const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
    return rtf.format(Math.floor(diffInSeconds / 60), "minute");
  } else if (absDiff < 86400) {
    const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
    return rtf.format(Math.floor(diffInSeconds / 3600), "hour");
  } else {
    const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
    return rtf.format(Math.floor(diffInSeconds / 86400), "day");
  }
}

export default function CommunityPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "HAWA Official",
      avatar: "🌬",
      content: "Welcome to HAWA Community! Share your air quality observations, tips, and photos with fellow citizens.",
      timestamp: new Date(Date.now() - 3600000),
      likes: 42,
    },
    {
      id: "2",
      author: "Air Quality Enthusiast",
      avatar: "🌱",
      content: "Just checked the sensor data at Coblong. PM2.5 levels are looking good today! Remember to wear masks when outdoor.",
      timestamp: new Date(Date.now() - 7200000),
      likes: 18,
    },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
      } catch {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  const handleCreatePost = () => {
    if (!user) {
      alert("Please login to create posts");
      return;
    }
    if (!newPostContent.trim()) {
      alert("Please enter some content");
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: user.name,
      avatar: "😊",
      content: newPostContent,
      image: newPostImage || undefined,
      timestamp: new Date(),
      likes: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setNewPostImage("");
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Community</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#005AE1] text-white rounded-full font-semibold text-sm hover:bg-[#004BB8] transition-colors"
          >
            <MessageSquare size={18} />
            <span>Post</span>
          </button>
        </div>
      </header>

      {/* Posts Feed */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{post.author}</span>
                        <span className="text-gray-500 text-sm">
                          {formatRelativeTime(post.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 text-sm">
                        <span>💬 {post.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                  {post.content}
                </p>

                {/* Post Image */}
                {post.image && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 mb-3">
                    <img
                      src={post.image}
                      alt="Post attachment"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {!user ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Please login to create posts</p>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="px-6 py-2 bg-[#005AE1] text-white rounded-lg font-semibold hover:bg-[#004BB8] transition-colors"
                  >
                    Login
                  </button>
                </div>
              ) : (
                <>
                  {/* Content Input */}
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's happening with the air quality in your area?"
                    className="w-full min-h-[120px] p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#005AE1] text-gray-700"
                    rows={4}
                  />

                  {/* Image URL Input */}
                  <div className="mt-3">
                    <input
                      type="text"
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      placeholder="Image URL (optional)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005AE1] text-gray-700"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePost}
                      className="flex-1 px-4 py-2 bg-[#005AE1] text-white rounded-lg font-semibold hover:bg-[#004BB8] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newPostContent.trim()}
                    >
                      <Send size={18} />
                      Post
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
