import React, { useState } from "react";
import styled from "styled-components";
import { FiSearch, FiFolder, FiStar, FiBriefcase, FiBook } from "react-icons/fi";
import AddNote from "./AddNote";
import NoteLists from "./NoteLists";
import "./App.css";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;

  span {
    color: var(--accent-color);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 16px;
  width: 300px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--focus-ring);
  }

  svg {
    color: var(--text-secondary);
    margin-right: 8px;
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  font-size: 14px;
  width: 100%;

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const MainContent = styled.main`
  display: flex;
  padding: 40px;
  gap: 40px;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
  }
`;

const Sidebar = styled.aside`
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    flex: auto;
  }
`;

const FolderNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--surface-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 16px;
  box-shadow: var(--shadow-sm);
`;

const FolderNavHeader = styled.h3`
  font-size: 12px;
  text-transform: uppercase;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.5px;
  margin: 0 0 10px 0;
  padding-left: 8px;
`;

const FolderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.active ? "var(--accent-color)" : "var(--text-primary)"};
  background: ${props => props.active ? "rgba(59, 130, 246, 0.1)" : "transparent"};
  font-weight: ${props => props.active ? "600" : "400"};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? "rgba(59, 130, 246, 0.15)" : "var(--bg-color)"};
  }

  svg {
    color: ${props => props.active ? "var(--accent-color)" : "var(--text-secondary)"};
  }
`;

const NotesContainer = styled.section`
  flex: 1;
`;

const FOLDERS = [
  { id: "All Notes", icon: <FiFolder /> },
  { id: "Personal", icon: <FiStar /> },
  { id: "Work", icon: <FiBriefcase /> },
  { id: "Study", icon: <FiBook /> }
];

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState("All Notes");

  return (
    <div className="App">
      <Header>
        <Title>Cloud<span>Notes</span>.</Title>
        
        <SearchContainer>
          <FiSearch />
          <SearchInput 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
      </Header>
      
      <MainContent>
        <Sidebar>
          <FolderNav>
            <FolderNavHeader>Folders</FolderNavHeader>
            {FOLDERS.map(folder => (
              <FolderItem 
                key={folder.id} 
                active={activeFolder === folder.id}
                onClick={() => setActiveFolder(folder.id)}
              >
                {folder.icon}
                {folder.id}
              </FolderItem>
            ))}
          </FolderNav>
          
          <AddNote defaultFolder={activeFolder === "All Notes" ? "Personal" : activeFolder} />
        </Sidebar>
        
        <NotesContainer>
          <NoteLists searchQuery={searchQuery} activeFolder={activeFolder} />
        </NotesContainer>
      </MainContent>
    </div>
  );
}

export default App;
