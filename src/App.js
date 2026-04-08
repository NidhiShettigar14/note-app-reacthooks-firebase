import React, { useState } from "react";
import styled from "styled-components";
import { FiSearch, FiFolder, FiStar, FiBriefcase, FiBook, FiBell } from "react-icons/fi";
import AddNote from "./AddNote";
import NoteLists from "./NoteLists";
import "./App.css";

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const HeaderWrapper = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 20px 0 0 0;
  background: transparent;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background-color: var(--surface-color);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;

  span {
    color: var(--accent-color);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: var(--surface-color-light);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 12px 20px;
  width: 400px;
  transition: all 0.2s;

  &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--focus-ring);
    background: rgba(255, 255, 255, 0.9);
  }

  svg {
    color: var(--text-secondary);
    margin-right: 12px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  font-size: 15px;
  width: 100%;

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const CategoriesPillBar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
`;

const CategoryPill = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 30px;
  border: 1px solid ${props => props.active ? "var(--accent-color)" : "var(--border-color)"};
  background: ${props => props.active ? "var(--accent-color)" : "var(--surface-color)"};
  color: ${props => props.active ? "#fff" : "var(--text-primary)"};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ? "0 4px 12px rgba(99, 102, 241, 0.3)" : "var(--shadow-sm)"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-color);
  }

  svg {
    color: ${props => props.active ? "#fff" : "var(--text-secondary)"};
  }
`;

const AddNoteWrapper = styled.div`
  width: 100%;
  max-width: 600px;
`;

const NotesWrapper = styled.div`
  width: 100%;
`;

const FOLDERS = [
  { id: "All Notes", icon: <FiFolder /> },
  { id: "Personal", icon: <FiStar /> },
  { id: "Work", icon: <FiBriefcase /> },
  { id: "Study", icon: <FiBook /> },
  { id: "Reminder", icon: <FiBell /> }
];

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("All Notes");

  return (
    <div className="App">
      <AppContainer>
        <HeaderWrapper>
          <Header>
            <Title>Cloud<span>Notes</span> ✨</Title>
            
            <SearchContainer>
              <FiSearch size={18} />
              <SearchInput 
                type="text" 
                placeholder="Search your smart notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
          </Header>
        </HeaderWrapper>
        
        <CategoriesPillBar>
          {FOLDERS.map(folder => (
            <CategoryPill 
              key={folder.id} 
              active={activeFolder === folder.id}
              onClick={() => setActiveFolder(folder.id)}
            >
              {folder.icon}
              {folder.id}
            </CategoryPill>
          ))}
        </CategoriesPillBar>
        
        <AddNoteWrapper>
          <AddNote defaultFolder={activeFolder === "All Notes" ? "Personal" : activeFolder} />
        </AddNoteWrapper>
        
        <NotesWrapper>
          <NoteLists searchQuery={searchQuery} activeFolder={activeFolder} />
        </NotesWrapper>
      </AppContainer>
    </div>
  );
}

export default App;
