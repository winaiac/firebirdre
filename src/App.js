/* global __firebase_config, __initial_auth_token, __app_id */
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

// World ID SDK - The script below adds the World ID library to your project.
// MAKE SURE TO REPLACE "YOUR_APP_ID_HERE" WITH YOUR ACTUAL APP ID
const WORLD_ID_APP_ID = "app_b67c4099dbab19c76ac3cae0a78a89f0"; // <-- REPLACE THIS WITH YOUR REAL APP ID
const WorldIDScript = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://js.worldcoin.org/v2/worldcoin.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);
    return null;
};

// Custom CSS for aesthetic improvements and responsive design
// In a real React project, this would be in a separate CSS file.
const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
  body {
    font-family: 'Inter', sans-serif;
    background-color: #f7fafc;
    color: #1a202c;
    margin: 0;
    padding: 0;
  }
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 2rem;
  }
  .header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .card {
    background-color: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 2rem;
    margin: 1rem auto;
    width: 100%;
    max-width: 900px;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  .form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .form-group input, .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-size: 1rem;
    box-sizing: border-box;
  }
  .submit-button {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-color: #4a5568;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s ease-in-out;
  }
  .submit-button:hover {
    background-color: #2d3748;
  }
  .worldcoin-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: #3b82f6;
    color: #fff;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-weight: bold;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s ease-in-out;
  }
  .worldcoin-button:hover {
    background-color: #2563eb;
  }
  .github-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
    color: #4a5568;
    text-decoration: none;
    transition: color 0.2s ease-in-out;
  }
  .github-link:hover {
    color: #2d3748;
  }
  .footer {
    text-align: center;
    margin-top: auto;
    padding-top: 2rem;
    color: #718096;
  }
  .message-box {
    position: fixed;
    top: 50%;
    left: 50import React, { useState, useEffect } from 'react';
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
    if (!loading) {
      const unsubscribe = onSnapshot(promotionDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPromotionText(data.text);
          setEditorText(data.text);
        } else {
          // Set initial default text if the document does not exist.
          const defaultText = `🎁 โปรโมชั่นพิเศษ\nแจกคริปโต มูลค่า 1,900 บาท จำกัดจำนวน 8 คนเท่านั้น!\n1. ลงทะเบียน World ID\nคลิก: https://world.org/join/OD4QYLW`;
          setPromotionText(defaultText);
          setEditorText(defaultText);
          setDoc(promotionDocRef, { text: defaultText });
        }
      });
      return () => unsubscribe();
    }
  }, [loading]);

  // Handle World ID verification
  const handleVerification = (proof) => {
    setVerificationStatus('กำลังตรวจสอบหลักฐาน...');
    console.log('Verification proof:', proof);

    // IMPORTANT: In a real app, you would send this proof to a secure backend API
    // and verify it there. For this example, we will just simulate success.
    // ในแอปจริง คุณต้องส่ง proof นี้ไปตรวจสอบที่เซิร์ฟเวอร์
    setTimeout(() => {
      setIsVerified(true);
      setVerificationStatus('✅ ยืนยันตัวตนสำเร็จ!');
    }, 2000);
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
              />
              <div className="flex justify-between items-center mt-4">
                <button
                  className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                  onClick={handleSave}
                >
                  บันทึก
                </button>
                {saveStatus && (
                  <p className={`text-sm font-semibold ${saveStatus.includes('สำเร็จ') ? 'text-green-600' : 'text-red-600'}`}>
                    {saveStatus}
                  </p>
                )}
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
%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    text-align: center;
    max-width: 400px;
  }
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

// Helper function to create a placeholder message box instead of alert()
const showMessageBox = (message, title = 'Message', callback = () => {}) => {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  const messageBox = document.createElement('div');
  messageBox.className = 'message-box';
  messageBox.innerHTML = `
    <h3 class="font-bold text-lg">${title}</h3>
    <p class="py-4">${message}</p>
    <div class="modal-action">
      <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onclick="this.parentNode.parentNode.parentNode.remove()">Close</button>
    </div>
  `;
  overlay.appendChild(messageBox);
  document.body.appendChild(overlay);
  if (callback) {
    overlay.querySelector('button').onclick = () => {
      overlay.remove();
      callback();
    };
  }
};

