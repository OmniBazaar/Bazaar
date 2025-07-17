import React from 'react';
import styled from 'styled-components';

interface User {
    id: string;
    username: string;
    reputation: number;
    avatar?: string;
}

interface UserProfileProps {
    user: User;
}

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Avatar = styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
`;

const Info = styled.div`
    display: flex;
    flex-direction: column;
`;

const Username = styled.span`
    font-weight: 500;
`;

const Reputation = styled.span`
    font-size: 0.875rem;
    color: #666;
`;

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
    return (
        <Container>
            <Avatar 
                src={user.avatar ?? '/default-avatar.png'} 
                alt={user.username}
            />
            <Info>
                <Username>{user.username}</Username>
                <Reputation>⭐ {user.reputation}</Reputation>
            </Info>
        </Container>
    );
}; 