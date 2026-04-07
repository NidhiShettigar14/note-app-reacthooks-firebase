import React, { useState } from "react";
import styled from "styled-components";
import firebase from "../firebase";
import { FiCheck, FiX } from "react-icons/fi";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalDiv = styled.div`
  background: var(--surface-color);
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 30px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
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
  min-height: 150px;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;

  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--focus-ring);
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
`;

const CancelButton = styled.button`
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--surface-color-light);
  font-size: 14px;
  font-weight: 500;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--accent-color);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: var(--accent-hover);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const EditNote = ({ note, onClose }) => {
  const [title, setTitle] = useState(note.title || "");
  const [body, setBody] = useState(note.body || "");
  const [folder, setFolder] = useState(note.folder || "Personal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FOLDERS = ["Personal", "Work", "Study"];

  const updateNote = async () => {
    if (!title.trim() || !body.trim()) return;
    
    setIsSubmitting(true);
    try {
      await firebase
        .firestore()
        .collection("notes")
        .doc(note.id)
        .update({
          title,
          body,
          folder,
          updatedAt: new Date().toISOString()
        });

        onClose();
    } catch (error) {
      console.error("Error updating note", error);
      setIsSubmitting(false); // Only unset submitting on error since success will unmount modal
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalDiv onClick={e => e.stopPropagation()}>
        <Header>
          <h3>Edit Note</h3>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </Header>
        
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
            value={title} 
            onChange={e => setTitle(e.target.value)} 
          />
        </InputGroup>
        
        <InputGroup>
          <Label>Content</Label>
          <BodyTextArea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
          />
        </InputGroup>
        
        <ActionsContainer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton 
            onClick={updateNote} 
            disabled={isSubmitting || !title.trim() || !body.trim()}
          >
            <FiCheck />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </SaveButton>
        </ActionsContainer>
      </ModalDiv>
    </Overlay>
  );
};

export default EditNote;
