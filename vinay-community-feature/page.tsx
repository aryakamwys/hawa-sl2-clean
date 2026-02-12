// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { Camera, BarChart2, Heart, MessageCircle, Send, ArrowLeft } from "lucide-react";

// export default function HawaXFinalUI() {
//   const router = useRouter();
  
//   // --- STATE MANAGEMENT ---
//   const [posts, setPosts] = useState([]); // Stores the list of feed posts
//   const [content, setContent] = useState(""); // Stores text for new posts
//   const [file, setFile] = useState<File | null>(null); // Stores uploaded images
//   const [preview, setPreview] = useState<string | null>(null); // Image preview URL
//   const fileInput = useRef<HTMLInputElement>(null);

//   // --- POLL STATE ---
//   const [showPoll, setShowPoll] = useState(false); // Toggles poll input visibility
//   const [pollOptions, setPollOptions] = useState(["", ""]); // Tracks individual poll options
//   const [activeCommentId, setActiveCommentId] = useState<string | null>(null); // Tracks which post is being commented on
//   const [commentContent, setCommentContent] = useState(""); // Stores active comment text

//   // --- API HANDLERS ---
  
//   // Fetches all community posts from the backend
//   const fetchPosts = async () => {
//     const res = await fetch("/api/community");
//     if (res.ok) setPosts(await res.json());
//   };

//   useEffect(() => { fetchPosts(); }, []);

//   // Handles submitting a new post (Text, Image, or Poll)
//   const handlePost = async () => {
//     // Prevent empty posts
//     if (!content.trim() && !file && (!showPoll || pollOptions[0].trim() === "")) return;
    
//     const formData = new FormData();
//     formData.append("content", content);
//     if (file) formData.append("image", file);
    
//     // Package poll options into a JSON string if the poll UI is active
//     if (showPoll) {
//       const validOptions = pollOptions.filter(o => o.trim() !== "");
//       if (validOptions.length >= 2) {
//         formData.append("pollOptions", JSON.stringify(validOptions));
//       }
//     }

//     const res = await fetch("/api/community", { method: "POST", body: formData });
//     if (res.ok) {
//       // Clear all inputs after successful post
//       setContent(""); setFile(null); setPreview(null); setShowPoll(false); setPollOptions(["", ""]);
//       fetchPosts();
//     }
//   };

//   // Handles Like/Heart button interaction
//   const handleLike = async (postId: string) => {
//     await fetch(`/api/community/like`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ postId })
//     });
//     fetchPosts();
//   };

//   // Handles submitting a new comment to a specific post
//   const handleComment = async (postId: string) => {
//     if (!commentContent.trim()) return;
//     const res = await fetch("/api/community/comment", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ postId, content: commentContent })
//     });
//     if (res.ok) {
//       setCommentContent("");
//       setActiveCommentId(null);
//       fetchPosts();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F0F5FA] pb-32 pt-24 px-4 font-sans">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* --- MAIN FEED COLUMN --- */}
//         <div className="lg:col-span-2 space-y-6">
          
//           {/* Feed Header */}
//           <div className="flex items-center gap-4 mb-4">
//             <button 
//               onClick={() => router.back()}
//               className="p-3 bg-white rounded-full shadow-sm text-slate-600 hover:text-[#005AE1] hover:bg-blue-50 hover:scale-105 transition-all"
//               aria-label="Go back"
//             >
//               <ArrowLeft size={24} />
//             </button>
//             <div>
//               <h1 className="text-3xl font-black text-slate-800 tracking-tight">
//                 Community <span className="text-[#005AE1]">Feed</span>
//               </h1>
//               <p className="text-sm text-slate-500 font-medium">Join the local air quality conversation</p>
//             </div>
//           </div>

//           {/* Post Creation Area (Composer) */}
//           <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 transition-all focus-within:shadow-md">
//             {/* Image Preview logic */}
//             {preview && (
//               <div className="relative mb-4">
//                 <img src={preview} className="w-full h-48 object-cover rounded-2xl" alt="Preview" />
//                 <button 
//                   onClick={() => { setFile(null); setPreview(null); }}
//                   className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-white"
//                 >
//                   ✕
//                 </button>
//               </div>
//             )}
//             <textarea 
//               className="w-full bg-slate-50/50 rounded-2xl p-4 outline-none border-2 border-transparent focus:border-blue-100 resize-none h-24 text-lg transition-all"
//               placeholder="What's the air like today?"
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//             />
            
//             {/* Poll Creation Form (Visible only when 'BarChart2' is clicked) */}
//             {showPoll && (
//               <div className="mt-4 space-y-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
//                 {pollOptions.map((opt, i) => (
//                   <input 
//                     key={i}
//                     type="text"
//                     placeholder={`Option ${i + 1}`}
//                     className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-[#005AE1] transition-colors"
//                     value={opt}
//                     onChange={(e) => {
//                       const newOpts = [...pollOptions];
//                       newOpts[i] = e.target.value;
//                       setPollOptions(newOpts);
//                     }}
//                   />
//                 ))}
//                 <button 
//                   onClick={() => setPollOptions([...pollOptions, ""])}
//                   className="text-sm font-bold text-[#005AE1] hover:text-blue-700 ml-1"
//                 >
//                   + Add Option
//                 </button>
//               </div>
//             )}

