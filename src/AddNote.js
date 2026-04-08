import React, { useState } from "react";
import styled from "styled-components";
import firebase from "./firebase";
import { FiPlus, FiImage } from "react-icons/fi";
import { autoCategorizeNote } from "./utils/ai";

const AddNoteDiv = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--surface-color);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 600;
`;

const InputTitle = styled.input`
  padding: 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-color-light);
  color: var(--text-primary);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--focus-ring);
    background: rgba(255, 255, 255, 0.8);
  }
`;

const BodyTextArea = styled.textarea`
  padding: 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-color-light);
  color: var(--text-primary);
  border-radius: 12px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;

  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--focus-ring);
    background: rgba(255, 255, 255, 0.8);
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-color);
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.2);
  }

  input {
    display: none;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${props => props.isProcessing ? 'var(--accent-hover)' : 'var(--accent-color)'};
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 14px;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
  margin-top: 8px;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);

  &:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AddNote = ({ defaultFolder }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const compressImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const base64Data = canvas.toDataURL("image/jpeg", 0.6); 
          resolve(base64Data);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      const originalFile = e.target.files[0];
      if (originalFile.type.startsWith("image/")) {
        try {
          const base64 = await compressImageToBase64(originalFile);
          setImageFile(base64); 
        } catch (err) {
          console.error("Compression failed", err);
          setImageFile(null);
        }
      }
    }
  };

  const addNote = async () => {
    if (!title.trim() || !body.trim()) return;
    
    setIsProcessing(true);
    try {
      // Magically auto-categorize note with AI
      const aiResult = await autoCategorizeNote(title, body);
      
      const noteToSave = {
        title,
        body,
        folder: aiResult.category,
        tags: aiResult.tags,
        imageUrl: imageFile, 
        createdAt: new Date().toISOString()
      };

      await firebase.firestore().collection("notes").add(noteToSave);
      
      setTitle("");
      setBody("");
      setImageFile(null);
    } catch (error) {
      console.error("Error adding note", error);
      alert("Failed to add note: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AddNoteDiv>
      <FormTitle>✨ Magic Note</FormTitle>
      
      <InputGroup>
        <Label>Title</Label>
        <InputTitle 
          placeholder="What's this note about?" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
      </InputGroup>
      
      <InputGroup>
        <Label>Content (AI will read this to categorize!)</Label>
        <BodyTextArea 
          placeholder="Start typing your note here..." 
          value={body} 
          onChange={e => setBody(e.target.value)} 
        />
      </InputGroup>

      <InputGroup>
        <Label>Attachment (Optional)</Label>
        <FileInputLabel>
          <FiImage size={18} />
          {imageFile ? "Image Attached!" : "Upload an Image"}
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </FileInputLabel>
      </InputGroup>

      <Button 
        onClick={addNote} 
        disabled={!title.trim() || !body.trim() || isProcessing}
        isProcessing={isProcessing}
      >
        <FiPlus />
        {isProcessing ? "Adding & Categorizing..." : "Auto-Categorize & Add"}
      </Button>
    </AddNoteDiv>
  );
};

export default AddNote;
