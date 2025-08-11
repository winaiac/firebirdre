import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Configuration for Firebase, provided by the Canvas environment.
const firebaseConfig = JSON.parse(__firebase_config);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase services.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Use a specific document to store the promotion text
// This document is public and accessible to anyone.
const promotionDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'promotions', 'currentPromotion');

// World ID Configuration (CRITICAL: Replace with your actual App ID and Action ID)
// สำคัญ: กรุณาเปลี่ยนค่าด้านล่างด้วย App ID และ Action ID จริงจาก Worldcoin developer portal ของคุณ
const worldcoinAppId = 'app_5dd283fd2600523e413b9ab8adaba7fd'; // เปลี่ยนเป็น App ID ของคุณ
const worldcoinActionId = 'connect';      // เปลี่ยนเป็น Action ID ของคุณ

// The ID of the first user who signs in will be considered the "admin"
let adminUid = null;

// Add a script tag for the World ID SDK
const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/@worldcoin/idkit/build/idkit-js.js";
script.async = true;
document.head.appendChild(script);

export default function App() {
  // State variables for managing the app's data and UI.
  const [promotionText, setPromotionText] = useState('กำลังโหลด...');
  const [editorText, setEditorText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // Effect to handle anonymous sign-in and determine admin status.
  useEffect(() => {
    const signInAndCheckAdmin = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        setCurrentUser(user);
        
        // Check if an admin user already exists in Firestore.
        const adminDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'appSettings', 'admin');
        const adminDocSnap = await getDoc(adminDocRef);

        if (adminDocSnap.exists()) {
          adminUid = adminDocSnap.data().uid;
        } else {
          // If no admin exists, the current user becomes the admin.
          await setDoc(adminDocRef, { uid: user.uid });
          adminUid = user.uid;
        }
        
        setIsAdmin(user.uid === adminUid);
        setLoading(false);
      } catch (error) {
        console.error("Error during authentication or admin check:", error);
        setLoading(false);
      }
    };

    signInAndCheckAdmin();
  }, []);

  // Effect to listen for real-time changes to the promotion data.
  useEffect(() => {
    // Only subscribe to snapshot listener after user is authenticated.
    if (currentUser) {
      const unsubscribe = onSnapshot(promotionDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPromotionText(data.text);
          setEditorText(data.text);
        } else {
          // Set initial default text if the document does not exist.
          const defaultText = "โปรโมชั่นพิเศษ\n" +
                              "แจกคริปโต มูลค่า 1,900 บาท จำกัดจำนวน 8 คนเท่านั้น!\n" +
                              "1. ลงทะเบียน World ID\n" +
                              "คลิก: https://world.org/join/OD4QYLW";
          setPromotionText(defaultText);
          setEditorText(defaultText);
          setDoc(promotionDocRef, { text: defaultText });
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Handle World ID verification
  const handleVerification = (proof) => {
    setVerificationStatus('กำลังตรวจสอบหลักฐาน...');
    console.log('Verification proof:', proof);

    // IMPORTANT: In a real app, you would send this proof to a secure backend API
    // and verify it there. For this example, we will just simulate success.
    setTimeout(() => {
      setIsVerified(true);
      setVerificationStatus('✅ ยืนยันตัวตนสำเร็จ!');
    }, 2000);
  };
  
  // New function to handle Gemini API call for improving text
  const handleImproveText = async () => {
    if (!isAdmin) {
      setSaveStatus('คุณไม่มีสิทธิ์แก้ไขข้อความนี้');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }
    
    if (!editorText.trim()) {
      setSaveStatus('กรุณาใส่ข้อความที่ต้องการปรับปรุง');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    setGeminiLoading(true);
    setSaveStatus('AI กำลังปรับปรุงข้อความ...');

    try {
      const prompt = `Rewrite the following promotion text to be more engaging and persuasive in Thai:\n\n${editorText}`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      const newText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (newText) {
        setEditorText(newText.replace(/\\n/g, '\n').replace(/```/g, ''));
        setSaveStatus('ปรับปรุงข้อความเรียบร้อยแล้ว!');
      } else {
        setSaveStatus('ไม่สามารถปรับปรุงข้อความได้');
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setSaveStatus('เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
    } finally {
      setGeminiLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // New function to handle Gemini API call for generating new ideas
  const handleGenerateIdea = async () => {
    if (!isAdmin) {
      setSaveStatus('คุณไม่มีสิทธิ์แก้ไขข้อความนี้');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }
    setGeminiLoading(true);
    setSaveStatus('AI กำลังสร้างไอเดียโปรโมชั่น...');
    try {
      const prompt = "Generate a new and creative promotion idea for a cryptocurrency or financial service. The text should be concise, persuasive, and include a clear call to action, written in Thai.";
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      };
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      const newText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (newText) {
        setEditorText(newText.replace(/\\n/g, '\n').replace(/```/g, ''));
        setSaveStatus('สร้างไอเดียเรียบร้อยแล้ว! สามารถแก้ไขต่อได้');
      } else {
        setSaveStatus('ไม่สามารถสร้างไอเดียได้');
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setSaveStatus('เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
    } finally {
      setGeminiLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      setSaveStatus('คุณไม่มีสิทธิ์แก้ไขข้อความนี้');
      return;
    }

    setSaveStatus('กำลังบันทึก...');
    try {
      await setDoc(promotionDocRef, { text: editorText });
      setSaveStatus('บันทึกเรียบร้อย!');
    } catch (error) {
      console.error("Error updating document:", error);
      setSaveStatus('บันทึกไม่สำเร็จ: ' + error.message);
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center font-sans">
      <h1 className="text-4xl font-bold mb-8 text-indigo-800">ระบบจัดการโปรโมชั่น</h1>
      
      {loading ? (
        <p className="text-center text-lg text-gray-600">กำลังโหลด...</p>
      ) : (
        <>
          {/* Promotion Display Area */}
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">ข้อความโปรโมชั่นปัจจุบัน:</h2>
            <pre className="text-gray-700 whitespace-pre-wrap leading-relaxed font-sans text-lg">{promotionText}</pre>
          </div>
          
          {/* World ID Verification Section */}
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">ยืนยันตัวตนด้วย World ID</h2>
            {isVerified ? (
              <p className="mt-4 text-lg font-bold text-green-700">✅ ยินดีด้วย! คุณได้รับการยืนยันว่าเป็นมนุษย์แล้ว!</p>
            ) : (
              <>
                <div id="world-id-button" className="mx-auto my-4 w-fit"></div>
                <p className="mt-4 text-gray-600 font-medium">{verificationStatus}</p>
                <script type="text/javascript">
                  {`
                    window.onload = function() {
                      if (window.worldID) {
                        window.worldID.init(document.getElementById('world-id-button'), {
                          action: worldcoinActionId,
                          app_id: worldcoinAppId,
                          onSuccess: (proof) => handleVerification(proof),
                          onProof: (proof) => console.log('Proof received:', proof)
                        });
                      }
                    };
                  `}
                </script>
              </>
            )}
          </div>
          
          {/* Admin Panel */}
          {isAdmin && (
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">แก้ไขข้อความโปรโมชั่น (Admin Only)</h2>
              <textarea
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 font-sans text-base resize-none"
                value={editorText}
                onChange={(e) => setEditorText(e.target.value)}
                disabled={geminiLoading}
              />
              <div className="flex flex-col md:flex-row md:justify-between items-center mt-4 space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex space-x-2">
                  <button
                    className="bg-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105 disabled:bg-purple-400"
                    onClick={handleImproveText}
                    disabled={geminiLoading}
                  >
                    ✨ ปรับปรุงข้อความ
                  </button>
                  <button
                    className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-emerald-700 transition duration-300 transform hover:scale-105 disabled:bg-emerald-400"
                    onClick={handleGenerateIdea}
                    disabled={geminiLoading}
                  >
                    ✨ สร้างไอเดียใหม่
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 disabled:bg-indigo-400"
                    onClick={handleSave}
                    disabled={geminiLoading}
                  >
                    บันทึก
                  </button>
                  {saveStatus && (
                    <p className={`text-sm font-semibold ${saveStatus.includes('สำเร็จ') || saveStatus.includes('เรียบร้อย') ? 'text-green-600' : 'text-red-600'}`}>
                      {saveStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* User Info for debugging */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>User ID: {currentUser?.uid || 'N/A'}</p>
            <p className="text-xs">
              ** ผู้ใช้คนแรกที่เข้าสู่ระบบจะเป็น Admin **
            </p>
          </div>
        </>
      )}
    </div>
  );
}