const App = () => {
    // Check for Canvas global variables and provide local fallbacks
    // *** PLEASE REPLACE THE VALUES BELOW WITH YOUR OWN FIREBASE CONFIG FROM THE CONSOLE ***
    const canvasConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
           apiKey: "AIzaSyC7SndaantjLriJSJQ_e818X8RLVPSJX_M",
  authDomain: "winai-portfolio.firebaseapp.com",
  projectId: "winai-portfolio",
  storageBucket: "winai-portfolio.firebasestorage.app",
  messagingSenderId: "108901072884",
  appId: "1:108901072884:web:0b66713e4a36421e0f03a1",
  measurementId: "G-X84YQD7M6S"



    };
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    const [db, setDb] = useState(null);
    const [userId, setUserId] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [worldcoinResponse, setWorldcoinResponse] = useState(null);
    const [formStatus, setFormStatus] = useState('');

    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                const app = initializeApp(canvasConfig);
                const firestore = getFirestore(app);
                const auth = getAuth(app);
                setDb(firestore);

                // Sign in using the provided token or anonymously for local testing
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        setUserId(user.uid);
                    } else {
                        // If token is available, sign in with it. Otherwise, sign in anonymously.
                        if (initialAuthToken) {
                            try {
                                await signInWithCustomToken(auth, initialAuthToken);
                            } catch (error) {
                                console.error("Error signing in with custom token:", error);
                                await signInAnonymously(auth);
                            }
                        } else {
                            await signInAnonymously(auth);
                        }
                    }
                });
            } catch (error) {
                console.error("Error initializing Firebase:", error);
            }
        };

        if (!db) {
            initializeFirebase();
        }
    }, [db, initialAuthToken, canvasConfig]);

    const handleGeneralContactSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('Sending...');

        if (!db || !userId) {
            console.error("Firestore or user not initialized.");
            showMessageBox("Database connection failed. Please try again.", "Error");
            setFormStatus('');
            return;
        }

        const newContact = {
            name,
            email,
            message,
            timestamp: serverTimestamp(),
            submittedBy: userId,
        };

        try {
            const contactsCollectionPath = `artifacts/${appId}/public/data/contacts`;
            await addDoc(collection(db, contactsCollectionPath), newContact);
            setFormStatus('Message Sent!');
            setName('');
            setEmail('');
            setMessage('');
            showMessageBox("Thank you for your message!", "Success");
        } catch (error) {
            console.error("Error submitting contact form:", error);
            setFormStatus('Failed');
            showMessageBox("Failed to send message. Please try again later.", "Error");
        }
    };

    const handleWorldcoinContactSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('Sending...');

        if (!db || !userId || !worldcoinResponse) {
            console.error("Firestore, user, or Worldcoin response not initialized.");
            showMessageBox("Please verify with World ID first.", "Error");
            setFormStatus('');
            return;
        }

        const worldcoinContact = {
            ...worldcoinResponse,
            name,
            email,
            message,
            timestamp: serverTimestamp(),
            submittedBy: userId,
        };

        try {
            const worldcoinContactsCollectionPath = `artifacts/${appId}/public/data/worldcoin_contacts`;
            await addDoc(collection(db, worldcoinContactsCollectionPath), worldcoinContact);
            setFormStatus('World ID Verified & Message Sent!');
            setName('');
            setEmail('');
            setMessage('');
            setWorldcoinResponse(null);
            showMessageBox("Thank you for your World ID verified message!", "Success");
        } catch (error) {
            console.error("Error submitting World ID contact form:", error);
            setFormStatus('Failed');
            showMessageBox("Failed to send message. Please try again later.", "Error");
        }
    };

    // New World ID component and logic to handle the real verification
    const WorldIDButton = () => {
        useEffect(() => {
            if (window.WorldID) {
                window.WorldID.init("world-id-container", {
                    // This is your App ID from the Worldcoin Developer Portal
                    app_id: WORLD_ID_APP_ID, 
                    // This is your Action ID. If you have a specific action, replace this placeholder.
                    // หากคุณมี Action ID ที่ใช้ในการระบุการกระทำที่เฉพาะเจาะจง ให้ใส่ที่นี่ครับ
                    action_id: "YOUR_ACTION_ID_HERE", 
                    signal: userId || '', // Use the anonymous user ID as a signal
                    enable_telemetry: true,
                    onSuccess: (result) => {
                        console.log("World ID verified successfully!", result);
                        setWorldcoinResponse(result);
                        showMessageBox("World ID verified successfully! You can now send your message.", "Verification Success");
                    },
                    onError: (error) => {
                        console.error("World ID verification failed:", error);
                        showMessageBox("World ID verification failed. Please try again.", "Verification Error");
                    },
                });
            }
        }, [userId]);

        return (
            <div id="world-id-container" className="mt-4">
                {/* The World ID widget will be rendered here */}
            </div>
        );
    };

    return (
        <>
            <WorldIDScript />
            <style>{customStyles}</style>
            <div className="app-container bg-gray-100 min-h-screen p-8 flex flex-col items-center">
                <header className="header max-w-4xl mx-auto text-center mb-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-800">Winai's Portfolio</h1>
                    <p className="text-lg md:text-xl text-gray-600">
                        A conceptual portfolio showcasing skills and secure contact forms.
                    </p>
                </header>

                <main className="flex-grow w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Contact Me</h2>
                        <p className="mb-6 text-gray-600">
                            Feel free to leave me a message. Your contact information will be securely stored in Firestore.
                        </p>
                        <form onSubmit={handleGeneralContactSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea id="message" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} required className="w-full p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"></textarea>
                            </div>
                            <button type="submit" className="submit-button">{formStatus || 'Send Message'}</button>
                        </form>
                    </div>

                    <div className="card flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">World ID Verified Contact</h2>
                            <p className="mb-6 text-gray-600">
                                This form uses World ID to verify you are a unique human. This is a conceptual implementation.
                            </p>
                            <form onSubmit={handleWorldcoinContactSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name_worldcoin">Name</label>
                                    <input type="text" id="name_worldcoin" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email_worldcoin">Email</label>
                                    <input type="email" id="email_worldcoin" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message_worldcoin">Message</label>
                                    <textarea id="message_worldcoin" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} required className="w-full p-3 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"></textarea>
                                </div>
                                <WorldIDButton />
                                {worldcoinResponse && (
                                    <button type="submit" className="submit-button mt-4">
                                        {formStatus || 'Send World ID Verified Message'}
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
                </main>

                <footer className="footer text-center w-full max-w-4xl pt-8 mt-auto text-sm text-gray-500">
                    <p>Designed and created by Winai for a conceptual project.</p>
                    <a
                        href="https://github.com/winaiac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-link"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="h-6 w-6"><path fill="currentColor" fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                        <span>Visit my GitHub</span>
                    </a>
                </footer>
            </div>
        </>
    );
};

export default App;
