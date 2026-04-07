import React, { useState } from "react";
import styled from "styled-components";
import firebase from "./firebase";
import { FiPlus, FiImage } from "react-icons/fi";

const AddNoteDiv = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
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
  border: 1px solid var(--surface-color-light);
  background: var(--bg-color);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--focus-ring);
  }
`;

const BodyTextArea = styled.textarea`
  padding: 12px;
  border: 1px solid var(--surface-color-light);
  background: var(--bg-color);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;

  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--focus-ring);
  }
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px dashed var(--surface-color-light);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-color);
    color: var(--text-primary);
  }

  input {
    display: none;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid var(--surface-color-light);
  background: var(--bg-color);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  cursor: pointer;

  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--focus-ring);
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--accent-color);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  margin-top: 8px;

  &:hover {
    background: var(--accent-hover);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FOLDERS = ["Personal", "Work", "Study"];

const AddNote = ({ defaultFolder }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [folder, setFolder] = useState(defaultFolder || "Personal");
  const [imageFile, setImageFile] = useState(null);

  React.useEffect(() => {
    if (defaultFolder) {
      setFolder(defaultFolder);
    }
  }, [defaultFolder]);

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

  const addNote = () => {
    if (!title.trim() || !body.trim()) return;
    
    const noteToSave = {
      title,
      body,
      folder,
      imageUrl: imageFile, 
      createdAt: new Date().toISOString()
    };

    setTitle("");
    setBody("");
    setImageFile(null);

    firebase
      .firestore()
      .collection("notes")
      .add(noteToSave)
      .catch((error) => {
        console.error("Error adding note", error);
        alert("Failed to add note: " + error.message);
      });
  };

  return (
    <AddNoteDiv>
      <FormTitle>Create New Note</FormTitle>
      
      <InputGroup>
        <Label>Folder</Label>
        <Select value={folder} onChange={e => setFolder(e.target.value)}>
          {FOLDERS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </Select>
      </InputGroup>

      <InputGroup>
        <Label>Title</Label>
        <InputTitle 
          placeholder="What's this note about?" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
      </InputGroup>
      
      <InputGroup>
        <Label>Content</Label>
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
        disabled={!title.trim() || !body.trim()}
      >
        <FiPlus />
        Add Note
      </Button>
    </AddNoteDiv>
  );
};

export default AddNote;
