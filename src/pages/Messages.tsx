import React, { useState, useEffect, useRef } from 'react';
import { useAuth, getAvatarUrl } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDoc, where, getDocs, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Search, UserPlus, Check, X, MessageCircle, UserX, Clock, UserCheck, Users, Pin, PinOff, Trash2, UserMinus, Pencil, User, MoreVertical, BellOff, Bell } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function Messages() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [chats, setChats] = useState<{ [key: string]: any }>({});
  const [friendsSearchQuery, setFriendsSearchQuery] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Options Menu & Modal State
  const [selectedFriendForMenu, setSelectedFriendForMenu] = useState<any>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  
  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDestructive: false,
    onConfirm: () => {}
  });

  // Long press & Navigation guard refs
  const pressTimerRef = useRef<any>(null);
  const isPressingRef = useRef(false);
  const longPressDetectedRef = useRef(false);
  const pressStartPosRef = useRef<{ x: number, y: number } | null>(null);

  // Fetch Friends
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/friends`));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const friendIds = snapshot.docs.map(d => d.id);
      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      // Fetch profiles for all friends
      try {
        const profiles = await Promise.all(friendIds.map(async (id) => {
          const profileDoc = await getDoc(doc(db, 'publicProfiles', id));
          return { id, ...profileDoc.data() };
        }));
        setFriends(profiles);
      } catch (error) {
        console.error("Error fetching friend profiles:", error);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/friends`));
    return () => unsubscribe();
  }, [user]);

  // Fetch Friend Requests
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/friendRequests`));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const reqsData = await Promise.all(snapshot.docs.map(async (d) => {
        const reqData = d.data();
        const senderDoc = await getDoc(doc(db, 'publicProfiles', reqData.fromUid));
        return { id: d.id, ...reqData, senderProfile: senderDoc.data() };
      }));
      setRequests(reqsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/friendRequests`));
    return () => unsubscribe();
  }, [user]);

  // Fetch user chats (for last messages, pinning, hiding and nicknames)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsMap: { [key: string]: any } = {};
      snapshot.docs.forEach((d) => {
        chatsMap[d.id] = d.data();
      });
      setChats(chatsMap);
    }, (error) => {
      console.error("Error fetching chats metadata:", error);
    });
    return () => unsubscribe();
  }, [user]);

  // Incremental Search
  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const q = query(
          collection(db, 'publicProfiles'),
          where('username', '>=', searchQuery.toLowerCase()),
          where('username', '<=', searchQuery.toLowerCase() + '\uf8ff')
        );
        
        const qName = query(
          collection(db, 'publicProfiles'),
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );

        const [usernameSnap, nameSnap] = await Promise.all([
          getDocs(q),
          getDocs(qName)
        ]);

        const resultsMap = new Map();
        
        usernameSnap.docs.forEach(doc => {
          if (doc.id !== user.uid) {
            resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });

        nameSnap.docs.forEach(doc => {
          if (doc.id !== user.uid) {
            resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });

        const results = Array.from(resultsMap.values());

        // Check relationship status for each result
        const resultsWithStatus = await Promise.all(results.map(async (res) => {
          const friendDoc = await getDoc(doc(db, `users/${user.uid}/friends`, res.id));
          const sentRequestDoc = await getDoc(doc(db, `users/${res.id}/friendRequests`, user.uid));
          const receivedRequestDoc = await getDoc(doc(db, `users/${user.uid}/friendRequests`, res.id));

          return {
            ...res,
            isFriend: friendDoc.exists(),
            hasSentRequest: sentRequestDoc.exists(),
            hasReceivedRequest: receivedRequestDoc.exists()
          };
        }));

        setSearchResults(resultsWithStatus);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const sendFriendRequest = async (targetUid: string) => {
    if (!user || !profile?.username) {
      toast.error("Please set a username first");
      return;
    }
    try {
      const requestRef = doc(db, `users/${targetUid}/friendRequests`, user.uid);
      await setDoc(requestRef, {
        fromUid: user.uid,
        fromUsername: profile.username,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success("Friend request sent!");
      setSearchResults(prev => prev.map(res => 
        res.id === targetUid ? { ...res, hasSentRequest: true } : res
      ));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${targetUid}/friendRequests/${user.uid}`);
    }
  };

  const acceptRequest = async (request: any) => {
    if (!user || !profile?.username) return;
    try {
      const senderProfile = request.senderProfile;
      await setDoc(doc(db, `users/${user.uid}/friends`, request.fromUid), {
        friendUid: request.fromUid,
        friendUsername: senderProfile.username,
        createdAt: serverTimestamp()
      });
      await setDoc(doc(db, `users/${request.fromUid}/friends`, user.uid), {
        friendUid: user.uid,
        friendUsername: profile.username,
        createdAt: serverTimestamp()
      });
      await deleteDoc(doc(db, `users/${user.uid}/friendRequests`, request.id));
      
      await setDoc(doc(collection(db, `users/${request.fromUid}/notifications`)), {
        title: 'Friend Request Accepted',
        message: `${profile?.name || 'Someone'} accepted your friend request!`,
        type: 'friend_accepted',
        relatedUid: user.uid,
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success("Friend request accepted!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/friends/${request.fromUid}`);
    }
  };

  const rejectRequest = async (requestId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/friendRequests`, requestId));
      toast.success("Friend request rejected");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/friendRequests/${requestId}`);
    }
  };

  // Improved Press Handlers for reliable navigation vs long-press
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent, friend: any) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    pressStartPosRef.current = { x, y };
    
    isPressingRef.current = true;
    longPressDetectedRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      if (isPressingRef.current) {
        longPressDetectedRef.current = true;
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(40);
          } catch (err) {}
        }
        setSelectedFriendForMenu(friend);
      }
    }, 600);
  };

  const handlePressEnd = (e: React.MouseEvent | React.TouchEvent, friend: any) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    isPressingRef.current = false;
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    
    if (longPressDetectedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      // Check movement threshold to prevent navigation on scroll
      if (pressStartPosRef.current) {
        const x = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
        const y = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
        const dist = Math.sqrt(Math.pow(x - pressStartPosRef.current.x, 2) + Math.pow(y - pressStartPosRef.current.y, 2));
        
        if (dist < 10) {
          navigate(`/chat/${friend.id}`);
        }
      }
    }
    pressStartPosRef.current = null;
  };

  const handlePressCancel = () => {
    // If movement is detected, cancel the long press
    isPressingRef.current = false;
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  const handleUpdateNickname = async () => {
    if (!user || !selectedFriendForMenu) return;
    const chatId = [user.uid, selectedFriendForMenu.id].sort().join('_');
    try {
      const chatData = chats[chatId] || {};
      const newNicknames = { ...(chatData.nicknames || {}), [selectedFriendForMenu.id]: tempNickname.trim() };
      
      await setDoc(doc(db, 'chats', chatId), {
        nicknames: newNicknames,
        updatedAt: serverTimestamp(),
        participants: [user.uid, selectedFriendForMenu.id].sort()
      }, { merge: true });

      setShowNicknameModal(false);
      setSelectedFriendForMenu(null);
      toast.success("Nickname updated!");
    } catch (error) {
      console.error("Error setting nickname:", error);
      toast.error("Failed to update nickname");
    }
  };

  const handleTogglePin = async (friend: any) => {
    if (!user) return;
    const chatId = [user.uid, friend.id].sort().join('_');
    const isPinned = chats[chatId]?.pinned?.[user.uid] === true;
    
    // 1. Optimistic UI update for instant response
    setChats(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        participants: [user.uid, friend.id].sort(),
        pinned: {
          ...(prev[chatId]?.pinned || {}),
          [user.uid]: !isPinned
        }
      }
    }));

    try {
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.uid, friend.id].sort(),
        pinned: {
          [user.uid]: !isPinned
        }
      }, { merge: true });
      toast.success(!isPinned ? "Conversation pinned" : "Conversation unpinned");
      setSelectedFriendForMenu(null);
    } catch (error) {
      console.error("Error pinning chat:", error);
      // Revert state on actual error
      setChats(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          pinned: {
            ...(prev[chatId]?.pinned || {}),
            [user.uid]: isPinned
          }
        }
      }));
      toast.error("Failed to toggle pin state");
    }
  };

  // New Mute Logic
  const handleToggleMute = async (friend: any) => {
    if (!user) return;
    const chatId = [user.uid, friend.id].sort().join('_');
    const isMuted = chats[chatId]?.muted?.[user.uid] === true;

    // 1. Optimistic UI update for instant response
    setChats(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        participants: [user.uid, friend.id].sort(),
        muted: {
          ...(prev[chatId]?.muted || {}),
          [user.uid]: !isMuted
        }
      }
    }));

    try {
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.uid, friend.id].sort(),
        muted: {
          [user.uid]: !isMuted
        }
      }, { merge: true });
      toast.success(!isMuted ? "Notifications muted" : "Notifications unmuted");
      setSelectedFriendForMenu(null);
    } catch (error) {
      console.error("Error muting chat:", error);
      // Revert state on actual error
      setChats(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          muted: {
            ...(prev[chatId]?.muted || {}),
            [user.uid]: isMuted
          }
        }
      }));
      toast.error("Failed to toggle mute state");
    }
  };

  const handleDeleteChatFromList = (friend: any) => {
    if (!user) return;
    const friendName = chats[[user.uid, friend.id].sort().join('_')]?.nicknames?.[friend.id] || friend.name || friend.username || 'this user';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Chat from List',
      description: `Are you sure you want to delete the chat history with "${friendName}" from your active chat list? This can be restored if they message you again.`,
      confirmText: 'Delete Chat',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        const chatId = [user.uid, friend.id].sort().join('_');
        
        // Optimistic UI state update
        setChats(prev => ({
          ...prev,
          [chatId]: {
            ...prev[chatId],
            participants: [user.uid, friend.id].sort(),
            deletedFromList: {
              ...(prev[chatId]?.deletedFromList || {}),
              [user.uid]: true
            }
          }
        }));

        try {
          await setDoc(doc(db, 'chats', chatId), {
            participants: [user.uid, friend.id].sort(),
            deletedFromList: {
              [user.uid]: true
            }
          }, { merge: true });
          toast.success("Chat hidden from your active list");
          setSelectedFriendForMenu(null);
        } catch (error) {
          console.error("Error hiding chat:", error);
          toast.error("Failed to delete chat from list");
        }
      }
    });
  };

  const handleRemoveFriend = (friend: any) => {
    if (!user) return;
    const friendName = chats[[user.uid, friend.id].sort().join('_')]?.nicknames?.[friend.id] || friend.name || friend.username || 'this user';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Friend',
      description: `Are you sure you want to remove "${friendName}" from your friends? This will delete your mutual connections.`,
      confirmText: 'Remove Friend',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        // Optimistic UI update
        const originalFriends = [...friends];
        setFriends(prev => prev.filter(f => f.id !== friend.id));

        try {
          await deleteDoc(doc(db, `users/${user.uid}/friends`, friend.id));
          await deleteDoc(doc(db, `users/${friend.id}/friends`, user.uid));
          toast.success("Friend removed successfully");
          setSelectedFriendForMenu(null);
        } catch (error) {
          console.error("Error removing friend:", error);
          setFriends(originalFriends);
          toast.error("Failed to remove friend");
        }
      }
    });
  };

  const formatLastMsgTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toMillis ? new Date(timestamp.toMillis()) : (timestamp.seconds ? new Date(timestamp.seconds * 1000) : null);
    if (!date) return '';
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const sortedFriends = [...friends]
    .filter(friend => {
      const matchesSearch = (friend.name?.toLowerCase().includes(friendsSearchQuery.toLowerCase())) || 
                           (friend.username?.toLowerCase().includes(friendsSearchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      if (!friendsSearchQuery) {
        const chatId = [user?.uid, friend.id].sort().join('_');
        const chatData = chats[chatId];
        if (chatData?.deletedFromList?.[user?.uid!] === true) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const chatIdA = [user?.uid, a.id].sort().join('_');
      const chatIdB = [user?.uid, b.id].sort().join('_');
      const chatA = chats[chatIdA];
      const chatB = chats[chatIdB];

      const pinA = chatA?.pinned?.[user?.uid!] ? 1 : 0;
      const pinB = chatB?.pinned?.[user?.uid!] ? 1 : 0;

      if (pinA !== pinB) {
        return pinB - pinA;
      }

      const timeA = chatA?.lastMessageAt ? (chatA.lastMessageAt.toMillis ? chatA.lastMessageAt.toMillis() : (chatA.lastMessageAt.seconds ? chatA.lastMessageAt.seconds * 1000 : 0)) : 0;
      const timeB = chatB?.lastMessageAt ? (chatB.lastMessageAt.toMillis ? chatB.lastMessageAt.toMillis() : (chatB.lastMessageAt.seconds ? chatB.lastMessageAt.seconds * 1000 : 0)) : 0;
      
      if (timeA !== timeB) return timeB - timeA;

      const nameA = a.name || a.username || '';
      const nameB = b.name || b.username || '';
      return nameA.localeCompare(nameB);
    });

  return (
    <div className="p-6 pt-12 min-h-screen bg-[#FDFBF7] dark:bg-gray-900 pb-32 transition-colors duration-300">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Social</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
        {(['friends', 'requests', 'add'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === tab 
                ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm scale-[1.02]' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'friends' && `Friends`}
            {tab === 'requests' && 'Requests'}
            {tab === 'add' && 'Add'}
            {tab === 'requests' && requests.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {activeTab === 'friends' && (
            <>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={friendsSearchQuery}
                  onChange={(e) => setFriendsSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-gray-900 dark:text-white shadow-sm text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                {friendsSearchQuery && (
                  <button 
                    onClick={() => setFriendsSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {sortedFriends.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-orange-500 opacity-40" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {friendsSearchQuery ? 'No friends match your search' : 'No friends yet'}
                  </p>
                  {!friendsSearchQuery && (
                    <button onClick={() => setActiveTab('add')} className="mt-4 text-orange-500 text-sm font-bold hover:underline">Find people to follow</button>
                  )}
                </div>
              ) : (
                sortedFriends.map(friend => {
                  if (!user) return null;
                  const chatId = [user.uid, friend.id].sort().join('_');
                  const chatData = chats[chatId];
                  const isPinned = chatData?.pinned?.[user.uid] === true;
                  const friendNickname = chatData?.nicknames?.[friend.id] || friend.name || friend.username;
                  const lastMsg = chatData?.lastMessage || '';
                  const lastMsgTime = chatData?.lastMessageAt;

                  return (
                    <div 
                      key={friend.id} 
                      onTouchStart={(e) => handlePressStart(e, friend)}
                      onTouchEnd={(e) => handlePressEnd(e, friend)}
                      onTouchMove={handlePressCancel}
                      onMouseDown={(e) => handlePressStart(e, friend)}
                      onMouseUp={(e) => handlePressEnd(e, friend)}
                      onMouseLeave={handlePressCancel}
                      className={`p-4 rounded-3xl shadow-sm flex items-center justify-between group hover:shadow-md transition-all border select-none cursor-pointer duration-300 ${
                        isPinned 
                          ? 'bg-orange-500/[0.03] border-orange-500/20 dark:bg-orange-500/[0.02] dark:border-orange-500/20' 
                          : 'bg-white dark:bg-gray-800 border-transparent hover:border-orange-500/10'
                      }`}
                      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 overflow-hidden border border-orange-500/15 shadow-sm relative shrink-0">
                          <img src={getAvatarUrl(friend)} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-extrabold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors truncate text-sm">
                              {friendNickname}
                            </h3>
                            {isPinned && (
                              <span className="inline-flex items-center justify-center p-0.5 rounded-full bg-orange-500/10 text-orange-500">
                                <Pin className="w-3 h-3 fill-orange-500" />
                              </span>
                            )}
                            {chats[chatId]?.muted?.[user.uid] && (
                              <span className="inline-flex items-center justify-center p-0.5 rounded-full bg-gray-500/10 text-gray-500">
                                <BellOff className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          
                          {lastMsg ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5 max-w-[100%] leading-relaxed">
                              {lastMsg}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5 font-medium">@{friend.username}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Rightmost column for timing indicator & secondary options */}
                        <div className="flex flex-col items-end gap-1.5">
                          {lastMsgTime && (
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                              {formatLastMsgTime(lastMsgTime)}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            {/* Tap here for instant Options Trigger (Accessible fallback for all browser habits) */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSelectedFriendForMenu(friend);
                              }}
                              className="w-8 h-8 rounded-lg bg-gray-100/50 hover:bg-orange-500/10 dark:bg-gray-700/50 hover:text-orange-500 dark:text-gray-400 transition-colors flex items-center justify-center cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            
                            <Link 
                              to={`/chat/${friend.id}`} 
                              onClick={(e) => e.stopPropagation()}
                              className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm group-hover:shadow-orange-500/20 cursor-pointer"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              {requests.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No pending requests</p>
                </div>
              ) : (
                requests.map(request => (
                  <div key={request.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 overflow-hidden border-2 border-white dark:border-gray-700">
                        <img src={getAvatarUrl(request.senderProfile)} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{request.senderProfile?.name}</h3>
                        <p className="text-xs text-orange-500 font-medium">@{request.senderProfile?.username}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptRequest(request)} 
                        className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => rejectRequest(request.id)} 
                        className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'add' && (
            <div>
              <form onSubmit={handleSearch} className="relative mb-8">
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl pl-14 pr-4 py-5 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-gray-900 dark:text-white shadow-sm"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <button 
                  type="submit" 
                  disabled={isSearching} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                  {isSearching ? '...' : 'Search'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-2">Search Results</h3>
                  {searchResults.map(result => {
                    return (
                      <div key={result.id} className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm flex items-center justify-between border border-transparent hover:border-orange-500/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                            <img src={getAvatarUrl(result)} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{result.name}</h3>
                            <p className="text-sm text-orange-500 font-medium">@{result.username}</p>
                          </div>
                        </div>
                        {result.isFriend ? (
                          <div className="flex items-center gap-2 text-gray-400 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-xl text-xs font-bold">
                            <UserCheck className="w-4 h-4" />
                            Friends
                          </div>
                        ) : result.hasSentRequest ? (
                          <div className="flex items-center gap-2 text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl text-xs font-bold">
                            <Clock className="w-4 h-4" />
                            Pending
                          </div>
                        ) : result.hasReceivedRequest ? (
                          <button 
                            onClick={() => setActiveTab('requests')} 
                            className="bg-green-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                          >
                            View Request
                          </button>
                        ) : (
                          <button 
                            onClick={() => sendFriendRequest(result.id)} 
                            className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95"
                          >
                            <UserPlus className="w-4 h-4" /> Add Friend
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Friend Context / Options Sheets & Dialogues */}
      <AnimatePresence>
        {selectedFriendForMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFriendForMenu(null)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-[2px]"
            />

            {/* Bottom Sheet Modal / Options Container */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.1, bottom: 0.8 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100 || info.velocity.y > 400) {
                  setSelectedFriendForMenu(null);
                }
              }}
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-t-[32px] shadow-2xl z-[110] flex flex-col max-h-[60vh] border-t border-gray-100 dark:border-gray-700"
            >
              {/* Drag Handle Bar */}
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-750 rounded-full mx-auto my-3 shrink-0 cursor-row-resize" />

              {/* Scrollable Container Wrapper */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 select-none scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                {/* Header profile info */}
                <div className="flex items-center gap-4 mb-6 pt-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 overflow-hidden border border-orange-500/20">
                    <img src={getAvatarUrl(selectedFriendForMenu)} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                      {chats[[user?.uid || '', selectedFriendForMenu.id].sort().join('_')]?.nicknames?.[selectedFriendForMenu.id] || selectedFriendForMenu.name || selectedFriendForMenu.username}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">@{selectedFriendForMenu.username}</p>
                  </div>
                </div>

                {/* Options list */}
                <div className="space-y-1.5">
                  {/* Pin Option */}
                  <button
                    onClick={() => handleTogglePin(selectedFriendForMenu)}
                    className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-orange-500/10 dark:bg-gray-800 dark:border dark:border-gray-700/80 dark:hover:bg-gray-700 hover:text-orange-500 text-gray-700 dark:text-gray-200 font-bold text-sm tracking-wide flex items-center gap-3.5 transition-all text-left cursor-pointer"
                  >
                    {chats[[user?.uid || '', selectedFriendForMenu.id].sort().join('_')]?.pinned?.[user?.uid || ''] ? (
                      <>
                        <PinOff className="w-5 h-5 text-orange-500 animate-pulse" />
                        Unpin Conversation
                      </>
                    ) : (
                      <>
                        <Pin className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-orange-500" />
                        Pin Conversation
                      </>
                    )}
                  </button>

                  {/* Mute Option */}
                  <button
                    onClick={() => handleToggleMute(selectedFriendForMenu)}
                    className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-orange-500/10 dark:bg-gray-800 dark:border dark:border-gray-700/80 dark:hover:bg-gray-700 hover:text-orange-500 text-gray-700 dark:text-gray-200 font-bold text-sm tracking-wide flex items-center gap-3.5 transition-all text-left cursor-pointer"
                  >
                    {chats[[user?.uid || '', selectedFriendForMenu.id].sort().join('_')]?.muted?.[user?.uid || ''] ? (
                      <>
                        <Bell className="w-5 h-5 text-orange-500 animate-pulse" />
                        Unmute Notifications
                      </>
                    ) : (
                      <>
                        <BellOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        Mute Notifications
                      </>
                    )}
                  </button>

                  {/* Nickname Option */}
                  <button
                    onClick={() => {
                      const chatId = [user?.uid || '', selectedFriendForMenu.id].sort().join('_');
                      setTempNickname(chats[chatId]?.nicknames?.[selectedFriendForMenu.id] || selectedFriendForMenu.name || '');
                      setShowNicknameModal(true);
                    }}
                    className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-orange-500/10 dark:bg-gray-800 dark:border dark:border-gray-700/80 dark:hover:bg-gray-700 hover:text-orange-500 text-gray-700 dark:text-gray-200 font-bold text-sm tracking-wide flex items-center gap-3.5 transition-all text-left cursor-pointer"
                  >
                    <Pencil className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    Edit Nickname
                  </button>

                  {/* Visit profile Option */}
                  <button
                    onClick={() => {
                      setSelectedFriendForMenu(null);
                      navigate(`/profile/${selectedFriendForMenu.id}`);
                    }}
                    className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-orange-500/10 dark:bg-gray-800 dark:border dark:border-gray-700/80 dark:hover:bg-gray-700 hover:text-orange-500 text-gray-700 dark:text-gray-200 font-bold text-sm tracking-wide flex items-center gap-3.5 transition-all text-left cursor-pointer"
                  >
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    Visit Friend's Profile
                  </button>

                  {/* Hide / Delete chat from list Option */}
                  <button
                    onClick={() => handleDeleteChatFromList(selectedFriendForMenu)}
                    className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-orange-500/10 dark:bg-gray-800 dark:border dark:border-gray-700/80 dark:hover:bg-gray-700 hover:text-orange-500 text-gray-700 dark:text-gray-200 font-bold text-sm tracking-wide flex items-center gap-3.5 transition-all text-left cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    Delete Chat from List
                  </button>

                  {/* Remove friend Option */}
                  <button
                    onClick={() => handleRemoveFriend(selectedFriendForMenu)}
                    className="w-full p-4 rounded-xl bg-red-50 hover:bg-red-500/10 dark:bg-red-950/20 text-red-500 font-bold text-sm tracking-wide flex items-center gap-3.5 transition-all text-left mt-2 cursor-pointer"
                  >
                    <UserMinus className="w-5 h-5 text-red-500" />
                    Remove Friend
                  </button>
                </div>

                {/* Close Bottom Sheet Button */}
                <button
                  onClick={() => setSelectedFriendForMenu(null)}
                  className="w-full mt-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-extrabold text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 uppercase tracking-widest cursor-pointer"
                >
                  Close
                </button>

                {/* Bottom Navigation Spacer (safeguard) */}
                <div className="h-20 select-none pointer-events-none" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Nickname modification sub-modal */}
      <AnimatePresence>
        {showNicknameModal && selectedFriendForMenu && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNicknameModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[1px]"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 p-6 rounded-[28px] max-w-xs w-full shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-base font-extrabold text-gray-950 dark:text-white mb-1.5">Set Custom Nickname</h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                Add a nickname for <strong>@{selectedFriendForMenu.username}</strong> or clear it to restore default.
              </p>

              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder="Enter custom nickname..."
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white mb-4 placeholder-gray-400 shadow-inner"
                maxLength={36}
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowNicknameModal(false)}
                  className="flex-1 py-3 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 rounded-xl transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateNickname}
                  className="flex-1 py-3 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors shadow-lg shadow-orange-500/20 uppercase tracking-wider"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Popup Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            />
            
            {/* Confirmation Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-gray-800 p-6 rounded-[28px] max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 z-[101]"
            >
              <h3 className="text-lg font-extrabold text-gray-950 dark:text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                {confirmDialog.description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 rounded-2xl transition-all uppercase tracking-wider"
                >
                  {confirmDialog.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`flex-1 py-3.5 text-xs font-bold text-white rounded-2xl transition-all shadow-lg uppercase tracking-wider ${
                    confirmDialog.isDestructive 
                      ? 'bg-red-500 hover:bg-red-650 shadow-red-500/10' 
                      : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/10'
                  }`}
                >
                  {confirmDialog.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
