import React from 'react';
import styled from 'styled-components';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 2rem;
  height: fit-content;
`;

const MainContent = styled.main`
  min-height: calc(100vh - 4rem);
`;

interface MarketplaceLayoutProps {
    filters: React.ReactNode;
    content: React.ReactNode;
}

export const MarketplaceLayout: React.FC<MarketplaceLayoutProps> = ({
    filters,
    content,
}) => {
    return (
        <Layout>
            <Sidebar>
                {filters}
            </Sidebar>
            <MainContent>
                {content}
            </MainContent>
        </Layout>
    );
}; 