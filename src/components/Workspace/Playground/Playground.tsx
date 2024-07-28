import React, { useState, useEffect } from "react";
import axios from "axios";
import EditorFooter from "./EditorFooter";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";

const Playground: React.FC = () => {
  const [user] = useAuthState(auth);
  const [userCode, setUserCode] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const { query: { pid } } = useRouter();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadedImage(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to submit your work", { position: "top-center", autoClose: 3000, theme: "dark" });
      return;
    }

    const formData = new FormData();
    formData.append("userCode", userCode);
    if (uploadedImage) {
      formData.append("image", uploadedImage);
    }

    try {
      const response = await axios.post("/api/validate-math", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { success, feedback, optimalSolution } = response.data;

      if (success) {
        toast.success("Congrats! You got it correct!", { position: "top-center", autoClose: 3000, theme: "dark" });

        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, {
          solvedProblems: arrayUnion(pid),
        });

        // Display the optimal solution and feedback
        console.log("Optimal Solution:", optimalSolution);
        console.log("Feedback:", feedback);

      } else {
        toast.error(feedback || "Oops! That was not quite right.", { position: "top-center", autoClose: 3000, theme: "dark" });
      }
    } catch (error: any) {
      toast.error(error.message, { position: "top-center", autoClose: 3000, theme: "dark" });
    }
  };

  useEffect(() => {
    const code = localStorage.getItem(`code-${pid}`);
    setUserCode(code ? JSON.parse(code) : "");
  }, [pid]);

  const onChange = (value: string) => {
    setUserCode(value);
    localStorage.setItem(`code-${pid}`, JSON.stringify(value));
  };

  return (
    <div className='flex flex-col bg-dark-layer-1 relative overflow-x-hidden'>
      <textarea
        className='w-full h-2/3 p-4 bg-dark-fill-3 text-white'
        placeholder='Write your thought process here...'
        value={userCode}
        onChange={(e) => onChange(e.target.value)}
      />
      <input type='file' accept='image/*' onChange={handleImageUpload} className='mt-4 mb-4' />
      <EditorFooter handleSubmit={handleSubmit} />
    </div>
  );
};

export default Playground;