//             <div className="flex items-center justify-between mt-4">
//               <div className="flex gap-2">
//                 <button onClick={() => fileInput.current?.click()} className="p-3 bg-slate-50 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
//                   <Camera size={20} />
//                 </button>
//                 <button 
//                   onClick={() => setShowPoll(!showPoll)} 
//                   className={`p-3 rounded-full transition-colors ${showPoll ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
//                 >
//                   <BarChart2 size={20} />
//                 </button>
//               </div>
//               <button 
//                 onClick={handlePost} 
//                 disabled={!content.trim() && !file && (!showPoll || pollOptions[0].trim() === "")}
//                 className="bg-[#005AE1] text-white px-8 py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Post Update
//               </button>
//             </div>
//             <input type="file" ref={fileInput} className="hidden" accept="image/*" onChange={(e) => {
//               const f = e.target.files?.[0];
//               if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
//             }} />
//           </div>

//           {/* --- POSTS FEED --- */}
//           <div className="space-y-6">
//             {posts.map((post: any) => (
//               <div key={post.id} className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
//                 {/* Post Author Info */}
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005AE1] to-blue-400 text-white flex items-center justify-center font-bold text-lg shadow-inner">
//                     {post.author?.name?.charAt(0).toUpperCase() || "A"}
//                   </div>
//                   <div>
//                     <p className="font-bold text-slate-800 leading-tight">{post.author?.name || "Admin"}</p>
//                     <p className="text-xs text-slate-400 font-medium">Just now</p>
//                   </div>
//                 </div>
                
//                 <p className="text-slate-700 text-lg mb-4 leading-relaxed">{post.content}</p>
                
//                 {/* Conditional rendering for Post Image */}
//                 {post.imageUrl && (
//                   <div className="overflow-hidden rounded-2xl mb-4 border border-slate-100">
//                     <img src={post.imageUrl} className="w-full object-cover hover:scale-105 transition-transform duration-500" alt="Post attachment" />
//                   </div>
//                 )}
                
//                 {/* Post Interaction (Likes/Comments) */}
//                 <div className="flex gap-6 border-t border-slate-100 pt-4 mt-2">
//                   <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 font-bold text-slate-400 hover:text-red-500 transition-colors group">
//                     <Heart size={18} fill={post._count?.likes > 0 ? "#ef4444" : "none"} className={post._count?.likes > 0 ? "text-red-500" : "group-hover:text-red-500"} /> 
//                     <span className={post._count?.likes > 0 ? "text-red-500" : ""}>{post._count?.likes || 0}</span>
//                   </button>
//                   <button 
//                     onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)} 
//                     className="flex items-center gap-2 font-bold text-slate-400 hover:text-[#005AE1] transition-colors"
//                   >
//                     <MessageCircle size={18} /> {post._count?.comments || 0}
//                   </button>
//                 </div>

//                 {/* --- COMMENT INPUT DROPDOWN --- */}
//                 {activeCommentId === post.id && (
//                   <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3 items-center animate-in fade-in slide-in-from-top-2 duration-200">
//                     <div className="w-8 h-8 rounded-full bg-[#005AE1] text-white flex items-center justify-center font-bold text-xs shrink-0">A</div>
//                     <input 
//                       type="text" 
//                       placeholder="Write a reply..." 
//                       className="flex-1 bg-slate-50 border border-transparent focus:border-blue-100 rounded-full px-4 py-2 outline-none text-sm transition-all"
//                       value={commentContent}
//                       onChange={(e) => setCommentContent(e.target.value)}
//                       onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
//                     />
//                     <button 
//                       onClick={() => handleComment(post.id)}
//                       disabled={!commentContent.trim()}
//                       className="p-2 bg-[#005AE1] text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
//                     >
//                       <Send size={16} className="-ml-0.5" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* --- SIDEBAR (Trending Items) --- */}
//         <div className="hidden lg:block">
//           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 sticky top-28">
//             <h2 className="text-xl font-black mb-6 tracking-tight">Trending <span className="text-[#005AE1]">Now</span></h2>
//             <div className="space-y-5">
//               {[
//                 { tag: "#HawaX", category: "App Updates", posts: "2.1k" },
//                 { tag: "#PatialaAir", category: "Local Environment", posts: "854" },
//                 { tag: "#CleanAir", category: "Movement", posts: "432" }
//               ].map(trend => (
//                 <div key={trend.tag} className="cursor-pointer group block p-2 -mx-2 rounded-2xl hover:bg-slate-50 transition-colors">
//                   <p className="font-bold text-slate-800 group-hover:text-[#005AE1] transition-colors">{trend.tag}</p>
//                   <div className="flex justify-between items-center mt-0.5">
//                     <p className="text-xs text-slate-400 font-medium">{trend.category}</p>
//                     <p className="text-xs text-slate-400">{trend.posts} posts</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
            
//             <div className="mt-8 pt-6 border-t border-slate-100">
//               <p className="text-xs font-medium text-slate-400 text-center">
//                 Hawa Community Guidelines • Privacy
//               </p>
//             </div>
//           </div>
//         </div>
        
//       </div>
//     </div>
//   );

// }
