import React, { useState, useEffect } from "react";
import styled from "styled-components";
import firebase from "./firebase";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import EditNote from "./components/EditNote";

const ListsGrid = styled.div`
  column-count: 3;
  column-gap: 20px;
  width: 100%;
  
  @media (max-width: 1100px) {
    column-count: 2;
  }
  @media (max-width: 768px) {
    column-count: 1;
  }
`;

const ListItemDiv = styled.div`
  background: var(--surface-color);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  break-inside: avoid;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    background: var(--surface-color-light);
  }
  
  &:hover .actions {
    opacity: 1;
  }
`;

const ListTitleDiv = styled.h4`
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 700;
  margin: 0 0 12px 0;
  padding-right: 64px; 
  letter-spacing: -0.3px;
`;

const ListItemDetailDiv = styled.p`
  font-size: 14.5px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  flex-grow: 1;
  max-height: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
`;

const NoteImage = styled.img`
  width: calc(100% + 48px);
  margin: -24px -24px 16px -24px;
  max-height: 200px;
  object-fit: cover;
`;

const MetaDataContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
`;

const MetaData = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const FolderBadge = styled.span`
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-hover);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
`;

const Tag = styled.span`
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--text-secondary);
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
`;

const ActionsDiv = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  opacity: 0.5;
  transition: opacity 0.2s;
`;

const ActionButton = styled.button`
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  color: ${props => props.danger ? "var(--danger-color)" : "var(--text-secondary)"};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);

  &:hover {
    background: ${props => props.danger ? "var(--danger-color)" : "var(--accent-color)"};
    color: white;
    border-color: transparent;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  grid-column: 1 / -1;
  padding: 40px;
  text-align: center;
  
  p {
    font-size: 18px;
    margin-bottom: 8px;
  }
  span {
    font-size: 14px;
  }
`;

function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function useLists() {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("notes")
      .onSnapshot(snapshot => {
        const fetchedLists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort manually to account for older notes that lack createdAt
        fetchedLists.sort((a, b) => {
          const dateA = a.updatedAt || a.createdAt || "";
          const dateB = b.updatedAt || b.createdAt || "";
          return dateB.localeCompare(dateA);
        });

        setLists(fetchedLists);
      });
      
    return () => unsubscribe();
  }, []);

  return lists;
}

const NoteLists = ({ searchQuery = "", activeFolder = "All Notes" }) => {
  const lists = useLists();
  const [editingNote, setEditingNote] = useState(null);

  const handleOnDelete = id => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      firebase
        .firestore()
        .collection("notes")
        .doc(id)
        .delete();
    }
  };

  // Filter notes based on the search query AND the active folder
  const filteredLists = lists.filter(note => {
    const inFolder = activeFolder === "All Notes" || note.folder === activeFolder;
    
    const q = searchQuery.toLowerCase();
    const matchTitle = note.title && note.title.toLowerCase().includes(q);
    const matchBody = note.body && note.body.toLowerCase().includes(q);
    const inSearch = matchTitle || matchBody;

    return inFolder && inSearch;
  });

  return (
    <>
      <ListsGrid>
        {filteredLists.length === 0 ? (
          <EmptyState>
            <p>No notes found in {activeFolder}.</p>
            <span>{searchQuery ? "Try refining your search" : "Create a note to get started!"}</span>
          </EmptyState>
        ) : (
          filteredLists.map(list => {
            const dateStr = list.updatedAt || list.createdAt;
            const timeAgoStr = timeAgo(dateStr);

            return (
              <ListItemDiv key={list.id}>
                {list.imageUrl && <NoteImage src={list.imageUrl} alt="Attached" />}
                <ListTitleDiv>{list.title}</ListTitleDiv>
                <ListItemDetailDiv>{list.body}</ListItemDetailDiv>
                
                {list.tags && list.tags.length > 0 && (
                  <TagsContainer>
                    {list.tags.map(tag => <Tag key={tag}>#{tag}</Tag>)}
                  </TagsContainer>
                )}
                
                <MetaDataContainer>
                  <MetaData>{timeAgoStr}</MetaData>
                  {list.folder && activeFolder === "All Notes" && (
                    <FolderBadge>{list.folder}</FolderBadge>
                  )}
                </MetaDataContainer>
                
                <ActionsDiv className="actions">
                  <ActionButton onClick={() => setEditingNote(list)} title="Edit Note">
                    <FiEdit3 size={16} />
                  </ActionButton>
                  <ActionButton danger onClick={() => handleOnDelete(list.id)} title="Delete Note">
                    <FiTrash2 size={16} />
                  </ActionButton>
                </ActionsDiv>
              </ListItemDiv>
            );
          })
        )}
      </ListsGrid>
      
      {editingNote && (
        <EditNote note={editingNote} onClose={() => setEditingNote(null)} />
      )}
    </>
  );
};

export default NoteLists;
